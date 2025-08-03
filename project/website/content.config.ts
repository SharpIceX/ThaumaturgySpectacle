import path from 'node:path';
import { defineContentConfig, defineCollection } from '@nuxt/content';

export default defineContentConfig({
	collections: {
		wiki: defineCollection({
			type: 'page',
			source: {
				cwd: path.resolve(import.meta.dirname, '../content/content/wiki'),
				include: '**/*.md',
				// 排除开头为"_"的文件，因为它们是草稿
				exclude: ['_*.md'],
			},
		}),
	},
});
