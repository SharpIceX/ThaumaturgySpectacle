import type { ParseRule } from '../main';
import { preNodeType } from '../../../types/node/pre-node';

const thematicBreak: ParseRule = (_originalContent, currentLineContent, line, offset, node) => {
	// 确保是分隔符
	if (currentLineContent !== '---') return;

	const length = currentLineContent.length;

	node.push({
		type: preNodeType.Break,
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
