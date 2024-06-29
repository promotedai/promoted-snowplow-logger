import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from './package.json' assert { type: 'json' };;
import ts from 'typescript';

export default [
  {
    input: 'src/index.ts',
    external: ['@snowplow/browser-tracker'],
    plugins: [
      del({ targets: 'dist/*' }),
      typescript({
        typescript: ts,
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
          dependencies: {},
          devDependencies: {},
          peerDependencies: {},
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
          '@snowplow/browser-tracker': '@snowplow/browser-tracker',
        },
        sourcemap: true,
      },
      { file: `dist/${pkg.name}.esm.js`, format: 'es', sourcemap: true },
    ],
  },
];
