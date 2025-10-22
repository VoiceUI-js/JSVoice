/**
 * Action to navigate forward in the browser's history.
 */
const phrases = ['go forward', 'navigate forward'];

export default {
  name: 'goForward',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return phrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    ctx.win.history.forward();
    ctx.onStatusChange?.('Navigating forward');
    ctx.onActionPerformed?.('goForward');
    return true;
  }
};
