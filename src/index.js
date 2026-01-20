import JSVoice from './JSVoice.js';
import NativeSpeechEngine from './engines/NativeSpeechEngine.js';
import { AudioVisualizer } from './modules/AudioVisualizer.js';

/**
 * Default factory function to create a JSVoice instance with NativeSpeechEngine.
 * @param {import('./JSVoice').JSVoiceOptions} options 
 * @returns {JSVoice}
 */
export function createVoice(options = {}) {
    const defaultOptions = {
        engines: [NativeSpeechEngine],
        ...options
    };
    const voice = new JSVoice(defaultOptions);

    // Auto-register visualizer if requested (legacy support or convenience)
    // In v2, this should be explicit voice.use(VisualizerPlugin)
    return voice;
}

// Re-export core classes for advanced usage
export { JSVoice, NativeSpeechEngine, AudioVisualizer };

// Default export is the factory for ease of use
export default createVoice;
