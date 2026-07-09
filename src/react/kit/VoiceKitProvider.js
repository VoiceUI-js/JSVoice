/**
 * VoiceKitProvider — connects JSVoice + UI kit store + theme.
 */
import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { VoiceProvider } from '../index.js';
import { VoiceKitContext } from './context.js';
import { uikitStore } from '../../ui-kit/core/store.js';
import { VoiceKitActions } from '../../ui-kit/core/actions.js';
import { DEFAULT_PERSIST_KEY } from '../../ui-kit/core/constants.js';
import { buildThemeStyleText, resolveTheme } from '../../ui-kit/theme/index.js';
import { isBrowser } from '../../ui-kit/utils/domSafe.js';
import { globalUiEvents } from '../../ui-kit/core/events.js';

/**
 * @param {object} props
 * @param {any} props.voice
 * @param {string|object} [props.theme]
 * @param {boolean} [props.debug]
 * @param {boolean} [props.initialOpen]
 * @param {string|null} [props.persistKey]
 * @param {string[]} [props.commandGroups]
 * @param {Function[]} [props.plugins]
 * @param {boolean} [props.enableKitCommands]
 * @param {string[]|true} [props.commandPacks]
 * @param {React.ReactNode} props.children
 */
export function VoiceKitProvider({
  voice,
  theme = 'glassDark',
  debug = false,
  initialOpen = false,
  persistKey = DEFAULT_PERSIST_KEY,
  commandGroups,
  plugins,
  enableKitCommands = false,
  commandPacks,
  children,
}) {
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const [themeName, setThemeName] = useState(() =>
    typeof theme === 'string' ? theme : theme?.name || 'custom'
  );
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));
  const unsubs = useRef([]);

  // Apply initial UI flags
  useEffect(() => {
    if (persistKey) {
      VoiceKitActions.loadPrefs(persistKey);
    }
    VoiceKitActions.setTheme(typeof theme === 'string' ? theme : theme?.name || 'glassDark');
    if (debug) VoiceKitActions.setDebugOpen(true);
    if (initialOpen) VoiceKitActions.setPaletteOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Theme sync from store / prop
  useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
    setThemeName(typeof theme === 'string' ? theme : theme?.name || 'custom');
  }, [theme]);

  // Persist UI prefs (debounced lightly)
  useEffect(() => {
    if (!persistKey || !isBrowser()) return undefined;
    const unsub = uikitStore.subscribe(() => {
      VoiceKitActions.savePrefs(persistKey);
    });
    return unsub;
  }, [persistKey]);

  // Wire voice events → kit store
  useEffect(() => {
    const v = voiceRef.current;
    if (!v) return undefined;

    // Optional plugins
    if (Array.isArray(plugins)) {
      plugins.forEach((p) => {
        try {
          if (typeof v.use === 'function') v.use(p);
        } catch (e) {
          if (typeof console !== 'undefined') console.warn('[VoiceKitProvider] plugin load failed', e);
        }
      });
    }

    // Optional kit command packs (not auto-installed unless enabled)
    if (enableKitCommands || commandPacks) {
      try {
        // dynamic import avoided for SSR simplicity — static import at top would pull packs always
        import('../../packs/kit.js').then((mod) => {
          const packs = commandPacks || (enableKitCommands ? true : []);
          mod.installKitCommandPacks(v, packs);
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    }

    const pushTx = (text, extra = {}) => {
      if (!text) return;
      VoiceKitActions.addTranscript({
        text,
        engine: v.getSnapshot?.()?.engine?.name || null,
        ...extra,
      });
      VoiceKitActions.pushTimelineEvent({ type: 'transcript', text, ...extra });
    };

    // Prefer snapshot subscription
    let unsubSnap = null;
    if (typeof v.subscribe === 'function') {
      let lastPartial = '';
      let lastFinal = '';
      unsubSnap = v.subscribe((snap) => {
        const partial = snap?.transcript?.partial || '';
        const final = snap?.transcript?.final || '';
        if (partial && partial !== lastPartial) {
          lastPartial = partial;
          // interim not always stored to avoid flood — only finals + recognized
        }
        if (final && final !== lastFinal) {
          lastFinal = final;
          pushTx(final, { isFinal: true, status: 'final' });
        }
      });
    }

    // Hook callbacks if available without clobbering (wrap)
    const prevRecognized = v.options?.onCommandRecognized;
    const prevNot = v.options?.onCommandNotRecognized;
    const prevError = v.options?.onError;
    const prevStatus = v.options?.onStatusChange;

    if (v.options) {
      v.options.onCommandRecognized = (...args) => {
        const [name, text] = args;
        const phrase = name || text;
        VoiceKitActions.setLastCommand(phrase);
        VoiceKitActions.addTranscript({
          text: text || name || '',
          isFinal: true,
          status: 'recognized',
          command: phrase,
        });
        VoiceKitActions.pushCommandTrace({ phrase, status: 'recognized' });
        VoiceKitActions.pushTimelineEvent({ type: 'command', phrase, status: 'ok' });
        VoiceKitActions.addCommandHistory({ phrase, status: 'recognized' });
        VoiceKitActions.trackAnalytics({ type: 'recognized', phrase });
        VoiceKitActions.pushAssistantMessage({
          role: 'assistant',
          content: `Ran command: ${phrase}`,
          type: 'command',
        });
        if (typeof prevRecognized === 'function') prevRecognized(...args);
      };
      v.options.onCommandNotRecognized = (...args) => {
        const text = args[0];
        const phrase = typeof text === 'string' ? text : String(text || '');
        VoiceKitActions.addTranscript({
          text: phrase,
          isFinal: true,
          status: 'not_recognized',
        });
        VoiceKitActions.pushCommandTrace({ phrase, status: 'not_recognized' });
        VoiceKitActions.trackAnalytics({ type: 'not_recognized', phrase });
        if (typeof prevNot === 'function') prevNot(...args);
      };
      v.options.onError = (...args) => {
        const err = args[0];
        const msg = err?.message || String(err || 'Unknown error');
        uikitStore.setState((s) => ({
          ui: { ...(s.ui || {}), lastError: msg },
        }));
        VoiceKitActions.pushToast({ title: 'Voice error', message: msg, tone: 'danger' });
        VoiceKitActions.pushTimelineEvent({ type: 'error', message: msg });
        if (typeof prevError === 'function') prevError(...args);
      };
      v.options.onStatusChange = (...args) => {
        VoiceKitActions.pushTimelineEvent({ type: 'status', message: args[0] });
        if (typeof prevStatus === 'function') prevStatus(...args);
      };
    }

    return () => {
      if (unsubSnap) unsubSnap();
      if (v.options) {
        v.options.onCommandRecognized = prevRecognized;
        v.options.onCommandNotRecognized = prevNot;
        v.options.onError = prevError;
        v.options.onStatusChange = prevStatus;
      }
    };
  }, [voice, plugins, enableKitCommands, commandPacks]);

  const setTheme = useCallback((next) => {
    const r = resolveTheme(next);
    setResolvedTheme(r);
    setThemeName(r.name);
    VoiceKitActions.setTheme(r.name);
    globalUiEvents.emit('ui:theme-change', r.name);
  }, []);

  const api = useMemo(
    () => ({
      voice,
      theme: resolvedTheme,
      themeName,
      setTheme,
      debug,
      commandGroups: commandGroups || [],
      enableKitCommands,
      commandPacks,
      actions: VoiceKitActions,
      store: uikitStore,
      events: globalUiEvents,
    }),
    [voice, resolvedTheme, themeName, setTheme, debug, commandGroups, enableKitCommands, commandPacks]
  );

  const styleText = useMemo(() => buildThemeStyleText(resolvedTheme), [resolvedTheme]);

  const content = React.createElement(
    VoiceKitContext.Provider,
    { value: api },
    React.createElement('style', { 'data-jsvoice-theme': themeName }, styleText),
    React.createElement(
      'div',
      {
        'data-jsvoice-kit-root': true,
        'data-theme': themeName,
        style: {
          fontFamily: 'var(--jsv-font-family)',
          color: 'var(--jsv-text)',
        },
      },
      children
    )
  );

  // Nest VoiceProvider when we have a voice instance
  if (voice) {
    return React.createElement(VoiceProvider, { voice }, content);
  }
  return content;
}

export default VoiceKitProvider;
