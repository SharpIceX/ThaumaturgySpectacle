import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import appConfig from './app.config';
import packageJson from './package.json';
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
	compatibilityDate: '2025-08-28',
	srcDir: path.resolve(import.meta.dirname, './src'),
	modules: ['nuxt-svgo', '@unocss/nuxt', '@nuxt/eslint', '@nuxtjs/seo'],
	css: ['@/styles/main.less'],
	extends: [path.resolve(import.meta.dirname, '../content_processor/dist')],
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
		preset: 'cloudflare-pages-static',
		prerender: {
			crawlLinks: true,
			autoSubfolderIndex: true,
		},
		publicAssets: [
			{
				baseURL: '/',
				dir: path.resolve(import.meta.dirname, './public'),
			},
		],
	},
	experimental: {
		payloadExtraction: false,
	},
	devServer: {
		port: 8190,
	},
	vite: {
		resolve: {
			// 让 Vite 解析时保留符号链接。
			// 这个其实是因为在 package.json 使用了 Git 或 URL 依赖所导致的问题。
			preserveSymlinks: true,
		},
		optimizeDeps: {
			include: ['vue3-toastify', 'pangu/browser'],
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
		dts: true,
		global: false,
		defaultImport: 'component',
	},
});
