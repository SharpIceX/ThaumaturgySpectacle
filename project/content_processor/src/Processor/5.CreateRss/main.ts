// ESLint 规则 @typescript-eslint/no-non-null-assertion 禁用备注
// 大多数情况下都已被校验，所以这里使用非空断言以简化代码
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Feed } from 'feed';
import path from 'node:path';
import type { processorFunction } from '../main';
import type { contentType } from '../../content';

const main: processorFunction = async (content: contentType[]) => {
	// 获取所有 wiki 页面（.md 源文件 -> .vue 输出，并且有更新时间）
	const wikiPages = content.filter(item => item.inputPath?.endsWith('.md') && item.outputPath?.endsWith('.vue'));

	// 按更新时间降序排列（最新优先）
	wikiPages.sort((a, b) => {
		const timeA = a.metadata?.time?.updated;
		const timeB = b.metadata?.time?.updated;
		if (!timeA && !timeB) return 0;
		if (!timeA) return 1;
		if (!timeB) return -1;
		return timeB.toMillis() - timeA.toMillis();
	});

	// 取前 20 个作为 RSS 条目
	const rssItems = wikiPages.slice(0, 20);

	const feed = new Feed({
		title: '幻术奇象',
		language: 'zh-CN',
		id: 'https://ts.sharpice.top/',
		link: 'https://ts.sharpice.top/',
		description: '欢迎来到幻术与奇象世界！',
		image: 'https://ts.sharpice.top/favicon.png',
		favicon: 'https://ts.sharpice.top/favicon.ico',
		copyright: '© 锐冰 版权所有 All rights reserved.',
		author: {
			name: 'SharpIce',
			link: 'https://SharpIce.top',
			email: 'SharpIce@SharpIce.top',
			avatar: 'https://ts.sharpice.top/favicon.png',
		},
	});

	// 添加 RSS 条目
	for (const item of rssItems) {
		// 后面有`index.vue`的去掉，没有的去掉`.vue`
		const link_dirname = item.outputPath!.endsWith('index.vue')
			? item.outputPath!.slice(0, -'index.vue'.length)
			: item.outputPath!.slice(0, -'.vue'.length);

		const link = encodeURI(`https://ts.sharpice.top/${link_dirname}`);

		feed.addItem({
			title: item.metadata!.frontMatter!.title,
			id: link,
			link: link,
			...(item.metadata?.frontMatter?.description && { description: item.metadata.frontMatter.description }),
			author: [{ name: '锐冰' }],
			date: item.metadata!.time!.updated!.toJSDate(),
		});
	}

	// 生成 RSS XML
	content.push(
		// RSS 2.0
		{
			outputPath: path.join('rss.xml'),
			content: feed.rss2(),
		},
		// Atom 1.0
		{
			outputPath: path.join('atom.xml'),
			content: feed.atom1(),
		},
		// JSON Feed 1.0
		{
			outputPath: path.join('feed.json'),
			content: feed.json1(),
		},
	);
};

export default main;
