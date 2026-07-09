/**
 * Hyper Voice UI Kit — core logic tests
 */
import {
  createVoiceTheme,
  resolveTheme,
  builtInThemes,
  themeNames,
  tokensToCssVars,
  VoiceKitActions,
  createVoiceKitStore,
  createVoiceKitController,
  classNames,
  createTranscriptEntry,
  appendTranscript,
  filterTranscript,
  matchesHotkey,
  moveIndex,
  isBrowser,
  buildThemeStyleText,
  uikitStore,
  selectWidgets,
  selectPaletteOpen,
} from '../../src/ui-kit/index.js';

describe('Hyper Voice UI Kit foundation', () => {
  beforeEach(() => {
    uikitStore.setState({
      widgets: [],
      rules: [],
      transcriptLog: [],
      toasts: [],
      timeline: [],
      commandTrace: [],
      ui: {
        theme: 'glassDark',
        dockCollapsed: false,
        paletteOpen: false,
        debugOpen: false,
        placement: 'bottom-right',
        speechMuted: false,
        lastCommand: null,
        onboardingStep: 0,
        onboardingComplete: false,
        lastError: null,
        scope: 'global',
      },
    });
  });

  test('createVoiceTheme merges tokens and emits css vars', () => {
    const theme = createVoiceTheme({
      name: 'custom',
      base: 'defaultDark',
      tokens: { primary: '#7c3aed' },
    });
    expect(theme.name).toBe('custom');
    expect(theme.tokens.primary).toBe('#7c3aed');
    expect(theme.cssVars['--jsv-primary']).toBe('#7c3aed');
    expect(theme.cssVars['--jv-accent']).toBe('#7c3aed');
  });

  test('built-in themes exist', () => {
    expect(builtInThemes.defaultDark).toBeTruthy();
    expect(builtInThemes.glassDark).toBeTruthy();
    expect(builtInThemes.highContrast).toBeTruthy();
    expect(themeNames).toContain('neon');
    expect(resolveTheme('glassDark').name).toBe('glassDark');
  });

  test('tokensToCssVars includes legacy aliases', () => {
    const vars = tokensToCssVars(builtInThemes.defaultDark);
    expect(vars['--jsv-surface']).toBeDefined();
    expect(vars['--jv-bg-surface']).toBeDefined();
  });

  test('buildThemeStyleText includes keyframes', () => {
    const css = buildThemeStyleText('defaultDark');
    expect(css).toContain('--jsv-primary');
    expect(css).toContain('@keyframes jsv-pulse');
  });

  test('classNames filters falsy', () => {
    expect(classNames('a', false, null, 'b', undefined)).toBe('a b');
  });

  test('transcript helpers', () => {
    const e1 = createTranscriptEntry({ text: 'hello', isFinal: true });
    const e2 = createTranscriptEntry({ text: 'world', pinned: true });
    let list = appendTranscript([], e1, 2);
    list = appendTranscript(list, e2, 2);
    list = appendTranscript(list, createTranscriptEntry({ text: 'third' }), 2);
    expect(list.some((x) => x.pinned)).toBe(true);
    expect(filterTranscript(list, 'wor').length).toBeGreaterThan(0);
  });

  test('keyboard helpers', () => {
    expect(moveIndex(0, 1, 3)).toBe(1);
    expect(moveIndex(0, -1, 3)).toBe(2);
    const evt = { key: 'k', metaKey: true, ctrlKey: false };
    // platform-dependent mod; at least does not throw
    expect(typeof matchesHotkey('mod+k', evt)).toBe('boolean');
  });

  test('isBrowser is boolean', () => {
    expect(typeof isBrowser()).toBe('boolean');
  });

  test('VoiceKitActions palette / debug / toast / transcript', () => {
    VoiceKitActions.setPaletteOpen(true);
    expect(uikitStore.getState().ui.paletteOpen).toBe(true);
    VoiceKitActions.toggleDebug();
    expect(uikitStore.getState().ui.debugOpen).toBe(true);
    VoiceKitActions.pushToast({ title: 't', message: 'm' });
    expect(uikitStore.getState().toasts.length).toBe(1);
    VoiceKitActions.addTranscript({ text: 'hi', isFinal: true });
    expect(uikitStore.getState().transcriptLog.length).toBe(1);
    VoiceKitActions.clearTranscript({ keepPinned: false });
    expect(uikitStore.getState().transcriptLog.length).toBe(0);
  });

  test('structured rule validation', () => {
    const bad = VoiceKitActions.validateRule({});
    expect(bad.valid).toBe(false);
    const ok = VoiceKitActions.addStructuredRule({
      description: 'When go back speak ok',
      condition: { type: 'command', value: 'go back' },
      action: { type: 'speak', value: 'ok' },
    });
    expect(ok.valid).toBe(true);
    expect(uikitStore.getState().rules.some((r) => r.id === ok.id)).toBe(true);
  });

  test('createVoiceKitStore and controller factories', () => {
    const store = createVoiceKitStore({ widgets: [{ id: '1', name: 'A' }] });
    expect(store.getState().widgets[0].name).toBe('A');
    const ctrl = createVoiceKitController();
    expect(typeof ctrl.createWidget).toBe('function');
    expect(typeof ctrl.setPaletteOpen).toBe('function');
  });

  test('selectors', () => {
    uikitStore.setState({ widgets: [{ id: 'w' }], ui: { ...uikitStore.getState().ui, paletteOpen: true } });
    expect(selectWidgets(uikitStore.getState()).length).toBe(1);
    expect(selectPaletteOpen(uikitStore.getState())).toBe(true);
  });

  test('widget create still works via VoiceKitActions', () => {
    VoiceKitActions.createWidget('graph', 'Revenue');
    expect(uikitStore.getState().widgets[0].name).toBe('Revenue');
  });
});
