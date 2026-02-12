import v8 from 'node:v8';
import TOML from 'smol-toml';
import crypto from 'node:crypto';
import process from 'node:process';
import MarkdownIt from 'markdown-it';
import { useLogger } from '@nuxt/kit';
import { open as lmdbOpen } from 'lmdb';
import shiki from '@shikijs/markdown-it';
import { type RouteMeta } from '#vue-router';
import MarkdownItCJK from 'markdown-it-cjk-friendly';
import { code as MarkdownItCode } from './plugins/code';
import { html as MarkdownItHtml } from './plugins/html';
import { ins as MarkdownItIns } from '@mdit/plugin-ins';
import { sub as MarkdownItSub } from '@mdit/plugin-sub';
import { sup as MarkdownItSup } from '@mdit/plugin-sup';
import { ruby as MarkdownItRuby } from '@mdit/plugin-ruby';
import { mark as MarkdownItMark } from '@mdit/plugin-mark';
import { frontMatterParse, validateFrontMatter } from './utils';
import { spoiler as MarkdownItSpoiler } from '@mdit/plugin-spoiler';
import { underline as MarkdownItUnderline } from './plugins/underline';
import { image as MarkdownItImage, type ImageEnvironment } from './plugins/image';
import { anchor as MarkdownItAnchor, type AnchorEnvironment } from './plugins/anchor';
import { footnote as MarkdownItFootnote, type FootNoteEnv } from '@mdit/plugin-footnote';
import { tasklist as MarkdownItTasklist, type TaskListEnv } from '@mdit/plugin-tasklist';
import { alert as MarkdownItAlert, type MarkdownItAlertOptions } from '@mdit/plugin-alert';
import { katex as MarkdownItKatex, type MarkdownItKatexOptions } from '@mdit/plugin-katex';

interface WikiRenderResult {
	html: string;
	data: RouteMeta;
}

type MarkdownItEnvironment = TaskListEnv & FootNoteEnv & ImageEnvironment & AnchorEnvironment;
let mdInstance: MarkdownIt | undefined;

/**
 * 预热 Markdown 渲染器
 * @returns 已初始化的类
 */
async function getRenderer(): Promise<MarkdownIt> {
	// 已初始化就直接返回
	if (mdInstance) return mdInstance;

	const md = new MarkdownIt({ html: true });
	md.use(MarkdownItCJK); // CJK 支持
	md.use(MarkdownItIns); // 插入文本
	md.use(MarkdownItSup); // 上标
	md.use(MarkdownItSub); // 下标
	md.use(MarkdownItMark); //  高亮文本
	md.use(MarkdownItCode); // 代码块
	md.use(MarkdownItHtml); // HTML 处理
	md.use(MarkdownItRuby); // Ruby 字符支持
	md.use(MarkdownItImage); // 图片
	md.use(MarkdownItAnchor); // 锚点
	md.use(MarkdownItSpoiler); // 隐藏文本
	md.use(MarkdownItTasklist); // 任务列表
	md.use(MarkdownItFootnote); // 脚注
	md.use(MarkdownItUnderline); // 下划线
	md.use(await shiki({ theme: 'nord' })); // 语法高亮
	md.use(MarkdownItAlert, { deep: true } satisfies MarkdownItAlertOptions); // 警报块

	// 数学公式
	const markdownItKatexLogger = useLogger('@ts/wiki_module:markdown-it/katex');
	md.use(MarkdownItKatex, {
		strict: 'warn',
		output: 'htmlAndMathml',
		logger: (errorCode, errorMessage, token) => {
			const context = token?.text ? ` (at "${token.text}")` : '';
			const message = `${errorCode}: ${errorMessage}${context}`;

			if (errorCode === 'unknownSymbol' || errorCode === 'newLineInDisplayMode') {
				markdownItKatexLogger.error(message);
			} else {
				markdownItKatexLogger.warn(message);
			}
			return false;
		},
	} satisfies MarkdownItKatexOptions);

	mdInstance = md;
	return mdInstance;
}

/**
 * Markdown 渲染器
 * @param content Markdown 内容
 * @returns 渲染后的 Front Matter 和 HTML 文本
 */
async function renderMarkdown(content: string): Promise<WikiRenderResult> {
	// 拆分和解析 Front Matter
	const result = frontMatterParse(content);
	const data = TOML.parse(result.tomlContent);

	// 校验
	validateFrontMatter(data);

	const environment: Partial<MarkdownItEnvironment> = {};

	const md = await getRenderer();
	const html = md.render(result.bodyContent, environment);

	const importContent: string[] = [];
	if (environment.image?.size) {
		for (const [key, value] of environment.image.entries()) {
			importContent.push(`import ${key} from "${value}";`);
		}
	}

	// 侧栏
	const asideTemplate = environment.toc
		? `<template #aside>
            <WikiToc>${environment.toc}</WikiToc>
        </template>`
		: '';

	return {
		data: data as RouteMeta,
		html: `
<template>
	<NuxtLayout name="wiki-container">
		<template #default="{ contentRef }">
			<div class="wiki-content" :ref="contentRef">${html}</div>
		</template>
		${asideTemplate}
	</NuxtLayout>
</template>
<script lang="ts" setup>
import WikiToc from "#wiki_module/wiki/toc.vue"
import MarkdownCode from "#wiki_module/markdown/code.vue";
import MarkdownImage from "#wiki_module/markdown/image.vue";
${importContent.join('\n')}
</script>
`,
	};
}

const logger = useLogger('@ts/wiki_module:markdown-render/cache');

/**
 * 创建一个 Markdown 渲染器实例
 *
 * @param cachePath 缓存文件保存位置
 */
async function createRender(cachePath: string) {
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
	 * 渲染 Markdown
	 * @param content Markdown 内容
	 * @returns 渲染后内容
	 */
	async function render(content: string): Promise<WikiRenderResult> {
		const magic =
			process.versions.node.split('.')[0] + // Node 主版本
			'-' +
			content.length + // 原始内容大小
			'-' +
			crypto.createHash('sha1').update(content).digest('hex'); // 原始内容哈希
		activeHashes.add(magic);

		// 尝试读取缓存
		const cachedBuffer = cacheDatabase.get(magic);
		if (cachedBuffer) {
			try {
				return v8.deserialize(cachedBuffer) as WikiRenderResult;
			} catch (error) {
				logger.error(`解析缓存错误：\n${error}`);
			}
		}

		// 缓存未命中
		const result = await renderMarkdown(content);
		cacheDatabase.put(magic, v8.serialize(result));
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
					hashHex = key.toString('hex');
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
				logger.log(`移除了 ${pruneCount} 条未使用的 Markdown 渲染缓存`);
			}

			await cacheDatabase.flushed;
			await cacheDatabase.close();
			activeHashes.clear();
		} catch (error) {
			logger.error('关闭或清理数据库时出错:', error);
		}
	}

	// 预热渲染器
	await getRenderer();

	return Object.freeze({
		render,
		close,
	});
}

export { createRender };
export type { WikiRenderResult };
