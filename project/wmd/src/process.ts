import { parse } from './parse/main';
import type { ParseError } from './types/error';
import { frontMatterParse } from './utils/parse-frontmatter';
import { shiftNodePosition } from './utils/shift-node-position';
import { findCarriageReturn } from './utils/find-carriage-return';
import { preNodeType, type RootNode } from './types/node/pre-node';

class CarriageReturnError extends Error {
	override name = 'CarriageReturnError';
}

interface ResultType {
	ast: RootNode;
	error: ParseError[];
}

/**
 * Wiki Markdown 解析器
 * @param content - WMD 文件的原始字符串内容
 * @returns 解析生成的抽象语法树（AST）根节点
 * @throws {CarriageReturnError} 如果内容中包含回车符（`\r`），因为 WMD 格式规范要求仅使用 LF（`\n`）作为换行符
 * @throws {import('yaml').YAMLParseError} 当 Front Matter 中的 YAML 格式无效时抛出
 */
function process(content: string): ResultType {
	const result: ResultType = {
		ast: {
			type: preNodeType.Root,
			position: {
				start: { line: 1, column: 1, offset: 0 },
				end: { line: 1, column: 1, offset: content.length },
			},
			children: [],
		},
		error: [],
	};

	// 检查是否有`\r`换行符
	const carriageReturns = findCarriageReturn(content);
	if (carriageReturns.length > 0) {
		const count = carriageReturns.length;
		const detail = carriageReturns
			.slice(0, 5)
			.map((p) => `L${p.line}:C${p.column}`)
			.join(', ');
		throw new CarriageReturnError(
			`格式错误: 检测到 ${count} 处非法的回车符 (\\r)。\n位置提示: ${detail}${count > 5 ? '...' : ''}`,
		);
	}

	// 计算结束位置
	let currentLine = 1;
	let lastLineStart = 0;
	for (let index = 0; index < content.length; index++) {
		if (content.codePointAt(index) === 10) {
			currentLine++;
			lastLineStart = index + 1;
		}
	}
	result.ast.position.end.line = currentLine;
	result.ast.position.end.column = content.length - lastLineStart + 1;

	const frontMatter = frontMatterParse(content);
	if (frontMatter) {
		if (Object.keys(frontMatter.metadata).length > 0) result.ast.frontmatter = frontMatter;

		// 确定切割点
		const bodyStartOffset = frontMatter.position.end.offset ?? 0;
		const bodyStartLine = frontMatter.position.end.line;

		// 切割内容
		const bodyContent = content.slice(bodyStartOffset);

		// 切割后可能有空的情况
		if (bodyContent.trim()) {
			const parseResult = parse(bodyContent);
			result.error.push(...parseResult.error);
			if (parseResult.ast) {
				// 修正子节点的位置信息
				result.ast.children = parseResult.ast.map((node) =>
					shiftNodePosition(node, bodyStartOffset, bodyStartLine - 1),
				);
			}
		}
	} else {
		const parseResult = parse(content);
		result.error.push(...parseResult.error);

		if (parseResult.ast) result.ast.children = parseResult.ast;
	}

	return result;
}

export { process };
