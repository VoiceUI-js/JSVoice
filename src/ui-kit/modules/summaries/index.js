import { uikitStore } from '../../core/store.js';

export default function summariesPlugin(voice) {
    voice.addCommand('summarize events', () => {
        const events = uikitStore.getState().events;
        const count = events.length;
        const last = events[events.length - 1]?.msg || 'nothing';
        // Heuristic summary
        voice.speak(`There are ${count} events. The last one was: ${last}.`);
    });

    voice.addPatternCommand('summarize last {n} events', ({ n }) => {
        const num = parseInt(n) || 5;
        const events = uikitStore.getState().events.slice(-num);
        if (events.length === 0) {
            voice.speak('No recent events found.');
        } else {
            voice.speak(`Last ${num} events: ` + events.map(e => e.msg).join(', '));
        }
    });
}
