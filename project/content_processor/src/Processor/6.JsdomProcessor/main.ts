import jsdom from 'jsdom';
import tocProcessor from './toc';
import urlProcessor from './url';
import escodegen from 'escodegen';
import timeProcessor from './time';
import { parse as acorn } from 'acorn';
import assetsProcessor from './assets';
import categoryProcessor from './category';
import markdownJson from './markdown-json/main';
import type { processorFunction } from '../main';
import type { contentType } from '../../content';
import generateVue from '../../utils/generate-vue';

export type subProcessorFunction = (document: Document, item: contentType) => void;

const main: processorFunction = async content => {
	await Promise.all(
		content.map(async item => {
			if (item.inputPath && item.inputPath.endsWith('.md')) {
				// 初始化 JSDOM
				const dom = new jsdom.JSDOM(item.content);
				const document = dom.window.document;

				// 静态资源处理
				assetsProcessor(document, item, content);

				// 处理 URL
				urlProcessor(document, item);

				// 生成 Toc
				const tocElement = tocProcessor(document);

				// 生成尾部分类信息
				const categoryElement = categoryProcessor(document, item);

				// 生成尾部时间信息
				const timeElement = timeProcessor(document, item);

				// Markdown JSON 处理
				markdownJson(document, item);

				// 返回处理后的内容
				item.content = document.body.innerHTML;

				// Template 部分
				const template = `
<template v-slot:content>
<div class="title">
<h1>${item.metadata?.frontMatter?.title}</h1>
${item.metadata?.frontMatter?.description ? `<p class="description">${item.metadata.frontMatter.description}</p>` : ''}
</div>
<div class="content">
${document.body.innerHTML}
</div>
${categoryElement}
${timeElement}
</template>
${tocElement ? `<template v-slot:toc>${tocElement}</template>` : ''}
`;
				// Script 部分
				let script;
				{
					const frontMatter = item.metadata?.frontMatter;

					const PageMeta = {
						title: frontMatter?.title as string, // 已保证 title 存在
						...(frontMatter?.description ? { description: frontMatter.description } : {}),
					};

					const scriptAST = acorn(`definePageMeta(${JSON.stringify(PageMeta)})`, {
						ecmaVersion: 'latest',
						sourceType: 'module',
					});
					script = escodegen.generate(scriptAST);
				}

				item.content = generateVue(template, script, {
					setup: true,
					NuxtLayout: 'wiki-content',
				});
			}
		}),
	);
};

export default main;
