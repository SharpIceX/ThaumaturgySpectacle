import os from 'node:os';
import path from 'node:path';
import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import Logger from '../../logger';
import { projectPath } from '../../main';
import type { processorFunction } from '../main';
import AsyncTaskQueue from '@ts/utils/src/async-task-queue';
import type { GetTaskType } from '@ts/utils/src/async-task-queue';

const Log = new Logger('Processor:InitMarkdownTime');

/**
 * 获取文件的创建时间（首次提交时间 或 当前时间）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getCreatedTime(filePath: string, cache: object): Promise<DateTime> {
	const relativePath = path.relative(projectPath, filePath);

	try {
		const commits = await git.log({ fs, dir: projectPath, filepath: relativePath, cache });
		const firstCommit = commits.at(-1); // 获取最早的提交记录
		const timestamp = firstCommit?.commit?.author?.timestamp; // 提交时间戳
		if (timestamp) return DateTime.fromSeconds(timestamp);
	} catch (error) {
		Log.error(`获取文件 ${filePath} 创建时间时出现错误，将使用当前时间作为创建时间：\n${error}`);
		return DateTime.now();
	}

	Log.warn(`文件 ${filePath} 无最早提交记录或无法获取时间，将使用当前时间作为创建时间`);
	return DateTime.now();
}

/**
 * 获取文件的最后更新时间（最近提交时间 或 当前时间）
 * @param filePath - 文件绝对路径
 * @param cache - git log 缓存对象
 * @returns Luxon DateTime 对象
 */
async function getUpdatedTime(filePath: string, cache: object): Promise<DateTime> {
	const relativePath = path.relative(projectPath, filePath);

	// 检查是否有未提交的更改
	try {
		const status = await git.status({ fs, dir: projectPath, filepath: relativePath, cache });
		if (status !== 'unmodified') {
			Log.warn(`文件 ${filePath} 有未提交的更改，将使用当前时间作为更新时间`);
			return DateTime.now();
		}
	} catch (error) {
		Log.error(`检查文件 ${filePath} 状态时出错，将使用当前时间作为更新时间：\n${error}`);
		return DateTime.now();
	}

	try {
		const commits = await git.log({ fs, dir: projectPath, filepath: relativePath, cache });
		const latestCommit = commits[0];
		const timestamp = latestCommit?.commit?.author?.timestamp;
		if (timestamp) return DateTime.fromSeconds(timestamp);
	} catch (error) {
		Log.error(`获取文件 ${filePath} 更新时间时出现错误，将使用当前时间作为更新时间：\n${error}`);
		return DateTime.now();
	}

	Log.warn(`文件 ${filePath} 无最新提交记录或无法获取时间，将使用当前时间作为更新时间`);
	return DateTime.now();
}

const main: processorFunction = async (content) => {
	const cache = {};
	let index = 0;

	const getTask: GetTaskType = async () => {
		if (index >= content.length) return;
		const item = content[index++];

		return async () => {
			if (!(item?.inputPath && item.outputPath && item.outputPath.endsWith('.vue'))) return;
			if (!item.metadata) item.metadata = {}; // 初始化 metadata 对象

			item.metadata.time = {
				created: await getCreatedTime(item.inputPath, cache),
				updated: await getUpdatedTime(item.inputPath, cache),
			};
		};
	};

	const task = new AsyncTaskQueue(os.cpus().length, getTask);

	await task.runAll();
};

export default main;
