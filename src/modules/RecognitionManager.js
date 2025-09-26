// src/modules/RecognitionManager.js

/**
 * Initializes the SpeechRecognition instance and sets up its event handlers.
 * @param {Object} options - VoiceUI options.
 * @param {Function} updateStatus - Status update function from VoiceUI instance.
 * @param {Function} callCallback - Callback function from VoiceUI instance.
 * @param {Function} processCommand - The function to call when a final result is received.
 * @param {Function} startRecognitionInternal - Internal function to restart recognition.
 * @param {Object} state - Object containing _isListening and _microphoneAllowed flags (passed by reference).
 * @returns {SpeechRecognition} The initialized recognition instance.
 */
export function initRecognition(options, updateStatus, callCallback, processCommand, startRecognitionInternal, state) {
  const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionConstructor();

  recognition.continuous = options.continuous;
  recognition.interimResults = options.interimResults;
  recognition.lang = options.lang;

  recognition.onstart = () => {
    state._isListening = true;
    callCallback('onSpeechStart');
    updateStatus("Listening for commands...");
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
      updateStatus(`Listening... "${interimTranscript}"`);
    }

    if (finalTranscript.trim()) {
      processCommand(finalTranscript);
      if (state._isListening) {
        updateStatus("Listening for commands...");
      }
    }
  };

  recognition.onend = () => {
    state._isListening = false;
    callCallback('onSpeechEnd');

    if (options.autoRestart && state._microphoneAllowed) {
      updateStatus("No speech detected for a while, restarting...");
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
    console.error("[JSVoice] Speech Recognition Error:", event.error, event.message);
    callCallback('onError', event);
    state._isListening = false;

    let errorMessage = "Voice error.";
    switch (event.error) {
      case "not-allowed":
        errorMessage = "Microphone access denied. Please allow it in browser settings.";
        state._microphoneAllowed = false;
        callCallback('onMicrophonePermissionDenied', event);
        break;
      case "network":
        errorMessage = "Network error. Check your internet connection.";
        if (state._microphoneAllowed && options.autoRestart) {
            updateStatus(`Error: ${errorMessage}. Attempting to reconnect...`);
            setTimeout(() => startRecognitionInternal(), options.restartDelay);
            return;
        }
        break;
      case "no-speech":
        errorMessage = "No speech detected. Try speaking clearer.";
        break;
      case "aborted":
        errorMessage = "Voice recognition aborted.";
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
    state._microphoneAllowed = false;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());

    state._microphoneAllowed = true;
    callCallback('onMicrophonePermissionGranted');
  } catch (error) {
    state._microphoneAllowed = false;
    callCallback('onMicrophonePermissionDenied', error);
    updateStatus("Error: Microphone access denied. Please allow it in browser settings.");
    throw error; // Re-throw so the caller can handle/await its rejection
  }
}