'use client';
import { SessionReplayPanel, VoiceSessionStats } from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Session replay">
      <VoiceSessionStats />
      <div style={{ height: 16 }} />
      <SessionReplayPanel />
    </SectionPage>
  );
}
