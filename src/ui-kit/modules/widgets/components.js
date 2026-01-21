import React from 'react';
import { useUiKitState } from '../../core/store.js';

export function WidgetCanvas() {
    const widgets = useUiKitState(s => s.widgets);

    return React.createElement('div', {
        style: {
            position: 'relative',
            height: '400px',
            background: 'var(--jv-bg-canvas, #111)',
            border: '1px solid var(--jv-border, #333)',
            borderRadius: '8px',
            overflow: 'hidden'
        }
    }, widgets.map(w =>
        React.createElement('div', {
            key: w.id,
            role: 'region',
            'aria-label': `${w.name} (${w.type})`,
            tabIndex: 0,
            style: {
                position: 'absolute',
                left: w.x,
                top: w.y,
                width: 150,
                height: 100,
                background: 'var(--jv-bg-surface, #222)',
                border: '1px solid var(--jv-border, #444)',
                borderRadius: 'var(--jv-radius-sm, 4px)',
                padding: '8px',
                color: 'var(--jv-text-primary, #fff)',
                boxShadow: 'var(--jv-shadow-sm, 0 4px 6px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(var(--jv-backdrop-blur, 0px))',
                animation: 'var(--jv-anim-enter, none)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
            },
            onFocus: (e) => {
                e.currentTarget.style.zIndex = 10;
                e.currentTarget.style.borderColor = 'var(--jv-accent, #3b82f6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.5)';
            },
            onBlur: (e) => {
                e.currentTarget.style.zIndex = 'auto';
                e.currentTarget.style.borderColor = 'var(--jv-border, #444)';
                e.currentTarget.style.boxShadow = 'var(--jv-shadow-sm, 0 4px 6px rgba(0,0,0,0.3))';
            }
        },
            React.createElement('h5', { style: { margin: 0, borderBottom: '1px solid #ffffff22', paddingBottom: '4px', marginBottom: '4px' } }, w.name),
            React.createElement('span', { style: { fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' } }, w.type),
            w.data?.filter && React.createElement('div', {
                style: {
                    marginTop: '6px',
                    fontSize: '10px',
                    background: 'var(--jv-accent)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    display: 'inline-block'
                }
            }, 'Filter: ' + w.data.filter)
        )
    ));
}
