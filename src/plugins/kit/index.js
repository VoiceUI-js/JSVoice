/**
 * @jsvoice/plugins/kit
 * Core logic for the Voice UI Kit features.
 * Registers voice commands that drive the KitStore.
 */
import { KitActions, kitStore } from '../../react/kit/store.js';

export default function VoiceKitPlugin(voice, options = {}) {

    // 1. Emotion/Intent
    voice.addCommand('calm mode', () => KitActions.setIntent('calm'));
    voice.addCommand('urgent mode', () => KitActions.setIntent('urgent'));
    voice.addCommand('emergency mode', () => KitActions.setIntent('emergency'));
    voice.addCommand('quiet workspace', () => KitActions.setIntent('quiet'));
    voice.addCommand('normal mode', () => KitActions.setIntent('neutral'));

    // 2. Time-boxed
    voice.addCommand('focus for {minutes:int} minutes', ({ minutes }) => {
        KitActions.startFocus(minutes);
        voice.speak(`Focusing for ${minutes} minutes.`);
    });
    voice.addCommand('stop focus', () => {
        KitActions.startFocus(0); // logic handles disable
        voice.speak('Focus mode ended.');
    });

    // 3. Confirmation Safety
    // This requires intercepting specific commands.
    // Example: "Delete X" -> Triggers confirmation UI.
    // Actual confirmation logic ("confirm", "cancel") is handled by the Global Confirmation manager.

    voice.addCommand('confirm', () => {
        KitActions.resolveConfirmation(true);
        voice.speak('Confirmed.');
    });

    voice.addCommand('cancel', () => {
        KitActions.resolveConfirmation(false);
        voice.speak('Cancelled.');
    });

    // 4. History
    voice.addCommand('undo last command', () => {
        const history = kitStore.getState().history;
        if (history.length > 0) {
            voice.speak('Undoing last action.');
            // In a real app, you'd trigger an actual undo via a callback. 
            // Here we just mark the history item.
            KitActions.addToHistory({ command: 'undo', status: 'meta' });
        }
    });

    // 5. Visibility (Existing...)
    voice.addCommand('show advanced options', () => KitActions.toggleVisibility('advanced', true));
    voice.addCommand('hide advanced options', () => KitActions.toggleVisibility('advanced', false));
    voice.addCommand('show debug info', () => KitActions.toggleVisibility('debug', true));
    voice.addCommand('hide debug info', () => KitActions.toggleVisibility('debug', false));

    // 6. Layout
    voice.addCommand('move panel left', () => {
        // Simple rotation for demo
        const { panelOrder } = kitStore.getState().layout;
        const newOrder = [...panelOrder.slice(1), panelOrder[0]];
        KitActions.setLayoutOrder(newOrder);
    });
    voice.addCommand('reset layout', () => KitActions.setLayoutOrder(['a', 'b', 'c']));

    // 7. Filters (Existing...)
    voice.addCommand('filter by {text}', ({ text }) => KitActions.setFilter(text));
    voice.addCommand('show only errors', () => KitActions.setFilter('error'));
    voice.addCommand('clear filters', () => KitActions.setFilter('clear'));

    // 11. UI Snapshots
    voice.addCommand('save snapshot', () => {
        KitActions.saveSnapshot('Auto Save ' + new Date().toLocaleTimeString());
        voice.speak('Snapshot saved.');
    });
    voice.addCommand('load snapshot {name}', ({ name }) => {
        KitActions.loadSnapshot(name); // Logic to match closest would be cool
        voice.speak(`Loading snapshot ${name}`);
    });

    // 13. Training Mode
    voice.addCommand('teach me', () => {
        KitActions.toggleVisibility('training', true);
        voice.speak('Training mode active. I will suggest commands.');
    });

    // 14. Habits
    voice.addCommand('remember this layout', () => {
        KitActions.setHabit('layout', kitStore.getState().layout);
        voice.speak('Layout preference saved.');
    });

    // 8. Simulation
    voice.addCommand('simulate offline', () => KitActions.setSimulation('offline', true));
    voice.addCommand('simulate mic blocked', () => KitActions.setSimulation('micBlocked', true));
    voice.addCommand('reset simulation', () => {
        KitActions.setSimulation('offline', false);
        KitActions.setSimulation('micBlocked', false);
    });

    // 9. Tour
    voice.addCommand('start tour', () => { KitActions.startTour(); voice.speak('Starting tour.'); });
    voice.addCommand('next', () => KitActions.nextTourStep());
    voice.addCommand('stop tour', () => KitActions.stopTour());

    // 10. Profiles
    voice.addCommand('debug mode', () => KitActions.setProfile('debug'));
    voice.addCommand('presentation mode', () => KitActions.setProfile('presentation'));

    // 12. Attention
    voice.addCommand('focus on {panel}', ({ panel }) => KitActions.setSpotlight(panel));
    voice.addCommand('reset focus', () => KitActions.setSpotlight(null));

    // 15. Modality
    voice.addCommand('hands free mode', () => KitActions.setModality('hands-free'));
    voice.addCommand('keyboard mode', () => KitActions.setModality('keyboard'));


    // Telemetry Hook for History
    // We hook into the voice instance's telemetry stream to populate history
    const originalTelemetry = voice.options.onTelemetry || (() => { });
    voice.setOption('onTelemetry', (evt) => {
        if (evt.type === 'command_evaluated' && evt.matched) {
            KitActions.addToHistory({
                command: evt.transcript,
                status: 'success',
                confidence: evt.confidence
            });
        }
        originalTelemetry(evt);
    });
}
