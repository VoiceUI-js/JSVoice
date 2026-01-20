export class AudioVisualizer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphoneStream = null;
        this.source = null;
        this.animationId = null;
        this.options = {
            mode: 'bars', // 'bars' | 'waveform'
            barCount: 32,
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            updateIntervalMs: 0, // 0 = use requestAnimationFrame
        };
        this.callback = null;
        this.lastUpdateTime = 0;
    }

    async start(callback, options = {}) {
        this.stop(); // Stop any existing session
        this.callback = callback;
        this.options = { ...this.options, ...options };

        try {
            // FIX: Accept existing stream to avoid double-mic request
            if (options.stream) {
                this.microphoneStream = options.stream;
                this.ownsStream = false; // Don't stop tracks if we don't own it
            } else {
                this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                this.ownsStream = true;
            }

            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) {
                throw new Error('Web Audio API is not supported in this browser.');
            }

            // FIX: Reuse context if valid, or create new one
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

            // Configure Analyser
            this.analyser.fftSize = this.options.fftSize || 2048;
            this.analyser.smoothingTimeConstant =
                this.options.smoothingTimeConstant ?? 0.8;

            this.source.connect(this.analyser);

            this._startLoop();
        } catch (error) {
            console.error('[JSVoice] AudioVisualizer Error:', error);
            // Ensure cleanup on error
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
            } catch (e) { /* ignore */ }
            this.source = null;
        }

        if (this.analyser) {
            try {
                this.analyser.disconnect();
            } catch (e) { /* ignore */ }
            this.analyser = null;
        }

        if (this.microphoneStream && this.ownsStream) {
            this.microphoneStream.getTracks().forEach((track) => track.stop());
        }
        this.microphoneStream = null;
        // this.ownsStream = false; // logic reset not strictly needed if we check null 

        // Optimally, we KEEP the audioContext alive if we plan to reuse it, 
        // OR close it to save resources. For a library, closing is safer to avoid limit.
        if (this.audioContext && this.audioContext.state !== 'closed') {
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
            // Safety check
            if (!this.analyser || !this.callback) return;

            // Throttle if updateIntervalMs is set
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

            // Process and normalize data
            const normalizedData = this._processData(dataArray);

            this.callback(normalizedData);
            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    _processData(dataArray) {
        // If user wants raw data (barCount matches data length), just normalize
        if (!this.options.barCount || this.options.barCount >= dataArray.length) {
            return Array.from(dataArray).map((val) => val / 255);
        }

        // Downsample / Binning
        const step = Math.floor(dataArray.length / this.options.barCount);
        const result = [];

        for (let i = 0; i < this.options.barCount; i++) {
            let sum = 0;
            const start = i * step;
            const end = start + step;

            for (let j = start; j < end; j++) {
                sum += dataArray[j];
            }

            // Average value for this bin, normalized to 0-1
            const avg = sum / step;
            result.push(avg / 255);
        }

        return result;
    }
}
