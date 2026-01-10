import yaml from 'yaml';
import { type FrontmatterNode, NodeType } from '../types/main';

/**
 * FrontMatter 解析器 - 静默失败模式
 * @param content wmd 文件内容（换行符已统一为 \n）
 * @returns 有效的 Front Matter 节点，否则返回 undefined
 * @throws {import('yaml').YAMLParseError} 仅当 YAML 内容无效时抛出（标记格式错误静默失败）
 */
function frontMatterParse(content: string): FrontmatterNode | undefined {
	// 开头必须以`---\n`打头
	if (!content.startsWith('---\n')) return;

	let endMarkerStart = -1;
	let endMarkerEnd = -1;
	let searchPos = 3; // 从第一个换行符位置开始搜索

	while (searchPos < content.length) {
		const markerPos = content.indexOf('\n---', searchPos);
		if (markerPos === -1) break;

		const afterMarker = markerPos + 4; // 跳过 "\n---"
		searchPos = afterMarker;

		// 情结束标记在文档末尾
		if (afterMarker === content.length) {
			endMarkerStart = markerPos + 1; // 跳过 \n，指向 ---
			endMarkerEnd = markerPos + 4; // 指向 --- 末尾
			break;
		}

		// 结束标记后紧跟换行符
		if (content[afterMarker] === '\n') {
			endMarkerStart = markerPos + 1; // 跳过 \n
			endMarkerEnd = markerPos + 4; // 指向 --- 末尾（不含后续 \n）
			break;
		}

		// 无效结束标记（后跟非换行字符或空格）
		continue;
	}

	// 未找到有效结束标记
	if (endMarkerStart === -1) return;

	// 提取 YAML 内容
	const yamlContent = content.slice(4, endMarkerStart);

	// 解析 YAML
	const metadata = yaml.parse(yamlContent);

	// 验证元数据
	if (metadata === null || typeof metadata !== 'object') return undefined;

	// 计算结束位置
	const endLine = content.slice(0, endMarkerEnd).split('\n').length - 1;

	return {
		type: NodeType.Frontmatter,
		metadata,
		position: {
			start: { line: 0, column: 0, offset: 0 },
			end: {
				line: endLine,
				column: 0,
				offset: endMarkerEnd,
			},
		},
	};
}

export { frontMatterParse };
