/**
 * React hook for the UI kit store.
 * Kept separate so core store stays framework-agnostic.
 */
import { useSyncExternalStore } from 'react';
import { uikitStore } from './store.js';

export function useUiKitState(selector = (s) => s) {
  return useSyncExternalStore(
    (cb) => uikitStore.subscribe(cb),
    () => selector(uikitStore.getState()),
    () => selector(uikitStore.getState())
  );
}

export default useUiKitState;
