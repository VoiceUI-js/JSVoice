// src/modules/RecognitionManager.js
import { logger } from '../utils/Logger.js';

/**
 * Initializes the SpeechRecognition instance and sets up its event handlers.
 * @param {import('../JSVoice').JSVoiceOptions} options - JSVoice options.
 * @param {Function} updateStatus - Status update function from JSVoice instance.
 * @param {Function} callCallback - Callback function from JSVoice instance.
 * @param {Function} handleSpeechResult - The function to call when a final result is received, now handles wake word.
 * @param {Function} startRecognitionInternal - Internal function to restart recognition.
 * @param {Object} state - Object containing _isListening, _microphoneAllowed, _wakeWordModeActive, _awaitingCommand, _isStoppingIntentionally flags (passed by reference).
 * @returns {SpeechRecognition} The initialized recognition instance.
 */
export function initRecognition(
  speechEngine,
  updateStatus,
  callCallback,
  handleSpeechResult,
  startRecognitionInternal,
  state
) {
  if (!speechEngine) {
    const error = new Error('No speech engine provided.');
    logger.error('initRecognition:', error.message);
    callCallback('onError', error);
    return null;
  }

  // Set up the engine's callbacks to map to our internal logic
  speechEngine.setCallbacks({
    onStart: () => {
      state._isListening = true;
      callCallback('onSpeechStart');
      if (state._wakeWordModeActive) {
        updateStatus(
          state._awaitingCommand
            ? 'Listening for command...'
            : `Waiting for wake word "${speechEngine.options.wakeWord}"...`
        );
      } else {
        updateStatus('Listening for commands...');
      }
    },

    onResult: (resultOrTranscript, isFinalOrFlag) => {
      // V2.2 Protocol Support: Check if it's an object (TranscriptEvent) or legacy string
      let transcript = '';
      let isFinal = false;

      if (typeof resultOrTranscript === 'string') {
        transcript = resultOrTranscript;
        isFinal = !!isFinalOrFlag;
      } else if (typeof resultOrTranscript === 'object') {
        // It's a TranscriptEvent
        transcript = resultOrTranscript.text || '';
        isFinal = resultOrTranscript.isFinal || resultOrTranscript.type === 'final';
        // Forward telemetry
        callCallback('onTelemetry', { ...resultOrTranscript, type: 'transcript_event' });
      }

      if (!isFinal) {
        // Interim results
        if (transcript.trim()) {
          // Only show interim results if not in wake word mode, or if wake word was already detected
          if (!state._wakeWordModeActive || state._awaitingCommand) {
            updateStatus(`Listening... "${transcript}"`);
          }
        }
      } else {
        // Final results
        if (transcript.trim()) {
          handleSpeechResult(transcript);
        }
      }
    },

    onEnd: () => {
      state._isListening = false;
      callCallback('onSpeechEnd');

      if (state._isStoppingIntentionally) {
        logger.log('Speech Engine ended due to intentional stop. Resetting flag.');
        state._isStoppingIntentionally = false;
        return;
      }

      // Normal auto-restart logic
      const shouldAutoRestart = speechEngine.options.autoRestart && state._microphoneAllowed;

      if (shouldAutoRestart) {
        if (state._wakeWordModeActive) {
          updateStatus(
            `Speech recognition stopped, restarting to wait for "${speechEngine.options.wakeWord}"...`
          );
        } else {
          updateStatus('Speech recognition stopped, restarting...');
        }

        setTimeout(() => {
          if (!state._isListening && state._microphoneAllowed) {
            startRecognitionInternal();
          } else if (!state._microphoneAllowed) {
            updateStatus('Microphone access needed to restart voice commands.');
          }
        }, speechEngine.options.restartDelay);
      } else if (!state._microphoneAllowed) {
        updateStatus('Microphone access needed for voice commands.');
      } else {
        updateStatus('Voice commands off. Click mic to start.');
      }
    },

    onError: (errorEvent) => {
      // Map the error object/event to a standard structure if needed, or use as is
      const errorName = errorEvent.error || errorEvent.message || 'unknown';

      if (errorName === 'aborted' && state._isStoppingIntentionally) {
        return; // Ignore intentional stops
      }

      logger.error('Speech Engine Error:', errorName, errorEvent);
      callCallback('onError', errorEvent);
      state._isListening = false;

      const shouldAutoRestart = speechEngine.options.autoRestart && state._microphoneAllowed;
      let errorMessage = 'Voice error.';

      switch (errorName) {
        case 'not-allowed':
        case 'NotAllowedError':
          errorMessage = 'Microphone access denied. Please allow it in browser settings.';
          state._microphoneAllowed = false;
          callCallback('onMicrophonePermissionDenied', errorEvent);
          break;
        case 'network':
        case 'NetworkError':
          errorMessage = 'Network error. Check your internet connection.';
          if (shouldAutoRestart || state._wakeWordModeActive) {
            updateStatus(`Error: ${errorMessage}. Attempting to reconnect...`);
            setTimeout(() => startRecognitionInternal(), speechEngine.options.restartDelay);
            return;
          }
          break;
        case 'no-speech':
          if (state._wakeWordModeActive && shouldAutoRestart) {
            setTimeout(() => {
              if (!state._isListening && state._microphoneAllowed) {
                startRecognitionInternal();
              }
            }, speechEngine.options.restartDelay);
            return;
          }
          errorMessage = 'No speech detected. Try speaking clearer.';
          break;
        case 'aborted':
          errorMessage = 'Voice recognition aborted.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available or busy.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Voice recognition service not allowed.';
          break;
        default:
          errorMessage = `An unexpected voice error occurred: ${errorName}`;
      }

      updateStatus(`Error: ${errorMessage}`);
    }
  });

  return speechEngine;
}

import { microphoneManager } from './MicrophoneManager.js';

export async function checkMicrophonePermission(updateStatus, callCallback, state, opts = {}) {
  // Use MicrophoneManager to safely check/request permission
  // This shares the stream if already active (e.g. visualizer) or requests a new one
  try {
    const stream = await microphoneManager.acquire('permission-check');

    // If caller requests the live stream (e.g., for analyser), return it
    if (opts.returnStream) {
      state._microphoneAllowed = true;
      callCallback('onMicrophonePermissionGranted');
      // Caller is responsible for releasing 'permission-check' later via microphoneManager.release('permission-check')
      // OR we should have the caller pass their own ownerId. 
      // For legacy compat, we leave it active.
      return stream;
    }

    // Default behavior: verification only. Release immediately.
    microphoneManager.release('permission-check');

    state._microphoneAllowed = true;
    callCallback('onMicrophonePermissionGranted');
  } catch (error) {
    state._microphoneAllowed = false;
    callCallback('onMicrophonePermissionDenied', error);
    updateStatus('Error: Microphone access denied. Please allow it in browser settings.');
    // Do not throw, just update state, unless caller expects throw? 
    // Original code threw error.
    throw error;
  }
}
