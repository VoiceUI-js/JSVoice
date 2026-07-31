/**
 * AudioWorklet processor source (loaded via Blob URL from LocalTransformersSpeechEngine).
 * Posts copies of input PCM frames to the main thread.
 */
export const PCM_CAPTURE_WORKLET_SOURCE = `
class JsVoicePcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (input && input.length) {
      // Copy — AudioWorklet reuses the underlying buffer
      const copy = new Float32Array(input.length);
      copy.set(input);
      this.port.postMessage(copy, [copy.buffer]);
    }
    return true;
  }
}
registerProcessor('jsvoice-pcm-capture', JsVoicePcmCaptureProcessor);
`;

export const PCM_CAPTURE_PROCESSOR_NAME = 'jsvoice-pcm-capture';
