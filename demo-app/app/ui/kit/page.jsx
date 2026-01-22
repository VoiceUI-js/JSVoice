'use client';
/* eslint-disable react/prop-types */

import React, { useState } from 'react';
import { createVoice } from 'jsvoice';
import { VoiceProvider } from 'jsvoice/react';

// Plugins
import WidgetPlugin from 'jsvoice/ui-kit/modules/widgets';
import RulesPlugin from 'jsvoice/ui-kit/modules/rules';
import LinksPlugin from 'jsvoice/ui-kit/modules/links';
import ConstraintsPlugin from 'jsvoice/ui-kit/modules/constraints';
import BookmarksPlugin from 'jsvoice/ui-kit/modules/bookmarks';
import SummariesPlugin from 'jsvoice/ui-kit/modules/summaries';
import VoiceModePlugin from 'jsvoice/ui-kit/modules/voice-mode';
import UndoPlugin from 'jsvoice/ui-kit/modules/undo';
import RepairPlugin from 'jsvoice/ui-kit/modules/repair';

// Components
import { WidgetCanvas } from 'jsvoice/ui-kit/modules/widgets/components';
import { VoiceModeOverlay } from 'jsvoice/ui-kit/modules/voice-mode/components';
import { useUiKitState } from 'jsvoice/ui-kit/core/store';
import { VoiceKitTheme } from 'jsvoice/react/kit/themes';

function KitPlayground() {
    const [voice] = useState(() => {
        if (typeof globalThis.window === 'undefined') return null;
        const v = createVoice();
        v.use(WidgetPlugin);
        v.use(RulesPlugin);
        v.use(LinksPlugin);
        v.use(ConstraintsPlugin);
        v.use(BookmarksPlugin);
        v.use(SummariesPlugin);
        v.use(VoiceModePlugin);
        v.use(UndoPlugin);
        v.use(RepairPlugin);
        return v;
    });

    const state = useUiKitState();

    return (
        <VoiceProvider voice={voice}>
            <VoiceKitTheme theme="premium_dark_orange" />
            <VoiceModeOverlay />
            <div style={{ padding: '40px', color: 'var(--jv-text-primary)', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>

                <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--jv-border)', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Voice UI Kit Playground</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--jv-text-secondary)', maxWidth: '600px' }}>
                        Interact with the 9 advanced modules using voice commands.
                        Try the scenarios below to see full capabilities.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>

                    {/* Left Column: Interactive Canvas */}
                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
                                <h2 style={{ margin: 0 }}>Interactive Workspace</h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--jv-accent)' }}>
                                    {voice?.isListening ? 'Listening...' : 'Mic Off'}
                                </span>
                            </div>
                            <WidgetCanvas />
                        </section>

                        <section>
                            <h3>Demo Scenarios</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>

                                {/* Scenario 1 */}
                                <div style={{ background: 'var(--jv-bg-panel)', padding: '20px', borderRadius: 'var(--jv-radius-md)', border: '1px solid var(--jv-border)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--jv-accent)' }}>1. Dashboard Builder</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--jv-text-secondary)', marginBottom: '15px' }}>
                                        Create and organize widgets using natural language.
                                    </p>
                                    <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        "Create panel for Sales"<br />
                                        "Create widget Traffic"<br />
                                        "Rename Sales to Revenue"<br />
                                        "Pin Revenue"
                                    </code>
                                </div>

                                {/* Scenario 2 */}
                                <div style={{ background: 'var(--jv-bg-panel)', padding: '20px', borderRadius: 'var(--jv-radius-md)', border: '1px solid var(--jv-border)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--jv-accent)' }}>2. Linked Data & Filters</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--jv-text-secondary)', marginBottom: '15px' }}>
                                        Connect widgets so filters propagate automatically.
                                    </p>
                                    <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        "Create panel Source"<br />
                                        "Create panel Target"<br />
                                        "Link Source to Target"<br />
                                        "Filter Source by Q4 Results"
                                    </code>
                                </div>

                                {/* Scenario 3 */}
                                <div style={{ background: 'var(--jv-bg-panel)', padding: '20px', borderRadius: 'var(--jv-radius-md)', border: '1px solid var(--jv-border)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--jv-accent)' }}>3. Safety & Recovery</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--jv-text-secondary)', marginBottom: '15px' }}>
                                        Test undo stacks and bookmarking.
                                    </p>
                                    <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        "Remove widget Traffic"<br />
                                        "Undo last action"<br />
                                        "Bookmark this as Safe State"<br />
                                        "Remove all widgets"<br />
                                        "Jump to bookmark Safe State"
                                    </code>
                                </div>

                                {/* Scenario 4 */}
                                <div style={{ background: 'var(--jv-bg-panel)', padding: '20px', borderRadius: 'var(--jv-radius-md)', border: '1px solid var(--jv-border)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--jv-accent)' }}>4. Accessibility Mode</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--jv-text-secondary)', marginBottom: '15px' }}>
                                        Experience the eyes-free Voice Mode.
                                    </p>
                                    <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        "Voice only mode"<br />
                                        (Screen goes dark)<br />
                                        "Read current state"<br />
                                        "Exit voice mode"
                                    </code>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Inspector */}
                    <div style={{ background: 'var(--jv-bg-surface)', padding: '20px', borderRadius: 'var(--jv-radius-lg)', border: '1px solid var(--jv-border)', height: 'fit-content' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--jv-border)', paddingBottom: '10px' }}>State Inspector</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <InspectorItem label="Active Rules" value={state.rules.length} detail={state.rules.map(r => r.description).join(', ') || 'None'} />
                            <InspectorItem label="Links" value={state.links.length} detail={`${state.links.length} active connections`} />
                            <InspectorItem label="Bookmarks" value={state.bookmarks.length} detail={state.bookmarks.map(b => b.name).join(', ') || 'None'} />
                            <InspectorItem label="Undo Stack" value={state.undoStack.length} detail="Actions available to revert" />

                            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--jv-text-secondary)' }}>Last Event</strong>
                                <div style={{ fontSize: '0.9rem', marginTop: '4px', fontFamily: 'monospace' }}>
                                    {state.events[state.events.length - 1]?.msg || 'Ready'}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `jsvoice-kit-state-${Date.now()}.json`;
                                    a.click();
                                }}
                                style={{
                                    marginTop: '10px',
                                    padding: '8px 12px',
                                    background: 'var(--jv-bg-panel)',
                                    border: '1px solid var(--jv-border)',
                                    color: 'var(--jv-text-secondary)',
                                    borderRadius: 'var(--jv-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    width: '100%'
                                }}
                            >
                                Export State Snaphot
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </VoiceProvider>
    );
}

function InspectorItem({ label, value, detail }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{label}</strong>
                <span style={{ background: 'var(--jv-accent)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'white' }}>{value}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--jv-text-secondary)', marginTop: '4px' }}>{detail}</div>
        </div>
    );
}

export default KitPlayground;
