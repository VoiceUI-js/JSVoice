'use client';

import React from 'react';
import { HyperDemoShell } from './HyperDemoShell.jsx';

export function SectionPage({ title, children }) {
  return (
    <HyperDemoShell>
      <div style={{ padding: 24 }}>
        {title && <h1 style={{ marginTop: 0, marginBottom: 16 }}>{title}</h1>}
        {children}
      </div>
    </HyperDemoShell>
  );
}
