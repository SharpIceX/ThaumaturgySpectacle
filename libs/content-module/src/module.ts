import url from 'node:url';
import path from 'node:path';
import { storeContext } from './context';
import closeHook from './compiler/hooks/close';
import metadataHook from './compiler/hooks/scan-metadata/main';
import contentTransform from './compiler/vite/content-transform';
import { createRender as createWikiRender } from '@ts/wiki-render';
import { createRender as createNovelRender } from '@ts/novel-render';
import { addVitePlugin, addPlugin, defineNuxtModule, createResolver, addTypeTemplate, useLogger } from '@nuxt/kit';

const regExpVue = /\.vue$/;
const regExpNovel = /\.book$/;
const regExpMarkdown = /\.md$/;

const resolver = createResolver(import.meta.url);
const logger = useLogger('@ts/wiki-module');

export default defineNuxtModule({
	meta: {
		name: '@ts/wiki-module',
	},
	async setup(_options, nuxt) {
		// 预热
		if (!nuxt.options._prepare) {
			// 初始化 Wiki 渲染器
			storeContext.WikiRenderer = await createWikiRender(
				path.join(nuxt.options.buildDir, 'cache/wiki-render.db'),
				logger,
			);

			// 初始化 Novel 渲染器
			storeContext.NovelRenderer = createNovelRender(
				path.join(nuxt.options.buildDir, 'cache/novel-render.db'),
				logger,
			);
		}

		// 样式
		nuxt.options.css.push(
			resolver.resolve('./runtime/styles/index.less'),
			url.fileURLToPath(import.meta.resolve('katex/dist/katex.css')),
			url.fileURLToPath(import.meta.resolve('@fontsource-variable/jetbrains-mono')),
		);

		// 使 Nuxt 能够解析相关后缀
		nuxt.options.extensions.push('.md', '.book');

		// 使 Vite Vue 插件能够解析相关后缀
		nuxt.options.vite.vue ||= {};
		const existingInclude = nuxt.options.vite.vue.include || [/\.vue$/];
		const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude];
		nuxt.options.vite.vue.include = [...new Set([...includeArray, regExpMarkdown, regExpNovel])];

		// 使 Nuxt 自动导入支持相关后缀
		const transform = (nuxt.options.imports.transform ||= {});
		const include = (transform.include ||= [regExpVue]);
		if (!include.includes(regExpMarkdown)) include.push(regExpMarkdown);
		if (!include.includes(regExpNovel)) include.push(regExpNovel);

		// 使 Nuxt 能够作为组件处理
		const components = nuxt.options.components;
		if (components && typeof components === 'object' && !Array.isArray(components)) {
			// 初始化
			const transform = components.transform || (components.transform = {});

			// 初始化 include
			const existingInclude = transform.include || [];
			const includeArray = Array.isArray(existingInclude) ? existingInclude : [existingInclude];

			// 写入 include 并去重
			transform.include = [...new Set([...includeArray, regExpMarkdown, regExpNovel, regExpVue])];
		}

		// 类型
		addTypeTemplate({
			src: resolver.resolve('./types/index.d.ts'),
			filename: 'types/content-module.d.ts',
		});
		nuxt.options.alias['#content-module'] = resolver.resolve('./runtime/components');
		nuxt.options.alias['#content-module/*'] = resolver.resolve('./runtime/components/*');

		addVitePlugin(contentTransform);

		addPlugin({
			mode: 'all',
			src: resolver.resolve('./plugins/merge-keywords.ts'),
		});

		if (!nuxt.options._prepare) nuxt.hook('pages:resolved', await metadataHook(nuxt.options.rootDir));
		nuxt.hook('close', closeHook);
	},
});
