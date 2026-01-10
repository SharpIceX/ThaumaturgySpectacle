import type { Node } from './types/main';
import type { BlockNode } from './types/block-node';

/**
 * WMD 块解析
 * @param content WMD 内容
 * @returns 解析结果
 */
function blockParse(content: string): BlockNode[] {
	//
}

/**
 * WMD内联解析
 * @param content WMD 内容
 * @returns 解析结果
 */
function inlineParse(node: BlockNode[]): Node[] {
	//
}

/**
 * WMD 解析器
 * @param content WMD 内容
 * @returns 解析结果
 */
function parse(content: string): Node[] {
	return inlineParse(blockParse(content));
}

export { parse };
