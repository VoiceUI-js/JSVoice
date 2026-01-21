'use client';
import { useKitState, KitActions } from 'jsvoice/react/kit';
import { IntentBadge, FocusTimer, FilterBar, AdvancedPanel, SnapshotList } from 'jsvoice/react/kit/components';

export default function UIHub() {
    const intent = useKitState(s => s.intent);
    const layout = useKitState(s => s.layout);

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0 }}>Voice Command Center</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <IntentBadge />
                    <FocusTimer />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Panel A: Instructions */}
                <div style={{
                    background: 'var(--jv-bg-surface)',
                    padding: '24px',
                    borderRadius: 'var(--jv-radius-lg)',
                    border: '1px solid var(--jv-border)',
                    order: layout.panelOrder.indexOf('a')
                }}>
                    <h3>🗣️ Try these commands:</h3>
                    <ul style={{ lineHeight: '1.6', color: 'var(--jv-text-secondary)' }}>
                        <li>"Calm mode" / "Urgent mode"</li>
                        <li>"Focus for 25 minutes" / "Stop focus"</li>
                        <li>"Confirm" / "Cancel" (Try deleting something)</li>
                        <li>"Show advanced options"</li>
                        <li>"Filter by priority"</li>
                        <li>"Save snapshot"</li>
                        <li>"Start tour"</li>
                    </ul>
                </div>

                {/* Panel B: Active Status */}
                <div style={{
                    background: 'var(--jv-bg-surface)',
                    padding: '24px',
                    borderRadius: 'var(--jv-radius-lg)',
                    border: '1px solid var(--jv-border)',
                    order: layout.panelOrder.indexOf('b')
                }}>
                    <h3>📊 Active Filters</h3>
                    <FilterBar />
                    <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '12px' }}>
                        Say "Filter by [text]" to add tags.
                    </p>

                    <div style={{ marginTop: '24px' }}>
                        <h3>📸 Snapshots</h3>
                        <SnapshotList />
                    </div>
                </div>

                {/* Panel C: Advanced */}
                <div style={{
                    background: 'var(--jv-bg-surface)',
                    padding: '24px',
                    borderRadius: 'var(--jv-radius-lg)',
                    border: '1px solid var(--jv-border)',
                    order: layout.panelOrder.indexOf('c')
                }}>
                    <h3>⚙️ System</h3>
                    <AdvancedPanel />
                    <p>
                        Current Intent: <strong>{intent}</strong>
                    </p>
                    <button
                        onClick={() => KitActions.requestConfirmation(() => alert('Deleted!'), 'Delete all data?')}
                        style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            background: 'var(--jv-danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Trigger Confirmation (Click)
                    </button>
                </div>
            </div>
        </div>
    );
}
