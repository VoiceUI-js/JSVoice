
/**
 * Action to zoom the page.
 */
const zoomInPhrases = ['zoom in'];
const zoomOutPhrases = ['zoom out'];
const zoomResetPhrases = ['reset zoom'];
const allPhrases = [...zoomInPhrases, ...zoomOutPhrases, ...zoomResetPhrases];

export default {
  name: 'zoom',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return allPhrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    const p = phrase.toLowerCase().trim();
    const win = ctx.win || window;
    const doc = win.document;
    const body = doc.body;

    let currentZoom = parseFloat(body.style.zoom || '1');
    if (isNaN(currentZoom)) currentZoom = 1;
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 2.0;

    if (zoomInPhrases.some(x => p.includes(x))) {
        let newZoom = Math.min(maxZoom, currentZoom + zoomStep);
        body.style.zoom = newZoom;
        ctx.onActionPerformed?.('zoomIn', newZoom);
        ctx.onStatusChange?.(`Zoomed to ${Math.round(newZoom * 100)}%`);
        return true;
    }
    if (zoomOutPhrases.some(x => p.includes(x))) {
        let newZoom = Math.max(minZoom, currentZoom - zoomStep);
        body.style.zoom = newZoom;
        ctx.onActionPerformed?.('zoomOut', newZoom);
        ctx.onStatusChange?.(`Zoomed to ${Math.round(newZoom * 100)}%`);
        return true;
    }
    if (zoomResetPhrases.some(x => p.includes(x))) {
        body.style.zoom = 1;
        ctx.onActionPerformed?.('zoomReset', 1);
        ctx.onStatusChange?.("Zoom reset.");
        return true;
    }
    return false;
  }
};
