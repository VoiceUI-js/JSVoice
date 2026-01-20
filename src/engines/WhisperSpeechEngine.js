import BaseSpeechEngine from './BaseSpeechEngine.js';

/**
 * Reference implementation of a Whisper-based Speech Engine.
 * 
 * DESIGN NOTES:
 * 1. Security: API keys effectively cannot be safe in client-side code unless the user provides them.
 *    For production, this engine should point to your own backend proxy (see examples/backend).
 * 2. Latency: Whisper is file-based (record -> stop -> upload -> transcribe).
 *    This means higher latency than Native Web Speech (streaming).
 * 3. Strategy: This engine uses a "Push-to-Talk" model or manual stop. 
 *    Continuous "streaming" requires complex VAD (Voice Activity Detection) or chunking logic 
 *    which is outside the scope of a reference implementation.
 */
class WhisperSpeechEngine extends BaseSpeechEngine {
    constructor(options) {
        super(options);
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;

        // Configuration
        this.endpoint = options.whisperEndpoint || '/api/whisper'; // Your backend proxy
        this.apiKey = options.whisperApiKey; // Only if using direct OpenAI call (NOT RECOMMENDED for production)
        this.maxRecordingDuration = 30000; // Auto-stop after 30s
        this.stopTimer = null;
    }

    static get isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    }

    async init() {
        if (!WhisperSpeechEngine.isSupported) {
            throw new Error('MediaRecorder API not supported in this browser.');
        }
    }

    async start() {
        if (this.isListening) return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Prefer webm/opus for efficient upload
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                await this._processAudio();
                this._cleanup();
            };

            this.mediaRecorder.start();
            this.isListening = true;
            this.setState('recording'); // NEW: Update state
            this.onStart();

            // Safety timeout to prevent infinite recording
            this.stopTimer = setTimeout(() => {
                if (this.isListening) this.stop();
            }, this.maxRecordingDuration);

        } catch (error) {
            this.onError(error);
            this._cleanup();
        }
    }

    async stop() {
        if (!this.isListening || !this.mediaRecorder) return;

        if (this.stopTimer) clearTimeout(this.stopTimer);

        if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop(); // triggers onstop -> _processAudio
        }

        this.isListening = false;
        // Don't call this.onEnd() here immediately, wait for processing to finish in onstop
    }

    _cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isListening = false;
        this.setState('idle'); // NEW: Back to idle
        this.onEnd();
    }

    async _processAudio() {
        if (this.audioChunks.length === 0) return;

        this.setState('processing'); // NEW: Processing state during upload/transcribe

        try {
            // Create Blob
            const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });

            // Prepare Form Data
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-1');
            if (this.options.lang) {
                // OpenAI uses ISO-639-1 (e.g. 'en'), JSVoice uses BCP-47 (e.g. 'en-US')
                // Simple slice for reference
                formData.append('language', this.options.lang.slice(0, 2));
            }

            let response;

            // Direct API call (Development only)
            if (this.apiKey) {
                response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: formData
                });
            }
            // Backend Proxy call (Production)
            else {
                response = await fetch(this.endpoint, {
                    method: 'POST',
                    body: formData
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Whisper API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const transcript = data.text;

            if (transcript && transcript.trim()) {
                this.onResult(transcript, true); // true = isFinal
            } else {
                // No speech detected is not necessarily an error, but worth noting
            }

        } catch (error) {
            this.onError(error);
        }
    }
}

export default WhisperSpeechEngine;
