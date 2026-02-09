import os from 'node:os';
import path from 'node:path';
import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import { storeContext } from '../../context';
import type { NuxtHooks } from '@nuxt/schema';
import { useNuxt, useLogger } from '@nuxt/kit';
import AsyncTaskQueue from '@ts/utils/src/general/async-task-queue';

const gitCache = {};
const logger = useLogger('@wiki_module/scanning-metadata');
const projectPath = path.resolve('../../');

/**
 * 获取文件的创建时间和最后更新时间
 * @param filePath - 文件绝对路径
 * @returns 时间数组
 */
async function getFileTimestamps(filePath: string): Promise<{
	createdAt: string;
	updatedAt: string;
}> {
	const relativePath = path.relative(projectPath, filePath);

	// 初始值：如果 Git 读取失败，则保持为当前时间
	const now = DateTime.now().toFormat('yyyy年M月d日 H时m分s秒');
	const result = {
		createdAt: now,
		updatedAt: now,
	};

	try {
		const status = await git.status({ fs, dir: projectPath, filepath: relativePath });

		// absent: 未跟踪
		// added: 已暂存但从未提交过
		if (status === 'absent' || status === 'added') {
			return result;
		}

		const commits = await git.log({
			fs,
			cache: gitCache,
			dir: projectPath,
			filepath: relativePath,
		});

		if (commits && commits.length > 0) {
			// 获取创建时间（最后一次提交记录）
			const firstCommit = commits.at(-1);
			if (firstCommit?.commit.author.timestamp) {
				result.createdAt = DateTime.fromSeconds(firstCommit.commit.author.timestamp).toFormat(
					'yyyy年M月d日 H时m分s秒',
				);
			}

			// 如果文件没有本地修改，则更新时间取自最新的 commit
			if (status === 'unmodified') {
				const latestCommit = commits[0];
				if (latestCommit?.commit.author.timestamp) {
					result.updatedAt = DateTime.fromSeconds(latestCommit.commit.author.timestamp).toFormat(
						'yyyy年M月d日 H时m分s秒',
					);
				}
			}
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);

		if (message.includes('Could not find file')) {
			logger.warn(`文件“${relativePath}”暂无 Git 提交记录`);
		} else {
			logger.error(`从 Git 读取文件“${relativePath}”时间戳失败 :\n ${message}`);
		}
	}

	return result;
}

const metadataHook: NuxtHooks['pages:resolved'] = async (pages) => {
	// 筛出要处理的 md 文件
	const mdPages = pages.filter((page) => page.file?.endsWith('.md'));
	if (mdPages.length === 0) return;

	const renderer = storeContext.renderer;

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
				if (!content.trim()) return;

				const [renderResult, timestamps] = await Promise.all([
					renderer.render(content),
					getFileTimestamps(filepath),
				]);

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

export default metadataHook;
