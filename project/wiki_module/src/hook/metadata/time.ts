import path from 'node:path';
import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import { useLogger } from '@nuxt/kit';

const logger = useLogger('@ts/wiki_module');

/**
 * 获取文件的创建时间（首次提交时间 或 当前时间）
 * @param projectPath 项目根目录（git）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getCreatedTime(projectPath: string, filePath: string, cache: object): Promise<DateTime> {
	const relativePath = path.relative(projectPath, filePath);

	try {
		// 获取最早提交
		const commits = await git.log({ fs, dir: projectPath, filepath: relativePath, cache });

		// 获取提交时间
		const timestamp = commits.at(-1)?.commit?.author?.timestamp;
		if (timestamp) return DateTime.fromSeconds(timestamp);
	} catch (error) {
		logger.error(`获取文件 ${filePath} 创建时间失败: \n${error instanceof Error ? error.message : error}`);
	}

	// 兜底
	return DateTime.now();
}

/**
 * 获取文件的最后更新时间（最近提交时间 或 当前时间）
 * @param projectPath 项目根目录（git）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getUpdatedTime(projectPath: string, filePath: string, cache: object): Promise<DateTime> {
	const relativePath = path.relative(projectPath, filePath);

	try {
		// 有未提交记录直接直接返回当前时间
		const status = await git.status({ fs, dir: projectPath, filepath: relativePath, cache });
		if (status !== 'unmodified') {
			logger.warn(`文件 ${filePath} 有未提交记录，将使用当前时间！`);
			return DateTime.now();
		}

		// 获取最新提交
		const commits = await git.log({ fs, dir: projectPath, filepath: relativePath, depth: 1, cache });

		// 获取提交时间
		const timestamp = commits[0]?.commit?.author?.timestamp;
		if (timestamp) return DateTime.fromSeconds(timestamp);
	} catch (error) {
		logger.error(`获取文件 ${filePath} 更新时间出错：${error instanceof Error ? error.message : error}`);
	}

	// 兜底：出错或无提交记录返回当前时间
	return DateTime.now();
}

export { getCreatedTime, getUpdatedTime };
