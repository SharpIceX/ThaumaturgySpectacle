import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { BlockNodeType, type ImageNode } from '../../../types/node/block-node';

const image: ParseRule = (_originalContent, currentLineContent, line, offset, node, errors) => {
	// 确保是图片
	if (!currentLineContent.startsWith('![')) return;

	const titleEndIndex = currentLineContent.indexOf('](');
	const linkEndIndex = currentLineContent.lastIndexOf(')');
	const lineLength = currentLineContent.length;

	// 校验格式
	if (titleEndIndex === -1 || linkEndIndex <= titleEndIndex) return;

	const title = currentLineContent.slice(2, titleEndIndex);
	const rawContent = currentLineContent.slice(titleEndIndex + 2, linkEndIndex).trim();
	const parts = rawContent.split(/\s+/);
	const source = parts[0];

	// 如果括号内为空，则不计入 AST，作为段落（其实目前实现是跳过解析）
	if (!rawContent || !source) {
		errors.push({
			code: ParseErrorCode.MISSING_IMAGE_SOURCE,
			position: {
				start: { line, column: 1, offset },
				end: { line, column: lineLength + 1, offset: offset + lineLength },
			},
		});
		return;
	}

	const imageNode: ImageNode = {
		type: BlockNodeType.Image,
		title,
		src: source,
		position: {
			start: { line, column: 1, offset },
			end: { line, column: lineLength + 1, offset: offset + lineLength },
		},
	};

	// 处理后续可选参数
	const parameters = parts.slice(1);

	// 从 source 结束后的位置开始查找参数
	const sourceRelativeIndex = currentLineContent.slice(titleEndIndex + 2).indexOf(source);
	let searchOffsetInLine = titleEndIndex + 2 + sourceRelativeIndex + source.length;

	for (const parameter of parameters) {
		const [key, value = ''] = parameter.split('=');
		const parameterIndexInLine = currentLineContent.indexOf(parameter, searchOffsetInLine);
		const safeIndex = parameterIndexInLine === -1 ? searchOffsetInLine : parameterIndexInLine;

		const parameterPosition = {
			start: {
				line: line,
				column: safeIndex + 1,
				offset: offset + safeIndex,
			},
			end: {
				line: line,
				column: safeIndex + parameter.length + 1,
				offset: offset + safeIndex + parameter.length,
			},
		};

		// 更新搜索起点
		if (parameterIndexInLine !== -1) {
			searchOffsetInLine = parameterIndexInLine + parameter.length;
		}

		// 参数语义校验
		if (key === 'layout') {
			if (value === 'left' || value === 'right') {
				imageNode.layout = value;
			} else {
				errors.push({
					code: ParseErrorCode.INVALID_IMAGE_LAYOUT,
					position: parameterPosition,
				});
			}
		} else if (key === 'scale') {
			const scaleNumber = Number.parseFloat(value);
			if (Number.isNaN(scaleNumber) || scaleNumber <= 0) {
				errors.push({
					code: ParseErrorCode.INVALID_IMAGE_SCALE,
					position: parameterPosition,
				});
			} else {
				// 校验并处理小数位：直接截断两位以后的小数
				const dotIndex = value.indexOf('.');
				if (dotIndex !== -1 && value.length > dotIndex + 3) {
					// 超过两位小数
					errors.push({
						code: ParseErrorCode.IMAGE_SCALE_TOO_MANY_DECIMALS,
						position: parameterPosition,
					});
					// 直接截断两位小数后多余部分，而不是四舍五入
					imageNode.scale = Number.parseFloat(value.slice(0, dotIndex + 3));
				} else {
					imageNode.scale = scaleNumber;
				}
			}
		}
	}

	node.push(imageNode);
	return true;
};

export default image;
