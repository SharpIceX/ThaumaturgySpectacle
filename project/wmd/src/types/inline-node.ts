import type { BaseNode } from './main';

enum InlineNodeType {
	/** 文本 */
	Text = 'text',
}

/** 文本节点 */
interface TextNode extends BaseNode {
	type: InlineNodeType.Text;
	value: string;
}

type InlineNode = TextNode;

export type { TextNode, InlineNode };
export { InlineNodeType };
