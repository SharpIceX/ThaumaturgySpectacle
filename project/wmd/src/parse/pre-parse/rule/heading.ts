import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType } from '../../../types/node/pre-node';
import type { HeadingNode } from '../../../types/node/pre-node';

const heading: ParseRule = (_originalContent, currentLineContent, offset, node, errors) => {
	// 确保是标题
	if (currentLineContent[0] !== '#') return;

	let level = 0;
	const length = currentLineContent.length;

	// 获取标题等级
	while (level < length && currentLineContent[level] === '#') {
		level++;
	}

	// 校验级别（HTML 最高只支持六级）
	let finalLevel = level;
	if (level > 6) {
		errors.push({
			code: ParseErrorCode.INVALID_HEADING_LEVEL,
			start: offset,
			end: offset + level,
		});
		finalLevel = 6;
	}

	node.push({
		type: preNodeType.Heading,
		level: finalLevel as HeadingNode['level'],
		children: [],
		start: offset,
		end: offset + length,
	});

	return true;
};

export default heading;
