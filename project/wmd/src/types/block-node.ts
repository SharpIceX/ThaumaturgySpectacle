import type { BaseNode, Node } from './main';
import type { InlineNode } from './inline-node';

enum BlockNodeType {
	/** 根节点，全文档唯一 */
	Root = 'root',

	/** 文档头部信息，全文档唯一 */
	Frontmatter = 'frontmatter',

	/** 段落 */
	Paragraph = 'paragraph',
}

/** 根节点 */
interface RootNode extends BaseNode {
	type: BlockNodeType.Root;
	frontmatter?: FrontmatterNode;
	children?: Node[];
}

/** Frontmatter 节点 */
interface FrontmatterNode extends BaseNode {
	type: BlockNodeType.Frontmatter;

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
	type: BlockNodeType.Paragraph;
	children: InlineNode[];
}

type BlockNode = RootNode | FrontmatterNode | ParagraphNode;

export type { RootNode, FrontmatterNode, ParagraphNode, BlockNode };
export { BlockNodeType };
