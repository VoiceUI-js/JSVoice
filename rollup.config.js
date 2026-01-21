// rollup.config.js
import pkg from './package.json' with { type: 'json' }; // THE FIX: Use import attributes for JSON

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
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
    },
    {
      file: pkg.unpkg,
      format: 'umd',
      name: 'JSVoice',
      sourcemap: true,
      plugins: [terser()],
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    }),
  ],
};