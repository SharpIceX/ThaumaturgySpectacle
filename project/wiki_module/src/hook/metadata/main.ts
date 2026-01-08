import path from 'node:path';
import { useNuxt } from '@nuxt/kit';
import type { NuxtPage } from '@nuxt/schema';
import frontmatterParse from './frontmatter-parse';
import getFileTimestamps from './get-file-timestamps';

const metadataHook = async (pages: NuxtPage[]) => {
	const ProjectDirectory = path.resolve(useNuxt().options.rootDir, '../../');
	const git_cache = {};

	for (const page of pages) {
		const filepath = page.file as string;

		// 忽略 md 以外的文件
		if (!filepath.endsWith('.md')) continue;

		const frontmatter = await frontmatterParse(filepath);
		const timestamps = await getFileTimestamps(ProjectDirectory, filepath, git_cache);

		page.meta = {
			...page.meta,
			...frontmatter,
			time: timestamps,
		};
	}
};

export default metadataHook;
