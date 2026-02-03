import type { ParseRule } from '../main';
import { preNodeType } from '../../../types/node/pre-node';

const thematicBreak: ParseRule = (_originalContent, currentLineContent, offset, node) => {
	// 确保是分隔符
	if (currentLineContent !== '---') return;

	node.push({
		type: preNodeType.Break,
		start: offset,
		end: offset + currentLineContent.length,
	});

	return true;
};

export default thematicBreak;
