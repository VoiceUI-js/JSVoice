/**
 * Action to navigate back in the browser's history.
 */
const phrases = ['go back', 'navigate back'];

export default {
  name: 'goBack',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return phrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    ctx.win.history.back();
    ctx.onStatusChange?.('Navigating back');
    ctx.onActionPerformed?.('goBack');
    return true;
  }
};
