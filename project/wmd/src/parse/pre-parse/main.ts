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
	line: number,
	offset: number,
	node: preNode[],
	error: ParseError[],
) => { jumpLine?: number } | boolean | undefined;

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

	let currentLine = 1;
	let currentOffset = 0;

	mainLoop: while (currentOffset < content.length) {
		// 获取当前行信息
		const lineEnd = content.indexOf('\n', currentOffset);
		const isLastLine = lineEnd === -1;
		const endOffset = isLastLine ? content.length : lineEnd;
		const currentLineContent = content.slice(currentOffset, endOffset);

		// ========== 空行 ==========
		if (currentLineContent.trim() === '') {
			currentOffset = isLastLine ? content.length : lineEnd + 1;
			currentLine++;
			continue;
		}

		// ========== 规则匹配 ==========
		for (const rule of rules) {
			const result = rule(content, currentLineContent, currentLine, currentOffset, nodes, errors);
			if (result) {
				const jumpLineCount = typeof result === 'object' ? (result.jumpLine ?? 0) : 0;

				if (jumpLineCount === 0) {
					// 当行
					currentOffset = isLastLine ? content.length : lineEnd + 1;
					currentLine++;
				} else {
					// 多行匹配，执行跳行
					const linesToSkip = jumpLineCount + 1;
					for (let index = 0; index < linesToSkip; index++) {
						const nextLineBreak = content.indexOf('\n', currentOffset);
						if (nextLineBreak === -1) {
							currentOffset = content.length;
							currentLine++;
							break;
						}
						currentOffset = nextLineBreak + 1;
						currentLine++;
					}
				}
				continue mainLoop;
			}
		}

		// ========== 段落（兜底） ==========
		const lastNode = nodes.at(-1);

		/**
		 * 若当前行与上一段落之间没有空行（偏移量差值 <= 1），则视为同一段落。
		 * 空行会跳过处理并拉开 offset，从而自然触发新段落的创建。
		 */
		const isContinuous =
			lastNode && lastNode.type === preNodeType.Paragraph && lastNode.position.end.offset >= currentOffset - 1;

		if (isContinuous) {
			// 合并到已有段落
			lastNode.position.end = {
				line: currentLine,
				column: currentLineContent.length + 1,
				offset: endOffset,
			};
		} else {
			nodes.push({
				type: preNodeType.Paragraph,
				children: [],
				position: {
					start: { line: currentLine, column: 1, offset: currentOffset },
					end: { line: currentLine, column: currentLineContent.length + 1, offset: endOffset },
				},
			});
		}
		currentOffset = isLastLine ? content.length : lineEnd + 1;
		currentLine++;
	}

	return { ast: nodes, error: errors };
}

export { preParse };
export type { ParseRule };
