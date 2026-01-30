import type { ParseRule } from '../main';
import { BlockNodeType, type FootnoteDefinitionNode } from '../../../types/node/block-node';

const footnoteDefinition: ParseRule = (_originalContent, currentLineContent, line, offset, nodes) => {
	// 1. 快速探测：是否以 [^ 开头
	if (!currentLineContent.startsWith('[^')) {
		return false;
	}

	const closingIndex = currentLineContent.indexOf(']');

	// 2. 校验闭合中括号及其后的冒号（通常脚注定义后接冒号）
	// 如果 closingIndex 为 -1 或 label 为空，则不匹配
	if (closingIndex === -1) {
		return false;
	}

	const label = currentLineContent.slice(2, closingIndex);
	if (label.length === 0) {
		return false;
	}

	// 3. 构建 FootnoteDefinition 节点
	const footnoteNode: FootnoteDefinitionNode = {
		type: BlockNodeType.FootnoteDefinition,
		label: label,
		backReferences: [],
		children: [],
		position: {
			start: {
				line: line,
				column: 1,
				offset: offset,
			},
			end: {
				line: line,
				column: currentLineContent.length + 1,
				offset: offset + currentLineContent.length,
			},
		},
	};

	nodes.push(footnoteNode);

	return true;
};

export default footnoteDefinition;
