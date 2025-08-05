const yaml = require('yaml');
const fs = require('node:fs');
const acorn = require('acorn');
const jsdom = require('jsdom');
const path = require('node:path');
const escodegen = require('escodegen');
const markdownIt = require('markdown-it');
const { Renderer } = require('@ts-dotnet-packages/markdown-render');

/**
 * @typedef {Object} TocItem
 * @property {string} id - 生成的 ID
 * @property {string} name - 标题文本
 * @property {number} level - 标题级别，1 对应 h2
 */

/**
 * @type {import('../../../types/render.d.ts').ProcessorFunc}
 */
function Processor(hexo, content) {
	let vue = [];
	/**
	 * @type {import('@ts-packages/schema/types/wiki.d.ts').Schema}
	 */
	let markdownJSON = {};
	let markdownContent = null;
	let markdownFrontMatter = {};
	let tocHTML = null;

	// 获取内容完整路径
	const contentPath = path.resolve(hexo.base_dir, hexo.config.source_dir);

	// 处理 Markdown 内容 和 Front Matter
	{
		const renderResult = Renderer.Render(fs.readFileSync(content.path, 'utf-8'));

		markdownContent = renderResult.html;

		markdownFrontMatter = yaml.parse(renderResult.frontMatter) || {};

		if (!markdownFrontMatter.title) throw new Error(`${content.path} 的 Front Matter 中缺少 title 字段`);
	}

	// 处理 Markdown JSON 数据
	{
		// JSON 路径
		const dirname = path.dirname(content.path);
		const filename = path.basename(content.path, path.extname(content.path));
		const jsonPath = path.join(dirname, `${filename}.json`);

		if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).isFile()) {
			const jsonContent = fs.readFileSync(jsonPath, 'utf-8');

			try {
				const jsonObject = JSON.parse(jsonContent);

				if (Object.keys(jsonObject).length === 0) {
					hexo.log.warn(`JSON 文件 ${jsonPath} 为空，这或许应该删除`);
				} else {
					markdownJSON = jsonObject;
				}
			} catch (error) {
				throw new Error(`无法解析 JSON 文件: ${jsonPath}, 错误: ${error.message}`);
			}
		}
	}

	const dom = new jsdom.JSDOM(markdownContent);
	const document = dom.window.document;
	const body = document.body;

	// 生成 toc
	{
		/**
		 * @type {TocItem[]}
		 */
		let tocContent = [];
		// 获取数据
		{
			const headings = Array.from(body.querySelectorAll('h2, h3, h4, h5, h6'));
			tocContent = headings.map(heading => {
				const id = `${heading.tagName.toLowerCase()}-${encodeURIComponent(heading.textContent.trim())}`;
				heading.id = id;

				return {
					id,
					name: heading.textContent.trim(),
					level: {
						h2: 1,
						h3: 2,
						h4: 3,
						h5: 4,
						h5: 5,
					}[heading.tagName.toLowerCase()],
				};
			});
		}

		let tocMarkdown = '';
		// 将数据转换为 Markdown
		{
			tocContent.forEach(item => {
				const indentation = ' '.repeat(item.level - 1);
				tocMarkdown += `${indentation}- [${item.name}](#${item.id})\n`;
			});
		}

		// 将 Markdown 转换为 HTML
		{
			const md = markdownIt();
			tocHTML = md.render(tocMarkdown);
		}
	}

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

		vue.push('<template>');
		vue.push("<NuxtLayout name='wiki-content'>");
		vue.push(contentTemplate.outerHTML);
		vue.push(tocTemplate.outerHTML);
		vue.push('</NuxtLayout>');
		vue.push('</template>');
	}

	// 生成 Vue Script
	{
		const script = document.createElement('script');
		script.setAttribute('setup', '');

		const PageMeta = {
			title: markdownFrontMatter.title,
		};
		if (markdownFrontMatter.description) markdownFrontMatter.description = markdownFrontMatter.description;

		// 生成 script
		const scriptAST = acorn.parse(`definePageMeta(${JSON.stringify(PageMeta)})`, {
			ecmaVersion: 'latest',
			sourceType: 'module',
		});
		script.textContent = escodegen.generate(scriptAST);

		vue.push(script.outerHTML);
	}

	return vue.join('\n');
}

module.exports = Processor;
