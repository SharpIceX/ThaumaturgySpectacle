import Logger from '../logger';
import { contentType } from '../content';

import initMarkdownData from './1.InitMarkdownData/main';
import InitMarkdownJson from './2.InitMarkdownJson/main';
import InitMarkdownTime from './3.InitMarkdownTime/main';
import RenderMarkdown from './4.RenderMarkdown/main';
import CreateRss from './5.CreateRss/main';
import JsdomProcessor from './6.JsdomProcessor/main';
import CreateAllPage from './7.CreateAllPage/main';
import CreateCategoryPage from './8.CreateCategoryPage/main';

export type processorFunction = (content: contentType[]) => Promise<void>;

const Log = new Logger('Processor');

/**
 * 运行处理器并记录时间
 * @param content 内容数组
 * @param processFunction 处理器函数
 * @param stepName 处理步骤名称
 */
async function runProcessor(content: contentType[], processFunction: processorFunction, stepName: string) {
	const start = Date.now();
	await processFunction(content);
	const duration = Date.now() - start;
	Log.info(`${stepName}处理完成，用时${duration}ms`);
}

const main = async (content: contentType[]) => {
	await runProcessor(content, initMarkdownData, 'Markdown 数据');
	await runProcessor(content, InitMarkdownJson, 'Markdown JSON 数据');
	await runProcessor(content, InitMarkdownTime, 'Markdown 时间数据');
	await runProcessor(content, RenderMarkdown, 'Markdown 渲染');
	await runProcessor(content, CreateRss, 'RSS 创建');
	await runProcessor(content, JsdomProcessor, 'JSDom');
	await runProcessor(content, CreateAllPage, '创建"特殊页面/所有页面"');
	await runProcessor(content, CreateCategoryPage, '创建分类页面');
};

export default main;
