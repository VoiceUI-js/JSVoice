export const uikitStore: {
    getState(): any;
    setState(partial: any): void;
    subscribe(listener: (state: any) => void): () => void;
};
export function useUiKitState<T>(selector: (state: any) => T): T;
