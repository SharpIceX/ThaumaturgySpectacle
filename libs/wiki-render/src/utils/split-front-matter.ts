/**
 * 分离 Markdown 中的 Front Matter 和 正文
 * @param content Markdown 内容
 * @returns 分离后的结果
 */
function splitFrontMatter(content: string): { tomlContent?: string; bodyContent: string } {
	/// 确保开头符合 Front Matter
	if (!content.startsWith('+++')) {
		return { bodyContent: content };
	}

	// 查找闭合
	const endDelimiter = '\n+++';
	const startIndex = content.indexOf('\n', 3);
	if (startIndex === -1) return { bodyContent: content };

	const endIndex = content.indexOf(endDelimiter, startIndex);

	if (endIndex === -1) {
		return { bodyContent: content };
	}

	// toml 内容
	const tomlContent = content.slice(startIndex, endIndex).trim();

	// 正文内容
	const remainingContent = content.slice(endIndex + endDelimiter.length);
	const bodyContent = remainingContent.replace(/^[ \t]*\r?\n/, '');

	return { tomlContent, bodyContent };
}

export default splitFrontMatter;
