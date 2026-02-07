import { createResolver } from '@nuxt/kit';
import type { NuxtHooks } from '@nuxt/schema';

const { resolve } = createResolver(import.meta.url);

const tsconfigHook: NuxtHooks['prepare:types'] = (options) => {
	options.tsConfig.compilerOptions ||= {};

	// 组件
	options.tsConfig.compilerOptions.paths = {
		...options.tsConfig.compilerOptions.paths,
		'#wiki_module/*': [`${resolve('../../runtime/components')}/*`],
	};

	// 类型
	options.tsConfig.compilerOptions.typeRoots ||= [];
	options.tsConfig.compilerOptions.typeRoots.push(resolve('../../runtime/types'));
};

export default tsconfigHook;
