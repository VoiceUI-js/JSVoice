
import JSVoice from '../src/index.js'; // or 'jsvoice'

// 1. Default Auto Mode (Recommended)
// Tries Native (Web Speech API) first.
// Falls back to Local (Transformers.js) if Native fails or is unsupported (e.g. Firefox).
const voice = new JSVoice({
    onStatusChange: (msg) => console.log('Status:', msg),
    onEngineChange: ({ from, to, reason }) => {
        console.log(`Switched engine from ${from} to ${to} due to: ${reason}`);
    }
});

await voice.start();

// 2. Force Local Mode (Zero-Rupee, Private, Offline)
// Uses Transformers.js (Whisper Tiny) in-browser.
// Note: First run downloads the model (~30MB).
const privateVoice = new JSVoice({
    engineMode: 'local',
    localOptions: {
        model: 'Xenova/whisper-tiny.en', // Customize model
        device: 'webgpu' // or 'wasm'
    },
    onModelLoadProgress: (progress) => {
        console.log(`Loading AI Model: ${progress.status} ${progress.progress || ''}%`);
    }
});

// 3. Manual Engine Switching
// You can switch modes at runtime
document.getElementById('toggle-engine').onclick = async () => {
    const current = voice.options.engine.activeEngine.constructor.name;
    if (current.includes('Native')) {
        console.log('Switching to Local/Private Mode...');
        await voice.options.engine._setEngine('local');
    } else {
        console.log('Switching to Native/Online Mode...');
        await voice.options.engine._setEngine('native');
    }
};

// 4. Using the Visualizer (Safe with Hybrid Engine)
import { AudioVisualizer } from '../src/index.js';

const visualizer = new AudioVisualizer();
voice.use(() => {
    // Hook into voice start
    voice.startAmplitude((data) => {
        // Draw visualization...
    });
});
