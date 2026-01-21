import BaseSpeechEngine from './BaseSpeechEngine.js';
import { microphoneManager } from '../modules/MicrophoneManager.js';

class LocalTransformersSpeechEngine extends BaseSpeechEngine {
    constructor(options = {}) {
        super(options);

        this.worker = null;
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.processor = null;
        this.audioChunks = [];
        this.isProcessing = false;

        this.options = {
            model: 'Xenova/whisper-tiny.en',
            modelStrategy: 'auto', // 'auto' | 'fast' (tiny) | 'accurate' (base)
            device: 'webgpu',
            captureSampleRate: 16000,
            maxRecordMs: 15000,
            ...options
        };

        if (typeof window === 'undefined') return;
        this._initStrategy();
    }

    async _initStrategy() {
        if (this.options.modelStrategy === 'auto') {
            // Simple heuristic detection
            const hasWebGPU = navigator.gpu;
            const isMobile = navigator.userAgent.includes('Mobile');

            if (hasWebGPU && !isMobile) {
                console.log('[LocalEngine] WebGPU desktop detected. Upgrading to Base model.');
                this.options.model = 'Xenova/whisper-base.en';
            } else {
                console.log('[LocalEngine] Mobile or no WebGPU. Accessing Tiny model.');
                this.options.model = 'Xenova/whisper-tiny.en';
            }
        } else if (this.options.modelStrategy === 'accurate') {
            this.options.model = 'Xenova/whisper-base.en';
        }

        this._setupWorker();
    }

    _setupWorker() {
        this.worker = new Worker(new URL('../workers/local-asr.worker.js', import.meta.url), { type: 'module' });

        this.worker.onmessage = (e) => {
            const { type, data, status, transcript, error, isFinal } = e.data;

            this._emitTelemetry({ type: 'worker_msg', msgType: type });

            switch (type) {
                case 'status':
                    // ready
                    break;
                case 'progress':
                    if (this.onModelLoadProgress) {
                        this.onModelLoadProgress(data);
                        this._emitTelemetry({ type: 'model_download_progress', progress: data.progress, file: data.file });
                    }
                    break;
                case 'result':
                    if (transcript) {
                        this.onResult(transcript, isFinal || true);
                    }
                    this._finishProcessing();
                    break;
                case 'error':
                    this.onError({ error: 'LocalEngineError', message: error });
                    this._finishProcessing();
                    break;
            }
        };

        this.worker.postMessage({
            type: 'init',
            data: { model: this.options.model }
        });
    }

    async start() {
        if (this.isListening) return;

        try {
            // Ref-Counted Acquire
            const stream = await microphoneManager.acquire('local-engine', {
                audio: { sampleRate: this.options.captureSampleRate }
            });

            this.state = 'listening';
            this.setState('listening');
            this.isListening = true;
            this.audioChunks = [];

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.options.captureSampleRate
            });

            this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                if (!this.isListening) return;
                const inputData = e.inputBuffer.getChannelData(0);
                this.audioChunks.push(new Float32Array(inputData));

                // Max Duration Guard
                // (Simplified: assuming ~4096 samples at 16k is ~0.25s per chunk)
                // Better to track time.
            };

            this.mediaStreamSource.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.onStart();

            // Budget Timer
            if (this.options.maxRecordMs > 0) {
                this._budgetTimer = setTimeout(() => {
                    console.log('[LocalEngine] Max duration reached.');
                    this.stop();
                }, this.options.maxRecordMs);
            }

        } catch (err) {
            console.error('[LocalEngine] Start error:', err);
            this.onError(err);
        }
    }

    async stop() {
        if (this._budgetTimer) clearTimeout(this._budgetTimer);
        if (!this.isListening) return;

        this.isListening = false;
        this.setState('processing');
        this.isProcessing = true;

        this._cleanupAudioNodes();

        // Release Mic Immediately
        microphoneManager.release('local-engine');

        // Process
        const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const fullBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of this.audioChunks) {
            fullBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        if (totalLength === 0) {
            this._finishProcessing();
            return;
        }

        this.worker.postMessage({
            type: 'process',
            data: fullBuffer
        });
    }

    _finishProcessing() {
        this.isProcessing = false;
        this.setState('idle');
        this.onEnd(); // Only emit end after processing done
    }

    _cleanupAudioNodes() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    abort() {
        // Hard Stop
        this.isListening = false;
        if (this._budgetTimer) clearTimeout(this._budgetTimer);
        this._cleanupAudioNodes();
        microphoneManager.release('local-engine');
        this.setState('idle');
    }

    _emitTelemetry(e) {
        if (this.options.onTelemetry) this.options.onTelemetry(e);
    }
}

export default LocalTransformersSpeechEngine;
