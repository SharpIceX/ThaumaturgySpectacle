import { unified } from 'unified';
import type { Plugin } from 'vite';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';

const processor = unified()
	.use(remarkParse) // 核心
	.use(remarkGfm) // 脚注、表格、任务列表、GFM 警报
	.use(remarkMath); // 数学公式

const MarkdownTransformPlugin = (): Plugin => {
	return {
		name: 'markdown-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			// 忽略非 md 文件
			if (!new URL(id, 'file://').pathname.endsWith('.md')) return;

			let content = code.trim();

			if (!content || code.length === 0) this.error({ message: `不允许的操作：空 Markdown 文件`, id: id });

			// 剥离 Frontmatter（已在 Nuxt Hook 中处理）
			const newContent = content.replace(/^---[\s\S]+?---\s*/, '');
			if (newContent === content) {
				this.error({ message: 'Frontmatter 格式非法或未闭合', id });
			}
			content = newContent;

			const ast = JSON.stringify(processor.parse(content));

			return {
				code: `
<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<WikiMarkdownAstRenderer :ast="ast" />
		</template>
	</NuxtLayout>
</template>

<script setup>
const ast=${ast}
</script>
`,
			};
		},
	};
};

export default MarkdownTransformPlugin;
