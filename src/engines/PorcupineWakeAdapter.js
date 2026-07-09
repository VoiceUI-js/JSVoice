/**
 * Optional on-device wake-word adapter using Picovoice Porcupine (peer dependency).
 *
 * Does NOT bundle Porcupine. Install separately:
 *   npm i @picovoice/porcupine-web @picovoice/web-voice-processor
 *
 * Usage:
 *   import { createPorcupineWakeAdapter } from 'jsvoice/engines/porcupine-wake';
 *   const wake = await createPorcupineWakeAdapter({ accessKey, keyword: 'porcupine', onWake });
 *   await wake.start();
 *
 * Privacy: audio is processed on-device by Porcupine WASM (see Picovoice docs).
 */

/**
 * @typedef {Object} PorcupineWakeOptions
 * @property {string} accessKey - Picovoice AccessKey from console.picovoice.ai
 * @property {string} [keyword='porcupine'] - Built-in keyword label (when using built-in model)
 * @property {Object} [keywordPath] - Custom keyword model (advanced)
 * @property {Function} [onWake] - Called when wake word is detected
 * @property {Function} [onError] - Error callback
 * @property {number} [sensitivity=0.5] - 0..1
 */

function isBrowser() {
  return typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined';
}

/**
 * Dynamically load Porcupine web packages (optional peers).
 * @returns {Promise<{ PorcupineWorker: any, WebVoiceProcessor: any }>}
 */
export async function loadPorcupineModules() {
  try {
    const porcupineMod = await import('@picovoice/porcupine-web');
    const wvpMod = await import('@picovoice/web-voice-processor');
    return {
      PorcupineWorker: porcupineMod.PorcupineWorker || porcupineMod.default?.PorcupineWorker,
      BuiltInKeyword: porcupineMod.BuiltInKeyword || porcupineMod.default?.BuiltInKeyword,
      WebVoiceProcessor: wvpMod.WebVoiceProcessor || wvpMod.default,
    };
  } catch (e) {
    const err = new Error(
      '[JSVoice] Porcupine packages not installed. Run: npm i @picovoice/porcupine-web @picovoice/web-voice-processor'
    );
    err.cause = e;
    throw err;
  }
}

/**
 * Create a wake-word controller. Safe no-op factory if not in browser until start().
 * @param {PorcupineWakeOptions} options
 */
export async function createPorcupineWakeAdapter(options = {}) {
  if (!options.accessKey) {
    throw new Error('[JSVoice] PorcupineWakeAdapter requires options.accessKey');
  }

  let worker = null;
  let subscribed = false;
  let modules = null;

  const api = {
    name: 'PorcupineWakeAdapter',
    isRunning: false,

    /**
     * Start always-listening wake-word detection.
     */
    async start() {
      if (!isBrowser()) {
        throw new Error('[JSVoice] PorcupineWakeAdapter requires a browser environment');
      }
      if (api.isRunning) return api;

      modules = modules || (await loadPorcupineModules());
      const { PorcupineWorker, BuiltInKeyword, WebVoiceProcessor } = modules;

      if (!PorcupineWorker || !WebVoiceProcessor) {
        throw new Error('[JSVoice] Porcupine web modules missing expected exports (API may have changed)');
      }

      const keywordLabel = (options.keyword || 'porcupine').toUpperCase();
      const builtin =
        BuiltInKeyword && BuiltInKeyword[keywordLabel] != null
          ? BuiltInKeyword[keywordLabel]
          : options.keyword || 'Porcupine';

      try {
        // Picovoice APIs evolve; support both create() styles where possible
        if (typeof PorcupineWorker.create === 'function') {
          worker = await PorcupineWorker.create(
            options.accessKey,
            [{ builtin: builtin, sensitivity: options.sensitivity ?? 0.5 }],
            (detection) => {
              options.onWake?.({
                label: detection?.label || options.keyword || 'wake',
                index: detection?.index,
                raw: detection,
              });
            }
          );
        } else {
          throw new Error('PorcupineWorker.create is not available in this package version');
        }

        await WebVoiceProcessor.subscribe(worker);
        subscribed = true;
        api.isRunning = true;
      } catch (e) {
        options.onError?.(e);
        throw e;
      }

      return api;
    },

    /**
     * Stop detection and release mic subscription.
     */
    async stop() {
      if (!api.isRunning && !worker) return api;
      try {
        if (subscribed && modules?.WebVoiceProcessor && worker) {
          await modules.WebVoiceProcessor.unsubscribe(worker);
          subscribed = false;
        }
        if (worker?.terminate) worker.terminate();
        else if (worker?.release) await worker.release();
      } catch (e) {
        options.onError?.(e);
      } finally {
        worker = null;
        api.isRunning = false;
      }
      return api;
    },

    /**
     * Wire wake events into a JSVoice instance (starts listening on wake).
     * @param {import('../JSVoice.js').default} voice
     */
    attachToVoice(voice) {
      const prev = options.onWake;
      options.onWake = async (evt) => {
        prev?.(evt);
        try {
          voice?.options?.onWakeWordDetected?.(evt.label || options.keyword);
          if (voice && !voice.isListening && typeof voice.start === 'function') {
            await voice.start();
          }
        } catch (e) {
          options.onError?.(e);
        }
      };
      return api;
    },
  };

  return api;
}

/**
 * Feature detect: whether optional packages appear resolvable.
 * Note: actual import still required at start().
 */
export function isPorcupineAvailable() {
  // Cannot statically know without import; advertise as optional
  return true;
}

export default createPorcupineWakeAdapter;
