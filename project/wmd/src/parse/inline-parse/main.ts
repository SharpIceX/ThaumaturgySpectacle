import type { Node } from '../../types/node/node';
import type { preNode } from '../../types/node/pre-node';
import { ParseErrorCode, type ParseError } from '../../types/error';

interface ResultType {
	ast: Node[];
	error: ParseError[];
}

/**
 * Wiki Markdown 行内解析
 * @param content Wiki Markdown 内容
 * @param node 块节点
 * @returns 解析结果
 */
function inlineParse(content: string, node: preNode[]): ResultType {
	const nodes: Node[] = node;
	const errors: ParseError[] = [];

	const walk = (currentNodes: Node[]) => {
		for (const node of currentNodes) {
			// ========== 标题 ==========
		}
	};

	//walk(nodes);

	return {
		ast: nodes,
		error: errors,
	};
}

export { inlineParse };
