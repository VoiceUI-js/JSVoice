/**
 * Ref-Counted Microphone Manager
 * Prevents "double mic" requests and manages stream lifecycle across multiple consumers.
 */
class MicrophoneManager {
    constructor() {
        this.stream = null;
        this.owners = new Map(); // ownerId -> timestamp
        this.pendingPromise = null;
    }

    /**
     * Acquire the microphone stream.
     * @param {string} ownerId - Unique ID of the requester (e.g. 'engine', 'visualizer')
     * @param {Object} constraints - Optional MediaStreamConstraints
     * @returns {Promise<MediaStream>}
     */
    async acquire(ownerId, constraints = {}) {
        if (!ownerId) throw new Error('[MicrophoneManager] acquire requires ownerId');

        // Register owner
        this.owners.set(ownerId, Date.now());

        // Return existing active stream
        if (this.stream && this.stream.active) {
            return this.stream;
        }

        // Return pending request if in progress
        if (this.pendingPromise) {
            return this.pendingPromise;
        }

        // Request new stream
        this.pendingPromise = (async () => {
            try {
                // Default high-quality voice constraints
                const finalConstraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        ...constraints.audio
                    },
                    video: false
                };

                this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints);

                // Handle external stop (User revokes permission / Browser stop button)
                this.stream.getTracks()[0].onended = () => {
                    console.warn('[MicrophoneManager] Stream ended externally');
                    this._cleanup();
                };

                return this.stream;
            } catch (err) {
                // Failed to acquire. Remove owner and propagate error.
                this.owners.delete(ownerId);
                console.error('[MicrophoneManager] Access denied:', err);
                throw err;
            } finally {
                this.pendingPromise = null;
            }
        })();

        return this.pendingPromise;
    }

    /**
     * Release the microphone stream for a specific owner.
     * @param {string} ownerId 
     */
    release(ownerId) {
        if (this.owners.has(ownerId)) {
            this.owners.delete(ownerId);

            // If no owners left, stop the stream
            if (this.owners.size === 0) {
                this._stopStream();
            }
        }
    }

    _stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
    }

    _cleanup() {
        this.stream = null;
        this.owners.clear();
    }

    get isActive() {
        return !!this.stream && this.stream.active;
    }

    get activeOwners() {
        return Array.from(this.owners.keys());
    }
}

export const microphoneManager = new MicrophoneManager();
export default microphoneManager;
