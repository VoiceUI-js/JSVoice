/**
 * JSDoc type definitions for the Hyper Voice UI Kit.
 * Runtime-free; for editor tooling and documentation.
 */

/**
 * @typedef {'idle'|'listening'|'processing'|'speaking'|'error'|'disabled'|'starting'|'stopping'} VoiceStatus
 */

/**
 * @typedef {Object} VoiceSnapshot
 * @property {string} status
 * @property {{ partial: string, final: string, updatedAt: number }} transcript
 * @property {{ microphone: string }} permissions
 * @property {{ name: string, mode: string }} engine
 * @property {Object} [metrics]
 */

/**
 * @typedef {Object} UiKitUiState
 * @property {string} [theme]
 * @property {boolean} [dockCollapsed]
 * @property {boolean} [paletteOpen]
 * @property {boolean} [debugOpen]
 * @property {string} [placement]
 * @property {boolean} [speechMuted]
 * @property {string|null} [lastCommand]
 * @property {string|number} [onboardingStep]
 * @property {boolean} [onboardingComplete]
 */

/**
 * @typedef {Object} UiKitState
 * @property {Array} widgets
 * @property {Array} rules
 * @property {Array} links
 * @property {Array} constraints
 * @property {Array} bookmarks
 * @property {boolean} voiceMode
 * @property {Array} undoStack
 * @property {Array} redoStack
 * @property {Object} repair
 * @property {Array} events
 * @property {UiKitUiState} [ui]
 * @property {Array} [transcriptLog]
 * @property {Array} [toasts]
 * @property {Array} [timeline]
 * @property {Array} [commandTrace]
 * @property {Array} [activePlugins]
 */

export {};
