/**
 * Type definitions for jsvoice
 *
 * START HERE (AI & integrators):
 *   docs/AI_IMPLEMENTATION.md · AGENTS.md · llms.txt · docs/LOCAL_BROWSER_WHISPER.md
 *
 * Defaults:
 *   createVoice() → engineMode 'local' → Xenova/whisper-tiny.en (peer: @xenova/transformers)
 *   Do not gate on isApiSupported (Native Web Speech only).
 *   start()/toggle() require a user gesture.
 */
// Project: https://github.com/VoiceUI-js/VoiceUI
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
    export type EngineMode = 'local' | 'native' | 'auto';

    export interface LocalVadOptions {
        enabled?: boolean;
        silenceMs?: number;
        energyThreshold?: number;
        minSpeechMs?: number;
    }

    export interface LocalEngineOptions {
        /** Default: Xenova/whisper-tiny.en (English, ~30MB) */
        model?: string;
        maxRecordMs?: number;
        allowCdnFallback?: boolean;
        requireUserConfirmOnSaveData?: boolean;
        /** true, or async () => boolean — required on saveData networks */
        confirmModelDownload?: boolean | (() => boolean | Promise<boolean>);
        vad?: LocalVadOptions;
        onModelLoadProgress?: (progress: ModelLoadProgress) => void;
        onTelemetry?: (event: Record<string, unknown>) => void;
        /** Test-only: inject a mock Worker */
        WorkerFactory?: () => Worker;
    }

    export interface ModelLoadProgress {
        status?: string;
        progress?: number;
        file?: string;
        name?: string;
    }

    export interface JSVoiceOptions {
        /** Enable debug mode for command tracing */
        debug?: boolean;

        /** Default scope for new commands (default: 'global') */
        defaultScope?: string;

        /**
         * Speech engine mode for createVoice().
         * Default: **'local'** — on-device Whisper tiny (any modern browser).
         * Use 'native' for vendor Web Speech (no model download).
         * Use 'auto' for local-first with native fallback if local fails.
         */
        engineMode?: EngineMode;

        /** Options for LocalTransformersSpeechEngine (browser Whisper) */
        localOptions?: LocalEngineOptions;

        /** Options for NativeSpeechEngine */
        nativeOptions?: Record<string, unknown>;

        /** Model download progress (local engine) */
        onModelLoadProgress?: (progress: ModelLoadProgress) => void;

        /** Confirm model download on save-data networks */
        confirmModelDownload?: boolean | (() => boolean | Promise<boolean>);

        onEngineSelected?: (info: { engineName: string; mode: string; reason?: string }) => void;
        onFallbackActivated?: (info: { from: string; to: string; reason?: string }) => void;
        onTelemetry?: (event: Record<string, unknown>) => void;

        /** If true, recognition continues even if the user pauses speaking */
        continuous?: boolean;
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
        /** Skip getUserMedia (tests / FakeSpeechEngine harness only) */
        skipMicrophoneCheck?: boolean;

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

    export class LocalTransformersSpeechEngine extends BaseSpeechEngine {
        static readonly isSupported: boolean;
        static readonly defaultModel: string;
        static shouldPromptForModelDownload(): boolean;
        confirmDownload(): void;
        dispose(): void;
    }

    export class HybridSpeechEngine extends BaseSpeechEngine {
        setEngineMode(mode: EngineMode): Promise<void>;
        getActiveMode(): string | null;
    }

    export class NativeSpeechEngine extends BaseSpeechEngine {
        static readonly isSupported: boolean;
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
        /** Returns start() promise when starting, false when stopping */
        toggle(): Promise<boolean> | boolean;
        speak(text: string, lang?: string): void;

        /**
         * Register a command with advanced options.
         * @returns command id or null if invalid
         */
        addCommand(phrase: string, callback: Function, options?: CommandOptions): string | null;

        removeCommand(idOrPhrase: string): boolean;

        /** @deprecated Use addCommand with { isPattern: true } or braces */
        addPatternCommand(pattern: string, callback: Function): string | null;
        removePatternCommand(pattern: string): boolean;

        /** Public read-only command list (prefer over private manager access) */
        listCommands(): Array<{
            id: string;
            phrase: string;
            type: string;
            scope: string;
            priority: number;
            args?: any[];
        }>;

        /** Process text as if spoken (palette, tests, typed input) */
        processText(text: string): Promise<boolean>;

        getEngineInfo(): {
            name: string;
            mode: string;
            listening: boolean;
            supported: boolean;
        };

        listScopes(): string[];
        readonly currentScope: string;

        // Scopes
        setScope(name: string): void;
        pushScope(name: string): void;
        popScope(): string;
        resetScope(): void;

        setOption(key: string, value: any): void;

        // Visualizer Proxy Methods (require Visualizer Plugin)
        startAmplitude(callback: (data: number[]) => void, options?: AmplitudeOptions): void;
        stopAmplitude(): void;

        /**
         * Registers a plugin.
         */
        use(plugin: (instance: JSVoice) => void): this;

        getSnapshot(): any;
        subscribe(listener: (snapshot: any, event?: any) => void): () => void;

        readonly isListening: boolean;
        readonly microphoneAllowed: boolean;
        readonly isApiSupported: boolean;
        readonly voiceFeedback: string;
        readonly isWakeWordModeActive: boolean;
        readonly isAwaitingCommand: boolean;
    }

    /**
     * Default factory to create a batteries-included JSVoice instance.
     */
    export function createVoice(options?: JSVoiceOptions): JSVoice;

    export default createVoice;
}
