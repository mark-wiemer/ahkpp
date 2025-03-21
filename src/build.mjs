import { build } from 'esbuild';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const isProd = args.mode === 'production';

console.log('Building AHK++ in', isProd ? 'production' : 'development', 'mode');

// https://esbuild.github.io/api
build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs', // VS Code limitation, move to ESM requires investigation
    platform: 'node',
    minify: isProd,
    sourcemap: !isProd,
});
