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

export default [
  {
    input: 'src/index.ts',
    output: { file: `${pkg.types}`, format: 'es' },
    plugins: [dts()],
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'spredDOM',
      file: `dist/spred-dom.min.js`,
      format: 'umd',
    },
    plugins: [ts(), terserPlugin],
  },
  {
    input: 'src/index.ts',
    plugins: [ts()],
    output: { file: pkg.main, format: 'cjs' },
  },
  {
    input: 'src/index.ts',
    plugins: [ts()],
    output: { file: pkg.module, format: 'es' },
  },
];
