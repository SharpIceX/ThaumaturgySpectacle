import type { Point } from '../main';

/**
 * 检查 WMD 文件内容中所有 `\r`（回车符）的位置
 * @param content WMD 文件内容
 * @returns 所有非法 `\r` 的位置信息数组
 */
function findCarriageReturn(content: string): Point[] {
	const results: Point[] = [];
	let index = 0;
	let currentLine = 1;
	let lineStartOffset = 0;

	for (const char of content) {
		if (char === '\r') {
			results.push({
				line: currentLine,
				column: index - lineStartOffset + 1, // 计算当前字符在当前行中的位置
			});
		} else if (char === '\n') {
			currentLine++;
			lineStartOffset = index + 1;
		}
		index++;
	}

	return results;
}

export { findCarriageReturn };
