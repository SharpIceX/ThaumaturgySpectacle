import list from './rule/list';
import image from './rule/image';
import heading from './rule/heading';
import container from './rule/container';
import blockquote from './rule/blockquote';
import thematicBreak from './rule/thematic-break';
import { type ParseError } from '../../types/error';
import footnoteDefinition from './rule/footnote-definition';
import { preNodeType } from '../../types/node/pre-node';
import type { preNode } from '../../types/node/pre-node';

interface ResultType {
	ast: preNode[];
	error: ParseError[];
}

type ParseRule = (
	originalContent: string,
	currentLineContent: string,
	offset: number,
	node: preNode[],
	error: ParseError[],
) => number | true | undefined;

const rules = [
	// 分隔线
	thematicBreak,

	// 标题
	heading,

	// 脚注
	footnoteDefinition,

	// 图片
	image,

	// 引用块/强调信息
	blockquote,

	// 代码块/公式块/宏
	container,

	// 列表
	list,
];

/**
 * Wiki Markdown 预解析
 * @param content Wiki Markdown 内容
 * @returns 解析结果
 */
function preParse(content: string): ResultType {
	const nodes: preNode[] = [];
	const errors: ParseError[] = [];

	let currentOffset = 0;
	const totalLength = content.length;

	mainLoop: while (currentOffset < totalLength) {
		// 获取当前行边界
		const lineEnd = content.indexOf('\n', currentOffset);
		const endOffset = lineEnd === -1 ? totalLength : lineEnd;
		const nextLineOffset = lineEnd === -1 ? totalLength : lineEnd + 1;

		const currentLineContent = content.slice(currentOffset, endOffset);

		// ========== 空行 ==========
		if (/^[ \t]*$/.test(currentLineContent)) {
			currentOffset = nextLineOffset;
			continue;
		}

		// ========== 规则匹配 ==========
		for (const rule of rules) {
			const result = rule(content, currentLineContent, currentOffset, nodes, errors);
			if (result !== undefined) {
				currentOffset = typeof result === 'number' ? result : nextLineOffset;
				continue mainLoop;
			}
		}

		// ========== 段落处理 (兜底) ==========
		const lastNode = nodes.at(-1);

		/**
		 * 判定是否连续：
		 * 若上一节点是段落，且其结束位置正好是当前行的起点 - 1 (即中间只隔了一个 \n)，则合并。
		 * 如果中间有空格/空行，空行检测逻辑会提前推进 currentOffset，从而断开此条件。
		 */
		if (lastNode?.type === preNodeType.Paragraph && lastNode.end === currentOffset - 1) {
			lastNode.end = endOffset;
		} else {
			nodes.push({
				type: preNodeType.Paragraph,
				children: [],
				start: currentOffset,
				end: endOffset,
			});
		}

		currentOffset = nextLineOffset;
	}

	return { ast: nodes, error: errors };
}

export { preParse };
export type { ParseRule };
