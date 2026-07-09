export const uikitStore: {
    getState(): any;
    setState(partial: any): void;
    subscribe(listener: (state: any) => void): () => void;
};
export function createVoiceKitStore(seed?: Record<string, unknown>): typeof uikitStore;
export function getInitialUiKitState(): Record<string, unknown>;
