'use strict';

const yaml = require('yaml');
const fs = require('node:fs');
const acorn = require('acorn');
const jsdom = require('jsdom');
const escodegen = require('escodegen');
const generateToc = require('./processor/generatorToc.cjs');
const getMarkdownJson = require('./processor/getMarkdownJson.cjs');
const { Renderer } = require('@ts-dotnet-packages/markdown-render');

hexo.extend.renderer.register(
	'md',
	'vue',
	(data, _options) => {
		let result = [];
		// Markdown JSON 数据
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
		// TODO: 处理 markdownJSON 数据，生成 Vue 组件或其他内容

		// 生成 Vue Template
		{
			// 内容模板
			const contentTemplate = document.createElement('template');
			contentTemplate.setAttribute('v-slot:content', '');
			contentTemplate.innerHTML = body.innerHTML;

			// toc 模板
			const tocTemplate = document.createElement('template');
			tocTemplate.setAttribute(`v-slot:toc`, '');
			tocTemplate.innerHTML = tocHTML;

			result.push('<template>');
			result.push("<NuxtLayout name='wiki-content'>");
			result.push(contentTemplate.outerHTML);
			result.push(tocTemplate.outerHTML);
			result.push('</NuxtLayout>');
			result.push('</template>');
		}

		// 生成 Vue Script
		{
			const script = document.createElement('script');
			script.setAttribute('setup', '');

			const PageMeta = {
				title: markdownFrontMatter.title,
			};
			// 添加描述
			if (markdownFrontMatter.description) markdownFrontMatter.description = markdownFrontMatter.description;

			// 添加关键词
			if (Array.isArray(markdownFrontMatter.keywords) && markdownFrontMatter.keywords.length > 0)
				PageMeta.keywords = markdownFrontMatter.keywords.join(', ');

			// 生成 script
			const scriptAST = acorn.parse(`definePageMeta(${JSON.stringify(PageMeta)})`, {
				ecmaVersion: 'latest',
				sourceType: 'module',
			});
			script.textContent = escodegen.generate(scriptAST);

			result.push(script.outerHTML);
		}

		return result.join('\n');
	},
	true,
);
