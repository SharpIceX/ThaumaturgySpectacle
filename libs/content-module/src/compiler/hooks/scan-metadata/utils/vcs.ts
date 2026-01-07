import { DateTime } from 'luxon';
import git from 'isomorphic-git';
import fs from 'node:fs/promises';
import { type RouteMeta } from 'vue-router';
import { type ConsolaInstance } from 'consola';

/**
 * 获取文件的创建时间和最后更新时间
 * @param filePath - 文件绝对路径
 * @returns 时间数组
 */
class GitStatsService {
	private gitPath: string;
	private gitCache = {};
	private logger: ConsolaInstance;

	/**
	 * 初始化 git
	 * @param gitPath 包含`.git`的路径
	 * @param logger 日志处理器
	 */
	constructor(gitPath: string, logger: ConsolaInstance) {
		this.gitPath = gitPath;
		this.logger = logger.withTag('time');
	}

	/**
	 * 获取文件创建和最后更新时间
	 * @param fileRelativePath git 内文件相对路径
	 * @returns 创建和更新后时间
	 */
	public async getTimestamps(fileRelativePath: string): Promise<RouteMeta['time']> {
		const now = DateTime.now().toFormat('yyyy年M月d日 H时m分s秒');
		const result = {
			createdAt: now,
			updatedAt: now,
		};

		try {
			const status = await git.status({
				fs,
				dir: this.gitPath,
				cache: this.gitCache,
				filepath: fileRelativePath,
			});

			// absent: 未跟踪
			// added: 已暂存但未提交
			if (status === 'absent' || status === 'added') {
				return result;
			}

			const commits = await git.log({
				fs,
				follow: true,
				dir: this.gitPath,
				cache: this.gitCache,
				filepath: fileRelativePath,
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
				this.logger.warn(`文件“${fileRelativePath}”暂无 Git 提交记录`);
			} else {
				this.logger.error(`从 Git 读取文件“${fileRelativePath}”时间戳失败 :\n ${message}`);
			}
		}

		return result;
	}
}

export { GitStatsService };
