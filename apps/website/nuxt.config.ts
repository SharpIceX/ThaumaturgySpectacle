/**
 * SPDX-FileCopyrightText: 2026 锐冰(SharpIce)
 * SPDX-License-Identifier: MPL-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import process from 'node:process';
import packageJson from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

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
	telemetry: false,
	compatibilityDate: 'latest',
	buildId: await GetBuildID(),
	appId: 'thaumaturgy-spectacle',
	srcDir: path.resolve(import.meta.dirname, './src'),
	extends: [path.resolve(import.meta.dirname, '../content')],
	css: ['~/styles/main.less'],
	modules: ['@ts/content-module', 'nuxt-svgo', '@nuxt/eslint', '@nuxtjs/seo'],
	plugins: [{ src: './plugins/nprogress.client.ts', mode: 'client' }],
	alias: {
		$: path.resolve(import.meta.dirname, './node_modules'),
	},
	components: [
		{
			prefix: 'TS',
			path: '~/components',
			pathPrefix: false,
		},
	],
	build: {
		analyze: {
			analyzerMode: 'static',
		},
	},
	linkChecker: {
		skipInspections: ['no-uppercase-chars', 'no-non-ascii-chars'],
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
		headNext: true,
		typedPages: true,
		payloadExtraction: false,
		asyncEntry: isProduction,
		writeEarlyHints: isProduction,
		inlineRouteRules: isProduction,
	},
	features: {
		inlineStyles: true,
	},
	future: {
		typescriptBundlerResolution: true,
	},
	devServer: {
		port: 8190,
		host: '127.0.0.1',
	},
	vite: {
		resolve: {
			preserveSymlinks: true,
		},
		esbuild: {
			drop: isProduction ? ['console', 'debugger'] : [],
		},
		build: {
			cssMinify: 'lightningcss',
		},
		optimizeDeps: {
			include: [
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'@vueuse/integrations/useNProgress',
				'@ts/shared/src/web/preload-image',
			],
		},
	},
	devtools: {
		enabled: !isProduction,
	},
	eslint: {
		checker: false,
		config: {
			stylistic: false,
			standalone: false,
		},
	},
	svgo: {
		dts: true,
		global: false,
		defaultImport: 'component',
	},
	site: {
		name: '幻术奇象',
		url: 'https://ts.sharpice.top',
		currentLocale: 'zh-Hans',
		description: '幻术与奇象 Project',
		author: '锐冰',
		sameAs: ['https://github.com/SharpIceX'],
	},
	robots: {
		credits: false,
		blockAiBots: true,
		blockNonSeoBots: true,
	},
	seo: {
		redirectToCanonicalSiteUrl: true,
	},
	sitemap: {
		xsl: false,
		credits: false,
		zeroRuntime: true,
		minify: isProduction,
		discoverImages: false,
		discoverVideos: false,
	},
	schemaOrg: {
		identity: 'Person',
		minify: isProduction,
	},
	appConfig: {
		defaultKeywords: ['幻术奇象', 'Thaumaturgy Spectacle', 'ThaumaturgySpectacle', '架空世界观'],
	},
	app: {
		buildAssetsDir: '/_ts/',
		rootId: `ts_app`,
		head: {
			viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
			titleTemplate: '%s | 幻术奇象',

			htmlAttrs: {
				lang: 'zh-Hans',
				dir: 'ltr',
			},

			meta: [
				// 描述
				{
					name: 'description',
					content: '幻术与奇象 Project',
				},

				//	Windows 磁贴图标
				{
					name: 'msapplication-TileColor',
					content: '#88C0D0',
				},
				{
					name: 'msapplication-TileImage',
					content: '/siteicon/144.png',
				},

				// 网站主题颜色
				{
					name: 'theme-color',
					content: '#88C0D0',
				},

				// 版权信息
				{
					name: 'copyright',
					content: '© 2020-2026 锐冰 (SharpIce). 保留所有权利。All rights reserved.',
				},

				// 作者
				{
					name: 'author',
					content: '锐冰',
				},

				// 许可证
				{
					name: 'license',
					content: 'https://github.com/SharpIceX/ThaumaturgySpectacle/blob/main/README.md',
				},

				// 禁用浏览器扩展 Dark Reader
				{
					name: 'darkreader-lock',
				},

				// 仅提供深色模式
				{
					name: 'color-scheme',
					content: 'dark',
				},

				// SEO 相关
				{
					name: 'robots',
					content: 'noimageindex, noai, noimageai',
				},
			],

			link: [
				// 图标
				{
					rel: 'icon',
					type: 'image/x-icon',
					sizes: '256x256',
					href: '/favicon.ico',
				},
				{
					rel: 'icon',
					type: 'image/png',
					sizes: '1024x1024',
					href: '/favicon.png',
				},
				{
					rel: 'apple-touch-icon',
					type: 'image/png',
					sizes: '180x180',
					href: '/siteicon/180.png',
				},

				// PWA
				{
					rel: 'manifest',
					href: '/manifest.webmanifest',
				},
			],
		},
	},
});
