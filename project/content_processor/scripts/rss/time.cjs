'use strict';

const fs = require('node:fs');
const path = require('node:path');
const git = require('isomorphic-git');

const gitPath = path.resolve(hexo.base_dir, '../../');

/**
 * 获取文件的创建时间（首次提交时间 或 当前时间）
 * @param {string} filePath - 文件绝对路径
 * @returns {Promise<string>} - RFC 822 格式时间
 */
async function getCreatedTime(filePath) {
	if (!fs.existsSync(filePath)) throw new Error(`找不到文件：${filePath}`);

	const commits = await git.log({
		fs,
		dir: gitPath,
		filepath: path.relative(gitPath, filePath),
	});

	if (commits.length > 0) {
		const firstCommit = commits.at(-1);
		const timestamp = firstCommit.commit.author.timestamp;
		return new Date(timestamp * 1000).toUTCString(); // RFC 822 格式
	} else {
		return new Date().toUTCString();
	}
}

/**
 * 获取文件的最后更新时间（最近提交时间 或 当前时间）
 * @param {string} filePath - 文件绝对路径
 * @returns {Promise<string>} - RFC 822 格式时间
 */
async function getUpdatedTime(filePath) {
	if (!fs.existsSync(filePath)) throw new Error(`找不到文件：${filePath}`);

	// 判断此文件是否已经提交，有新内容没提交就返回当前时间
	const status = await git.status({
		fs,
		dir: gitPath,
		filepath: path.relative(gitPath, filePath),
	});
	if (status !== 'unmodified') {
		return new Date().toUTCString();
	}

	const commits = await git.log({
		fs,
		dir: gitPath,
		filepath: path.relative(gitPath, filePath),
	});

	if (commits.length > 0) {
		const latestCommit = commits[0];
		const timestamp = latestCommit.commit.author.timestamp;
		return new Date(timestamp * 1000).toUTCString(); // RFC 822 格式
	} else {
		return new Date().toUTCString();
	}
}

hexo.extend.filter.register(
	'before_generate',
	/**
	 *
	 * @param {Array<import("hexo/dist/types").PageSchemaExtra>[]} data - 页面数据
	 */
	async function (data) {
		for (const data_item of data) {
			// 排除为空
			if (data_item.length <= 0) continue;

			for (const item of data_item) {
				const createdTime = await getCreatedTime(item.full_source);
				const updatedTime = await getUpdatedTime(item.full_source);

				item.extra = {
					created_at: createdTime,
					updated_at: updatedTime,
				};
			}
		}
	},
);
