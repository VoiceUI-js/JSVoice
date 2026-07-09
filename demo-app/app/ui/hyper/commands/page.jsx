'use client';
import { VoiceCommandCenterTemplate } from 'jsvoice/react/kit';
import { HyperDemoShell } from '../HyperDemoShell.jsx';

export default function Page() {
  return (
    <HyperDemoShell>
      <VoiceCommandCenterTemplate />
    </HyperDemoShell>
  );
}
