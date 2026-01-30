import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType, type BlockquoteNode } from '../../../types/node/pre-node';

/** 允许的 Alert 类型集合 */
const ALLOWED_ALERTS = new Set(['note', 'tip', 'warning', 'danger', 'important']);

const blockquote: ParseRule = (originalContent, currentLineContent, line, offset, node, errors) => {
	// 确保是引用块
	if (currentLineContent[0] !== '>') return;

	let totalLines = 1;
	let blockEndOffset = offset + currentLineContent.length;
	let lastLineLength = currentLineContent.length;
	let alertType: BlockquoteNode['alertType'];

	// 解析第一行的 Alert 标识
	const firstLine = currentLineContent;
	let bracketStart = -1;
	let bracketEnd = -1;

	// 尝试查找 Alert 类型
	for (let index = 1; index < firstLine.length; index++) {
		const char = firstLine[index];
		if (char === ' ') continue;
		if (char === '[') {
			bracketStart = index;
			break;
		}
		break;
	}

	if (bracketStart !== -1) {
		bracketEnd = firstLine.indexOf(']', bracketStart);
		if (bracketEnd !== -1) {
			const remaining = firstLine.slice(bracketEnd + 1).trim();
			if (remaining === '') {
				const type = firstLine.slice(bracketStart + 1, bracketEnd).toLowerCase();
				if (ALLOWED_ALERTS.has(type)) {
					alertType = type as BlockquoteNode['alertType'];
				} else {
					errors.push({
						code: ParseErrorCode.INVALID_BLOCKQUOTE_ALERT_TYPE,
						position: {
							start: { line, column: 1, offset },
							end: { line, column: firstLine.length + 1, offset: offset + firstLine.length },
						},
					});
				}
			}
		}
	}

	// 向下探测后续行
	let probeCursor = blockEndOffset + 1;
	while (probeCursor < originalContent.length) {
		// 探测下一行的开头
		if (originalContent[probeCursor] !== '>') break;

		const nextNl = originalContent.indexOf('\n', probeCursor);
		const lineEnd = nextNl === -1 ? originalContent.length : nextNl;

		totalLines++;
		lastLineLength = lineEnd - probeCursor;
		blockEndOffset = lineEnd;

		if (nextNl === -1) break;
		probeCursor = nextNl + 1;
	}

	const blockquoteNode: BlockquoteNode = {
		type: preNodeType.Blockquote,
		children: [],
		position: {
			start: { line, column: 1, offset },
			end: {
				line: line + totalLines - 1,
				column: lastLineLength + 1,
				offset: blockEndOffset,
			},
		},
	};

	if (alertType) blockquoteNode.alertType = alertType;
	node.push(blockquoteNode);

	return {
		jumpLine: totalLines - 1,
	};
};

export default blockquote;
