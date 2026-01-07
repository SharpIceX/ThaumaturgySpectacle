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
	const stream = readline.createInterface({
		input: fs.createReadStream(path, { encoding: 'utf8' }),
		crlfDelay: Infinity,
	});

	try {
		let content = '';
		let streamLineNumber = 0;
		let frontMatterEnded = false;

		for await (const line of stream) {
			streamLineNumber++;

			// 判断开头是不是`---`
			if (streamLineNumber === 1) {
				if (line.trim() !== '---') {
					throw `${path} 开头找不到 Frontmatter`;
				}
				continue;
			}

			// 找到中间的 `---`
			if (line.trim() === '---') {
				frontMatterEnded = true;
				break;
			}

			content += line + '\n';
		}

		if (!frontMatterEnded) {
			throw `文件 ${path} 中的 Frontmatter 未找到闭合的“---”`;
		}

		// 解析 FrontmMtter
		const frontmatter = yaml.parse(content);
		if (!frontmatter) {
			throw `文件 ${path} 中的Frontmatter 为空`;
		}
		if (!frontmatter.title) {
			throw `文件 ${path} 中的 Frontmatter 中找不到 title 字段`;
		}

		return frontmatter;
	} catch (error: unknown) {
		logger.fatal(String(error));
		return;
	} finally {
		stream.close();
	}
}

export default frontmatter;
