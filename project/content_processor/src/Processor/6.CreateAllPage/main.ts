import type { processorFunction } from '../main';
import toListItem from '../../utils/to-list-item';
import generateListPage from '../../utils/generate-list-page';

const main: processorFunction = async content => {
	const wikiPages = content
		.filter(
			item =>
				item.inputPath?.endsWith('.md') &&
				item.outputPath?.endsWith('.vue') &&
				item.metadata?.frontMatter?.title,
		) // 筛选出 wiki 页面
		.map(element => toListItem(element)) // 转换为列表项
		.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN', { sensitivity: 'base' })); // 排序

	content.push({
		outputPath: '特殊页面/所有页面.vue',
		content: generateListPage(wikiPages, '所有页面'),
	});
};

export default main;
