import type { Node } from '../types/node/node';

/**
 * 递归调整节点及其子节点的位置信息
 * @param node 目标节点
 * @param offset 全文偏移量增量
 * @param lineOffset 行号偏移量增量
 * @returns 调整结果
 */
function shiftNodePosition(node: Node, offset: number, lineOffset: number): Node {
	const pos = node.position;
	if (pos) {
		// 处理偏移量
		if (typeof pos.start.offset === 'number') {
			pos.start.offset += offset;
		}
		if (typeof pos.end.offset === 'number') {
			pos.end.offset += offset;
		}

		// 处理行号
		pos.start.line += lineOffset;
		pos.end.line += lineOffset;
	}

	// 处理子节点
	if ('children' in node && Array.isArray(node.children)) {
		for (const child of node.children) {
			shiftNodePosition(child, offset, lineOffset);
		}
	}

	return node;
}

export { shiftNodePosition };
