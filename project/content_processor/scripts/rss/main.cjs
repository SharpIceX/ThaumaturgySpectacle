'use strict';

const feed = require('feed');

hexo.extend.generator.register('RSS', function (locals) {
	/** @type {import("hexo/dist/types").PageSchemaExtra[]} */
	let pages = locals.pages.data; // 获取所有页面

	// 生成时间数据
	for (const page of pages) {
		//console.log(page.extra);
	}

	return {
		path: '/rss.xml',
		data: '',
	};
});
