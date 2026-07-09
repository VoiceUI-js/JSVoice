'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  VoiceControlBar,
  VoiceTranscriptPanel,
  VoiceAnalyticsCards,
  VoiceCommandFavorites,
  VoiceThemeSettings,
  VoiceButton,
  VoiceCard,
  VoiceKitWorkbench,
  VoiceStatusPill,
  VoiceRecoveryPanel,
  VoiceKitActions,
} from 'jsvoice/react/kit';
import { HyperDemoShell } from './HyperDemoShell.jsx';

const LINKS = [
  ['/ui/hyper/assistant', 'Assistant'],
  ['/ui/hyper/commands', 'Commands'],
  ['/ui/hyper/debug', 'Debug lab'],
  ['/ui/hyper/widgets', 'Widgets'],
  ['/ui/hyper/workflows', 'Workflows'],
  ['/ui/hyper/plugins', 'Plugins'],
  ['/ui/hyper/settings', 'Settings'],
  ['/ui/hyper/analytics', 'Analytics'],
  ['/ui/hyper/templates', 'Templates'],
  ['/ui/hyper/accessibility', 'Accessibility'],
];

function Landing() {
  const [mode, setMode] = useState('landing');

  if (mode === 'workbench') {
    return (
      <div>
        <div style={{ padding: 12, display: 'flex', gap: 8 }}>
          <VoiceButton onClick={() => setMode('landing')}>← Landing</VoiceButton>
          <VoiceStatusPill />
        </div>
        <VoiceKitWorkbench />
      </div>
    );
  }

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--jsv-primary, #8b7bff)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              JSVoice · Phase 2
            </p>
            <h1 style={{ margin: '8px 0', fontSize: 36, lineHeight: 1.15 }}>
              Hyper Voice UI Kit
            </h1>
            <p style={{ margin: 0, maxWidth: 560, color: 'var(--jsv-text-muted, #aaa)', fontSize: 16 }}>
              Premium voice-first controls, assistant UI, command center, devtools, workflows,
              widgets, analytics, and accessibility — ready for real products.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <VoiceButton variant="primary" onClick={() => setMode('workbench')}>
              Open workbench
            </VoiceButton>
            <VoiceButton onClick={() => VoiceKitActions.setPaletteOpen(true)}>
              Command palette
            </VoiceButton>
            <VoiceButton onClick={() => VoiceKitActions.setSettingsOpen(true)}>
              Settings
            </VoiceButton>
          </div>
        </div>
      </header>

      <VoiceControlBar style={{ marginBottom: 20 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        <VoiceCard title="Live transcript">
          <VoiceTranscriptPanel />
        </VoiceCard>
        <VoiceCard title="Quick metrics">
          <VoiceAnalyticsCards />
        </VoiceCard>
        <VoiceCard title="Theme">
          <VoiceThemeSettings />
          <div style={{ height: 12 }} />
          <VoiceCommandFavorites />
        </VoiceCard>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Explore sections</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: 14,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {label} →
            </Link>
          ))}
        </div>
      </section>

      <VoiceRecoveryPanel />

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--jsv-text-muted, #888)' }}>
        Tip: use ⌘/Ctrl+K for the palette. Mic optional — run commands from palette or workbench tester.
      </p>
    </div>
  );
}

export default function HyperHomePage() {
  return (
    <HyperDemoShell>
      <Landing />
    </HyperDemoShell>
  );
}
