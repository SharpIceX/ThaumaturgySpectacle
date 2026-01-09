import { Asciidoctor } from 'asciidoctor';
import Formula from './extensions/formula';
import TitleAnchor from './extensions/title-anchor';

/**
 * 注册扩展
 * @param asciidoctor Asciidoctor 实例
 */
const registerExtensions = (asciidoctor: Asciidoctor): void => {
	asciidoctor.Extensions.register(TitleAnchor);
	asciidoctor.Extensions.register(Formula);
};

export default registerExtensions;
