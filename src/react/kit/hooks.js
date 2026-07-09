/**
 * Hyper Voice UI Kit React hooks.
 */
import { useContext, useMemo, useSyncExternalStore, useCallback, useState, useEffect } from 'react';
import { VoiceKitContext } from './context.js';
import { VoiceContext, useVoice, useVoiceStatus } from '../index.js';
import { uikitStore } from '../../ui-kit/core/store.js';
import { VoiceKitActions } from '../../ui-kit/core/actions.js';
import {
  isBrowser,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  isSecureContext,
  getNavigator,
} from '../../ui-kit/utils/domSafe.js';
import { filterTranscript } from '../../ui-kit/utils/transcript.js';

export function useVoiceKit() {
  const ctx = useContext(VoiceKitContext);
  if (!ctx) {
    throw new Error('useVoiceKit must be used within VoiceKitProvider');
  }
  return ctx;
}

export function useVoiceKitOptional() {
  return useContext(VoiceKitContext);
}

export function useVoiceKitStore(selector = (s) => s) {
  return useSyncExternalStore(
    (cb) => uikitStore.subscribe(cb),
    () => selector(uikitStore.getState()),
    () => selector(uikitStore.getState())
  );
}

/** Safe voice access: prefers VoiceProvider, falls back to kit context. */
export function useVoiceOptional() {
  const fromProvider = useContext(VoiceContext);
  const kit = useVoiceKitOptional();
  return fromProvider || kit?.voice || null;
}

export function useVoiceCommands() {
  const voice = useVoiceOptional();

  // Re-read registry size as dependency when possible
  const commands = voice?.listCommands?.() || [];
  // Dependency: re-read when command count changes
  const commandCount = commands.length;

  return useMemo(() => {
    if (!voice?.listCommands) return [];
    return voice.listCommands().map((c) => ({
      ...c,
      group: c.group || 'custom',
    }));
  }, [voice, commandCount]);
}

export function useVoiceTranscript({ maxItems = 50, query = '' } = {}) {
  const log = useVoiceKitStore((s) => s.transcriptLog || []);
  const kit = useVoiceKitOptional();
  const voice = kit?.voice;

  const partial = voice?.getSnapshot?.()?.transcript?.partial || '';
  const finalText = voice?.getSnapshot?.()?.transcript?.final || '';

  // Subscribe to voice snapshot for live partials
  const live = useSyncExternalStore(
    (cb) => {
      if (!voice || typeof voice.subscribe !== 'function') return () => {};
      return voice.subscribe(cb);
    },
    () => voice?.getSnapshot?.() || { transcript: { partial: '', final: '' } },
    () => ({ transcript: { partial: '', final: '' } })
  );

  const filtered = useMemo(
    () => filterTranscript(log, query).slice(-maxItems),
    [log, query, maxItems]
  );

  return {
    entries: filtered,
    partial: live?.transcript?.partial || partial,
    final: live?.transcript?.final || finalText,
    clear: (opts) => VoiceKitActions.clearTranscript(opts),
    pin: (id, pinned) => VoiceKitActions.pinTranscript(id, pinned),
    add: (partialEntry) => VoiceKitActions.addTranscript(partialEntry, maxItems),
  };
}

export function useVoiceTheme() {
  const kit = useVoiceKitOptional();
  const storeTheme = useVoiceKitStore((s) => s.ui?.theme || 'glassDark');
  return {
    themeName: kit?.themeName || storeTheme,
    theme: kit?.theme,
    setTheme: kit?.setTheme || ((t) => VoiceKitActions.setTheme(typeof t === 'string' ? t : t?.name)),
  };
}

export function useVoiceDebug() {
  const debugOpen = useVoiceKitStore((s) => !!s.ui?.debugOpen);
  const timeline = useVoiceKitStore((s) => s.timeline || []);
  const events = useVoiceKitStore((s) => s.events || []);
  const commandTrace = useVoiceKitStore((s) => s.commandTrace || []);
  const lastError = useVoiceKitStore((s) => s.ui?.lastError || null);
  const kit = useVoiceKitOptional();
  const voice = kit?.voice;

  const snapshot = useSyncExternalStore(
    (cb) => {
      if (!voice || typeof voice.subscribe !== 'function') return () => {};
      return voice.subscribe(cb);
    },
    () => voice?.getSnapshot?.() || {},
    () => ({})
  );

  return {
    open: debugOpen,
    setOpen: (v) => VoiceKitActions.setDebugOpen(v),
    toggle: () => VoiceKitActions.toggleDebug(),
    timeline,
    events,
    commandTrace,
    lastError,
    snapshot,
  };
}

export function useVoicePermissions() {
  const [mic, setMic] = useState('unknown');
  const [secure, setSecure] = useState(true);
  const [speechOk, setSpeechOk] = useState(true);
  const [ttsOk, setTtsOk] = useState(true);
  const kit = useVoiceKitOptional();
  const snapPerm = kit?.voice?.getSnapshot?.()?.permissions?.microphone || 'unknown';

  useEffect(() => {
    if (!isBrowser()) return undefined;
    setSecure(isSecureContext());
    setSpeechOk(isSpeechRecognitionSupported());
    setTtsOk(isSpeechSynthesisSupported());

    let cancelled = false;
    const nav = getNavigator();
    if (nav?.permissions?.query) {
      nav.permissions
        .query({ name: 'microphone' })
        .then((result) => {
          if (!cancelled) setMic(result.state);
          result.onchange = () => {
            if (!cancelled) setMic(result.state);
          };
        })
        .catch(() => {
          if (!cancelled) setMic(snapPerm || 'unknown');
        });
    } else {
      setMic(snapPerm || 'unknown');
    }
    return () => {
      cancelled = true;
    };
  }, [snapPerm]);

  const requestMic = useCallback(async () => {
    if (!isBrowser()) return false;
    try {
      const stream = await globalThis.navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMic('granted');
      return true;
    } catch {
      setMic('denied');
      return false;
    }
  }, []);

  return {
    microphone: mic,
    secureContext: secure,
    speechRecognition: speechOk,
    speechSynthesis: ttsOk,
    requestMicrophone: requestMic,
    ready: mic === 'granted' && secure,
  };
}

export function useVoicePlugins() {
  const active = useVoiceKitStore((s) => s.activePlugins || []);
  return {
    plugins: active,
    setPlugins: (list) => VoiceKitActions.setActivePlugins(list),
  };
}

export function useVoiceWidgets() {
  const widgets = useVoiceKitStore((s) => s.widgets || []);
  return {
    widgets,
    create: (type, name) => VoiceKitActions.createWidget(type, name),
    remove: (name) => VoiceKitActions.removeWidget(name),
    rename: (from, to) => VoiceKitActions.renameWidget(from, to),
  };
}

export function useVoiceRules() {
  const rules = useVoiceKitStore((s) => s.rules || []);
  return {
    rules,
    add: (desc) => VoiceKitActions.addRule(desc),
    addStructured: (rule) => VoiceKitActions.addStructuredRule(rule),
    remove: (id) => VoiceKitActions.removeRule(id),
    validate: (rule) => VoiceKitActions.validateRule(rule),
  };
}

export function useVoiceUi() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  return {
    ui,
    setPaletteOpen: VoiceKitActions.setPaletteOpen,
    togglePalette: VoiceKitActions.togglePalette,
    setDebugOpen: VoiceKitActions.setDebugOpen,
    toggleDebug: VoiceKitActions.toggleDebug,
    setDockCollapsed: VoiceKitActions.setDockCollapsed,
    toggleDock: VoiceKitActions.toggleDockCollapsed,
    setPlacement: VoiceKitActions.setPlacement,
    setMuted: VoiceKitActions.setMuted,
    toast: VoiceKitActions.pushToast,
  };
}

// Re-export for convenience
export { useVoiceStatus, useVoice };
