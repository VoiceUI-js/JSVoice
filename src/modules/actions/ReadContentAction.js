// src/modules/actions/ReadContentAction.js

import { cleanText } from '../../utils/helpers.js';

/**
 * Extracts visible and meaningful text content from a DOM element, attempting to clean it.
 * Prioritizes `data-voice-readable-text` attribute.
 * @param {Element} element
 * @returns {string}
 */
function extractVisibleText(element) {
  // 1. Check for specific text provided via data-attribute
  const dataReadableText = element.getAttribute('data-voice-readable-text');
  if (dataReadableText && dataReadableText.trim().length > 0) {
    return dataReadableText.trim();
  }

  // 2. Fallback to extracting text content from visible nodes
  let text = '';
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const parentElement = node.parentElement;
          if (!parentElement) {
            return NodeFilter.FILTER_SKIP;
          }

          // Filter out script, style, comments
          if (['SCRIPT', 'STYLE'].includes(parentElement.tagName)) {
            return NodeFilter.FILTER_SKIP;
          }
          if (node.nodeType === Node.COMMENT_NODE) {
            return NodeFilter.FILTER_SKIP;
          }

          // Check for visibility (display:none, visibility:hidden, opacity:0, zero size)
          const computedStyle = window.getComputedStyle(parentElement);
          if (
            computedStyle.display === 'none' ||
            computedStyle.visibility === 'hidden' ||
            parseFloat(computedStyle.opacity) === 0
          ) {
            return NodeFilter.FILTER_SKIP;
          }
          const rect = parentElement.getBoundingClientRect();
          // Also check if it's outside viewport or has no actual rendered size
          if (
            rect.width === 0 ||
            rect.height === 0 ||
            rect.bottom < 0 ||
            rect.top > window.innerHeight
          ) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        // For elements, filter out non-displayable/semantic elements before recursing
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName;
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK', 'BR'].includes(tagName)) {
            return NodeFilter.FILTER_SKIP;
          } // Skip specific tags
          const computedStyle = window.getComputedStyle(node);
          if (
            computedStyle.display === 'none' ||
            computedStyle.visibility === 'hidden' ||
            parseFloat(computedStyle.opacity) === 0
          ) {
            return NodeFilter.FILTER_SKIP;
          }
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            return NodeFilter.FILTER_SKIP;
          }
        }
        return NodeFilter.FILTER_SKIP; // Only accept TEXT_NODE after checks
      },
    }
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      text += currentNode.nodeValue + ' ';
    }
  }

  // Clean up whitespace, remove HTML entities (basic)
  text = text
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
  // Basic check to ensure some meaningful text is there after cleaning
  if (cleanText(text).length < 10) {
    return '';
  } // Increased threshold for meaningful text
  return text;
}

/**
 * Finds the most relevant text element in the viewport based on precedence.
 * Precedence: Selected Text > data-voice-readable match > data-voice-readable in viewport > Nearest P/H/Li etc. in viewport.
 * @param {string} cleanedIdentifier Optional cleaned text to search for within readable elements.
 * @returns {HTMLElement|null}
 */
function findRelevantTextElement(cleanedIdentifier = '') {
  // 1. Check for currently selected text first (highest priority for "read this")
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    if (commonAncestor && commonAncestor.nodeType === Node.ELEMENT_NODE) {
      // Attempt to get the actual element from the selection
      let selectedElement = commonAncestor;
      while (
        selectedElement &&
        selectedElement.tagName !== 'P' &&
        selectedElement.tagName !== 'DIV' &&
        selectedElement.tagName !== 'SPAN' &&
        selectedElement.parentElement
      ) {
        selectedElement = selectedElement.parentElement;
      }
      if (selectedElement) {
        return selectedElement;
      }
    }
    // If ancestor isn't an element, or can't find parent, fall through
  }

  const viewportCenterY = window.innerHeight / 2;
  let closestElement = null;
  let minDistance = Infinity;

  // 2. Look for elements explicitly marked as readable with a matching identifier or nearest in viewport
  const markedElements = document.querySelectorAll(
    '[data-voice-readable], [data-voice-readable-text]'
  );
  for (const el of markedElements) {
    const rect = el.getBoundingClientRect();
    // Check if element is at least partially in viewport and has some content area
    if (rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0) {
      const dataVoiceReadable = cleanText(el.getAttribute('data-voice-readable') || '');
      const elementText = extractVisibleText(el);

      // Prioritize exact match on data-voice-readable attribute or if identifier is empty (find nearest marked)
      const isMatch =
        (cleanedIdentifier === '' && dataVoiceReadable.length > 0) || // If no identifier, any marked is potential
        (cleanedIdentifier !== '' && dataVoiceReadable.includes(cleanedIdentifier)); // Specific identifier match

      if (isMatch && elementText.length > 20) {
        // Ensure element has significant text
        const elementCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenterY - elementCenterY);
        if (distance < minDistance) {
          closestElement = el;
          minDistance = distance;
        }
      }
    }
  }
  if (closestElement) {
    return closestElement;
  }

  // 3. Fallback to general text-containing block elements (p, h, li, article, section) near viewport center
  // This is lower priority than explicitly marked elements
  minDistance = Infinity; // Reset minDistance for generic search
  closestElement = null; // Reset closestElement

  const genericElements = document.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, li, article, section, [data-voice-text-block]'
  ); // Added data-voice-text-block for general blocks
  for (const el of genericElements) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0) {
      const elementText = extractVisibleText(el);
      if (
        elementText.length > 20 &&
        (cleanedIdentifier === '' || cleanText(elementText).includes(cleanedIdentifier))
      ) {
        const elementCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenterY - elementCenterY);
        if (distance < minDistance) {
          closestElement = el;
          minDistance = distance;
        }
      }
    }
  }

  return closestElement;
}

/**
 * Handles the built-in 'read' commands.
 * @param {string} rawTranscript - The original recognized speech.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @param {Function} jsVoiceSpeakMethod - The JSVoice instance's speak method.
 * @returns {boolean} True if a read action was performed, false otherwise.
 */
export function handleReadContent(
  rawTranscript,
  cleanedTranscript,
  updateStatus,
  callCallback,
  jsVoiceSpeakMethod
) {
  const s = cleanedTranscript;
  let textToSpeak = '';
  let actionDetails = {};
  let targetElement = null;

  // Command 1: "read this page" or "read page"
  if (s.includes('read this page') || s.includes('read page')) {
    const mainContent = document.querySelector('main') || document.body;
    textToSpeak = extractVisibleText(mainContent);
    actionDetails = { type: 'readPage' };
    targetElement = mainContent;
  }
  // Command 2: "read this paragraph" / "read this"
  else if (s.includes('read this paragraph') || s.includes('read this')) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0 && cleanText(selectedText).length > 10) {
      // Read selection if substantial
      textToSpeak = selectedText;
      actionDetails = { type: 'readSelection' };
    } else {
      targetElement = findRelevantTextElement(); // Find nearest if no strong selection
      if (targetElement) {
        textToSpeak = extractVisibleText(targetElement);
        actionDetails = { type: 'readNearestText', elementTag: targetElement.tagName };
      } else {
        updateStatus('Could not find a prominent text block or selected text to read.');
        return true; // Command was understood, but action not possible
      }
    }
  }
  // Command 3: "read section [header text]" or "read [something]"
  else if (s.startsWith('read section') || s.startsWith('read ')) {
    const identifierRaw = s.replace(/read (section)?/i, '').trim();
    const identifierCleaned = cleanText(identifierRaw);

    if (identifierCleaned) {
      targetElement = findRelevantTextElement(identifierCleaned); // Pass cleaned identifier for specific search

      if (targetElement) {
        textToSpeak = extractVisibleText(targetElement);
        actionDetails = {
          type: 'readSpecificElement',
          identifier: identifierRaw,
          elementTag: targetElement.tagName,
        };
      } else {
        updateStatus(`Could not find a section or element matching "${identifierRaw}".`);
        return true; // Command was understood, but action not possible
      }
    } else {
      // If "read" was said but no identifier, default to reading nearest paragraph
      targetElement = findRelevantTextElement();
      if (targetElement) {
        textToSpeak = extractVisibleText(targetElement);
        actionDetails = { type: 'readNearestText', elementTag: targetElement.tagName };
      } else {
        updateStatus('Could not find any text to read.');
        return true;
      }
    }
  }

  if (textToSpeak.length > 0) {
    jsVoiceSpeakMethod(textToSpeak);
    callCallback('onActionPerformed', actionDetails.type, {
      ...actionDetails,
      textPreview: textToSpeak.substring(0, 100) + '...',
    });
    updateStatus(`Reading content: "${textToSpeak.substring(0, 50)}..."`);
    return true;
  }

  return false;
}
