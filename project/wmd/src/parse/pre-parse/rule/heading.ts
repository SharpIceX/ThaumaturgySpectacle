import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType } from '../../../types/node/pre-node';
import type { HeadingNode } from '../../../types/node/pre-node';

const heading: ParseRule = (_originalContent, currentLineContent, line, offset, node, errors) => {
	// 确保是标题
	if (currentLineContent[0] !== '#') return;

	let level = 0;
	const length = currentLineContent.length;
	const startPos = { line: line, column: 1, offset: offset };

	// 获取标题等级
	while (level < length && currentLineContent[level] === '#') {
		level++;
	}

	// 校验级别（HTML 最高支持六级）
	let finalLevel = level;
	if (level > 6) {
		errors.push({
			code: ParseErrorCode.INVALID_HEADING_LEVEL,
			position: {
				start: startPos,
				end: {
					line: line,
					column: level + 1,
					offset: offset + level,
				},
			},
		});
		finalLevel = 6;
	}

	node.push({
		type: preNodeType.Heading,
		level: finalLevel as HeadingNode['level'],
		children: [],
		position: {
			start: startPos,
			end: {
				line: line,
				column: length + 1,
				offset: offset + length,
			},
		},
	});

	return true;
};

export default heading;
