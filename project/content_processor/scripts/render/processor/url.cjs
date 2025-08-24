'use strict';

const jsdom = require('jsdom');
const path = require('node:path');
const { encodeURI } = require('@ts/utils');

const { document } = new jsdom.JSDOM(`...`).window;

/**
 * 处理文档中的 URL 链接，将其转换为 NuxtLink 组件并处理相对路径。
 * @param {import("hexo/dist/extend/renderer").StoreFunctionData} data - 渲染数据对象
 * @param {HTMLElement} body - JSDOM 文档的 body 元素
 * @returns {void}
 */
function urlProcessor(data, body) {
	// 获取所有超链接
	const links = body.querySelectorAll('a');

	for (const link of links) {
		// 删除无 href 属性的链接
		if (!link.getAttribute('href')) link.remove();

		// 创建 NuxtLink 元素
		const nuxtLink = document.createElement('nuxt-link');

		// 设置 to 属性
		nuxtLink.setAttribute('to', link.getAttribute('href'));

		// 复制原有的子节点
		nuxtLink.append(...link.childNodes);

		let to = nuxtLink.getAttribute('to');

		// 将末尾的`index.md`删除，删除前确保开头含有`/`或`.`
		if (to.endsWith('index.md') && (to.startsWith('/') || to.startsWith('.'))) {
			to = to.slice(0, -'index.md'.length);
		}

		// 为开头为`.`的路径计算绝对路径
		if (to.startsWith('.')) {
			// 获取内容目录的绝对路径
			const contentDirectory = path.resolve(hexo.base_dir, hexo.config.source_dir);

			// 获取当前 Markdown 文件的目录绝对路径
			const currentDirectory = path.dirname(data.path);

			// 计算目标文件的绝对路径
			const absPath = path.resolve(currentDirectory, decodeURI(to));

			// 计算相对于内容目录的路径
			let url = path.relative(contentDirectory, absPath);

			// 统一为正斜杠
			url = url.split(path.sep).join('/');

			// 保证以 / 开头
			url = '/' + url.replace(/^\/+/, '');

			// 去除末尾的 "/"
			if (url.endsWith('/')) {
				url = url.replace(/\/+$/, '');
			}

			// 进行 URL 编码
			to = encodeURI(url, true);
		}
	}
}

module.exports = urlProcessor;
