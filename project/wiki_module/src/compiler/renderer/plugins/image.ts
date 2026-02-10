import { useLogger } from '@nuxt/kit';
import { createHash } from 'node:crypto';
import { hasProtocol, parseURL } from 'ufo';
import type { PluginSimple } from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs';

const logger = useLogger('@ts/wiki_module:markdown-it/image');

/** 匹配大括号内参数 */
const ATTRIBUTE_WRAPPER = /^\{([^}]+)\}/;

/** 匹配属性的单个键值对，或仅限键无值 */
const ATTRIBUTE_PAIR = /([^\s="]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;

interface ImageEnvironment {
	image: Map<string, string>;
}

/**
 * 从 token 中移除指定属性
 * @param token 目标 Token
 * @param key 属性名
 */
function removeAttribute(token: Token, key: string) {
	token.attrs = (token.attrs || []).filter(([k]) => k !== key);
}

/**
 * 判断 inline children 中是否存在可见内容
 * @param children inline 子节点
 * @param ignoreIndex 可忽略的子节点索引
 * @returns 处理结果
 */
function hasMeaningfulContent(children: Token[], ignoreIndex?: number): boolean {
	return children.some((t, index) => {
		if (index === ignoreIndex) return false;
		if (t.type === 'text') return t.content.trim().length > 0;
		// 其他可见内容（例如 link 等）
		return t.type !== 'softbreak' && t.type !== 'hardbreak';
	});
}

/**
 * 移除属性文本 token（如只有 {xxx} 的文本）
 * @param token 目标文本 Token
 * @returns 处理结果
 */
function stripAttributeTextToken(token?: Token): boolean {
	if (!token || token.type !== 'text') return false;
	const match = token.content.match(ATTRIBUTE_WRAPPER);
	if (!match) return false;

	token.content = token.content.replace(ATTRIBUTE_WRAPPER, '').trim();
	return token.content.length === 0;
}

/**
 * 解析属性块并写入到图片 Token
 * @param rawAttributes 原始属性字符串
 * @param token 目标图片 Token
 */
function parseAttributes(rawAttributes: string, token: Token) {
	let match: RegExpExecArray | null;

	while ((match = ATTRIBUTE_PAIR.exec(rawAttributes)) !== null) {
		const key = match[1];
		const value = (match[2] ?? match[3] ?? match[4] ?? 'true') as string;

		if (key) token.attrSet(key, value);
	}
}

/**
 * 清理互斥的对齐属性（left/right）
 * @param token 目标图片 Token
 */
function cleanConflictingAlignment(token: Token) {
	const hasLeft = token.attrGet('left') !== null;
	const hasRight = token.attrGet('right') !== null;

	if (hasLeft && hasRight) {
		const imgSource = token.attrGet('src') ?? 'unknown';
		logger.error(`图片属性冲突: 检测到同时存在 'left' 和 'right'。已自动忽略这两个属性。图片源: ${imgSource}`);

		token.attrs = (token.attrs || []).filter(([key]) => key !== 'left' && key !== 'right');
	}
}

/**
 * 段落仅包含图片则标记以移除该段落
 * @param tokens 核心 Token 列表
 * @param index 段落起始 Token 索引
 * @param imgIndex 图片 Token 在 inline children 中的索引（可选）
 */
function markPureImageParagraph(tokens: Token[], index: number, imgIndex?: number) {
	const inlineToken = tokens[index + 1];
	const children = inlineToken?.children ?? [];

	const hasContent = hasMeaningfulContent(children, imgIndex);

	if (!hasContent) {
		const openToken = tokens[index];
		const closeToken = tokens[index + 2];

		if (openToken) {
			openToken.meta = { ...openToken.meta, isPureImg: true };
		}
		if (closeToken) {
			closeToken.meta = { ...closeToken.meta, isPureImg: true };
		}
	}
}

/**
 * 校验 scale 属性
 * @param token 目标图片 Token
 */
function validateScale(token: Token) {
	const scaleRaw = token.attrGet('scale');
	if (scaleRaw === null) return;

	const scaleNumber = Number.parseFloat(scaleRaw);
	const imgSource = token.attrGet('src') ?? 'unknown';

	// 非数字
	if (Number.isNaN(scaleNumber)) {
		logger.error(
			`图片的”scale“属性必须为数字，但当前获取到的是”${scaleNumber}“，已忽略该属性。图片源: ${imgSource}`,
		);
		removeAttribute(token, 'scale');
		return;
	}

	// 负数校验
	if (scaleNumber < 0) {
		logger.error(`图片的”scale“属性不能为负数（当前值: ${scaleNumber}），已忽略该属性。图片源: ${imgSource}`);
		removeAttribute(token, 'scale');
		return;
	}

	// 大于两位小数点则截断
	const parts = scaleRaw.split('.');
	if (parts.length === 2 && (parts[1] as string).length > 2) {
		const truncated = (Math.floor(scaleNumber * 100) / 100).toString();
		logger.error(`图片的”scale“小数位过多，最大只支持两位小数。已自动截断为 ${truncated}。图片源: ${imgSource}`);
		token.attrSet('scale', truncated);
	}
}

/**
 * 记录图片缺失信息
 * @param hasTitle 是否存在 title(alt)
 * @param hasSource 是否存在 src
 * @param imageSource 图片源（可选）
 */
function logMissingImageInfo(hasTitle: boolean, hasSource: boolean, imageSource = 'unknown') {
	if (!hasTitle && !hasSource) {
		logger.error(`图片缺少必要属性: title(alt) 与 src 均不存在，已忽略该图片。图片源: ${imageSource}`);
		return;
	}
	if (!hasTitle) {
		logger.error(`图片缺少必要属性: title(alt) 为空，已忽略该图片。图片源: ${imageSource}`);
		return;
	}
	if (!hasSource) {
		logger.error(`图片缺少必要属性: src 为空，已忽略该图片。图片源: ${imageSource}`);
	}
}

const image: PluginSimple = (md) => {
	// 词法解析规则
	md.core.ruler.after('inline', 'wiki_image_clean_token', (state) => {
		const tokens = state.tokens;
		const environment = state.env as ImageEnvironment;

		for (let index = 0; index < tokens.length; index++) {
			const currentToken = tokens[index];
			if (currentToken?.type !== 'paragraph_open') continue;

			const inlineToken = tokens[index + 1];
			if (inlineToken?.type !== 'inline' || !inlineToken.children) continue;

			const children = inlineToken.children;
			const imgIndex = children.findIndex((t) => t.type === 'image');
			if (imgIndex === -1) continue;

			const imgToken = children[imgIndex];
			if (!imgToken) continue;

			const nextToken = children[imgIndex + 1];

			// title(alt) 与 src 校验
			const rawTitle = imgToken.content?.trim() ?? '';
			const rawUrl = imgToken.attrGet('src') ?? '';

			const hasTitle = rawTitle.length > 0;
			const hasSource = rawUrl.length > 0;

			if (!hasTitle || !hasSource) {
				logMissingImageInfo(hasTitle, hasSource, rawUrl || 'unknown');

				// 删除图片 token + 属性文本 token（若只有属性）
				children.splice(imgIndex, 1);
				if (stripAttributeTextToken(nextToken)) {
					children.splice(imgIndex, 1); // nextToken 已被移除，索引与 imgIndex 相同
				}

				// 删除孤立 <p>
				markPureImageParagraph(tokens, index);
				continue;
			}

			// 图片路径处理
			if (!hasProtocol(rawUrl)) {
				const { pathname } = parseURL(rawUrl);
				const variableName = '_v_' + createHash('sha1').update(pathname).digest('hex').slice(0, 8);
				if (!environment.image) environment.image = new Map();
				environment.image.set(variableName, rawUrl);
				imgToken.meta = { ...imgToken.meta, varName: variableName };
			}

			// 标题
			imgToken.type = 'wiki_custom_image';
			imgToken.meta = { ...imgToken.meta, title: imgToken.content };

			// 属性
			if (nextToken?.type === 'text') {
				const match = nextToken.content.match(ATTRIBUTE_WRAPPER);

				if (match) {
					const rawAttributes = match[1] ?? '';
					parseAttributes(rawAttributes, imgToken); // 解析属性
					cleanConflictingAlignment(imgToken); // 清理段落
					validateScale(imgToken); // 校验 scale 属性

					nextToken.content = nextToken.content.replace(ATTRIBUTE_WRAPPER, '').trim();
				}
			}

			// 清理段落
			markPureImageParagraph(tokens, index, imgIndex);
		}
	});

	// 渲染
	md.renderer.rules['wiki_custom_image'] = (tokens, index) => {
		const token = tokens[index];
		if (!token) return '';

		const properties: string[] = [];

		if (token.attrs) {
			for (const [k, v] of token.attrs) {
				// 处理 scale
				if (k === 'scale' && !Number.isNaN(Number(v))) {
					properties.push(`:scale="${v}"`);
					continue;
				}

				// 处理环绕开关
				if ((k === 'left' || k === 'right') && v === 'true') {
					properties.push(k);
				}
			}
		}

		// 标题
		if (token.meta?.title) properties.push(`title="${token.meta.title}"`);

		// 图片地址
		if (token.meta?.varName) {
			properties.push(`:source="${token.meta.varName}"`);
		} else {
			const source = token.attrGet('src');
			if (!source) return '';
			properties.push(`source="${source}"`);
		}

		return `<Image ${properties.join(' ')} />`;
	};

	// 段落标签消除
	md.renderer.rules['paragraph_open'] = (tokens, index, options, _environment, self) => {
		const token = tokens[index];
		return token?.meta?.isPureImg ? '' : self.renderToken(tokens, index, options);
	};
	md.renderer.rules['paragraph_close'] = (tokens, index, options, _environment, self) => {
		const token = tokens[index];
		return token?.meta?.isPureImg ? '' : self.renderToken(tokens, index, options);
	};
};

export { image };
export type { ImageEnvironment };
