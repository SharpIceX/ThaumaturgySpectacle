import { ParseErrorCode, type ParseError } from '../../types/error';
import { type InlineNode, InlineNodeType, type StrongNode } from '../../types/node/inline-node';

interface ResultType {
	ast: InlineNode[];
	error: ParseError[];
}

/**
 * 行内语法解析
 * @param content 待解析的文本片段
 * @param offset 需要增加的起始偏移量
 * @returns 解析结果
 */
function walk(content: string, offset: number): ResultType {
	const ast: InlineNode[] = [];
	const errors: ParseError[] = [];

	let pos = 0;

	/**
	 * 处理对称格式标记
	 * @param marker 对称标记字符串
	 * @param type 对应的节点类型
	 * @returns 是否成功匹配并处理了标记
	 */
	const handleSymmetry = (marker: string, type: InlineNodeType): boolean => {
		// 确保是对应标记
		if (!content.startsWith(marker, pos)) return false;

		// 寻找闭合标记
		const closeIndex = content.indexOf(marker, pos + marker.length);
		if (closeIndex === -1) return false;

		const innerContent = content.slice(pos + marker.length, closeIndex);
		const result = walk(innerContent, offset + pos + marker.length);

		errors.push(...result.error);

		ast.push({
			type: type,
			children: result.ast,
			start: offset + pos,
			end: offset + closeIndex + marker.length,
		} as StrongNode);

		pos = closeIndex + marker.length;

		return true;
	};

	while (pos < content.length) {
		const char = content[pos] as string;

		// ========== 加粗 ==========
		if (handleSymmetry('**', InlineNodeType.Strong)) continue;

		// ========== 斜体 ==========
		if (handleSymmetry('--', InlineNodeType.Italic)) continue;

		// ========== 删除线 ==========
		if (handleSymmetry('~~', InlineNodeType.Strikethrough)) continue;

		// ========== 下划线 ==========
		if (handleSymmetry('__', InlineNodeType.Underline)) continue;

		// ========== 插入文本 ==========
		if (handleSymmetry('++', InlineNodeType.Inserted)) continue;

		// ========== 高亮文本 ==========
		if (handleSymmetry('==', InlineNodeType.Highlight)) continue;

		// ========== 下标（删除线之后） ==========
		if (handleSymmetry('~', InlineNodeType.Subscript)) continue;

		// ========== 上标 ==========
		if (handleSymmetry('^', InlineNodeType.Superscript)) continue;

		// ========== 脚注引用 ==========
		/*
		if (content.startsWith('[^', pos)) {
			// 找到闭合标签
			const closeIndex = content.indexOf(']', pos + 2);
			if (closeIndex !== -1) {
				const label = content.slice(pos + 2, closeIndex);
				if (label.length > 0) {
					ast.push({
						type: InlineNodeType.FootnoteReference,
						label: label,
						refId: `ref-${label}-${offset + pos}`,
						start: offset + pos,
						end: offset + closeIndex + 1,
					});

					pos = closeIndex + 1;
					continue;
				}
			}
		}
		*/

		// ========== 纯文本（兜底） ==========
		const lastNode = ast.at(-1);
		if (lastNode?.type === InlineNodeType.Text) {
			// 如果上一个是文字则合并
			lastNode.end += 1;
			lastNode.value += char;
		} else {
			// 否则创建新的
			ast.push({
				type: InlineNodeType.Text,
				value: char,
				start: offset + pos,
				end: offset + pos + 1,
			});
		}
		pos++;
	}

	return { ast, error: errors };
}

export { walk };
