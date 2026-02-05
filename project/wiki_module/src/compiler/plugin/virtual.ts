import type { Plugin } from 'vite';
import { createResolver } from '@nuxt/kit';

const { resolve } = createResolver(import.meta.url);

const prefix = '#wiki_module/';

const WikiVirtualPlugin = (): Plugin => {
	return {
		name: 'wiki-virtual-plugin',
		enforce: 'pre',
		resolveId(id) {
			if (!id.startsWith(prefix)) return;
			const importPath = id.slice(prefix.length);
			const diskPath = resolve('../../runtime/components', importPath);
			return diskPath;
		},
	};
};

export default WikiVirtualPlugin;
