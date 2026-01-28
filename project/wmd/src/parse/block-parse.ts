import type { ParseError } from '../types/error';
import { BlockNodeType } from '../types/node/block-node';
import type {
	BlockNode,
	HeadingNode,
	ImageNode,
	BlockquoteNode,
	CodeNode,
	FormulaNode,
	MacroNode,
	BreakNode,
} from '../types/node/block-node';

interface ResultType {
	ast: BlockNode[];
	error: ParseError[];
}

/**
 * Wiki Markdown 块解析
 * @param content Wiki Markdown 内容
 * @returns 解析结果
 */
function blockParse(content: string): ResultType {
	const nodes: BlockNode[] = [];
	const errors: ParseError[] = [];

	// 当前位置
	let cursor = 0;

	// 当前行
	let line = 1;

	while (cursor < content.length) {
		// lineEnd 是 \n 的索引
		// endOffset 是当前行内容的实际终点（不含 \n）
		const lineEnd = content.indexOf('\n', cursor);
		const endOffset = lineEnd === -1 ? content.length : lineEnd;
		const currentLine = content.slice(cursor, endOffset);

		// 记录本行起始状态
		const startOffset = cursor;
		const startLine = line;

		/**
		 * 步进工具
		 * @param count 跳过的行数
		 * @param targetOffset 可选：直接跳转的目标偏移量
		 */
		const next = (count = 1, targetOffset?: number) => {
			if (targetOffset === undefined) {
				// 常规单行步进
				for (let index = 0; index < count; index++) {
					const eol = content.indexOf('\n', cursor);
					cursor = eol === -1 ? content.length : eol + 1;
					line++;
					if (cursor >= content.length) break;
				}
			} else {
				// 如果已经算好了位置，直接同步坐标
				cursor = targetOffset;
				line += count;
			}
		};

		// ========== 空行 ==========
		if (currentLine.trim() === '') {
			next();
			continue;
		}

		// 分割线
		if (currentLine === '---') {
			nodes.push({
				type: BlockNodeType.Break,
				position: {
					start: { line: startLine, column: 1, offset: startOffset },
					end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
				},
			});
			next();
			continue;
		}

		// ========== 标题 ==========
		if (currentLine.startsWith('#')) {
			let level = 0;
			while (currentLine[level] === '#' && level < 6) {
				level++;
			}

			nodes.push({
				type: BlockNodeType.Heading,
				level: level as HeadingNode['level'],
				children: [],
				position: {
					start: { line: startLine, column: 1, offset: startOffset },
					end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
				},
			});
			next();
			continue;
		}

		// ========== 列表 ==========
		// `-`开头为无序列表，`.`开头为有序列表
		if (currentLine.startsWith('-') || currentLine.startsWith('.')) {
			const blockStartLine = line;
			const blockStartOffset = cursor;

			// 通过第一行字符决定列表类型：'.' 为有序，'-' 为无序
			const isOrdered = currentLine.startsWith('.');

			let probeCursor = cursor;
			let listLineCount = 0;
			let lastLineLength = 0;
			let blockEndOffset = cursor;

			// 只找物理边界，不更新全局状态
			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				// 贪婪匹配：只要是列表符号开头就属于同一个块
				if (lineText.startsWith('-') || lineText.startsWith('.')) {
					listLineCount++;
					lastLineLength = lineText.length;
					blockEndOffset = lineEnd;

					if (nextNl === -1) break;
					probeCursor = nextNl + 1;
				} else {
					break;
				}
			}

			nodes.push({
				type: BlockNodeType.List,
				ordered: isOrdered,
				children: [],
				position: {
					start: { line: blockStartLine, column: 1, offset: blockStartOffset },
					end: {
						line: blockStartLine + listLineCount - 1,
						column: lastLineLength + 1,
						offset: blockEndOffset,
					},
				},
			});

			// 跳转
			const jumpTarget = blockEndOffset === content.length ? content.length : blockEndOffset + 1;
			next(listLineCount, jumpTarget);

			continue;
		}

		// ========== 脚注定义 ==========
		if (currentLine.startsWith('[^')) {
			const closingBracketIndex = currentLine.indexOf(']');

			// 确保有闭合括号
			if (closingBracketIndex !== -1) {
				const label = currentLine.slice(2, closingBracketIndex);

				nodes.push({
					type: BlockNodeType.FootnoteDefinition,
					label: label,
					backReferences: [],
					children: [],
					position: {
						start: { line: startLine, column: 1, offset: startOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				});

				next();
				continue;
			}
		}

		// ========== 图片 ==========
		if (currentLine.startsWith('![')) {
			const titleEndIndex = currentLine.indexOf('](');
			const linkEndIndex = currentLine.lastIndexOf(')');

			if (titleEndIndex !== -1 && linkEndIndex > titleEndIndex) {
				const title = currentLine.slice(2, titleEndIndex);
				const contentWithParameters = currentLine.slice(titleEndIndex + 2, linkEndIndex);

				const parts = contentWithParameters.trim().split(/\s+/);
				const source = parts[0];
				const parameters = parts.slice(1);

				// 提前处理 source 为 undefined 的极端情况（虽然正则拆分通常不会）
				if (!source) {
					next();
					continue;
				}

				const imageNode: ImageNode = {
					type: BlockNodeType.Image,
					title,
					src: source,
					position: {
						start: { line: startLine, column: 1, offset: startOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				};

				for (const parameter of parameters) {
					// 使用解构赋值，并给 value 一个默认空字符串，解决 undefined 报错
					const [key, value = ''] = parameter.split('=');

					if (key === 'layout') {
						if (value === 'left' || value === 'right') {
							imageNode.layout = value;
						}
					} else if (key === 'scale') {
						const scale = Number.parseFloat(value);
						if (!Number.isNaN(scale)) {
							imageNode.scale = Math.round(scale * 100) / 100;
						}
					}
				}

				nodes.push(imageNode);
				next();
				continue;
			}
		}

		// ========== 段落 (兜底) ==========
		const lastNode = nodes.at(-1);
		if (lastNode?.type === BlockNodeType.Paragraph) {
			// 合并到上一个段落，只更新结束位置
			lastNode.position.end = {
				line: startLine,
				column: currentLine.length + 1,
				offset: endOffset,
			};
		} else {
			nodes.push({
				type: BlockNodeType.Paragraph,
				children: [],
				position: {
					start: { line: startLine, column: 1, offset: startOffset },
					end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
				},
			});
		}

		next();
	}

	return {
		ast: nodes,
		error: errors,
	};
}

export { blockParse };
