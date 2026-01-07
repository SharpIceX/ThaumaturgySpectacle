import url from 'node:url';
import type { Plugin } from 'vite';
import { storeContext } from '../../context';

const contentTransformPlugin = (): Plugin => {
	return {
		name: 'content-module-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			const [filePathRaw, query = ''] = id.split('?');

			// 没有实际路径则退出
			if (!filePathRaw) return;

			const params = new URLSearchParams(query);
			const filePath = filePathRaw.startsWith('file://') ? url.fileURLToPath(filePathRaw) : filePathRaw;

			// 忽略 Vue AST 处理
			if (params.get('type') === 'script') return;

			// 忽略不能处理的
			const isWiki = filePath.endsWith('.md');
			const isNovel = filePath.endsWith('.book');
			if (!isWiki && !isNovel) return;

			const renderer = isWiki ? storeContext.WikiRenderer : storeContext.NovelRenderer;

			const renderResult = await renderer.render(code);

			return {
				code: renderResult.html,
				map: { mappings: '' },
			};
		},
	};
};

export default contentTransformPlugin;
