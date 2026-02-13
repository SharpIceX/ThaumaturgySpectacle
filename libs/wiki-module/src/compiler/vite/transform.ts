import type { Plugin } from 'vite';
import { storeContext } from '../../context';

const MarkdownTransformPlugin = (): Plugin => {
	return {
		name: 'markdown-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			const url = new URL(id, 'file://');

			/**
			 * 忽略非 md 文件
			 * 忽略 Vue AST 处理
			 */
			if (!url.pathname.endsWith('.md') || url.searchParams.get('type') === 'script') return;

			const content = code.trim();

			if (!content || code.length === 0) this.error({ message: `空内容`, id });

			const renderResult = await storeContext.renderer.render(code);

			return {
				code: renderResult.html,
				map: {
					mappings: '',
				},
			};
		},
	};
};

export default MarkdownTransformPlugin;
