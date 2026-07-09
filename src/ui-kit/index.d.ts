export declare const uikitStore: {
  getState(): any;
  setState(partial: any): void;
  subscribe(listener: (state: any) => void): () => void;
};

export declare function createVoiceKitStore(seed?: Record<string, unknown>): typeof uikitStore;
export declare function getInitialUiKitState(): Record<string, unknown>;
export declare function useUiKitState<T = any>(selector?: (s: any) => T): T;

export declare const VoiceUIController: Record<string, Function>;
export declare const VoiceKitActions: Record<string, Function>;
export declare function createVoiceKitController(): typeof VoiceKitActions;

export declare function createEventBus(): {
  on(event: string, handler: (payload?: any) => void): () => void;
  off(event: string, handler: (payload?: any) => void): void;
  emit(event: string, payload?: any): void;
  clear(): void;
};
export declare const globalUiEvents: ReturnType<typeof createEventBus>;

export declare function createRegistry(): any;
export declare const globalRegistry: any;

export declare const defaultTokens: Record<string, string>;
export declare function tokensToCssVars(tokens: Record<string, string>): Record<string, string>;
export declare const builtInThemes: Record<string, Record<string, string>>;
export declare const themeNames: string[];
export declare function createVoiceTheme(options?: {
  name?: string;
  tokens?: Record<string, string>;
  base?: string;
}): { name: string; tokens: Record<string, string>; cssVars: Record<string, string> };
export declare function resolveTheme(theme?: string | object): {
  name: string;
  tokens: Record<string, string>;
  cssVars: Record<string, string>;
};
export declare function injectThemeStyles(theme?: string | object, id?: string): HTMLStyleElement | null;
export declare function buildThemeStyleText(theme?: string | object, selector?: string): string;

export declare function classNames(...parts: any[]): string;
export declare function createId(prefix?: string): string;
export declare function isBrowser(): boolean;
export declare function isSpeechRecognitionSupported(): boolean;
export declare function isSecureContext(): boolean;

export declare const VOICE_STATUS: Record<string, string>;
export declare const UI_PLACEMENT: Record<string, string>;
export declare const DEFAULT_PERSIST_KEY: string;
