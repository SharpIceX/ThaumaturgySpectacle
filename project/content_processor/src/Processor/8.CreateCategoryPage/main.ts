import type { contentType } from '../../content';
import type { processorFunction } from '../main';
import toListItem from '../../utils/to-list-item';
import generateListPage from '../../utils/generate-list-page';

const extractCategories = (page: contentType): string[] => {
	const category = page.metadata?.frontMatter?.category;

	if (typeof category === 'string') return [category];
	if (Array.isArray(category)) return category;
	return [];
};

const main: processorFunction = async content => {
	const wikiPages = content.filter(
		item =>
			item.inputPath?.endsWith('.md') && item.outputPath?.endsWith('.vue') && item.metadata?.frontMatter?.title,
	); // 筛选出 wiki 页面

	/** 分类名称集合 */
	const allCategories = new Set<string>();

	/** 无分类页面 */
	const uncategorizedPages: contentType[] = [];

	// 分类统计
	for (const page of wikiPages) {
		const categories = extractCategories(page);
		if (!categories || categories.length === 0) {
			uncategorizedPages.push(page);
		} else {
			for (const c of categories) allCategories.add(c);
		}
	}

	// 分类索引页
	const categoryIndexList = [...allCategories].map(category => ({
		url: `/分类/${category}`,
		title: category,
	}));
	// 如果存在无分类页面，则添加一个无分类项
	if (uncategorizedPages.length > 0) {
		categoryIndexList.push({ url: '/分类/无分类', title: '无分类' });
	}
	// 生成分类索引页面
	content.push({
		outputPath: '分类/index.vue',
		content: generateListPage(categoryIndexList, '分类索引'),
	});

	// 各分类页面
	for (const category of allCategories) {
		const matchedPages = wikiPages.filter(page => extractCategories(page).includes(category));

		content.push({
			outputPath: `/分类/${category}/index.vue`,
			content: generateListPage(
				matchedPages.map(element => toListItem(element)),
				`分类/${category}`,
			),
		});
	}

	// 无分类页面
	if (uncategorizedPages.length > 0) {
		content.push({
			outputPath: '/分类/无分类/index.vue',
			content: generateListPage(
				uncategorizedPages.map(element => toListItem(element)),
				'分类/无分类',
			),
		});
	}
};

export default main;
