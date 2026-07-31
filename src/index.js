/**
 * =============================================================================
 * JSVoice — package entry (`import { createVoice } from 'jsvoice'`)
 * =============================================================================
 * START HERE (AI agents & integrators):
 *   - docs/AI_IMPLEMENTATION.md  (full implement guide — also in npm package)
 *   - AGENTS.md                  (short non-negotiable rules)
 *   - llms.txt                   (doc index for LLMs)
 *   - docs/LOCAL_BROWSER_WHISPER.md
 *
 * RULES:
 *   1. Prefer createVoice() — do not use bare new JSVoice() without an engine.
 *   2. Default engineMode is 'local' (on-device Whisper tiny.en, any modern browser).
 *   3. Peer required for default path: npm i @xenova/transformers
 *   4. Do NOT gate apps on JSVoice.isApiSupported (Native Web Speech only).
 *   5. start()/toggle() only after a user gesture (click).
 *   6. engineMode: 'native' | 'auto' | 'local' — see HybridSpeechEngine.
 *   7. jsvoice/engines/whisper is SERVER/API Whisper, not browser tiny.
 * =============================================================================
 */
import JSVoice from './JSVoice.js';
import NativeSpeechEngine from './engines/NativeSpeechEngine.js';
import HybridSpeechEngine from './engines/HybridSpeechEngine.js';
import { AudioVisualizer } from './modules/AudioVisualizer.js';
import { microphoneManager } from './modules/MicrophoneManager.js';

/**
 * Creates a JSVoice instance with batteries-included defaults.
 *
 * Default speech understander: **browser Whisper-tiny** (local, any modern browser).
 * Opt into vendor Web Speech with `{ engineMode: 'native' }`.
 *
 * Requires optional peer for default path:
 *   npm install @xenova/transformers
 *
 * AI/implement guide: docs/AI_IMPLEMENTATION.md · AGENTS.md
 *
 * @param {import('./JSVoice').JSVoiceOptions} options
 * @returns {JSVoice}
 */
export function createVoice(options = {}) {
  const engineMode = options.engineMode || 'local';

  const hybrid = new HybridSpeechEngine({
    mode: engineMode,
    native: options.nativeOptions || {},
    local: {
      model: 'Xenova/whisper-tiny.en',
      ...(options.localOptions || {}),
    },
    continuous: options.continuous,
    interimResults: options.interimResults,
    lang: options.lang,
    autoRestart: options.autoRestart,
    restartDelay: options.restartDelay,
    onModelLoadProgress: options.onModelLoadProgress,
    onEngineSelected: options.onEngineSelected,
    onFallbackActivated: options.onFallbackActivated,
    onTelemetry: options.onTelemetry,
    confirmModelDownload: options.confirmModelDownload ?? options.localOptions?.confirmModelDownload,
  });

  const voice = new JSVoice({
    ...options,
    engine: hybrid,
  });

  return voice;
}

export {
  JSVoice,
  NativeSpeechEngine,
  HybridSpeechEngine,
  AudioVisualizer,
  microphoneManager,
};

export default createVoice;
