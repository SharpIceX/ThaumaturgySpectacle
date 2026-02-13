/**
 * 分离 Markdown 中的 Front Matter 和 正文
 * @param content Markdown 内容
 * @returns 分离后的结果
 */
function splitFrontMatter(content: string): { tomlContent?: string; bodyContent: string } {
	/// 确保开头符合 Front Matter
	const firstLineMatch = content.match(/^\+\+\+[ \t]*\r?\n/);
	if (!firstLineMatch) return { bodyContent: content };

	/** 起始偏移量 */
	const startOffset = firstLineMatch[0].length;

	// 查找闭合
	const closeRegex = /\r?\n\+\+\+[ \t]*(?:\r?\n|$)/;
	const closeMatch = content.slice(startOffset).match(closeRegex);

	if (!closeMatch || closeMatch.index === undefined) return { bodyContent: content };

	/** 闭合偏移量 */
	const closeIndexInside = closeMatch.index;

	// 提取内容
	const tomlContent = content.slice(startOffset, startOffset + closeIndexInside).trim();
	const bodyContent = content.slice(startOffset + closeIndexInside + closeMatch[0].length).trim();

	return { tomlContent, bodyContent };
}

export default splitFrontMatter;
