'use strict';

const path = require('node:path/posix');
const generatePage = require('./utils/generatePage.cjs');

/**
 * @typedef PagesDataType
 * @property {string} path - 文件路径
 * @property {string} title - 页面标题
 * @property {string | string[]} category - 分类名称
 */

/**
 * @typedef ResultType
 * @property {string} path - 生成的页面路径
 * @property {string} data - 页面内容
 */

hexo.extend.generator.register(function (locals) {
	/** @type {PagesDataType[]} */
	const pages = locals.pages.data;
	/** @type {ResultType[]} */
	const result = [];

	/** @type {Set<string>} */
	const allCategories = new Set();

	/** @type {PagesDataType[]} */
	const uncategorizedPages = [];

	// 分类整理
	pages.forEach(page => {
		const { category } = page;

		if (typeof category === 'string') {
			// 字符串
			allCategories.add(category);
		} else if (Array.isArray(category)) {
			// 数组
			category.forEach(c => allCategories.add(c));
		} else {
			// 其他情况放入无分类列表
			uncategorizedPages.push(page);
		}
	});

	// 生成分类索引页
	{
		const data = Array.from(allCategories).map(category => ({
			url: `/分类/${category}`,
			title: category,
		}));

		if (uncategorizedPages.length > 0) {
			data.push({
				url: '/分类/无分类',
				title: '无分类',
			});
		}

		result.push({
			path: '分类/index.vue',
			data: generatePage(data, '分类索引'),
		});
	}

	// 生成各个分类页面
	allCategories.forEach(category => {
		/**
		 * @type {import("./utils/generatePage.cjs").ListDataType}
		 */
		const ListItem = [];

		// 遍历所有页面，筛选出属于当前分类的页面
		pages.forEach(page => {
			if (page.category) {
				if (typeof page.category === 'string' && page.category === category) {
					// 字符串
					const filename = path.basename(page.path, path.extname(page.path));
					ListItem.push({
						url: path.join(page.path, '../'),
						title: page.title,
					});
				} else if (Array.isArray(page.category) && page.category.includes(category)) {
					// 数组
					const filename = path.basename(page.path, path.extname(page.path));
					ListItem.push({
						url: path.join(page.path, '../'),
						title: page.title,
					});
				}
			}
		});

		// 生成分类页面
		result.push({
			path: `分类/${category}/index.vue`,
			data: generatePage(ListItem, `分类:${category}`),
		});
	});

	// 生成无分类页面
	if (uncategorizedPages.length > 0) {
		result.push({
			path: '分类/无分类/index.vue',
			data: generatePage(
				Array.from(uncategorizedPages).map(page => ({
					url: path.join(page.path, '../'),
					title: page.title,
				})),
				'分类:无分类',
			),
		});
	}

	return result;
});
