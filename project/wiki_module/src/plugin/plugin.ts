import type { Plugin } from 'vite';
import { Renderer } from '../../../../dotnet-packages/MarkdownRender/dist/MarkdownRender';

const MarkdownTransformPlugin = (): Plugin => {
	return {
		name: 'markdown-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			// 忽略非 md 文件
			if (!new URL(id, 'file://').pathname.endsWith('.md')) return;

			const content = code.trim();

			if (!content || code.length === 0) this.error({ message: `不允许的操作：空 Markdown 文件`, id: id });

			// 剥离 Frontmatter（已在 Nuxt Hook 中处理）
			const newContent = content.replace(/^---[\s\S]+?---\s*/, '');
			if (newContent === content) {
				this.error({ message: 'Frontmatter 格式非法或未闭合', id });
			}

			// 渲染
			const HTML = Renderer.Render(newContent);

			if (!HTML) {
				this.error({ message: '渲染结果为空！', id });
			}

			return {
				code: `
<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<WikiMarkdownContentRenderer>${HTML}</WikiMarkdownContentRenderer>
		</template>
	</NuxtLayout>
</template>
`,
			};
		},
	};
};

export default MarkdownTransformPlugin;
