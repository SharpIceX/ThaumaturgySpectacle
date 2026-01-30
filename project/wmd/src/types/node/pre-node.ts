import type { BaseNode, Node } from './node';
import type { InlineNode } from './inline-node';

enum preNodeType {
	/** 根节点，全文档唯一 */
	Root = 'root',

	/** 文档头部信息，全文档唯一 */
	Frontmatter = 'frontmatter',

	/** 段落 */
	Paragraph = 'paragraph',

	/** 标题 */
	Heading = 'heading',

	/** 列表列表 */
	List = 'list',

	/** 列表项 */
	ListItem = 'list_item',

	/** 图片 */
	Image = 'image',

	/** 引用块 */
	Blockquote = 'blockquote',

	/** 代码块 */
	Code = 'code',

	/** 公式块 */
	Formula = 'formula',

	/** 宏 */
	Macro = 'macro',

	/** 分隔线 */
	Break = 'break',

	/** 脚注内容源 */
	FootnoteDefinition = 'footnote_definition',
}

/** 根节点 */
interface RootNode extends BaseNode {
	type: preNodeType.Root;
	children: Node[];
	frontmatter?: FrontmatterNode;
}

/** Frontmatter 节点 */
interface FrontmatterNode extends BaseNode {
	type: preNodeType.Frontmatter;

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

/** 段落节点 */
interface ParagraphNode extends BaseNode {
	type: preNodeType.Paragraph;
	children: InlineNode[];
}

/** 标题节点 */
interface HeadingNode extends BaseNode {
	type: preNodeType.Heading;
	level: 1 | 2 | 3 | 4 | 5 | 6;
	children: InlineNode[];
}

/** 列表节点 */
interface ListNode extends BaseNode {
	type: preNodeType.List;

	/** true 为有序 (.)，false 为无序 (-) */
	ordered: boolean;

	children: ListItemNode[];
}

/** 列表项节点 */
interface ListItemNode extends BaseNode {
	type: preNodeType.ListItem;
	children: Node[];
}

/** 图片节点 */
interface ImageNode extends BaseNode {
	type: preNodeType.Image;

	/** 图片标题 */
	title: string;

	/** 图片地址 */
	src: string;

	/** 图片环绕方式，没有就居中不环绕 */
	layout?: 'left' | 'right';

	/** 图片缩放，保留两位小数点 */
	scale?: number;
}

/** 引用块节点 */
interface BlockquoteNode extends BaseNode {
	type: preNodeType.Blockquote;

	/** 如果是警报块，则此处有值 */
	alertType?: 'note' | 'tip' | 'warning' | 'danger' | 'important';

	children: Node[];
}

/** 代码块节点 */
interface CodeNode extends BaseNode {
	type: preNodeType.Code;

	/** 高亮使用的语言 */
	language?: string;

	/** 备注，也可以是文件名 */
	remark?: string;

	/** 代码内容 */
	value: string;
}

/** 公式块节点 */
interface FormulaNode extends BaseNode {
	type: preNodeType.Formula;

	/** 公式内容 */
	value: string;
}

/** 宏节点 */
interface MacroNode extends BaseNode {
	type: preNodeType.Macro;

	/** 宏名称 */
	name: string;

	/** 宏参数 */
	args?: string;

	/** 宏内容 */
	value: string;
}

/** 分隔线节点 */
interface BreakNode extends BaseNode {
	type: preNodeType.Break;
}

/** 脚注内容源 */
interface FootnoteDefinitionNode extends BaseNode {
	type: preNodeType.FootnoteDefinition;

	/** 脚注标识符，用于匹配正文中的引用 */
	label: string;

	/** 暂存所有引用了此脚注的唯一 ID，实现回跳 */
	backReferences: string[];

	children: InlineNode[];
}

type preNode =
	| RootNode
	| FrontmatterNode
	| ParagraphNode
	| HeadingNode
	| ListNode
	| ListItemNode
	| ImageNode
	| BlockquoteNode
	| CodeNode
	| FormulaNode
	| MacroNode
	| BreakNode
	| FootnoteDefinitionNode;

export type {
	RootNode,
	preNode,
	FrontmatterNode,
	ParagraphNode,
	HeadingNode,
	ListNode,
	ListItemNode,
	ImageNode,
	BlockquoteNode,
	CodeNode,
	FormulaNode,
	MacroNode,
	BreakNode,
	FootnoteDefinitionNode,
};
export { preNodeType };
