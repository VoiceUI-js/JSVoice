/**
 * Preset app templates for quick product scaffolding.
 */
import React from 'react';
import { VoiceKitShell, VoiceDashboardLayout } from './layouts.js';
import { VoiceAssistantLayout, VoiceAssistantPanel } from './assistant.js';
import { VoiceCommandGrid, VoiceCommandFavorites, VoiceCommandHistory } from './commands-extra.js';
import { VoiceDevTools } from './devtools.js';
import { VoiceA11yPanel } from './a11y.js';
import { VoiceWidgetDashboard } from './widgets-extra.js';
import { VoiceWorkflowBuilder } from './workflows.js';
import { VoiceControlBar, VoiceFloatingButton, VoiceMiniDock } from './controls-extra.js';
import { VoiceDock, VoiceHUD, VoiceCommandPalette, VoiceTranscript } from './voice-controls.js';
import { VoiceSettingsDrawer } from './settings.js';
import { VoiceAnalyticsDashboard } from './analytics.js';
import { VoicePluginMarketplace } from './plugins-extra.js';
import { RuleBuilder, HyperVoiceShell } from './panels.js';
import { VoiceRecoveryPanel } from './errors.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { VoiceButton, VoiceCard } from './primitives.js';
import { baseFont } from '../styles.js';

export function VoiceDashboardTemplate({ style }) {
  return React.createElement(
    VoiceKitShell,
    { title: 'Voice Dashboard', style },
    React.createElement(VoiceControlBar, { style: { marginBottom: 16 } }),
    React.createElement(
      VoiceDashboardLayout,
      null,
      React.createElement(VoiceCard, { title: 'Transcript' }, React.createElement(VoiceTranscript, { compact: true })),
      React.createElement(VoiceCard, { title: 'Favorites' }, React.createElement(VoiceCommandFavorites, null)),
      React.createElement(VoiceCard, { title: 'Analytics' }, React.createElement(VoiceAnalyticsDashboard, null))
    ),
    React.createElement(HyperVoiceShell, { showOnboarding: false })
  );
}

export function VoiceAssistantTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { ...baseFont, ...style } },
    React.createElement(VoiceAssistantLayout, null),
    React.createElement(VoiceDock, null),
    React.createElement(VoiceCommandPalette, null),
    React.createElement(VoiceSettingsDrawer, null)
  );
}

export function VoiceCommandCenterTemplate({ style }) {
  return React.createElement(
    VoiceKitShell,
    { title: 'Command Center', style },
    React.createElement(VoiceCommandGrid, null),
    React.createElement('div', { style: { height: 16 } }),
    React.createElement(VoiceCommandHistory, null),
    React.createElement(VoiceDock, null),
    React.createElement(VoiceCommandPalette, null)
  );
}

export function VoiceDebugLabTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...baseFont, ...style } },
    React.createElement(VoiceDevTools, null),
    React.createElement(VoiceRecoveryPanel, { style: { marginTop: 16 } }),
    React.createElement(VoiceDock, null)
  );
}

export function VoiceAccessibilityTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...style } },
    React.createElement(VoiceA11yPanel, null),
    React.createElement(VoiceDock, null)
  );
}

export function VoiceWidgetBuilderTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...style } },
    React.createElement(VoiceWidgetDashboard, null),
    React.createElement(VoiceDock, null),
    React.createElement(VoiceCommandPalette, null)
  );
}

export function VoiceWorkflowBuilderTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...style } },
    React.createElement(VoiceWorkflowBuilder, null),
    React.createElement(VoiceDock, null)
  );
}

export function VoiceMiniOverlayTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { minHeight: 200, ...style } },
    React.createElement(VoiceFloatingButton, null),
    React.createElement(VoiceMiniDock, null),
    React.createElement(VoiceHUD, null),
    React.createElement(VoiceCommandPalette, null)
  );
}

export function VoicePluginCenterTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...style } },
    React.createElement(VoicePluginMarketplace, null),
    React.createElement(VoiceDock, null)
  );
}

export function VoiceRulesTemplate({ style }) {
  return React.createElement(
    'div',
    { style: { padding: 16, ...style } },
    React.createElement(RuleBuilder, null),
    React.createElement(VoiceDock, null)
  );
}

export function VoiceTemplateGallery({ onPick, style }) {
  const templates = [
    { id: 'dashboard', label: 'Dashboard', Comp: VoiceDashboardTemplate },
    { id: 'assistant', label: 'Assistant', Comp: VoiceAssistantTemplate },
    { id: 'commands', label: 'Command center', Comp: VoiceCommandCenterTemplate },
    { id: 'debug', label: 'Debug lab', Comp: VoiceDebugLabTemplate },
    { id: 'a11y', label: 'Accessibility', Comp: VoiceAccessibilityTemplate },
    { id: 'widgets', label: 'Widget builder', Comp: VoiceWidgetBuilderTemplate },
    { id: 'workflows', label: 'Workflows', Comp: VoiceWorkflowBuilderTemplate },
    { id: 'mini', label: 'Mini overlay', Comp: VoiceMiniOverlayTemplate },
  ];
  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, ...style } },
    templates.map((t) =>
      React.createElement(
        VoiceCard,
        {
          key: t.id,
          title: t.label,
          footer: React.createElement(
            VoiceButton,
            {
              variant: 'primary',
              onClick: () => onPick?.(t.id),
            },
            'Open'
          ),
        },
        React.createElement(
          'p',
          { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } },
          `Preset: ${t.label}`
        )
      )
    )
  );
}
