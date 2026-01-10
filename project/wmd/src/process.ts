import { parse } from './parse';
import { frontMatterParse } from './utils/parse-frontmatter';
import { shiftNodePosition } from './utils/shift-node-position';
import { BlockNodeType, type RootNode } from './types/block-node';
import { findCarriageReturn } from './utils/find-carriage-return';

class CarriageReturnError extends Error {
	override name = 'CarriageReturnError';
}

/**
 * WMD 解析器
 * @param content - WMD 文件的原始字符串内容
 * @returns 解析生成的抽象语法树（AST）根节点
 * @throws {CarriageReturnError} 如果内容中包含回车符（`\r`），因为 WMD 格式规范要求仅使用 LF（`\n`）作为换行符
 * @throws {import('yaml').YAMLParseError} 当 Front Matter 中的 YAML 格式无效时抛出
 */
function process(content: string): RootNode {
	const endLines = content.split(/\r?\n/);
	const result: RootNode = {
		type: BlockNodeType.Root,
		position: {
			start: {
				line: 0,
				column: 0,
			},
			end: {
				line: endLines.length - 1,
				column: endLines.at(-1)?.length ?? 0,
				offset: content.length,
			},
		},
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

	const frontMatter = frontMatterParse(content);
	if (frontMatter) {
		if (Object.keys(frontMatter.metadata).length > 0) result.frontmatter = frontMatter;

		// 确定切割点
		const bodyStartOffset = frontMatter.position.end.offset ?? 0;
		const bodyStartLine = frontMatter.position.end.line;

		// 切割内容
		const bodyContent = content.slice(bodyStartOffset);

		// 切割后可能有空的情况
		if (bodyContent.trim()) {
			const children = parse(bodyContent);
			if (children) {
				// 修正子节点的位置信息
				result.children = children.map((node) => shiftNodePosition(node, bodyStartOffset, bodyStartLine));
			}
		}
	} else {
		const children = parse(content);
		if (children) result.children = children;
	}

	return result;
}

export { process };
