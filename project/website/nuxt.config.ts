import path from 'node:path';
import type { NuxtConfig } from 'nuxt/config';

export default {
	builder: 'webpack',
	srcDir: path.resolve('./src'),
	compatibilityDate: '2025-01-01', // 不理解为什么会有这么抽象的东西存在
	buildDir: path.resolve('../../.hsqx/nuxt'),
	dir: {
		public: path.resolve('./public'),
	},
	app: {
		buildAssetsDir: '/_ice/',
		head: {
			title: '幻术奇象 Application',
			htmlAttrs: {
				lang: 'zh',
			},
			meta: [
				{ name: 'description', content: '幻术奇象网站' },
				{
					name: 'keywords',
					content: '架空世界观, 世界观, 世界观百科, 架空世界观百科, 幻想生物, 幻术奇象,Thaumaturgy Spectacle',
				},

				// Windows 8/10 磁贴图标
				{ name: 'msapplication-TileImage', content: '/siteicon/144.png' },
			],
			link: [
				// 默认浏览器图标
				{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon', sizes: '256x256' },
				{ rel: 'icon', href: '/favicon.png', type: 'image/png', sizes: '1024x1024' },

				// 苹果设备图标
				{ rel: 'apple-touch-icon', href: '/siteicon/180.png', sizes: '180x180' },
			],
		},
	},
	nitro: {
		preset: 'static',
		output: {
			dir: path.resolve('../../.hsqx/nuxt.output'),
			publicDir: path.resolve('../../build/website'),
		},
	},
	experimental: {
		appManifest: false,
	},
} satisfies NuxtConfig;
