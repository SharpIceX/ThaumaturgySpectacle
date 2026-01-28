import fs from 'node:fs';
import process, { type Node } from './src/main';
import prettier, { type Options } from 'prettier';
import prettierConfig from '../../.prettierrc.json';

const content = fs.readFileSync('../content/pages/wiki/test/index.wmd', 'utf8');
const result = process(content);

type NodeWithRaw = Node & { raw: string };

const attachRaw = (nodes: Node[], source: string) => {
	for (const node of nodes) {
		const n = node as NodeWithRaw;
		n.raw = source.slice(n.position.start.offset, n.position.end.offset);

		if ('children' in n && Array.isArray(n.children) && n.children.length > 0) {
			attachRaw(n.children, source);
		}
	}
};

if (result.ast.children) {
	attachRaw(result.ast.children, content);
}

const json = JSON.stringify(result, undefined, 4);

const formatted = await prettier.format(json, {
	parser: 'json',
	...(prettierConfig as Options),
});

fs.writeFileSync('./test.json', formatted);

console.log(`顶级块节点共计: ${result.ast.children?.length ?? 0} 个`);
