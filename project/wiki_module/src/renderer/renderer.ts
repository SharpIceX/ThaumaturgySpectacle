import Asciidoctor from 'asciidoctor';
import registerExtensions from './extension';

interface RenderedResult {
	html: string;
	metadata: {
		title: string;
	} & Record<string, unknown>;
}

const asciidoctor = Asciidoctor();
registerExtensions(asciidoctor);

/**
 * AsciiDoc 渲染器
 * @param AsciiDocumentText AsciiDoc 文本
 * @returns 渲染得到的数据
 */
const Renderer = async (AsciiDocumentText: string): Promise<RenderedResult> => {
	const document = asciidoctor.load(AsciiDocumentText, {
		safe: 'safe',
		backend: 'html5',
		attributes: {
			notitle: '', // 隐藏标题
			idprefix: '', // 生成的锚点开头不带`_`
			idseparator: '-', // 生成的锚点单词间用`-`连接
			stem: 'latexmath', // 启用数数学公式渲染
			'hardbreaks-option': '', // 将换行文本视为不同行。
		},
	});

	return {
		html: document.convert(),
		metadata: {
			title: document.getDocumentTitle(),
			...document.getAttributes(),
		},
	};
};

export default Renderer;
