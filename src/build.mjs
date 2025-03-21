import { build } from 'esbuild';
import minimist from 'minimist';

/* eslint-disable-next-line no-undef */
const args = minimist(process.argv.slice(2));
const isUnitTest = args.mode === 'unit-test';
const isProd = args.mode === 'production';
const entryPoints = [];

// https://esbuild.github.io/api
const buildOptions = {
    entryPoints: entryPoints,
    bundle: true,
    format: 'cjs', // VS Code limitation, move to ESM requires investigation
    platform: 'node',
    minify: isProd,
    sourcemap: !isProd && !isUnitTest,
};

/* eslint-disable-next-line no-undef */
console.log(`Building AHK++ in ${args.mode ?? 'development'} mode`);

if (isUnitTest) {
    const outdir = 'out';
    entryPoints.push('./src/**/*utils.ts');
    build({
        ...buildOptions,
        outdir: outdir,
        bundle: true,
        external: ['vscode'],
    });
    build({
        ...buildOptions,
        entryPoints: ['./src/**/*utils.test.ts'],
        bundle: false,
        outdir: outdir,
    });
} else {
    entryPoints.push('./src/extension.ts');
    build({
        ...buildOptions,
        outfile: 'dist/extension.js',
        external: ['vscode'],
    });
}
