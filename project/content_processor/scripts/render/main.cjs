'use strict';

const path = require('node:path');

const ProcessorMap = {
	wiki: require('./processor/wiki.cjs'),
};

hexo.extend.renderer.register(
	'md',
	'vue',
	(data, _options) => {
		// 内容完整路径
		const contentPath = path.resolve(hexo.base_dir, hexo.config.source_dir);

		// 文件相对路径
		const relativePath = path.relative(contentPath, data.path);

		// 顶层目录
		const [type] = relativePath.split(path.sep);

		/**
		 * @type {import('../../types/render.d.ts').ProcessorFunc}
		 */
		const processor = ProcessorMap[type];

		if (!processor) throw new Error(`未找到处理器，类型: ${type}，文件路径: ${data.path}`);

		// 调用对应处理器，返回渲染结果
		return processor(hexo, data);
	},
	true,
);
