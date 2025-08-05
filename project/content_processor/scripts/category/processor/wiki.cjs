/**
 * @type {import("../../../types/category.d.ts").ProcessorFunc}
 */
function Processor(data) {
	/**
	 * @type {import("../../../types/category.d.ts").ProcessorFuncResult[]}
	 */
	const result = [];

	// 获取所有分类
	const allCategories = new Set();
	let NoCategory = false;
	data.forEach(page => {
		// 如果有分类，则添加到集合中
		// 如果没有分类，则启用 NoCategory 标志
		if (page.category) {
			allCategories.add(page.category);
		} else {
			NoCategory = true;
		}
	});

	// 生成分类页面
	{
		const vue = [];

		vue.push('<template>');
		vue.push("<NuxtLayout name='wiki-content'>");
		vue.push(contentTemplate.outerHTML);
		vue.push(tocTemplate.outerHTML);
		vue.push('</NuxtLayout>');
		vue.push('</template>');

		result.push({
			path: 'wiki/分类.vue',
			data: '',
		});
	}
}

module.exports = Processor;
