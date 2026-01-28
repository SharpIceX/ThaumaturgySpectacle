import type { Point } from '../main';

/**
 * 检查 Wiki Markdown 文件内容中所有 `\r`（回车符）的位置
 * @param content Wiki Markdown 文件内容
 * @returns 所有非法 `\r` 的位置信息数组
 */
function findCarriageReturn(content: string): Point[] {
	const results: Point[] = [];

	let currentLine = 1;
	let lineStartOffset = 0;

	for (let index = 0; index < content.length; ) {
		const code = content.codePointAt(index);
		if (code === undefined) {
			// 理论上不会发生
			break;
		}

		const size = code > 0xff_ff ? 2 : 1;

		if (code === 13) {
			// '\r'
			results.push({
				line: currentLine,
				column: index - lineStartOffset + 1,
				offset: index,
			});
		} else if (code === 10) {
			// '\n'
			currentLine++;
			lineStartOffset = index + size;
		}

		index += size;
	}

	return results;
}

export { findCarriageReturn };
