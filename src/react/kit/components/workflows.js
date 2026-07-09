/**
 * Simple CSS/SVG workflow builder (no external diagram deps).
 */
import React, { useState } from 'react';
import { useVoiceKitStore } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { WORKFLOW_NODE_TYPES } from '../../../ui-kit/core/constants.js';
import { baseFont, elevatedPanel, glassPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput, VoiceSelect } from './primitives.js';
import { downloadJson } from '../../../ui-kit/utils/domSafe.js';

const NODE_COLORS = {
  trigger: 'var(--jsv-info)',
  command: 'var(--jsv-primary)',
  speak: 'var(--jsv-success)',
  action: 'var(--jsv-warning)',
  condition: '#a855f7',
  delay: 'var(--jsv-idle)',
  end: 'var(--jsv-danger)',
};

export function VoiceWorkflowNode({ node, selected, onSelect }) {
  return React.createElement(
    'button',
    {
      type: 'button',
      onClick: () => onSelect?.(node),
      style: {
        position: 'absolute',
        left: node.x || 40,
        top: node.y || 40,
        minWidth: 120,
        padding: '10px 12px',
        borderRadius: 12,
        border: selected ? '2px solid var(--jsv-primary)' : '1px solid var(--jsv-border)',
        background: 'var(--jsv-surface-elevated)',
        color: 'var(--jsv-text)',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: elevatedPanel.boxShadow,
        ...baseFont,
      },
    },
    React.createElement(
      'div',
      {
        style: {
          fontSize: 10,
          textTransform: 'uppercase',
          color: NODE_COLORS[node.type] || 'var(--jsv-text-muted)',
          marginBottom: 4,
        },
      },
      node.type
    ),
    React.createElement('strong', { style: { fontSize: 13 } }, node.label || node.type)
  );
}

export function VoiceWorkflowEdge({ from, to }) {
  if (!from || !to) return null;
  const x1 = (from.x || 0) + 60;
  const y1 = (from.y || 0) + 30;
  const x2 = (to.x || 0) + 60;
  const y2 = (to.y || 0) + 10;
  return React.createElement('line', {
    x1,
    y1,
    x2,
    y2,
    stroke: 'var(--jsv-border-strong)',
    strokeWidth: 2,
    markerEnd: 'url(#arrow)',
  });
}

export function VoiceWorkflowToolbar({ workflowId, onAdd }) {
  const [type, setType] = useState('command');
  const [label, setLabel] = useState('');
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end', marginBottom: 12 } },
    React.createElement(VoiceSelect, {
      label: 'Node type',
      value: type,
      options: WORKFLOW_NODE_TYPES,
      onChange: setType,
      style: { minWidth: 140 },
    }),
    React.createElement(VoiceInput, {
      label: 'Label',
      value: label,
      onChange: setLabel,
      placeholder: 'Node label',
      style: { minWidth: 160 },
    }),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        onClick: () => {
          if (!workflowId) return;
          const n = VoiceKitActions.addWorkflowNode(workflowId, {
            type,
            label: label || type,
            x: 40 + Math.random() * 200,
            y: 40 + Math.random() * 160,
          });
          onAdd?.(n);
          setLabel('');
        },
      },
      'Add node'
    )
  );
}

export function VoiceWorkflowCanvas({ workflow, selectedId, onSelect, style }) {
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return React.createElement(
    'div',
    {
      style: {
        position: 'relative',
        height: 360,
        ...elevatedPanel,
        background: 'var(--jsv-background)',
        overflow: 'hidden',
        ...style,
      },
    },
    React.createElement(
      'svg',
      { width: '100%', height: '100%', style: { position: 'absolute', inset: 0 } },
      React.createElement(
        'defs',
        null,
        React.createElement(
          'marker',
          {
            id: 'arrow',
            markerWidth: 8,
            markerHeight: 8,
            refX: 6,
            refY: 3,
            orient: 'auto',
          },
          React.createElement('path', { d: 'M0,0 L6,3 L0,6 Z', fill: 'var(--jsv-border-strong)' })
        )
      ),
      edges.map((e, i) =>
        React.createElement(VoiceWorkflowEdge, {
          key: e.id || i,
          from: byId[e.from],
          to: byId[e.to],
        })
      )
    ),
    nodes.map((n) =>
      React.createElement(VoiceWorkflowNode, {
        key: n.id,
        node: n,
        selected: selectedId === n.id,
        onSelect,
      })
    ),
    nodes.length === 0 &&
      React.createElement(
        'div',
        { style: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' } },
        React.createElement(VoiceEmptyState, { title: 'Add nodes to build a flow' })
      )
  );
}

export function VoiceWorkflowInspector({ node }) {
  if (!node) return React.createElement(VoiceEmptyState, { title: 'Select a node' });
  return React.createElement(
    VoiceCard,
    { title: 'Node inspector' },
    React.createElement('pre', {
      style: { margin: 0, fontSize: 12, color: 'var(--jsv-text-muted)' },
    }, JSON.stringify(node, null, 2))
  );
}

export function VoiceWorkflowStepList({ workflow }) {
  const nodes = workflow?.nodes || [];
  return React.createElement(
    VoiceCard,
    { title: 'Steps' },
    nodes.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No steps' })
      : nodes.map((n, i) =>
          React.createElement(
            'div',
            { key: n.id, style: { padding: '6px 0', borderBottom: '1px solid var(--jsv-border)', fontSize: 13 } },
            `${i + 1}. [${n.type}] ${n.label}`
          )
        )
  );
}

export function VoiceWorkflowTriggerNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'trigger' } });
}
export function VoiceWorkflowCommandNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'command' } });
}
export function VoiceWorkflowSpeakNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'speak' } });
}
export function VoiceWorkflowActionNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'action' } });
}
export function VoiceWorkflowConditionNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'condition' } });
}
export function VoiceWorkflowDelayNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'delay' } });
}
export function VoiceWorkflowEndNode(props) {
  return React.createElement(VoiceWorkflowNode, { ...props, node: { ...props.node, type: 'end' } });
}

export function VoiceWorkflowPreview({ workflow }) {
  return React.createElement(
    VoiceCard,
    { title: 'Preview' },
    React.createElement(
      'ol',
      { style: { margin: 0, paddingLeft: 18, color: 'var(--jsv-text-muted)', fontSize: 13 } },
      (workflow?.nodes || []).map((n) => React.createElement('li', { key: n.id }, `${n.type}: ${n.label}`))
    )
  );
}

export function VoiceWorkflowRunPanel({ workflow }) {
  return React.createElement(
    VoiceCard,
    { title: 'Run panel' },
    React.createElement(
      'p',
      { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
      'Workflow execution hooks into app callbacks. Preview order below.'
    ),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        onClick: () =>
          VoiceKitActions.pushToast({
            title: 'Workflow',
            message: `Would run ${workflow?.name || 'workflow'} (${(workflow?.nodes || []).length} steps)`,
            tone: 'info',
          }),
      },
      'Simulate run'
    )
  );
}

export function VoiceWorkflowHistory() {
  const workflows = useVoiceKitStore((s) => s.workflows || []);
  return React.createElement(
    VoiceCard,
    { title: 'Workflows' },
    workflows.map((w) =>
      React.createElement(
        'button',
        {
          key: w.id,
          type: 'button',
          onClick: () => VoiceKitActions.setActiveWorkflow(w.id),
          style: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: 8,
            marginBottom: 6,
            borderRadius: 8,
            border: '1px solid var(--jsv-border)',
            background: 'transparent',
            color: 'var(--jsv-text)',
            cursor: 'pointer',
          },
        },
        `${w.name} · ${(w.nodes || []).length} nodes`
      )
    )
  );
}

export function VoiceWorkflowImportExport({ workflow }) {
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8 } },
    React.createElement(
      VoiceButton,
      {
        onClick: () => downloadJson(`workflow-${workflow?.id || 'new'}.json`, workflow || {}),
      },
      'Export'
    )
  );
}

export function VoiceWorkflowBuilder({ style }) {
  const workflows = useVoiceKitStore((s) => s.workflows || []);
  const activeId = useVoiceKitStore((s) => s.activeWorkflowId);
  const workflow = workflows.find((w) => w.id === activeId) || workflows[0] || null;
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('Morning mode');

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, ...baseFont, ...style } },
    React.createElement(
      'div',
      null,
      React.createElement('h2', { style: { marginTop: 0 } }, 'Workflow builder'),
      React.createElement(
        'p',
        {
          style: {
            margin: '0 0 12px',
            fontSize: 12,
            color: 'var(--jsv-warning)',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--jsv-warning)',
            background: 'rgba(245,158,11,0.08)',
          },
        },
        'Preview: canvas + simulate run. Wire host callbacks for production execution.'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' } },
        React.createElement(VoiceInput, {
          label: 'Name',
          value: name,
          onChange: setName,
          style: { minWidth: 180 },
        }),
        React.createElement(
          VoiceButton,
          {
            variant: 'primary',
            onClick: () => {
              const wf = VoiceKitActions.createWorkflow({
                name,
                nodes: [
                  { id: 'n1', type: 'trigger', label: 'When said', x: 40, y: 80, data: {} },
                  { id: 'n2', type: 'speak', label: 'Good morning', x: 220, y: 80, data: {} },
                  { id: 'n3', type: 'end', label: 'End', x: 400, y: 80, data: {} },
                ],
                edges: [
                  { from: 'n1', to: 'n2' },
                  { from: 'n2', to: 'n3' },
                ],
              });
              // fix node ids after create — addWorkflowNode path is cleaner; update with sample
              VoiceKitActions.updateWorkflow(wf.id, {
                nodes: [
                  { id: 'n1', type: 'trigger', label: `When: ${name}`, x: 40, y: 100 },
                  { id: 'n2', type: 'speak', label: 'Speak greeting', x: 220, y: 100 },
                  { id: 'n3', type: 'action', label: 'Open dashboard', x: 400, y: 100 },
                  { id: 'n4', type: 'end', label: 'End', x: 580, y: 100 },
                ],
                edges: [
                  { from: 'n1', to: 'n2' },
                  { from: 'n2', to: 'n3' },
                  { from: 'n3', to: 'n4' },
                ],
              });
            },
          },
          'New workflow'
        ),
        React.createElement(VoiceWorkflowImportExport, { workflow })
      ),
      workflow && React.createElement(VoiceWorkflowToolbar, { workflowId: workflow.id }),
      workflow
        ? React.createElement(VoiceWorkflowCanvas, {
            workflow,
            selectedId: selected?.id,
            onSelect: setSelected,
          })
        : React.createElement(VoiceEmptyState, { title: 'Create a workflow to begin' })
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 12, alignContent: 'start' } },
      React.createElement(VoiceWorkflowHistory, null),
      React.createElement(VoiceWorkflowInspector, { node: selected }),
      React.createElement(VoiceWorkflowStepList, { workflow }),
      React.createElement(VoiceWorkflowPreview, { workflow }),
      React.createElement(VoiceWorkflowRunPanel, { workflow })
    )
  );
}
