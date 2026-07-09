/**
 * Assistant UI — chat-style voice assistant surfaces.
 */
import React, { useState } from 'react';
import { useVoiceKitStore, useVoiceOptional, useVoiceCommands } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { formatTime } from '../../../ui-kit/utils/formatters.js';
import { baseFont, elevatedPanel, glassPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput } from './primitives.js';
import { VoiceStatusPill } from './controls-extra.js';

export function VoiceAssistantMessage({ message }) {
  const isUser = message.role === 'user';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
        ...baseFont,
      },
    },
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '80%',
          padding: '10px 12px',
          borderRadius: 12,
          background: isUser ? 'var(--jsv-primary)' : 'var(--jsv-surface-elevated)',
          color: isUser ? '#fff' : 'var(--jsv-text)',
          border: isUser ? 'none' : '1px solid var(--jsv-border)',
        },
      },
      React.createElement('div', null, message.content),
      React.createElement(
        'div',
        { style: { fontSize: 10, opacity: 0.7, marginTop: 4 } },
        formatTime(message.at)
      )
    )
  );
}

export function VoiceAssistantThinkingState() {
  return React.createElement(
    'div',
    {
      role: 'status',
      className: 'jsv-processing-shimmer',
      style: { padding: 10, borderRadius: 8, color: 'var(--jsv-text-muted)', fontSize: 13 },
    },
    'Thinking…'
  );
}

export function VoiceAssistantResponseCard({ title = 'Response', children, style }) {
  return React.createElement(VoiceCard, { title, style }, children);
}

export function VoiceAssistantCommandCard({ phrase, onRun }) {
  return React.createElement(
    'div',
    {
      style: {
        ...elevatedPanel,
        padding: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      },
    },
    React.createElement('div', null, React.createElement('strong', null, phrase || 'Command')),
    React.createElement(VoiceButton, { size: 'sm', variant: 'primary', onClick: () => onRun?.(phrase) }, 'Run')
  );
}

export function VoiceAssistantResultCard({ title, result }) {
  return React.createElement(
    VoiceCard,
    { title: title || 'Result' },
    React.createElement('pre', { style: { margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' } }, String(result || ''))
  );
}

export function VoiceAssistantSuggestions({ suggestions = [], onPick }) {
  if (!suggestions.length) return null;
  return React.createElement(
    'div',
    { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
    suggestions.map((s) =>
      React.createElement(
        VoiceButton,
        { key: s, size: 'sm', onClick: () => onPick?.(s) },
        s
      )
    )
  );
}

export function VoiceAssistantActions({ onClear }) {
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
    React.createElement(VoiceButton, {
      size: 'sm',
      onClick: () => VoiceKitActions.setPaletteOpen(true),
    }, 'Commands'),
    React.createElement(VoiceButton, {
      size: 'sm',
      onClick: () => VoiceKitActions.setSettingsOpen(true),
    }, 'Settings'),
    React.createElement(VoiceButton, { size: 'sm', variant: 'ghost', onClick: onClear }, 'Clear chat')
  );
}

export function VoiceAssistantMemoryPanel() {
  const history = useVoiceKitStore((s) => s.commandHistory || []);
  return React.createElement(
    VoiceCard,
    { title: 'Recent actions' },
    history.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No recent actions' })
      : history.slice(0, 8).map((h) =>
          React.createElement(
            'div',
            { key: h.id, style: { fontSize: 12, padding: '4px 0', color: 'var(--jsv-text-muted)' } },
            `${formatTime(h.at)} · ${h.phrase || h.command || '—'}`
          )
        )
  );
}

export function VoiceAssistantContextPanel() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  const snapEngine = ui.lastCommand;
  return React.createElement(
    VoiceCard,
    { title: 'Context' },
    React.createElement('div', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, `Scope: ${ui.scope || 'global'}`),
    React.createElement('div', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, `Last command: ${snapEngine || '—'}`),
    React.createElement('div', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, `Theme: ${ui.theme || 'glassDark'}`),
    React.createElement(VoiceStatusPill, { style: { marginTop: 8 } })
  );
}

export function VoiceAssistantEmptyState() {
  return React.createElement(VoiceEmptyState, {
    title: 'Start a conversation',
    description: 'Speak a command or type below. Try “hello kit” or open the command palette.',
  });
}

export function VoiceAssistantWelcome({ title = 'Voice Assistant', subtitle }) {
  return React.createElement(
    'div',
    { style: { marginBottom: 16, ...baseFont } },
    React.createElement('h2', { style: { margin: '0 0 6px' } }, title),
    React.createElement(
      'p',
      { style: { margin: 0, color: 'var(--jsv-text-muted)' } },
      subtitle || 'Voice-first control with command cards, context, and suggestions.'
    )
  );
}

export function VoiceAssistantComposer({ onSend, placeholder = 'Type a message or command…' }) {
  const [value, setValue] = useState('');
  const voice = useVoiceOptional();
  const send = async () => {
    const text = value.trim();
    if (!text) return;
    VoiceKitActions.pushAssistantMessage({ role: 'user', content: text });
    onSend?.(text);
    if (typeof voice?.processText === 'function') {
      try {
        const matched = await voice.processText(text);
        VoiceKitActions.pushAssistantMessage({
          role: 'assistant',
          content: matched ? `Processed: ${text}` : `No match for: ${text}`,
          type: 'result',
        });
        VoiceKitActions.addCommandHistory({ phrase: text, status: matched ? 'manual' : 'miss' });
        VoiceKitActions.trackAnalytics({
          type: matched ? 'recognized' : 'not_recognized',
          phrase: text,
        });
      } catch {
        VoiceKitActions.pushAssistantMessage({
          role: 'assistant',
          content: 'Could not process that command.',
          type: 'error',
        });
      }
    } else {
      VoiceKitActions.pushAssistantMessage({
        role: 'assistant',
        content: 'Voice processText() unavailable. Message stored.',
      });
    }
    setValue('');
  };

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        padding: 12,
        borderTop: '1px solid var(--jsv-border)',
      },
    },
    React.createElement(VoiceInput, {
      label: 'Composer',
      value,
      onChange: setValue,
      placeholder,
      style: { flex: 1 },
      onKeyDown: (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      },
    }),
    React.createElement(VoiceButton, { variant: 'primary', onClick: send, 'aria-label': 'Send message' }, 'Send')
  );
}

export function VoiceAssistantChat({ style }) {
  const messages = useVoiceKitStore((s) => s.assistantMessages || []);
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'log',
      'aria-live': 'polite',
      style: { flex: 1, overflow: 'auto', padding: 16, minHeight: 240, ...style },
    },
    messages.length === 0
      ? React.createElement(VoiceAssistantEmptyState, null)
      : messages.map((m) => React.createElement(VoiceAssistantMessage, { key: m.id, message: m }))
  );
}

export function VoiceAssistantSidebar({ style }) {
  const commands = useVoiceCommands().slice(0, 8);
  return React.createElement(
    'aside',
    {
      style: {
        width: 260,
        borderRight: '1px solid var(--jsv-border)',
        padding: 12,
        overflow: 'auto',
        ...style,
      },
    },
    React.createElement(VoiceAssistantContextPanel, null),
    React.createElement('div', { style: { height: 12 } }),
    React.createElement(VoiceAssistantMemoryPanel, null),
    React.createElement('div', { style: { height: 12 } }),
    React.createElement(
      VoiceCard,
      { title: 'Suggestions' },
      React.createElement(VoiceAssistantSuggestions, {
        suggestions: commands.map((c) => c.phrase),
        onPick: (s) =>
          VoiceKitActions.pushAssistantMessage({ role: 'user', content: s }),
      })
    )
  );
}

export function VoiceAssistantPanel({ style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'flex',
        flexDirection: 'column',
        ...glassPanel,
        minHeight: 420,
        ...baseFont,
        ...style,
      },
    },
    React.createElement(
      'div',
      { style: { padding: 16, borderBottom: '1px solid var(--jsv-border)' } },
      React.createElement(VoiceAssistantWelcome, null),
      React.createElement(VoiceAssistantActions, {
        onClear: () => VoiceKitActions.clearAssistantMessages(),
      })
    ),
    React.createElement(VoiceAssistantChat, null),
    React.createElement(VoiceAssistantComposer, null)
  );
}

export function VoiceAssistantLayout({ children, style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        minHeight: 480,
        ...glassPanel,
        overflow: 'hidden',
        ...baseFont,
        ...style,
      },
    },
    children ||
      React.createElement(
        React.Fragment,
        null,
        React.createElement(VoiceAssistantSidebar, null),
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', minWidth: 0 } },
          React.createElement(VoiceAssistantChat, null),
          React.createElement(VoiceAssistantComposer, null)
        )
      )
  );
}
