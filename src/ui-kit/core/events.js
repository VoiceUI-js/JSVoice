/**
 * Lightweight event bus for UI kit internal coordination.
 * Framework-agnostic; no React dependency.
 */

export function createEventBus() {
  const listeners = new Map();

  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => this.off(event, handler);
    },
    off(event, handler) {
      listeners.get(event)?.delete(handler);
    },
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      set.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          if (typeof console !== 'undefined') console.warn('[jsvoice-ui-kit]', e);
        }
      });
    },
    clear() {
      listeners.clear();
    },
  };
}

export const globalUiEvents = createEventBus();
