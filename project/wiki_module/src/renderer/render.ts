import { Interface as Asciidoctor, AbstractNode, Converter } from '@asciidoctor/core';
import adocFactory from '@asciidoctor/core';

const asciidoctor: Asciidoctor = adocFactory();

class CustomConverter implements Converter {
	baseConverter: any;

	constructor() {
		this.baseConverter = (asciidoctor as any).Html5Converter.$new();
	}

	convert(node: AbstractNode, transform?: string): string {
		const context = node.getContext();

		if (context === 'anchor') {
			const text = node.getText();
			const attrs = node.getAttributes();

			// 关键：不要判断 type。直接通过 node 接口获取目标地址
			// getTarget() 适用于 link: 宏，getAttribute('refid') 适用于 << >> 锚点
			let to = node.getAttribute('target') || attrs.refid || attrs.path || '';

			// 如果是内部锚点跳转（不含协议头且不以 / 或 . 开始），补上 #
			const isExternal = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to);
			if (!isExternal && to && !to.startsWith('/') && !to.startsWith('.') && !to.startsWith('#')) {
				to = `#${to}`;
			}

			if (to) {
				const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';

				// 强制所有 anchor 都输出为 <nuxt-link>
				return `<nuxt-link to="${to}"${targetAttr}>${text}</nuxt-link>`;
			}
		}

		// 其他节点（段落、列表容器等）保持默认
		return this.baseConverter.convert(node, transform);
	}
}

export default CustomConverter;
