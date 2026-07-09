'use client';

import React, { useMemo, useState } from 'react';
import { createVoice } from 'jsvoice';
import {
  VoiceKitProvider,
  VoiceDock,
  VoiceHUD,
  VoiceCommandPalette,
  VoiceSettingsDrawer,
  VoiceKitActions,
} from 'jsvoice/react/kit';
import { NavigationPack, FormPack, MediaPack } from 'jsvoice/packs/basic';

/**
 * Shared demo shell with createVoice + kit commands.
 * Fake-friendly: still works when mic denied (commands via palette / tester).
 */
export function useDemoVoice() {
  return useState(() => {
    if (typeof globalThis.window === 'undefined') return null;
    const v = createVoice({});
    try {
      NavigationPack.install(v);
      FormPack.install(v);
      MediaPack.install(v);
    } catch {
      /* packs optional */
    }
    v.addCommand('hello kit', () => v.speak('Hyper Voice UI Kit phase two is ready'));
    v.addCommand('open palette', () => VoiceKitActions.setPaletteOpen(true));
    v.addPatternCommand('greet {name}', ({ name }) => v.speak(`Hello ${name}`));
    return v;
  })[0];
}

export function HyperDemoShell({ children, theme = 'glassDark', enableKitCommands = true }) {
  const voice = useDemoVoice();

  if (!voice) {
    return (
      <div style={{ padding: 40, color: '#fff' }}>Loading voice kit…</div>
    );
  }

  return (
    <VoiceKitProvider
      voice={voice}
      theme={theme}
      enableKitCommands={enableKitCommands}
      persistKey="jsvoice-demo-hyper-v2"
    >
      {children}
      <VoiceDock />
      <VoiceHUD />
      <VoiceCommandPalette />
      <VoiceSettingsDrawer />
    </VoiceKitProvider>
  );
}
