import { BlockNodeType } from '../types/node/block-node';
import { ParseErrorCode, type ParseError } from '../types/error';
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
		if (currentLine[0] === '#') {
			let level = 0;
			const length = currentLine.length;

			// 获取标题等级
			while (level < length && currentLine[level] === '#') {
				level++;
			}

			// 开始位置
			const startPos = { line: startLine, column: 1, offset: startOffset };

			// 校验级别
			if (level > 6) {
				errors.push({
					code: ParseErrorCode.INVALID_HEADING_LEVEL,
					position: {
						start: startPos,
						end: { line: startLine, column: level + 1, offset: startOffset + level },
					},
				});
				level = 6;
			}

			nodes.push({
				type: BlockNodeType.Heading,
				level: level as HeadingNode['level'],
				children: [],
				position: {
					start: startPos,
					end: { line: startLine, column: length + 1, offset: endOffset },
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
			const closingIndex = currentLine.indexOf(']');

			// 理论上这个 if 不会出现 false 情况
			if (closingIndex !== -1) {
				// 提取 label
				const label = currentLine.slice(2, closingIndex);

				if (label.length > 0) {
					nodes.push({
						type: BlockNodeType.FootnoteDefinition,
						label: label,
						backReferences: [],
						children: [],
						position: {
							start: {
								line: startLine,
								column: 1,
								offset: startOffset,
							},
							end: {
								line: startLine,
								column: currentLine.length + 1,
								offset: endOffset,
							},
						},
					});

					next();
					continue;
				}
			}
		}

		// ========== 图片 ==========
		if (currentLine.startsWith('![')) {
			const titleEndIndex = currentLine.indexOf('](');
			const linkEndIndex = currentLine.lastIndexOf(')');

			// 校验格式
			if (titleEndIndex !== -1 && linkEndIndex > titleEndIndex) {
				const title = currentLine.slice(2, titleEndIndex);

				// 提取括号内容并修剪两端空格
				const rawContent = currentLine.slice(titleEndIndex + 2, linkEndIndex).trim();

				// 拆开参数
				const parts = rawContent.split(/\s+/);

				// 第一个参数绝对是 URL
				const source = parts[0];

				// 如果括号内为空，则不计入 AST
				if (!rawContent || !source) {
					errors.push({
						code: ParseErrorCode.MISSING_IMAGE_SOURCE,
						position: {
							start: { line: startLine, column: 1, offset: startOffset },
							end: { line: startLine, column: currentLine.length + 1, offset: endOffset },
						},
					});
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

				// 处理后续可选参数
				const parameters = parts.slice(1);

				/**
				 * 动态搜索起点定位：
				 * 从 source 结束后的位置开始查找参数，彻底避免参数与 URL 冲突。
				 */
				const sourceRelativeIndex = currentLine.slice(titleEndIndex + 2).indexOf(source);
				let searchOffsetInLine = titleEndIndex + 2 + sourceRelativeIndex + source.length;

				for (const parameter of parameters) {
					const [key, value = ''] = parameter.split('=');

					const parameterIndexInLine = currentLine.indexOf(parameter, searchOffsetInLine);
					const safeIndex = parameterIndexInLine === -1 ? searchOffsetInLine : parameterIndexInLine;

					const parameterPosition = {
						start: {
							line: startLine,
							column: safeIndex + 1,
							offset: startOffset + safeIndex,
						},
						end: {
							line: startLine,
							column: safeIndex + parameter.length + 1,
							offset: startOffset + safeIndex + parameter.length,
						},
					};

					// 更新搜索起点
					if (parameterIndexInLine !== -1) {
						searchOffsetInLine = parameterIndexInLine + parameter.length;
					}

					// 参数语义校验
					if (key === 'layout') {
						if (value === 'left' || value === 'right') {
							imageNode.layout = value as 'left' | 'right';
						} else {
							errors.push({
								code: ParseErrorCode.INVALID_IMAGE_LAYOUT,
								position: parameterPosition,
							});
						}
					} else if (key === 'scale') {
						const scaleNumber = Number.parseFloat(value);
						// 校验：必须是正数且不能是 NaN
						if (Number.isNaN(scaleNumber) || scaleNumber <= 0) {
							errors.push({
								code: ParseErrorCode.INVALID_IMAGE_SCALE,
								position: parameterPosition,
							});
						} else {
							// 逻辑：直接截断两位小数
							imageNode.scale = Math.floor(scaleNumber * 100) / 100;
						}
					}
				}

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
			let alertType: BlockquoteNode['alertType'] = undefined;

			while (probeCursor < content.length) {
				const nextNl = content.indexOf('\n', probeCursor);
				const lineEnd = nextNl === -1 ? content.length : nextNl;
				const lineText = content.slice(probeCursor, lineEnd);

				// 只要是以 > 开头，就属于同一个引用块
				// 注意：这里可以根据需求决定是否允许 > 前有空格
				if (lineText.startsWith('>')) {
					// 仅在处理第一行时尝试匹配 Alert 标识
					if (totalLines === 0) {
						// 增加对 alertMatch 的防御性处理
						const alertMatch = lineText.match(/^>\s*\[(NOTE|TIP|WARNING|DANGER|IMPORTANT)\]\s*$/i);
						const capturedType = alertMatch?.[1]?.toLowerCase();

						if (capturedType) {
							alertType = capturedType as BlockquoteNode['alertType'];
						}
					}

					totalLines++;
					lastLineLength = lineText.length;
					blockEndOffset = lineEnd;

					if (nextNl === -1) break;
					probeCursor = nextNl + 1;
				} else {
					// 如果遇到空行或不以 > 开头的行，中断引用块
					break;
				}
			}

			const blockquoteNode: BlockquoteNode = {
				type: BlockNodeType.Blockquote,
				children: [], // 这里的 children 将在后续递归解析内容时填充
				position: {
					start: { line: blockStartLine, column: 1, offset: blockStartOffset },
					end: {
						line: blockStartLine + totalLines - 1,
						column: lastLineLength + 1,
						offset: blockEndOffset,
					},
				},
			};

			if (alertType) {
				blockquoteNode.alertType = alertType;
			}

			nodes.push(blockquoteNode);

			// 步进：totalLines 告诉外部跳过多少行，jumpTarget 告诉外部光标移动到哪
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
