import type { PluginWithOptions } from 'markdown-it';
import { consola, type ConsolaInstance } from 'consola';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';

interface HtmlPluginOptions {
	logger?: ConsolaInstance;
}

const html: PluginWithOptions<HtmlPluginOptions> = (md, options) => {
	const logger = options?.logger?.withTag('html') ?? consola.create({ level: 0 }).withTag('html');

	const handleHtmlToken: RenderRule = (tokens, index): string => {
		const token = tokens[index];
		const content = token?.content || '';
		const trimmedContent = content.trim();

		if (!trimmedContent.startsWith('<!--')) {
			logger.warn(`Markdown 中包含禁止使用的 HTML 标签: ${trimmedContent}`);
		}

		return '';
	};

	md.renderer.rules.html_block = handleHtmlToken;
	md.renderer.rules.html_inline = handleHtmlToken;
};

export { html };
export type { HtmlPluginOptions };
