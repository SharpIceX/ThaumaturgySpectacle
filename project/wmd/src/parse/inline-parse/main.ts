import { walk } from './walk';
import type { ParseError } from '../../types/error';
import { type preNode, preNodeType } from '../../types/node/pre-node';

/**
 * Wiki Markdown 行内解析
 * @param content Wiki Markdown 内容
 * @param preNodes 预处理的节点
 * @param errors 存储错误的节点
 */
function inlineParse(content: string, preNodes: preNode[], errors: ParseError[]): void {
	for (const node of preNodes) {
		switch (node.type) {
			case preNodeType.Heading: {
				const rawLine = content.slice(node.position.start.offset, node.position.end.offset);

				// 处理包括`#`h和空格在内长度
				const prefixMatch = rawLine.match(/^#+ +/);
				const prefixLength = prefixMatch ? prefixMatch[0].length : node.level;
				const currentLineContent = rawLine.slice(prefixLength);

				const result = walk(currentLineContent, {
					line: node.position.start.line,
					column: node.position.start.column + prefixLength,
					offset: node.position.start.offset + prefixLength,
				});

				errors.push(...result.error);
				node.children = result.ast;
				break;
			}

			// TODO: 其他处理
		}
	}
}

export { inlineParse };
