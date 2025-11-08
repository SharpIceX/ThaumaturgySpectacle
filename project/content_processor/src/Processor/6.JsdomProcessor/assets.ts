import path from 'node:path/posix';
import Logger from '../../logger';
import type { contentType } from '../../content';

const Log = new Logger('Processor:JsdomProcessor:Assets');

const main = (document: Document, data: contentType, content: contentType[]) => {
	const body = document.body;

	// 没有 data.inputPath 则跳过
	if (!data.inputPath) return;

	// 获取所有<img>标签
	const imgElements = [...body.querySelectorAll('img')];

	// 没有图片则跳过
	if (imgElements.length === 0) {
		return;
	}

	for (const img of imgElements) {
		// 获取 src 属性
		const source = img.getAttribute('src');
		// source 不存在 或 开头不是`.` 则跳过
		if (!source || !source.startsWith('.')) continue;

		// 解析路径
		const dirname = path.dirname(data.inputPath);
		const assetsPath = path.normalize(path.join(dirname, source));

		// 从 content 中查找对应的文件项，并加入 forceCopyToPages 标记
		const assetItem = content.find((item) => item.inputPath === assetsPath);
		if (assetItem) {
			assetItem.forceCopyToPages = true;
		} else {
			Log.error(
				`在 ${data.inputPath} 中发现孤立的图片资源，未在内容列表中找到对应的文件：${assetsPath}，原始路径：${source}`,
			);
		}
	}
};

export default main;
