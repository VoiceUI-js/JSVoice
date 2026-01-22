import React from 'react';
import { useKitState, KitActions } from './store.js';
// Imports
// Imports
// getThemeStyles unused

export function IntentBadge() {
    const intent = useKitState(s => s.intent);
    if (intent === 'neutral') return null;
    const colors = { 'calm': '#10b981', 'urgent': '#f59e0b', 'emergency': '#ef4444', 'quiet': '#6366f1' }; // Keep hardcoded for semantics or define semantic vars?
    // Let's use theme vars for container but keep semantic badges

    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: {
            padding: '4px 12px',
            borderRadius: 'var(--jv-radius-lg)',
            background: colors[intent] || 'var(--jv-bg-panel)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid var(--jv-border)'
        }
    }, React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: 'white' } }), intent + ' Intent');
}

export function FocusTimer() {
    const { active } = useKitState(s => s.focusMode);
    if (!active) return null;
    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: {
            background: 'var(--jv-bg-surface)',
            border: '1px solid var(--jv-border)',
            padding: '8px 16px',
            borderRadius: 'var(--jv-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--jv-text-primary)'
        }
    }, 'Focus Mode: Active');
}

export function ConfirmationOverlay() {
    const { active, label } = useKitState(s => s.confirmation);
    if (!active) return null;
    return React.createElement('div', {
        style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }
    }, React.createElement('div', {
        'data-jsvoice-kit': true,
        style: {
            background: 'var(--jv-bg-surface)',
            padding: '32px',
            borderRadius: 'var(--jv-radius-lg)',
            border: '1px solid var(--jv-border)',
            textAlign: 'center',
            maxWidth: '400px',
            color: 'var(--jv-text-primary)'
        }
    }, React.createElement('h3', { style: { margin: '0 0 16px 0' } }, 'Confirm Action?'),
        React.createElement('p', { style: { color: 'var(--jv-text-secondary)', marginBottom: '24px' } }, label || 'Are you sure you want to proceed?'),
        React.createElement('div', { style: { display: 'flex', gap: '16px', justifyContent: 'center' } },
            React.createElement('button', { onClick: () => KitActions.resolveConfirmation(false), 'aria-label': 'Cancel action', style: { padding: '12px 24px', borderRadius: 'var(--jv-radius-md)', background: 'var(--jv-bg-panel)', color: 'var(--jv-text-primary)', border: '1px solid var(--jv-border)' } }, 'Cancel'),
            React.createElement('button', { onClick: () => KitActions.resolveConfirmation(true), 'aria-label': 'Confirm action', style: { padding: '12px 24px', borderRadius: 'var(--jv-radius-md)', background: 'var(--jv-danger)', color: 'white', border: 'none' } }, 'Confirm')
        )));
}

// 4. History Panel
export function HistoryPanel() {
    const history = useKitState(s => s.history);
    const visible = useKitState(s => s.visibility.debug); // Show only if debug is visible
    if (!visible || history.length === 0) return null;

    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: { position: 'fixed', bottom: 80, right: 20, width: 250, maxHeight: 300, overflowY: 'auto', background: 'var(--jv-bg-surface)', border: '1px solid var(--jv-border)', borderRadius: 'var(--jv-radius-md)', padding: 12, fontSize: 13, zIndex: 9000, backdropFilter: 'blur(8px)', color: 'var(--jv-text-primary)' }
    }, React.createElement('h4', { style: { margin: '0 0 8px 0', color: 'var(--jv-text-secondary)', textTransform: 'uppercase', fontSize: 11 } }, 'Voice History'),
        history.map(h => React.createElement('div', { key: h.id, style: { marginBottom: 6, display: 'flex', justifyContent: 'space-between', color: 'var(--jv-text-secondary)' } },
            React.createElement('span', null, h.command),
            React.createElement('span', { style: { color: h.confidence > 0.8 ? '#4ade80' : '#facc15' } }, (h.confidence ? (h.confidence * 100).toFixed(0) + '%' : ''))
        )));
}

// 5. Visibility / Advanced
export function AdvancedPanel() {
    const visible = useKitState(s => s.visibility.advanced);
    if (!visible) return null;
    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: { margin: '20px 0', padding: 20, border: '1px dashed var(--jv-border)', borderRadius: 'var(--jv-radius-sm)', background: 'var(--jv-bg-panel)' }
    }, React.createElement('h4', { style: { marginTop: 0, color: 'var(--jv-text-primary)' } }, 'Advanced Configuration'),
        React.createElement('p', { style: { color: 'var(--jv-text-secondary)' } }, 'This panel was revealed by voice command "Show Advanced Options".'));
}

// 7. Filter Bar
export function FilterBar() {
    const filters = useKitState(s => s.filters);
    if (filters.length === 0) return null;

    return React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 0' } },
        filters.map((f) => React.createElement('span', { key: f, style: { background: 'var(--jv-accent)', color: 'white', padding: '4px 12px', borderRadius: 16, fontSize: 12 } },
            f, React.createElement('button', { onClick: () => { }, 'aria-label': 'Remove filter', style: { background: 'none', border: 'none', color: 'white', marginLeft: 6, cursor: 'pointer' } }, '×')))
    );
}

// 8. Simulation Banner
export function SimulationBanner() {
    const sim = useKitState(s => s.simulation);
    if (!sim.offline && !sim.micBlocked) return null;

    return React.createElement('div', {
        style: { position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'var(--jv-danger)', zIndex: 9999 }
    }, React.createElement('div', { style: { position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', background: 'var(--jv-danger)', color: 'white', padding: '4px 12px', borderRadius: '0 0 8px 8px', fontSize: 12, fontWeight: 600 } },
        sim.offline ? 'Offline Simulation' : 'Mic Blocked Simulation'
    ));
}

// 9. Tour Overlay
export function TourOverlay() {
    const tour = useKitState(s => s.tour);
    if (!tour.active) return null;

    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: { position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: 'var(--jv-accent)', color: 'white', padding: '16px 24px', borderRadius: 'var(--jv-radius-md)', zIndex: 10000, boxShadow: '0 8px 32px rgba(59,130,246,0.3)', maxWidth: 300, textAlign: 'center' }
    },
        React.createElement('h4', { style: { margin: '0 0 8px 0' } }, `Step ${tour.step + 1}`),
        React.createElement('p', { style: { margin: '0 0 12px 0', fontSize: 14, opacity: 0.9 } }, 'Say "Next" to continue or "Stop Tour" to exit.'),
        React.createElement('button', { onClick: () => KitActions.nextTourStep(), style: { background: 'white', color: 'var(--jv-accent)', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 600 } }, 'Next')
    );
}

// 11. Snapshot List
export function SnapshotList() {
    const snapshots = useKitState(s => s.snapshots || []);
    const visible = useKitState(s => s.visibility.debug);
    if (!visible) return null;

    return React.createElement('div', {
        'data-jsvoice-kit': true,
        style: { marginTop: 20 }
    }, React.createElement('h5', { style: { color: 'var(--jv-text-secondary)', borderBottom: '1px solid var(--jv-border)', paddingBottom: 8 } }, 'Local Snapshots'),
        snapshots.length === 0 ? React.createElement('p', { style: { fontSize: 13, color: 'var(--jv-text-secondary)' } }, 'Say "Save Snapshot"') :
            snapshots.map((snap) => React.createElement('div', { key: snap.name || snap.id, style: { padding: '8px 0', fontSize: 13, color: 'var(--jv-text-secondary)', display: 'flex', justifyContent: 'space-between' } },
                snap.name,
                React.createElement('button', { onClick: () => KitActions.loadSnapshot(snap.name), style: { background: 'transparent', border: '1px solid var(--jv-border)', color: 'var(--jv-text-secondary)', borderRadius: 4, fontSize: 10, padding: '2px 6px' } }, 'Load')
            ))
    );
}

// 12. Attention Spotlight
export function AttentionSpotlight() {
    const spotlight = useKitState(s => s.spotlight);
    if (!spotlight) return null;

    return React.createElement('div', {
        style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
        React.createElement('h2', { style: { color: 'white' } }, `Focusing on ${spotlight}`)
    );
}
