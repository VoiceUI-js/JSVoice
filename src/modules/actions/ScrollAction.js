
/**
 * Action to scroll the page.
 */
const scrollDownPhrases = ['scroll down'];
const scrollUpPhrases = ['scroll up'];
const scrollToBottomPhrases = ['scroll full down', 'scroll to bottom', 'scroll down full'];
const scrollToTopPhrases = ['scroll full up', 'scroll to top', 'scroll up full'];

const allPhrases = [...scrollDownPhrases, ...scrollUpPhrases, ...scrollToBottomPhrases, ...scrollToTopPhrases];

export default {
  name: 'scroll',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return allPhrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    const p = phrase.toLowerCase().trim();
    const win = ctx.win || window;
    const doc = win.document;

    if (scrollDownPhrases.some(x => p.includes(x))) {
        win.scrollBy({ top: 500, behavior: "smooth" });
        ctx.onActionPerformed?.('scrollDown', 500);
        ctx.onStatusChange?.("Scrolled down.");
        return true;
    }
    if (scrollUpPhrases.some(x => p.includes(x))) {
        win.scrollBy({ top: -500, behavior: "smooth" });
        ctx.onActionPerformed?.('scrollUp', 500);
        ctx.onStatusChange?.("Scrolled up.");
        return true;
    }
    if (scrollToBottomPhrases.some(x => p.includes(x))) {
        win.scrollTo({ top: doc.documentElement.scrollHeight, behavior: "smooth" });
        ctx.onActionPerformed?.('scrollToBottom');
        ctx.onStatusChange?.("Scrolled to bottom.");
        return true;
    }
    if (scrollToTopPhrases.some(x => p.includes(x))) {
        win.scrollTo({ top: 0, behavior: "smooth" });
        ctx.onActionPerformed?.('scrollToTop');
        ctx.onStatusChange?.("Scrolled to top.");
        return true;
    }
    return false;
  }
};
