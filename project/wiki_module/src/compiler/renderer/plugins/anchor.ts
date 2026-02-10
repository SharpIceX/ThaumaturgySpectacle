import MarkdownIt from 'markdown-it';
import { type RenderRule } from 'markdown-it/lib/renderer.mjs';

/** 标题数据结构 */
interface HeadingItem {
	name: string;
	id: string;
	level: number;
}

interface AnchorEnvironment {
	headings?: HeadingItem[];
	headingIdCounts?: Map<string, number>;
	toc?: string;
}

/**
 * 生成 ID
 * @param text 原始标题文本
 * @returns ID
 */
function generateHeadingId(text: string): string {
	const baseId = text
		.trim() // 去除首尾空格
		.toLowerCase() // 转换为小写
		.replaceAll(/\s+/g, '-') // 将连续的空白字符替换为单个连字符
		.replaceAll(/[^\w\u4E00-\u9FA5-]/g, '') // 移除非单词字符（A-Z, 0-9, _）、非中文、非连字符的特殊符号
		.replaceAll(/-+/g, '-') // 将多个连续连字符合并为一个
		.replaceAll(/^-+|-+$/g, ''); // 移除字符串开头和结尾的所有连字符
	return encodeURIComponent(baseId) || 'section';
}

/**
 * 生成唯一 ID（基于计数器）
 * @param baseId ID
 * @param counts 记数器映射
 * @returns 唯一 ID
 */
function ensureUniqueId(baseId: string, counts: Map<string, number>): string {
	const current = counts.get(baseId) ?? 0;
	const next = current + 1;
	counts.set(baseId, next);

	return current === 0 ? baseId : `${baseId}-${current}`;
}

/**
 * 根据 headings 生成 TOC HTML
 * @param headings 标题数组
 * @returns TOC HTML 字符串
 */
function buildTocHtml(headings: HeadingItem[]): string {
	if (headings.length === 0) return '';

	const htmlParts: string[] = ['<nav role="navigation" aria-label="Table of Contents">', '<ol>'];

	const listStack: number[] = [1];

	for (const heading of headings) {
		const level = heading.level;

		while (level > listStack.length) {
			htmlParts.push('<li aria-hidden="true"><ol>');
			listStack.push(listStack.length + 1);
		}

		while (level < listStack.length) {
			htmlParts.push('</ol></li>');
			listStack.pop();
		}

		htmlParts.push(`<li><a href="#${heading.id}">${heading.name}</a></li>`);
	}

	while (listStack.length > 1) {
		htmlParts.push('</ol></li>');
		listStack.pop();
	}

	htmlParts.push('</ol>', '</nav>');
	return htmlParts.join('');
}

/**
 * Markdown-it 插件：自动为标题添加 ID 锚点并记录到环境对象中
 * 渲染完成后自动写入 env.toc
 * @param md MarkdownIt 实例
 */
function anchor(md: MarkdownIt): void {
	const defaultRender: RenderRule =
		md.renderer.rules['heading_open'] ||
		((tokens, index, options, _environment: AnchorEnvironment, self): string =>
			self.renderToken(tokens, index, options));

	md.renderer.rules['heading_open'] = (tokens, index, options, environment: AnchorEnvironment, self): string => {
		const token = tokens[index];
		if (!token) {
			return defaultRender(tokens, index, options, environment, self);
		}

		// 获取标题文本
		const inlineToken = tokens[index + 1];
		const titleName = inlineToken?.type === 'inline' ? inlineToken.content : '';

		// 生成ID
		const baseId = generateHeadingId(titleName);

		// 初始化 env 容器
		environment.headings ??= [];
		environment.headingIdCounts ??= new Map<string, number>();

		// 生成唯一 ID
		const titleId = ensureUniqueId(baseId, environment.headingIdCounts);

		// 将 ID 注入 Token 属性
		const idIndex = token.attrIndex('id');
		if (idIndex < 0) {
			token.attrPush(['id', titleId]);
		} else {
			const attributes = token.attrs;
			if (attributes && attributes[idIndex]) {
				attributes[idIndex][1] = titleId;
			}
		}

		// 记录到 env 对象
		const level = Number.parseInt(token.tag.slice(1), 10) - 1 || 1;
		environment.headings.push({
			name: titleName,
			id: titleId,
			level,
		});

		return defaultRender(tokens, index, options, environment, self);
	};

	// 渲染完成后写入 env.toc
	const originalRender = md.render.bind(md);
	md.render = (source: string, environment: AnchorEnvironment = {}): string => {
		const html = originalRender(source, environment);
		environment.toc = environment.headings ? buildTocHtml(environment.headings) : '';
		return html;
	};
}

export { anchor };
export type { HeadingItem, AnchorEnvironment };
