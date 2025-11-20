import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/js/main.js',
    output: {
      file: pkg.iife,
      format: 'iife',
      name: 'cpNs',
      sourcemap: true,
    },
    plugins: [babel(), terser()],
  },
  {
    input: 'src/js/main.js',
    output: {
      file: pkg.main,
      format: 'esm',
      name: 'cpNs',
      sourcemap: true,
    },
    plugins: [babel()],
  },
];
