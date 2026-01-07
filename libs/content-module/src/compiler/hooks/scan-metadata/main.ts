import os from 'node:os';
import path from 'node:path';
import { findUp } from 'find-up';
import fs from 'node:fs/promises';
import { useLogger } from '@nuxt/kit';
import type { NuxtHooks } from '@nuxt/schema';
import { GitStatsService } from './utils/vcs';
import { storeContext } from '../../../context';
import AsyncTaskQueue from '@ts/shared/src/general/async-task-queue';

const logger = useLogger('@wiki-module').withTag('scan-metadata');

const metadataHook = async (rootDir: string): Promise<NuxtHooks['pages:resolved']> => {
	// 找到带有`.git`的目录
	const gitEntry = await findUp('.git', { type: 'directory', cwd: rootDir });
	if (!gitEntry) throw new Error('找不到 Git 存储库');

	const gitEntryDir = path.dirname(gitEntry);

	const git = new GitStatsService(gitEntryDir, logger);

	const hook: NuxtHooks['pages:resolved'] = async (pages) => {
		// 筛出要处理的相关文件
		const mdPages = pages.filter((page) => {
			const extension = page.file;
			return extension?.endsWith('.md') || extension?.endsWith('.book');
		});
		if (mdPages.length === 0) return;

		// 获取任务函数
		let currentIndex = 0;
		const getTask = async () => {
			if (currentIndex >= mdPages.length) return;
			const page = mdPages[currentIndex++];
			if (!page || !page.file) return;

			const filepath = page.file;
			const isWiki = filepath.endsWith('.md');
			return async () => {
				try {
					const content = await fs.readFile(filepath, 'utf8');

					const renderer = isWiki ? storeContext.WikiRenderer : storeContext.NovelRenderer;

					const [renderResult, timestamps] = await Promise.all([
						renderer.render(content),
						git.getTimestamps(path.relative(gitEntryDir, filepath)),
					]);

					page.meta = {
						...page.meta,
						...renderResult.data,
						time: timestamps,
						type: isWiki ? 'wiki' : 'novel',
					};
				} catch (error) {
					logger.error(`无法处理文件: ${filepath}\n`, error);
				}
			};
		};

		const queue = new AsyncTaskQueue(os.cpus().length, getTask, undefined, (error) => logger.error(error));
		await queue.runAll();
	};

	return hook;
};

export default metadataHook;
