import { useLogger } from '@nuxt/kit';
import type { PluginSimple } from 'markdown-it';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';

const logger = useLogger('@ts/wiki_module:markdown-it/html');

const handleHtmlToken: RenderRule = (tokens, index): string => {
	const token = tokens[index];
	const content = token?.content || '';
	const trimmedContent = content.trim();

	if (!trimmedContent.startsWith('<!--')) {
		logger.warn(`Markdown 中包含禁止使用的 HTML 标签: ${trimmedContent}`);
	}

	return '';
};

const html: PluginSimple = (md) => {
	md.renderer.rules.html_block = handleHtmlToken;
	md.renderer.rules.html_inline = handleHtmlToken;
};

export { html };
