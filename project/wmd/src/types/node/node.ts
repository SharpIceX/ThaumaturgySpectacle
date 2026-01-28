import type { BlockNodeType, BlockNode } from './block-node';
import type { InlineNodeType, InlineNode } from './inline-node';

/** 详细位置信息 */
interface Point {
	/** 行号 */
	line: number;

	/** 列号（0-based） */
	column: number;

	/** 全文偏移量（从 0 开始计数） */
	offset: number;
}

/** 节点在源码中的位置信息 */
interface Position {
	/** 节点的起始位置 */
	start: Point;

	/** 节点的结束位置（不包含此位置本身） */
	end: Point;
}

/** 基本节点 */
interface BaseNode {
	position: Position;
}

/** 所有节点类型 */
type Node = BlockNode | InlineNode;

type NodeType = InlineNodeType | BlockNodeType;

export type { Point, Position, BaseNode, Node, NodeType };
