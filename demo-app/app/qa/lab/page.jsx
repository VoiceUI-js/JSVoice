'use client';
import React, { useState, useEffect, useRef } from 'react';
import { VoiceHarness } from '../../../lib/qa/VoiceHarness';
import { WIDGET_TEST_SUITE, LINKS_TEST_SUITE } from '../../../lib/qa/test-suites';
import { uikitStore, useUiKitState } from 'jsvoice/ui-kit/core/store';
import { WidgetCanvas } from 'jsvoice/ui-kit/modules/widgets/components';

// Force import of KitStore to ensure it's active
import 'jsvoice/ui-kit/core/store';

export default function QALab() {
    // Pass the store singleton to the harness for diagnostics
    const [harness] = useState(() => new VoiceHarness(uikitStore));
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const state = useUiKitState();

    // Initialize Harness
    useEffect(() => {
        harness.initialize({ simulated: true });

        // Poll for logs (simple implementation)
        const interval = setInterval(() => {
            setLogs([...harness.events]);
        }, 500);

        return () => {
            clearInterval(interval);
            harness.destroy();
        };
    }, []);

    const runSuite = async (suite) => {
        setIsRunning(true);
        harness.log(`--- Starting Suite: ${suite.name} ---`);

        // Reset (Hacky reset for demo, ideally store has reset action)
        // uikitStore.setState({ widgets: [], links: [] });

        // Enable modules
        suite.modules.forEach(m => harness.enableModule(m));

        // Start Listening (Simulated)
        await harness.voice.start();

        // Run Script
        await harness.runScript(suite.steps);

        harness.log(`--- Suite Finished ---`);
        setIsRunning(false);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', height: '100vh', background: '#111', color: 'white' }}>

            {/* Left: Controls */}
            <div style={{ padding: 20, borderRight: '1px solid #333' }}>
                <h2>QA Lab 🧪</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button disabled={isRunning} onClick={() => runSuite(WIDGET_TEST_SUITE)}>
                        Run Widgets Suite
                    </button>
                    <button disabled={isRunning} onClick={() => runSuite(LINKS_TEST_SUITE)}>
                        Run Links Suite
                    </button>

                    <hr style={{ borderColor: '#333', width: '100%' }} />

                    <button onClick={() => {
                        const diag = harness.generateDiagnostics();
                        const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        window.open(url);
                    }}>Export Diagnostics JSON</button>
                </div>
            </div>

            {/* Center: Canvas */}
            <div style={{ padding: 20, background: '#000' }}>
                <h3>Live Canvas</h3>
                <WidgetCanvas />
            </div>

            {/* Right: Inspector */}
            <div style={{ padding: 10, borderLeft: '1px solid #333', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
                <h3>Event Log</h3>
                {logs.slice().reverse().map((l, i) => (
                    <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222', color: l.type === 'error' ? 'red' : '#888' }}>
                        [{new Date(l.timestamp).toLocaleTimeString()}] {l.type === 'LOG' ? l.payload : l.transcript || l.type}
                    </div>
                ))}
            </div>
        </div>
    );
}
