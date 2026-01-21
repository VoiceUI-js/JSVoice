/**
 * @jsvoice/react/components
 * Styled UI primitives for Voice interactions.
 */
import React from 'react';
import { useVoice, useVoiceStatus } from './index.js';

// Styles (Inline for zero-dep)
const styles = {
    hud: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#1a1a1a',
        color: '#fff',
        padding: '12px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'system-ui, sans-serif',
        zIndex: 9999,
        transition: 'all 0.2s ease'
    },
    indicator: (status) => ({
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: status === 'listening' ? '#ef4444' :
            status === 'processing' ? '#3b82f6' : '#666',
        animation: status === 'listening' ? 'pulse 1.5s infinite' : 'none'
    })
};

export function VoiceHUD({ position = 'bottom-right' }) {
    const voice = useVoice();
    const status = useVoiceStatus(s => s.status);
    const transcript = useVoiceStatus(s => s.transcript);

    if (status === 'idle') return null;

    return React.createElement('div', { style: styles.hud },
        React.createElement('div', { style: styles.indicator(status) }),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('span', { style: { fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' } }, status),
            React.createElement('span', { style: { fontSize: '14px', fontWeight: 500 } },
                transcript.partial || transcript.final || 'Listening...'
            )
        )
    );
}

export function PushToTalkButton({ label = 'Hold to Speak' }) {
    const voice = useVoice();

    return React.createElement('button', {
        onMouseDown: () => voice.start(),
        onMouseUp: () => voice.stop(),
        onTouchStart: () => voice.start(),
        onTouchEnd: () => voice.stop(),
        style: {
            padding: '12px 24px',
            borderRadius: '99px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600
        }
    }, label);
}
