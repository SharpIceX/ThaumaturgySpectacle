import type { Node } from '../types/node/node';

/**
 * 递归调整节点及其子节点的位置信息
 * @param node 目标节点
 * @param offset 全文偏移量增量
 */
function shiftNodePosition(node: Node, offset: number): void {
	node.start += offset;
	node.end += offset;

	// 处理子节点
	if ('children' in node && Array.isArray(node.children)) {
		for (const child of node.children) {
			shiftNodePosition(child, offset);
		}
	}
}

export { shiftNodePosition };
