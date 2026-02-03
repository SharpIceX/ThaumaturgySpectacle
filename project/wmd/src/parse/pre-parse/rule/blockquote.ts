import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType, type BlockquoteNode } from '../../../types/node/pre-node';

/** 允许的 Alert 类型集合 */
const ALLOWED_ALERTS = new Set(['note', 'tip', 'warning', 'danger', 'important']);

const blockquote: ParseRule = (originalContent, currentLineContent, offset, node, errors) => {
	// 确保是引用块
	if (currentLineContent[0] !== '>') return;

	let blockEndOffset = offset + currentLineContent.length;
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
						// 扁平化报错位置
						start: offset,
						end: offset + firstLine.length,
					});
				}
			}
		}
	}

	// 向下探测后续行
	// blockEndOffset 目前是第一行的末尾（不含 \n）
	let probeCursor = blockEndOffset + 1;

	while (probeCursor < originalContent.length) {
		// 探测下一行的开头是否依然是 '>'
		if (originalContent[probeCursor] !== '>') break;

		const nextNl = originalContent.indexOf('\n', probeCursor);
		const lineEnd = nextNl === -1 ? originalContent.length : nextNl;

		// 更新块的结束偏移量
		blockEndOffset = lineEnd;

		if (nextNl === -1) break;
		probeCursor = nextNl + 1;
	}

	const blockquoteNode: BlockquoteNode = {
		type: preNodeType.Blockquote,
		children: [],
		// 扁平化 start / end
		start: offset,
		end: blockEndOffset,
	};

	if (alertType) blockquoteNode.alertType = alertType;
	node.push(blockquoteNode);

	// 计算跳转位置：如果有换行符则跳过换行符，否则跳到文件末尾
	const jumpOffset = blockEndOffset < originalContent.length ? blockEndOffset + 1 : blockEndOffset;

	return jumpOffset;
};

export default blockquote;
