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
				const rawLine = content.slice(node.start, node.end);

				// 计算前缀长度以及后面空格
				const prefixMatch = rawLine.match(/^#+ +/);
				const prefixLength = prefixMatch ? prefixMatch[0].length : 0;

				const currentLineContent = rawLine.slice(prefixLength);

				const result = walk(currentLineContent, node.start + prefixLength);
				errors.push(...result.error);
				node.children = result.ast;

				break;
			}

			// TODO: 其他类型处理
		}
	}
}

export { inlineParse };
