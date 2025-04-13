import path from 'node:path';
import type { NuxtConfig } from 'nuxt/config';

export default {
	builder: 'webpack',
	srcDir: path.resolve('./src'),
	compatibilityDate: '2025-01-01', // 不理解为什么会有这么抽象的东西存在
	buildDir: path.resolve('../../.hsqx/nuxt'),
	modules: ['@ts-nuxt/head'],
	dir: {
		public: path.resolve('./public'),
	},
	app: {
		buildAssetsDir: '/_ice/',
		head: {
			title: '全局标题',
			htmlAttrs: {
				lang: 'zh',
			},
			meta: [
				{ name: 'description', content: '全局描述' },
				{ name: 'keywords', content: 'Nuxt3, 示例' },
			],
			link: [{ rel: 'icon', href: '/favicon.ico' }],
		},
	},
	nitro: {
		preset: 'static',
		output: {
			dir: path.resolve('../../.hsqx/nuxt.output'),
			publicDir: path.resolve('../../build/website'),
		},
	},
} satisfies NuxtConfig;
