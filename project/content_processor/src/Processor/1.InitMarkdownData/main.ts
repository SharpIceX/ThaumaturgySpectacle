import fs from 'node:fs/promises';
import Logger from '../../logger';
import path from 'node:path/posix';
import type { processorFunction } from '../main';
import contentRemove from '../../utils/content-remove';

const Log = new Logger('Processor:InitMarkdownData');

const main: processorFunction = async (content) => {
	const RemoveFileList = new Set<string>();

	await Promise.all(
		content.map(async (item) => {
			if (item.inputPath && item.inputPath.endsWith('.md')) {
				// 将 outputPath 的扩展名改为 .vue
				const dirname = path.dirname(item.outputPath);
				const filename = path.basename(item.outputPath, path.extname(item.outputPath));
				item.outputPath = path.join(dirname, `${filename}.vue`);

				// 读取 Markdown 内容
				try {
					item.content = await fs.readFile(item.inputPath, 'utf8');
				} catch (error) {
					Log.error(`读取 ${item.inputPath} 文件失败，文件将不会进入处理队列：\n${error}`);
					RemoveFileList.add(item.inputPath);
					return;
				}
			}
		}),
	);

	// 移除无法读取的 Markdown 文件项
	contentRemove(content, RemoveFileList);
};

export default main;
