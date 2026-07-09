/**
 * Pure selectors over UI kit + voice snapshot state.
 */

export function selectWidgets(state) {
  return state?.widgets || [];
}

export function selectRules(state) {
  return state?.rules || [];
}

export function selectLinks(state) {
  return state?.links || [];
}

export function selectBookmarks(state) {
  return state?.bookmarks || [];
}

export function selectVoiceMode(state) {
  return !!state?.voiceMode;
}

export function selectEvents(state) {
  return state?.events || [];
}

export function selectUiPrefs(state) {
  return state?.ui || {};
}

export function selectTranscript(state) {
  return state?.transcriptLog || [];
}

export function selectToasts(state) {
  return state?.toasts || [];
}

export function selectPaletteOpen(state) {
  return !!state?.ui?.paletteOpen;
}

export function selectDebugOpen(state) {
  return !!state?.ui?.debugOpen;
}

export function selectDockCollapsed(state) {
  return !!state?.ui?.dockCollapsed;
}

export function selectThemeName(state) {
  return state?.ui?.theme || 'glassDark';
}

/** Voice snapshot selectors */
export function selectStatus(snapshot) {
  return snapshot?.status || 'idle';
}

export function selectPartialTranscript(snapshot) {
  return snapshot?.transcript?.partial || '';
}

export function selectFinalTranscript(snapshot) {
  return snapshot?.transcript?.final || '';
}

export function selectEngineName(snapshot) {
  return snapshot?.engine?.name || snapshot?.engine?.mode || 'unknown';
}

export function selectMicPermission(snapshot) {
  return snapshot?.permissions?.microphone || 'unknown';
}

export function selectFavorites(state) {
  return state?.favorites || [];
}

export function selectCommandHistory(state) {
  return state?.commandHistory || [];
}

export function selectAssistantMessages(state) {
  return state?.assistantMessages || [];
}

export function selectWorkflows(state) {
  return state?.workflows || [];
}

export function selectActiveWorkflow(state) {
  const id = state?.activeWorkflowId;
  return (state?.workflows || []).find((w) => w.id === id) || null;
}

export function selectSessions(state) {
  return state?.sessions || [];
}

export function selectAnalytics(state) {
  return state?.analytics || {};
}

export function selectVoiceModeTags(state) {
  return state?.voiceModeTags || [];
}

export function selectSettingsOpen(state) {
  return !!state?.ui?.settingsOpen;
}

export function selectDensity(state) {
  return state?.ui?.density || 'comfortable';
}

export function selectSuccessRate(state) {
  const a = state?.analytics || {};
  const total = (a.recognized || 0) + (a.failed || 0) + (a.notRecognized || 0);
  if (!total) return 0;
  return (a.recognized || 0) / total;
}

export function selectTopCommands(state, limit = 5) {
  const counts = state?.analytics?.commandCounts || {};
  return Object.entries(counts)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Namespaced selectors for export as VoiceKitSelectors */
export const VoiceKitSelectors = {
  selectWidgets,
  selectRules,
  selectLinks,
  selectBookmarks,
  selectVoiceMode,
  selectEvents,
  selectUiPrefs,
  selectTranscript,
  selectToasts,
  selectPaletteOpen,
  selectDebugOpen,
  selectDockCollapsed,
  selectThemeName,
  selectStatus,
  selectPartialTranscript,
  selectFinalTranscript,
  selectEngineName,
  selectMicPermission,
  selectFavorites,
  selectCommandHistory,
  selectAssistantMessages,
  selectWorkflows,
  selectActiveWorkflow,
  selectSessions,
  selectAnalytics,
  selectVoiceModeTags,
  selectSettingsOpen,
  selectDensity,
  selectSuccessRate,
  selectTopCommands,
};
