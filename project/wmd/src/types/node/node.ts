import type { preNodeType, preNode } from './pre-node';
import type { InlineNodeType, InlineNode } from './inline-node';

/** 基本节点 */
interface BaseNode {
	/** 起始偏移量 */
	start: number;

	/** 结束偏移量 */
	end: number;
}

/** 所有节点类型 */
type Node = preNode | InlineNode;

type NodeType = InlineNodeType | preNodeType;

export type { BaseNode, Node, NodeType };
