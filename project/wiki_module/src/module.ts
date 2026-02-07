import path from 'node:path';
import { moduleStore } from './store';
import closeHook from './compiler/hooks/close';
import { Renderer } from './compiler/renderer/main';
import ViteVirtual from './compiler/plugin/virtual';
import metadataHook from './compiler/hooks/metadata';
import tsconfigHook from './compiler/hooks/tsconfig';
import viteTransform from './compiler/plugin/transform';
import { getRenderer } from './compiler/renderer/markdown';
import { addVitePlugin, defineNuxtModule, createResolver, addLayout, useLogger } from '@nuxt/kit';

const regExpAsciiDocument = /\.md$/;
const regExpVue = /\.vue$/;

const { resolve } = createResolver(import.meta.url);
const logger = useLogger('@ts/wiki_module');

export default defineNuxtModule({
	meta: {
		name: '@ts/wiki_module',
	},
	async setup(_options, nuxt) {
		// 样式
		nuxt.options.css.push(resolve('./runtime/styles/index.less'), resolve('../node_modules/katex/dist/katex.css'));

		// 允许 Nuxt 解析器识别 .md 后缀
		nuxt.options.extensions.push('.md');

		// Vite Vue 插件支持处理 md 文件
		nuxt.options.vite ||= {};
		nuxt.options.vite.vue ||= {};
		const existingInclude = nuxt.options.vite.vue.include || [regExpVue];
		const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude]; //转换为数组
		nuxt.options.vite.vue.include = [...new Set([...includeArray, regExpAsciiDocument])]; // 去重

		// Nuxt 页面元数据扫描支持
		const transform = (nuxt.options.imports.transform ||= {});
		const include = (transform.include ||= [regExpVue]);
		if (!include.includes(regExpAsciiDocument)) include.push(regExpAsciiDocument);

		// Nuxt 进行组件处理
		const components = nuxt.options.components;
		if (components && typeof components === 'object' && !Array.isArray(components)) {
			// 初始化
			const transform = components.transform || (components.transform = {});

			// 初始化 include
			const existingInclude = transform.include || [];
			const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude];

			// 写入 include 并去重
			transform.include = [...new Set([...includeArray, regExpAsciiDocument, regExpVue])];
		}

		if (!nuxt.options._prepare) {
			// 预热
			logger.info('正在预热渲染器，稍安勿躁');
			moduleStore.renderer = new Renderer(path.join(nuxt.options.buildDir, '.cache/markdown-render.db')); // 渲染器
			await getRenderer(); // MarkdownIt
		}

		addLayout(
			{
				src: resolve('./runtime/layout/wiki-container.vue'),
				filename: 'layouts/wiki-container.vue',
			},
			'wiki-container',
		);

		addVitePlugin(ViteVirtual);
		addVitePlugin(viteTransform);

		// 元数据扫描
		if (!nuxt.options._prepare) {
			nuxt.hook('pages:resolved', metadataHook);
		}
		nuxt.hook('prepare:types', tsconfigHook);
		nuxt.hook('close', closeHook);
	},
});
