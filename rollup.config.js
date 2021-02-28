import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from './package.json';
import { resolve } from 'path';

const dependencies = pkg.config.lib.dependencies;
const peerDependencies = pkg.config.lib.peerDependencies;

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default [
  {
    input: 'src/index.tsx',
    external: ['react'],
    plugins: [
      del({ targets: 'dist/*' }),
      typescript({
        typescript: require('typescript'),
      }),
      /*
      babel({
          exclude: 'node_modules/**',
          extensions,
      }),
      */
      postcss({
        modules: true,
        plugins: [],
        extract: resolve(`dist/${pkg.name}.css`),
      }),
      copy({
        targets: [
          { src: 'README.md', dest: 'dist' },
          { src: 'CHANGELOG.md', dest: 'dist' },
        ],
      }),
      generatePackageJson({
        baseContents: (pkg) => ({
          ...pkg,
          name: pkg.name,
          main: `${pkg.name}.umd.js`,
          module: `${pkg.name}.esm.js`,
          typings: `index.d.ts`,
          scripts: undefined,
          dependencies: dependencies,
          devDependencies: {},
          peerDependencies,
          config: undefined,
        }),
      }),
      terser(),
    ],
    output: [
      {
        name: pkg.name,
        file: `dist/${pkg.name}.umd.js`,
        format: 'umd',
        globals: {
          react: 'react',
        },
        sourcemap: true,
      },
      { file: `dist/${pkg.name}.esm.js`, format: 'es', sourcemap: true },
    ],
  },
];
