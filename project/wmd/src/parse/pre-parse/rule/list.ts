import type { ParseRule } from '../main';
import { preNodeType, type ListNode, type ListItemNode } from '../../../types/node/pre-node';

/** 内部使用的扁平化列表项接口 */
interface FlatListItem {
	marker: string;
	level: number;
	isOrdered: boolean;
	content: string;
	start: number;
	end: number;
	rawLine: string;
}

const LIST_LINE_RE = /^([-.]+)\s+(\S.*)$/;

/**
 * 辅助：创建 ListNode
 */
const createListNode = (ordered: boolean, item: FlatListItem): ListNode => ({
	type: preNodeType.List,
	ordered,
	children: [],
	start: item.start,
	end: item.end,
});

/**
 * 辅助：创建 ListItemNode
 */
const createListItemNode = (item: FlatListItem): ListItemNode => ({
	type: preNodeType.ListItem,
	children: [],
	start: item.start,
	end: item.end,
});

const list: ParseRule = (originalContent, currentLineContent, offset, nodes) => {
	// 确保当前行是否是列表开头
	const firstMatch = currentLineContent.match(LIST_LINE_RE);
	if (!firstMatch) return;

	// --- 阶段一：词法分析 ---
	// 从当前 offset 开始切割，避免 split 全文带来的性能开销
	const remainingLines = originalContent.slice(offset).split('\n');
	const flatItems: FlatListItem[] = [];
	let temporaryOffset = offset;

	for (const rawLine of remainingLines) {
		const match = rawLine.match(LIST_LINE_RE);
		if (!match) break;

		flatItems.push({
			marker: match[1] ?? '',
			level: (match[1] ?? '').length,
			isOrdered: (match[1] ?? '').includes('.'),
			content: match[2] ?? '',
			start: temporaryOffset,
			end: temporaryOffset + rawLine.length,
			rawLine,
		});

		// 推进 offset：行长 + \n
		temporaryOffset += rawLine.length + 1;
	}

	if (flatItems.length === 0) return;

	// --- 阶段二：语法分析 ---
	const firstItem = flatItems[0]!;
	const rootList = createListNode(firstItem.isOrdered, firstItem);

	// 维持你原有的 stack 逻辑
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
			s.listNode.end = itemNode.end;
		}
	}

	nodes.push(rootList);

	// 适配新的返回值：返回处理完列表后的新 Offset
	return temporaryOffset;
};

export default list;
