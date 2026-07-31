/**
 * Web Worker: on-device ASR via Transformers.js + Whisper tiny.
 * Used by LocalTransformersSpeechEngine (createVoice default path).
 *
 * LEAD: Peer @xenova/transformers required. Model default Xenova/whisper-tiny.en.
 * Guides: docs/LOCAL_BROWSER_WHISPER.md · docs/AI_IMPLEMENTATION.md
 * Runs off the main thread so UI stays responsive.
 *
 * Messages in:
 *   { type: 'init', data: { model, allowCdnFallback } }
 *   { type: 'process', data: Float32Array, sampleRate?, jobId? }
 *   { type: 'abort' }
 *   { type: 'dispose' }
 *
 * Messages out:
 *   { type: 'status', status: 'loading' | 'ready' }
 *   { type: 'progress', data }
 *   { type: 'result', transcript, isFinal, jobId? }
 *   { type: 'error', error, code? }
 */

let transcriber = null;
let pipelinePromise = null;
let currentJobId = null;
let aborted = false;

self.onmessage = async (event) => {
  const { type, data, sampleRate, jobId } = event.data || {};

  if (type === 'init') {
    await initializeModel(data || {});
  } else if (type === 'process') {
    currentJobId = jobId ?? null;
    aborted = false;
    await processAudio(data, sampleRate, jobId);
  } else if (type === 'abort') {
    aborted = true;
    currentJobId = null;
  } else if (type === 'dispose') {
    aborted = true;
    transcriber = null;
    pipelinePromise = null;
    currentJobId = null;
  }
};

async function initializeModel(config = {}) {
  try {
    let pipeline;
    let env;

    try {
      const module = await import('@xenova/transformers');
      pipeline = module.pipeline;
      env = module.env;
    } catch (e) {
      if (config.allowCdnFallback) {
        try {
          const module = await import(
            /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
          );
          pipeline = module.pipeline;
          env = module.env;
        } catch (cdnErr) {
          postMessage({
            type: 'error',
            code: 'TRANSFORMERS_MISSING',
            error:
              'Transformers.js not found. Install optional peer @xenova/transformers for local ASR: npm install @xenova/transformers',
          });
          return;
        }
      } else {
        postMessage({
          type: 'error',
          code: 'TRANSFORMERS_MISSING',
          error:
            'Transformers.js not found. Install optional peer @xenova/transformers for local ASR: npm install @xenova/transformers',
        });
        return;
      }
    }

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    if (!pipelinePromise) {
      postMessage({ type: 'status', status: 'loading' });

      const modelId = config.model || 'Xenova/whisper-tiny.en';

      pipelinePromise = pipeline('automatic-speech-recognition', modelId, {
        progress_callback: (progressData) => {
          postMessage({ type: 'progress', data: progressData });
        },
      });

      transcriber = await pipelinePromise;
      postMessage({ type: 'status', status: 'ready' });
    } else {
      if (!transcriber) {
        transcriber = await pipelinePromise;
      }
      postMessage({ type: 'status', status: 'ready' });
    }
  } catch (err) {
    pipelinePromise = null;
    transcriber = null;
    postMessage({
      type: 'error',
      code: 'MODEL_INIT_FAILED',
      error: err?.message || String(err),
    });
  }
}

async function processAudio(audioData, sampleRate = 16000, jobId) {
  if (!transcriber) {
    postMessage({
      type: 'error',
      code: 'MODEL_NOT_READY',
      error: 'Model not initialized',
      jobId,
    });
    return;
  }

  if (aborted || (jobId != null && jobId !== currentJobId)) {
    return;
  }

  try {
    // Transformers.js Whisper expects Float32Array PCM (prefer 16 kHz)
    const input =
      audioData instanceof Float32Array
        ? audioData
        : new Float32Array(audioData);

    const result = await transcriber(input, {
      chunk_length_s: 30,
      stride_length_s: 5,
      task: 'transcribe',
      return_timestamps: false,
      // sample_rate is accepted by some versions via object form; array is fine at 16k
    });

    if (aborted || (jobId != null && jobId !== currentJobId)) {
      return;
    }

    const text = (result?.text || '').trim();
    if (text.length > 0) {
      postMessage({
        type: 'result',
        transcript: text,
        isFinal: true,
        jobId,
      });
    } else {
      postMessage({
        type: 'result',
        transcript: '',
        isFinal: true,
        jobId,
      });
    }
  } catch (err) {
    if (aborted) return;
    postMessage({
      type: 'error',
      code: 'TRANSCRIBE_FAILED',
      error: err?.message || String(err),
      jobId,
    });
  }
}
