import { ParseErrorCode, type ParseError } from '../types/error';
import { BlockNodeType } from '../types/node/block-node';
import type { BlockNode, HeadingNode, ImageNode, BlockquoteNode, CodeNode, MacroNode } from '../types/node/block-node';

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

			// 找到开头所有`#`
			while (currentLine[level] === '#') {
				level++;
			}

			// 校验级别是否合法
			if (level > 6) {
				errors.push({
					code: ParseErrorCode.INVALID_HEADING_LEVEL,
					position: {
						start: { line: startLine, column: 1, offset: startOffset },
						end: { line: startLine, column: level + 1, offset: startOffset + level },
					},
				});

				// 修正为 6 级
				level = 6;
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

			// 确保基本的 Markdown 图片语法结构完整
			if (titleEndIndex !== -1 && linkEndIndex > titleEndIndex) {
				// 1. 提取标题内容 (去除前导的 ![ )
				const title = currentLine.slice(2, titleEndIndex);

				// 2. 提取括号内部的原始字符串并去除首尾空格
				const rawContent = currentLine.slice(titleEndIndex + 2, linkEndIndex).trim();

				// --- 校验：如果括号内完全没有内容 ---
				if (!rawContent) {
					errors.push({
						code: ParseErrorCode.MISSING_IMAGE_SOURCE,
						position: {
							start: { line: startLine, column: 1, offset: startOffset },
							end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
						},
					});
					next(); // 跳过当前行，不计入 AST
					continue;
				}

				// 3. 按空格拆分链接与参数
				const parts = rawContent.split(/\s+/);
				const source = parts[0];

				// --- 校验：如果第一个部分看起来像参数（包含=）或为空，说明缺失了核心链接 ---
				if (!source || source.includes('=')) {
					errors.push({
						code: ParseErrorCode.MISSING_IMAGE_SOURCE,
						position: {
							start: { line: startLine, column: 1, offset: startOffset },
							end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
						},
					});
					next(); // 丢弃该节点
					continue;
				}

				// 4. 链接校验通过，初始化图片节点
				const parameters = parts.slice(1);
				const imageNode: ImageNode = {
					type: BlockNodeType.Image,
					title,
					src: source,
					position: {
						start: { line: startLine, column: 1, offset: startOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				};

				// 5. 遍历并处理可选参数 (layout, scale)
				for (const parameter of parameters) {
					const [key, value = ''] = parameter.split('=');

					/**
					 * 计算参数在行内的偏移量，用于精准定位错误。
					 * 我们从括号开始的位置后寻找该参数。
					 */
					const parameterIndexInLine = currentLine.indexOf(parameter, titleEndIndex);
					const parameterPosition = {
						start: {
							line: startLine,
							column: parameterIndexInLine + 1,
							offset: startOffset + parameterIndexInLine,
						},
						end: {
							line: startLine,
							column: parameterIndexInLine + parameter.length + 1,
							offset: startOffset + parameterIndexInLine + parameter.length,
						},
					};

					if (key === 'layout') {
						if (value === 'left' || value === 'right') {
							imageNode.layout = value;
						} else {
							// 布局非法：记录错误，不应用属性
							errors.push({
								code: ParseErrorCode.INVALID_IMAGE_LAYOUT,
								position: parameterPosition,
							});
						}
					} else if (key === 'scale') {
						const scaleNumber = Number.parseFloat(value);
						if (Number.isNaN(scaleNumber)) {
							// 缩放非法：记录错误，不应用属性
							errors.push({
								code: ParseErrorCode.INVALID_IMAGE_SCALE,
								position: parameterPosition,
							});
						} else {
							/**
							 * 直接截断两位小数逻辑：
							 * 使用 Math.floor(n * 100) / 100 丢弃多余位
							 */
							imageNode.scale = Math.floor(scaleNumber * 100) / 100;
						}
					}
				}

				// 6. 将构建完成的图片节点推入结果集
				nodes.push(imageNode);
				next();
				continue;
			}
		}

		// ========== 引用块/强调信息 ==========
		if (currentLine.startsWith('>')) {
			const blockStartLine = line;
			const blockStartOffset = cursor;

			let probeCursor = cursor;
			let blockEndOffset = cursor;
			let lastLineLength = 0;
			let totalLines = 0;

			// 明确指定类型
			let alertType: BlockquoteNode['alertType'] = undefined;

			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				if (lineText.startsWith('>')) {
					// 仅在处理第一行时尝试匹配 Alert 标识
					if (totalLines === 0) {
						const alertMatch = lineText.match(/^>\s*\[(NOTE|TIP|WARNING|DANGER|IMPORTANT)\]\s*$/i);
						// 修正：先判断 match 是否存在，再访问索引
						if (alertMatch && alertMatch[1]) {
							alertType = alertMatch[1].toLowerCase() as BlockquoteNode['alertType'];
						}
					}

					totalLines++;
					lastLineLength = lineText.length;
					blockEndOffset = lineEnd;

					if (nextNl === -1) break;
					probeCursor = nextNl + 1;
				} else {
					break;
				}
			}

			// 构造节点
			const blockquoteNode: BlockquoteNode = {
				type: BlockNodeType.Blockquote,
				children: [],
				position: {
					start: { line: blockStartLine, column: 1, offset: blockStartOffset },
					end: {
						line: blockStartLine + totalLines - 1,
						column: lastLineLength + 1,
						offset: blockEndOffset,
					},
				},
			};

			// 只有有值时才写入属性，避开 exactOptionalPropertyTypes 限制
			if (alertType) {
				blockquoteNode.alertType = alertType;
			}

			nodes.push(blockquoteNode);

			const jumpTarget = blockEndOffset === content.length ? content.length : blockEndOffset + 1;
			next(totalLines, jumpTarget);
			continue;
		}

		// ========== 代码块 ==========
		if (currentLine.startsWith('```')) {
			const blockStartLine = line;
			const blockStartOffset = cursor;

			const infoString = currentLine.slice(3).trim();
			let language: string | undefined;
			let remark: string | undefined;

			if (infoString) {
				const parts = infoString.split(/\s+/);
				language = parts[0];
				if (parts.length > 1) {
					remark = parts.slice(1).join(' ');
				}
			}

			const contentLines: string[] = [];
			let foundClosing = false;
			let probeCursor = content.indexOf('\n', cursor);
			if (probeCursor === -1) probeCursor = content.length;
			else probeCursor += 1;

			let currentProbeLine = line + 1;

			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				if (lineText.trimEnd() === '```') {
					foundClosing = true;
					const blockEndOffset = lineEnd;

					// --- 修正部分：构造符合 exactOptionalPropertyTypes 的对象 ---
					const codeNode: CodeNode = {
						type: BlockNodeType.Code,
						value: contentLines.join('\n'),
						position: {
							start: { line: blockStartLine, column: 1, offset: blockStartOffset },
							end: { line: currentProbeLine, column: lineText.length + 1, offset: blockEndOffset },
						},
					};

					// 只有在有值的情况下才写入属性
					if (language) codeNode.language = language;
					if (remark) codeNode.remark = remark;

					nodes.push(codeNode);
					// -------------------------------------------------------

					const totalLinesHandled = currentProbeLine - blockStartLine + 1;
					const jumpTarget = nextNl === -1 ? content.length : nextNl + 1;
					next(totalLinesHandled, jumpTarget);
					break;
				}

				contentLines.push(lineText);
				probeCursor = nextNl === -1 ? content.length : nextNl + 1;
				currentProbeLine++;
			}

			// 未闭合的错误处理逻辑 (同理应用上面的 codeNode 构造方式)
			if (!foundClosing) {
				errors.push({
					code: ParseErrorCode.UNCLOSED_CODE_BLOCK,
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				});

				const codeNode: CodeNode = {
					type: BlockNodeType.Code,
					value: contentLines.join('\n'),
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: {
							line: currentProbeLine - 1,
							column: contentLines.at(-1)?.length || 1,
							offset: content.length,
						},
					},
				};
				if (language) codeNode.language = language;
				if (remark) codeNode.remark = remark;

				nodes.push(codeNode);
				next(currentProbeLine - blockStartLine, content.length);
			}
			continue;
		}

		// ========== 公式块 ==========
		if (currentLine.startsWith('$$')) {
			const blockStartLine = line;
			const blockStartOffset = cursor;

			const contentLines: string[] = [];
			let foundClosing = false;

			// 跳过起始行 $$，从下一行开始查找
			let probeCursor = content.indexOf('\n', cursor);
			if (probeCursor === -1) probeCursor = content.length;
			else probeCursor += 1;

			let currentProbeLine = line + 1;

			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				// 检查闭合标识符 $$
				// 注意：公式块的闭合符通常也单独占据一行
				if (lineText.trim() === '$$') {
					foundClosing = true;
					const blockEndOffset = lineEnd;

					nodes.push({
						type: BlockNodeType.Formula,
						value: contentLines.join('\n'),
						position: {
							start: { line: blockStartLine, column: 1, offset: blockStartOffset },
							end: { line: currentProbeLine, column: lineText.length + 1, offset: blockEndOffset },
						},
					});

					const totalLinesHandled = currentProbeLine - blockStartLine + 1;
					const jumpTarget = nextNl === -1 ? content.length : nextNl + 1;
					next(totalLinesHandled, jumpTarget);
					break;
				}

				contentLines.push(lineText);
				probeCursor = nextNl === -1 ? content.length : nextNl + 1;
				currentProbeLine++;
			}

			// 错误处理：未找到闭合的 $$
			if (!foundClosing) {
				errors.push({
					code: ParseErrorCode.UNCLOSED_FORMULA_BLOCK,
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				});

				// 兜底：将后续所有行作为公式内容
				nodes.push({
					type: BlockNodeType.Formula,
					value: contentLines.join('\n'),
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: {
							line: currentProbeLine - 1,
							column: contentLines.at(-1)?.length || 1,
							offset: content.length,
						},
					},
				});
				next(currentProbeLine - blockStartLine, content.length);
			}
			continue;
		}

		// ========== 宏 ==========
		if (currentLine.startsWith(':::')) {
			const blockStartLine = line;
			const blockStartOffset = cursor;

			// 1. 解析首行：提取名称和参数
			// 示例："::: tabs type=card" -> name: "tabs", args: "type=card"
			const infoString = currentLine.slice(3).trim();
			let name = '';
			let arguments_: string | undefined;

			if (infoString) {
				const firstSpaceIndex = infoString.search(/\s/);
				if (firstSpaceIndex === -1) {
					name = infoString; // 只有名称，如 "::: myMacro"
				} else {
					name = infoString.slice(0, firstSpaceIndex);
					// 提取空格后的内容，并去掉首尾多余空格
					const rawArguments = infoString.slice(firstSpaceIndex).trim();
					if (rawArguments) {
						arguments_ = rawArguments;
					}
				}
			}

			// 2. 收集宏内容
			const contentLines: string[] = [];
			let foundClosing = false;
			let probeCursor = content.indexOf('\n', cursor);
			if (probeCursor === -1) probeCursor = content.length;
			else probeCursor += 1;

			let currentProbeLine = line + 1;

			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				// 检查闭合标识符 :::
				if (lineText.trim() === ':::') {
					foundClosing = true;

					const macroNode: MacroNode = {
						type: BlockNodeType.Macro,
						name: name,
						value: contentLines.join('\n'),
						position: {
							start: { line: blockStartLine, column: 1, offset: blockStartOffset },
							end: { line: currentProbeLine, column: lineText.length + 1, offset: lineEnd },
						},
					};

					if (arguments_) macroNode.args = arguments_;

					nodes.push(macroNode);

					const jumpTarget = nextNl === -1 ? content.length : nextNl + 1;
					next(currentProbeLine - blockStartLine + 1, jumpTarget);
					break;
				}

				contentLines.push(lineText);
				probeCursor = nextNl === -1 ? content.length : nextNl + 1;
				currentProbeLine++;
			}

			// 3. 错误处理：未闭合
			if (!foundClosing) {
				errors.push({
					code: ParseErrorCode.UNCLOSED_MACRO_BLOCK,
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
					},
				});

				const macroNode: MacroNode = {
					type: BlockNodeType.Macro,
					name: name,
					value: contentLines.join('\n'),
					position: {
						start: { line: blockStartLine, column: 1, offset: blockStartOffset },
						end: {
							line: currentProbeLine - 1,
							column: contentLines.at(-1)?.length || 1,
							offset: content.length,
						},
					},
				};
				if (arguments_) macroNode.args = arguments_;

				nodes.push(macroNode);
				next(currentProbeLine - blockStartLine, content.length);
			}
			continue;
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
