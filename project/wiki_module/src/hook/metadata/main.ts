import path from 'node:path';
import { useNuxt } from '@nuxt/kit';
import frontmatter from './frontmatter';
import type { NuxtPage } from '@nuxt/schema';
import { getCreatedTime, getUpdatedTime } from './time';

const metadataHook = async (pages: NuxtPage[]) => {
	const ProjectDirectory = path.resolve(useNuxt().options.rootDir, '../../');
	const git_cache = {};

	for (const page of pages) {
		// 忽略 md 以外的文件
		if (!page.path.endsWith('.md')) continue;

		page.meta = {
			...page.meta,
			...(await frontmatter(page.path)),
			created: await getCreatedTime(ProjectDirectory, page.path, git_cache),
			updated: await getUpdatedTime(ProjectDirectory, page.path, git_cache),
		};
	}
};

export default metadataHook;
