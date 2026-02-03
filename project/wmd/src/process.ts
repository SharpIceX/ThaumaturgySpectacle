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
			start: 1,
			end: content.length,
			children: [],
		},
		error: [],
	};

	// 检查是否有`\r`换行符
	const carriageReturns = findCarriageReturn(content);
	if (carriageReturns.length > 0) {
		const total = carriageReturns.length;
		const limit = 5;

		const locations = carriageReturns
			.slice(0, limit)
			.map(({ line, column }) => `[${line}:${column}]`)
			.join(', ');

		const suffix = total > limit ? ` ...等共 ${total} 处` : '';

		throw new CarriageReturnError(
			`格式错误：文档包含非法的回车符 (\\r)。请使用 LF (\\n) 换行。\n` + `位置：${locations}${suffix}`,
		);
	}

	// 处理文档内容
	const frontMatter = frontMatterParse(content);
	if (frontMatter) {
		result.ast.frontmatter = frontMatter;

		const bodyContent = content.slice(frontMatter.end);
		const parseResult = parse(bodyContent);

		result.error.push(...parseResult.error);

		// 修正偏移
		if (parseResult.ast) {
			for (const node of parseResult.ast) {
				shiftNodePosition(node, frontMatter.end);
			}
		}
		result.ast.children = parseResult.ast;
	} else {
		const parseResult = parse(content);

		result.error.push(...parseResult.error);

		if (parseResult.ast) result.ast.children = parseResult.ast;
	}

	return result;
}

export { process };
