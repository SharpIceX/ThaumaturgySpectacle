import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { useLogger } from '@nuxt/kit';
import { findNearestFile } from 'pkg-types';
import type { NuxtHooks } from '@nuxt/schema';
import { GitStatsService } from './utils/vcs';
import { storeContext } from '../../../context';
import AsyncTaskQueue from '@ts/shared/src/general/async-task-queue';

const logger = useLogger('@wiki-module').withTag('scan-metadata');

const metadataHook = async (rootDir: string): Promise<NuxtHooks['pages:resolved']> => {
	// 找到带有`.git`的目录
	const gitEntry = await findNearestFile('.git', { startingFrom: rootDir });
	if (!gitEntry) throw new Error('找不到 Git 存储库');

	const renderer = storeContext.renderer;
	const git = new GitStatsService(path.dirname(gitEntry), logger);

	const hook: NuxtHooks['pages:resolved'] = async (pages) => {
		// 筛出要处理的 md 文件
		const mdPages = pages.filter((page) => page.file?.endsWith('.md'));
		if (mdPages.length === 0) return;

		// 获取任务函数
		let currentIndex = 0;
		const getTask = async () => {
			if (currentIndex >= mdPages.length) return;
			const page = mdPages[currentIndex++];
			if (!page || !page.file) return;

			const filepath = page.file;
			return async () => {
				try {
					const content = await fs.readFile(filepath, 'utf8');

					const [renderResult, timestamps] = await Promise.all([
						renderer.render(content),
						git.getTimestamps(filepath),
					]);

					// 验证元数据
					if (!renderResult.data?.['title']) {
						throw new Error('缺少标题');
					}

					page.meta = {
						...page.meta,
						type: 'wiki',
						...renderResult.data,
						time: timestamps,
					};
				} catch (error) {
					logger.error(`无法处理文件: ${filepath}`, error);
				}
			};
		};

		const queue = new AsyncTaskQueue(os.cpus().length, getTask, undefined, (error) => logger.error(error));
		await queue.runAll();
	};

	return hook;
};

export default metadataHook;
