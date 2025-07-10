import path from 'node:path';
import UnoCSS from 'unocss/astro';
import type postcss from 'postcss';
import sitemap from '@astrojs/sitemap';
import type { AstroUserConfig } from 'astro';
import postcssConfig from './postcss.config';

export default {
	output: 'static',
	outDir: '../../build/dist',
	site: 'https://ts.sharpice.top',
	build: {
		assets: '_ts',
		format: 'file',
	},
	server: {
		port: 8190,
	},
	prefetch: {
		prefetchAll: true,
	},
	devToolbar: {
		enabled: false,
	},
	integrations: [
		sitemap(),
		UnoCSS({
			injectReset: '@unocss/reset/tailwind.css',
		}),
	],
	vite: {
		css: {
			devSourcemap: true,
			postcss: postcssConfig as postcss.ProcessOptions,
		},
		resolve: {
			preserveSymlinks: true,
			alias: {
				'@': path.resolve(import.meta.dirname, './src'),
				$: path.resolve(import.meta.dirname, './node_modules'),
			},
		},
	},
} satisfies AstroUserConfig;
