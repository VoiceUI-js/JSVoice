import { createVoice } from 'jsvoice';
import { FakeSpeechEngine } from './FakeSpeechEngine';

// Plugins Import Map
import WidgetPlugin from 'jsvoice/ui-kit/modules/widgets';
import RulesPlugin from 'jsvoice/ui-kit/modules/rules';
import LinksPlugin from 'jsvoice/ui-kit/modules/links';
import ConstraintsPlugin from 'jsvoice/ui-kit/modules/constraints';
import BookmarksPlugin from 'jsvoice/ui-kit/modules/bookmarks';
import SummariesPlugin from 'jsvoice/ui-kit/modules/summaries';
import VoiceModePlugin from 'jsvoice/ui-kit/modules/voice-mode';
import UndoPlugin from 'jsvoice/ui-kit/modules/undo';
import RepairPlugin from 'jsvoice/ui-kit/modules/repair';

// Central Harness Class
export class VoiceHarness {
    constructor(store = null) {
        this.voice = null;
        this.fakeEngine = new FakeSpeechEngine();
        this.events = [];
        this.snapshots = [];
        this.activeListeners = [];
        this.store = store; // Optional: uikitStore
    }

    initialize(config = { simulated: true }) {
        if (this.voice) {
            this.destroy(); // rigorous cleanup
        }

        const options = {
            debug: true,
            autoRestart: false
        };

        if (config.simulated) {
            options.engine = this.fakeEngine; // Injection
        }

        this.voice = createVoice(options);

        // Spy on events
        const unsub = this.voice.subscribe((state, event) => {
            if (event) {
                this.events.push({ ...event, timestamp: Date.now() });
            }
        });
        this.activeListeners.push(unsub);

        return this.voice;
    }

    enableModule(name) {
        if (!this.voice) return;
        const map = {
            'widgets': WidgetPlugin,
            'rules': RulesPlugin,
            'links': LinksPlugin,
            'constraints': ConstraintsPlugin,
            'bookmarks': BookmarksPlugin,
            'summaries': SummariesPlugin,
            'voice-mode': VoiceModePlugin,
            'undo': UndoPlugin,
            'repair': RepairPlugin
        };
        const plugin = map[name];
        if (plugin) {
            this.voice.use(plugin);
            this.log(`Enabled module: ${name}`);
        } else {
            console.error(`Unknown module: ${name}`);
        }
    }

    async runScript(steps) {
        this.log('Starting script execution...');
        for (const step of steps) {
            if (step.say) {
                this.log(`Action: Saying "${step.say}"`);
                if (this.fakeEngine.isListening) {
                    // Simulate partial then final for realism
                    this.fakeEngine.simulateTranscript(step.say, false);
                    await new Promise(r => setTimeout(r, 50));
                    this.fakeEngine.simulateTranscript(step.say, true);
                } else {
                    console.warn('Cannot speak, engine not listening');
                }
            }
            if (step.waitMs) {
                await new Promise(r => setTimeout(r, step.waitMs));
            }
            if (step.expect) {
                // Verification hook (would check store state)
            }
        }
        this.log('Script finished.');
    }

    destroy() {
        if (this.voice) {
            this.voice.stop();
            this.activeListeners.forEach(u => u());
            this.activeListeners = [];
            this.voice = null;
        }
    }

    log(msg) {
        this.events.push({ type: 'LOG', payload: msg, timestamp: Date.now() });
    }

    generateDiagnostics() {
        // Try to capture global store if available via some global or import (tricky if cleaner separation, but we can assume globals in demo)
        const storeSnapshot = typeof window !== 'undefined' ? window.localStorage.getItem('jv_kit_bookmarks') : null;

        return {
            timestamp: new Date().toISOString(),
            platform: {
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node',
                screen: typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight } : null,
                language: typeof navigator !== 'undefined' ? navigator.language : 'en-US'
            },
            voiceState: {
                listening: this.voice ? this.voice.isListening : false,
                engine: this.voice && this.voice.options ? this.voice.options.engine?.constructor.name : 'Unknown'
            },
            events: this.events.slice(-500),

            // Capture full store state if injected
            kitState: this.store ? this.store.getState() : 'Store not injected',

            memory: typeof performance !== 'undefined' && performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : 'Not available'
        };
    }
}
