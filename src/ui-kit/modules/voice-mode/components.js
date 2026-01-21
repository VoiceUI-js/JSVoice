import React, { useEffect, useRef } from 'react';
import { useUiKitState } from '../../core/store.js';

export function VoiceModeOverlay() {
    const active = useUiKitState(s => s.voiceMode);
    const containerRef = useRef(null);

    // Focus management when activated
    useEffect(() => {
        if (active && containerRef.current) {
            containerRef.current.focus();
        }
    }, [active]);

    if (!active) return null;

    return React.createElement('div', {
        ref: containerRef,
        tabIndex: -1,
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Voice Mode Active',
        style: {
            position: 'fixed',
            inset: 0,
            background: 'var(--jv-bg-canvas, #000)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--jv-text-primary, #fff)',
            fontSize: '2rem'
        }
    },
        React.createElement('div', {
            role: 'status',
            'aria-live': 'polite',
            style: { textAlign: 'center' }
        },
            React.createElement('h1', null, 'Voice Mode Active'),
            React.createElement('p', { style: { fontSize: '1.2rem', opacity: 0.7 } }, 'Say "Read current state" or "Exit voice mode"')
        )
    );
}
