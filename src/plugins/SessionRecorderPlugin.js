/**
 * Session Recorder Plugin
 * Records all voice events, engine states, and command executions for replay/debugging.
 */
export default function SessionRecorderPlugin(voice, options = {}) {
    const config = {
        maxEvents: 1000,
        autoExportOnError: false,
        ...options
    };

    const session = {
        startTime: Date.now(),
        events: []
    };

    // We can hook into the global telemetry if available, 
    // or we'd need to monkeypatch if telemetry isn't enough.
    // Telemetry covers almost everything now in v2.4.

    const originalTelemetry = voice.options.onTelemetry || (() => { });

    // Inject recorder hook
    voice.setOption('onTelemetry', (evt) => {
        // Record
        if (session.events.length < config.maxEvents) {
            session.events.push({
                t: Date.now() - session.startTime,
                ...evt
            });
        }

        // Pass through
        originalTelemetry(evt);
    });

    voice.recorder = {
        getEvents: () => session.events,
        clear: () => {
            session.events = [];
            session.startTime = Date.now();
        },
        exportJSON: () => {
            const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
            return URL.createObjectURL(blob);
        },
        download: (filename = 'voice-session.json') => {
            const url = voice.recorder.exportJSON();
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        }
    };

    console.log('[JSVoice] Session Recorder Active');
}
