import { createResolver } from '@nuxt/kit';
import type { NuxtHooks } from '@nuxt/schema';

const { resolve } = createResolver(import.meta.url);

const tsconfigHook: NuxtHooks['prepare:types'] = (options) => {
	options.tsConfig.compilerOptions ||= {};
	options.tsConfig.compilerOptions.paths = {
		...options.tsConfig.compilerOptions.paths,
		'#wiki_module/*': [`${resolve('../../runtime/components')}/*`],
	};
};

export default tsconfigHook;
