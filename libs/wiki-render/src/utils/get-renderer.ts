import MarkdownIt from 'markdown-it';
import shiki from '@shikijs/markdown-it';
import { type ConsolaInstance } from 'consola';
import MarkdownItCJK from 'markdown-it-cjk-friendly';
import { ins as MarkdownItIns } from '@mdit/plugin-ins';
import { sub as MarkdownItSub } from '@mdit/plugin-sub';
import { sup as MarkdownItSup } from '@mdit/plugin-sup';
import { link as MarkdownItLink } from '../plugins/link';
import { code as MarkdownItCode } from '../plugins/code';
import { ruby as MarkdownItRuby } from '@mdit/plugin-ruby';
import { mark as MarkdownItMark } from '@mdit/plugin-mark';
import { anchor as MarkdownItAnchor } from '../plugins/anchor';
import { spoiler as MarkdownItSpoiler } from '@mdit/plugin-spoiler';
import { footnote as MarkdownItFootnote } from '@mdit/plugin-footnote';
import { tasklist as MarkdownItTasklist } from '@mdit/plugin-tasklist';
import { underline as MarkdownItUnderline } from '../plugins/underline';
import { html as MarkdownItHtml, type HtmlPluginOptions } from '../plugins/html';
import { image as MarkdownItImage, type imagePluginOptions } from '../plugins/image';
import { alert as MarkdownItAlert, type MarkdownItAlertOptions } from '@mdit/plugin-alert';
import { katex as MarkdownItKatex, type MarkdownItKatexOptions } from '@mdit/plugin-katex';

/**
 * 预热 Markdown 渲染器
 * @returns 渲染器实例
 */
async function getRenderer(logger: ConsolaInstance): Promise<MarkdownIt> {
	const markdownLogger = logger.withTag('markdown-it');

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
	md.use(MarkdownItImage, { logger: markdownLogger } satisfies imagePluginOptions); // 图片
	md.use(MarkdownItHtml, { logger: markdownLogger } satisfies HtmlPluginOptions); // HTML 处理
	md.use(MarkdownItAlert, { deep: true } satisfies MarkdownItAlertOptions); // 警报块

	// 数学公式
	const markdownItKatexLogger = markdownLogger.withTag('katex');
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

export { getRenderer };
