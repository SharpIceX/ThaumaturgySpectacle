import path from 'node:path';
import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import Logger from '../../logger';
import { projectPath } from '../../main';
import type { processorFunction } from '../main';

const Log = new Logger('Processor:InitMarkdownTime');

/**
 * 获取文件的创建时间（首次提交时间 或 当前时间）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getCreatedTime(filePath: string, cache: object): Promise<DateTime> {
	const commits = await git.log({
		fs,
		dir: projectPath,
		filepath: path.relative(projectPath, filePath),
		cache,
	});

	if (commits.length > 0) {
		const firstCommit = commits.at(-1);
		if (firstCommit?.commit?.author?.timestamp) {
			const timestamp = firstCommit.commit.author.timestamp;
			return DateTime.fromSeconds(timestamp);
		}
	}
	Log.warn(`文件 ${filePath} 没有提交记录或无法获取时间，使用当前时间作为创建时间`);
	return DateTime.now();
}

/**
 * 获取文件的最后更新时间（最近提交时间 或 当前时间）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getUpdatedTime(filePath: string, cache: object): Promise<DateTime> {
	// 检查文件是否有未提交的更改
	const status = await git.status({
		fs,
		dir: projectPath,
		filepath: path.relative(projectPath, filePath),
		cache,
	});
	if (status !== 'unmodified') {
		Log.warn(`文件 ${filePath} 有未提交的更改，使用当前时间作为更新时间`);
		return DateTime.now();
	}

	// 获取最近的提交记录
	const commits = await git.log({
		fs,
		dir: projectPath,
		filepath: path.relative(projectPath, filePath),
		cache,
	});
	if (commits.length > 0) {
		const latestCommit = commits[0];
		if (latestCommit?.commit?.author?.timestamp) {
			const timestamp = latestCommit.commit.author.timestamp;
			return DateTime.fromSeconds(timestamp);
		}
	}

	// 这行代码理论上不会被执行，因为上面已经检查过未提交更改的情况了。
	Log.error(`文件 ${filePath} 没有提交记录或无法获取时间，使用当前时间作为更新时间`);
	return DateTime.now();
}

const main: processorFunction = async content => {
	const cache = {};
	await Promise.all(
		content.map(async item => {
			if (item.inputPath && item.outputPath && item.outputPath.endsWith('.vue')) {
				if (!item.metadata) item.metadata = {};
				item.metadata.time = {
					created: await getCreatedTime(item.inputPath, cache),
					updated: await getUpdatedTime(item.inputPath, cache),
				};
			}
		}),
	);
};

export default main;
