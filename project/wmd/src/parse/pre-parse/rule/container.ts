import type { ParseRule } from '../main';
import { ParseErrorCode } from '../../../types/error';
import { preNodeType, type CodeNode, type MacroNode, type FormulaNode } from '../../../types/node/pre-node';

/** 允许的 container */
const FENCE_MAP = {
	'```': { type: preNodeType.Code, error: ParseErrorCode.UNCLOSED_CODE_BLOCK },
	$$: { type: preNodeType.Formula, error: ParseErrorCode.UNCLOSED_FORMULA_BLOCK },
	':::': { type: preNodeType.Macro, error: ParseErrorCode.UNCLOSED_MACRO_BLOCK },
} as const;

const container: ParseRule = (originalContent, currentLineContent, line, offset, node, errors) => {
	// 确保是支持的 container
	const prefix = (['```', '$$', ':::'] as const).find((p) => currentLineContent.startsWith(p));
	if (!prefix) return;

	const { type, error: errorCode } = FENCE_MAP[prefix];
	const blockStartLine = line;
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

	let currentProbeLine = line + 1;

	while (probeCursor < originalContent.length) {
		const nextNewline = originalContent.indexOf('\n', probeCursor);
		const lineEnd = nextNewline === -1 ? originalContent.length : nextNewline;
		const lineText = originalContent.slice(probeCursor, lineEnd);

		if (lineText.trimEnd() === prefix) {
			const commonProperties = {
				value: contentLines.join('\n'),
				position: {
					start: { line: blockStartLine, column: 1, offset: blockStartOffset },
					end: { line: currentProbeLine, column: lineText.length + 1, offset: lineEnd },
				},
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

			return { jumpLine: currentProbeLine - blockStartLine };
		}

		contentLines.push(lineText);
		probeCursor = nextNewline === -1 ? originalContent.length : nextNewline + 1;
		currentProbeLine++;
	}

	// 未闭合错误
	errors.push({
		code: errorCode,
		position: {
			start: { line: blockStartLine, column: 1, offset: blockStartOffset },
			end: {
				line: blockStartLine,
				column: currentLineContent.length + 1,
				offset: offset + currentLineContent.length,
			},
		},
	});

	const commonPropertiesFallback = {
		value: contentLines.join('\n'),
		position: {
			start: { line: blockStartLine, column: 1, offset: blockStartOffset },
			end: {
				line: currentProbeLine - 1,
				column: contentLines.at(-1)?.length || 1,
				offset: originalContent.length,
			},
		},
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

	return { jumpLine: currentProbeLine - blockStartLine - 1 };
};

export default container;
