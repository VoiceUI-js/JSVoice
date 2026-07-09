import JSVoice from '../../src/JSVoice.js';
import { FakeSpeechEngine } from './FakeSpeechEngine.js';

/**
 * Create a JSVoice instance wired for unit/integration tests.
 * @param {object} [options]
 * @returns {{ voice: JSVoice, engine: FakeSpeechEngine }}
 */
export function createTestVoice(options = {}) {
  const engine = options.engine instanceof FakeSpeechEngine
    ? options.engine
    : new FakeSpeechEngine(options);

  const {
    engine: _ignore,
    skipMicGrant = false,
    ...rest
  } = options;

  const voice = new JSVoice({
    engine,
    autoRestart: rest.autoRestart !== undefined ? rest.autoRestart : true,
    restartDelay: rest.restartDelay !== undefined ? rest.restartDelay : 50,
    ...rest,
  });

  if (!skipMicGrant) {
    voice._state._microphoneAllowed = true;
  }

  // Compatibility alias used by older tests
  voice._initialMicrophoneCheckPromise = Promise.resolve();

  return { voice, engine };
}

export { FakeSpeechEngine };
