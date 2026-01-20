/**
 * Manages voice command registration, matching, prioritization, scopes, and debugging.
 */
import { cleanText } from '../utils/helpers.js';

export class CommandManager {
    constructor() {
        this.commands = new Map(); // ID -> CommandObject
        this.scopes = new Set(['global']);
        this.currentScope = 'global';
        this.cooldowns = new Map(); // CommandID -> Timestamp

        // Debugging
        this.debugMode = false;
        this.onCommandEvaluated = null;
    }

    /**
     * Registers a new command.
     * @param {string} phrase - The command phrase or pattern.
     * @param {Function} callback - The function to execute.
     * @param {Object} options - { priority, scope, cooldown, once, isPattern }
     */
    register(phrase, callback, options = {}) {
        const id = options.id || crypto.randomUUID();
        const cleaned = cleanText(phrase);
        const isPattern = options.isPattern || phrase.includes('{'); // Auto-detect pattern style if not explicit

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
            // Pre-compile regex for patterns
            regex: isPattern ? this._createPatternRegex(cleaned) : null,
            argNames: isPattern ? this._extractArgNames(phrase) : []
        };

        this.commands.set(id, cmd);

        // Ensure scope exists in set
        if (cmd.scope !== 'global') {
            this.scopes.add(cmd.scope);
        }

        return id;
    }

    unregister(idOrPhrase) {
        // If it's a UUID, delete directly
        if (this.commands.has(idOrPhrase)) {
            this.commands.delete(idOrPhrase);
            return true;
        }

        // Otherwise search by phrase (less precise if duplicates exist)
        const cleaned = cleanText(idOrPhrase);
        let foundId = null;
        for (const [id, cmd] of this.commands) {
            if (cmd.phrase === cleaned || cmd.originalPhrase === idOrPhrase) {
                foundId = id;
                break;
            }
        }
        if (foundId) {
            this.commands.delete(foundId);
            return true;
        }
        return false;
    }

    setScope(scopeName) {
        this.currentScope = scopeName;
    }

    resetScope() {
        this.currentScope = 'global';
    }

    /**
     * Processes a transcript and executes the best matching command.
     * @param {string} transcript 
     * @param {Function} speakMethod 
     * @returns {Promise<boolean>}
     */
    async process(transcript, speakMethod) {
        const cleanedTranscript = cleanText(transcript);

        // 1. Filter candidates by active scope
        const candidates = Array.from(this.commands.values()).filter(cmd =>
            cmd.scope === 'global' || cmd.scope === this.currentScope
        );

        // 2. Find Matches
        const matches = [];
        for (const cmd of candidates) {
            const matchResult = this._checkMatch(cmd, cleanedTranscript);
            if (matchResult.matched) {
                matches.push({
                    cmd,
                    args: matchResult.args,
                    score: this._calculateScore(cmd, matchResult)
                });
            }
        }

        // 3. Sort Matches (Priority Desc, then Score Desc)
        // Score logic: Exact > Pattern, Longest > Shortest
        matches.sort((a, b) => {
            if (a.cmd.priority !== b.cmd.priority) return b.cmd.priority - a.cmd.priority;
            return b.score - a.score;
        });

        // 4. Debug Tracing (if enabled)
        this._emitDebug(transcript, matches);

        // 5. Execute Winner
        const winner = matches[0];
        if (winner) {
            // Check Cooldown
            if (this._isOnCooldown(winner.cmd.id, winner.cmd.cooldown)) {
                this._emitDebug(transcript, [], 'cooldown_active');
                return false;
            }

            // Execute
            try {
                // Set cooldown
                if (winner.cmd.cooldown > 0) {
                    this.cooldowns.set(winner.cmd.id, Date.now());
                }

                // Execute callback
                await winner.cmd.callback(winner.args || {}, transcript, cleanedTranscript, speakMethod);

                // Handle 'once'
                if (winner.cmd.once) {
                    this.commands.delete(winner.cmd.id);
                }

                return true;
            } catch (e) {
                console.error('[JSVoice] Command Execution Error:', e);
                return false; // Or throw?
            }
        }

        return false;
    }

    // --- Helpers ---

    _createPatternRegex(cleanedPattern) {
        // "set {color} to {value}" -> "^set (.+?) to (.+?)$"
        const regexStr = '^' + cleanedPattern.replace(/{(\w+)}/g, '(.+?)') + '$';
        return new RegExp(regexStr, 'i');
    }

    _extractArgNames(phrase) {
        // Extract "color", "value" from "set {color} to {value}"
        // Note: we use original phrase to preserve argument casing if needed, usually we lower it.
        return (phrase.match(/{(\w+)}/g) || []).map(s => s.slice(1, -1));
    }

    _checkMatch(cmd, transcript) {
        if (cmd.type === 'exact') {
            // Use 'includes' for standard behavior or equality for stricter command?
            // Existing logic used 'includes', but robust commands usually prefer equality or startWith.
            // Let's stick to 'includes' for backward compatibility but prioritize equality in scoring.
            if (transcript.includes(cmd.phrase)) {
                return { matched: true, args: {} };
            }
        } else if (cmd.type === 'pattern') {
            const match = transcript.match(cmd.regex);
            if (match) {
                const args = {};
                // Map capture groups to arg names
                cmd.argNames.forEach((name, index) => {
                    args[name] = match[index + 1]; // +1 because index 0 is full match
                });
                return { matched: true, args };
            }
        }
        return { matched: false };
    }

    _calculateScore(cmd, matchResult) {
        let score = 0;
        // Exact matches > Pattern matches usually
        if (cmd.type === 'exact') score += 100;

        // Length heuristic: "turn on the lights in the kitchen" > "turn on the lights"
        score += cmd.phrase.length;

        return score;
    }

    _isOnCooldown(id, cooldownMs) {
        if (!cooldownMs) return false;
        const lastRun = this.cooldowns.get(id);
        if (!lastRun) return false;
        return (Date.now() - lastRun) < cooldownMs;
    }

    _emitDebug(transcript, matches, rejectionReason = null) {
        if (!this.debugMode || !this.onCommandEvaluated) return;

        const event = {
            transcript,
            matched: matches.length > 0,
            matches: matches.map(m => ({
                id: m.cmd.id,
                phrase: m.cmd.phrase,
                priority: m.cmd.priority,
                scope: m.cmd.scope
            })),
            winner: matches[0] ? matches[0].cmd.id : null,
            rejectionReason
        };

        this.onCommandEvaluated(event);
    }
}
