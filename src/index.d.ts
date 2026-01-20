// Type definitions for jsvoice 0.2.1
// Project: https://github.com/yourusername/jsvoice
// Definitions by: JSVoice Contributors

declare module 'jsvoice' {
    /**
     * Configuration options for JSVoice instance
     */
    export interface JSVoiceOptions {
        /** If true, recognition continues even if the user pauses speaking */
        continuous?: boolean;

        /** If true, interim results are returned during speech */
        interimResults?: boolean;

        /** BCP-47 language tag for recognition and synthesis (e.g., 'en-US', 'es-ES') */
        lang?: string;

        /** Map of exact phrase commands to callback functions */
        commands?: Record<string, (raw: string, cleaned: string, speak: (text: string) => void) => any>;

        /** Array of pattern-based commands with variable extraction */
        patternCommands?: Array<{
            pattern: string;
            callback: (args: Record<string, string>, raw: string, cleaned: string, speak: (text: string) => void) => any;
        }>;

        /** If true, recognition will automatically restart after ending */
        autoRestart?: boolean;

        /** Delay in milliseconds before restarting recognition */
        restartDelay?: number;

        /** List of engine classes to try (priority order) */
        engines?: Array<new (options: JSVoiceOptions) => BaseSpeechEngine>;

        /** Specific engine instance to use (overrides engines) */
        engine?: BaseSpeechEngine;

        /** Wake word phrase for hands-free activation (forces continuous mode) */
        wakeWord?: string | null;

        /** Duration in milliseconds to listen for commands after wake word detection */
        wakeWordTimeout?: number;

        /** Callback fired when speech recognition starts */
        onSpeechStart?: () => void;

        /** Callback fired when speech recognition ends */
        onSpeechEnd?: () => void;

        /** Callback fired when a command is successfully recognized and processed */
        onCommandRecognized?: (phrase: string, raw: string, result: any, args?: Record<string, string>) => void;

        /** Callback fired when speech is recognized but no command matches */
        onCommandNotRecognized?: (raw: string) => void;

        /** Callback fired when a built-in action is performed */
        onActionPerformed?: (action: string, payload?: any) => void;

        /** Callback fired when microphone permission is granted */
        onMicrophonePermissionGranted?: (event?: any) => void;

        /** Callback fired when microphone permission is denied */
        onMicrophonePermissionDenied?: (error: any) => void;

        /** Callback fired when the configured wake word is detected */
        onWakeWordDetected?: (wakeWord: string) => void;

        /** Callback fired on any speech recognition error */
        onError?: (error: Error | Event) => void;

        /** Callback fired when the internal status message changes */
        onStatusChange?: (message: string) => void;
    }

    /**
     * Options for amplitude visualization
     */
    export interface AmplitudeOptions {
        /** Visualization mode: 'bars' for frequency bars, 'waveform' for full waveform */
        mode?: 'bars' | 'waveform';

        /** Number of frequency bars to return (only used in 'bars' mode) */
        barCount?: number;
    }

    /**
     * Abstract base class for speech recognition engines.
     */
    export class BaseSpeechEngine {
        constructor(options?: any);
        static readonly isSupported: boolean;
        init(): Promise<void>;
        start(): Promise<void>;
        stop(): Promise<void>;
        setCallbacks(callbacks: {
            onStart?: () => void;
            onEnd?: () => void;
            onError?: (error: any) => void;
            onResult?: (transcript: string, isFinal: boolean) => void;
        }): void;
        setOptions(options: any): void;
        isListening: boolean;
        options: any;
        onStart: () => void;
        onEnd: () => void;
        onError: (error: any) => void;
        onResult: (transcript: string, isFinal: boolean) => void;
    }

    /**
     * Main JSVoice class for voice command and speech synthesis
     */
    export default class JSVoice {
        /**
         * Static check for Web Speech API support in the browser
         */
        static readonly isApiSupported: boolean;

        /**
         * Creates a new JSVoice instance
         * @param options - Configuration options
         */
        constructor(options?: JSVoiceOptions);

        /**
         * Starts speech recognition
         * @returns Promise that resolves to true if started successfully, false otherwise
         */
        start(): Promise<boolean>;

        /**
         * Stops speech recognition
         */
        stop(): void;

        /**
         * Toggles speech recognition on/off
         */
        toggle(): void;

        /**
         * Makes the browser speak the given text using speech synthesis
         * @param text - The text to be spoken
         * @param lang - Optional language override (defaults to options.lang)
         */
        speak(text: string, lang?: string): void;

        /**
         * Registers a custom voice command based on an exact phrase
         * @param phrase - The exact phrase to match
         * @param callback - Function to execute when phrase is recognized
         */
        addCommand(
            phrase: string,
            callback: (raw: string, cleaned: string, speak: (text: string) => void) => any
        ): void;

        /**
         * Removes a previously registered exact phrase command
         * @param phrase - The phrase of the command to remove
         * @returns True if the command was removed, false otherwise
         */
        removeCommand(phrase: string): boolean;

        /**
         * Registers a custom voice command based on a pattern with variable extraction
         * @param pattern - Pattern with placeholders in curly braces (e.g., "change {color} to {value}")
         * @param callback - Function to execute with extracted arguments
         */
        addPatternCommand(
            pattern: string,
            callback: (
                args: Record<string, string>,
                raw: string,
                cleaned: string,
                speak: (text: string) => void
            ) => any
        ): void;

        /**
         * Removes a previously registered pattern command
         * @param pattern - The pattern of the command to remove
         * @returns True if the command was removed, false otherwise
         */
        removePatternCommand(pattern: string): boolean;

        /**
         * Updates a specific configuration option
         * @param key - The option key to update
         * @param value - The new value for the option
         */
        setOption(key: keyof JSVoiceOptions, value: any): void;

        /**
         * Starts real-time audio amplitude monitoring for visualization
         * @param callback - Called with amplitude data (array of normalized 0-1 values)
         * @param options - Visualization configuration options
         */
        startAmplitude(callback: (data: number[]) => void, options?: AmplitudeOptions): void;

        /**
         * Stops amplitude monitoring and cleans up audio resources
         */
        stopAmplitude(): void;

        /**
         * Whether speech recognition is currently active
         */
        readonly isListening: boolean;

        /**
         * Whether microphone permission has been granted
         */
        readonly microphoneAllowed: boolean;

        /**
         * Whether the Web Speech API is supported in this browser
         */
        readonly isApiSupported: boolean;

        /**
         * Latest status message
         */
        readonly voiceFeedback: string;

        /**
         * Whether wake word mode is currently active
         */
        readonly isWakeWordModeActive: boolean;

        /**
         * Whether the system is awaiting a command after wake word detection
         */
        readonly isAwaitingCommand: boolean;
    }
}
