// src/modules/RecognitionManager.js

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
export function initRecognition(options, updateStatus, callCallback, handleSpeechResult, startRecognitionInternal, state) {
  const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognitionConstructor) {
    const error = new Error("SpeechRecognition constructor not available");
    console.error("[JSVoice] initRecognition:", error.message);
    callCallback('onError', error);
    return null;
  }
  
  const recognition = new SpeechRecognitionConstructor();

  recognition.continuous = options.continuous; // Will be forced true if wakeWord is set
  recognition.interimResults = options.interimResults;
  recognition.lang = options.lang;

  recognition.onstart = () => {
    state._isListening = true;
    callCallback('onSpeechStart');
    if (state._wakeWordModeActive) {
        updateStatus(state._awaitingCommand ? "Listening for command..." : `Waiting for wake word "${options.wakeWord}"...`);
    } else {
        updateStatus("Listening for commands...");
    }
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript.trim()) {
      // Only show interim results if not in wake word mode, or if wake word was already detected
      if (!state._wakeWordModeActive || state._awaitingCommand) {
        updateStatus(`Listening... "${interimTranscript}"`);
      }
    }

    if (finalTranscript.trim()) {
      handleSpeechResult(finalTranscript); // Call the new handler
      // Status will be updated by handleSpeechResult or by onend
    }
  };

  recognition.onend = () => {
    state._isListening = false;
    callCallback('onSpeechEnd');

    // NEW: If recognition was stopped intentionally (e.g., by speak() or JSVoice.stop()),
    // we manage the flag here and skip auto-restart from onend.
    if (state._isStoppingIntentionally) {
        console.log("[JSVoice] Speech Recognition ended due to intentional stop. Resetting flag.");
        state._isStoppingIntentionally = false; // Reset the flag here, as onend is the definitive 'stop' event
        // The initiator (speak or JSVoice.stop) will handle any required restarts or final status.
        return; // Skip auto-restart logic entirely
    }

    // Normal auto-restart logic for unexpected ends or natural end-of-speech
    const shouldAutoRestart = options.autoRestart && state._microphoneAllowed;

    if (shouldAutoRestart) {
        if (state._wakeWordModeActive) {
            updateStatus(`Speech recognition stopped, restarting to wait for "${options.wakeWord}"...`);
        } else {
            updateStatus("Speech recognition stopped, restarting..."); 
        }
        
        setTimeout(() => {
            if (!state._isListening && state._microphoneAllowed) {
                startRecognitionInternal();
            } else if (!state._microphoneAllowed) {
                updateStatus("Microphone access needed to restart voice commands.");
            }
        }, options.restartDelay);
    } else if (!state._microphoneAllowed) {
        updateStatus("Microphone access needed for voice commands.");
    } else {
        updateStatus("Voice commands off. Click mic to start.");
    }
  };

  recognition.onerror = (event) => {
    // NEW: If 'aborted' and we explicitly set the flag, this is an intentional stop.
    // We suppress the error message and do NOT reset the flag here.
    // onend will be responsible for resetting _isStoppingIntentionally.
    if (event.error === 'aborted' && state._isStoppingIntentionally) {
        console.log("[JSVoice] Intentional Speech Recognition abortion ignored."); // Log it, but not as an error.
        // The _isStoppingIntentionally flag will be reset by the `onend` handler.
        // The restart (if any) will also be handled by the initiating method (speak or JSVoice.stop).
        return; 
    }

    // For all other errors, or unintended 'aborted' errors, proceed with normal error handling.
    console.error("[JSVoice] Speech Recognition Error:", event.error, event.message);
    callCallback('onError', event);
    state._isListening = false; // Ensure listening state is false on error

    const shouldAutoRestart = options.autoRestart && state._microphoneAllowed;

    let errorMessage = "Voice error.";
    switch (event.error) {
      case "not-allowed":
        errorMessage = "Microphone access denied. Please allow it in browser settings.";
        state._microphoneAllowed = false;
        callCallback('onMicrophonePermissionDenied', event);
        break;
      case "network":
        errorMessage = "Network error. Check your internet connection.";
        if (shouldAutoRestart || state._wakeWordModeActive) {
            updateStatus(`Error: ${errorMessage}. Attempting to reconnect...`);
            setTimeout(() => startRecognitionInternal(), options.restartDelay);
            return;
        }
        break;
      case "no-speech":
        if (state._wakeWordModeActive && shouldAutoRestart) {
            // In wake word mode, 'no-speech' is expected silence. Just restart.
            setTimeout(() => {
                if (!state._isListening && state._microphoneAllowed) {
                    startRecognitionInternal();
                }
            }, options.restartDelay);
            return;
        }
        errorMessage = "No speech detected. Try speaking clearer.";
        break;
      case "aborted": // This case is now mostly handled by the `if (event.error === 'aborted' && state._isStoppingIntentionally)` block
        errorMessage = "Voice recognition aborted."; // Fallback message if not an intentional abort
        break;
      case "audio-capture":
        errorMessage = "Microphone not available or busy.";
        break;
      case "service-not-allowed":
        errorMessage = "Voice recognition service not allowed.";
        break;
      default:
        errorMessage = `An unexpected voice error occurred: ${event.error}`;
    }
    
    updateStatus(`Error: ${errorMessage}`);
  };

  return recognition;
}

/**
 * Attempts to get microphone permission using the MediaDevices API.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @param {Object} state - Object containing _microphoneAllowed flag.
 * @returns {Promise<void>}
 */
export async function checkMicrophonePermission(updateStatus, callCallback, state) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const error = new Error("MediaDevices API not supported, cannot check microphone.");
    state._microphoneAllowed = false;
    updateStatus(`Error: ${error.message}`);
    callCallback('onError', error);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after acquiring stream

    state._microphoneAllowed = true;
    callCallback('onMicrophonePermissionGranted');
  } catch (error) {
    state._microphoneAllowed = false;
    callCallback('onMicrophonePermissionDenied', error);
    updateStatus("Error: Microphone access denied. Please allow it in browser settings.");
    throw error;
  }
}