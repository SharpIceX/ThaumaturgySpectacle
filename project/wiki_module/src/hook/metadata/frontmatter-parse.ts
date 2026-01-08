import yaml from 'yaml';
import fs from 'node:fs';
import readline from 'node:readline';
import { useLogger } from '@nuxt/kit';

const logger = useLogger('@ts/wiki_module');

/**
 * 解析 Markdown 的 FrontmMtter
 * @param path 文件位置
 * @returns FrontmMtter 数组
 */
async function frontmatter(path: string): Promise<Record<string, unknown> | undefined> {
	const input = fs.createReadStream(path, { encoding: 'utf8' });
	const rl = readline.createInterface({
		input,
		crlfDelay: Infinity,
	});

	try {
		let content = '';
		let streamLineNumber = 0;
		let frontMatterEnded = false;

		for await (const line of rl) {
			streamLineNumber++;
			const trimmedLine = line.trim();

			// 第一行必须是 ---
			if (streamLineNumber === 1) {
				if (trimmedLine !== '---') {
					throw new Error(`开头找不到 Frontmatter (当前行: "${line}")`);
				}
				continue;
			}

			// 找到结束的 ---
			if (trimmedLine === '---') {
				frontMatterEnded = true;
				break;
			}

			// 收集内容
			content += line + '\n';
		}

		if (!frontMatterEnded) {
			throw new Error('未找到闭合的“---”');
		}

		const data = yaml.parse(content);

		if (!data || typeof data !== 'object') {
			throw new Error('内容为空或格式非法');
		}

		if (!data.title) {
			throw new Error('缺少必填字段: title');
		}

		return data;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger.error(`解析文件失败: ${path}\n原因: ${message}`);
		return;
	} finally {
		rl.close();
		input.destroy();
	}
}

export default frontmatter;
