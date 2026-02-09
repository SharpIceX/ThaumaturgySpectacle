import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token.mjs';
import type { Options } from 'markdown-it';
import Renderer, { type RenderRule } from 'markdown-it/lib/renderer.mjs';

/**
 * 标题数据结构
 */
export interface HeadingItem {
	name: string;
	id: string;
	level: number;
}

/**
 * 扩展 markdown-it 的 env 类型
 */
export interface MarkdownItEnvironment {
	headings?: HeadingItem[];
	headingIdCounts?: Map<string, number>;
	toc?: string;
}

/**
 * 独立的 ID 生成/清理函数
 * 逻辑：去除左右空格 -> 中间空格转下划线 -> URI 编码
 * @param rawText - 原始标题文本
 * @returns 格式化后的 ID 字符串
 */
export function generateHeadingId(rawText: string): string {
	const trimmed = rawText.trim();
	if (!trimmed) {
		return 'heading';
	}

	const processedText = trimmed.replaceAll(/\s+/g, '_');
	return encodeURIComponent(processedText);
}

/**
 * 生成唯一 ID（基于计数器）
 * @param baseId - 基础 ID
 * @param counts - 计数器映射
 * @returns 唯一 ID
 */
function ensureUniqueId(baseId: string, counts: Map<string, number>): string {
	const current = counts.get(baseId) ?? 0;
	const next = current + 1;
	counts.set(baseId, next);

	return current === 0 ? baseId : `${baseId}_${current}`;
}

/**
 * 根据 headings 生成 TOC HTML
 * @param headings - 标题数组
 * @returns TOC HTML 字符串
 */
function buildTocHtml(headings: HeadingItem[]): string {
	if (headings.length === 0) {
		return '';
	}

	let result = '<ol>';
	let currentLevel = headings[0]?.level ?? 1;

	for (const heading of headings) {
		const level = heading.level || 1;

		while (level > currentLevel) {
			result += '<ol>';
			currentLevel++;
		}

		while (level < currentLevel) {
			result += '</ol></li>';
			currentLevel--;
		}

		result += `<li><a href="#${heading.id}">${heading.name}</a>`;
	}

	while (currentLevel > (headings[0]?.level ?? 1)) {
		result += '</ol></li>';
		currentLevel--;
	}

	result += '</li></ol>';
	return result.replace('<ol></li>', '<ol>');
}

/**
 * Markdown-it 插件：自动为标题添加 ID 锚点并记录到环境对象中
 * 渲染完成后自动写入 env.toc
 * @param md - MarkdownIt 实例
 */
export default function headingIdPlugin(md: MarkdownIt): void {
	const defaultRender: RenderRule =
		md.renderer.rules['heading_open'] ||
		((
			tokens: Token[],
			index: number,
			options: Options,
			_environment: MarkdownItEnvironment,
			self: Renderer,
		): string => self.renderToken(tokens, index, options));

	md.renderer.rules['heading_open'] = (
		tokens: Token[],
		index: number,
		options: Options,
		environment: MarkdownItEnvironment,
		self: Renderer,
	): string => {
		const token = tokens[index];
		if (!token) {
			return defaultRender(tokens, index, options, environment, self);
		}

		// 1. 获取标题文本 (heading_open 的下一个 token 通常是 inline)
		const inlineToken = tokens[index + 1];
		const titleName = inlineToken?.type === 'inline' ? inlineToken.content : '';

		// 2. 生成基础 ID
		const baseId = generateHeadingId(titleName);

		// 3. 初始化 env 容器
		environment.headings ??= [];
		environment.headingIdCounts ??= new Map<string, number>();

		// 4. 生成唯一 ID
		const titleId = ensureUniqueId(baseId, environment.headingIdCounts);

		// 5. 将 ID 注入 Token 属性
		const idIndex = token.attrIndex('id');
		if (idIndex < 0) {
			token.attrPush(['id', titleId]);
		} else {
			const attributes = token.attrs;
			if (attributes && attributes[idIndex]) {
				attributes[idIndex][1] = titleId;
			}
		}

		// 6. 记录到 env 对象
		const level = Number.parseInt(token.tag.slice(1), 10) || 0;
		environment.headings.push({
			name: titleName,
			id: titleId,
			level,
		});

		return defaultRender(tokens, index, options, environment, self);
	};

	// 渲染完成后写入 env.toc
	const originalRender = md.render.bind(md);
	md.render = (source: string, environment: MarkdownItEnvironment = {}): string => {
		const html = originalRender(source, environment);
		environment.toc = environment.headings ? buildTocHtml(environment.headings) : '';
		return html;
	};
}
