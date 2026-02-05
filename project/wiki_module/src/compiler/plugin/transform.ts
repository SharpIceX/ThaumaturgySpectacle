import type { Plugin } from 'vite';
import { moduleStore } from '../../store';

const MarkdownTransformPlugin = (): Plugin => {
	return {
		name: 'markdown-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			// 忽略非 md 文件
			if (!new URL(id, 'file://').pathname.endsWith('.md')) return;

			// 确保渲染器可用
			if (!moduleStore.renderer?.render) throw new Error('渲染器未初始化');

			const content = code.trim();

			if (!content || code.length === 0) this.error({ message: `空内容`, id: id });

			const renderResult = await moduleStore.renderer?.render(code);

			return {
				code: renderResult.html,
			};
		},
	};
};

export default MarkdownTransformPlugin;
