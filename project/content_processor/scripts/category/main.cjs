'use strict';

const path = require('node:path/posix');
const generatePage = require('./utils/generatePage.cjs');

/**
 * @typedef PagesDataType
 * @property {string} path
 * @property {string} title
 * @property {string | string[]} category
 */

/**
 * @typedef ResultType
 * @property {string} path
 * @property {string} data
 */

/**
 * 提取页面所属分类为数组
 * @param {PagesDataType} page
 * @returns {string[]}
 */
function extractCategories(page) {
	if (typeof page.category === 'string') return [page.category];
	if (Array.isArray(page.category)) return page.category;
	return [];
}

/**
 * 构建页面列表数据项
 * @param {PagesDataType} page
 * @returns {import('./utils/generatePage.cjs').ListDataType}
 */
function toListItem(page) {
	return {
		url: path.join(page.path, '../'),
		title: page.title,
	};
}

hexo.extend.generator.register(function (locals) {
	/** @type {PagesDataType[]} */
	const pages = locals.pages.data;

	/** 分类名称集合 */
	const allCategories = new Set();

	/** 无分类页面 */
	const uncategorizedPages = [];

	// 分类统计
	pages.forEach(page => {
		const categories = extractCategories(page);
		if (categories.length === 0) {
			uncategorizedPages.push(page);
		} else {
			categories.forEach(c => allCategories.add(c));
		}
	});

	/** @type {ResultType[]} */
	const result = [];

	// 分类索引页
	const categoryIndexList = Array.from(allCategories).map(category => ({
		url: `/分类/${category}`,
		title: category,
	}));

	if (uncategorizedPages.length > 0) {
		categoryIndexList.push({ url: '/分类/无分类', title: '无分类' });
	}

	result.push({
		path: '分类/index.vue',
		data: generatePage(categoryIndexList, '分类索引'),
	});

	// 各分类页面
	for (const category of allCategories) {
		const matchedPages = pages.filter(page => extractCategories(page).includes(category));

		result.push({
			path: `分类/${category}/index.vue`,
			data: generatePage(matchedPages.map(toListItem), `分类:${category}`),
		});
	}

	// 无分类页面
	if (uncategorizedPages.length > 0) {
		result.push({
			path: '分类/无分类/index.vue',
			data: generatePage(uncategorizedPages.map(toListItem), '分类:无分类'),
		});
	}

	return result;
});
