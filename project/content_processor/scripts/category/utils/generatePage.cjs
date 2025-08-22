'use strict';

const acorn = require('acorn');
const escodegen = require('escodegen');
const generateVue = require('../../utils/generateVue.cjs');

/**
 * @typedef {object} ListDataType
 * @property {string} url - 链接地址
 * @property {string} title - 显示文本
 */

/**
 * 构建一个列表项
 * @param {string} href - 链接地址
 * @param {string} text - 显示文本
 * @returns {string} - 列表项的 HTML 字符串
 */
const createListItem = (href, text) => `  <li><NuxtLink to="${encodeURI(href).toLowerCase()}">${text}</NuxtLink></li>`;

/**
 * 生成页面内容的函数
 * @param {ListDataType[]} listData - 列表数据
 * @param {string} name - 页面名称
 * @returns {import("../main.cjs").ResultType} - 生成的页面内容
 */
function generatePage(listData, name) {
	// Template 部分
	const template = `
<template v-slot:content>
<div class="title">
<h1>${name}</h1>
</div>
<div class="content">
<ul>
${listData.map(item => createListItem(item.url, item.title)).join('\n')}
</ul>
</div>
</template>
`;

	// Script 部分

	// definePageMeta 函数内数据
	const PageMeta = {
		title: name,
	};
	const scriptAST = acorn.parse(`definePageMeta(${JSON.stringify(PageMeta)})`, {
		ecmaVersion: 'latest',
		sourceType: 'module',
	});

	return generateVue(template, escodegen.generate(scriptAST), {
		setup: true,
		NuxtLayout: 'wiki-content',
	});
}

module.exports = generatePage;
