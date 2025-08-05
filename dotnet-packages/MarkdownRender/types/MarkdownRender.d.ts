export namespace Renderer {
	export function Render(markdownText: string): {
		/**
		 * 返回的是纯 HTML 字符串
		 */
		html: string;

		/**
		 * 返回的是 YAML 格式的 Front Matter，需要手动进行解析。
		 * 如果为空将返回空字符串
		 */
		frontMatter: string;
	};
}
