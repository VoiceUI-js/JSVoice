/**
 * @jsvoice/react
 * Core React integration for JSVoice.
 */
import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore, useMemo } from 'react';

// Context
const VoiceContext = createContext(null);

/**
 * VoiceProvider
 * Wraps your app and provides the Voice Instance.
 * @param {Object} props
 * @param {JSVoice|Function} props.voice - Initialized instance or factory function
 * @param {Object} props.options - Options if passing a factory
 */
export function VoiceProvider({ voice, options, children }) {
    // Stable instance ref to prevent re-instantiation
    const voiceRef = useRef(null);

    if (!voiceRef.current) {
        if (typeof voice === 'function') {
            // Factory
            voiceRef.current = voice(options);
        } else {
            voiceRef.current = voice;
        }
    }

    useEffect(() => {
        return () => {
            // Cleanup on unmount (Optional: stop voice?)
            // Usually we don't auto-stop global voice, but we should cleanup listeners
            if (voiceRef.current && voiceRef.current.cleanup) {
                voiceRef.current.stop();
            }
        };
    }, []);

    return React.createElement(VoiceContext.Provider, { value: voiceRef.current }, children);
}

/**
 * Hook: Access raw voice instance
 */
export function useVoice() {
    const ctx = useContext(VoiceContext);
    if (!ctx) throw new Error('useVoice must be used within VoiceProvider');
    return ctx;
}

/**
 * Hook: Access reactive state snapshot
 * Uses useSyncExternalStore for TEARING-FREE updates.
 * @param {Function} selector (optional) - Select part of state to prevent re-renders
 */
export function useVoiceStatus(selector = (s) => s) {
    const voice = useVoice();

    const subscribe = useMemo(() => {
        return (callback) => voice.subscribe(() => callback());
    }, [voice]);

    const getSnapshot = useMemo(() => {
        return () => voice.getSnapshot();
    }, [voice]);

    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return selector(snapshot);
}

/**
 * Hook: Safe Event Listener
 */
export function useVoiceEvent(eventName, handler) {
    const voice = useVoice();
    const handlerRef = useRef(handler);
    handlerRef.current = handler; // Always fresh

    useEffect(() => {
        const unsubscribe = voice.subscribe((snap, evt) => {
            if (evt.type === eventName || eventName === '*') {
                handlerRef.current(evt.payload || evt);
            }
        });
        return unsubscribe;
    }, [voice, eventName]);
}
