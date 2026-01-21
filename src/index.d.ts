// Type definitions for jsvoice 0.2.1
// Project: https://github.com/yourusername/jsvoice
// Definitions by: JSVoice Contributors

declare module 'jsvoice' {
    export type EngineState = 'idle' | 'listening' | 'recording' | 'processing' | 'speaking' | 'error';

    export interface CommandDebugEvent {
        transcript: string;
        matched: boolean;
        matches: Array<{ id: string, phrase: string, priority: number, scope: string }>;
        winner: string | null;
        rejectionReason: string | null;
    }

    /**
     * Configuration options for JSVoice instance
     */
    export interface JSVoiceOptions {
        /** Enable debug mode for command tracing */
        debug?: boolean;

        /** Default scope for new commands (default: 'global') */
        defaultScope?: string;

        /** If true, recognition continues even if the user pauses speaking */
        continuous?: boolean;
        // ... (rest of simple types)
        interimResults?: boolean;
        lang?: string;
        autoRestart?: boolean;
        restartDelay?: number;
        wakeWord?: string | null;

        /**
         * Map of exact phrase commands to callback functions
         * @deprecated Use addCommand() for advanced features
         */
        commands?: Record<string, Function>;

        /**
         * @deprecated Use addCommand()
         */
        patternCommands?: Array<{ pattern: string; callback: Function }>;

        engines?: Array<new (options: JSVoiceOptions) => BaseSpeechEngine>;
        engine?: BaseSpeechEngine;
        plugins?: Array<(instance: JSVoice) => void>;

        // Callbacks
        onSpeechStart?: () => void;
        onSpeechEnd?: () => void;
        onCommandRecognized?: (phrase: string, raw: string, result: any, args?: Record<string, string>) => void;
        onCommandNotRecognized?: (raw: string) => void;
        onActionPerformed?: (action: string, payload?: any) => void;
        onMicrophonePermissionGranted?: (event?: any) => void;
        onMicrophonePermissionDenied?: (error: any) => void;
        onWakeWordDetected?: (wakeWord: string) => void;
        onError?: (error: Error | Event) => void;
        onStatusChange?: (message: string) => void;

        /** NEW: Fired when engine state changes */
        onEngineStateChange?: (state: EngineState, details?: any) => void;

        /** NEW: Fired when a command is processed (debug mode only) */
        onCommandEvaluated?: (event: CommandDebugEvent) => void;
    }

    export interface CommandOptions {
        id?: string;
        priority?: number; // Default 0
        cooldown?: number; // ms
        scope?: string;    // Default 'global' OR this.defaultScope
        once?: boolean;    // Remove after fire
        isPattern?: boolean; // Force pattern mode
    }

    export interface AmplitudeOptions {
        mode?: 'bars' | 'waveform';
        barCount?: number;
        fftSize?: number;
        smoothingTimeConstant?: number;
        updateIntervalMs?: number;
    }

    export class BaseSpeechEngine {
        constructor(options?: any);
        static readonly isSupported: boolean;
        state: EngineState; // NEW
        init(): Promise<void>;
        start(): Promise<void>;
        stop(): Promise<void>;
        setState(newState: EngineState): void; // NEW
        setCallbacks(callbacks: any): void;
        setOptions(options: any): void;
        isListening: boolean;
    }

    /**
     * Main JSVoice class for voice command and speech synthesis.
     */
    export class JSVoice {
        static readonly isApiSupported: boolean;

        constructor(options?: JSVoiceOptions);

        start(): Promise<boolean>;
        stop(): void;
        toggle(): void;
        speak(text: string, lang?: string): void;

        /**
         * Register a command with advanced options.
         */
        addCommand(phrase: string, callback: Function, options?: CommandOptions): void;

        removeCommand(idOrPhrase: string): boolean;

        /** @deprecated Use addCommand with { isPattern: true } or braces */
        addPatternCommand(pattern: string, callback: Function): void;
        removePatternCommand(pattern: string): boolean;

        // Scopes
        setScope(name: string): void;
        pushScope(name: string): void;
        popScope(): string;
        resetScope(): void;

        setOption(key: keyof JSVoiceOptions, value: any): void;

        // Visualizer Proxy Methods (require Visualizer Plugin)
        startAmplitude(callback: (data: number[]) => void, options?: AmplitudeOptions): void;
        stopAmplitude(): void;

        /**
         * Registers a plugin.
         */
        use(plugin: (instance: JSVoice) => void): this;

        readonly isListening: boolean;
        readonly microphoneAllowed: boolean;
        readonly isApiSupported: boolean;
    }

    /**
     * Default factory to create a batteries-included JSVoice instance.
     */
    export function createVoice(options?: JSVoiceOptions): JSVoice;

    export default createVoice;
}
