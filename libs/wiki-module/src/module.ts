import url from 'node:url';
import path from 'node:path';
import { storeContext } from './context';
import { createRender } from '@ts/wiki_render';
import closeHook from './compiler/hooks/close';
import viteTransform from './compiler/vite/transform';
import metadataHook from './compiler/hooks/scan-metadata/main';
import { addVitePlugin, defineNuxtModule, createResolver, addLayout, addTypeTemplate, useLogger } from '@nuxt/kit';

const regExpMarkdown = /\.md$/;
const regExpVue = /\.vue$/;

const resolver = createResolver(import.meta.url);
const logger = useLogger('@ts/wiki-module');

export default defineNuxtModule({
	meta: {
		name: '@ts/wiki-module',
	},
	async setup(_options, nuxt) {
		// 样式
		nuxt.options.css.push(
			resolver.resolve('./runtime/styles/index.less'),
			url.fileURLToPath(import.meta.resolve('katex/dist/katex.css')),
			url.fileURLToPath(import.meta.resolve('@fontsource-variable/jetbrains-mono')),
		);

		// 允许 Nuxt 解析器识别 .md 后缀
		nuxt.options.extensions.push('.md');

		// Vite Vue 插件支持处理 md 文件
		nuxt.options.vite.vue ||= {};
		const existingInclude = nuxt.options.vite.vue.include || [/\.vue$/];
		const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude];
		nuxt.options.vite.vue.include = [...new Set([...includeArray, regExpMarkdown])];

		// Nuxt 页面元数据扫描支持
		const transform = (nuxt.options.imports.transform ||= {});
		const include = (transform.include ||= [regExpVue]);
		if (!include.includes(regExpMarkdown)) include.push(regExpMarkdown);

		// Nuxt 进行组件处理
		const components = nuxt.options.components;
		if (components && typeof components === 'object' && !Array.isArray(components)) {
			// 初始化
			const transform = components.transform || (components.transform = {});

			// 初始化 include
			const existingInclude = transform.include || [];
			const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude];

			// 写入 include 并去重
			transform.include = [...new Set([...includeArray, regExpMarkdown, regExpVue])];
		}

		addLayout(
			{
				src: resolver.resolve('./runtime/layout/wiki-container.vue'),
				filename: 'layouts/wiki-container.vue',
			},
			'wiki-container',
		);

		// 类型
		addTypeTemplate({
			src: resolver.resolve('./types/index.d.ts'),
			filename: 'types/nuxt-wiki-module.d.ts',
		});
		nuxt.options.alias['#wiki-module'] = resolver.resolve('./runtime/components');
		nuxt.options.alias['#wiki-module/*'] = resolver.resolve('./runtime/components/*');

		addVitePlugin(viteTransform);

		if (!nuxt.options._prepare) nuxt.hook('pages:resolved', await metadataHook(nuxt.options.rootDir));
		nuxt.hook('close', closeHook);

		// 预热
		if (!nuxt.options._prepare) {
			// 初始化 storeContext
			storeContext.renderer = await createRender(
				path.join(nuxt.options.buildDir, 'cache/markdown-render.db'),
				logger,
			);
		}
	},
});
