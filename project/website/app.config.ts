import type { NuxtConfig } from 'nuxt/config';

export default {
	buildAssetsDir: '/_ts/',
	rootId: `ts_app`,
	head: {
		/*
		// 编码
		// NOTE: 停用`unicorn/text-encoding-identifier-case`备注：根据 MDN 文档，charset 必须是 `utf-8` 而不是 `utf8`
		// eslint-disable-next-line unicorn/text-encoding-identifier-case
		charset: 'utf-8',
		*/

		// 屏幕适配
		viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',

		// 标题模板
		titleTemplate: '%s | 幻术奇象',

		htmlAttrs: {
			lang: 'zh-CN',
			dir: 'ltr',
			'data-overlayscrollbars-initialize': '',
		},

		bodyAttrs: {
			'data-overlayscrollbars-initialize': '',
		},

		meta: [
			// 描述
			{
				name: 'description',
				content: '欢迎来到幻术与奇象世界！',
			},
			{
				name: 'keywords',
				content: '幻术奇象, Thaumaturgy Spectacle, 架空世界观',
			},

			//	Windows 磁贴图标
			{
				name: 'msapplication-TileColor',
				content: '#679DE3',
			},
			{
				name: 'msapplication-TileImage',
				content: '/siteicon/144.png',
			},

			// 网站主题颜色
			{
				name: 'theme-color',
				content: '#679DE3',
			},

			// 版权信息
			{
				name: 'copyright',
				content: '© 2020-2025 锐冰 版权所有 All rights reserved.',
			},

			// 作者
			{
				name: 'author',
				content: '锐冰',
			},

			// 网站生成器
			{
				name: 'generator',
				content: 'Nuxt 4',
			},

			// 许可证
			{
				name: 'license',
				content: 'https://github.com/SharpIceX/ThaumaturgySpectacle/blob/init/README.md',
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

			// RSS
			{
				rel: 'alternate',
				type: 'application/rss+xml',
				title: 'RSS',
				href: '/rss.xml',
			},

			// Atom
			{
				rel: 'alternate',
				type: 'application/atom+xml',
				title: 'Atom',
				href: '/atom.xml',
			},

			// Json Feed
			{
				rel: 'alternate',
				type: 'application/feed+json',
				title: 'JSON Feed',
				href: '/feed.json',
			},
		],
	},
} satisfies NuxtConfig['app'];
