import fs from 'node:fs/promises';
import Logger from '../../logger';
import type { processorFunction } from '../main';

const Log = new Logger('Processor:InitMarkdownData');

const main: processorFunction = async content => {
	const RemoveFileList = new Set<string>();

	await Promise.all(
		content.map(async item => {
			if (item.inputPath && item.inputPath.endsWith('.md')) {
				// 读取 Markdown 内容
				try {
					item.content = await fs.readFile(item.inputPath, 'utf8');
				} catch (error) {
					Log.error(`读取 ${item.inputPath} 文件失败，文件将不会被渲染：\n${error}`);
					RemoveFileList.add(item.inputPath);
					return;
				}
			}
		}),
	);

	// 移除无法读取的 Markdown 文件项
	if (RemoveFileList.size > 0) {
		content = content.filter(item => item.inputPath && !RemoveFileList.has(item.inputPath));
	}
};

export default main;
