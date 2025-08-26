import jsdom from 'jsdom';
import urlProcessor from './url';
import Logger from '../../logger';
import { contentType } from '../../content';
import markdownJson from './markdown-json/main';
import type { processorFunction } from '../main';

export type subProcessorFunction = (document: Document, item: contentType) => void;

const Log = new Logger('Processor:RenderMarkdown');

const main: processorFunction = async content => {
	await Promise.all(
		content.map(async item => {
			if (item.inputPath && item.inputPath.endsWith('.md')) {
				// 初始化 JSDOM
				const dom = new jsdom.JSDOM(item.content);
				const document = dom.window.document;

				// 处理 URL
				urlProcessor(document, item);

				// 生成 Toc
				// item.metadata.toc

				// Markdown JSON 处理
				markdownJson(document, item);

				// 返回处理后的内容
				item.content = document.body.innerHTML;
			}
		}),
	);
};

export default main;
