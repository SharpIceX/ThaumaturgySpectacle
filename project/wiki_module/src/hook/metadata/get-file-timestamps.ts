import path from 'node:path';
import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import { useLogger } from '@nuxt/kit';

const logger = useLogger('@ts/wiki_module');

interface FileGitInfo {
	createdAt: string;
	updatedAt: string;
}

/**
 * 获取文件的创建时间和最后更新时间
 * @param projectPath 项目根目录（git）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns 时间数组
 */
async function getFileTimestamps(projectPath: string, filePath: string, cache: object): Promise<FileGitInfo> {
	const relativePath = path.relative(projectPath, filePath);
	const now = DateTime.now().toFormat('yyyy年M月d日 H时m分s秒');

	// 默认返回值
	const result: FileGitInfo = {
		createdAt: now,
		updatedAt: now,
	};

	try {
		// 检查是否有未提交
		const status = await git.status({ fs, dir: projectPath, filepath: relativePath });

		// 获取所有提交
		const commits = await git.log({ fs, dir: projectPath, filepath: relativePath, cache });

		if (commits.length > 0) {
			// 最早的一次提交即为创建时间
			const firstCommit = commits.at(-1);
			if (firstCommit?.commit.author.timestamp) {
				result.createdAt = DateTime.fromSeconds(firstCommit.commit.author.timestamp).toFormat(
					'yyyy年M月d日 H时m分s秒',
				);
			}

			// 如果文件没有未提交的改动，则取最新的一次提交时间作为更新时间
			if (status === 'unmodified') {
				const latestCommit = commits[0];
				if (latestCommit?.commit.author.timestamp) {
					result.updatedAt = DateTime.fromSeconds(latestCommit.commit.author.timestamp).toFormat(
						'yyyy年M月d日 H时m分s秒',
					);
				}
			} else {
				logger.info(`文件 ${relativePath} 未提交，时间已设置为当前时间`);
			}
		}
	} catch (error) {
		logger.error(`读取 Git 时间戳失败 (${relativePath})，时间已设置为当前时间：\n`, error);
	}

	return result;
}

export default getFileTimestamps;
