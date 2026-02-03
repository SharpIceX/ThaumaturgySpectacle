import type { ParseRule } from '../main';
import { preNodeType, type FootnoteDefinitionNode } from '../../../types/node/pre-node';

const footnoteDefinition: ParseRule = (_originalContent, currentLineContent, offset, nodes) => {
	// 1. 快速探测：是否以 [^ 开头
	if (!currentLineContent.startsWith('[^')) return;

	const closingIndex = currentLineContent.indexOf(']');

	// 2. 校验闭合中括号
	// 如果 closingIndex 为 -1 或 label 为空，则不匹配
	if (closingIndex === -1) return;

	const label = currentLineContent.slice(2, closingIndex);
	if (label.length === 0) return;

	// 3. 构建 FootnoteDefinition 节点
	const footnoteNode: FootnoteDefinitionNode = {
		type: preNodeType.FootnoteDefinition,
		label: label,
		backReferences: [],
		children: [],
		// 拍平位置信息
		start: offset,
		end: offset + currentLineContent.length,
	};

	nodes.push(footnoteNode);

	return true;
};

export default footnoteDefinition;
