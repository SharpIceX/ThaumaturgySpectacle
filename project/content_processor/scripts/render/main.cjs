'use strict';

const yaml = require('yaml');
const fs = require('node:fs');
const acorn = require('acorn');
const jsdom = require('jsdom');
const escodegen = require('escodegen');
const generateVue = require('../utils/generateVue.cjs');
const generateToc = require('./processor/generatorToc.cjs');
const getMarkdownJson = require('./processor/getMarkdownJson.cjs');
const { Renderer } = require('@ts-dotnet-packages/markdown-render');
const markdownJsonProcessor = require('./processor/markdownJson/main.cjs');

hexo.extend.renderer.register(
	'md',
	'vue',
	data => {
		try {
			/**
			 * Markdown JSON 数据
			 * @type {import("@ts/schema/types/wiki").Schema}
			 */
			const markdownJson = getMarkdownJson(hexo, data.path);

			// Markdown 渲染结果
			const render = Renderer.Render(fs.readFileSync(data.path, 'utf-8'));

			// Markdown Front Matter 内容
			const markdownFrontMatter = yaml.parse(render.frontMatter) || {};

			// 缺失 title 字段时抛出错误
			if (!markdownFrontMatter.title) throw new Error(`${data.path} 的 Front Matter 中缺少 title 字段`);

			// 初始化 JSDOM
			const dom = new jsdom.JSDOM(render.html);
			const document = dom.window.document;
			const body = document.body;

			// 生成目录
			const tocHTML = generateToc(body);

			// 处理 Markdown JSON
			markdownJsonProcessor(hexo, body, markdownJson);

			// 内容部分
			const template = `
<template v-slot:content>
<div class="title">
<h1>${markdownFrontMatter.title}</h1>
${markdownFrontMatter.description ? `<p class="description">${markdownFrontMatter.description}</p>` : ''}
</div>
<div class="content">
${body.innerHTML}
</div>
</template>
${tocHTML ? `<template v-slot:toc>${tocHTML}</template>` : ''}
`;

			// 生成 Vue Script
			let script = null;
			{
				// 生成 definePageMeta 函数内数据
				const PageMeta = {
					title: markdownFrontMatter.title,
				};
				// 添加描述
				if (markdownFrontMatter.description) PageMeta.description = markdownFrontMatter.description;

				// 添加关键词
				if (Array.isArray(markdownFrontMatter.keywords) && markdownFrontMatter.keywords.length > 0)
					PageMeta.keywords = markdownFrontMatter.keywords.join(', ');

				// 生成 script
				const scriptAST = acorn.parse(`definePageMeta(${JSON.stringify(PageMeta)})`, {
					ecmaVersion: 'latest',
					sourceType: 'module',
				});
				script = escodegen.generate(scriptAST);
			}

			return generateVue(template, script, {
				setup: true,
				NuxtLayout: 'wiki-content',
			});
		} catch (error) {
			// 处理错误
			hexo.log.error(`渲染 Markdown 文件 ${data.path} 时发生错误:`, error);
			throw error;
		}
	},
	true,
);
