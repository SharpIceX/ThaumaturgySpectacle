// 禁用 ESLint 规则 @typescript-eslint/no-non-null-assertion 备注： 上游已经做了非空断言检查，这里不需要重复检查。
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import path from 'node:path/posix';
import type { contentType } from '../content';
import type { ListDataType } from './generate-list-page';

/**
 * 构建页面列表数据项
 * @param page - 页面数据
 * @returns 返回列表数据项
 */
const toListItem = (page: contentType): ListDataType => {
	// NOTE: 不保留后缀`.vue`
	let pagePath = '';
	const dirname = path.dirname(page.outputPath!);
	const basename = path.basename(page.outputPath!, path.extname(page.outputPath!));

	// 处理首页路径
	// 如果是 `index` 则表示为目录首页，路径为 `/dirname/`
	// 否则表示为普通页面，路径为 `/dirname/basename`
	pagePath = basename === 'index' ? path.join('/', dirname) : path.join('/', dirname, basename);

	return {
		url: pagePath,
		title: page.metadata!.frontMatter!.title,
	};
};

export default toListItem;
