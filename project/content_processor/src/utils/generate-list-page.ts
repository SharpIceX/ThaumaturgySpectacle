import escodegen from 'escodegen';
import { encodeURI } from '@ts/utils';
import { parse as acorn } from 'acorn';
import generateVue from '../utils/generate-vue';

export interface ListDataType {
	/** 链接地址 */
	url: string;
	/** 显示文本 */
	title: string;
}

/**
 * 构建一个列表项
 * @param href - 链接地址
 * @param text - 显示文本
 * @returns 列表项的 HTML 字符串
 */
const createListItem = (href: string, text: string): string =>
	`<li><NuxtLink to="${encodeURI(href, true)}">${text}</NuxtLink></li>`;

/**
 * 生成页面内容的函数
 * @param listData - 列表数据
 * @param name - 页面名称
 * @returns 生成的页面内容
 */
const generateListPage = (listData: ListDataType[], name: string) => {
	const template = `
<template v-slot:content>
<div class="title">
<h1>${name}</h1>
</div>
<div class="content">
<ul class="custom list-page">
${listData.map(item => createListItem(item.url, item.title)).join('\n\t\t\t')}
</ul>
</div>
</template>
`;

	const scriptAST = acorn(`definePageMeta(${JSON.stringify({ title: name })})`, {
		ecmaVersion: 'latest',
		sourceType: 'module',
	});

	return generateVue(template, escodegen.generate(scriptAST), {
		setup: true,
		NuxtLayout: 'wiki-content',
	});
};

export default generateListPage;
