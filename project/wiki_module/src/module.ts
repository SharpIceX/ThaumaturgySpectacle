import path from 'node:path';
import { storeContext } from './context';
import closeHook from './compiler/hooks/close';
import metadataHook from './compiler/hooks/metadata';
import viteTransform from './compiler/vite/transform';
import { createRender } from './compiler/renderer/main';
import { addVitePlugin, defineNuxtModule, createResolver, addLayout, addTypeTemplate, addPlugin } from '@nuxt/kit';

const regExpMarkdown = /\.md$/;
const regExpVue = /\.vue$/;

const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
	meta: {
		name: '@ts/wiki_module',
	},
	async setup(_options, nuxt) {
		// 样式
		nuxt.options.css.push(resolve('./runtime/styles/index.less'), 'katex/dist/katex.css');

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
				src: resolve('./runtime/layout/wiki-container.vue'),
				filename: 'layouts/wiki-container.vue',
			},
			'wiki-container',
		);

		// 类型
		addTypeTemplate({
			src: resolve('./types/index.d.ts'),
			filename: 'types/nuxt-wiki_module.d.ts',
		});
		nuxt.options.alias['#wiki_module'] = resolve('./runtime/components');
		nuxt.options.alias['#wiki_module/*'] = resolve('./runtime/components/*');

		addVitePlugin(viteTransform);

		addPlugin(resolve('./runtime/plugins/head.ts'));

		if (!nuxt.options._prepare) nuxt.hook('pages:resolved', metadataHook);
		nuxt.hook('close', closeHook);

		// 预热
		if (!nuxt.options._prepare) {
			// 初始化 storeContext
			storeContext.renderer = await createRender(path.join(nuxt.options.buildDir, 'cache/markdown-render.db'));
		}
	},
});
