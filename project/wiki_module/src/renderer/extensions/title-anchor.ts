import { Extensions, Document } from 'asciidoctor';

/**
 * 处理器
 * @param document 文档
 */
function anchorProcessor(this: Extensions.TreeProcessor, document: Document): void {
	const sections = document.findBy({ context: 'section' });

	for (const section of sections) {
		const id = section.getId();
		if (id) {
			section.setId(encodeURIComponent(id.trim().toLowerCase()));
		}
	}
}

/**
 * 标题锚点处理
 */
function TitleAnchor(this: Extensions.Registry): void {
	this.treeProcessor(function (this: Extensions.TreeProcessorDsl) {
		this.process(anchorProcessor);
	});
}

export default TitleAnchor;
