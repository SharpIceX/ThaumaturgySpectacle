import { Renderer } from '@ts-dotnet-packages/markdown-render';

interface TocContentType {
	id: string; // 生成的 ID
	name: string; // 标题文本
	level: 1 | 2 | 3 | 4 | 5; // 标题级别，对应 h2 到 h6
}

const generateTocMarkdown = (tocContent: TocContentType[]): string => {
	const counters: number[] = []; // 存每层计数

	return tocContent
		.map(({ id, name, level }: TocContentType) => {
			// 初始化并自增当前层计数
			counters[level - 1] = (counters[level - 1] || 0) + 1;

			// 重置更深层级计数器
			counters.length = level;

			const indent = '    '.repeat(level - 1); // 每层缩进 4 个空格
			const number = counters[level - 1]; // 当前层编号

			return `${indent}${number}. [${name}](#${id})`;
		})
		.join('\n');
};

const main = (document: Document): string | false => {
	const body = document.body;

	const tocContent: TocContentType[] = [...body.querySelectorAll('h2, h3, h4, h5, h6')].map(heading => {
		const id = encodeURIComponent(heading.textContent).toLowerCase();
		heading.id = id;

		const level = {
			h2: 1,
			h3: 2,
			h4: 3,
			h5: 4,
			h6: 5,
		}[heading.tagName.toLowerCase()] as 1 | 2 | 3 | 4 | 5;

		return {
			id,
			name: heading.textContent.trim(),
			level,
		};
	});

	// 构建 Markdown 格式目录
	const tocMarkdown = generateTocMarkdown(tocContent);

	// 如果目录为空，返回空字符串
	if (tocMarkdown.trim() === '') return false;

	// 渲染 Markdown 为 HTML
	const render = Renderer.Render(tocMarkdown, false);
	return render.html;
};

export default main;
