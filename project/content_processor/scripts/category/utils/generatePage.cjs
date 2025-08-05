'use strict';

const acorn = require('acorn');
const escodegen = require('escodegen');

/**
 * @typedef {object} ListDataType
 * @property {string} url - 链接地址
 * @property {string} title - 显示文本
 */

/**
 * 构建一个列表项
 * @param {string} href - 链接地址
 * @param {string} text - 显示文本
 * @returns {string}
 */
const createListItem = (href, text) => `  <li><a href="${href}">${text}</a></li>`;

/**
 * 生成页面内容的函数
 * @param {ListDataType[]} listData - 列表数据
 * @param {string} name - 页面名称
 * @returns {import("../main.cjs").ResultType} - 生成的页面内容
 */
function generatePage(listData, name) {
	const data = [];

	// Template 部分
	data.push('<template>');
	data.push("<NuxtLayout name='category-content'>");
	data.push(`<h1>${name}</h1>`);
	data.push('<ul>');
	listData.forEach(item => {
		data.push(createListItem(item.url, item.title));
	});
	data.push('</ul>');
	data.push('</NuxtLayout>');
	data.push('</template>');

	// Script 部分
	const PageMeta = {
		title: name,
	};

	// 生成 script
	const scriptAST = acorn.parse(`definePageMeta(${JSON.stringify(PageMeta)})`, {
		ecmaVersion: 'latest',
		sourceType: 'module',
	});

	data.push('<script setup>');
	data.push(escodegen.generate(scriptAST));
	data.push('</script>');

	return data.join('\n');
}

module.exports = generatePage;
