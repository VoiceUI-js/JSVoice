'use client';
import { VoiceModePanel } from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Voice mode">
      <VoiceModePanel />
    </SectionPage>
  );
}
