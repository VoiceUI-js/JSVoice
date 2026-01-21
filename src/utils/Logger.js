/**
 * Internal Logger for JSVoice.
 * Respects the 'debug' option to silence production noise.
 */
class Logger {
    constructor() {
        this.debug = false;
    }

    setDebug(isEnabled) {
        this.debug = !!isEnabled;
    }

    log(...args) {
        if (this.debug) {
            console.log('[JSVoice]', ...args);
        }
    }

    warn(...args) {
        // Warnings usually important enough to show always? 
        // Or only in debug? Principal auditor said "silence unless debug".
        // Let's keep warnings visible but prefixed clearly.
        console.warn('[JSVoice]', ...args);
    }

    error(...args) {
        console.error('[JSVoice]', ...args);
    }
}

export const logger = new Logger();
