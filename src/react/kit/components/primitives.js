/**
 * Design-system primitives for the Hyper Voice UI Kit.
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { classNames } from '../../../ui-kit/utils/classNames.js';
import { baseFont, btnBase, btnPrimary, elevatedPanel, glassPanel, inputBase, focusRing, blurRing } from '../styles.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { useVoiceKitStore } from '../hooks.js';
import { focusElement } from '../../../ui-kit/utils/accessibility.js';

export function VoiceButton({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  style,
  className,
  ...rest
}) {
  const pad = size === 'sm' ? '6px 10px' : size === 'lg' ? '12px 18px' : '8px 14px';
  const base = variant === 'primary' ? btnPrimary : variant === 'ghost'
    ? { ...btnBase, background: 'transparent', borderColor: 'transparent' }
    : variant === 'danger'
      ? { ...btnPrimary, background: 'var(--jsv-danger)' }
      : btnBase;

  return React.createElement(
    'button',
    {
      type,
      disabled,
      'aria-label': ariaLabel,
      'data-jsvoice-kit': true,
      className: classNames('jsv-btn', className),
      onClick,
      onFocus: focusRing,
      onBlur: (e) => blurRing(e, base.boxShadow || 'none'),
      style: {
        ...base,
        padding: pad,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      },
      ...rest,
    },
    children
  );
}

export function VoiceCard({ title, children, style, className, footer }) {
  return React.createElement(
    'section',
    {
      'data-jsvoice-kit': true,
      className: classNames('jsv-card', className),
      style: { ...elevatedPanel, padding: 'var(--jsv-space-lg, 16px)', ...baseFont, ...style },
    },
    title &&
      React.createElement(
        'h3',
        { style: { margin: '0 0 12px', fontSize: 'var(--jsv-font-size-lg, 16px)' } },
        title
      ),
    children,
    footer && React.createElement('div', { style: { marginTop: 16 } }, footer)
  );
}

export function VoiceInput({ label, value, onChange, placeholder, id, type = 'text', style, ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return React.createElement(
    'label',
    {
      'data-jsvoice-kit': true,
      style: { display: 'flex', flexDirection: 'column', gap: 6, ...baseFont, ...style },
      htmlFor: inputId,
    },
    label &&
      React.createElement(
        'span',
        { style: { fontSize: 'var(--jsv-font-size-sm)', color: 'var(--jsv-text-muted)' } },
        label
      ),
    React.createElement('input', {
      id: inputId,
      type,
      value: value ?? '',
      placeholder,
      onChange: (e) => onChange?.(e.target.value, e),
      style: inputBase,
      ...rest,
    })
  );
}

export function VoiceSelect({ label, value, onChange, options = [], id, style }) {
  const autoId = useId();
  const selectId = id || autoId;
  return React.createElement(
    'label',
    {
      'data-jsvoice-kit': true,
      htmlFor: selectId,
      style: { display: 'flex', flexDirection: 'column', gap: 6, ...baseFont, ...style },
    },
    label &&
      React.createElement(
        'span',
        { style: { fontSize: 'var(--jsv-font-size-sm)', color: 'var(--jsv-text-muted)' } },
        label
      ),
    React.createElement(
      'select',
      {
        id: selectId,
        value: value ?? '',
        onChange: (e) => onChange?.(e.target.value, e),
        style: { ...inputBase, cursor: 'pointer' },
      },
      options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const labelText = typeof opt === 'string' ? opt : opt.label;
        return React.createElement('option', { key: v, value: v }, labelText);
      })
    )
  );
}

export function VoiceTabs({ tabs = [], value, onChange, style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'tablist',
      style: { display: 'flex', gap: 6, flexWrap: 'wrap', ...style },
    },
    tabs.map((tab) => {
      const id = typeof tab === 'string' ? tab : tab.id;
      const label = typeof tab === 'string' ? tab : tab.label;
      const selected = value === id;
      return React.createElement(
        'button',
        {
          key: id,
          type: 'button',
          role: 'tab',
          'aria-selected': selected,
          onClick: () => onChange?.(id),
          style: {
            ...btnBase,
            background: selected ? 'var(--jsv-primary-soft)' : 'transparent',
            borderColor: selected ? 'var(--jsv-primary)' : 'var(--jsv-border)',
            color: selected ? 'var(--jsv-text)' : 'var(--jsv-text-muted)',
            padding: '6px 12px',
            fontSize: 'var(--jsv-font-size-sm)',
          },
        },
        label
      );
    })
  );
}

export function VoiceAccordion({ items = [], style }) {
  const [open, setOpen] = useState(items[0]?.id || null);
  return React.createElement(
    'div',
    { 'data-jsvoice-kit': true, style: { display: 'flex', flexDirection: 'column', gap: 8, ...style } },
    items.map((item) => {
      const isOpen = open === item.id;
      return React.createElement(
        'div',
        {
          key: item.id,
          style: { ...elevatedPanel, overflow: 'hidden' },
        },
        React.createElement(
          'button',
          {
            type: 'button',
            'aria-expanded': isOpen,
            onClick: () => setOpen(isOpen ? null : item.id),
            style: {
              ...btnBase,
              width: '100%',
              justifyContent: 'space-between',
              border: 'none',
              borderRadius: 0,
              background: 'transparent',
            },
          },
          item.title,
          React.createElement('span', { 'aria-hidden': true }, isOpen ? '−' : '+')
        ),
        isOpen &&
          React.createElement(
            'div',
            { style: { padding: '0 14px 14px', color: 'var(--jsv-text-muted)' } },
            item.content
          )
      );
    })
  );
}

export function VoiceTable({ columns = [], rows = [], style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: { overflow: 'auto', ...elevatedPanel, ...style },
    },
    React.createElement(
      'table',
      {
        style: {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--jsv-font-size-sm)',
          ...baseFont,
        },
      },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          columns.map((c) =>
            React.createElement(
              'th',
              {
                key: c.key,
                scope: 'col',
                style: {
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--jsv-border)',
                  color: 'var(--jsv-text-muted)',
                  fontWeight: 600,
                },
              },
              c.label || c.key
            )
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        rows.length === 0
          ? React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                {
                  colSpan: columns.length || 1,
                  style: { padding: 16, color: 'var(--jsv-text-muted)', textAlign: 'center' },
                },
                'No rows'
              )
            )
          : rows.map((row, i) =>
              React.createElement(
                'tr',
                { key: row.id || i },
                columns.map((c) =>
                  React.createElement(
                    'td',
                    {
                      key: c.key,
                      style: {
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--jsv-border)',
                      },
                    },
                    c.render ? c.render(row) : row[c.key]
                  )
                )
              )
            )
      )
    )
  );
}

export function VoiceEmptyState({ title = 'Nothing here yet', description, action }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'status',
      style: {
        textAlign: 'center',
        padding: '32px 16px',
        color: 'var(--jsv-text-muted)',
        ...baseFont,
      },
    },
    React.createElement('div', { style: { fontSize: 28, marginBottom: 8, opacity: 0.5 } }, '○'),
    React.createElement('h4', { style: { margin: '0 0 6px', color: 'var(--jsv-text)' } }, title),
    description && React.createElement('p', { style: { margin: '0 0 12px' } }, description),
    action
  );
}

export function VoiceErrorState({ title = 'Something went wrong', description, onRetry }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'alert',
      style: {
        ...elevatedPanel,
        padding: 16,
        borderColor: 'var(--jsv-danger)',
        ...baseFont,
      },
    },
    React.createElement('h4', { style: { margin: '0 0 6px', color: 'var(--jsv-danger)' } }, title),
    description && React.createElement('p', { style: { margin: '0 0 12px', color: 'var(--jsv-text-muted)' } }, description),
    onRetry && React.createElement(VoiceButton, { variant: 'danger', onClick: onRetry }, 'Retry')
  );
}

export function VoiceLoadingState({ label = 'Loading…' }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'status',
      'aria-busy': true,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        color: 'var(--jsv-text-muted)',
        ...baseFont,
      },
    },
    React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid var(--jsv-border)',
        borderTopColor: 'var(--jsv-primary)',
        animation: 'jsv-spin 0.8s linear infinite',
      },
    }),
    label
  );
}

export function VoiceTooltip({ label, children }) {
  return React.createElement(
    'span',
    {
      'data-jsvoice-kit': true,
      title: label,
      style: { display: 'inline-flex' },
    },
    children
  );
}

export function VoiceModal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    focusElement(ref.current);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    globalThis.window?.addEventListener('keydown', onKey);
    return () => globalThis.window?.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'presentation',
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 'var(--jsv-z-modal, 9800)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'jsv-fade-in var(--jsv-duration-normal) var(--jsv-easing-soft)',
      },
    },
    React.createElement(
      'div',
      {
        role: 'dialog',
        'aria-modal': true,
        'aria-label': title || 'Dialog',
        ref,
        tabIndex: -1,
        onClick: (e) => e.stopPropagation(),
        style: {
          ...glassPanel,
          width: 'min(520px, 100%)',
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 20,
          ...baseFont,
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('h3', { style: { margin: 0 } }, title),
        React.createElement(VoiceButton, { variant: 'ghost', 'aria-label': 'Close dialog', onClick: onClose }, '✕')
      ),
      children,
      footer && React.createElement('div', { style: { marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' } }, footer)
    )
  );
}

export function VoiceDrawer({ open, onClose, title, children, side = 'right' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    globalThis.window?.addEventListener('keydown', onKey);
    return () => globalThis.window?.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const isRight = side !== 'left';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'presentation',
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 'var(--jsv-z-overlay, 9700)',
      },
    },
    React.createElement(
      'aside',
      {
        role: 'dialog',
        'aria-modal': true,
        'aria-label': title || 'Drawer',
        onClick: (e) => e.stopPropagation(),
        style: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          [isRight ? 'right' : 'left']: 0,
          width: 'min(380px, 92vw)',
          ...glassPanel,
          borderRadius: 0,
          padding: 16,
          overflow: 'auto',
          ...baseFont,
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('h3', { style: { margin: 0 } }, title),
        React.createElement(VoiceButton, { variant: 'ghost', 'aria-label': 'Close drawer', onClick: onClose }, '✕')
      ),
      children
    )
  );
}

export function VoiceToastHost() {
  const toasts = useVoiceKitStore((s) => s.toasts || []);
  useEffect(() => {
    if (!toasts.length) return undefined;
    const timers = toasts.map((t) =>
      setTimeout(() => VoiceKitActions.dismissToast(t.id), t.duration || 3200)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (!toasts.length) return null;
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      'aria-live': 'polite',
      style: {
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 'var(--jsv-z-toast, 9900)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
      },
    },
    toasts.map((t) =>
      React.createElement(
        'div',
        {
          key: t.id,
          role: 'status',
          style: {
            ...glassPanel,
            padding: '12px 14px',
            borderLeft: `3px solid ${
              t.tone === 'danger'
                ? 'var(--jsv-danger)'
                : t.tone === 'success'
                  ? 'var(--jsv-success)'
                  : t.tone === 'warning'
                    ? 'var(--jsv-warning)'
                    : 'var(--jsv-info)'
            }`,
            animation: 'jsv-fade-in 160ms ease',
            ...baseFont,
          },
        },
        t.title && React.createElement('div', { style: { fontWeight: 600, marginBottom: 2 } }, t.title),
        React.createElement('div', { style: { color: 'var(--jsv-text-muted)', fontSize: 'var(--jsv-font-size-sm)' } }, t.message),
        React.createElement(
          'button',
          {
            type: 'button',
            'aria-label': 'Dismiss notification',
            onClick: () => VoiceKitActions.dismissToast(t.id),
            style: {
              position: 'absolute',
              // keep simple: inline dismiss via opacity button below
              display: 'none',
            },
          },
          '×'
        )
      )
    )
  );
}

export function VoiceConfirmDialog({
  open,
  title = 'Confirm action?',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  timeoutMs,
}) {
  useEffect(() => {
    if (!open || !timeoutMs) return undefined;
    const t = setTimeout(() => onCancel?.(), timeoutMs);
    return () => clearTimeout(t);
  }, [open, timeoutMs, onCancel]);

  return React.createElement(
    VoiceModal,
    {
      open,
      onClose: onCancel,
      title,
      footer: [
        React.createElement(VoiceButton, { key: 'c', onClick: onCancel }, cancelLabel),
        React.createElement(VoiceButton, { key: 'y', variant: 'primary', onClick: onConfirm }, confirmLabel),
      ],
    },
    React.createElement('p', { style: { margin: 0, color: 'var(--jsv-text-muted)' } }, message),
    React.createElement(
      'p',
      { style: { margin: '12px 0 0', fontSize: 'var(--jsv-font-size-sm)', color: 'var(--jsv-text-muted)' } },
      'Voice: say “yes confirm” or “cancel”'
    )
  );
}

export { glassPanel, elevatedPanel, baseFont, btnBase, btnPrimary, inputBase };
