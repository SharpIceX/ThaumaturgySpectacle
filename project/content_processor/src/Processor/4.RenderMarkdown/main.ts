import yaml from 'yaml';
import os from 'node:os';
import Logger from '../../logger';
import type { processorFunction } from '../main';
import contentRemove from '../../utils/content-remove';
import AsyncTaskQueue from '@ts/utils/src/async-task-queue';
import { Renderer } from '@ts-dotnet-packages/markdown-render';
import type { GetTaskType } from '@ts/utils/src/async-task-queue';

const Log = new Logger('Processor:RenderMarkdown');

const main: processorFunction = async (content) => {
	let index = 0;
	const RemoveFileList = new Set<string>();

	const getTask: GetTaskType = async () => {
		if (index >= content.length) return;
		const item = content[index++];

		return async () => {
			if (!(item?.inputPath && item.outputPath.endsWith('.vue') && item.content)) return;

			// 渲染 Markdown 内容
			const renderResult = Renderer.Render(item.content, true);

			if (!renderResult.frontMatter) {
				Log.error(`文件 ${item.inputPath} 没有 Front Matter，将跳过渲染！`);
				RemoveFileList.add(item.inputPath);
				return;
			}

			// 解析并存储 Front Matter
			const frontMatter = yaml.parse(renderResult.frontMatter) || {};
			item.metadata = {
				...item.metadata,
				frontMatter: {
					type: 'wiki', // 默认为 wiki，如果 markdown 有定义则会被下面的覆盖
					...frontMatter,
				},
			};

			if (!item.metadata.frontMatter?.title) {
				Log.error(`文件 ${item.inputPath} 的 Front Matter 中缺少 title 字段，将跳过渲染！`);
				RemoveFileList.add(item.inputPath);
				return;
			}

			// 写入渲染后的内容
			item.content = renderResult.html;
		};
	};

	const task = new AsyncTaskQueue(os.cpus().length, getTask);

	await task.runAll();

	// 移除无法渲染的文件项
	contentRemove(content, RemoveFileList);
};

export default main;
