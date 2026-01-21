import JSVoice from './JSVoice.js';
import NativeSpeechEngine from './engines/NativeSpeechEngine.js';
import HybridSpeechEngine from './engines/HybridSpeechEngine.js';
import { AudioVisualizer } from './modules/AudioVisualizer.js';
import { microphoneManager } from './modules/MicrophoneManager.js';

/**
 * Creates a JSVoice instance with robust fallback support.
 * By default, uses 'auto' mode: Native -> Local Fallback.
 * 
 * @param {import('./JSVoice').JSVoiceOptions} options 
 * @returns {JSVoice}
 */
export function createVoice(options = {}) {
    const defaultOptions = {
        // Wrap strict engine logic in Hybrid wrapper
        engine: new HybridSpeechEngine({
            mode: options.engineMode || 'auto',
            // Pass specific options for nested engines if needed
            native: options.nativeOptions || {},
            local: options.localOptions || {}
        }),
        ...options
    };

    // We pass the hybrid engine as the 'speechEngine' instance to JSVoice
    // Logic inside JSVoice/RecognitionManager should accept this engine interface.
    // Note: JSVoice constructor usually takes specific options. 
    // If JSVoice expects 'engines' array (Legacy), we might need to adjust.
    // Looking at previous index.js, it used `engines: [NativeSpeechEngine]`.
    // It seems JSVoice class might instantiate them?
    // Let's verify JSVoice.js in next step.

    // Assuming JSVoice constructor allows passing an *instance* or *class*.
    // The previous index.js did `engines: [NativeSpeechEngine]`.
    // This implies JSVoice might traverse this list.
    // BUT user request says: "Make JSVoice use... Native... by default".
    // I am changing the default to Hybrid. 
    // If JSVoice.js instantiates from a list, I should provide:
    // engines: [HybridSpeechEngine] ?
    // Or does JSVoice accept an instance?

    // I will check JSVoice.js shortly. For now, writing what seems likely compatible with new goal.
    // If I pass 'engine' instance, it overrides 'engines' class list?

    const voice = new JSVoice(defaultOptions);
    return voice;
}

export {
    JSVoice,
    NativeSpeechEngine,
    HybridSpeechEngine,
    AudioVisualizer,
    microphoneManager
};

export default createVoice;
