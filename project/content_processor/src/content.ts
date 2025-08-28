import type { DateTime } from 'luxon';
import type { Schema as wikiSchema } from '@ts/schema/types/wiki.d.ts';

export interface contentType {
	/** 原始文件的路径 */
	inputPath?: string;

	/** 文件输出路径（相对路径） */
	outputPath: string;

	/** 内容 */
	content?: string;

	/* 强制复制到 pages 目录 */
	forceCopyToPages?: boolean;

	/** 元数据 */
	metadata?: {
		toc?: string;
		json?: wikiSchema;
		time?: {
			created: DateTime;
			updated: DateTime;
		};
		frontMatter?: {
			title: string;
			description?: string;
			category?: string | string[];
		};
	};
}
