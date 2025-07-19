import { load as cheerio } from 'cheerio';
import type { LumirayType } from '../main';
import generateToc from '../utils/generateToc';

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
	const toc: { name: string; id: string }[] = [];

	// 移除所有注释
	$('*')
		.contents()
		.each((_, element) => {
			if (element.type === 'comment') {
				$(element).remove();
			}
		});

	// 提取 script 和 style 标签内容，并从 DOM 中移除它们
	['script', 'style'].forEach(tag => {
		$(tag).each((_, element) => {
			const content = $.html(element);
			if (content) {
				OriginalArray[tag as 'script' | 'style'].push(content);
			}
			$(element).remove();
		});
	});

	// 生成目录
	toc.push(...generateToc($));

	// 创建 Vue 组件并写入
	vue.push(`<template>${$('body').html()}</template>`);
	vue.push(...OriginalArray.script);
	vue.push(...OriginalArray.style);
	result.vue = vue.join('\n');
	result.toc = toc;

	return result;
};
