import markdownit from 'markdown-it';
import { parse as yamlParse } from 'yaml';
import type { LumirayType } from '../main';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItCjkFriendly from 'markdown-it-cjk-friendly';
import markdownItForontMatter from 'markdown-it-front-matter';

const md = markdownit('commonmark')
	.use(markdownItCjkFriendly) // 使用中文友好的渲染
	.use(markdownItFootnote); // 支持脚注

interface ResultType {
	html: string;
	metadata: LumirayType['data'];
}

export default (markdown: string): ResultType => {
	let frontMatter: string | null = null;

	const markdownRenderer = md.use(markdownItForontMatter, (frontMatterText: string) => {
		frontMatter = frontMatterText;
	});

	const html = markdownRenderer.render(markdown);

	let metadata = null;
	if (frontMatter) {
		metadata = yamlParse(frontMatter);
	} else {
		throw new Error(`找不到 ${markdown} 的 Front Matter 数据！`);
	}

	return { html, metadata };
};
