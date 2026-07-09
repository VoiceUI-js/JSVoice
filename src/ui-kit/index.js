/**
 * @jsvoice/ui-kit
 * Framework-agnostic Hyper Voice UI Kit core.
 */

export { uikitStore, createVoiceKitStore, getInitialUiKitState } from './core/store.js';
// React hook is opt-in (requires React peer) — import from 'jsvoice/react/kit' or core/useUiKitState
export { VoiceUIController } from './core/controller.js';
export { VoiceKitActions, createVoiceKitController } from './core/actions.js';
export { createEventBus, globalUiEvents } from './core/events.js';
export { globalRegistry, createRegistry } from './core/registry.js';
export * from './core/selectors.js';
export { VoiceKitSelectors } from './core/selectors.js';
export * from './core/constants.js';

export { normalizePluginMeta, parsePluginCatalog, RECOMMENDED_PLUGINS } from './utils/plugins.js';
export { scanInteractiveElements, resolveSafeClick, isDangerousLabel } from './utils/voiceMode.js';

/** Alias for docs / imports */
export { builtInThemes as defaultThemes } from './theme/index.js';

export {
  defaultTokens,
  tokensToCssVars,
  builtInThemes,
  themeNames,
  createVoiceTheme,
  resolveTheme,
  cssVarsToString,
  buildThemeStyleText,
  applyThemeToElement,
  injectThemeStyles,
} from './theme/index.js';

export { classNames } from './utils/classNames.js';
export * from './utils/domSafe.js';
export * from './utils/formatters.js';
export { createId } from './utils/ids.js';
export * from './utils/keyboard.js';
export * from './utils/accessibility.js';
export * from './utils/transcript.js';
