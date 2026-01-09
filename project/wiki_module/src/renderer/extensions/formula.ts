import katex from 'katex';
import { Extensions, Document, Block, AbstractBlock } from 'asciidoctor';

/**
 * 处理器
 * @param document 文档
 */
function formulaProcessor(this: Extensions.TreeProcessor, document: Document): void {
	const stemNodes = document.findBy({ context: 'stem' });

	for (const node of stemNodes) {
		const block = node as Block;
		const formula = block.getSource();

		// 渲染公式
		const mathML = katex.renderToString(formula, {
			output: 'mathml',
			throwOnError: false,
		});

		// 作为新节点覆盖
		const parent = node.getParent() as AbstractBlock;
		const passBlock = this.createBlock(parent, 'pass', mathML, node.getAttributes(), { subs: [] }); // ? 迷惑，不知道为什么值传递`node`也可以
		const blocks = parent.getBlocks(); // ? 迷惑，不知道为什么非得要`node.getParent()`
		const index = blocks.indexOf(block);

		if (index !== -1) {
			blocks[index] = passBlock;
		}
	}
}

/**
 * 公式处理
 */
function Formula(this: Extensions.Registry): void {
	this.treeProcessor(function (this: Extensions.TreeProcessorDsl) {
		this.process(formulaProcessor);
	});
}

export default Formula;
