import fs from 'node:fs';
import process, { type Node } from './src/main';

const content = fs.readFileSync('../content/pages/wiki/test/index.wmd', 'utf8');
const result = process(content);

const lineOffsets: number[] = [0];
let index = 0;

for (const char of content) {
	index += 1;
	if (char === '\n') {
		lineOffsets.push(index);
	}
}

let globalDelta: number | undefined;

const children = result.ast?.children;
const stack: Node[] = Array.isArray(children) ? [...children] : [];

while (stack.length > 0) {
	const node = stack.pop();

	if (!node) {
		continue;
	}

	if ('children' in node && Array.isArray(node.children)) {
		stack.push(...node.children);
	}

	const { start, end } = node.position;

	const startLineOffset = lineOffsets[start.line - 1];
	const endLineOffset = lineOffsets[end.line - 1];

	if (startLineOffset === undefined || endLineOffset === undefined) {
		console.error(`[错误] 节点 "${node.type}" 的行号 (${start.line}/${end.line}) 超出范围`);
		continue;
	}

	const currentStartDelta = start.offset - (startLineOffset + (start.column - 1));
	const currentEndDelta = end.offset - (endLineOffset + (end.column - 1));

	if (globalDelta === undefined) {
		globalDelta = currentStartDelta;
	}

	if (currentStartDelta !== globalDelta) {
		console.error(
			`[偏移不匹配] 类型: ${node.type}, 起始位置: ${start.line}:${start.column}, 预期偏差: ${globalDelta}, 实际偏差: ${currentStartDelta}`,
		);
	}

	if (currentEndDelta !== globalDelta) {
		console.error(
			`[偏移不匹配] 类型: ${node.type}, 结束位置: ${end.line}:${end.column}, 预期偏差: ${globalDelta}, 实际偏差: ${currentEndDelta}`,
		);
	}
}

console.log(`校验任务结束。全局偏差值: ${globalDelta ?? 0}`);
