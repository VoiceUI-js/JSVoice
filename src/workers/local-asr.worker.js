
// Web Worker for Local Speech Recognition using Transformers.js
// This runs off the main thread to prevent UI freezing.

let transcriber = null;
let pipelinePromise = null;

// Dynamic import for module environment
// User must ensure @xenova/transformers is installed
// or a CDN URL is used if preferred.
// import { pipeline, env } from '@xenova/transformers';

self.onmessage = async (event) => {
    const { type, data } = event.data;

    if (type === 'init') {
        await initializeModel(data);
    } else if (type === 'process') {
        await processAudio(data);
    }
};

async function initializeModel(config = {}) {
    try {
        // Fallback import if not bundled
        let pipeline, env;
        try {
            const module = await import('@xenova/transformers');
            pipeline = module.pipeline;
            env = module.env;
        } catch (e) {
            // CDN Callback if local import fails (optional fallback for 0-setup)
            // import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/transformers.min.js');
            postMessage({ type: 'error', error: 'Transformers.js not found. Please install @xenova/transformers' });
            return;
        }

        // Configure environment
        env.allowLocalModels = false; // Force CDN for "0 setup"
        env.useBrowserCache = true;

        if (!pipelinePromise) {
            postMessage({ type: 'status', status: 'loading' });

            pipelinePromise = pipeline('automatic-speech-recognition', config.model || 'Xenova/whisper-tiny.en', {
                progress_callback: (data) => {
                    postMessage({ type: 'progress', data });
                }
            });

            transcriber = await pipelinePromise;
            postMessage({ type: 'status', status: 'ready' });
        } else {
            postMessage({ type: 'status', status: 'ready' });
        }
    } catch (err) {
        postMessage({ type: 'error', error: err.message });
    }
}

async function processAudio(audioData) {
    if (!transcriber) {
        postMessage({ type: 'error', error: 'Model not initialized' });
        return;
    }

    try {
        // Run transcription
        // audioData should be Float32Array
        const result = await transcriber(audioData, {
            chunk_length_s: 30, // Default for Whisper
            stride_length_s: 5,
            task: 'transcribe',
            return_timestamps: false
        });

        const text = result.text || '';
        if (text.trim().length > 0) {
            postMessage({ type: 'result', transcript: text.trim(), isFinal: true });
        }
    } catch (err) {
        postMessage({ type: 'error', error: err.message });
    }
}
