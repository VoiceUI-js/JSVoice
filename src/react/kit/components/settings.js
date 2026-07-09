/**
 * Settings UI surfaces.
 */
import React from 'react';
import { useVoiceKitStore, useVoiceTheme } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { themeNames } from '../../../ui-kit/theme/themes.js';
import { DENSITY_MODES } from '../../../ui-kit/core/constants.js';
import { VoiceButton, VoiceCard, VoiceDrawer, VoiceModal, VoiceSelect, VoiceTabs } from './primitives.js';
import { VoiceLanguageSelect, VoiceSpeedControl, VoiceVolumeControl } from './controls-extra.js';
import { VoiceSettingsLayout } from './layouts.js';
import { baseFont } from '../styles.js';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'mic', label: 'Mic' },
  { id: 'engine', label: 'Engine' },
  { id: 'theme', label: 'Theme' },
  { id: 'commands', label: 'Commands' },
  { id: 'plugins', label: 'Plugins' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'debug', label: 'Debug' },
  { id: 'a11y', label: 'Accessibility' },
  { id: 'persistence', label: 'Persistence' },
];

export function VoiceGeneralSettings() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  return React.createElement(
    VoiceCard,
    { title: 'General' },
    React.createElement(VoiceSelect, {
      label: 'Dock placement',
      value: ui.placement || 'bottom-right',
      options: ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left'],
      onChange: (v) => VoiceKitActions.setPlacement(v),
    }),
    React.createElement(VoiceSelect, {
      label: 'Density',
      value: ui.density || 'comfortable',
      options: DENSITY_MODES,
      onChange: (v) => VoiceKitActions.setDensity(v),
      style: { marginTop: 10 },
    }),
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', fontSize: 13 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: !!ui.compactMode,
        onChange: (e) => VoiceKitActions.updateSettings({ compactMode: e.target.checked }),
      }),
      'Compact mode'
    ),
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', fontSize: 13 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: ui.showToasts !== false,
        onChange: (e) => VoiceKitActions.updateSettings({ showToasts: e.target.checked }),
      }),
      'Show toasts'
    )
  );
}

export function VoiceMicSettings() {
  return React.createElement(
    VoiceCard,
    { title: 'Microphone' },
    React.createElement('p', { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } }, 'Request mic from Permission card. Streams are never kept after permission probes.'),
    React.createElement(VoiceLanguageSelect, null)
  );
}

export function VoiceEngineSettings() {
  return React.createElement(
    VoiceCard,
    { title: 'Engine' },
    React.createElement('p', { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } }, 'Engine selection is configured via createVoice / HybridSpeechEngine. UI reflects active engine status.')
  );
}

export function VoiceThemeSettings() {
  const { themeName, setTheme } = useVoiceTheme();
  return React.createElement(
    VoiceCard,
    { title: 'Theme' },
    React.createElement(VoiceSelect, {
      label: 'Theme',
      value: themeName,
      options: themeNames,
      onChange: (v) => {
        VoiceKitActions.setTheme(v);
        setTheme?.(v);
      },
    })
  );
}

export function VoiceCommandSettings() {
  const max = useVoiceKitStore((s) => s.ui?.transcriptMaxItems ?? 50);
  return React.createElement(
    VoiceCard,
    { title: 'Commands & transcript limits' },
    React.createElement(
      'label',
      { style: { fontSize: 13 } },
      `Transcript max items: ${max}`,
      React.createElement('input', {
        type: 'range',
        min: 10,
        max: 200,
        value: max,
        'aria-label': 'Transcript max items',
        onChange: (e) => VoiceKitActions.updateSettings({ transcriptMaxItems: Number(e.target.value) }),
        style: { display: 'block', width: '100%', marginTop: 8 },
      })
    )
  );
}

export function VoicePluginSettingsTab() {
  return React.createElement(
    VoiceCard,
    { title: 'Plugins' },
    React.createElement('p', { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } }, 'Manage plugins in Plugin Center. Load via voice.use(Plugin).')
  );
}

/** @deprecated use VoicePluginSettingsTab — avoids clash with plugins-extra VoicePluginSettings */
export const VoicePluginSettings = VoicePluginSettingsTab;

export function VoicePrivacySettings() {
  const persist = useVoiceKitStore((s) => !!s.ui?.transcriptPersist);
  return React.createElement(
    VoiceCard,
    { title: 'Privacy' },
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: persist,
        onChange: (e) => VoiceKitActions.updateSettings({ transcriptPersist: e.target.checked }),
      }),
      'Opt-in transcript persistence in sessions (off by default)'
    ),
    React.createElement(
      'p',
      { style: { color: 'var(--jsv-warning)', fontSize: 12, marginTop: 10 } },
      'Raw audio is never persisted by the kit. Transcripts only when explicitly enabled.'
    )
  );
}

export function VoiceDebugSettings() {
  const debug = useVoiceKitStore((s) => !!s.ui?.debugOpen);
  return React.createElement(
    VoiceCard,
    { title: 'Debug' },
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: debug,
        onChange: (e) => VoiceKitActions.setDebugOpen(e.target.checked),
      }),
      'Debug panel open'
    )
  );
}

export function VoiceAccessibilitySettings() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  return React.createElement(
    VoiceCard,
    { title: 'Accessibility' },
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: !!ui.reducedMotion,
        onChange: (e) => VoiceKitActions.setReducedMotion(e.target.checked),
      }),
      'Reduced motion'
    ),
    React.createElement(
      'label',
      { style: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginTop: 8 } },
      React.createElement('input', {
        type: 'checkbox',
        checked: !!ui.highContrast,
        onChange: (e) => {
          if (e.target.checked) VoiceKitActions.setHighContrast(true);
          else {
            VoiceKitActions.updateSettings({ highContrast: false });
            VoiceKitActions.setTheme('glassDark');
          }
        },
      }),
      'High contrast theme'
    ),
    React.createElement(VoiceVolumeControl, { style: { marginTop: 12 } }),
    React.createElement(VoiceSpeedControl, { style: { marginTop: 8 } })
  );
}

export function VoicePersistenceSettings() {
  return React.createElement(
    VoiceCard,
    { title: 'Persistence' },
    React.createElement('p', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, 'UI preferences may be saved via VoiceKitProvider persistKey. Transcripts/audio are not saved by default.'),
    React.createElement(VoiceButton, { onClick: () => VoiceKitActions.resetUiSettings() }, 'Reset UI settings')
  );
}

export function VoiceResetSettings() {
  return React.createElement(VoicePersistenceSettings, null);
}

export function VoiceSettingsTabs({ value, onChange }) {
  return React.createElement(VoiceTabs, {
    tabs: TABS,
    value,
    onChange,
  });
}

function SettingsBody({ tab }) {
  switch (tab) {
    case 'mic':
      return React.createElement(VoiceMicSettings, null);
    case 'engine':
      return React.createElement(VoiceEngineSettings, null);
    case 'theme':
      return React.createElement(VoiceThemeSettings, null);
    case 'commands':
      return React.createElement(VoiceCommandSettings, null);
    case 'plugins':
      return React.createElement(VoicePluginSettingsTab, null);
    case 'privacy':
      return React.createElement(VoicePrivacySettings, null);
    case 'debug':
      return React.createElement(VoiceDebugSettings, null);
    case 'a11y':
      return React.createElement(VoiceAccessibilitySettings, null);
    case 'persistence':
      return React.createElement(VoicePersistenceSettings, null);
    default:
      return React.createElement(VoiceGeneralSettings, null);
  }
}

export function VoiceSettingsPanel({ style }) {
  const tab = useVoiceKitStore((s) => s.ui?.settingsTab || 'general');
  return React.createElement(
    'div',
    { style: { ...baseFont, ...style } },
    React.createElement('h2', { style: { marginTop: 0 } }, 'Voice settings'),
    React.createElement(VoiceSettingsTabs, {
      value: tab,
      onChange: (t) => VoiceKitActions.updateSettings({ settingsTab: t }),
    }),
    React.createElement('div', { style: { height: 12 } }),
    React.createElement(SettingsBody, { tab })
  );
}

export function VoiceSettingsDrawer() {
  const open = useVoiceKitStore((s) => !!s.ui?.settingsOpen);
  return React.createElement(
    VoiceDrawer,
    {
      open,
      onClose: () => VoiceKitActions.setSettingsOpen(false),
      title: 'Settings',
      side: 'right',
    },
    React.createElement(VoiceSettingsPanel, null)
  );
}

export function VoiceSettingsModal() {
  const open = useVoiceKitStore((s) => !!s.ui?.settingsOpen);
  return React.createElement(
    VoiceModal,
    {
      open,
      onClose: () => VoiceKitActions.setSettingsOpen(false),
      title: 'Voice settings',
    },
    React.createElement(VoiceSettingsPanel, null)
  );
}
