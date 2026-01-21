/**
 * @jsvoice/react/kit/themes
 * Theming system for JSVoice UI Kit components.
 * 
 * Supports:
 * - Built-in themes: 'dark' (default), 'light', 'cyberpunk', 'glass'
 * - CSS Variables injection for easy customization.
 */

export const themes = {
    dark: {
        '--jv-bg-surface': '#1a1a1a',
        '--jv-bg-panel': '#222',
        '--jv-border': '#444',
        '--jv-text-primary': '#fff',
        '--jv-text-secondary': '#888',
        '--jv-accent': '#2563eb',
        '--jv-danger': '#ef4444',
        '--jv-focus-ring': 'rgba(37, 99, 235, 0.5)',
        '--jv-radius-sm': '8px',
        '--jv-radius-md': '12px',
        '--jv-radius-lg': '24px',
    },
    light: {
        '--jv-bg-surface': '#ffffff',
        '--jv-bg-panel': '#f3f4f6',
        '--jv-border': '#e5e7eb',
        '--jv-text-primary': '#111',
        '--jv-text-secondary': '#666',
        '--jv-accent': '#2563eb',
        '--jv-danger': '#ef4444',
        '--jv-focus-ring': 'rgba(37, 99, 235, 0.3)',
        '--jv-radius-sm': '8px',
        '--jv-radius-md': '12px',
        '--jv-radius-lg': '24px',
    },
    cyberpunk: {
        '--jv-bg-surface': '#050510',
        '--jv-bg-panel': '#0a0a20',
        '--jv-border': '#00ffcc',
        '--jv-text-primary': '#00ffcc',
        '--jv-text-secondary': '#ff00ff',
        '--jv-accent': '#ff00ff',
        '--jv-danger': '#ff0000',
        '--jv-focus-ring': 'rgba(0, 255, 204, 0.5)',
        '--jv-radius-sm': '0px',
        '--jv-radius-md': '4px',
        '--jv-radius-lg': '8px',
    },
    glass: {
        '--jv-bg-surface': 'rgba(255, 255, 255, 0.1)',
        '--jv-bg-panel': 'rgba(255, 255, 255, 0.05)',
        '--jv-border': 'rgba(255, 255, 255, 0.2)',
        '--jv-text-primary': '#fff',
        '--jv-text-secondary': 'rgba(255, 255, 255, 0.7)',
        '--jv-accent': '#60a5fa',
        '--jv-danger': '#f87171',
        '--jv-focus-ring': 'rgba(96, 165, 250, 0.5)',
        '--jv-radius-sm': '12px',
        '--jv-radius-md': '16px',
        '--jv-radius-lg': '32px',
    },
    premium_dark_orange: {
        '--jv-bg-surface': 'rgba(20, 20, 25, 0.85)',
        '--jv-bg-panel': 'rgba(30, 30, 35, 0.6)',
        '--jv-border': 'rgba(255, 140, 0, 0.2)',
        '--jv-text-primary': '#ffffff',
        '--jv-text-secondary': 'rgba(255, 255, 255, 0.6)',
        '--jv-accent': '#ff8c00', // Dark Orange
        '--jv-danger': '#ff4d4d',
        '--jv-focus-ring': 'rgba(255, 140, 0, 0.4)',
        '--jv-radius-sm': '6px',
        '--jv-radius-md': '10px',
        '--jv-radius-lg': '18px',
        // Advanced
        '--jv-shadow-sm': '0 2px 8px rgba(0,0,0,0.4)',
        '--jv-shadow-glow': '0 0 15px rgba(255, 140, 0, 0.15)',
        '--jv-backdrop-blur': '12px',
        // Motion
        '--jv-anim-enter': 'jv-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        '--jv-anim-pulse': 'jv-pulse 2s infinite ease-in-out'
    }
};

/**
 * Injects theme variables into a style object (for inline styles)
 * or returns CSS string for <style> tag.
 */
export function getThemeStyles(themeName = 'dark') {
    const theme = themes[themeName] || themes.dark;
    return theme;
}

/**
 * React Component to inject global styles for the kit
 */
import React from 'react';

export function VoiceKitTheme({ theme = 'dark' }) {
    const vars = getThemeStyles(theme);

    // Construct CSS string
    const cssVars = Object.entries(vars)
        .map(([key, val]) => `${key}: ${val};`)
        .join(' ');

    const styleString = `
        :root { ${cssVars} }
        /* Reset for kit components if needed */
        [data-jsvoice-kit] * {box-sizing: border-box;}
        
        /* Animations */
        @keyframes jv-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes jv-slide-up { from { opacity: 0; transform: translateY(15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes jv-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
    `;

    return React.createElement('style', null, styleString);
}
