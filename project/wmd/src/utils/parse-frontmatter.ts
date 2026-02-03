import yaml from 'yaml';
import { type FrontmatterNode, preNodeType } from '../types/node/pre-node';

/**
 * FrontMatter 解析器
 * @param content Wiki Markdown 文件内容
 * @returns 有效的 Front Matter 节点，否则返回 undefined
 */
function frontMatterParse(content: string): FrontmatterNode | undefined {
	// 判断开头是否为起始
	const startMatch = content.match(/^---[ \t]*\n/);
	if (!startMatch) return;
	const startOffset = startMatch[0].length;

	// 查找闭合位置
	const closeRegex = /\n---[ \t]*(?=\n|$)/g;
	closeRegex.lastIndex = startOffset;

	const closeMatch = closeRegex.exec(content);
	if (!closeMatch) return;
	const closeOffset = closeMatch.index;

	// 解析 YAML
	const yamlContent = content.slice(startOffset, closeOffset);
	const metadata = yaml.parse(yamlContent);

	// 验证元数据
	if (metadata === null || typeof metadata !== 'object') return undefined;

	return {
		type: preNodeType.Frontmatter,
		metadata,
		start: 0,
		end: closeOffset + closeMatch[0].length,
	};
}

export { frontMatterParse };
