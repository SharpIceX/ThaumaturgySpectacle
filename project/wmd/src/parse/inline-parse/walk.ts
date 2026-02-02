import type { Point } from '../../main';
import { ParseErrorCode, type ParseError } from '../../types/error';
import { type InlineNode, InlineNodeType } from '../../types/node/inline-node';

interface ResultType {
	ast: InlineNode[];
	error: ParseError[];
}

/**
 * 行内语法解析
 * @param content 一段文本
 * @param start 起始位置点（包含 line, column, offset）
 * @returns 解析结果
 */
function walk(content: string, start: Point): ResultType {
	const ast: InlineNode[] = [];
	const errors: ParseError[] = [];

	let relativeOffset = 0;
	let pendingTextStart = 0;

	const { line, column: baseColumn, offset: baseOffset } = start;

	const flushText = (endRelativeOffset: number) => {
		if (endRelativeOffset > pendingTextStart) {
			const textValue = content.slice(pendingTextStart, endRelativeOffset);
			ast.push({
				type: InlineNodeType.Text,
				value: textValue,
				position: {
					start: {
						line,
						column: baseColumn + pendingTextStart,
						offset: baseOffset + pendingTextStart,
					},
					end: {
						line,
						column: baseColumn + endRelativeOffset,
						offset: baseOffset + endRelativeOffset,
					},
				},
			} as any);
		}
	};

	// 1. 处理对称标记 (加粗, 斜体等)
	const handleSymmetry = (marker: string, type: InlineNodeType): boolean => {
		if (!content.startsWith(marker, relativeOffset)) return false;
		const markerLength = marker.length;
		const closeIndex = content.indexOf(marker, relativeOffset + markerLength);
		if (closeIndex === -1) return false;

		flushText(relativeOffset);

		const innerContent = content.slice(relativeOffset + markerLength, closeIndex);
		const innerResult = walk(innerContent, {
			line,
			column: baseColumn + relativeOffset + markerLength,
			offset: baseOffset + relativeOffset + markerLength,
		});

		ast.push({
			type,
			children: innerResult.ast,
			position: {
				start: { line, column: baseColumn + relativeOffset, offset: baseOffset + relativeOffset },
				end: {
					line,
					column: baseColumn + closeIndex + markerLength,
					offset: baseOffset + closeIndex + markerLength,
				},
			},
		} as any);

		relativeOffset = closeIndex + markerLength;
		pendingTextStart = relativeOffset;
		return true;
	};

	// 2. 处理行内代码 `code`
	const handleInlineCode = (): boolean => {
		if (content[relativeOffset] !== '`') return false;
		const closeIndex = content.indexOf('`', relativeOffset + 1);
		if (closeIndex === -1) return false;

		flushText(relativeOffset);
		const codeValue = content.slice(relativeOffset + 1, closeIndex);

		ast.push({
			type: InlineNodeType.Code, // 假设你有这个类型
			value: codeValue,
			position: {
				start: { line, column: baseColumn + relativeOffset, offset: baseOffset + relativeOffset },
				end: { line, column: baseColumn + closeIndex + 1, offset: baseOffset + closeIndex + 1 },
			},
		} as any);

		relativeOffset = closeIndex + 1;
		pendingTextStart = relativeOffset;
		return true;
	};

	// 3. 处理链接 [text](url)
	const handleLink = (): boolean => {
		if (content[relativeOffset] !== '[') return false;

		// 简单的正则或索引匹配：[内容](链接)
		const match = content.slice(relativeOffset).match(/^\[([^\]]+)\]\(([^)]+)\)/);
		if (!match) return false;

		flushText(relativeOffset);
		const [fullMatch, linkText, linkUrl] = match;

		ast.push({
			type: InlineNodeType.Link,
			value: linkText,
			url: linkUrl,
			position: {
				start: { line, column: baseColumn + relativeOffset, offset: baseOffset + relativeOffset },
				end: {
					line,
					column: baseColumn + relativeOffset + fullMatch.length,
					offset: baseOffset + relativeOffset + fullMatch.length,
				},
			},
		} as any);

		relativeOffset += fullMatch.length;
		pendingTextStart = relativeOffset;
		return true;
	};

	while (relativeOffset < content.length) {
		if (
			handleSymmetry('**', InlineNodeType.Strong) ||
			handleSymmetry('--', InlineNodeType.Italic) ||
			handleInlineCode() ||
			handleLink() ||
			handleSymmetry('~~', InlineNodeType.Strikethrough) ||
			handleSymmetry('__', InlineNodeType.Underline) ||
			handleSymmetry('++', InlineNodeType.Inserted) ||
			handleSymmetry('==', InlineNodeType.Highlight)
		) {
			continue;
		}

		const codePoint = content.codePointAt(relativeOffset);
		const charLength = codePoint !== undefined && codePoint > 0xff_ff ? 2 : 1;
		relativeOffset += charLength;
	}

	flushText(relativeOffset);
	return { ast, error: errors };
}

export { walk };
