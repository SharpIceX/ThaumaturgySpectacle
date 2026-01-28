import type { ParseError } from '../types/error';
import type { Node } from '../types/node/node';
import type { BlockNode } from '../types/node/block-node';

interface ResultType {
	ast: Node[];
	error: ParseError[];
}

/**
 * Wiki Markdown
 * @param content Wiki Markdown 内容
 * @param node 块节点
 * @returns 解析结果
 */
function inlineParse(content: string, node: BlockNode[]): ResultType {
	const nodes: Node[] = node;
	const errors: ParseError[] = [];

	// TODO: 先直接返回
	return {
		ast: nodes,
		error: errors,
	};
}

export { inlineParse };
