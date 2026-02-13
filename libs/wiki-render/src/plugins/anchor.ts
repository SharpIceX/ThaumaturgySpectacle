import MarkdownIt from 'markdown-it';
import { type RenderRule } from 'markdown-it/lib/renderer.mjs';

/** 标题数据结构 */
interface HeadingItem {
	name: string;
	id: string;
	level: number;
}

interface AnchorEnvironment {
	tocHtml?: string;
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
 * 生成唯一 ID
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
 * 生成 TOC HTML
 * @param headings 标题数组
 * @returns TOC HTML 字符串
 */
function buildTocHtml(headings?: HeadingItem[] | null): string {
	if (!headings?.length) return '';

	const htmlParts: string[] = ['<ol>'];

	const first = headings[0];
	if (!first) return '';

	const stack: number[] = [first.level];

	const openSubList = () => htmlParts.push('<li><ol>');
	const closeSubList = () => htmlParts.push('</ol></li>');

	for (let i = 0; i < headings.length; i++) {
		const h = headings[i];
		if (!h) continue;

		const currentLevel = stack[stack.length - 1] ?? first.level;

		if (h.level > currentLevel) {
			// 层级加深
			for (let lvl = currentLevel + 1; lvl <= h.level; lvl++) {
				openSubList();
				stack.push(lvl);
			}
		} else if (h.level < currentLevel) {
			// 层级回退
			while (stack.length > 1 && h.level < (stack[stack.length - 1] ?? h.level)) {
				closeSubList();
				stack.pop();
			}
		}

		htmlParts.push(`<li><a href="#${h.id}">${h.name}</a></li>`);
	}

	while (stack.length > 0) {
		htmlParts.push('</ol>');
		if (stack.length > 1) htmlParts.push('</li>');
		stack.pop();
	}

	return htmlParts.join('');
}

/**
 * 为标题生成锚点 id，并生成 tocHtml
 * @param md MarkdownIt 实例
 */
function anchor(md: MarkdownIt): void {
	type InternalEnv = AnchorEnvironment & {
		headings?: HeadingItem[];
		headingIdCounts?: Map<string, number>;
	};

	const defaultRender: RenderRule =
		md.renderer.rules['heading_open'] ||
		((tokens, index, options, _environment: InternalEnv, self): string => self.renderToken(tokens, index, options));

	md.renderer.rules['heading_open'] = (tokens, index, options, environment: InternalEnv, self): string => {
		const token = tokens[index];
		if (!token) {
			return defaultRender(tokens, index, options, environment, self);
		}

		// 获取标题文本（不含 Markdwon 格式）
		const inlineToken = tokens[index + 1];
		const titleName =
			inlineToken?.type === 'inline' && inlineToken.children
				? md.renderer.renderInlineAsText(inlineToken.children, options, environment)
				: '';

		const baseId = generateHeadingId(titleName);

		environment.headings ??= [];
		environment.headingIdCounts ??= new Map<string, number>();

		const titleId = ensureUniqueId(baseId, environment.headingIdCounts);

		const idIndex = token.attrIndex('id');
		if (idIndex < 0) {
			token.attrPush(['id', titleId]);
		} else {
			const attributes = token.attrs;
			if (attributes && attributes[idIndex]) {
				attributes[idIndex][1] = titleId;
			}
		}

		const level = Number.parseInt(token.tag.slice(1), 10) - 1 || 1;
		environment.headings.push({
			name: titleName,
			id: titleId,
			level,
		});

		return defaultRender(tokens, index, options, environment, self);
	};

	const originalRender = md.render.bind(md);
	md.render = (source: string, environment: InternalEnv = {}): string => {
		const html = originalRender(source, environment);
		environment.tocHtml = environment.headings ? buildTocHtml(environment.headings) : '';
		return html;
	};
}

export { anchor };
export type { HeadingItem, AnchorEnvironment };
