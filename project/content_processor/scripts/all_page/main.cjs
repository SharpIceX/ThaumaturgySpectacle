'use strict';

const toListItem = require('../utils/to-list-item.cjs');
const generateListPage = require('../utils/generate-list-page.cjs');

hexo.extend.generator.register('all_page', function (locals) {
	/** @type {import("hexo/dist/types").PageSchema[]} */
	const pages = locals.pages.data; // 获取所有页面

	const allPages = pages
		.map(element => toListItem(element)) // 转换为列表项
		.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN', { sensitivity: 'base' })); // 排序

	return {
		path: '/特殊页面/所有页面.vue',
		data: generateListPage(allPages, '特殊页面/所有页面'),
	};
});
