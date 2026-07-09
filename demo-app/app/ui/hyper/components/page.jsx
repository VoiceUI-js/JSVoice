'use client';
import React from 'react';
import {
  VoiceOrb,
  VoiceStatusPill,
  VoiceStatusRing,
  VoiceMicButton,
  VoiceMuteButton,
  VoiceControlBar,
  VoiceCompactControls,
  VoiceWaveform,
  VoiceAmplitudeMeter,
  VoiceCard,
  VoiceButton,
} from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Component gallery">
      <div style={{ display: 'grid', gap: 16 }}>
        <VoiceControlBar />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <VoiceOrb size="md" />
          <VoiceStatusRing />
          <VoiceStatusPill />
          <VoiceWaveform />
          <VoiceAmplitudeMeter style={{ width: 120 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <VoiceMicButton />
          <VoiceMuteButton />
          <VoiceCompactControls />
        </div>
        <VoiceCard title="Primitives" footer={<VoiceButton variant="primary">Primary action</VoiceButton>}>
          Buttons, cards, docks, and indicators use the shared design tokens and density modes.
        </VoiceCard>
      </div>
    </SectionPage>
  );
}
