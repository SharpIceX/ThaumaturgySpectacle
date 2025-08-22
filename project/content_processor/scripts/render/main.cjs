'use strict';

const yaml = require('yaml');
const fs = require('node:fs');
const acorn = require('acorn');
const jsdom = require('jsdom');
const path = require('node:path');
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

			// 处理超链接
			const links = body.querySelectorAll('a');
			links.forEach(link => {
				// 删除无 href 属性的链接
				if (!link.getAttribute('href')) link.remove();

				// 创建 NuxtLink 元素
				const nuxtLink = document.createElement('NuxtLink');

				// 设置 to 属性
				nuxtLink.setAttribute('to', link.getAttribute('href'));

				// 复制原有的子节点
				while (link.firstChild) {
					nuxtLink.appendChild(link.firstChild);
				}

				let to = nuxtLink.getAttribute('to');

				// 将末尾的`index.md`删除，删除前确保开头含有`/`或`.`
				if (to.endsWith('index.md') && (to.startsWith('/') || to.startsWith('.'))) {
					to = to.slice(0, -'index.md'.length);
				}

				// 为开头为`.`的路径计算绝对路径
				if (to.startsWith('.')) {
					const contentDir = path.resolve(hexo.base_dir, hexo.config.source_dir);
					const currentDir = path.dirname(data.path);
					const absPath = path.resolve(currentDir, decodeURI(to));
					let url = path.relative(contentDir, absPath);

					// 统一为正斜杠
					url = url.split(path.sep).join('/');

					// 保证以 / 开头
					url = '/' + url.replace(/^\/+/, '');

					// 去除末尾的 "/"
					if (url.endsWith('/')) {
						url = url.replace(/\/+$/, '');
					}

					// 进行 URL 编码，并转换为小写
					url = encodeURI(url).toLowerCase();

					to = url;
				}

				// 写入 NuxtLink 的 to 属性
				nuxtLink.setAttribute('to', to);

				// 用 NuxtLink 替换原有的 a 元素
				link.replaceWith(nuxtLink);
			});

			// 生成目录
			const tocHTML = generateToc(body);

			// 处理 Markdown JSON
			markdownJsonProcessor(hexo, body, markdownJson);

			// 获取内容并规范 NuxtLink 标签大小写
			const content = body.innerHTML.replace(/<nuxtlink/g, '<NuxtLink').replace(/<\/nuxtlink>/g, '</NuxtLink>');

			// 内容部分
			const template = `
<template v-slot:content>
<div class="title">
<h1>${markdownFrontMatter.title}</h1>
${markdownFrontMatter.description ? `<p class="description">${markdownFrontMatter.description}</p>` : ''}
</div>
<div class="content">
${content}
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
