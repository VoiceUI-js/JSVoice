'use client';
import { VoiceAssistantTemplate } from 'jsvoice/react/kit';
import { HyperDemoShell } from '../HyperDemoShell.jsx';

export default function Page() {
  return (
    <HyperDemoShell>
      <div style={{ padding: 16 }}>
        <VoiceAssistantTemplate />
      </div>
    </HyperDemoShell>
  );
}
