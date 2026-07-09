'use client';
import { VoiceSettingsPanel } from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Settings">
      <VoiceSettingsPanel />
    </SectionPage>
  );
}
