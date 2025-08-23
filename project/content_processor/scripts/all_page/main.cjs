'use strict';

const toListItem = require('../utils/toListItem.cjs');
const generateListPage = require('../utils/generateListPage.cjs');

hexo.extend.generator.register('all_page', function (locals) {
	/** @type {import("../utils/generateListPage.cjs").ListDataType[]} */
	const pages = locals.pages.data // 获取所有页面
		.map(toListItem) // 转换为列表项
		.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN', { sensitivity: 'base' })); // 排序

	return {
		path: '/特殊页面/所有页面.vue',
		data: generateListPage(pages, '特殊页面/所有页面'),
	};
});
