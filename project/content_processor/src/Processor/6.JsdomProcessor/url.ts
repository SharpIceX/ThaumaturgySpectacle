import path from 'node:path/posix';
import { encodeURI } from '@ts/utils';
import { contentPath } from '../../main';
import { subProcessorFunction } from './main';

const main: subProcessorFunction = (document, data) => {
	const body = document.body;

	// 获取所有超链接
	const links = body.querySelectorAll('a');

	for (const link of links) {
		// 删除无 href 属性的链接
		if (!link.getAttribute('href')) {
			link.remove();
			continue;
		}

		// 创建 NuxtLink 元素
		const nuxtLink = document.createElement('nuxt-link');

		// 复制原有的所有属性，将 href 转换为 to
		for (const attribute of link.attributes) {
			if (attribute.name === 'href') {
				nuxtLink.setAttribute('to', attribute.value);
			} else {
				nuxtLink.setAttribute(attribute.name, attribute.value);
			}
		}
		// 复制原有的子节点
		nuxtLink.append(...link.childNodes);

		// 断言备注：因为上面已经确保了 href 属性存在
		let to = nuxtLink.getAttribute('to') as string;

		// 仅处理本地相对路径
		if (to.startsWith('.')) {
			// 判断结尾是否为`.md`，如果是则将其删除
			if (to.endsWith('.md')) {
				to = to.slice(0, -3);
			}

			// 判断结尾是否为`/index`，如果是则将其删除
			if (to.endsWith('/index')) {
				to = to.slice(0, -6);
			}

			// 处理为绝对路径

			// 获取当前 Markdown 文件的目录绝对路径
			// 断言备注：Markdown 文件都有`inputPath`不可能没有
			const currentDirectory = path.dirname(data.inputPath as string);

			// 计算目标文件的绝对路径
			const absPath = path.resolve(currentDirectory, decodeURI(to));

			// 计算相对于内容目录的路径
			let url = path.relative(contentPath, absPath);

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

		// 设置处理后的路径
		nuxtLink.setAttribute('to', to);

		// 替换原有链接
		link.replaceWith(nuxtLink);
	}
};

export default main;
