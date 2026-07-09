'use client';
import { VoiceAnalyticsDashboard } from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Analytics">
      <VoiceAnalyticsDashboard />
    </SectionPage>
  );
}
