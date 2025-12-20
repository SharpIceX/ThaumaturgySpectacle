import os from 'node:os';
import fs from 'node:fs/promises';
import Logger from '../../logger';
import path from 'node:path/posix';
import type { processorFunction } from '../main';
import contentRemove from '../../utils/content-remove';
import AsyncTaskQueue from '@ts/utils/src/async-task-queue';
import type { GetTaskType } from '@ts/utils/src/async-task-queue';

const Log = new Logger('Processor:InitMarkdownData');

const main: processorFunction = async (content) => {
	let index = 0;
	const RemoveFileList = new Set<string>();

	const getTask: GetTaskType = async () => {
		if (index >= content.length) return;
		const item = content[index++];

		return async () => {
			if (!item?.inputPath?.endsWith('.md')) return;

			const dirname = path.dirname(item.outputPath);
			const filename = path.basename(item.outputPath, path.extname(item.outputPath));
			item.outputPath = path.join(dirname, `${filename}.vue`);

			try {
				item.content = await fs.readFile(item.inputPath, 'utf8');
			} catch (error) {
				Log.error(`读取 ${item.inputPath} 文件失败，文件将不会进入处理队列：\n${error}`);
				RemoveFileList.add(item.inputPath);
			}
		};
	};

	const task = new AsyncTaskQueue(os.cpus().length, getTask);

	await task.runAll();

	// 移除无法读取的 Markdown 文件项
	contentRemove(content, RemoveFileList);
};

export default main;
