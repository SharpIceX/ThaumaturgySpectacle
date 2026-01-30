import type { BaseNode } from './node';

enum InlineNodeType {
	/** 纯文本 */
	Text = 'text',

	/** 加粗文本 */
	Strong = 'strong',

	/** 斜体文本 */
	Emphasis = 'emphasis',

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
	Link = 'Link',

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
	value: string;
}

/** 斜体节点 */
interface EmphasisNode extends BaseNode {
	type: InlineNodeType.Emphasis;
	value: string;
}

/** 删除线节点 */
interface StrikethroughNode extends BaseNode {
	type: InlineNodeType.Strikethrough;
	value: string;
}

/** 下划线节点 */
interface UnderlineNode extends BaseNode {
	type: InlineNodeType.Underline;
	value: string;
}

/** 上标节点 */
interface SuperscriptNode extends BaseNode {
	type: InlineNodeType.Superscript;
	value: string;
}

/** 下标节点 */
interface SubscriptNode extends BaseNode {
	type: InlineNodeType.Subscript;
	value: string;
}

/** 插入文本节点 */
interface InsertedNode extends BaseNode {
	type: InlineNodeType.Inserted;
	value: string;
}

/** 高亮文本节点 */
interface HighlightNode extends BaseNode {
	type: InlineNodeType.Highlight;
	value: string;
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
	src: string;

	value: string;
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
	| EmphasisNode
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
	EmphasisNode,
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
