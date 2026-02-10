import type { PluginSimple } from 'markdown-it';
import { unescapeAll, escapeHtml } from 'markdown-it/lib/common/utils.mjs';

const code: PluginSimple = (md) => {
	md.renderer.rules.fence = (tokens, index, options) => {
		const token = tokens[index];
		if (!token) return '';

		const info = token.info ? unescapeAll(token.info).trim() : '';
		const langName = info ? (info.split(/\s+/)[0] ?? '') : '';

		const highlighted = options.highlight
			? options.highlight(token.content, langName, '') || escapeHtml(token.content)
			: escapeHtml(token.content);

		return `<markdown-code>${highlighted}</markdown-code>`;
	};
};

export { code };
