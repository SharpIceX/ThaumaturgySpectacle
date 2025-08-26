import Logger from '../logger';
import { contentType } from '../content';

import initMarkdownData from './1.InitMarkdownData/main';
import InitMarkdownJson from './2.InitMarkdownJson/main';
import InitMarkdownTime from './3.InitMarkdownTime/main';
import RenderMarkdown from './4.RenderMarkdown/main';
import JsdomProcessor from './5.JsdomProcessor/main';

export type processorFunction = (content: contentType[]) => Promise<void>;

const Log = new Logger('Processor');

const main = async (content: contentType[]) => {
	// 1. 首先初始化 Markdown 内容
	await initMarkdownData(content);
	Log.info('Markdown 数据处理完成');

	// 2. 处理 Markdown JSON 数据
	await InitMarkdownJson(content);
	Log.info('Markdown JSON 数据处理完成');

	// 3. 初始化 Markdown 时间数据
	await InitMarkdownTime(content);
	Log.info('Markdown 时间数据处理完成');

	// 4. 渲染 Markdown 内容和生成 Front Matter
	await RenderMarkdown(content);
	Log.info('Markdown 渲染完成');

	// 5. JSDom 处理
	await JsdomProcessor(content);
	Log.info('JSDom 处理完成');
};

export default main;
