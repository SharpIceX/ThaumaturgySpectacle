enum NodeType {
	/** 根节点，全文档唯一 */
	Root = 'root',

	/** 文档头部信息，全文档唯一 */
	Frontmatter = 'frontmatter',

	/** 文本 */
	Text = 'text',
}

/** 详细位置信息 */
interface Point {
	/** 行号 */
	line: number;

	/** 列号（0-based） */
	column: number;

	/** 全文偏移量（从 0 开始计数） */
	offset?: number;
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

/** 根节点 */
interface RootNode extends BaseNode {
	type: NodeType.Root;
	frontmatter?: FrontmatterNode;
	children?: Node[];
}

/** Frontmatter 节点 */
interface FrontmatterNode extends BaseNode {
	type: NodeType.Frontmatter;

	/** 元数据 */
	metadata: {
		/** 标题 */
		title?: string;

		/** 描述 */
		description?: string;

		/** 关键词 */
		keywords?: string | string[];

		/** 分类 */
		category?: string | string[];
	} & Record<string, unknown>;
}

/** 文本节点 */
interface TextNode extends BaseNode {
	type: NodeType.Text;
	value: string;
}

/** 所有正文节点类型 */
type Node = TextNode;

export type { Point, Position, RootNode, FrontmatterNode, TextNode, Node };

export { NodeType };
