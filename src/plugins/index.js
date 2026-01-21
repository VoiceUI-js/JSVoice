/**
 * BasePlugin Interface and Registry
 * JSVoice plugins add functionality by hooking into the core API or extending it.
 */
export const PluginType = {
    Visualizer: 'visualizer',
    VAD: 'vad',
    Hotkeys: 'hotkeys',
    FuzzyMatch: 'fuzzy',
    Help: 'help',
    Custom: 'custom'
};

/**
 * Standard Plugin Structure
 * (Documented interface, no class needed for pure functions)
 * 
 * @typedef {Object} PluginAPI
 * @property {JSVoice} voice - The JSVoice instance
 * @property {Function} on - Subscribe to internal events
 * @property {Function} emit - Emit custom events
 */

/**
 * Helper to ensure consistent plugin loading
 * @param {JSVoice} voiceInstance 
 * @param {Function|Object} plugin 
 * @param {Object} options 
 */
export function loadPlugin(voiceInstance, plugin, options = {}) {
    if (typeof plugin === 'function') {
        return plugin(voiceInstance, options);
    } else if (typeof plugin === 'object' && plugin.install) {
        return plugin.install(voiceInstance, options);
    } else {
        console.warn('[JSVoice] Invalid plugin format');
        return null;
    }
}
