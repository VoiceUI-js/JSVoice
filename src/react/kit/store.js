/**
 * @jsvoice/react/kit/store
 * Unified state store for the Voice UI Kit.
 * Uses a simple subscription model for zero-dependency React integration.
 */

// Define initial state
const initialState = {
    // Core Status
    kitActive: true,

    // 1. Emotion/Intent
    intent: 'neutral', // calm, urgent, emergency, quiet

    // 2. Time-boxed
    focusMode: { active: false, remainingMs: 0 },

    // 3. Confirmation
    confirmation: { active: false, action: null, expiry: 0 },

    // 4. History
    history: [], // { id, command, status, timestamp }

    // 5. Visibility
    visibility: { advanced: false, debug: false },

    // 6. Layout
    layout: { panelOrder: ['a', 'b', 'c'], focus: null },

    // 7. Filters
    filters: [], // string[]

    // 8. Simulation
    simulation: { offline: false, micBlocked: false },

    // 9. Tour
    tour: { active: false, step: 0, steps: [] },

    // 10. Profiles
    profile: 'default', // debug, presentation, minimal

    // 16. Habits
    habits: {},

    // 11. Snapshots
    snapshots: [],

    // 12. Attention
    spotlight: null, // elementId

    // 15. Modality
    modality: 'voice-first' // hands-free, keyboard, voice-only
};

class KitStore {
    constructor() {
        this.state = { ...initialState };
        this.listeners = new Set();
        // Load persisted state if available
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('jsvoice_kit_state');
                if (saved) {
                    this.state = { ...this.state, ...JSON.parse(saved) };
                }
            } catch (e) { /* ignore */ }
        }
    }

    getState() {
        return this.state;
    }

    setState(partial) {
        const next = typeof partial === 'function' ? partial(this.state) : partial;
        this.state = { ...this.state, ...next };

        // Persist specific fields
        if (typeof window !== 'undefined') {
            const { habits, snapshots } = this.state;
            try {
                localStorage.setItem('jsvoice_kit_state', JSON.stringify({ habits, snapshots }));
            } catch (e) { /* ignore */ }
        }

        this.notify();
    }

    reset() {
        this.state = { ...initialState };
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

export const kitStore = new KitStore();

// React Hook
import { useSyncExternalStore } from 'react';

export function useKitState(selector = s => s) {
    return useSyncExternalStore(
        (cb) => kitStore.subscribe(cb),
        () => selector(kitStore.getState()),
        () => selector(kitStore.getState())
    );
}

// Plugin Actions (Framework Agnostic)
export const KitActions = {
    setIntent: (intent) => kitStore.setState({ intent }),

    startFocus: (minutes) => {
        const ms = minutes * 60 * 1000;
        kitStore.setState({ focusMode: { active: true, remainingMs: ms } });
        // Future: Start timer logic here or in plugin
    },

    requestConfirmation: (actionFn, label) => {
        kitStore.setState({
            confirmation: { active: true, action: actionFn, label, expiry: Date.now() + 5000 }
        });
    },

    resolveConfirmation: (confirmed) => {
        const { confirmation } = kitStore.getState();
        if (confirmation.active && confirmation.action && confirmed) {
            confirmation.action();
        }
        kitStore.setState({ confirmation: { active: false, action: null, expiry: 0 } });
    },

    addToHistory: (entry) => {
        kitStore.setState(s => ({
            history: [{ id: Date.now(), ...entry }, ...s.history].slice(0, 50)
        }));
    },

    toggleVisibility: (key, val) => {
        kitStore.setState(s => ({
            visibility: { ...s.visibility, [key]: val !== undefined ? val : !s.visibility[key] }
        }));
    },

    setFilter: (filter) => {
        kitStore.setState(s => ({
            filters: filter === 'clear' ? [] : [...s.filters, filter]
        }));
    },

    setSimulation: (key, val) => {
        kitStore.setState(s => ({
            simulation: { ...s.simulation, [key]: val }
        }));
    },

    setProfile: (profile) => kitStore.setState({ profile }),

    startTour: () => kitStore.setState({ tour: { active: true, step: 0 } }),
    nextTourStep: () => kitStore.setState(s => ({ tour: { ...s.tour, step: s.tour.step + 1 } })),
    stopTour: () => kitStore.setState({ tour: { active: false, step: 0 } }),

    setSpotlight: (id) => kitStore.setState({ spotlight: id }),
    setModality: (modality) => kitStore.setState({ modality }),

    // New Actions
    setLayoutOrder: (order) => kitStore.setState(s => ({ layout: { ...s.layout, panelOrder: order } })),

    saveSnapshot: (name) => {
        kitStore.setState(s => ({
            snapshots: [
                ...s.snapshots,
                { name, timestamp: Date.now(), state: { ...s } }
            ]
        }));
    },

    loadSnapshot: (name) => {
        const { snapshots } = kitStore.getState();
        const snapshot = snapshots.find(s => s.name === name);
        if (snapshot) {
            kitStore.setState(snapshot.state);
        }
    },

    setHabit: (key, val) => {
        kitStore.setState(s => ({
            habits: { ...s.habits, [key]: val }
        }));
    }
};
