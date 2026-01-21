/**
 * Fuzzy Matcher Plugin
 * Adds lightweight Levenshtein distance matching + Synonym support.
 */
export default function FuzzyMatchPlugin(voice, options = {}) {
    const config = {
        threshold: 0.8, // 80% similarity required
        synonyms: {},   // { "hello": ["hi", "greetings"] }
        ...options
    };

    // We need to intercept the CommandManager's matching logic.
    // Since v2.2, CommandManager is private internal `_commandManager`.
    // We can't easily *replace* the checkMatch method without access.
    // OPTION 1: Monkey Patch via voice instance if exposed?
    // JSVoice.js doesn't expose _commandManager publicly.

    // WORKAROUND: We can register a global "catch-all" listener or 
    // hook into `onCommandNotRecognized` to retry with fuzzy logic.
    // `onCommandNotRecognized` is safe and non-invasive.

    const originalNotRecognized = voice.options.onCommandNotRecognized || (() => { });

    voice.setOption('onCommandNotRecognized', (transcript) => {
        // 1. Try Synonyms
        // If user said "hi", and we have synonym "hi" -> "hello", try executing "hello".

        // This requires access to execute a command by name/phrase directly.
        // `voice.process(transcript)` is usually internal via engine.
        // BUT `voice.speak` etc are public.
        // We lack a public `voice.execute(text)` method in the Core API. 
        // We should add one or use a trick.

        // Let's assume we can try to find a match manually against registered commands.
        // But `voice._commandManager` is private. 

        // Critical Limitation: Plugins cannot see private state effectively in the current architecture
        // unless we expose it. 

        // RECOMMENDATION: We will inject a helper method onto voice for this plugin to work.
        // For now, let's implement the logic assuming we can access `_commandManager` (it is technically JS, so `voice._commandManager` works even if "private" convention).

        if (!voice._commandManager) {
            console.warn('[FuzzyPlugin] Cannot access CommandManager');
            originalNotRecognized(transcript);
            return;
        }

        const commands = Array.from(voice._commandManager.commands.values());
        const cleaned = transcript.toLowerCase().trim();

        // 1. Check Synonyms
        // Reverse lookup: if transcript is a value in synonyms map, map to key
        let targetPhrase = cleaned;
        for (const [canonical, alts] of Object.entries(config.synonyms)) {
            if (alts.includes(cleaned)) {
                console.log(`[FuzzyPlugin] Synonym match: "${cleaned}" -> "${canonical}"`);
                targetPhrase = canonical;

                // Try executing with new phrase
                // We need to reinject this into CommandManager.
                // We can call `_commandManager.process(targetPhrase)`
                voice._commandManager.process(targetPhrase, voice.speak.bind(voice)).then(matched => {
                    if (!matched) {
                        // Fallback to fuzzy
                        attemptFuzzy(targetPhrase, commands);
                    }
                });
                return;
            }
        }

        attemptFuzzy(cleaned, commands);
    });

    function attemptFuzzy(text, commands) {
        let bestMatch = null;
        let bestScore = 0;

        for (const cmd of commands) {
            if (cmd.type !== 'exact') continue; // Only fuzzy match exact phrases

            const similarity = getSimilarity(text, cmd.phrase);
            if (similarity >= config.threshold && similarity > bestScore) {
                bestScore = similarity;
                bestMatch = cmd;
            }
        }

        if (bestMatch) {
            console.log(`[FuzzyPlugin] Fuzzy match: "${text}" ~ "${bestMatch.phrase}" (${(bestScore * 100).toFixed(0)}%)`);
            // Execute
            // We need to pass arguments if any? (Fuzzy usually for exact phrases)
            bestMatch.callback({}, text, text, voice.speak.bind(voice));

            if (voice.options.onCommandRecognized) {
                voice.options.onCommandRecognized(bestMatch.phrase, text, { fuzzy: true, score: bestScore });
            }
        } else {
            // Truly not recognized
            originalNotRecognized(text);
        }
    }

    // Levenshtein-based similarity (0.0 - 1.0)
    function getSimilarity(s1, s2) {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        if (longer.length === 0) return 1.0;

        const costs = new Array();
        for (let i = 0; i <= longer.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= shorter.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[shorter.length] = lastValue;
        }

        return (longer.length - costs[shorter.length]) / parseFloat(longer.length);
    }
}
