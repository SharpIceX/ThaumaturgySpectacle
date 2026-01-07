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

type InternalEnv = AnchorEnvironment & {
	headings?: HeadingItem[];
	headingIdCounts?: Map<string, number>;
};

/**
 * 生成 ID
 * @param text 原始标题文本
 * @returns ID
 */
function generateHeadingId(text: string): string {
	const normalized = text
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\u4E00-\u9FA5-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

	return encodeURIComponent(normalized) || 'section';
}

/**
 * 生成唯一 ID
 * @param baseId ID
 * @param counts 记数器映射
 * @returns 唯一 ID
 */
function ensureUniqueId(baseId: string, counts: Map<string, number>): string {
	const current = counts.get(baseId) ?? 0;
	counts.set(baseId, current + 1);
	return current === 0 ? baseId : `${baseId}-${current}`;
}

/**
 * 生成 TOC HTML
 * @param headings 标题数组
 * @returns TOC HTML 字符串
 */
function buildTocHtml(headings?: HeadingItem[] | null): string {
	if (!headings?.length) return '';

	const html: string[] = [];
	const stack: number[] = [];

	const openList = (level: number): void => {
		html.push('<ol>');
		stack.push(level);
	};

	const closeList = (): void => {
		html.push('</li></ol>');
		stack.pop();
	};

	for (const h of headings) {
		const level = h.level;
		const current = stack[stack.length - 1];

		if (stack.length === 0) {
			openList(level);
		} else if (level > current!) {
			openList(level);
		} else if (level < current!) {
			while (stack.length > 0 && level < stack[stack.length - 1]!) {
				closeList();
			}
			html.push('</li>');
		} else {
			html.push('</li>');
		}

		html.push(`<li><a href="#${h.id}">${h.name}</a>`);
	}

	while (stack.length > 0) closeList();

	return html.join('');
}

/**
 * 为标题生成锚点 id，并生成 tocHtml
 * @param md MarkdownIt 实例
 */
function anchor(md: MarkdownIt): void {
	const defaultRender: RenderRule =
		md.renderer.rules['heading_open'] ||
		((tokens, index, options, _env: InternalEnv, self): string => self.renderToken(tokens, index, options));

	md.renderer.rules['heading_open'] = (tokens, index, options, env: InternalEnv, self): string => {
		const token = tokens[index];
		if (!token) return defaultRender(tokens, index, options, env, self);

		if (token.tag === 'h1') {
			throw new Error('不应该出现的一级标题');
		}

		const inlineToken = tokens[index + 1];
		const titleName =
			inlineToken?.type === 'inline' && inlineToken.children
				? md.renderer.renderInlineAsText(inlineToken.children, options, env)
				: '';

		env.headings ??= [];
		env.headingIdCounts ??= new Map<string, number>();

		const baseId = generateHeadingId(titleName);
		const titleId = ensureUniqueId(baseId, env.headingIdCounts);

		const idIndex = token.attrIndex('id');
		if (idIndex < 0) {
			token.attrPush(['id', titleId]);
		} else if (token.attrs?.[idIndex]) {
			token.attrs[idIndex][1] = titleId;
		}

		env.headings.push({
			name: titleName,
			id: titleId,
			level: Number.parseInt(token.tag.slice(1), 10),
		});

		return defaultRender(tokens, index, options, env, self);
	};

	const originalRender = md.render.bind(md);
	md.render = (source: string, env: InternalEnv = {}): string => {
		// 防止出现 env 复用
		env.headings = [];
		env.headingIdCounts = new Map<string, number>();

		const html = originalRender(source, env);
		env.tocHtml = buildTocHtml(env.headings);
		return html;
	};
}

export { anchor };
export type { HeadingItem, AnchorEnvironment };
