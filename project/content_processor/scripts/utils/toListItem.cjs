'use strict';

const path = require('node:path/posix');

/**
 * 构建页面列表数据项
 * @param {import('../types/common.cjs').PagesDataType} page - 页面数据
 * @returns {import('./generateListPage.cjs').ListDataType} - 返回列表数据项
 */
function toListItem(page) {
	// NOTE: 不保留后缀`.vue`

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

module.exports = toListItem;
