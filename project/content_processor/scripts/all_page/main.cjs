'use strict';

hexo.extend.filter.register(
	'after_generate',
	function () {
		//hexo.route.set('all_page.vue', '测试');
		//console.log(hexo.route);
		console.log(hexo.locals.get('pages').data[2]);
	},
	1,
);
