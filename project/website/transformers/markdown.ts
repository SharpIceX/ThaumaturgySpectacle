import fs from 'node:fs';
import path from 'node:path';
import { defineTransformer } from '@nuxt/content';

export default defineTransformer({
	name: 'Markdown',
	extensions: ['.md'],
	transform: content => {
		const mdPath = path.resolve(import.meta.dirname, '../../content/content', content.id); // 获取 Markdown 文件绝对路径。

		let fileName: string;

		{
			// 获取 Markdown 文件所在目录
			const dir = path.dirname(mdPath);

			// 获取 Markdown 文件名（不带扩展名）
			const name = path.basename(mdPath, path.extname(mdPath));

			// 拼接得到 JSON 绝对路径
			fileName = path.join(dir, `${name}.json`);
		}

		if (!fs.existsSync(fileName)) throw new Error(`无法找到来自 ${mdPath} 的对应 JSON 文件：${fileName}`);

		const jsonContent = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

		// 移除部分 JsonContent 中的字段
		if ('$schema' in jsonContent) delete jsonContent['$schema'];

		return {
			...content,
			data: jsonContent,
		};
	},
});
