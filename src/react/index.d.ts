import { JSVoice, JSVoiceOptions } from 'jsvoice';
import { ReactNode, ComponentType } from 'react';

export interface VoiceProviderProps {
    voice: JSVoice | ((options?: JSVoiceOptions) => JSVoice);
    options?: JSVoiceOptions;
    children: ReactNode;
}

export const VoiceProvider: ComponentType<VoiceProviderProps>;

export function useVoice(): JSVoice;

export function useVoiceStatus<T = any>(selector?: (state: any) => T): T;

export function useVoiceEvent(eventName: string, handler: (payload: any) => void): void;
