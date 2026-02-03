interface Point {
	line: number;
	column: number;
}

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
		if (code === undefined) break; // 理论上不会发生

		const size = code > 0xff_ff ? 2 : 1;

		if (code === 13) {
			// 发现 `\r`
			results.push({
				line: currentLine,
				column: index - lineStartOffset + 1,
			});
		} else if (code === 10) {
			// 发现 \n，行号增加，下一行的起点偏移量更新
			currentLine++;
			lineStartOffset = index + 1; // 换行符本身占 1 位，下一行从 index + 1 开始
		}

		index += size;
	}

	return results;
}

export { findCarriageReturn };
