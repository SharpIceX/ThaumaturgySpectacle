'use strict';

const path = require('node:path/posix');

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
	/** @type {ResultType[]} */
	const result = [];

	/** @type {PagesDataType[]} */
	const pages = locals.pages.data;

	/** @type {Set<string>} */
	const allCategories = new Set();
	let hasUncategorized = false;

	// 收集所有分类
	for (const page of pages) {
		if (typeof page.category === 'string') {
			allCategories.add(page.category);
		} else if (Array.isArray(page.category)) {
			page.category.forEach(c => allCategories.add(c));
		} else {
			if (page.category) {
				hexo.log.warn(`页面 "${page.path}" 的分类字段类型未知，应该是字符串或字符串数组。`);
			} else {
				hasUncategorized = true;
			}
		}
	}

	/**
	 * 构建一个列表项
	 * @param {string} href - 链接地址
	 * @param {string} text - 显示文本
	 * @returns {string}
	 */
	const renderListItem = (href, text) => `  <li><a href="${href}">${text}</a></li>`;

	/**
	 * 生成 Vue 页面模板
	 * @param {string[]} listItems - <li>...</li> 项列表
	 * @returns {string} - 页面字符串
	 */
	const generateVueTemplate = listItems =>
		['<template>', '<ul class="unordered-list-row">', ...listItems, '</ul>', '</template>'].join('\n');

	// 生成分类索引页面
	{
		const items = Array.from(allCategories).map(cat => renderListItem(`/分类/${cat}`, cat));

		if (hasUncategorized) {
			items.push(renderListItem(`/分类/无分类`, '无分类'));
		}

		result.push({
			path: '分类/index.vue',
			data: generateVueTemplate(items),
		});
	}

	// 生成每个分类页面
	for (const category of allCategories) {
		const items = pages
			.filter(page => {
				const cat = page.category;
				if (typeof cat === 'string') return cat === category;
				if (Array.isArray(cat)) return cat.includes(category);
				return false;
			})
			.map(page => renderListItem(`/${path.join(page.path, '../')}`, page.title));

		result.push({
			path: `分类/${category}.vue`,
			data: generateVueTemplate(items),
		});
	}

	// 生成无分类页面
	if (hasUncategorized) {
		const items = pages
			.filter(page => !page.category)
			.map(page => renderListItem(`/${path.join(page.path, '../')}`, page.title));

		result.push({
			path: '分类/无分类.vue',
			data: generateVueTemplate(items),
		});
	}

	return result;
});
