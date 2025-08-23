'use strict';

const toListItem = require('../utils/to-list-item.cjs');
const generateListPage = require('../utils/generate-list-page.cjs');

/**
 * 提取页面所属分类为数组
 * @param {import("../types/common.cjs").PagesDataType} page - 页面数据
 * @returns {string[]} - 返回分类数组
 */
function extractCategories(page) {
	if (typeof page.category === 'string') return [page.category];
	if (Array.isArray(page.category)) return page.category;
	return [];
}

hexo.extend.generator.register('category', function (locals) {
	/** @type {import("../types/common.cjs").PagesDataType[]} */
	const pages = locals.pages.data;

	/** 分类名称集合 */
	const allCategories = new Set();

	/** 无分类页面 */
	const uncategorizedPages = [];

	// 分类统计
	for (const page of pages) {
		const categories = extractCategories(page);
		if (!categories || categories.length === 0) {
			uncategorizedPages.push(page);
		} else {
			for (const c of categories) allCategories.add(c);
		}
	}

	/** @type {ReturnType<Parameters<import("hexo/dist/extend/generator.d.ts")["register"]>[1]>} */
	const result = [];

	// 分类索引页
	const categoryIndexList = [...allCategories].map(category => ({
		url: `/分类/${category}`,
		title: category,
	}));

	// 如果存在无分类页面，则添加一个无分类项
	if (uncategorizedPages.length > 0) {
		categoryIndexList.push({ url: '/分类/无分类', title: '无分类' });
	}

	// 生成分类索引页面
	result.push({
		path: '分类/index.vue',
		data: generateListPage(categoryIndexList, '分类索引'),
	});

	// 各分类页面
	for (const category of allCategories) {
		const matchedPages = pages.filter(page => extractCategories(page).includes(category));

		result.push({
			path: `/分类/${category}/index.vue`,
			data: generateListPage(
				matchedPages.map(element => toListItem(element)),
				`分类/${category}`,
			),
		});
	}

	// 无分类页面
	if (uncategorizedPages.length > 0) {
		result.push({
			path: '/分类/无分类/index.vue',
			data: generateListPage(
				uncategorizedPages.map(element => toListItem(element)),
				'分类/无分类',
			),
		});
	}

	return result;
});
