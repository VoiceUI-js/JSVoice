import { microphoneManager } from './MicrophoneManager.js';

export class AudioVisualizer {
    audioContext = null;
    analyser = null;
    microphoneStream = null;
    source = null;
    animationId = null;
    options = {
        mode: 'bars', // 'bars' | 'waveform'
        barCount: 32,
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        updateIntervalMs: 0, // 0 = use requestAnimationFrame
    };
    callback = null;
    lastUpdateTime = 0;
    consumerId = 'visualizer_' + Math.random().toString(36).substring(2, 11);

    constructor() {
    }

    async start(callback, options = {}) {
        this.stop(); // Stop any existing session
        this.callback = callback;
        this.options = { ...this.options, ...options };

        try {
            // Priority: Explicit stream -> MicrophoneManager -> navigator (fallback)
            if (options.stream) {
                this.microphoneStream = options.stream;
                this.ownsStream = false;
            } else {
                // Use Shared Manager
                this.microphoneStream = await microphoneManager.getStream(this.consumerId);
                this.ownsStream = false; // Manager owns it
            }

            const AudioContextCtor = globalThis.window.AudioContext || globalThis.window.webkitAudioContext;
            if (!AudioContextCtor) {
                throw new Error('Web Audio API is not supported in this browser.');
            }

            if (!this.audioContext || this.audioContext.state === 'closed') {
                this.audioContext = new AudioContextCtor();
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.source = this.audioContext.createMediaStreamSource(
                this.microphoneStream
            );
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = this.options.fftSize || 2048;
            this.analyser.smoothingTimeConstant =
                this.options.smoothingTimeConstant ?? 0.8;

            this.source.connect(this.analyser);

            this._startLoop();
        } catch (error) {
            console.error('[JSVoice] AudioVisualizer Error:', error);
            this.stop();
            throw error;
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.source) {
            try {
                this.source.disconnect();
            } catch (e) {
                // Ignore disconnect error if already disconnected
            }
            this.source = null;
        }

        if (this.analyser) {
            try {
                this.analyser.disconnect();
            } catch (e) {
                // Ignore disconnect error
            }
            this.analyser = null;
        }

        // Release stream via manager
        if (this.microphoneStream) {
            // Note: If we passed an explicit stream (options.stream), we don't release it from manager
            // But we didn't track if it came from manager or options clearly enough above.
            // Improve: Manager.releaseStream only affects if we registered. 
            // Calling it with visualizer ID is safe.
            microphoneManager.releaseStream(this.consumerId);
            this.microphoneStream = null;
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            // Keep content open for performance? Or close?
            // Closing to be safe for resource limits.
            this.audioContext.close().catch((e) => console.warn(e));
            this.audioContext = null;
        }

        this.callback = null;
    }

    _startLoop() {
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const loop = (timestamp) => {
            if (!this.analyser || !this.callback) return;

            if (this.options.updateIntervalMs > 0) {
                if (timestamp - this.lastUpdateTime < this.options.updateIntervalMs) {
                    this.animationId = requestAnimationFrame(loop);
                    return;
                }
                this.lastUpdateTime = timestamp;
            }

            if (this.options.mode === 'waveform') {
                this.analyser.getByteTimeDomainData(dataArray);
            } else {
                this.analyser.getByteFrequencyData(dataArray);
            }

            const normalizedData = this._processData(dataArray);

            this.callback(normalizedData);
            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    _processData(dataArray) {
        if (!this.options.barCount || this.options.barCount >= dataArray.length) {
            return Array.from(dataArray).map((val) => val / 255);
        }

        const step = Math.floor(dataArray.length / this.options.barCount);
        const result = [];

        for (let i = 0; i < this.options.barCount; i++) {
            let sum = 0;
            const start = i * step;
            const end = start + step;

            for (let j = start; j < end; j++) {
                sum += dataArray[j];
            }

            const avg = sum / step;
            result.push(avg / 255);
        }

        return result;
    }
}
