/**
 * Fuzzy Matcher Plugin
 * Adds lightweight Levenshtein distance matching + Synonym support.
 * Uses public voice.listCommands() / processText() APIs.
 */
export default function FuzzyMatchPlugin(voice, options = {}) {
    const config = {
        threshold: 0.8, // 80% similarity required
        synonyms: {},   // { "hello": ["hi", "greetings"] }
        ...options
    };

    // Hook into not-recognized via options callback wrapping
    const prev =
        (voice._callbacks && voice._callbacks.onCommandNotRecognized) ||
        voice.options.onCommandNotRecognized ||
        (() => {});

    const handleNotRecognized = (transcript) => {
        const cleaned = String(transcript || '').toLowerCase().trim();
        if (!cleaned) {
            prev(transcript);
            return;
        }

        // 1. Synonyms → processText with canonical phrase
        for (const [canonical, alts] of Object.entries(config.synonyms)) {
            if (alts.map((a) => String(a).toLowerCase()).includes(cleaned)) {
                voice.processText?.(canonical).then((matched) => {
                    if (!matched) attemptFuzzy(cleaned);
                });
                return;
            }
        }

        // 2. Fuzzy match against registered phrases
        if (!attemptFuzzy(cleaned)) {
            prev(transcript);
        }
    };

    function attemptFuzzy(cleaned) {
        const commands = typeof voice.listCommands === 'function' ? voice.listCommands() : [];
        let best = null;
        let bestScore = 0;

        for (const cmd of commands) {
            const phrase = String(cmd.phrase || '').toLowerCase();
            if (!phrase || phrase.includes('{')) continue; // skip patterns
            const score = similarity(cleaned, phrase);
            if (score >= config.threshold && score > bestScore) {
                bestScore = score;
                best = phrase;
            }
        }

        if (best) {
            voice.processText?.(best);
            return true;
        }
        return false;
    }

    // Prefer internal callbacks bag so it actually fires
    if (voice._callbacks) {
        voice._callbacks.onCommandNotRecognized = handleNotRecognized;
    }
    voice.options.onCommandNotRecognized = handleNotRecognized;

    return {
        name: 'FuzzyMatchPlugin',
        destroy() {
            if (voice._callbacks) voice._callbacks.onCommandNotRecognized = prev;
            voice.options.onCommandNotRecognized = prev;
        },
    };
}

function similarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    return 1 - dist / maxLen;
}

function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}
