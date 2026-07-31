/**
 * @jsvoice/react/kit — Hyper Voice UI Kit (React)
 *
 * LEAD (AI/integrators):
 *   1. Create voice with createVoice() from 'jsvoice' (default local Whisper).
 *   2. Pass that instance to <VoiceKitProvider voice={voice}>.
 *   3. Client-only / SSR-safe (guard window; Next: 'use client').
 *   4. Model progress: VoiceModelLoadCard · onModelLoadProgress on createVoice.
 *   5. Guides: docs/AI_IMPLEMENTATION.md · docs/HYPER_VOICE_UI_KIT.md · AGENTS.md
 *   6. Peer: react, react-dom; STT peer: @xenova/transformers
 */

// Provider
export { VoiceKitProvider } from './VoiceKitProvider.js';
export { VoiceKitContext } from './context.js';

// Hooks
export {
  useVoiceKit,
  useVoiceKitOptional,
  useVoiceKitStore,
  useVoiceOptional,
  useVoiceCommands,
  useVoiceTranscript,
  useVoiceTheme,
  useVoiceDebug,
  useVoicePermissions,
  useVoicePlugins,
  useVoiceWidgets,
  useVoiceRules,
  useVoiceUi,
} from './hooks.js';

// Legacy kit pieces (preserved)
export {
  IntentBadge,
  FocusTimer,
  ConfirmationOverlay,
  HistoryPanel,
  AdvancedPanel,
  FilterBar,
  SimulationBanner,
  TourOverlay,
  SnapshotList,
} from './components.js';

export { kitStore, useKitState, KitActions } from './store.js';
export { themes, getThemeStyles, VoiceKitTheme } from './themes/index.js';
export { useUiKitState } from '../../ui-kit/core/useUiKitState.js';

// Primitives
export {
  VoiceButton,
  VoiceCard,
  VoiceInput,
  VoiceSelect,
  VoiceTabs,
  VoiceAccordion,
  VoiceTable,
  VoiceEmptyState,
  VoiceErrorState,
  VoiceLoadingState,
  VoiceTooltip,
  VoiceModal,
  VoiceDrawer,
  VoiceToastHost,
  VoiceConfirmDialog,
} from './components/primitives.js';

// Core voice UI
export {
  VoiceOrb,
  VoiceDock,
  VoiceHUD,
  VoiceStatusBadge,
  WakeWordIndicator,
  PushToTalkButton,
  HoldToSpeakButton,
  VoiceWaveform,
  VoiceAmplitudeMeter,
  VoicePermissionCard,
  VoiceEngineSwitcher,
  VoiceScopeSwitcher,
  VoiceCommandItem,
  VoiceCommandList,
  VoiceCommandPalette,
  VoiceTranscript,
  VoiceTranscriptLine,
  VoiceThemeSwitcher,
  setUiScope,
} from './components/voice-controls.js';

// Phase 2 controls
export {
  VoiceFloatingButton,
  VoiceMiniDock,
  VoiceFullDock,
  VoiceControlBar,
  VoiceStatusPill,
  VoiceStatusRing,
  VoiceListeningIndicator,
  VoiceSpeakingIndicator,
  VoiceProcessingIndicator,
  VoiceMicButton,
  VoiceMuteButton,
  VoiceStopButton,
  VoiceRestartButton,
  VoiceWakeButton,
  VoiceVolumeControl,
  VoiceSpeedControl,
  VoiceLanguageSelect,
  VoiceEngineSelect,
  VoiceScopeSelect,
  VoiceModeToggle,
  VoiceCompactControls,
  VoiceMobileControls,
} from './components/controls-extra.js';

// Assistant
export {
  VoiceAssistantPanel,
  VoiceAssistantChat,
  VoiceAssistantMessage,
  VoiceAssistantComposer,
  VoiceAssistantSuggestions,
  VoiceAssistantActions,
  VoiceAssistantMemoryPanel,
  VoiceAssistantContextPanel,
  VoiceAssistantThinkingState,
  VoiceAssistantResponseCard,
  VoiceAssistantCommandCard,
  VoiceAssistantResultCard,
  VoiceAssistantEmptyState,
  VoiceAssistantWelcome,
  VoiceAssistantSidebar,
  VoiceAssistantLayout,
} from './components/assistant.js';

// Commands expanded
export {
  VoiceCommandGrid,
  VoiceCommandCard,
  VoiceCommandGroup,
  VoiceCommandCategoryTabs,
  VoiceCommandSearch,
  VoiceCommandFilterBar,
  VoiceCommandDetailsPanel,
  VoiceCommandPreview,
  VoiceCommandRunButton,
  VoiceCommandCopyButton,
  VoiceCommandExamples,
  VoiceCommandVariables,
  VoiceCommandSourceBadge,
  VoiceCommandScopeBadge,
  VoiceCommandConfidenceMeter,
  VoiceCommandHistory,
  VoiceCommandFavorites,
  VoiceCommandShortcutRecorder,
  VoiceCommandImportExport,
} from './components/commands-extra.js';

// Transcript expanded
export {
  VoiceTranscriptPanel,
  VoiceTranscriptFeed,
  VoiceTranscriptCard,
  VoiceTranscriptSearch,
  VoiceTranscriptFilters,
  VoiceTranscriptExport,
  VoiceTranscriptStats,
  VoiceTranscriptTimeline,
  VoiceTranscriptDiff,
  VoiceTranscriptConfidence,
  VoiceTranscriptInspector,
  VoiceTranscriptPrivacyNotice,
  VoiceTranscriptReplayButton,
  VoiceTranscriptBookmarkButton,
  VoiceTranscriptClearButton,
} from './components/transcript-extra.js';

// Phase 1 advanced panels
export {
  CommandCenter,
  CommandSearch,
  CommandGroups,
  CommandInspector,
  CommandBuilder,
  PatternCommandBuilder,
  EntityEditor,
  ScopeManager,
  CommandTester,
  VoiceDebugPanel,
  RecognitionTimeline,
  EventLogViewer,
  TelemetryPanel,
  EngineStatusPanel,
  CommandTrace,
  SessionReplayPanel,
  SnapshotViewer,
  VoiceOnboarding,
  PermissionStep,
  WakeWordStep,
  TestCommandStep,
  BrowserSupportStep,
  CompletionStep,
  PluginCenter,
  PluginCard,
  PluginSettingsPanel,
  PluginStatusBadge,
  RuleBuilder,
  RuleConditionEditor,
  RuleActionEditor,
  RulePreview,
  WidgetCanvas,
  WidgetPanel,
  WidgetInspector,
  WidgetLibrary,
  WidgetRenderer,
  VoiceModeOverlay,
  VoiceFocusRing,
  VoiceHintLayer,
  VoiceNumberTags,
  VoiceGuidedTour,
  HyperVoiceShell,
  VoiceKitWorkbench,
} from './components/panels.js';

// DevTools
export {
  VoiceDevTools,
  VoiceDevToolsDock,
  VoiceDevToolsPanel,
  VoiceSnapshotPanel,
  VoiceStateInspector,
  VoiceEventTimeline,
  VoiceErrorConsole,
  VoiceCommandTracePanel,
  VoiceRecognitionTrace,
  VoiceEngineDiagnostics,
  VoicePermissionDiagnostics,
  VoicePerformancePanel,
  VoiceLatencyMeter,
  VoiceTelemetryChart,
  VoiceCircuitBreakerPanel,
  VoiceLogSearch,
  VoiceLogExport,
  VoiceDebugReportButton,
} from './components/devtools.js';

// Plugins
export {
  VoicePluginMarketplace,
  VoicePluginGrid,
  VoicePluginCard,
  VoicePluginDetails,
  VoicePluginSettings,
  VoicePluginPermissions,
  VoicePluginEvents,
  VoicePluginLogs,
  VoicePluginCommandList,
  VoicePluginStatusBadge,
  VoicePluginInstallButton,
  VoicePluginToggle,
  VoicePluginHealthCheck,
  VoicePluginCompatibility,
} from './components/plugins-extra.js';

// Workflows
export {
  VoiceWorkflowBuilder,
  VoiceWorkflowCanvas,
  VoiceWorkflowNode,
  VoiceWorkflowEdge,
  VoiceWorkflowToolbar,
  VoiceWorkflowInspector,
  VoiceWorkflowStepList,
  VoiceWorkflowTriggerNode,
  VoiceWorkflowCommandNode,
  VoiceWorkflowSpeakNode,
  VoiceWorkflowActionNode,
  VoiceWorkflowConditionNode,
  VoiceWorkflowDelayNode,
  VoiceWorkflowEndNode,
  VoiceWorkflowPreview,
  VoiceWorkflowRunPanel,
  VoiceWorkflowHistory,
  VoiceWorkflowImportExport,
} from './components/workflows.js';

// Widgets expanded
export {
  VoiceWidgetDashboard,
  VoiceWidgetCanvas,
  VoiceWidgetGrid,
  VoiceWidgetCard,
  VoiceWidgetToolbar,
  VoiceWidgetInspector,
  VoiceWidgetLibrary,
  VoiceWidgetSearch,
  VoiceWidgetCategoryTabs,
  VoiceWidgetResizeHandle,
  VoiceWidgetMoveHandle,
  VoiceWidgetEmptyState,
  VoiceWidgetLinkPanel,
  VoiceWidgetBookmarkPanel,
  VoiceWidgetRulePanel,
  VoiceWidgetHistoryPanel,
  VoiceWidgetImportExport,
  MetricWidget,
  TextWidget,
  ListWidget,
  TableWidget,
  StatusWidget,
  TranscriptWidget,
  CommandWidget,
  ShortcutWidget,
  ActionWidget,
  BookmarkWidget,
  SummaryWidget,
  DebugWidget,
  PluginWidget,
  RuleWidget,
  WorkflowWidget,
  AssistantWidget,
  NotificationWidget,
} from './components/widgets-extra.js';

// Voice mode
export {
  VoiceModeShell,
  VoiceModeToolbar,
  VoiceModeHintLayer,
  VoiceModeCommandHints,
  VoiceModeElementScanner,
  VoiceModeRegionMap,
  VoiceModeActionMenu,
  VoiceModeKeyboardHelp,
  VoiceModeSafeClickConfirm,
  VoiceModePageSummary,
  VoiceModeReadingPanel,
  VoiceModeNavigationHints,
  VoiceModePanel,
} from './components/voicemode-extra.js';

// Accessibility
export {
  VoiceA11yPanel,
  VoiceA11yChecklist,
  VoiceA11yStatus,
  VoiceA11yLiveRegion,
  VoiceA11yKeyboardHelp,
  VoiceA11yReducedMotionToggle,
  VoiceA11yHighContrastToggle,
  VoiceA11yFocusPreview,
  VoiceA11yScreenReaderHints,
  VoiceA11yTapTargetInspector,
} from './components/a11y.js';

// Settings
export {
  VoiceSettingsPanel,
  VoiceSettingsDrawer,
  VoiceSettingsModal,
  VoiceSettingsTabs,
  VoiceGeneralSettings,
  VoiceMicSettings,
  VoiceEngineSettings,
  VoiceThemeSettings,
  VoiceCommandSettings,
  VoicePluginSettingsTab,
  VoicePrivacySettings,
  VoiceDebugSettings,
  VoiceAccessibilitySettings,
  VoicePersistenceSettings,
  VoiceResetSettings,
} from './components/settings.js';

// Analytics
export {
  VoiceAnalyticsDashboard,
  VoiceAnalyticsCards,
  VoiceCommandUsageChart,
  VoiceRecognitionSuccessRate,
  VoiceFailureBreakdown,
  VoiceLatencyChart,
  VoiceEngineUsageChart,
  VoiceSessionStats,
  VoiceTopCommands,
  VoiceUnrecognizedPhrases,
  VoiceAnalyticsExport,
} from './components/analytics.js';

// Errors
export {
  VoiceErrorBoundary,
  VoiceErrorCard,
  VoiceErrorToast,
  VoicePermissionErrorCard,
  VoiceUnsupportedBrowserCard,
  VoiceInsecureContextCard,
  VoiceMicBlockedCard,
  VoiceEngineUnavailableCard,
  VoiceFallbackNotice,
  VoiceRecoveryPanel,
  VoiceTroubleshootingSteps,
  VoiceModelLoadCard,
  VoiceTransformersMissingCard,
} from './components/errors.js';

// Layouts
export {
  VoiceKitShell,
  VoiceDashboardLayout,
  VoiceWorkbenchLayout,
  VoiceDevToolsLayout,
  VoiceSettingsLayout,
  VoiceSplitPanel,
  VoiceResizablePanel,
  VoiceSidebar,
  VoiceTopbar,
  VoiceBottombar,
  VoicePanelStack,
  VoiceFloatingLayer,
} from './components/layouts.js';

// Templates
export {
  VoiceDashboardTemplate,
  VoiceAssistantTemplate,
  VoiceCommandCenterTemplate,
  VoiceDebugLabTemplate,
  VoiceAccessibilityTemplate,
  VoiceWidgetBuilderTemplate,
  VoiceWorkflowBuilderTemplate,
  VoiceMiniOverlayTemplate,
  VoicePluginCenterTemplate,
  VoiceRulesTemplate,
  VoiceTemplateGallery,
} from './components/templates.js';

// Command packs (for manual install)
export {
  VoiceKitCommandPack,
  VoiceSettingsCommandPack,
  VoiceDebugCommandPack,
  VoiceWidgetCommandPack,
  VoiceWorkflowCommandPack,
  VoiceA11yCommandPack,
  installKitCommandPacks,
  ALL_KIT_PACKS,
} from '../../packs/kit.js';

// Framework-agnostic helpers
export {
  createVoiceTheme,
  resolveTheme,
  builtInThemes,
  themeNames,
  VoiceKitActions,
  createVoiceKitController,
  createVoiceKitStore,
  uikitStore,
  VoiceKitSelectors,
} from '../../ui-kit/index.js';
