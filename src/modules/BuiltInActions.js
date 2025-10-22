import ScrollAction from './actions/ScrollAction.js';
import ZoomAction from './actions/ZoomAction.js';
import GoBackAction from './actions/GoBackAction.js';
import GoForwardAction from './actions/GoForwardAction.js';
import ReloadPageAction from './actions/ReloadPageAction.js';
import { handleFillInput } from './actions/FillInputAction.js';
import { handleClick } from './actions/ClickAction.js';
import { handleReadContent } from './actions/ReadContentAction.js'; // NEW import
import { handleDarkMode } from './actions/ToggleDarkModeAction.js';

const actions = [
  ScrollAction,
  ZoomAction,
  GoBackAction,
  GoForwardAction,
  ReloadPageAction
];

export function handleBuiltInActions(rawTranscript, cleanedTranscript, updateStatus, callCallback, jsVoiceSpeakMethod) {

  const ctx = {
    win: window,
    onStatusChange: updateStatus,
    onActionPerformed: (action, payload) => callCallback('onActionPerformed', action, payload)
  };

  for (const action of actions) {
    if (action.test(cleanedTranscript)) {
      action.run(cleanedTranscript, ctx);
      return true;
    }
  }

  // Order defines priority. Read content is placed high due to its common use.
  // Pass rawTranscript here, as some actions (like FillInput or ReadContent) might need it for exact phrasing.
  if (handleReadContent(rawTranscript, cleanedTranscript, updateStatus, callCallback, jsVoiceSpeakMethod)) return true;
  if (handleFillInput(rawTranscript, updateStatus, callCallback)) return true;
  if (handleClick(rawTranscript, updateStatus, callCallback)) return true;
  if (handleDarkMode(cleanedTranscript, updateStatus, callCallback)) return true;

  return false;
}
