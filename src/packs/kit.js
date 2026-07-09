/**
 * Hyper Voice UI Kit command packs.
 * Safe to install selectively via VoiceKitProvider enableKitCommands / commandPacks.
 */
import { VoiceKitActions } from '../ui-kit/core/actions.js';

function pack(name, installFn) {
  return {
    name,
    install(voice, options = {}) {
      installFn(voice, options);
      return { name, installed: true };
    },
  };
}

export const VoiceSettingsCommandPack = pack('settings', (voice) => {
  voice.addCommand('open voice settings', () => {
    VoiceKitActions.setSettingsOpen(true);
    voice.speak?.('Opening settings');
  });
  voice.addCommand('close voice settings', () => {
    VoiceKitActions.setSettingsOpen(false);
  });
  voice.addCommand('switch to dark theme', () => {
    VoiceKitActions.setTheme('defaultDark');
    voice.speak?.('Dark theme');
  });
  voice.addCommand('switch to light theme', () => {
    VoiceKitActions.setTheme('defaultLight');
    voice.speak?.('Light theme');
  });
  voice.addCommand('switch to glass theme', () => {
    VoiceKitActions.setTheme('glassDark');
  });
  voice.addCommand('enable high contrast', () => {
    VoiceKitActions.setHighContrast(true);
  });
  voice.addCommand('disable high contrast', () => {
    VoiceKitActions.setHighContrast(false);
    VoiceKitActions.setTheme('glassDark');
  });
});

export const VoiceDebugCommandPack = pack('debug', (voice) => {
  voice.addCommand('open debug panel', () => VoiceKitActions.setDebugOpen(true));
  voice.addCommand('close debug panel', () => VoiceKitActions.setDebugOpen(false));
  voice.addCommand('show transcript', () => {
    VoiceKitActions.pushToast({ title: 'Transcript', message: 'Open the Transcript panel in the workbench', tone: 'info' });
  });
  voice.addCommand('clear transcript', () => {
    VoiceKitActions.clearTranscript({ keepPinned: false });
    voice.speak?.('Transcript cleared');
  });
  voice.addCommand('save session', () => {
    VoiceKitActions.saveSession();
    voice.speak?.('Session saved');
  });
});

export const VoiceWidgetCommandPack = pack('widgets', (voice) => {
  voice.addCommand('open widget dashboard', () => {
    VoiceKitActions.pushToast({ title: 'Widgets', message: 'Open Widget dashboard view', tone: 'info' });
    VoiceKitActions.logEvent?.('Open widget dashboard');
  });
  voice.addCommand('create metric widget', () => {
    VoiceKitActions.createWidget('metric', 'Metric');
  });
  voice.addCommand('create widget', () => {
    VoiceKitActions.createWidget('panel', 'Panel');
  });
  voice.addPatternCommand?.('create {type} widget', ({ type }) => {
    VoiceKitActions.createWidget(type || 'panel', type || 'Panel');
  });
  voice.addCommand('undo', () => VoiceKitActions.undo?.());
  voice.addCommand('redo', () => {
    VoiceKitActions.pushToast({ title: 'Redo', message: 'Redo stack empty or not available', tone: 'info' });
  });
});

export const VoiceWorkflowCommandPack = pack('workflow', (voice) => {
  voice.addCommand('open workflow builder', () => {
    VoiceKitActions.pushToast({ title: 'Workflows', message: 'Open workflow builder view', tone: 'info' });
  });
  voice.addCommand('create workflow', () => {
    VoiceKitActions.createWorkflow({ name: 'New workflow' });
    voice.speak?.('Workflow created');
  });
});

export const VoiceA11yCommandPack = pack('a11y', (voice) => {
  voice.addCommand('show help', () => {
    VoiceKitActions.setHelpOpen(true);
  });
  voice.addCommand('hide help', () => {
    VoiceKitActions.setHelpOpen(false);
  });
  voice.addCommand('enable reduced motion', () => VoiceKitActions.setReducedMotion(true));
  voice.addCommand('disable reduced motion', () => VoiceKitActions.setReducedMotion(false));
  voice.addCommand('enable voice mode', () => {
    VoiceKitActions.setVoiceMode?.(true);
  });
  voice.addCommand('disable voice mode', () => {
    VoiceKitActions.setVoiceMode?.(false);
  });
  voice.addCommand('show command hints', () => {
    VoiceKitActions.updateSettings({ voiceModeHints: true });
  });
});

export const VoiceKitCommandPack = pack('kit', (voice) => {
  voice.addCommand('open command palette', () => VoiceKitActions.setPaletteOpen(true));
  voice.addCommand('close command palette', () => VoiceKitActions.setPaletteOpen(false));
  voice.addCommand('open plugin center', () => {
    VoiceKitActions.pushToast({ title: 'Plugins', message: 'Open plugin center view', tone: 'info' });
  });
  voice.addCommand('start listening', () => voice.start?.());
  voice.addCommand('stop listening', () => voice.stop?.());
  voice.addCommand('mute speech', () => VoiceKitActions.setMuted(true));
  voice.addCommand('unmute speech', () => VoiceKitActions.setMuted(false));
});

export const ALL_KIT_PACKS = {
  settings: VoiceSettingsCommandPack,
  debug: VoiceDebugCommandPack,
  widgets: VoiceWidgetCommandPack,
  workflow: VoiceWorkflowCommandPack,
  a11y: VoiceA11yCommandPack,
  kit: VoiceKitCommandPack,
};

/**
 * Install selected kit command packs.
 * @param {object} voice
 * @param {string[]|true} packs - pack names or true for all
 */
export function installKitCommandPacks(voice, packs = true) {
  const names = packs === true ? Object.keys(ALL_KIT_PACKS) : packs || [];
  names.forEach((name) => {
    const p = ALL_KIT_PACKS[name];
    if (p?.install) p.install(voice);
  });
  return names;
}
