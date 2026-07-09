'use client';
import { VoicePluginMarketplace } from 'jsvoice/react/kit';
import { SectionPage } from '../SectionPage.jsx';

export default function Page() {
  return (
    <SectionPage title="Plugins">
      <VoicePluginMarketplace />
    </SectionPage>
  );
}
