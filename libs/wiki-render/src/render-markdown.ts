import { z } from 'zod';
import TOML from 'smol-toml';
import MarkdownIt from 'markdown-it';
import { InfoBoxParse } from './utils/infobox-parse';
import { FrontMatterSchema } from './zod/front-matter';
import { type ImageEnvironment } from './plugins/image';
import { type TaskListEnv } from '@mdit/plugin-tasklist';
import { type FootNoteEnv } from '@mdit/plugin-footnote';
import splitFrontMatter from './utils/split-front-matter';
import { type AnchorEnvironment } from './plugins/anchor';

interface RenderResultType {
	html: string;
	data?: z.infer<typeof FrontMatterSchema>;
}

type MarkdownItEnvironment = TaskListEnv & FootNoteEnv & ImageEnvironment & AnchorEnvironment;

/**
 * Markdown 渲染器
 * @param markdownRender 已初始化的 MarkdownIt 实例
 * @param content Markdown 内容
 * @returns 渲染后的 Front Matter 和 HTML 文本
 */
async function renderMarkdown(markdownRender: MarkdownIt, content: string): Promise<RenderResultType> {
	if (!content || content.trim() === '') throw new Error('输入内容不能为空');

	// 拆分和解析 Front Matter 和内容
	const split = splitFrontMatter(content);

	if (!split.tomlContent || split.tomlContent.trim() === '') throw new Error('Front Matter 内容不能为空');
	if (!split.bodyContent || split.bodyContent.trim() === '') throw new Error('Markdown 正文内容不能为空');

	// Toml
	const rawTomlParse = TOML.parse(split.tomlContent);
	const validation = FrontMatterSchema.safeParse(rawTomlParse);

	// 校验
	if (!validation.success) {
		throw new Error(z.prettifyError(validation.error));
	}

	const data = validation.data;

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
		? `
<template #aside>
    <WikiToc>${environment.tocHtml}</WikiToc>
</template>`
		: '';

	return {
		data,
		html: `
<template>
    <WikiContainer>
        <template #default>
            <div ref="contentBody" class="wiki-content">
				${data.InfoBox ? InfoBoxParse(data.InfoBox) : ''}
				${html}
			</div>
        </template>
        ${asideTemplate}
    </WikiContainer>
</template>
<script lang="ts" setup>
import { ref, provide } from 'vue';
import WikiToc from "#content-module/wiki/components/toc.vue";
import WikiContainer from "#content-module/wiki/wiki-container.vue";
import WikiMarkdownCode from "#content-module/wiki/markdown/code.vue";
import WIkiMarkdownImage from "#content-module/wiki/markdown/image.vue";
${importContent.join('\n')}

const contentBody = ref<HTMLElement>();
provide('wikiContentRef', contentBody);
</script>
`,
	};
}

export { renderMarkdown };
export type { RenderResultType };
