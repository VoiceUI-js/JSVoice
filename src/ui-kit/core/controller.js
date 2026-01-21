import { uikitStore } from './store.js';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const MAX_LOGS = 100;


export const VoiceUIController = {
    // 3. Widgets
    createWidget: (type, name) => {
        const currentWidgets = uikitStore.getState().widgets;
        let finalName = name;
        let counter = 1;
        while (currentWidgets.some(w => w.name.toLowerCase() === finalName.toLowerCase())) {
            finalName = `${name} (${counter++})`;
        }

        uikitStore.setState(s => {
            // Simple Grid Packer
            const COLUMNS = 3;
            const PADDING = 20;
            const WIDTH = 150;
            const HEIGHT = 100;

            const count = s.widgets.length;
            const col = count % COLUMNS;
            const row = Math.floor(count / COLUMNS);

            const x = PADDING + (col * (WIDTH + PADDING));
            const y = PADDING + (row * (HEIGHT + PADDING));

            return {
                widgets: [...s.widgets, {
                    id: generateId(),
                    type,
                    name: finalName,
                    x,
                    y,
                    data: {} // real data would go here
                }]
            };
        });
        VoiceUIController.logEvent('Created widget ' + finalName);
    },
    removeWidget: (name) => {
        uikitStore.setState(s => ({
            widgets: s.widgets.filter(w => w.name.toLowerCase() !== name.toLowerCase())
        }));
        VoiceUIController.logEvent('Removed widget ' + name);
    },
    renameWidget: (from, to) => {
        uikitStore.setState(s => ({
            widgets: s.widgets.map(w => w.name.toLowerCase() === from.toLowerCase() ? { ...w, name: to } : w)
        }));
    },

    // 4. Rules
    addRule: (desc) => {
        uikitStore.setState(s => ({
            rules: [...s.rules, { id: generateId(), description: desc, active: true }]
        }));
    },
    removeRule: (idOrDesc) => {
        uikitStore.setState(s => ({
            rules: s.rules.filter(r => r.id !== idOrDesc && r.description !== idOrDesc)
        }));
    },

    // 5. Links
    linkWidgets: (a, b) => {
        const { widgets, links } = uikitStore.getState();
        const wA = widgets.find(w => w.name.toLowerCase() === a.toLowerCase());
        const wB = widgets.find(w => w.name.toLowerCase() === b.toLowerCase());

        if (!wA || !wB) {
            VoiceUIController.logEvent(`Could not find widgets to link: ${a}, ${b}`);
            return;
        }

        if (wA.id === wB.id) {
            VoiceUIController.logEvent(`Cannot link widget to itself: ${wA.name}`);
            return;
        }

        const exists = links.some(l => l.fromId === wA.id && l.toId === wB.id && l.type === 'sync');
        if (exists) {
            VoiceUIController.logEvent(`Link already exists between ${wA.name} and ${wB.name}`);
            return;
        }

        uikitStore.setState(s => ({
            links: [...s.links, { fromId: wA.id, toId: wB.id, type: 'sync' }]
        }));
        VoiceUIController.logEvent(`Linked ${wA.name} to ${wB.name}`);
    },

    // Data Propagation (Week 2)
    setWidgetFilter: (widgetName, filterValue) => {
        uikitStore.setState(s => {
            const source = s.widgets.find(w => w.name.toLowerCase() === widgetName.toLowerCase());
            if (!source) return s;

            // 1. Find all connected widgets (simple 1-level depth for now)
            const connectedIds = s.links
                .filter(l => l.fromId === source.id && l.type === 'sync')
                .map(l => l.toId);

            // 2. Update source AND targets
            const newWidgets = s.widgets.map(w => {
                if (w.id === source.id || connectedIds.includes(w.id)) {
                    return { ...w, data: { ...w.data, filter: filterValue } };
                }
                return w;
            });

            VoiceUIController.logEvent(`Filter "${filterValue}" applied to ${source.name} and ${connectedIds.length} links.`);
            return { widgets: newWidgets };
        });
    },

    // 6. Constraints
    addConstraint: (name, type, value = true) => {
        const { widgets, constraints } = uikitStore.getState();
        const w = widgets.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!w) {
            VoiceUIController.logEvent(`Widget not found: ${name}`);
            return;
        }

        // Check duplicates
        const exists = constraints.some(c => c.widgetId === w.id && c.type === type);
        if (exists) {
            VoiceUIController.logEvent(`Constraint ${type} already exists for ${name}`);
            return;
        }

        uikitStore.setState(s => ({
            constraints: [...s.constraints, { widgetId: w.id, type, value }]
        }));
        VoiceUIController.logEvent(`Added constraint ${type} to ${name}`);
    },
    removeConstraint: (name, type) => {
        const w = uikitStore.getState().widgets.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!w) return;

        uikitStore.setState(s => ({
            constraints: s.constraints.filter(c => !(c.widgetId === w.id && c.type === type))
        }));
        VoiceUIController.logEvent(`Removed constraint ${type} from ${name}`);
    },

    // 7. Bookmarks
    saveBookmark: (name) => {
        const snapshot = JSON.parse(JSON.stringify(uikitStore.getState()));
        uikitStore.setState(s => ({
            bookmarks: [...s.bookmarks, { id: generateId(), name, snapshot, timestamp: Date.now() }]
        }));
    },
    restoreBookmark: (name) => {
        const bm = uikitStore.getState().bookmarks.find(b => b.name.toLowerCase() === name.toLowerCase());
        if (bm) {
            // Restore critical state but keep history/bookmarks
            const { widgets, rules, links, constraints } = bm.snapshot;
            uikitStore.setState({ widgets, rules, links, constraints });
            VoiceUIController.logEvent(`Restored bookmark ${name}`);
        }
    },

    // 9. Voice Mode
    setVoiceMode: (active) => {
        uikitStore.setState({ voiceMode: active });
    },

    // 10. Undo
    recordAction: (category, desc, reverseFn) => {
        uikitStore.setState(s => ({
            undoStack: [...s.undoStack, { id: generateId(), category, desc, reverse: reverseFn }]
        }));
    },
    undo: (category = null) => {
        const { undoStack } = uikitStore.getState();
        if (undoStack.length === 0) return;

        let actionToUndo;
        if (category) {
            // Find last of category
            actionToUndo = [...undoStack].reverse().find(a => a.category === category);
        } else {
            actionToUndo = undoStack[undoStack.length - 1];
        }

        if (actionToUndo && actionToUndo.reverse) {
            actionToUndo.reverse();
            uikitStore.setState(s => ({
                undoStack: s.undoStack.filter(a => a.id !== actionToUndo.id)
            }));
            VoiceUIController.logEvent(`Undid ${actionToUndo.desc}`);
            return true;
        }
        return false;
    },

    // 11. Repair
    startRepair: (transcript) => {
        uikitStore.setState({
            repair: { active: true, suggestions: [], lastError: transcript }
        });
        // Generate suggestions logic would go here
    },

    // Internals
    logEvent: (msg) => {
        uikitStore.setState(s => ({
            events: [...s.events, { timestamp: Date.now(), msg }].slice(-MAX_LOGS)
        }));
    }
};
