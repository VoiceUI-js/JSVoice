/**
 * Manages voice command registration, matching, prioritization, scopes, and debugging.
 */
import { cleanText } from '../utils/helpers.js';

export class CommandManager {
    constructor() {
        this.exactCommands = new Map(); // phrase -> CommandObject
        this.patternCommands = []; // Array of CommandObjects

        // Lookup for ID management (O(1) unregister)
        this.commandRegistry = new Map(); // ID -> CommandObject

        this.scopes = new Set(['global']);
        this.currentScope = 'global';
        this.cooldowns = new Map(); // CommandID -> Timestamp

        // Debugging & Telemetry Hook
        this.debugMode = false;
        this.onTelemetry = null; // Injected by Core
    }

    /**
     * Registers a new command.
     * @param {string} phrase - The command phrase or pattern.
     * @param {Function} callback - The function to execute.
     * @param {Object} options - { priority, scope, cooldown, once, isPattern, minConfidence }
     */
    register(phrase, callback, options = {}) {
        const id = options.id || crypto.randomUUID();
        const isPattern = options.isPattern || phrase.includes('{');

        // Ensure proper cleaning:
        // For exact: clean the whole phrase.
        // For pattern: clean only the literal parts during regex generation.
        const cleaned = isPattern ? phrase : cleanText(phrase);

        const cmd = {
            id,
            phrase: cleaned,
            originalPhrase: phrase,
            callback,
            type: isPattern ? 'pattern' : 'exact',
            priority: options.priority || 0,
            scope: options.scope || 'global',
            cooldown: options.cooldown || 0,
            once: options.once || false,
            minConfidence: options.minConfidence || 0, // 0.0 - 1.0
            regex: isPattern ? this._createPatternRegex(phrase) : null,
            argConfigs: isPattern ? this._extractArgConfigs(phrase) : []
        };


        this.commandRegistry.set(id, cmd);

        if (cmd.scope !== 'global') {
            this.scopes.add(cmd.scope);
        }

        if (isPattern) {
            this.patternCommands.push(cmd);
            // Sort patterns by priority desc
            this.patternCommands.sort((a, b) => b.priority - a.priority);
        } else {
            // For exact, we store in a Map keying by phrase+scope for collision handling?
            // Actually, we can store just by phrase if commands are global unique.
            // But we support scoping. So SAME phrase can exist in DIFFERENT scopes.
            // Map<phrase, Array<Command>>
            if (!this.exactCommands.has(cleaned)) {
                this.exactCommands.set(cleaned, []);
            }
            this.exactCommands.get(cleaned).push(cmd);
            // Sort bucket by priority
            this.exactCommands.get(cleaned).sort((a, b) => b.priority - a.priority);
        }

        return id;
    }

    unregister(idOrPhrase) {
        let cmd = null;

        // 1. Try ID lookup
        if (this.commandRegistry.has(idOrPhrase)) {
            cmd = this.commandRegistry.get(idOrPhrase);
        }

        // 2. Try phrase lookup (slow O(N) scan of registry if not ID)
        if (!cmd) {
            const cleaned = cleanText(idOrPhrase);
            for (const c of this.commandRegistry.values()) {
                if (c.phrase === cleaned || c.originalPhrase === idOrPhrase) {
                    cmd = c;
                    break;
                }
            }
        }

        if (cmd) {
            this.commandRegistry.delete(cmd.id);

            if (cmd.type === 'pattern') {
                this.patternCommands = this.patternCommands.filter(c => c.id !== cmd.id);
            } else {
                const bucket = this.exactCommands.get(cmd.phrase);
                if (bucket) {
                    const idx = bucket.findIndex(c => c.id === cmd.id);
                    if (idx !== -1) bucket.splice(idx, 1);
                    if (bucket.length === 0) this.exactCommands.delete(cmd.phrase);
                }
            }
            return true;
        }
        return false;
    }

    // ... setScope, resetScope ...

    /**
     * Processes a transcript and executes the best matching command.
     * Optimize: Check Exact map first (O(1)), then Patterns (O(N)).
     * @param {string|Object} transcriptOrEvent - Text or TranscriptEvent
     * @param {Function} speakMethod 
     */
    async process(transcriptOrEvent, speakMethod) {
        let transcript = '';
        let confidence = 1.0;
        let eventData = null;

        if (typeof transcriptOrEvent === 'string') {
            transcript = transcriptOrEvent;
        } else {
            transcript = transcriptOrEvent.text || '';
            confidence = transcriptOrEvent.confidence || 0.0;
            if (transcriptOrEvent.confidence === undefined) confidence = 1.0;
            eventData = transcriptOrEvent;
        }

        const cleanedTranscript = cleanText(transcript);
        const now = Date.now();

        let winner = null;
        let bestScore = -1;

        // --- OPTIMIZATION: Exact Match Lookup ---
        const exactBucket = this.exactCommands.get(cleanedTranscript);
        if (exactBucket) {
            // Check scope & confidence for candidates in bucket
            // Bucket is already sorted by priority
            for (const cmd of exactBucket) {
                if (cmd.scope !== 'global' && cmd.scope !== this.currentScope) continue;
                if (confidence < cmd.minConfidence) continue;

                // Found our highest priority exact match immediately
                winner = { cmd, args: {}, score: 1000 + cmd.phrase.length };
                break; // Because bucket is sorted, first valid one is best exact
            }
        }

        // Only scan patterns if we don't have a high-priority exact match or if patterns might be higher priority
        // NOTE: Exact matches usually beat patterns unless priority is forced. 
        // Current logic: Exact = 1000 + len, Pattern = 500 + len.
        // So a very long pattern could theoretically beat a short exact command if logic strictly follows score.
        // But usually "Exact" is preferred.
        // Let's check patterns if we don't have a solid winner or to find something better.

        const candidates = this.patternCommands.filter(cmd =>
            cmd.scope === 'global' || cmd.scope === this.currentScope
        );

        for (const cmd of candidates) {
            if (confidence < cmd.minConfidence) continue;

            // Optimization: If current winner score is drastically higher than potential pattern score, skip?
            // Max pattern score approx 500 + len. If exact winner is 1000+, exact wins.
            // Unless priority overrides?
            // Score formula: (typeBase) + (len). Priority sorts the list but score breaks ties?
            // Original: sort by Priority then Score.
            // So if Pattern has High Priority (100) and Exact has Low (0), Pattern wins regardless of score text.

            // We must track priority too
            if (winner && winner.cmd.priority > cmd.priority) continue;
            // If priorities equal, Exact (1000) usually beats Pattern (500).

            const matchResult = this._checkMatch(cmd, cleanedTranscript);
            if (matchResult.matched) {
                const score = this._calculateScore(cmd, matchResult);

                if (!winner ||
                    (cmd.priority > winner.cmd.priority) ||
                    (cmd.priority === winner.cmd.priority && score > winner.score)) {
                    winner = { cmd, args: matchResult.args, score };
                }
            }
        }

        // ... Dispatch Logic ...

        const telemetryData = {
            type: 'command_evaluated',
            transcript,
            confidence,
            matched: !!winner,
            matchType: winner?.cmd.type,
            winnerId: winner?.cmd.id,
            scope: this.currentScope,
            rejectedReason: null,
            latencyMs: 0
        };

        if (winner) {
            // 4. Cooldown Check
            const lastRun = this.cooldowns.get(winner.cmd.id) || 0;
            if (winner.cmd.cooldown > 0 && (now - lastRun < winner.cmd.cooldown)) {
                telemetryData.rejectedReason = 'cooldown';
                this._emitTelemetry(telemetryData);
                return false;
            }

            // 5. Execution Policy (Sandbox check could go here)
            // if (this.confirmationPolicy ...)

            // Execute
            try {
                if (winner.cmd.cooldown > 0) {
                    this.cooldowns.set(winner.cmd.id, now);
                }

                await winner.cmd.callback(winner.args || {}, transcript, cleanedTranscript, speakMethod);

                if (winner.cmd.once) {
                    this.unregister(winner.cmd.id);
                }

                this._emitTelemetry(telemetryData);
                return true;

            } catch (e) {
                console.error('[JSVoice] Command Execution Error:', e);
                telemetryData.rejectedReason = 'execution_error';
                telemetryData.error = e.message;
                this._emitTelemetry(telemetryData);
                return false;
            }
        } else {
            // Re-check partial matches for telemetry reason (slow but useful for debug)
            // Only checks candidates already filtered by scope
            const hasPartial = candidates.some(c => this._checkMatch(c, cleanedTranscript).matched) ||
                (exactBucket && exactBucket.some(c => c.scope === 'global' || c.scope === this.currentScope));

            if (hasPartial) {
                telemetryData.rejectedReason = 'confidence_too_low';
            } else {
                telemetryData.rejectedReason = 'no_match';
            }
            this._emitTelemetry(telemetryData);
        }

        return false;
    }

    // --- Scope Management ---

    setScope(scopeName) {
        this.currentScope = scopeName;
        // Reset stack if manual set? Or just push? 
        // Logic: setScope is absolute.
        this.scopeStack = [scopeName];
    }

    pushScope(scopeName) {
        if (!this.scopeStack) this.scopeStack = [this.currentScope];
        this.scopeStack.push(scopeName);
        this.currentScope = scopeName;
    }

    popScope() {
        if (!this.scopeStack || this.scopeStack.length <= 1) {
            this.currentScope = 'global';
            this.scopeStack = ['global'];
            return 'global';
        }
        this.scopeStack.pop();
        this.currentScope = this.scopeStack[this.scopeStack.length - 1];
        return this.currentScope;
    }

    resetScope() {
        this.currentScope = 'global';
        this.scopeStack = ['global'];
    }

    // --- Helpers ---

    _createPatternRegex(rawPhrase) {
        // 1. Split by variables
        // "Set {val} to" -> ["Set ", "{val}", " to"]
        const parts = rawPhrase.split(/(\{.*?\})/);

        const regexParts = parts.map(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
                // It's a variable
                const match = /\{(\w+)(?::(\w+))?\}/.exec(part);
                if (!match) return this._escapeRegex(cleanText(part)); // Malformed, treat as literal text

                const type = match[2];
                switch (type) {
                    case 'number': return '(\\d+(?:[.,]\\d+)?)';
                    case 'int': return '(\\d+)';
                    case 'word': return '(\\w+)';
                    case 'date': return '(?:\\d{1,4}[-/]\\d{1,2}[-/]\\d{1,4}|today|tomorrow|yesterday)';
                    case 'any':
                    default: return '(.+?)';
                }
            } else {
                // It's static text: Clean it first (remove punctuation etc) then escape
                const cleanedPart = cleanText(part);
                if (!cleanedPart) return ''; // Skip empty parts (e.g. spaces that got cleaned away)
                return this._escapeRegex(cleanedPart);
            }
        });

        // Use \s* between parts to allow flexibility (since cleanText collapses spaces to single space)
        // But cleanText usage inside map might have already handled it?
        // If we join with '', we assume cleanText handled spaces.
        // cleanText("Set ") -> "set" (trimmed). 
        // cleanText(" to") -> "to" (trimmed).
        // So "Set {x} to" -> "set" + capture + "to".
        // Matched against "set 50 to". "set50to" wont match.
        // Use \s+ separator?
        // Actually, better strategy: 
        // Use cleanText on the WHOLE RAW PHRASE (replacing vars with placeholders), then build regex? No, difficult.

        // Let's rely on standard spacing. cleanText ensures single spaces.
        // We should add optional space \s* between parts? Or require \s+ if the original had space?
        // "Set {val}" -> "set" + var.

        // Revised Strategy:
        // Join with \s+? No.

        // Let's assume strict cleaning.
        // "Set {val}" -> parts: ["Set ", "{val}"]. 
        // cleaned: "set", var.
        // Regex: "^set(\d+)$". 
        // Input: "set 10". Cleaned: "set 10".
        // "set(\d+)" matches "set10". Fails "set 10".

        // We need to inject space matchers where appropriate.
        // Simple heuristic: If the raw part ends with space, or next start with space?
        // cleanText collapses internal spaces to single space.

        // Let's use `\s*` separator between tokens.
        return new RegExp('^' + regexParts.join('\\s*') + '$', 'i');
    }

    _escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    _extractArgConfigs(phrase) {
        const configs = [];
        const regex = /\{(\w+)(?::(\w+))?\}/g;
        let match;
        while ((match = regex.exec(phrase)) !== null) {
            configs.push({ name: match[1], type: match[2] || 'any' });
        }
        return configs;
    }

    _checkMatch(cmd, transcript) {
        if (cmd.type === 'exact') {
            if (transcript.includes(cmd.phrase)) {
                return { matched: true, args: {} };
            }
        } else if (cmd.type === 'pattern') {
            const match = transcript.match(cmd.regex);
            if (match) {
                const args = {};
                cmd.argConfigs.forEach((config, index) => {
                    let val = match[index + 1];
                    // Parse Types
                    if (config.type === 'number') val = parseFloat(val);
                    else if (config.type === 'int') val = parseInt(val, 10);

                    args[config.name] = val;
                });
                return { matched: true, args };
            }
        }
        return { matched: false };
    }

    _calculateScore(cmd, matchResult) {
        let score = 0;
        if (cmd.type === 'exact') score += 1000;
        else score += 500;
        score += cmd.phrase.length; // Longer matches = more specific

        return score;
    }

    _emitTelemetry(data) {
        if (this.onTelemetry) {
            this.onTelemetry(data);
        }
    }
}
