import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import Renderer from '../renderer/renderer';

const MarkdownTransformPlugin = (): Plugin => {
	return {
		name: 'markdown-transform-plugin',
		enforce: 'pre',
		async transform(code, id) {
			// 忽略非 adoc 文件
			if (!new URL(id, 'file://').pathname.endsWith('.adoc')) return;

			const content = code.trim();

			if (!content || code.length === 0) this.error({ message: `不允许的操作：空 sciiDoc 文件`, id: id });

			const renderResult = await Renderer(code);

			fs.writeFile(
				'/media/project/ThaumaturgySpectacle/project/website/a.json',
				JSON.stringify(renderResult.metadata, undefined, 4),
				'utf8',
			);
			fs.writeFile('/media/project/ThaumaturgySpectacle/project/website/a.html', renderResult.html, 'utf8');

			return {
				code: `
<template>
	<NuxtLayout name="wiki-container">
		<template #default>
			<div>
				<div>${renderResult.html}</div>
			</div>
		</template>
	</NuxtLayout>
</template>
`,
			};
		},
	};
};

export default MarkdownTransformPlugin;
