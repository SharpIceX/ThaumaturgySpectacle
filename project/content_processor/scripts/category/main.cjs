'use strict';

const path = require('node:path/posix');
const generatePage = require('./utils/generatePage.cjs');

/**
 * @typedef PagesDataType
 * @property {string} path - 页面路径
 * @property {string} title - 页面标题
 * @property {string | string[]} category - 页面分类，可以是单个字符串或字符串数组
 */

/**
 * @typedef ResultType
 * @property {string} path - 生成的页面路径
 * @property {string} data - 生成的页面数据
 */

/**
 * 提取页面所属分类为数组
 * @param {PagesDataType} page - 页面数据
 * @returns {string[]} - 返回分类数组
 */
function extractCategories(page) {
	if (typeof page.category === 'string') return [page.category];
	if (Array.isArray(page.category)) return page.category;
	return [];
}

/**
 * 构建页面列表数据项
 * @param {PagesDataType} page - 页面数据
 * @returns {import('./utils/generatePage.cjs').ListDataType} - 返回列表数据项
 */
function toListItem(page) {
	// TIP: 不保留后缀`.vue`

	let pagePath = '';
	const extname = path.extname(page.path);
	const dirname = path.dirname(page.path);
	const basename = path.basename(page.path, extname);

	if (basename === 'index') {
		pagePath = path.join('/', dirname);
	} else {
		pagePath = path.join('/', dirname, basename);
	}

	return {
		url: pagePath,
		title: page.title,
	};
}

hexo.extend.generator.register('category', function (locals) {
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

	// 如果存在无分类页面，则添加一个无分类项
	if (uncategorizedPages.length > 0) {
		categoryIndexList.push({ url: '/分类/无分类', title: '无分类' });
	}

	// 生成分类索引页面
	result.push({
		path: '分类/index.vue',
		data: generatePage(categoryIndexList, '分类索引'),
	});

	// 各分类页面
	for (const category of allCategories) {
		const matchedPages = pages.filter(page => extractCategories(page).includes(category));

		result.push({
			path: `/分类/${category}/index.vue`,
			data: generatePage(matchedPages.map(toListItem), `分类:${category}`),
		});
	}

	// 无分类页面
	if (uncategorizedPages.length > 0) {
		result.push({
			path: '/分类/无分类/index.vue',
			data: generatePage(uncategorizedPages.map(toListItem), '分类:无分类'),
		});
	}

	return result;
});
