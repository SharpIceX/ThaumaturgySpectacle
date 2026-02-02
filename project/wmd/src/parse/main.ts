import type { Node } from '../types/node/node';
import { preParse } from './pre-parse/main';
import { inlineParse } from './inline-parse/main';
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
	const { ast, error } = preParse(content);
	//inlineParse(content, ast, error);

	return { ast, error };
}

export { parse };
