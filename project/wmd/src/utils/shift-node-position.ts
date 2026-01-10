import type { Node } from '../types/main';

/**
 * 递归调整节点及其子节点的位置信息
 * @param node 目标节点
 * @param offset 全文偏移量增量
 * @param lineOffset 行号偏移量增量
 * @returns 调整结果
 */
function shiftNodePosition(node: Node, offset: number, lineOffset: number): Node {
	if (node.position) {
		// 处理起点
		if (node.position.start.offset !== undefined) {
			node.position.start.offset += offset;
		}
		node.position.start.line += lineOffset;

		// 处理终点
		if (node.position.end.offset !== undefined) {
			node.position.end.offset += offset;
		}
		node.position.end.line += lineOffset;
	}

	// 递归处理子节点
	if ('children' in node && Array.isArray(node.children)) {
		for (const child of node.children) {
			shiftNodePosition(child, offset, lineOffset);
		}
	}

	return node;
}

export { shiftNodePosition };
