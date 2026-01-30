import type { ParseRule } from '../main';
import { BlockNodeType } from '../../../types/node/block-node';

const thematicBreak: ParseRule = (_originalContent, currentLineContent, line, offset, node) => {
	// 确保是分隔符
	if (currentLineContent !== '---') return;

	const length = currentLineContent.length;

	node.push({
		type: BlockNodeType.Break,
		position: {
			start: {
				line: line,
				column: 1,
				offset: offset,
			},
			end: {
				line: line,
				column: length + 1,
				offset: offset + length,
			},
		},
	});

	return true;
};

export default thematicBreak;
