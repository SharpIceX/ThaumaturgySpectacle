import yaml from 'yaml';
import Logger from '../../logger';
import type { processorFunction } from '../main';
import contentRemove from '../../utils/content-remove';
import { Renderer } from '@ts-dotnet-packages/markdown-render';

const Log = new Logger('Processor:RenderMarkdown');

const main: processorFunction = async (content) => {
	const RemoveFileList = new Set<string>();

	await Promise.all(
		content.map(async (item) => {
			if (item.inputPath && item.outputPath && item.outputPath.endsWith('.vue') && item.content) {
				const renderResult = Renderer.Render(item.content, true);

				if (!renderResult.frontMatter) {
					Log.error(`文件 ${item.inputPath} 没有 Front Matter，将跳过渲染！`);
					RemoveFileList.add(item.inputPath);
					return;
				}

				item.content = renderResult.html;

				if (!item.metadata) item.metadata = {};
				item.metadata.frontMatter = yaml.parse(renderResult.frontMatter) || {};
				if (!item.metadata.frontMatter?.title) {
					Log.error(`文件 ${item.inputPath} 的 Front Matter 中缺少 title 字段，将跳过渲染！`);
					RemoveFileList.add(item.inputPath);
					return;
				}
			}
		}),
	);

	// 移除无法渲染的文件项
	contentRemove(content, RemoveFileList);
};

export default main;
