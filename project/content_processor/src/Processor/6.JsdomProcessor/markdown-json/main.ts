import Logger from '../../../logger';
import { subProcessorFunction } from '../main';
import type { Schema as WikiSchema } from '@ts/schema/types/wiki.d.ts';

import InfoBoxProcessor from './processor/infobox';

type ProcessorMap = {
	[K in keyof WikiSchema]?: (document: Document, data: WikiSchema[K]) => void;
};

const processorMap: ProcessorMap = {
	InfoBox: (document, data) => InfoBoxProcessor(document, data),
};

const Log = new Logger('Processor:JsdomProcessor:MarkdownJson');

const main: subProcessorFunction = (document, data) => {
	const json = data.metadata?.json as Partial<Record<keyof WikiSchema, unknown>>;
	if (!json || Object.keys(json).length === 0) return;

	for (const key of Object.keys(json) as (keyof WikiSchema)[]) {
		const processor = processorMap[key];
		const value = json[key];
		if (processor && value !== undefined) {
			processor(document, value as WikiSchema[typeof key]);
		} else {
			Log.warn(`未知的 Markdown JSON 处理器: ${String(key)}`);
		}
	}
};

export default main;
