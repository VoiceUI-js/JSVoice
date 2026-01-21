/**
 * Circuit Breaker for managing engine stability.
 * Tracks failures and manages Closed/Open/Half-Open states.
 */
export class CircuitBreaker {
    constructor(config = {}) {
        this.config = {
            threshold: 3,        // Failures before opening
            windowMs: 60000,     // Time window for counting failures
            cooldownMs: 30000,   // Time to wait before half-open
            ...config
        };

        this.state = 'closed'; // closed (healthy), open (failed), half_open (recovering)
        this.failures = [];
        this.lastStateChange = Date.now();
        this.onStateChange = null;
    }

    recordError(errorType) {
        const now = Date.now();
        this._pruneHistory(now);

        this.failures.push({ time: now, type: errorType });

        if (this.state === 'closed' && this.failures.length >= this.config.threshold) {
            this._transition('open');
        } else if (this.state === 'half_open') {
            // If we fail in half_open, immediately go back to open
            this._transition('open');
        }
    }

    recordSuccess() {
        if (this.state === 'half_open') {
            this.failures = [];
            this._transition('closed');
        } else if (this.state === 'closed') {
            // Optional: Gradually decay failures on success?
            // For now, strict window-based Pruning handles it.
        }
    }

    canAttempt() {
        const now = Date.now();

        if (this.state === 'closed') return true;

        if (this.state === 'open') {
            if (now - this.lastStateChange > this.config.cooldownMs) {
                this._transition('half_open');
                return true; // Probe attempt
            }
            return false;
        }

        if (this.state === 'half_open') {
            // Allow one concurrent probe. 
            // In a complex system we'd track active requests.
            // Here, we assume the caller respects the single-flight nature of voice.
            return true;
        }

        return false;
    }

    reset() {
        this.failures = [];
        this._transition('closed');
    }

    _transition(newState) {
        if (this.state !== newState) {
            console.warn(`[JSVoice] CircuitBreaker: ${this.state} -> ${newState}`);
            this.state = newState;
            this.lastStateChange = Date.now();
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    _pruneHistory(now) {
        const windowStart = now - this.config.windowMs;
        this.failures = this.failures.filter(f => f.time > windowStart);
    }
}
