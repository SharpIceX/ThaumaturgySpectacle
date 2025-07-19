import { parse as yamlParse } from 'yaml';
import type { LumirayType } from '../main';
import { Renderer } from '@ts-dotnet-packages/markdown-render';

interface ResultType {
	html: string;
	metadata: LumirayType['data'];
}

export default (markdown: string): ResultType => {
	const mdr = Renderer.Render(markdown);

	return {
		html: mdr.html,
		metadata: yamlParse(mdr.metadata),
	};
};
