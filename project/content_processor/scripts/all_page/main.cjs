'use strict';

const toListItem = require('../utils/toListItem.cjs');
const generateListPage = require('../utils/generateListPage.cjs');

hexo.extend.generator.register('all_page', function (locals) {
	/** @type {import("../types/common.cjs").PagesDataType[]} */
	const pages = locals.pages.data;

	return {
		path: '/特殊页面/所有页面.vue',
		data: generateListPage(pages.map(toListItem), '特殊页面/所有页面'),
	};
});
