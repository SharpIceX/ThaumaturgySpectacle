import v8 from 'node:v8';
import crypto from 'node:crypto';
import process from 'node:process';
import MarkdownIt from 'markdown-it';
import { Buffer } from 'node:buffer';
import { open as lmdbOpen } from 'lmdb';
import shiki from '@shikijs/markdown-it';
import TOML, { type TomlTable } from 'smol-toml';
import MarkdownItCJK from 'markdown-it-cjk-friendly';
import { consola, type ConsolaInstance } from 'consola';
import { code as MarkdownItCode } from './plugins/code';
import { ins as MarkdownItIns } from '@mdit/plugin-ins';
import { sub as MarkdownItSub } from '@mdit/plugin-sub';
import { sup as MarkdownItSup } from '@mdit/plugin-sup';
import { link as MarkdownItLink } from './plugins/link';
import splitFrontMatter from './utils/split-front-matter';
import { ruby as MarkdownItRuby } from '@mdit/plugin-ruby';
import { mark as MarkdownItMark } from '@mdit/plugin-mark';
import { spoiler as MarkdownItSpoiler } from '@mdit/plugin-spoiler';
import { underline as MarkdownItUnderline } from './plugins/underline';
import { html as MarkdownItHtml, type HtmlPluginOptions } from './plugins/html';
import { anchor as MarkdownItAnchor, type AnchorEnvironment } from './plugins/anchor';
import { footnote as MarkdownItFootnote, type FootNoteEnv } from '@mdit/plugin-footnote';
import { tasklist as MarkdownItTasklist, type TaskListEnv } from '@mdit/plugin-tasklist';
import { alert as MarkdownItAlert, type MarkdownItAlertOptions } from '@mdit/plugin-alert';
import { katex as MarkdownItKatex, type MarkdownItKatexOptions } from '@mdit/plugin-katex';
import { image as MarkdownItImage, type ImageEnvironment, type imagePluginOptions } from './plugins/image';

interface RenderResultType {
	html: string;
	data?: TomlTable | undefined;
}

type MarkdownItEnvironment = TaskListEnv & FootNoteEnv & ImageEnvironment & AnchorEnvironment;

/**
 * 预热 Markdown 渲染器
 * @returns 已初始化的类
 */
async function getRenderer(logger: ConsolaInstance): Promise<MarkdownIt> {
	const md = new MarkdownIt({ html: true });
	md.use(MarkdownItCJK); // CJK 支持
	md.use(MarkdownItIns); // 插入文本
	md.use(MarkdownItSup); // 上标
	md.use(MarkdownItSub); // 下标
	md.use(MarkdownItMark); //  高亮文本
	md.use(MarkdownItCode); // 代码块
	md.use(MarkdownItRuby); // Ruby 字符支持
	md.use(MarkdownItLink); // 链接处理
	md.use(MarkdownItAnchor); // 锚点
	md.use(MarkdownItSpoiler); // 隐藏文本
	md.use(MarkdownItTasklist); // 任务列表
	md.use(MarkdownItFootnote); // 脚注
	md.use(MarkdownItUnderline); // 下划线
	md.use(await shiki({ theme: 'nord' })); // 语法高亮
	md.use(MarkdownItImage, { logger } satisfies imagePluginOptions); // 图片
	md.use(MarkdownItHtml, { logger } satisfies HtmlPluginOptions); // HTML 处理
	md.use(MarkdownItAlert, { deep: true } satisfies MarkdownItAlertOptions); // 警报块

	// 数学公式
	const markdownItKatexLogger = logger.withTag('katex');
	md.use(MarkdownItKatex, {
		strict: 'warn',
		output: 'htmlAndMathml',
		logger: (errorCode, errorMessage, token) => {
			const context = token?.text ? ` (at "${token.text}")` : '';
			const message = `${errorCode}: ${errorMessage}${context}`;
			const isCritical = ['unknownSymbol', 'newLineInDisplayMode'].includes(errorCode);

			if (isCritical) {
				markdownItKatexLogger.error(message);
			} else {
				markdownItKatexLogger.warn(message);
			}
			return false;
		},
	} satisfies MarkdownItKatexOptions);

	return md;
}

/**
 * Markdown 渲染器
 * @param markdownRender 已初始化的 MarkdownIt 实例
 * @param content Markdown 内容
 * @returns 渲染后的 Front Matter 和 HTML 文本
 */
async function renderMarkdown(markdownRender: MarkdownIt, content: string): Promise<RenderResultType> {
	// 拆分和解析 Front Matter 和内容
	const split = splitFrontMatter(content);

	// Toml
	const data = split.tomlContent ? TOML.parse(split.tomlContent) : undefined;

	// Markdown
	const environment: Partial<MarkdownItEnvironment> = {};
	const html = markdownRender.render(split.bodyContent, environment);

	const importContent: string[] = [];
	if (environment.image?.size) {
		for (const [key, value] of environment.image.entries()) {
			importContent.push(`import ${key} from "${value}";`);
		}
	}

	// 侧栏
	const asideTemplate = environment.tocHtml
		? `<template #aside>
            <WikiToc>${environment.tocHtml}</WikiToc>
        </template>`
		: '';

	return {
		data,
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
import WikiToc from "#wiki-module/wiki/toc.vue"
import MarkdownCode from "#wiki-module/markdown/code.vue";
import MarkdownImage from "#wiki-module/markdown/image.vue";
${importContent.join('\n')}
</script>
`,
	};
}

/**
 * 创建一个 Markdown 渲染器实例
 *
 * @param cachePath 缓存文件保存位置
 */
async function createRender(cachePath: string, logger?: ConsolaInstance) {
	const renderLogger = logger?.withTag('html') ?? consola.create({ level: 0 }).withTag('html');
	const loggerCache = renderLogger.withTag('cache');

	const MarkdwonItContext = await getRenderer(renderLogger);
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
		const result = await renderMarkdown(MarkdwonItContext, content);
		void cacheDatabase.put(magic, v8.serialize(result));
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
				loggerCache.log(`移除了 ${pruneCount} 条未使用的 Markdown 渲染缓存`);
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
