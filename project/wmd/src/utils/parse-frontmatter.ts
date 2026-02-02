import yaml from 'yaml';
import { type FrontmatterNode, preNodeType } from '../types/node/pre-node';

/**
 * FrontMatter 解析器
 * @param content wmd 文件内容（换行符已统一为 \n）
 * @returns 有效的 Front Matter 节点，否则返回 undefined
 * @throws {import('yaml').YAMLParseError} 仅当 YAML 内容无效时抛出（标记格式错误静默失败）
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
	if (!closeMatch) return; // 没找到闭合标记
	const closeOffset = closeMatch.index;

	// 提取 yaml 内容
	const yamlContent = content.slice(startOffset, closeOffset);

	// 解析 YAML
	const metadata = yaml.parse(yamlContent);

	// 验证元数据
	if (metadata === null || typeof metadata !== 'object') return undefined;

	// 计算结束位置
	const endMarkerEnd = closeOffset + closeMatch[0].length;

	// 计算行号
	let lineCount = 1;
	for (let index = 0; index < endMarkerEnd; index++) {
		if (content[index] === '\n') {
			lineCount++;
		}
	}

	// 计算列号
	const lastLineStart = content.lastIndexOf('\n', endMarkerEnd - 1);
	const column = endMarkerEnd - lastLineStart;

	return {
		type: preNodeType.Frontmatter,
		metadata,
		position: {
			start: { line: 1, column: 1, offset: 0 },
			end: {
				line: lineCount,
				column: column,
				offset: endMarkerEnd,
			},
		},
	};
}

export { frontMatterParse };
