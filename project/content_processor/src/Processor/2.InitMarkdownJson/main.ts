import Ajv from 'ajv';
import path from 'node:path';
import fs from 'node:fs/promises';
import Logger from '../../logger';
import type { processorFunction } from '../main';
import wikiJsonSchema from '@ts/schema/dist/wiki.json';
import contentRemove from '../../utils/content-remove';
import type { Schema as WikiSchema } from '@ts/schema/types/wiki.d.ts';

const Log = new Logger('Processor:InitMarkdownData');

const exists = async (filepath: string) => {
	try {
		await fs.access(filepath);
		return true;
	} catch {
		return false;
	}
};

const main: processorFunction = async (content) => {
	const RemoveFileList = new Set<string>();

	await Promise.all(
		content.map(async (item) => {
			if (item.inputPath && item.outputPath && item.outputPath.endsWith('.vue')) {
				const dirname = path.dirname(item.inputPath);
				const basename = path.basename(item.inputPath, path.extname(item.inputPath));
				const jsonFilePath = path.join(dirname, `${basename}.json`);

				// 不存在则跳过
				if (!(await exists(jsonFilePath))) return;
				RemoveFileList.add(jsonFilePath);

				// 读取 JSON 文件内容
				let jsonContent: string;
				try {
					jsonContent = await fs.readFile(jsonFilePath, 'utf8');
				} catch (error) {
					Log.error(`读取 ${jsonFilePath} 文件失败，此 Markdown JSON 数据将被忽略：\n${error}`);
					return;
				}

				// 解析 JSON 内容
				let jsonData: WikiSchema;
				try {
					jsonData = JSON.parse(jsonContent) as WikiSchema;
				} catch (error) {
					Log.error(`解析 ${jsonFilePath} 文件失败，此 Markdown JSON 数据将被忽略：\n${error}`);
					return;
				}

				// 校验 JSON 数据格式
				const validate = new Ajv({ allErrors: true }).compile(wikiJsonSchema);
				if (!validate(jsonData)) {
					const errorMessages = (validate.errors || [])
						.map((error) => {
							const path = error.instancePath || '未知';
							return `路径: ${path || '(根)'}\n错误: ${error.message}`;
						})
						.join('\n\n');

					Log.error(`${jsonFilePath} 文件无法通过校验，此 Markdown JSON 数据将被忽略：\n${errorMessages}`);
					return;
				}

				// 写入 JSON 数据
				if (!item.metadata) item.metadata = {};
				item.metadata.json = jsonData;
			}
		}),
	);

	// 移除 JSON 文件项
	contentRemove(content, RemoveFileList);
};

export default main;
