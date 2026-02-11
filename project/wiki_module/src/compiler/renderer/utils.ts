import type { TomlTable } from 'smol-toml';

/**
 * 分离 Markdown 中的 Front Matter 和 正文
 * @param content Markdown 内容
 * @returns 分离后的结果
 */
function frontMatterParse(content: string): { tomlContent: string; bodyContent: string } {
	/// 确保开头符合 Front Matter
	const firstLineMatch = content.match(/^\+\+\+[ \t]*\r?\n/);
	if (!firstLineMatch) {
		throw new Error('找不到 Front Matter');
	}

	/** 起始偏移量 */
	const startOffset = firstLineMatch[0].length;

	// 查找闭合
	const closeRegex = /\r?\n\+\+\+[ \t]*(?:\r?\n|$)/;
	const closeMatch = content.slice(startOffset).match(closeRegex);

	if (!closeMatch || closeMatch.index === undefined) {
		throw new Error('找不到 Front Matter 的闭合标签');
	}

	/** 闭合偏移量 */
	const closeIndexInside = closeMatch.index;

	// 提取内容
	const tomlContent = content.slice(startOffset, startOffset + closeIndexInside).trim();
	const bodyContent = content.slice(startOffset + closeIndexInside + closeMatch[0].length);

	return { tomlContent, bodyContent };
}

/**
 * 校验 Front Matter 元数据合法性
 * @param data Front Matter 数据
 */
function validateFrontMatter(data: TomlTable) {
	// 校验是否符合 Array<string>
	const validateStringArray = (field: string) => {
		const value = data[field];
		if (value !== undefined) {
			if (!Array.isArray(value)) {
				throw new TypeError(`Front Matter 错误：${field} 必须是一个数组！`);
			}
			if (!value.every((item) => typeof item === 'string')) {
				throw new TypeError(`Front Matter 错误：${field} 数组内的每一项都必须是字符串！`);
			}
		}
	};

	if (!data) {
		throw new Error('Front Matter 不能为空');
	}

	// 标题
	if (!data['title']) {
		throw new Error('Front Matter 标题为空！');
	}
	if (typeof data['title'] !== 'string') {
		throw new TypeError('当前 Front Matter 内的 title 非字符串');
	}

	// 描述
	if (data['description'] !== undefined && typeof data['description'] !== 'string') {
		throw new TypeError('当前 Front Matter 内的 description 字符串');
	}

	// 类型
	if (data['type'] !== undefined && !['wiki', 'novel'].includes(String(data['type']))) {
		throw new TypeError('当前 Front Matter 内的 type 无效');
	}

	validateStringArray('keywords'); // 关键词
	validateStringArray('category'); // 分类
}

export { frontMatterParse, validateFrontMatter };
