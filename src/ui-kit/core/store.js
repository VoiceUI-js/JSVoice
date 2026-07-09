/**
 * @jsvoice/ui-kit/core/store
 * Single source of truth for the Voice UI Kit.
 */

const initialState = {
    // 3. Widgets
    widgets: [], // { id, type, name, x, y, data }

    // 4. Rules
    rules: [], // { id, description, active }

    // 5. Links
    links: [], // { fromId, toId, type }

    // 6. Constraints
    constraints: [], // { widgetId, type: 'pin'|'fold', value }

    // 7. Bookmarks
    bookmarks: [], // { id, name, snapshot, timestamp }

    // 9. Voice Mode
    voiceMode: false, // boolean

    // 10. Undo
    undoStack: [], // { id, category, desc, timestamp }
    redoStack: [],

    // 11. Repair
    repair: { active: false, suggestions: [], lastError: null },

    // Logs for Summaries
    events: [],

    // Hyper Voice UI Kit extensions (non-breaking)
    ui: {
        theme: 'glassDark',
        dockCollapsed: false,
        paletteOpen: false,
        debugOpen: false,
        settingsOpen: false,
        helpOpen: false,
        placement: 'bottom-right',
        speechMuted: false,
        lastCommand: null,
        onboardingStep: 0,
        onboardingComplete: false,
        lastError: null,
        scope: 'global',
        density: 'comfortable',
        reducedMotion: false,
        highContrast: false,
        compactMode: false,
        transcriptMaxItems: 50,
        transcriptPersist: false,
        showWakeWord: true,
        showToasts: true,
        voiceModeHints: true,
        language: 'en-US',
        speechRate: 1,
        volume: 1,
        settingsTab: 'general',
    },
    transcriptLog: [],
    toasts: [],
    timeline: [],
    commandTrace: [],
    activePlugins: [],
    // Phase 2 state
    favorites: [],
    commandHistory: [],
    assistantMessages: [],
    workflows: [],
    activeWorkflowId: null,
    sessions: [],
    activeSessionId: null,
    analytics: {
        recognized: 0,
        failed: 0,
        notRecognized: 0,
        fallbacks: 0,
        permissionFailures: 0,
        latencies: [],
        commandCounts: {},
        unrecognizedPhrases: [],
        sessionStartedAt: null,
        engineUsage: {},
    },
    voiceModeTags: [],
    pluginCatalog: [],
};

class KitStore {
    constructor() {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.listeners = new Set();

        // Hydrate from localstorage (Rules & Bookmarks only usually)
        if (typeof window !== 'undefined') {
            const load = (key) => {
                try {
                    const raw = localStorage.getItem(key);
                    if (!raw) return null;
                    const parsed = JSON.parse(raw);
                    if (parsed.version === 1) return parsed.data;
                    return null; // Discard incompatible versions
                } catch (e) { return null; }
            };

            const rules = load('jv_kit_rules');
            if (rules) this.state.rules = rules;

            const bookmarks = load('jv_kit_bookmarks');
            if (bookmarks) this.state.bookmarks = bookmarks;
        }
    }

    getState() {
        return this.state;
    }

    setState(partial) {
        const nextPartial = typeof partial === 'function' ? partial(this.state) : partial;

        // Handle Undo/Redo recording automatically? 
        // No, plugins should call recordAction explicitly for granularity.

        this.state = { ...this.state, ...nextPartial };

        // Persist opt-in fields with schema version 1
        if (typeof window !== 'undefined') {
            const save = (key, data) => localStorage.setItem(key, JSON.stringify({ version: 1, data }));

            if ('rules' in nextPartial) save('jv_kit_rules', this.state.rules);
            if ('bookmarks' in nextPartial) save('jv_kit_bookmarks', this.state.bookmarks);
        }

        this.notify();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }
}

export const uikitStore = new KitStore();

/**
 * Create an isolated UI kit store (for tests / multi-instance).
 * Defaults still use the shared singleton for back-compat.
 * @param {Partial<typeof initialState>} [seed]
 */
export function createVoiceKitStore(seed = {}) {
    const store = new KitStore();
    if (seed && Object.keys(seed).length) {
        store.setState({ ...store.getState(), ...seed });
    }
    return store;
}

export function getInitialUiKitState() {
    return JSON.parse(JSON.stringify(initialState));
}

