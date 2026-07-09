/**
 * Phase 2 Hyper Voice UI Kit tests
 */
import {
  createVoiceTheme,
  builtInThemes,
  VoiceKitActions,
  uikitStore,
  selectTopCommands,
  selectSuccessRate,
  parsePluginCatalog,
  normalizePluginMeta,
  scanInteractiveElements,
  resolveSafeClick,
  isDangerousLabel,
  createId,
  DENSITY_MODES,
  WORKFLOW_NODE_TYPES,
} from '../../src/ui-kit/index.js';
import { installKitCommandPacks, ALL_KIT_PACKS } from '../../src/packs/kit.js';

describe('Phase 2 foundation', () => {
  beforeEach(() => {
    uikitStore.setState({
      favorites: [],
      commandHistory: [],
      assistantMessages: [],
      workflows: [],
      activeWorkflowId: null,
      sessions: [],
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
      ui: {
        ...(uikitStore.getState().ui || {}),
        settingsOpen: false,
        density: 'comfortable',
        transcriptPersist: false,
      },
    });
  });

  test('phase 2 theme tokens include blur and status', () => {
    const theme = createVoiceTheme({ base: 'glassDark' });
    expect(theme.cssVars['--jsv-blur-md']).toBeDefined();
    expect(theme.cssVars['--jsv-status-listening']).toBeDefined();
    expect(theme.cssVars['--jsv-glow-primary']).toBeDefined();
    expect(builtInThemes.highContrast).toBeTruthy();
  });

  test('density and workflow constants', () => {
    expect(DENSITY_MODES).toContain('compact');
    expect(WORKFLOW_NODE_TYPES).toContain('trigger');
  });

  test('favorites and assistant messages', () => {
    VoiceKitActions.toggleFavorite('hello kit');
    expect(uikitStore.getState().favorites).toContain('hello kit');
    VoiceKitActions.toggleFavorite('hello kit');
    expect(uikitStore.getState().favorites).not.toContain('hello kit');

    VoiceKitActions.pushAssistantMessage({ role: 'user', content: 'hi' });
    expect(uikitStore.getState().assistantMessages.length).toBe(1);
    VoiceKitActions.clearAssistantMessages();
    expect(uikitStore.getState().assistantMessages.length).toBe(0);
  });

  test('settings open and density', () => {
    VoiceKitActions.setSettingsOpen(true);
    expect(uikitStore.getState().ui.settingsOpen).toBe(true);
    VoiceKitActions.setDensity('compact');
    expect(uikitStore.getState().ui.density).toBe('compact');
  });

  test('analytics tracking and selectors', () => {
    VoiceKitActions.trackAnalytics({ type: 'recognized', phrase: 'go back', latency: 40, engine: 'native' });
    VoiceKitActions.trackAnalytics({ type: 'not_recognized', phrase: 'zzz' });
    VoiceKitActions.trackAnalytics({ type: 'recognized', phrase: 'go back', latency: 20 });
    const state = uikitStore.getState();
    expect(state.analytics.recognized).toBe(2);
    expect(state.analytics.notRecognized).toBe(1);
    expect(selectTopCommands(state, 1)[0].phrase).toBe('go back');
    expect(selectSuccessRate(state)).toBeCloseTo(2 / 3, 5);
  });

  test('workflow create and add node', () => {
    const wf = VoiceKitActions.createWorkflow({ name: 'Morning' });
    expect(wf.id).toBeTruthy();
    const node = VoiceKitActions.addWorkflowNode(wf.id, { type: 'speak', label: 'Hi', x: 10, y: 10 });
    expect(node.type).toBe('speak');
    const updated = uikitStore.getState().workflows.find((w) => w.id === wf.id);
    expect(updated.nodes.length).toBe(1);
  });

  test('rule conflict detector', () => {
    VoiceKitActions.addStructuredRule({
      description: 'A',
      condition: { type: 'command', value: 'x' },
      action: { type: 'speak', value: '1' },
    });
    VoiceKitActions.addStructuredRule({
      description: 'B',
      condition: { type: 'command', value: 'x' },
      action: { type: 'toast', value: '2' },
    });
    const conflicts = VoiceKitActions.detectRuleConflicts();
    expect(conflicts.length).toBeGreaterThan(0);
  });

  test('plugin metadata normalization', () => {
    const fn = function FuzzyMatchPlugin() {};
    const meta = normalizePluginMeta(fn);
    expect(meta.name).toContain('Fuzzy');
    const catalog = parsePluginCatalog([{ name: 'A', description: 'd' }]);
    expect(catalog[0].id).toBeTruthy();
  });

  test('dangerous labels and safe click', () => {
    expect(isDangerousLabel('Delete account')).toBe(true);
    expect(isDangerousLabel('Open settings')).toBe(false);
    const safe = resolveSafeClick({ label: 'Open', dangerous: false });
    expect(safe.ok).toBe(true);
    const danger = resolveSafeClick({ label: 'Delete', dangerous: true }, { confirm: () => false });
    expect(danger.ok).toBe(false);
    const approved = resolveSafeClick({ label: 'Delete', dangerous: true }, { confirm: () => true });
    expect(approved.ok).toBe(true);
  });

  test('scanInteractiveElements is SSR safe', () => {
    // In jsdom it may return elements; should not throw
    const tags = scanInteractiveElements(null, 5);
    expect(Array.isArray(tags)).toBe(true);
  });

  test('debug report export shape', () => {
    const report = VoiceKitActions.exportDebugReport();
    expect(report.version).toBe(1);
    expect(report.analytics).toBeDefined();
    expect(report.ui).toBeDefined();
  });

  test('session save does not include transcripts by default', () => {
    VoiceKitActions.addTranscript({ text: 'secret speech', isFinal: true });
    VoiceKitActions.updateSettings({ transcriptPersist: false });
    const session = VoiceKitActions.saveSession('test');
    expect(session.transcripts).toEqual([]);
  });

  test('session save includes transcripts when opt-in', () => {
    VoiceKitActions.updateSettings({ transcriptPersist: true });
    VoiceKitActions.addTranscript({ text: 'ok to save', isFinal: true });
    const session = VoiceKitActions.saveSession('opt-in');
    expect(session.transcripts.length).toBeGreaterThan(0);
  });

  test('kit command packs install without throw', () => {
    const phrases = [];
    const fakeVoice = {
      addCommand: (p) => phrases.push(p),
      addPatternCommand: (p) => phrases.push(p),
      speak: () => {},
      start: () => {},
      stop: () => {},
    };
    const names = installKitCommandPacks(fakeVoice, ['settings', 'kit']);
    expect(names).toEqual(['settings', 'kit']);
    expect(phrases.length).toBeGreaterThan(3);
    expect(ALL_KIT_PACKS.debug).toBeTruthy();
  });

  test('createId and prefs reset', () => {
    expect(createId('t').startsWith('t_')).toBe(true);
    VoiceKitActions.setDensity('spacious');
    VoiceKitActions.resetUiSettings();
    expect(uikitStore.getState().ui.density).toBe('comfortable');
  });
});
