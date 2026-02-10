import MarkdownIt from 'markdown-it';
import { useLogger } from '@nuxt/kit';
import shiki from '@shikijs/markdown-it';
import TOML, { type TomlTable } from 'smol-toml';
import MarkdownItCJK from 'markdown-it-cjk-friendly';
import { html as MarkdownItHtml } from './plugins/html';
import { ins as MarkdownItIns } from '@mdit/plugin-ins';
import { sub as MarkdownItSub } from '@mdit/plugin-sub';
import { sup as MarkdownItSup } from '@mdit/plugin-sup';
import { ruby as MarkdownItRuby } from '@mdit/plugin-ruby';
import { mark as MarkdownItMark } from '@mdit/plugin-mark';
import { anchor as MarkdownItAnchor } from './plugins/anchor';
import { bundledLanguages, type BuiltinLanguage } from 'shiki';
import { spoiler as MarkdownItSpoiler } from '@mdit/plugin-spoiler';
import { underline as MarkdownItUnderline } from './plugins/underline';
import { image as MarkdownItImage, type ImageEnvironment } from './plugins/image';
import { footnote as MarkdownItFootnote, type FootNoteEnv } from '@mdit/plugin-footnote';
import { tasklist as MarkdownItTasklist, type TaskListEnv } from '@mdit/plugin-tasklist';
import { alert as MarkdownItAlert, type MarkdownItAlertOptions } from '@mdit/plugin-alert';
import { katex as MarkdownItKatex, type MarkdownItKatexOptions } from '@mdit/plugin-katex';

/**
 * 页面元数据
 */
interface WikiFrontMatter {
	/** 标题 */
	title?: string;

	/** 描述 */
	description?: string;

	/** 关键词 */
	keywords?: string | string[];

	/** 分类 */
	category?: string | string[];

	[key: string]: unknown;
}

/**
 * 最终渲染输出的结构
 */
interface WikiRenderResult {
	data: WikiFrontMatter;
	html: string;
}

/**
 * Markdown-it 环境变量
 */
type MarkdownItEnvironment = TaskListEnv & FootNoteEnv & ImageEnvironment;

/**
 * 分离 Markdown 中的 Front Matter 和 正文
 * @param content Markdown 内容
 * @returns 分离后的结果
 */
function frontMatterParse(content: string): { tomlContent: string; bodyContent: string } {
	/// 确保开头符合 Front Matter
	const firstLineMatch = content.match(/^\+\+\+[ \t]*\r?\n/);
	if (!firstLineMatch) {
		throw new Error('找不到 Front Matter');
	}

	/** 起始偏移量 */
	const startOffset = firstLineMatch[0].length;

	// 查找闭合
	const closeRegex = /\r?\n\+\+\+[ \t]*(?:\r?\n|$)/;
	const closeMatch = content.slice(startOffset).match(closeRegex);

	if (!closeMatch || closeMatch.index === undefined) {
		throw new Error('找不到 Front Matter 的闭合标签');
	}

	/** 闭合偏移量 */
	const closeIndexInside = closeMatch.index;

	// 提取内容
	const tomlContent = content.slice(startOffset, startOffset + closeIndexInside).trim();
	const bodyContent = content.slice(startOffset + closeIndexInside + closeMatch[0].length);

	return { tomlContent, bodyContent };
}

let mdInstance: MarkdownIt | undefined;

/**
 * 预热 Markdown 渲染器
 * @returns 已初始化的类
 */
async function getRenderer(): Promise<MarkdownIt> {
	// 已初始化就直接返回
	if (mdInstance) return mdInstance;

	const md = new MarkdownIt({
		html: true,
	});

	// HTML 处理
	md.use(MarkdownItHtml);

	// CJK 支持
	md.use(MarkdownItCJK);

	// 锚点
	md.use(MarkdownItAnchor);

	// 图片
	md.use(MarkdownItImage);

	// 下划线
	md.use(MarkdownItUnderline);

	// 插入文本
	md.use(MarkdownItIns);

	//  高亮文本
	md.use(MarkdownItMark);

	// 上标
	md.use(MarkdownItSup);

	// 下标
	md.use(MarkdownItSub);

	// 隐藏文本
	md.use(MarkdownItSpoiler);

	// Ruby 字符支持
	md.use(MarkdownItRuby);

	// 任务列表
	md.use(MarkdownItTasklist);

	// 脚注
	md.use(MarkdownItFootnote);

	// 警报块
	md.use(MarkdownItAlert, {
		deep: true,
	} satisfies MarkdownItAlertOptions);

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

	// 语法高亮
	md.use(
		await shiki({
			theme: 'nord',
			langs: Object.keys(bundledLanguages) as BuiltinLanguage[],
		}),
	);

	mdInstance = md;
	return mdInstance;
}

/**
 * 校验 Front Matter 元数据合法性
 * @param data Front Matter 数据
 */
function validateFrontMatter(data: TomlTable) {
	// 校验是否符合 Array<string>
	const validateStringArray = (field: string) => {
		const value = data[field];
		if (value !== undefined) {
			if (!Array.isArray(value)) {
				throw new TypeError(`Front Matter 错误：${field} 必须是一个数组！`);
			}
			if (!value.every((item) => typeof item === 'string')) {
				throw new TypeError(`Front Matter 错误：${field} 数组内的每一项都必须是字符串！`);
			}
		}
	};

	if (!data) {
		throw new Error('Front Matter 不能为空');
	}

	// 标题
	if (!data['title']) {
		throw new Error('Front Matter 标题为空！');
	}
	if (typeof data['title'] !== 'string') {
		throw new TypeError('当前 Front Matter 内的 title 非字符串');
	}

	// 描述
	if (data['description'] !== undefined && typeof data['description'] !== 'string') {
		throw new TypeError('当前 Front Matter 内的 description 字符串');
	}

	// 类型
	if (data['type'] !== undefined && !['wiki', 'novel'].includes(String(data['type']))) {
		throw new TypeError('当前 Front Matter 内的 type 无效');
	}

	validateStringArray('keywords'); // 关键词
	validateStringArray('category'); // 分类
}

/**
 * Markdown 渲染器
 * @param content Markdown 内容
 * @returns 渲染后的 Front Matter 和 HTML 文本
 */
async function render(content: string): Promise<WikiRenderResult> {
	// 处理 Front Matter
	const result = frontMatterParse(content);

	// 解析 Front Matter(toml)
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

	return {
		data,
		html: `
<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<div class="wiki-content">${html}</div>
		</template>
	</NuxtLayout>
</template>
<script lang="ts" setup>
import Image from "#wiki_module/markdown/image.vue";
${importContent.join('\n')}
</script>
`,
	};
}

export { render, getRenderer };
export type { WikiFrontMatter, WikiRenderResult };
