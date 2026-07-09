/**
 * @jsvoice/ui-kit/core/constants
 * Shared constants for the Hyper Voice UI Kit.
 */

export const VOICE_STATUS = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
  DISABLED: 'disabled',
  STARTING: 'starting',
  STOPPING: 'stopping',
};

export const UI_PLACEMENT = {
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
};

export const ORB_SIZES = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
};

export const DEFAULT_PERSIST_KEY = 'jsvoice_voice_kit_prefs';

export const UI_EVENTS = {
  OPEN_PALETTE: 'ui:open-palette',
  CLOSE_PALETTE: 'ui:close-palette',
  TOGGLE_DOCK: 'ui:toggle-dock',
  OPEN_DEBUG: 'ui:open-debug',
  TOAST: 'ui:toast',
  THEME_CHANGE: 'ui:theme-change',
  TRANSCRIPT_CLEAR: 'ui:transcript-clear',
};

export const WIDGET_TYPES = [
  'panel', 'graph', 'metric', 'list', 'table', 'note', 'custom',
  'text', 'status', 'transcript', 'command', 'shortcut', 'action',
  'bookmark', 'summary', 'debug', 'plugin', 'rule', 'workflow',
  'assistant', 'notification',
];

export const RULE_CONDITION_TYPES = [
  'command', 'status', 'scope', 'transcript_includes',
  'command_recognized', 'command_not_recognized', 'status_changed',
  'engine_changed', 'plugin_event', 'widget_selected',
  'wake_word', 'permission_denied', 'error',
];

export const RULE_ACTION_TYPES = [
  'speak', 'set_scope', 'toggle_widget', 'log', 'custom',
  'toast', 'open_panel', 'run_command', 'create_widget',
  'update_widget', 'add_bookmark', 'callback', 'confirm',
];

export const WORKFLOW_NODE_TYPES = [
  'trigger', 'command', 'speak', 'action', 'condition', 'delay', 'end',
];

export const DENSITY_MODES = ['comfortable', 'compact', 'spacious'];

export const VISUAL_VARIANTS = ['solid', 'glass', 'minimal', 'neon', 'outline', 'ghost', 'soft'];

export const KIT_COMMAND_PACKS = [
  'settings', 'debug', 'widgets', 'workflow', 'a11y', 'kit',
];

export const DANGEROUS_ACTION_PATTERNS = [
  /delete/i, /remove/i, /submit/i, /purchase/i, /buy/i, /pay/i,
  /reset/i, /logout/i, /log out/i, /sign out/i, /destroy/i,
];
