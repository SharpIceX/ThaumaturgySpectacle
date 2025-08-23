import fs from 'node:fs';
import path from 'node:path';
import { type RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// 清理旧的构建文件
if (fs.existsSync('./dist')) fs.rmSync('./dist', { recursive: true, force: true });

export default [
	// CommonJS
	{
		input: path.resolve('./src/main.ts'),
		output: {
			format: 'cjs',
			dir: './dist/commonjs',
			preserveModules: true,
			preserveModulesRoot: 'src',
			entryFileNames: '[name].cjs',
		},
		plugins: [
			nodeResolve(),
			typescript({
				rootDir: './src',
				declaration: false,
				outDir: path.resolve('./dist/commonjs'),
				tsconfig: path.resolve('./tsconfig.json'),
			}),
		],
		external: id => !id.startsWith('.') && !id.startsWith('/'),
	},

	// ESM
	{
		input: path.resolve('./src/main.ts'),
		output: {
			format: 'esm',
			dir: './dist/esm',
			preserveModules: true,
			preserveModulesRoot: 'src',
			entryFileNames: '[name].mjs',
		},
		plugins: [
			nodeResolve(),
			typescript({
				rootDir: './src',
				declaration: true,
				outDir: path.resolve('./dist/esm'),
				tsconfig: path.resolve('./tsconfig.json'),
			}),
		],
		external: id => !id.startsWith('.') && !id.startsWith('/'),
	},
] satisfies RollupOptions[];
