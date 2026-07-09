/**
 * Higher-level UI kit actions layered on VoiceUIController + store.
 */
import { uikitStore } from './store.js';
import { VoiceUIController } from './controller.js';
import { createId } from '../utils/ids.js';
import { createTranscriptEntry, appendTranscript } from '../utils/transcript.js';
import { DEFAULT_PERSIST_KEY } from './constants.js';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/domSafe.js';

function updateUi(partial) {
  uikitStore.setState((s) => ({
    ui: { ...(s.ui || {}), ...partial },
  }));
}

export const VoiceKitActions = {
  ...VoiceUIController,

  setTheme(theme) {
    updateUi({ theme });
  },

  setDockCollapsed(collapsed) {
    updateUi({ dockCollapsed: !!collapsed });
  },

  toggleDockCollapsed() {
    uikitStore.setState((s) => ({
      ui: { ...(s.ui || {}), dockCollapsed: !s.ui?.dockCollapsed },
    }));
  },

  setPaletteOpen(open) {
    updateUi({ paletteOpen: !!open });
  },

  togglePalette() {
    uikitStore.setState((s) => ({
      ui: { ...(s.ui || {}), paletteOpen: !s.ui?.paletteOpen },
    }));
  },

  setDebugOpen(open) {
    updateUi({ debugOpen: !!open });
  },

  toggleDebug() {
    uikitStore.setState((s) => ({
      ui: { ...(s.ui || {}), debugOpen: !s.ui?.debugOpen },
    }));
  },

  setPlacement(placement) {
    updateUi({ placement });
  },

  setMuted(muted) {
    updateUi({ speechMuted: !!muted });
  },

  pushToast({ title, message, tone = 'info', duration = 3200 } = {}) {
    const toast = {
      id: createId('toast'),
      title: title || '',
      message: message || '',
      tone,
      createdAt: Date.now(),
      duration,
    };
    uikitStore.setState((s) => ({
      toasts: [...(s.toasts || []), toast].slice(-8),
    }));
    return toast.id;
  },

  dismissToast(id) {
    uikitStore.setState((s) => ({
      toasts: (s.toasts || []).filter((t) => t.id !== id),
    }));
  },

  addTranscript(partial, maxItems = 50) {
    const entry = createTranscriptEntry(partial);
    uikitStore.setState((s) => ({
      transcriptLog: appendTranscript(s.transcriptLog || [], entry, maxItems),
    }));
    return entry;
  },

  clearTranscript({ keepPinned = true } = {}) {
    uikitStore.setState((s) => ({
      transcriptLog: keepPinned ? (s.transcriptLog || []).filter((e) => e.pinned) : [],
    }));
  },

  pinTranscript(id, pinned = true) {
    uikitStore.setState((s) => ({
      transcriptLog: (s.transcriptLog || []).map((e) =>
        e.id === id ? { ...e, pinned } : e
      ),
    }));
  },

  pushTimelineEvent(event) {
    uikitStore.setState((s) => ({
      timeline: [...(s.timeline || []), { id: createId('tl'), at: Date.now(), ...event }].slice(-200),
    }));
  },

  pushCommandTrace(trace) {
    uikitStore.setState((s) => ({
      commandTrace: [...(s.commandTrace || []), { id: createId('ct'), at: Date.now(), ...trace }].slice(-100),
    }));
  },

  setLastCommand(cmd) {
    updateUi({ lastCommand: cmd || null });
  },

  setOnboardingStep(step) {
    updateUi({ onboardingStep: step });
  },

  completeOnboarding() {
    updateUi({ onboardingComplete: true, onboardingStep: 'done' });
  },

  setActivePlugins(list) {
    uikitStore.setState({ activePlugins: list || [] });
  },

  loadPrefs(persistKey = DEFAULT_PERSIST_KEY) {
    const saved = safeLocalStorageGet(persistKey, null);
    if (!saved || typeof saved !== 'object') return;
    uikitStore.setState((s) => ({
      ui: {
        ...(s.ui || {}),
        theme: saved.theme ?? s.ui?.theme,
        dockCollapsed: saved.dockCollapsed ?? s.ui?.dockCollapsed,
        placement: saved.placement ?? s.ui?.placement,
        debugOpen: saved.debugOpen ?? s.ui?.debugOpen,
        speechMuted: saved.speechMuted ?? s.ui?.speechMuted,
        density: saved.density ?? s.ui?.density,
        compactMode: saved.compactMode ?? s.ui?.compactMode,
        highContrast: saved.highContrast ?? s.ui?.highContrast,
        reducedMotion: saved.reducedMotion ?? s.ui?.reducedMotion,
        showToasts: saved.showToasts ?? s.ui?.showToasts,
        language: saved.language ?? s.ui?.language,
        speechRate: saved.speechRate ?? s.ui?.speechRate,
        volume: saved.volume ?? s.ui?.volume,
      },
    }));
  },

  savePrefs(persistKey = DEFAULT_PERSIST_KEY) {
    const ui = uikitStore.getState().ui || {};
    safeLocalStorageSet(persistKey, {
      theme: ui.theme,
      dockCollapsed: ui.dockCollapsed,
      placement: ui.placement,
      debugOpen: ui.debugOpen,
      speechMuted: ui.speechMuted,
      density: ui.density,
      compactMode: ui.compactMode,
      highContrast: ui.highContrast,
      reducedMotion: ui.reducedMotion,
      showToasts: ui.showToasts,
      language: ui.language,
      speechRate: ui.speechRate,
      volume: ui.volume,
    });
  },

  setSettingsOpen(open) {
    updateUi({ settingsOpen: !!open });
  },

  toggleSettings() {
    uikitStore.setState((s) => ({
      ui: { ...(s.ui || {}), settingsOpen: !s.ui?.settingsOpen },
    }));
  },

  setHelpOpen(open) {
    updateUi({ helpOpen: !!open });
  },

  updateSettings(partial) {
    updateUi(partial || {});
  },

  setDensity(density) {
    updateUi({ density: density || 'comfortable' });
  },

  setHighContrast(on) {
    updateUi({ highContrast: !!on, theme: on ? 'highContrast' : undefined });
    if (on) updateUi({ theme: 'highContrast' });
    else if (!on) {
      /* keep current unless was forced */
    }
  },

  setReducedMotion(on) {
    updateUi({ reducedMotion: !!on });
  },

  toggleFavorite(phrase) {
    if (!phrase) return;
    uikitStore.setState((s) => {
      const favs = s.favorites || [];
      const exists = favs.includes(phrase);
      return {
        favorites: exists ? favs.filter((f) => f !== phrase) : [...favs, phrase],
      };
    });
  },

  addCommandHistory(entry) {
    uikitStore.setState((s) => ({
      commandHistory: [{ id: createId('ch'), at: Date.now(), ...entry }, ...(s.commandHistory || [])].slice(0, 100),
    }));
  },

  pushAssistantMessage(msg) {
    uikitStore.setState((s) => ({
      assistantMessages: [
        ...(s.assistantMessages || []),
        {
          id: createId('am'),
          role: msg.role || 'assistant',
          content: msg.content || '',
          type: msg.type || 'text',
          meta: msg.meta || null,
          at: Date.now(),
        },
      ].slice(-200),
    }));
  },

  clearAssistantMessages() {
    uikitStore.setState({ assistantMessages: [] });
  },

  createWorkflow({ name, nodes = [], edges = [] } = {}) {
    const id = createId('wf');
    const wf = {
      id,
      name: name || 'Untitled workflow',
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    uikitStore.setState((s) => ({
      workflows: [...(s.workflows || []), wf],
      activeWorkflowId: id,
    }));
    VoiceUIController.logEvent(`Created workflow ${wf.name}`);
    return wf;
  },

  updateWorkflow(id, partial) {
    uikitStore.setState((s) => ({
      workflows: (s.workflows || []).map((w) =>
        w.id === id ? { ...w, ...partial, updatedAt: Date.now() } : w
      ),
    }));
  },

  removeWorkflow(id) {
    uikitStore.setState((s) => ({
      workflows: (s.workflows || []).filter((w) => w.id !== id),
      activeWorkflowId: s.activeWorkflowId === id ? null : s.activeWorkflowId,
    }));
  },

  setActiveWorkflow(id) {
    uikitStore.setState({ activeWorkflowId: id });
  },

  addWorkflowNode(workflowId, node) {
    const n = {
      id: createId('wn'),
      type: node?.type || 'action',
      label: node?.label || node?.type || 'Node',
      data: node?.data || {},
      x: node?.x ?? 40,
      y: node?.y ?? 40,
    };
    uikitStore.setState((s) => ({
      workflows: (s.workflows || []).map((w) =>
        w.id === workflowId
          ? { ...w, nodes: [...(w.nodes || []), n], updatedAt: Date.now() }
          : w
      ),
    }));
    return n;
  },

  trackAnalytics(event) {
    uikitStore.setState((s) => {
      const a = { ...(s.analytics || {}) };
      a.sessionStartedAt = a.sessionStartedAt || Date.now();
      a.commandCounts = { ...(a.commandCounts || {}) };
      a.latencies = [...(a.latencies || [])];
      a.unrecognizedPhrases = [...(a.unrecognizedPhrases || [])];
      a.engineUsage = { ...(a.engineUsage || {}) };

      if (event?.type === 'recognized') {
        a.recognized = (a.recognized || 0) + 1;
        if (event.phrase) a.commandCounts[event.phrase] = (a.commandCounts[event.phrase] || 0) + 1;
      } else if (event?.type === 'failed') {
        a.failed = (a.failed || 0) + 1;
      } else if (event?.type === 'not_recognized') {
        a.notRecognized = (a.notRecognized || 0) + 1;
        if (event.phrase) {
          a.unrecognizedPhrases = [event.phrase, ...a.unrecognizedPhrases].slice(0, 50);
        }
      } else if (event?.type === 'fallback') {
        a.fallbacks = (a.fallbacks || 0) + 1;
      } else if (event?.type === 'permission_failure') {
        a.permissionFailures = (a.permissionFailures || 0) + 1;
      }
      if (typeof event?.latency === 'number') {
        a.latencies = [...a.latencies, event.latency].slice(-100);
      }
      if (event?.engine) {
        a.engineUsage[event.engine] = (a.engineUsage[event.engine] || 0) + 1;
      }
      return { analytics: a };
    });
  },

  resetAnalytics() {
    uikitStore.setState({
      analytics: {
        recognized: 0,
        failed: 0,
        notRecognized: 0,
        fallbacks: 0,
        permissionFailures: 0,
        latencies: [],
        commandCounts: {},
        unrecognizedPhrases: [],
        sessionStartedAt: Date.now(),
        engineUsage: {},
      },
    });
  },

  saveSession(label) {
    const state = uikitStore.getState();
    const session = {
      id: createId('sess'),
      label: label || `Session ${new Date().toLocaleTimeString()}`,
      at: Date.now(),
      events: [...(state.timeline || [])].slice(-100),
      traces: [...(state.commandTrace || [])].slice(-50),
      // never include raw audio; transcripts only if opt-in
      transcripts: state.ui?.transcriptPersist ? [...(state.transcriptLog || [])] : [],
    };
    uikitStore.setState((s) => ({
      sessions: [session, ...(s.sessions || [])].slice(0, 20),
      activeSessionId: session.id,
    }));
    return session;
  },

  setVoiceModeTags(tags) {
    uikitStore.setState({ voiceModeTags: tags || [] });
  },

  setPluginCatalog(list) {
    uikitStore.setState({ pluginCatalog: list || [] });
  },

  validateRule(rule) {
    const errors = [];
    if (!rule) errors.push('Rule is required');
    else {
      if (!rule.description && !rule.name) errors.push('Rule needs a name or description');
      if (!rule.condition?.type) errors.push('Condition type is required');
      if (!rule.action?.type) errors.push('Action type is required');
    }
    return { valid: errors.length === 0, errors };
  },

  detectRuleConflicts(rules) {
    const list = rules || uikitStore.getState().rules || [];
    const conflicts = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (
          a.condition?.type === b.condition?.type &&
          a.condition?.value === b.condition?.value &&
          a.action?.type !== b.action?.type
        ) {
          conflicts.push({ a: a.id, b: b.id, reason: 'Same condition, different actions' });
        }
      }
    }
    return conflicts;
  },

  addStructuredRule(rule) {
    const check = this.validateRule(rule);
    if (!check.valid) return check;
    const id = createId('rule');
    uikitStore.setState((s) => ({
      rules: [
        ...(s.rules || []),
        {
          id,
          description: rule.description || rule.name,
          active: rule.active !== false,
          condition: rule.condition,
          action: rule.action,
          createdAt: Date.now(),
        },
      ],
    }));
    VoiceUIController.logEvent(`Added rule: ${rule.description || rule.name}`);
    return { valid: true, errors: [], id };
  },

  exportDebugReport() {
    const s = uikitStore.getState();
    return {
      version: 1,
      exportedAt: Date.now(),
      ui: s.ui,
      analytics: s.analytics,
      timeline: (s.timeline || []).slice(-100),
      commandTrace: (s.commandTrace || []).slice(-50),
      events: (s.events || []).slice(-50),
      rules: s.rules,
      widgets: (s.widgets || []).map((w) => ({ id: w.id, type: w.type, name: w.name })),
    };
  },

  resetUiSettings() {
    updateUi({
      density: 'comfortable',
      compactMode: false,
      reducedMotion: false,
      highContrast: false,
      showToasts: true,
      speechMuted: false,
      placement: 'bottom-right',
      transcriptMaxItems: 50,
      transcriptPersist: false,
    });
  },
};

/**
 * Factory for isolated controller (testing / multi-instance).
 * Note: currently shares the singleton store for back-compat.
 */
export function createVoiceKitController() {
  return { ...VoiceKitActions };
}
