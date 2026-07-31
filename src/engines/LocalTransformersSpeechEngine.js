/**
 * LocalTransformersSpeechEngine — DEFAULT browser speech understander.
 *
 * LEAD (AI/integrators):
 *   - Model: Xenova/whisper-tiny.en (~30MB first load, then cached)
 *   - Peer:  npm i @xenova/transformers
 *   - Path:  Worker + AudioWorklet/VAD → final transcript (not streaming partials)
 *   - Used by createVoice() when engineMode is 'local' (default) or 'auto'
 *   - Import: jsvoice/engines/local
 *   - Guide:  docs/LOCAL_BROWSER_WHISPER.md · docs/AI_IMPLEMENTATION.md
 *   - NOT the same as jsvoice/engines/whisper (server API)
 */
import BaseSpeechEngine from './BaseSpeechEngine.js';
import { microphoneManager } from '../modules/MicrophoneManager.js';
import {
  PCM_CAPTURE_WORKLET_SOURCE,
  PCM_CAPTURE_PROCESSOR_NAME,
} from '../audio/pcm-capture-worklet.js';

const DEFAULT_MODEL = 'Xenova/whisper-tiny.en';
const TARGET_SAMPLE_RATE = 16000;

/**
 * On-device speech recognition via Transformers.js + Whisper tiny (English).
 * Default understander for any modern browser (Worker + WASM).
 */
class LocalTransformersSpeechEngine extends BaseSpeechEngine {
  constructor(options = {}) {
    super(options);

    this.worker = null;
    this.audioContext = null;
    this.mediaStreamSource = null;
    this.processor = null; // ScriptProcessorNode fallback
    this.workletNode = null;
    this.audioChunks = [];
    this.isProcessing = false;
    this._budgetTimer = null;
    this._modelReady = false;
    this._modelReadyPromise = null;
    this._modelReadyResolve = null;
    this._modelReadyReject = null;
    this._initStarted = false;
    this._jobId = 0;
    this._activeJobId = null;
    this._workletUrl = null;
    this._captureSampleRate = TARGET_SAMPLE_RATE;
    this._speechDetected = false;
    this._silenceStartedAt = null;
    this._vadRaf = null;
    this._pendingStart = false;
    this._downloadConfirmed = false;

    const vadIn = options.vad || {};
    this.options = {
      model: options.model || DEFAULT_MODEL,
      captureSampleRate: TARGET_SAMPLE_RATE,
      maxRecordMs: 15000,
      allowCdnFallback: false,
      requireUserConfirmOnSaveData: true,
      confirmModelDownload: options.confirmModelDownload ?? null,
      onModelLoadProgress: options.onModelLoadProgress || null,
      onTelemetry: options.onTelemetry || null,
      WorkerFactory: options.WorkerFactory || null,
      ...options,
      model: options.model || DEFAULT_MODEL,
      vad: {
        enabled: vadIn.enabled !== false,
        silenceMs: vadIn.silenceMs ?? 1200,
        energyThreshold: vadIn.energyThreshold ?? 0.02,
        minSpeechMs: vadIn.minSpeechMs ?? 200,
      },
    };

    this.onModelLoadProgress = this.options.onModelLoadProgress;

    if (typeof globalThis.window === 'undefined') return;
  }

  static get isSupported() {
    if (typeof globalThis.window === 'undefined') return false;
    const hasMedia =
      !!globalThis.navigator?.mediaDevices?.getUserMedia;
    const hasAudio =
      !!(globalThis.AudioContext || globalThis.webkitAudioContext);
    const hasWorker = typeof Worker !== 'undefined';
    const secure =
      typeof globalThis.isSecureContext === 'undefined'
        ? true
        : !!globalThis.isSecureContext;
    return hasMedia && hasAudio && hasWorker && secure;
  }

  static get defaultModel() {
    return DEFAULT_MODEL;
  }

  /**
   * Whether the device reports save-data / constrained network.
   */
  static shouldPromptForModelDownload() {
    try {
      const conn = globalThis.navigator?.connection;
      return !!(conn && (conn.saveData || conn.effectiveType === '2g'));
    } catch {
      return false;
    }
  }

  _emitTelemetry(e) {
    if (this.options.onTelemetry) this.options.onTelemetry(e);
  }

  _ensureReadyDeferred() {
    if (!this._modelReadyPromise) {
      this._modelReadyPromise = new Promise((resolve, reject) => {
        this._modelReadyResolve = resolve;
        this._modelReadyReject = reject;
      });
    }
    return this._modelReadyPromise;
  }

  async init() {
    if (!LocalTransformersSpeechEngine.isSupported) {
      throw new Error(
        'Local Whisper engine is not supported in this environment (need secure context, getUserMedia, AudioContext, Worker).'
      );
    }

    if (this._modelReady) return;

    // saveData gate
    if (
      this.options.requireUserConfirmOnSaveData &&
      LocalTransformersSpeechEngine.shouldPromptForModelDownload() &&
      !this._downloadConfirmed
    ) {
      if (typeof this.options.confirmModelDownload === 'function') {
        const ok = await this.options.confirmModelDownload();
        if (!ok) {
          const err = new Error(
            'Model download blocked: user declined download on a constrained network (saveData).'
          );
          err.code = 'MODEL_DOWNLOAD_DECLINED';
          throw err;
        }
        this._downloadConfirmed = true;
      } else if (this.options.confirmModelDownload === true) {
        this._downloadConfirmed = true;
      } else {
        const err = new Error(
          'Model download requires confirmation on save-data networks. Pass localOptions.confirmModelDownload = true or a confirm function.'
        );
        err.code = 'MODEL_DOWNLOAD_CONFIRM_REQUIRED';
        this._emitTelemetry({ type: 'model_download_confirm_required' });
        throw err;
      }
    }

    this._setupWorker();
    this.setState('loading');
    this._emitTelemetry({ type: 'model_load_start', model: this.options.model });

    await this._ensureReadyDeferred();
  }

  /** Host can confirm download (kit UI) then call init again */
  confirmDownload() {
    this._downloadConfirmed = true;
  }

  _setupWorker() {
    if (this.worker) return;

    this._ensureReadyDeferred();

    if (typeof this.options.WorkerFactory === 'function') {
      this.worker = this.options.WorkerFactory();
    } else {
      this.worker = this._createDefaultWorker();
    }

    this.worker.onmessage = (e) => this._onWorkerMessage(e.data || {});
    this.worker.onerror = (err) => {
      const message = err?.message || 'Local ASR worker error';
      this._failModel(message, 'WORKER_ERROR');
    };

    this.worker.postMessage({
      type: 'init',
      data: {
        model: this.options.model || DEFAULT_MODEL,
        allowCdnFallback: !!this.options.allowCdnFallback,
      },
    });
  }

  /**
   * Create the ASR module worker. Uses a runtime import.meta read so Jest/CJS
   * transforms do not choke on static `import.meta` syntax.
   */
  _createDefaultWorker() {
    let baseUrl;
    try {
      baseUrl = new Function('return import.meta.url')();
    } catch {
      baseUrl = undefined;
    }
    if (!baseUrl) {
      throw new Error(
        'Cannot resolve local ASR worker URL. Pass localOptions.WorkerFactory in tests, or use an ESM bundler.'
      );
    }
    const workerUrl = new URL('../workers/local-asr.worker.js', baseUrl);
    return new Worker(workerUrl, { type: 'module' });
  }

  _onWorkerMessage(msg) {
    const { type, data, transcript, error, isFinal, code, jobId } = msg;

    this._emitTelemetry({ type: 'worker_msg', msgType: type, code });

    switch (type) {
      case 'status':
        if (data === 'ready' || msg.status === 'ready') {
          this._modelReady = true;
          this.setState('ready');
          this._emitTelemetry({ type: 'model_ready', model: this.options.model });
          if (this._modelReadyResolve) {
            this._modelReadyResolve();
            this._modelReadyResolve = null;
            this._modelReadyReject = null;
          }
          if (this._pendingStart) {
            this._pendingStart = false;
            this.start().catch((err) => this.onError(err));
          }
        } else if (msg.status === 'loading') {
          this.setState('loading');
        }
        break;
      case 'progress': {
        const progress = data || msg;
        if (typeof this.onModelLoadProgress === 'function') {
          this.onModelLoadProgress(progress);
        }
        this._emitTelemetry({
          type: 'model_download_progress',
          progress: progress.progress,
          file: progress.file,
          status: progress.status,
        });
        break;
      }
      case 'result':
        if (this._activeJobId != null && jobId != null && jobId !== this._activeJobId) {
          return;
        }
        if (transcript) {
          this.onResult(transcript, isFinal !== false);
        }
        this._finishProcessing();
        break;
      case 'error':
        if (code === 'TRANSFORMERS_MISSING' || code === 'MODEL_INIT_FAILED') {
          this._failModel(error, code);
          return;
        }
        if (this._activeJobId != null && jobId != null && jobId !== this._activeJobId) {
          return;
        }
        this.onError({ error: code || 'LocalEngineError', message: error, code });
        this._finishProcessing();
        break;
      default:
        break;
    }
  }

  _failModel(message, code) {
    this._modelReady = false;
    this.setState('error');
    const err = new Error(message);
    err.code = code;
    if (this._modelReadyReject) {
      this._modelReadyReject(err);
      this._modelReadyResolve = null;
      this._modelReadyReject = null;
      this._modelReadyPromise = null;
    }
    this.onError({ error: code || 'LocalEngineError', message, code });
  }

  async start() {
    if (this.isListening) return;

    if (!this._modelReady) {
      this._pendingStart = true;
      try {
        await this.init();
      } catch (err) {
        this._pendingStart = false;
        this.onError(err);
        return;
      }
      if (!this._modelReady) {
        // Waiting for async worker ready (pending start will fire)
        return;
      }
    }

    try {
      const stream = await microphoneManager.acquire('local-engine', {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.state = 'listening';
      this.setState('listening');
      this.isListening = true;
      this.audioChunks = [];
      this._speechDetected = false;
      this._silenceStartedAt = null;
      this._speechStartedAt = null;

      const AudioContextCtor =
        globalThis.AudioContext || globalThis.webkitAudioContext;
      this.audioContext = new AudioContextCtor();
      this._captureSampleRate = this.audioContext.sampleRate;

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

      const workletOk = await this._tryStartWorkletCapture();
      if (!workletOk) {
        this._startScriptProcessorCapture();
      }

      this.onStart();
      this._emitTelemetry({
        type: 'local_listen_start',
        sampleRate: this._captureSampleRate,
        capture: workletOk ? 'worklet' : 'scriptprocessor',
      });

      if (this.options.maxRecordMs > 0) {
        this._budgetTimer = setTimeout(() => {
          if (this.isListening) {
            this._emitTelemetry({ type: 'max_record_reached' });
            this.stop();
          }
        }, this.options.maxRecordMs);
      }
    } catch (err) {
      this.isListening = false;
      this.setState('error');
      this.onError(err);
      microphoneManager.release('local-engine');
    }
  }

  async _tryStartWorkletCapture() {
    try {
      if (!this.audioContext.audioWorklet) return false;

      if (!this._workletUrl) {
        const blob = new Blob([PCM_CAPTURE_WORKLET_SOURCE], {
          type: 'application/javascript',
        });
        this._workletUrl = URL.createObjectURL(blob);
      }

      await this.audioContext.audioWorklet.addModule(this._workletUrl);
      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        PCM_CAPTURE_PROCESSOR_NAME
      );
      this.workletNode.port.onmessage = (event) => {
        if (!this.isListening) return;
        const frame = event.data;
        if (frame && frame.length) {
          this._handlePcmFrame(frame);
        }
      };
      this.mediaStreamSource.connect(this.workletNode);
      // Keep graph alive without audible output
      this.workletNode.connect(this.audioContext.destination);
      // Mute destination path by gain 0 if possible
      try {
        const gain = this.audioContext.createGain();
        gain.gain.value = 0;
        this.workletNode.disconnect();
        this.mediaStreamSource.connect(this.workletNode);
        this.workletNode.connect(gain);
        gain.connect(this.audioContext.destination);
        this._muteGain = gain;
      } catch {
        /* ignore */
      }
      return true;
    } catch (e) {
      this._emitTelemetry({
        type: 'worklet_fallback',
        message: e?.message || String(e),
      });
      return false;
    }
  }

  _startScriptProcessorCapture() {
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    this.processor.onaudioprocess = (e) => {
      if (!this.isListening) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this._handlePcmFrame(new Float32Array(inputData));
    };
    this.mediaStreamSource.connect(this.processor);
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    this.processor.connect(gain);
    gain.connect(this.audioContext.destination);
    this._muteGain = gain;
  }

  _handlePcmFrame(frame) {
    this.audioChunks.push(
      frame instanceof Float32Array ? frame : new Float32Array(frame)
    );

    if (!this.options.vad?.enabled) return;

    const rms = this._rms(frame);
    const now = Date.now();
    const threshold = this.options.vad.energyThreshold ?? 0.02;
    const silenceMs = this.options.vad.silenceMs ?? 1200;
    const minSpeechMs = this.options.vad.minSpeechMs ?? 200;

    if (rms >= threshold) {
      if (!this._speechDetected) {
        this._speechDetected = true;
        this._speechStartedAt = now;
        this._emitTelemetry({ type: 'vad_speech_start', rms });
      }
      this._silenceStartedAt = null;
    } else if (this._speechDetected) {
      if (this._silenceStartedAt == null) {
        this._silenceStartedAt = now;
      } else if (now - this._silenceStartedAt >= silenceMs) {
        const speechDur = now - (this._speechStartedAt || now);
        if (speechDur >= minSpeechMs) {
          this._emitTelemetry({ type: 'vad_speech_end', duration: speechDur });
          this.stop();
        }
      }
    }
  }

  _rms(frame) {
    let sum = 0;
    for (let i = 0; i < frame.length; i++) {
      const v = frame[i];
      sum += v * v;
    }
    return Math.sqrt(sum / (frame.length || 1));
  }

  /**
   * Downsample arbitrary rate PCM to 16 kHz mono for Whisper.
   */
  _resampleTo16k(input, inputRate) {
    if (inputRate === TARGET_SAMPLE_RATE) return input;
    if (!inputRate || input.length === 0) return input;

    const ratio = inputRate / TARGET_SAMPLE_RATE;
    const outLength = Math.max(1, Math.floor(input.length / ratio));
    const output = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const srcIndex = i * ratio;
      const i0 = Math.floor(srcIndex);
      const i1 = Math.min(i0 + 1, input.length - 1);
      const t = srcIndex - i0;
      output[i] = input[i0] * (1 - t) + input[i1] * t;
    }
    return output;
  }

  async stop() {
    if (this._budgetTimer) {
      clearTimeout(this._budgetTimer);
      this._budgetTimer = null;
    }

    if (!this.isListening && !this.isProcessing) return;

    if (!this.isListening) return;

    this.isListening = false;
    this.setState('processing');
    this.isProcessing = true;

    this._cleanupAudioNodes();
    microphoneManager.release('local-engine');

    const totalLength = this.audioChunks.reduce((acc, c) => acc + c.length, 0);
    if (totalLength === 0) {
      this._finishProcessing();
      return;
    }

    const fullBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioChunks) {
      fullBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    this.audioChunks = [];

    const pcm16k = this._resampleTo16k(fullBuffer, this._captureSampleRate);
    this._activeJobId = ++this._jobId;

    if (!this.worker) {
      this.onError({
        error: 'LocalEngineError',
        message: 'Worker not available',
        code: 'WORKER_MISSING',
      });
      this._finishProcessing();
      return;
    }

    this.worker.postMessage(
      {
        type: 'process',
        data: pcm16k,
        sampleRate: TARGET_SAMPLE_RATE,
        jobId: this._activeJobId,
      },
      [pcm16k.buffer]
    );
  }

  _finishProcessing() {
    this.isProcessing = false;
    this._activeJobId = null;
    this.setState('idle');
    this.onEnd();
  }

  _cleanupAudioNodes() {
    try {
      if (this.workletNode) {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
        this.workletNode = null;
      }
      if (this.processor) {
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
        this.processor = null;
      }
      if (this._muteGain) {
        this._muteGain.disconnect();
        this._muteGain = null;
      }
      if (this.mediaStreamSource) {
        this.mediaStreamSource.disconnect();
        this.mediaStreamSource = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    } catch {
      /* ignore cleanup races */
    }
  }

  abort() {
    this._pendingStart = false;
    this.isListening = false;
    if (this._budgetTimer) {
      clearTimeout(this._budgetTimer);
      this._budgetTimer = null;
    }
    if (this.worker) {
      this.worker.postMessage({ type: 'abort' });
    }
    this._activeJobId = null;
    this._cleanupAudioNodes();
    microphoneManager.release('local-engine');
    this.isProcessing = false;
    this.setState('idle');
  }

  dispose() {
    this.abort();
    if (this.worker) {
      try {
        this.worker.postMessage({ type: 'dispose' });
        this.worker.terminate();
      } catch {
        /* ignore */
      }
      this.worker = null;
    }
    if (this._workletUrl) {
      try {
        URL.revokeObjectURL(this._workletUrl);
      } catch {
        /* ignore */
      }
      this._workletUrl = null;
    }
    this._modelReady = false;
    this._modelReadyPromise = null;
  }

  setOptions(options) {
    super.setOptions(options);
    if (options.onModelLoadProgress) {
      this.onModelLoadProgress = options.onModelLoadProgress;
    }
    if (options.vad) {
      this.options.vad = { ...this.options.vad, ...options.vad };
    }
  }
}

export default LocalTransformersSpeechEngine;
