import { useLogger } from '@nuxt/kit';
import type { PluginSimple } from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs';

const logger = useLogger('@ts/wiki_module:markdown-it/image');

/** 匹配大括号内参数 */
const ATTRIBUTE_WRAPPER = /^\{([^}]+)\}/;

/** 匹配属性的单个键值对，或仅限键无值 */
const ATTRIBUTE_PAIR = /([^\s="]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;

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

		if (key) {
			token.attrSet(key, value);
		}
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
 * @param imgIndex 图片 Token 在 inline children 中的索引
 */
function markPureImageParagraph(tokens: Token[], index: number, imgIndex: number) {
	const inlineToken = tokens[index + 1];
	const children = inlineToken?.children ?? [];

	const hasOtherContent = children.some((t, index_) => {
		if (index_ === imgIndex) return false;
		return t.type === 'text' && t.content.trim().length > 0;
	});

	if (!hasOtherContent) {
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
		token.attrs = (token.attrs || []).filter(([k]) => k !== 'scale');
		return;
	}

	// 负数校验
	if (scaleNumber < 0) {
		logger.error(`图片的”scale“属性不能为负数（当前值: ${scaleNumber}），已忽略该属性。图片源: ${imgSource}`);
		token.attrs = (token.attrs || []).filter(([k]) => k !== 'scale');
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

const image: PluginSimple = (md) => {
	// 词法解析规则
	md.core.ruler.after('inline', 'wiki_image_clean_token', (state: StateCore) => {
		const tokens = state.tokens;

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
	md.renderer.rules['wiki_custom_image'] = (tokens: Token[], index: number) => {
		const token = tokens[index];
		if (!token) return '';

		const source = token.attrGet('src') || '';
		const title = token.meta?.title || '';

		const properties = (token.attrs || [])
			.filter(([k]) => k !== 'src' && k !== 'alt')
			.map(([k, v]) => {
				// 如果值是 "true"，则渲染成 Vue 的布尔开关格式
				if (v === 'true') {
					return `:${k}="true"`;
				}

				// 处理数字
				if (k === 'scale' || !Number.isNaN(Number(v))) {
					return `:${k}="${v}"`;
				}

				return `:${k}="${v}"`;
			})
			.join(' ');

		return `<Image :source="import('${source}')" title="${title}" ${properties} />`;
	};

	// 段落标签消除
	md.renderer.rules['paragraph_open'] = (tokens: Token[], index: number, options, _environment, self) => {
		const token = tokens[index];
		return token?.meta?.isPureImg ? '' : self.renderToken(tokens, index, options);
	};
	md.renderer.rules['paragraph_close'] = (tokens: Token[], index: number, options, _environment, self) => {
		const token = tokens[index];
		return token?.meta?.isPureImg ? '' : self.renderToken(tokens, index, options);
	};
};

export { image };
