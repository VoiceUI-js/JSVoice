// src/modules/actions/DarkModeAction.js

/**
 * Handles dark/light mode toggle commands.
 * @param {string} cleanedTranscript
 * @param {Function} updateStatus
 * @param {Function} callCallback
 * @returns {boolean}
 */
export function handleDarkMode(cleanedTranscript, updateStatus, callCallback) {
  const s = cleanedTranscript.toLowerCase();
  const root = document.documentElement;
  const prev = root.dataset.theme || 'light';

  if (s.includes("dark mode on")) {
    root.dataset.theme = "dark";
    callCallback("onActionPerformed", "darkModeOn");
    updateStatus("Switched to dark mode.");
    return true;
  }
  if (s.includes("dark mode off") || s.includes("light mode on")) {
    root.dataset.theme = "light";
    callCallback("onActionPerformed", "darkModeOff");
    updateStatus("Switched to light mode.");
    return true;
  }
  if (s.includes("light mode off")) {
    root.dataset.theme = "dark";
    callCallback("onActionPerformed", "darkModeOn");
    updateStatus("Switched to dark mode.");
    return true;
  }
  if (s.includes("toggle dark mode") || s.includes("switch theme")) {
    const next = prev === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    callCallback("onActionPerformed", "toggleDarkMode", next);
    updateStatus(`Switched to ${next} mode.`);
    return true;
  }

  return false;
}
