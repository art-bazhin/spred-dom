import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import pkg from './package.json' with { type: 'json' };

const terserPlugin = terser({
  compress: {
    reduce_vars: false,
    reduce_funcs: false,
  },
});

const external = ['@spred/core'];

export default [
  {
    input: 'src/index.ts',
    output: { file: `${pkg.types}`, format: 'es' },
    plugins: [dts()],
    external,
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'spredDOM',
      file: `dist/spred-dom.min.js`,
      format: 'umd',
      globals: {
        '@spred/core': 'spred',
      },
    },
    plugins: [ts(), terserPlugin],
    external,
  },
  {
    input: 'src/index.ts',
    plugins: [ts()],
    output: { file: pkg.main, format: 'cjs' },
    external,
  },
  {
    input: 'src/index.ts',
    plugins: [ts()],
    output: { file: pkg.module, format: 'es' },
    external,
  },
];
