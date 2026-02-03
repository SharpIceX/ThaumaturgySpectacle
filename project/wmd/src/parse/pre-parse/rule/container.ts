import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType, type CodeNode, type MacroNode, type FormulaNode } from '../../../types/node/pre-node';

/** 允许的 container */
const FENCE_MAP = {
	'```': { type: preNodeType.Code, error: ParseErrorCode.UNCLOSED_CODE_BLOCK },
	$$: { type: preNodeType.Formula, error: ParseErrorCode.UNCLOSED_FORMULA_BLOCK },
	':::': { type: preNodeType.Macro, error: ParseErrorCode.UNCLOSED_MACRO_BLOCK },
} as const;

const container: ParseRule = (originalContent, currentLineContent, offset, node, errors) => {
	// 确保是支持的 container
	const prefix = (['```', '$$', ':::'] as const).find((p) => currentLineContent.startsWith(p));
	if (!prefix) return;

	const { type, error: errorCode } = FENCE_MAP[prefix];
	const blockStartOffset = offset;

	// 解析元数据
	const infoString = currentLineContent.slice(prefix.length).trim();
	let language: string | undefined;
	let remark: string | undefined;
	let name: string | undefined;
	let arguments_: string | undefined;

	if (type === preNodeType.Code && infoString.length > 0) {
		const [lang, ...remarks] = infoString.split(/\s+/);
		language = lang;
		if (remarks.length > 0) {
			remark = remarks.join(' ');
		}
	} else if (type === preNodeType.Macro && infoString.length > 0) {
		const firstSpace = infoString.search(/\s/);
		if (firstSpace === -1) {
			name = infoString;
		} else {
			name = infoString.slice(0, firstSpace);
			arguments_ = infoString.slice(firstSpace).trim();
		}
	}

	// 扫描内容
	const contentLines: string[] = [];
	let probeCursor = originalContent.indexOf('\n', offset);
	probeCursor = probeCursor === -1 ? originalContent.length : probeCursor + 1;

	while (probeCursor < originalContent.length) {
		const nextNewline = originalContent.indexOf('\n', probeCursor);
		const lineEnd = nextNewline === -1 ? originalContent.length : nextNewline;
		const lineText = originalContent.slice(probeCursor, lineEnd);

		// 检查闭合标记
		if (lineText.trimEnd() === prefix) {
			const nextLineOffset = nextNewline === -1 ? originalContent.length : nextNewline + 1;
			const commonProperties = {
				value: contentLines.join('\n'),
				start: blockStartOffset,
				end: lineEnd,
			};

			if (type === preNodeType.Code) {
				node.push({ type: preNodeType.Code, language, remark, ...commonProperties } as CodeNode);
			} else if (type === preNodeType.Macro) {
				node.push({
					type: preNodeType.Macro,
					name: name || '',
					args: arguments_,
					...commonProperties,
				} as MacroNode);
			} else {
				node.push({ type: preNodeType.Formula, ...commonProperties } as FormulaNode);
			}

			// 返回闭合标记下一行的起始偏移量
			return nextLineOffset;
		}

		contentLines.push(lineText);
		probeCursor = nextNewline === -1 ? originalContent.length : nextNewline + 1;
	}

	// 未闭合错误处理
	errors.push({
		code: errorCode,
		start: blockStartOffset,
		end: offset + currentLineContent.length,
	});

	const commonPropertiesFallback = {
		value: contentLines.join('\n'),
		start: blockStartOffset,
		end: originalContent.length,
	};

	if (type === preNodeType.Code) {
		node.push({ type: preNodeType.Code, language, remark, ...commonPropertiesFallback } as CodeNode);
	} else if (type === preNodeType.Macro) {
		node.push({
			type: preNodeType.Macro,
			name: name || '',
			args: arguments_,
			...commonPropertiesFallback,
		} as MacroNode);
	} else {
		node.push({ type: preNodeType.Formula, ...commonPropertiesFallback } as FormulaNode);
	}

	// 已经扫描到文件末尾，直接返回最大长度
	return originalContent.length;
};

export default container;
