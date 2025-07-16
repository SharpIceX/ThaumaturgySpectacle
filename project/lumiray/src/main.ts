import markdownRender from './render/markdownRender';
import lumirayProcess from './render/lumirayProcess';

export interface LumirayType {
	vue: string;
	toc: {
		name: string;
		id: string;
	}[];
	data: {
		title: string;
		description?: string | undefined;
		keywords?: string | undefined;
	};
}

export const render = (markdown: string): LumirayType => {
	const result: LumirayType = {
		vue: '',
		toc: [],
		data: {
			title: '',
			description: undefined,
			keywords: undefined,
		},
	};

	// 调用 markdownRender 将 Markdown 渲染为 HTML
	const markdownRenderResult = markdownRender(markdown);

	// 检查渲染结果
	if (!markdownRenderResult.html) throw new Error(`渲染 ${markdown} 时未生成 HTML！`);
	if (!markdownRenderResult.metadata) throw new Error(`渲染 ${markdown} 时未生成 Front Matter 元数据！`);

	// 写入 data
	const { title, description, keywords } = markdownRenderResult.metadata;
	if (!title) {
		throw new Error(`${markdown} 缺失 Front Matter 元数据 title`);
	}
	result.data = { title, description, keywords };

	// 调用 lumiray处理器进行最后阶段的处理
	const lumirayProcessResult = lumirayProcess(markdownRenderResult.html);

	result.vue = lumirayProcessResult.vue;
	result.toc = lumirayProcessResult.toc;

	return result;
};
