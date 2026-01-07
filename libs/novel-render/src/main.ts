import v8 from 'node:v8';
import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { open as lmdbOpen } from 'lmdb';
import { type ConsolaInstance } from 'consola';
import { type RenderResultType, renderNovel } from './render';

/**
 * 创建 Novel 渲染器实例
 * @param cachePath 缓存文件保存位置
 */
function createRender(cachePath: string, logger: ConsolaInstance) {
	const renderLogger = logger.withTag('novel-render');
	const loggerCache = renderLogger.withTag('cache');

	const cacheDatabase = lmdbOpen({
		cache: true,
		noSync: true,
		path: cachePath,
		compression: true,
		encoding: 'binary',
		strictAsyncOrder: false,
		sharedStructuresKey: Symbol.for('structures'),
	});

	/** 当前有使用的哈希，用于清理未使用的缓存 */
	const activeHashes = new Set<string>();

	/**
	 * 渲染 Novel
	 * @param content Novel 内容
	 * @returns 渲染后内容
	 */
	async function render(content: string): Promise<RenderResultType> {
		const magic = `${process.versions.node.split('.')[0]}-${content.length}-${crypto.createHash('sha1').update(content).digest('hex')}`;
		activeHashes.add(magic);

		// 尝试读取缓存
		const cachedBuffer = cacheDatabase.get(magic) as Buffer | undefined;
		if (cachedBuffer) {
			try {
				return v8.deserialize(cachedBuffer) as RenderResultType;
			} catch (error) {
				loggerCache.error('解析缓存错误', error);
			}
		}

		// 缓存未命中
		const result = renderNovel(content);

		cacheDatabase.put(magic, v8.serialize(result)).catch((error) => {
			loggerCache.error('写入缓存错误', error);
		});

		return result;
	}

	/** 关闭渲染器 */
	async function close() {
		try {
			let pruneCount = 0;

			// 去除未使用的缓存
			for (const key of cacheDatabase.getKeys({ snapshot: true })) {
				let hashHex: string;

				if (Buffer.isBuffer(key)) {
					hashHex = key.toString();
				} else if (typeof key === 'string') {
					hashHex = key;
				} else {
					continue;
				}

				if (!activeHashes.has(hashHex)) {
					await cacheDatabase.remove(key);
					pruneCount++;
				}
			}

			if (pruneCount > 0) {
				loggerCache.log(`移除了 ${pruneCount} 条未使用的 Novel 渲染缓存`);
			}

			await cacheDatabase.flushed;
			await cacheDatabase.close();
			activeHashes.clear();
		} catch (error) {
			loggerCache.error('关闭或清理数据库时出错', error);
		}
	}

	return Object.freeze({
		render,
		close,
	});
}

export { createRender };
export type { RenderResultType };
