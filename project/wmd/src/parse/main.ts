import type { Node } from '../types/node/node';
import { blockParse } from './block-parse/main';
import { inlineParse } from './inline-parse';
import type { ParseError } from '../types/error';

interface ResultType {
	ast: Node[];
	error: ParseError[];
}

/**
 * Wiki Markdown 解析器
 * @param content Wiki Markdown 内容
 * @returns 解析结果
 */
function parse(content: string): ResultType {
	const { ast, error: blockErrors } = blockParse(content);
	const { error: inlineErrors } = inlineParse(content, ast);

	return {
		ast,
		error: [...blockErrors, ...inlineErrors],
	};
}

export { parse };
