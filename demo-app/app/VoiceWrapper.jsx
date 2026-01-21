'use client';

import React, { useState } from 'react';
import { createVoice } from 'jsvoice';
import { VoiceProvider } from 'jsvoice/react';
import VoiceKitPlugin from 'jsvoice/plugins/kit';
import { VoiceKitTheme } from 'jsvoice/react/kit/themes';

import {
    ConfirmationOverlay,
    SimulationBanner,
    TourOverlay,
    AttentionSpotlight,
    HistoryPanel
} from 'jsvoice/react/kit/components';

export default function VoiceWrapper({ children }) {
    const [voice] = useState(() => {
        if (typeof window === 'undefined') return null;
        const v = createVoice();
        v.use(VoiceKitPlugin);
        return v;
    });

    return (
        <VoiceProvider voice={voice}>
            <VoiceKitTheme theme="cyberpunk" />
            <SimulationBanner />
            <AttentionSpotlight />
            <ConfirmationOverlay />
            <TourOverlay />
            <HistoryPanel />
            {children}
        </VoiceProvider>
    );
}
