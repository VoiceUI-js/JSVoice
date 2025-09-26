// src/modules/actions/ZoomAction.js

/**
 * Handles all built-in zoom commands.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @returns {boolean} True if a zoom action was performed, false otherwise.
 */
export function handleZoom(cleanedTranscript, updateStatus, callCallback) {
  const s = cleanedTranscript;

  let currentZoom = parseFloat(document.body.style.zoom || '1');
  if (isNaN(currentZoom)) currentZoom = 1;
  const zoomStep = 0.1;
  const minZoom = 0.5;
  const maxZoom = 2.0;

  if (s.includes("zoom in")) {
    let newZoom = Math.min(maxZoom, currentZoom + zoomStep);
    document.body.style.zoom = newZoom;
    callCallback('onActionPerformed', 'zoomIn', newZoom);
    updateStatus(`Zoomed to ${Math.round(newZoom * 100)}%.`); return true;
  }
  if (s.includes("zoom out")) {
    let newZoom = Math.max(minZoom, currentZoom - zoomStep);
    document.body.style.zoom = newZoom;
    callCallback('onActionPerformed', 'zoomOut', newZoom);
    updateStatus(`Zoomed to ${Math.round(newZoom * 100)}%.`); return true;
  }
  if (s.includes("reset zoom")) {
    document.body.style.zoom = 1;
    callCallback('onActionPerformed', 'zoomReset', 1);
    updateStatus("Zoom reset."); return true;
  }

  return false;
}