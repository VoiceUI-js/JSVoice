import React, { useMemo } from 'react';
import { VoiceKitProvider, VoiceDock, VoiceCommandPalette, VoiceButton, VoiceKitActions } from '../src/react/kit/index.js';

function MockVoice() {
  this.options = {};
  this.isListening = false;
  this._listeners = new Set();
  this._snapshot = {
    status: 'idle',
    transcript: { partial: '', final: 'Ready', updatedAt: Date.now() },
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
  this.isListening = !this.isListening;
  this._snapshot = {
    ...this._snapshot,
    status: this.isListening ? 'listening' : 'idle',
  };
  this._listeners.forEach((l) => l(this._snapshot, { type: 'toggle' }));
};
MockVoice.prototype.start = function start() {
  this.isListening = true;
  this._snapshot = { ...this._snapshot, status: 'listening' };
  this._listeners.forEach((l) => l(this._snapshot));
  return Promise.resolve(true);
};
MockVoice.prototype.stop = function stop() {
  this.isListening = false;
  this._snapshot = { ...this._snapshot, status: 'idle' };
  this._listeners.forEach((l) => l(this._snapshot));
};
MockVoice.prototype.listCommands = function listCommands() {
  return [
    { id: '1', phrase: 'hello world', type: 'exact', scope: 'global', priority: 0 },
    { id: '2', phrase: 'scroll down', type: 'exact', scope: 'global', priority: 0 },
  ];
};
MockVoice.prototype.processText = async function processText() {
  return true;
};
MockVoice.prototype.speak = function speak() {};
MockVoice.prototype.listScopes = function listScopes() {
  return ['global'];
};

function Shell({ children }) {
  const voice = useMemo(() => new MockVoice(), []);
  return React.createElement(
    VoiceKitProvider,
    { voice, theme: 'glassDark', persistKey: null },
    React.createElement(
      'div',
      {
        style: {
          width: 640,
          height: 400,
          position: 'relative',
          background: 'linear-gradient(135deg,#0b0d12,#1a1030)',
          borderRadius: 16,
        },
      },
      children
    )
  );
}

export default {
  title: 'Kit/DockAndPalette',
};

export const Dock = {
  render: () =>
    React.createElement(
      Shell,
      null,
      React.createElement(VoiceDock, { placement: 'bottom-right' })
    ),
};

export const PaletteTrigger = {
  render: () =>
    React.createElement(
      Shell,
      null,
      React.createElement(
        'div',
        { style: { padding: 24 } },
        React.createElement(
          VoiceButton,
          {
            variant: 'primary',
            onClick: () => VoiceKitActions.setPaletteOpen(true),
          },
          'Open command palette'
        )
      ),
      React.createElement(VoiceCommandPalette, null),
      React.createElement(VoiceDock, null)
    ),
};
