/**
 * 禁用 eslint 规则 `unicorn/prefer-top-level-await`备注：
 * 该文件是 NodeJS 程序主入口点，直接写顶层 await 会导致程序无法运行。
 */
/* eslint-disable unicorn/prefer-top-level-await */

import { glob } from 'glob';
import path from 'node:path';
import Logger from './logger';
import { contentType } from './content';
import Processor from './Processor/main.js';

/**项目根目录 */
export const projectPath = path.resolve(import.meta.dirname, '../../../');

/** 内容目录 */
export const contentPath = path.join(projectPath, '/project/content/content');

/** 输出目录 */
const outputPath = path.resolve(import.meta.dirname, '../dist');

/** 所有数据 */
const content: contentType[] = [];

const Log = new Logger('Main');

(async () => {
	// 获取内容目录下所有文件
	const contentFilesList = await glob('**/*', {
		cwd: contentPath,
		dot: true,
		nodir: true,
		absolute: true,
		ignore: ['**/_*/**', '**/_*'], // 忽略所有以 _ 开头的文件和目录，因为它们是草稿。
	});
	Log.info(`在内容目录中找到 ${contentFilesList.length} 个文件`);

	// 写入初始数据
	content.push(
		...contentFilesList.map(filePath => {
			return {
				inputPath: filePath,
				outputPath: path.relative(contentPath, filePath),
			};
		}),
	);
	Log.info(`初始内容数据准备完毕`);

	// 处理内容
	await Processor(content);
	Log.info('处理器处理完毕');

	// TODO: 后续写盘操作
	console.log(content);
})();
