import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import process from 'node:process';
import appConfig from './app.config';
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
	app: appConfig,
	telemetry: false,
	buildId: await GetBuildID(),
	appId: 'thaumaturgy-spectacle',
	compatibilityDate: '2025-08-28',
	srcDir: path.resolve(import.meta.dirname, './src'),
	extends: [path.resolve(import.meta.dirname, '../content')],
	css: ['$/@unocss/reset/tailwind-v4.css', '~/styles/main.less'],
	modules: ['@ts/wiki_module', 'nuxt-svgo', '@unocss/nuxt', '@nuxt/eslint', '@nuxtjs/seo'],
	plugins: [
		{ src: './plugins/nprogress.ts', mode: 'client' },
		{ src: './plugins/scrollbars.ts', mode: 'client' },
	],
	alias: {
		$: path.resolve(import.meta.dirname, './node_modules'),
	},
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
				'overlayscrollbars',
				'@vueuse/integrations/useNProgress',
				'vue3-toastify',
				'@ts/shared/src/web/preload-image',
			],
		},
	},
	devtools: {
		enabled: !isProduction,
	},
	unocss: {
		nuxtLayers: true,
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
});
