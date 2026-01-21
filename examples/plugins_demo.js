
// Import Core
import JSVoice from '../src/index.js'; // or 'jsvoice'

// Import Plugins (Tree-shakable)
import VadPlugin from '../src/plugins/VadPlugin.js';
import HotkeysPlugin from '../src/plugins/HotkeysPlugin.js';
import FuzzyMatchPlugin from '../src/plugins/FuzzyMatchPlugin.js';
import HelpPlugin from '../src/plugins/HelpPlugin.js';
import { NavigationPack } from '../src/packs/basic.js';

// Initialize
const voice = new JSVoice({
    debug: true,
    onTelemetry: (evt) => console.log('[Telemetry]:', evt.type, evt)
});

// 1. Voice Activity Detection (Auto Endpointing)
voice.use(VadPlugin, {
    autoEndpoint: true,
    silenceMs: 2500, // Stop after 2.5s silence
    energyThreshold: 0.1
});

// 2. Hotkeys (Push-to-Talk)
voice.use(HotkeysPlugin, {
    triggerKey: 'Space', // Hold Space to talk
    toggleKey: 'Control+M' // Toggle Mic
});

// 3. Fuzzy Matching
voice.use(FuzzyMatchPlugin, {
    threshold: 0.85,
    synonyms: {
        'start music': ['play song', 'hit it', 'jam'],
        'stop': ['halt', 'end', 'silence']
    }
});

// 4. Help Command
voice.use(HelpPlugin, {
    trigger: 'what can I say',
    readAloud: true
});

// 5. Load Command Packs
voice.use(NavigationPack);

// Start
document.getElementById('start-btn').onclick = () => voice.start();
