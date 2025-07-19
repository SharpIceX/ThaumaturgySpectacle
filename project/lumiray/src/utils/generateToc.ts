import { CheerioAPI } from 'cheerio';
import type { LumirayType } from '../main';

const generateToc = ($: CheerioAPI): LumirayType['toc'] => {
	const toc: LumirayType['toc'] = [];

	// 按顺序处理h1~h6
	$('h1, h2, h3, h4, h5, h6').each((_, element) => {
		// 获取现有内容
		const tagName = element.tagName.toLowerCase();
		const content = $(element).text().trim();

		// 生成追加内容
		const id = `${tagName}-${encodeURIComponent(content.toLowerCase().trim())}`;

		// 为原始元素添加id属性
		$(element).attr('id', id);

		// 记录目录信息
		toc.push({
			name: content,
			id: id,
		});
	});

	return toc;
};

export default generateToc;
