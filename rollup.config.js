// rollup.config.js — multi-entry: core + ui-kit + react + react-kit + wake adapter
import pkg from './package.json' with { type: 'json' };
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const babelPlugin = babel({
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: ['@babel/preset-env'],
});

const basePlugins = [resolve(), commonjs(), babelPlugin];

const reactExternals = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'];

/** @type {import('rollup').RollupOptions[]} */
export default [
  // ── Core library (UMD + ESM + CJS) ─────────────────────────────────
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: pkg.browser,
        format: 'umd',
        name: 'JSVoice',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
      {
        file: pkg.unpkg,
        format: 'umd',
        name: 'JSVoice',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
        plugins: [terser()],
      },
    ],
    plugins: basePlugins,
  },

  // ── Framework-agnostic UI kit core ─────────────────────────────────
  {
    input: 'src/ui-kit/index.js',
    external: [...reactExternals],
    output: [
      {
        file: 'dist/ui-kit/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/ui-kit/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },

  // ── React core (provider / hooks) ──────────────────────────────────
  {
    input: 'src/react/index.js',
    external: [...reactExternals],
    output: [
      {
        file: 'dist/react/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/react/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },

  // ── Hyper Voice UI Kit (React) ─────────────────────────────────────
  {
    input: 'src/react/kit/index.js',
    external: [...reactExternals],
    output: [
      {
        file: 'dist/react/kit/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/react/kit/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },

  // ── Optional Porcupine wake adapter (peer: @picovoice/*) ───────────
  {
    input: 'src/engines/PorcupineWakeAdapter.js',
    external: [
      '@picovoice/porcupine-web',
      '@picovoice/web-voice-processor',
    ],
    output: [
      {
        file: 'dist/engines/PorcupineWakeAdapter.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/engines/PorcupineWakeAdapter.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: basePlugins,
  },
];
