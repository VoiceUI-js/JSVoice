'use client';
import React, { useState } from 'react';
import {
  VoiceTemplateGallery,
  VoiceDashboardTemplate,
  VoiceAssistantTemplate,
  VoiceCommandCenterTemplate,
  VoiceDebugLabTemplate,
  VoiceMiniOverlayTemplate,
  VoiceButton,
} from 'jsvoice/react/kit';
import { HyperDemoShell } from '../HyperDemoShell.jsx';

const MAP = {
  dashboard: VoiceDashboardTemplate,
  assistant: VoiceAssistantTemplate,
  commands: VoiceCommandCenterTemplate,
  debug: VoiceDebugLabTemplate,
  mini: VoiceMiniOverlayTemplate,
};

export default function Page() {
  const [id, setId] = useState(null);
  const Comp = id ? MAP[id] : null;
  return (
    <HyperDemoShell>
      <div style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Templates</h1>
        {!Comp && <VoiceTemplateGallery onPick={setId} />}
        {Comp && (
          <div>
            <VoiceButton onClick={() => setId(null)} style={{ marginBottom: 12 }}>
              ← Gallery
            </VoiceButton>
            <Comp />
          </div>
        )}
      </div>
    </HyperDemoShell>
  );
}
