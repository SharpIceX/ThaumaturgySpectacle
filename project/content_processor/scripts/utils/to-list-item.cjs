'use strict';

const path = require('node:path/posix');

/**
 * 构建页面列表数据项
 * @param {import("hexo/dist/types").PageSchema} page - 页面数据
 * @returns {import('./generate-list-page.cjs').ListDataType} - 返回列表数据项
 */
function toListItem(page) {
	// NOTE: 不保留后缀`.vue`

	let pagePath = '';
	const extname = path.extname(page.path);
	const dirname = path.dirname(page.path);
	const basename = path.basename(page.path, extname);

	// 处理首页路径
	// 如果是 `index` 则表示为目录首页，路径为 `/dirname/`
	// 否则表示为普通页面，路径为 `/dirname/basename`
	pagePath = basename === 'index' ? path.join('/', dirname) : path.join('/', dirname, basename);

	return {
		url: pagePath,
		title: page.title,
	};
}

module.exports = toListItem;
