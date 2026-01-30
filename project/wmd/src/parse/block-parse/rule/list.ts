import type { ParseRule } from '../main';
import { BlockNodeType, type ListNode, type ListItemNode } from '../../../types/node/block-node';

/** 内部使用的扁平化列表项接口 */
interface FlatListItem {
	marker: string;
	level: number;
	isOrdered: boolean;
	content: string;
	line: number;
	offset: number;
	rawLine: string;
}

/**
 * 严格匹配列表标识符：
 * 1. 必须以 - 或 . 开头
 * 2. 后面必须跟一个空格
 * 3. 之后才是内容
 * 修复：将 .* 替换为 [^\s\r\n].* 以避免正则回溯问题
 */
const LIST_LINE_RE = /^([-.]+)\s+(\S.*)$/;

/**
 * 辅助：创建 ListNode
 * @param ordered - 是否是有序列表
 * @param item - 列表项原始数据
 * @returns 返回初始化的 ListNode 对象
 */
const createListNode = (ordered: boolean, item: FlatListItem): ListNode => ({
	type: BlockNodeType.List,
	ordered,
	children: [],
	position: {
		start: { line: item.line, column: 1, offset: item.offset },
		end: { line: item.line, column: 1, offset: item.offset },
	},
});

/**
 * 辅助：创建 ListItemNode
 * @param item - 列表项原始数据
 * @returns 返回初始化的 ListItemNode 对象
 */
const createListItemNode = (item: FlatListItem): ListItemNode => ({
	type: BlockNodeType.ListItem,
	children: [],
	position: {
		start: { line: item.line, column: 1, offset: item.offset },
		end: { line: item.line, column: item.rawLine.length + 1, offset: item.offset + item.rawLine.length },
	},
});

const list: ParseRule = (originalContent, currentLineContent, line, offset, nodes) => {
	// 1. 探测：当前行是否是列表开头？
	const firstMatch = currentLineContent.match(LIST_LINE_RE);
	if (!firstMatch) return false;

	// --- 阶段一：词法分析 ---
	const allLines = originalContent.split('\n');
	const flatItems: FlatListItem[] = [];
	let temporaryOffset = offset;
	let index = line - 1;

	while (index < allLines.length) {
		const rawLine = allLines[index] ?? '';
		const match = rawLine.match(LIST_LINE_RE);

		if (!match) break;

		flatItems.push({
			marker: match[1] ?? '',
			level: (match[1] ?? '').length,
			isOrdered: (match[1] ?? '').includes('.'),
			content: match[2] ?? '',
			line: index + 1,
			offset: temporaryOffset,
			rawLine,
		});

		temporaryOffset += rawLine.length + 1;
		index++;
	}

	if (flatItems.length === 0) return false;

	// --- 阶段二：语法分析 ---
	const firstItem = flatItems[0];
	if (!firstItem) return false;

	const rootList = createListNode(firstItem.isOrdered, firstItem);

	const stack: { listNode: ListNode; level: number }[] = [{ listNode: rootList, level: firstItem.level }];

	for (const item of flatItems) {
		const itemNode = createListItemNode(item);

		// 1. 处理层级回溯
		while (stack.length > 1 && item.level < (stack.at(-1)?.level ?? 0)) {
			stack.pop();
		}

		let currentStack = stack.at(-1);
		if (!currentStack) break;

		// 2. 处理层级加深
		if (item.level > currentStack.level) {
			const parentItem = currentStack.listNode.children.at(-1) as ListItemNode | undefined;
			if (parentItem) {
				const newList = createListNode(item.isOrdered, item);
				parentItem.children.push(newList);

				currentStack = { listNode: newList, level: item.level };
				stack.push(currentStack);
			}
		}

		// 3. 将 Item 放入当前的 List 容器
		currentStack.listNode.children.push(itemNode);

		// 更新容器及所有父级的 End 位置
		for (const s of stack) {
			s.listNode.position.end = { ...itemNode.position.end };
		}
	}

	nodes.push(rootList);

	return { jumpLine: flatItems.length - 1 };
};

export default list;
