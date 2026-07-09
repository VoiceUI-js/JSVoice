'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/ui/hyper', label: 'Home' },
  { href: '/ui/hyper/components', label: 'Components' },
  { href: '/ui/hyper/assistant', label: 'Assistant' },
  { href: '/ui/hyper/commands', label: 'Commands' },
  { href: '/ui/hyper/debug', label: 'Debug' },
  { href: '/ui/hyper/plugins', label: 'Plugins' },
  { href: '/ui/hyper/workflows', label: 'Workflows' },
  { href: '/ui/hyper/widgets', label: 'Widgets' },
  { href: '/ui/hyper/rules', label: 'Rules' },
  { href: '/ui/hyper/voice-mode', label: 'Voice mode' },
  { href: '/ui/hyper/accessibility', label: 'A11y' },
  { href: '/ui/hyper/settings', label: 'Settings' },
  { href: '/ui/hyper/analytics', label: 'Analytics' },
  { href: '/ui/hyper/replay', label: 'Replay' },
  { href: '/ui/hyper/templates', label: 'Templates' },
];

export default function HyperLayout({ children }) {
  const pathname = usePathname();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--jsv-background, #0b0d12)', color: 'var(--jsv-text, #f4f6fb)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.1)', padding: 12, background: 'rgba(20,24,33,0.9)' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, padding: '4px 8px' }}>Hyper UI Kit</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                    background: active ? 'rgba(124,92,255,0.25)' : 'transparent',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ marginTop: 20, padding: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>← Home</Link>
          </div>
        </aside>
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
