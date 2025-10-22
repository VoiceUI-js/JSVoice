/**
 * Action to reload the current page.
 */
const phrases = ['reload page', 'refresh page'];

export default {
  name: 'reloadPage',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return phrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    ctx.win.location.reload();
    ctx.onStatusChange?.('Reloading page');
    ctx.onActionPerformed?.('reloadPage');
    return true;
  }
};
