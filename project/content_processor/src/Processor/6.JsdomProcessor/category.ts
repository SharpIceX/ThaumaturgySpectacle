import { encodeURI } from '@ts/utils';
import type { subProcessorFunction } from './main';

const main: subProcessorFunction = (document, data): string => {
	const frontMatter = data.metadata?.frontMatter;

	// 创建分类元素
	const categoryElement = document.createElement('div');
	categoryElement.className = 'category';
	categoryElement.innerHTML = '<strong>分类：</strong>';

	const categorys = [];

	// 获取分类信息
	if (frontMatter?.category) {
		categorys.push(...(Array.isArray(frontMatter.category) ? frontMatter.category : [frontMatter.category]));
	} else {
		categorys.push('无分类');
	}

	// 生成分类链接
	const categoryLinks = categorys.map(category => {
		const a = document.createElement('nuxt-link');
		a.setAttribute('to', encodeURI(`/分类/${category}`, true));
		a.textContent = category;
		return a;
	});

	// 将分类链接添加到分类元素中
	for (const link of categoryLinks) categoryElement.append(link);

	return categoryElement.outerHTML;
};

export default main;
