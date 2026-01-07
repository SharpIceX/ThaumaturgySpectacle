import { z } from 'zod';
import TOML from 'smol-toml';
import { parse } from './parse';
import { type RouteMeta } from 'vue-router';
import { FrontMatterSchema } from '@ts/wiki-render/src/zod/front-matter';
import splitFrontMatter from '@ts/wiki-render/src/utils/split-front-matter';

interface RenderResultType {
	html: string;
	data?: RouteMeta;
}

function renderNovel(content: string): RenderResultType {
	if (!content || content.trim() === '') throw new Error('输入内容不能为空');

	// 拆分和解析 Front Matter 和内容
	const split = splitFrontMatter(content);

	if (!split.tomlContent || split.tomlContent.trim() === '') throw new Error('Front Matter 内容不能为空');
	if (!split.bodyContent || split.bodyContent.trim() === '') throw new Error('小说正文内容不能为空');

	// Toml
	const rawTomlParse = TOML.parse(split.tomlContent);
	const validation = FrontMatterSchema.safeParse(rawTomlParse);

	// 校验
	if (!validation.success) {
		throw new Error(z.prettifyError(validation.error));
	}

	const data = validation.data;

	// 正文
	const novelResult = parse(split.bodyContent);

	return {
		data: {
			...data,
			wordCount: novelResult.wordCount,
		},
		html: `
<template>
    <NovelContainer>
        ${novelResult.html}
    </NovelContainer> 
</template>
<script lang="ts" setup>
import NovelContainer from "#content-module/novel/novel-container.vue";
</script>
`,
	};
}

export { renderNovel };
export type { RenderResultType };
