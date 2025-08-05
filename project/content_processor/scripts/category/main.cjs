'use strict';

const path = require('node:path/posix');

const ProcessorMap = {
	wiki: require('./processor/wiki.cjs'),
};

/**
 * @typedef {Object} CategoryDataType
 * @property {string} type - 分类类型
 * @property {import('../../types/category.d.ts').PagesDataType[]} data - 分类下的页面数据
 */

hexo.extend.generator.register(function (locals) {
	/** @type {import('../../types/category.d.ts').PagesDataType[]} */
	const pages = locals.pages.data;

	/** @type {CategoryDataType[]} */
	const categoryData = [];

	// 处理 wiki 分类页面
	const wikiCategory = {
		type: 'wiki',
		data: [],
	};

	// 生成分类数据
	pages.forEach(page => {
		const [topDir] = page.path.split(path.sep);
		if (topDir === 'wiki') {
			wikiCategory.data.push(page);
		} else {
			throw new Error(`未知分类: ${topDir}，请检查路径: ${page.path}`);
		}
	});
	categoryData.push(wikiCategory);

	return categoryData.flatMap(category => {
		/**
		 * @type {import("../../types/category.d.ts").ProcessorFunc}
		 */
		const processor = ProcessorMap[category.type];

		if (!processor) throw new Error(`未找到处理器，类型: ${type}，文件路径: ${data.path}`);

		return processor(category.data);
		//
	});
});
