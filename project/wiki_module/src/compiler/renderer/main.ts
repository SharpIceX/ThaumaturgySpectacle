import v8 from 'node:v8';
import crypto from 'node:crypto';
import { useLogger } from '@nuxt/kit';
import { render, type WikiRenderResult } from './markdown';
import { open as lmdbOpen, type RootDatabase } from 'lmdb';

const logger = useLogger('@ts/wiki_module:markdown-render/cache');

class Renderer {
	private isClosed = false;
	private readonly cacheDatabase: RootDatabase;

	/** 当前有使用的哈希，用于清理缓存数据库 */
	private readonly activeHashes = new Set<string>();

	constructor(cachePath: string) {
		this.cacheDatabase = lmdbOpen({
			cache: true,
			noSync: true,
			path: cachePath,
			compression: true,
			encoding: 'binary',
			strictAsyncOrder: false,
			sharedStructuresKey: Symbol.for('structures'),
		});
	}

	/**
	 * 渲染 Markdown
	 * @param content Markdown 内容
	 * @returns 渲染后内容
	 */
	public async render(content: string): Promise<WikiRenderResult> {
		const hash = crypto.createHash('md5').update(content).digest('hex');
		this.activeHashes.add(hash);

		if (this.isClosed) {
			logger.fail('缓存数据库被关闭！');
		} else {
			// 读取缓存
			const cachedBuffer = this.cacheDatabase.get(hash);
			if (cachedBuffer) {
				try {
					return v8.deserialize(cachedBuffer) as WikiRenderResult;
				} catch (error) {
					logger.error(`解析缓存错误：\n${error}`);
				}
			}
		}

		// 缓存未命中、缓存错误或缓存数据库被关闭
		const result = await render(content);
		if (!this.isClosed) this.cacheDatabase.put(hash, v8.serialize(result));
		return result;
	}

	/** 关闭渲染器 */
	public async close() {
		this.isClosed = true;

		try {
			let pruneCount = 0;

			// 去除未使用的缓存
			for (const key of this.cacheDatabase.getKeys({ snapshot: true })) {
				let hashHex: string;

				if (Buffer.isBuffer(key)) {
					hashHex = key.toString('hex');
				} else if (typeof key === 'string') {
					hashHex = key;
				} else {
					continue;
				}

				if (!this.activeHashes.has(hashHex)) {
					await this.cacheDatabase.remove(key);
					pruneCount++;
				}
			}

			if (pruneCount > 0) {
				logger.log(`移除了 ${pruneCount} 条未使用的 Markdown 渲染缓存`);
			}

			await this.cacheDatabase.flushed;
			await this.cacheDatabase.close();
			this.activeHashes.clear();
		} catch (error) {
			logger.error('关闭或清理数据库时出错:', error);
		}
	}
}

export { Renderer };
