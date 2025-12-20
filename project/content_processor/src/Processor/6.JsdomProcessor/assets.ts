import Logger from '../../logger';
import path from 'node:path/posix';
import { contentPath } from '../../main';
import type { contentType } from '../../content';

const Log = new Logger('Processor:JsdomProcessor:Assets');

const main = (document: Document, data: contentType, content: contentType[]) => {
	const body = document.body;

	// 没有 data.inputPath 则跳过
	if (!data.inputPath) return;

	// 获取所有<img>标签
	const imgElements = [...body.querySelectorAll('img')];

	// 没有图片则跳过
	if (imgElements.length === 0) return;

	for (const img of imgElements) {
		const source = img.getAttribute('src');

		// source不存在或不是能处理的路径则跳过
		if (
			!source ||
			source.startsWith('/') ||
			source.startsWith('http://') ||
			source.startsWith('https://') ||
			source.startsWith('//')
		) {
			continue;
		}

		// 解析路径
		const dirname = path.dirname(data.inputPath);
		const resolvedPath = path.resolve(contentPath, dirname, source);

		// 跳过逃逸项目根的路径
		if (!resolvedPath.startsWith(contentPath + '/')) {
			Log.warn(`跳过非法路径（逃逸项目根）：${source} in ${data.inputPath}`);
			continue;
		}

		// 在内容列表中查找对应的资源文件
		const assetItem = content.find((item) => item.inputPath === resolvedPath);
		if (assetItem) {
			assetItem.forceCopyToPages = true;
		} else {
			Log.error(
				`在 ${data.inputPath} 中发现孤立的图片资源，未在内容列表中找到对应的文件：${resolvedPath}，原始路径：${source}`,
			);
		}
	}
};

export default main;
