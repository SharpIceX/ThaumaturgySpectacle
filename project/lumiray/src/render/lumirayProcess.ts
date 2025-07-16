import { LumirayType } from '../main';
import { load as cheerio } from 'cheerio';

interface ResultType {
	vue: string;
	toc: LumirayType['toc'];
}

export default (html: string): ResultType => {
	const result: ResultType = {
		vue: '',
		toc: [],
	};

	const OriginalArray: {
		script: string[];
		style: string[];
	} = {
		script: [],
		style: [],
	};

	const $ = cheerio(html);
	const vue = [];

	// 提取 script 和 style 标签内容，并从 DOM 中移除它们
	['script', 'style'].forEach(tag => {
		$(tag).each((_, element) => {
			const content = $(element).html();
			if (content) {
				OriginalArray[tag as 'script' | 'style'].push(content);
			}
			$(element).remove();
		});
	});

	// 创建 Vue 组件并写入
	vue.push(`<template>${$('body').html()}</template>`);
	vue.push(...OriginalArray.script);
	vue.push(...OriginalArray.style);
	result.vue = vue.join('\n');

	return result;
};
