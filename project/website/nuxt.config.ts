import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import appConfig from './app.config';
import packageJson from '../package.json';
import { defineNuxtConfig } from 'nuxt/config';

const GetBuildID = async (): Promise<string> => {
	const head = await git.resolveRef({ fs, dir: path.resolve(import.meta.dirname, '../../'), ref: 'HEAD' });

	if (!head) {
		throw new Error('无法获取 Git HEAD 引用，HEAD 为空');
	}

	return `${packageJson.version}-${head}`;
};

export default defineNuxtConfig({
	ssr: true,
	pages: true,
	app: appConfig,
	telemetry: false,
	buildId: await GetBuildID(),
	appId: 'thaumaturgy-spectacle',
	compatibilityDate: '2025-07-23',
	srcDir: path.resolve(import.meta.dirname, './src'),
	modules: ['nuxt-svgo', '@unocss/nuxt', '@nuxt/eslint', '@nuxtjs/seo', '@nuxt/content'],
	css: ['@/styles/main.less'],
	alias: {
		'@': path.resolve(import.meta.dirname, './src'),
		$: path.resolve(import.meta.dirname, './node_modules'),
	},
	build: {
		analyze: {
			analyzerMode: 'static',
		},
	},
	nitro: {
		static: true,
		preset: 'static',
		publicAssets: [
			{
				baseURL: '/',
				dir: path.resolve(import.meta.dirname, './public'),
			},
			{
				baseURL: '/',
				dir: path.resolve(import.meta.dirname, '../content/content'),
			},
		],
	},
	devServer: {
		port: 8190,
	},
	vite: {
		resolve: {
			// 让 Vite 解析时保留符号链接。
			// 这个其实是因为在 package.json 使用了 Git 或 URL 依赖所导致的问题。
			preserveSymlinks: true,

			alias: {
				// 若是 JS/TS 项目，直接 require.resolve 最新实际路径
				'entities/decode': require.resolve('entities/lib/decode.js'),
				'entities/escape': require.resolve('entities/lib/escape.js'),
			},
		},
	},
	unocss: {
		nuxtLayers: true,
	},
	site: {
		name: '幻术奇象',
		currentLocale: appConfig.head.htmlAttrs.lang,
		// 从 app.config.ts 获取变量
		description: appConfig.head.meta.find(
			(meta: { name?: string; content?: string }) => meta.name === 'description',
		)?.content,
		url: 'https://ts.sharpice.top',
	},
	eslint: {
		checker: false,
	},
	svgo: {
		svgo: true,
		global: false,
		defaultImport: 'component',
		svgoConfig: {
			multipass: true,
		},
	},
	content: {
		build: {
			transformers: ['./transformers/markdown.ts'],
			markdown: {
				toc: {
					depth: 5,
					searchDepth: 5,
				},
			},
		},
		renderer: {
			anchorLinks: true,
			// TODO: 锚点需进行 URI 编码
		},
	},
});
