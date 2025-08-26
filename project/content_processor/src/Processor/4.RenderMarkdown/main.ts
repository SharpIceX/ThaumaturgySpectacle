import yaml from 'yaml';
import Logger from '../../logger';
import type { processorFunction } from '../main';
import { Renderer } from '@ts-dotnet-packages/markdown-render';

const Log = new Logger('Processor:RenderMarkdown');

const main: processorFunction = async content => {
	const RemoveFileList = new Set<string>();

	await Promise.all(
		content.map(async item => {
			if (item.inputPath && item.outputPath && item.outputPath.endsWith('.md') && item.content) {
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
	if (RemoveFileList.size > 0) {
		content = content.filter(item => item.inputPath && !RemoveFileList.has(item.inputPath));
	}
};

export default main;
