import type { BaseNode } from './node';

enum InlineNodeType {
	/** 纯文本 */
	Text = 'text',

	/** 加粗文本 */
	Strong = 'strong',

	/** 斜体文本 */
	Italic = 'italic',

	/** 删除线文本 */
	Strikethrough = 'strikethrough',

	/** 下划线文本 */
	Underline = 'underline',

	/** 上标文本 */
	Superscript = 'superscript',

	/** 下标文本 */
	Subscript = 'subscript',

	/** 插入文本 */
	Inserted = 'inserted',

	/** 高亮文本 */
	Highlight = 'highlight',

	/** 行内代码 */
	InlineCode = 'inline_code',

	/** 行内公式 */
	InlineFormula = 'inline_formula',

	/** 超链接 */
	Link = 'link',

	/** 脚注引用 */
	FootnoteReference = 'footnote_reference',
}

/** 文本节点 */
interface TextNode extends BaseNode {
	type: InlineNodeType.Text;
	value: string;
}

/** 加粗节点 */
interface StrongNode extends BaseNode {
	type: InlineNodeType.Strong;
	children: InlineNode[];
}

/** 斜体节点 */
interface ItalicNode extends BaseNode {
	type: InlineNodeType.Italic;
	children: InlineNode[];
}

/** 删除线节点 */
interface StrikethroughNode extends BaseNode {
	type: InlineNodeType.Strikethrough;
	children: InlineNode[];
}

/** 下划线节点 */
interface UnderlineNode extends BaseNode {
	type: InlineNodeType.Underline;
	children: InlineNode[];
}

/** 上标节点 */
interface SuperscriptNode extends BaseNode {
	type: InlineNodeType.Superscript;
	children: InlineNode[];
}

/** 下标节点 */
interface SubscriptNode extends BaseNode {
	type: InlineNodeType.Subscript;
	children: InlineNode[];
}

/** 插入文本节点 */
interface InsertedNode extends BaseNode {
	type: InlineNodeType.Inserted;
	children: InlineNode[];
}

/** 高亮文本节点 */
interface HighlightNode extends BaseNode {
	type: InlineNodeType.Highlight;
	children: InlineNode[];
}

/** 行内代码节点 */
interface InlineCodeNode extends BaseNode {
	type: InlineNodeType.InlineCode;
	value: string;
}

/** 行内公式节点 */
interface InlineFormulaNode extends BaseNode {
	type: InlineNodeType.InlineFormula;
	value: string;
}

/** 超链接节点 */
interface LinkNode extends BaseNode {
	type: InlineNodeType.Link;

	/** 链接 */
	href: string;

	children: InlineNode[];
}

/** 脚注引用节点 */
interface FootnoteReferenceNode extends BaseNode {
	type: InlineNodeType.FootnoteReference;

	/** 匹配定义节点的标识符 */
	label: string;

	/** 当前引用的唯一 ID */
	refId: string;
}

type InlineNode =
	| TextNode
	| StrongNode
	| ItalicNode
	| StrikethroughNode
	| UnderlineNode
	| SuperscriptNode
	| SubscriptNode
	| InsertedNode
	| HighlightNode
	| InlineCodeNode
	| InlineFormulaNode
	| LinkNode
	| FootnoteReferenceNode;

export type {
	TextNode,
	InlineNode,
	StrongNode,
	ItalicNode,
	StrikethroughNode,
	UnderlineNode,
	SuperscriptNode,
	SubscriptNode,
	InsertedNode,
	HighlightNode,
	InlineCodeNode,
	InlineFormulaNode,
	LinkNode,
	FootnoteReferenceNode,
};
export { InlineNodeType };
