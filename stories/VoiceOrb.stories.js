import React, { useMemo } from 'react';
import { VoiceKitProvider, VoiceOrb, VoiceStatusPill, VoiceControlBar } from '../src/react/kit/index.js';

function MockVoice(status = 'idle') {
  this._status = status;
  this._listeners = new Set();
  this.options = {};
  this.isListening = status === 'listening';
  this._snapshot = {
    status,
    transcript: { partial: status === 'listening' ? 'hello…' : '', final: '', updatedAt: Date.now() },
    engine: { name: 'StoryMock', mode: 'mock' },
    permissions: { microphone: 'granted' },
  };
}
MockVoice.prototype.getSnapshot = function getSnapshot() {
  return this._snapshot;
};
MockVoice.prototype.subscribe = function subscribe(fn) {
  this._listeners.add(fn);
  fn(this._snapshot, { type: 'init' });
  return () => this._listeners.delete(fn);
};
MockVoice.prototype.toggle = function toggle() {
  this._status = this._status === 'listening' ? 'idle' : 'listening';
  this.isListening = this._status === 'listening';
  this._snapshot = {
    ...this._snapshot,
    status: this._status,
    transcript: {
      partial: this.isListening ? 'hello…' : '',
      final: '',
      updatedAt: Date.now(),
    },
  };
  this._listeners.forEach((l) => l(this._snapshot, { type: 'toggle' }));
};
MockVoice.prototype.start = function start() {
  this._status = 'listening';
  this.isListening = true;
  this._snapshot = { ...this._snapshot, status: 'listening' };
  this._listeners.forEach((l) => l(this._snapshot, { type: 'start' }));
  return Promise.resolve(true);
};
MockVoice.prototype.stop = function stop() {
  this._status = 'idle';
  this.isListening = false;
  this._snapshot = { ...this._snapshot, status: 'idle' };
  this._listeners.forEach((l) => l(this._snapshot, { type: 'stop' }));
};
MockVoice.prototype.listCommands = function listCommands() {
  return [{ id: '1', phrase: 'hello world', type: 'exact', scope: 'global', priority: 0 }];
};
MockVoice.prototype.processText = async function processText() {
  return true;
};
MockVoice.prototype.speak = function speak() {};
MockVoice.prototype.listScopes = function listScopes() {
  return ['global'];
};

function Shell({ status, children }) {
  const voice = useMemo(() => new MockVoice(status), [status]);
  return React.createElement(
    VoiceKitProvider,
    { voice, theme: 'glassDark', persistKey: null },
    React.createElement(
      'div',
      { style: { padding: 24, minWidth: 320, color: '#fff' } },
      children
    )
  );
}

export default {
  title: 'Kit/VoiceOrb',
  component: VoiceOrb,
};

export const Idle = {
  render: () =>
    React.createElement(Shell, { status: 'idle' }, React.createElement(VoiceOrb, { size: 'lg', variant: 'glass' })),
};

export const Listening = {
  render: () =>
    React.createElement(
      Shell,
      { status: 'listening' },
      React.createElement(VoiceOrb, { size: 'lg', variant: 'neon' }),
      React.createElement('div', { style: { height: 12 } }),
      React.createElement(VoiceStatusPill, null)
    ),
};

export const ControlBar = {
  render: () =>
    React.createElement(Shell, { status: 'listening' }, React.createElement(VoiceControlBar, null)),
};
