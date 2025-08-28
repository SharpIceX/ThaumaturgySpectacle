import path from 'node:path';
import Logger from './logger';
import fs from 'node:fs/promises';
import { outputPath } from './main';
import { contentType } from './content';

const Log = new Logger('WriteDisk');

const writeDisk = async (content: contentType[]): Promise<void> => {
	await Promise.all(
		content.map(async item => {
			const isPage = item.outputPath.endsWith('.vue') || item.forceCopyToPages;
			const fullOutputPath = path.join(outputPath, isPage ? 'pages' : 'public', item.outputPath);

			try {
				await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });

				if (item.content) {
					await fs.writeFile(fullOutputPath, item.content, 'utf8');
					Log.info(`写入文件：${fullOutputPath}`);
				} else if (item.inputPath) {
					await fs.copyFile(item.inputPath, fullOutputPath);
					Log.info(`复制文件：${item.inputPath} 到 ${fullOutputPath}`);
				} else {
					Log.error(`发现孤立的内容项，既没有 content 也没有 inputPath，跳过写入：\n${JSON.stringify(item)}`);
				}
			} catch (error) {
				Log.error(
					`处理 ${fullOutputPath} 时发生错误：\n${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}),
	);

	// Nuxt 配置文件
	const nuxtConfigPath = path.join(outputPath, 'nuxt.config.ts');
	await fs.writeFile(nuxtConfigPath, 'export default defineNuxtConfig({});', 'utf8');
	Log.info(`写入 Nuxt 配置文件：${nuxtConfigPath}`);
};

export default writeDisk;
