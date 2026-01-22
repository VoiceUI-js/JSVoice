import { microphoneManager } from '../modules/MicrophoneManager.js';

/**
 * Energy-based Voice Activity Detection (VAD) Plugin
 * Detects speech start/end and can auto-endpoint (stop listening) on silence.
 * 
 * Usage:
 * voice.use(VadPlugin, { 
 *   autoEndpoint: true, 
 *   silenceMs: 2000, 
 *   energyThreshold: 0.05 
 * });
 */
export default function VadPlugin(voice, options = {}) {
    const config = {
        enabled: true,
        autoEndpoint: false, // If true, calls voice.stop() after silence
        silenceMs: 2000,     // Duration of silence to trigger endpoint
        energyThreshold: 0.05, // RMS threshold (0.0 - 1.0)
        updateInterval: 50,    // check every 50ms
        ...options
    };

    let audioContext = null;
    let analyser = null;
    let source = null;
    let intervalId = null;
    let silenceStart = null;
    let isSpeaking = false;

    // Hook into JSVoice Start
    const originalStart = voice.start;
    voice.start = async () => {
        const result = await originalStart.call(voice);
        if (result && config.enabled) {
            startVAD();
        }
        return result;
    };

    // Hook into JSVoice Stop
    const originalStop = voice.stop;
    voice.stop = () => {
        stopVAD();
        return originalStop.call(voice);
    };

    async function startVAD() {
        if (voice.options.onTelemetry) {
            voice.options.onTelemetry({ type: 'vad_state', state: 'active' });
        }

        try {
            // Use MicrophoneManager to share stream
            // NOTE: Acquiring 'vad' owner.
            const stream = await microphoneManager.acquire('vad');

            const AudioContextCtor = globalThis.window.AudioContext || globalThis.window.webkitAudioContext;
            audioContext = new AudioContextCtor();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.4;

            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            intervalId = setInterval(processVadFrame, config.updateInterval);

        } catch (e) {
            console.error('[JSVoice-VAD] Error starting VAD:', e);
        }
    }

    function processVadFrame() {
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        const rms = calculateRMS(dataArray);

        // State Logic
        if (rms > config.energyThreshold) {
            handleSpeechDetected(rms);
        } else {
            handleSilence();
        }
    }

    function handleSpeechDetected(rms) {
        // Speech detected
        if (!isSpeaking) {
            isSpeaking = true;
            if (voice.options.onTelemetry) {
                voice.options.onTelemetry({ type: 'vad_speech_start', rms });
            }
        }
        silenceStart = null;
    }

    function handleSilence() {
        // Silence
        if (isSpeaking) {
            if (!silenceStart) silenceStart = Date.now();

            const duration = Date.now() - silenceStart;
            if (duration > config.silenceMs) {
                isSpeaking = false;
                if (voice.options.onTelemetry) {
                    voice.options.onTelemetry({ type: 'vad_speech_end', duration });
                }

                if (config.autoEndpoint) {
                    console.log('[JSVoice] VAD Auto-Endpoint triggered.');
                    voice.stop();
                }
            }
        }
    }

    function stopVAD() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        if (source) {
            source.disconnect();
            source = null;
        }
        if (analyser) {
            analyser.disconnect();
            analyser = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        microphoneManager.release('vad');

        if (voice.options.onTelemetry) {
            voice.options.onTelemetry({ type: 'vad_state', state: 'stopped' });
        }
    }

    function calculateRMS(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            // Normalize 0-255 -> -1 to 1
            const val = (data[i] - 128) / 128;
            sum += val * val;
        }
        return Math.sqrt(sum / data.length);
    }
}
