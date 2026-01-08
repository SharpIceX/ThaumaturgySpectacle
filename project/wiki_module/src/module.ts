import plugin from './plugin/plugin';
import metadata from './hook/metadata/main';
import { addLayout, addComponentsDir, addVitePlugin, defineNuxtModule, createResolver } from '@nuxt/kit';

const regExpMarkdown = /\.md$/;
const regExpVue = /\.vue$/;
const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
	meta: {
		name: '@ts/wiki_module',
	},
	setup(_options, nuxt) {
		// 样式
		nuxt.options.css.push(resolve('./runtime/styles/index.less'));

		// Nuxt 路由扫描添加支持扫描 md 文件
		nuxt.options.extensions.push('.md');

		// Vite Vue 插件支持处理 md 文件
		nuxt.options.vite ||= {};
		nuxt.options.vite.vue ||= {};
		nuxt.options.vite.vue.include = [regExpVue, regExpMarkdown];

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

		// 添加 Vite 预处理插件
		addVitePlugin(plugin);

		// 元数据扫描
		nuxt.hook('pages:resolved', metadata);

		// 注册全局 Wiki Layout
		addLayout(
			{
				src: resolve('./runtime/layouts/wiki-container.vue'),
				filename: 'layouts/wiki-container.vue',
			},
			'wiki-container',
		);

		// 注册全局组件库
		addComponentsDir({
			path: resolve('./runtime/components'),
			watch: true,
			global: true,
			prefix: 'Wiki',
			pathPrefix: false,
		});
	},
});
