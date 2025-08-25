export namespace Renderer {
	/**
	 * Markdown 渲染器
	 * @param markdownText 需要渲染的 Markdown 文本
	 * @param useProcessor 是否使用内容处理器进行二次处理
	 */
	export function Render(
		markdownText: string,
		useProcessor: boolean,
	): {
		/**
		 * 返回的是纯 HTML 字符串
		 */
		html: string;

		/**
		 * 返回的是 YAML 格式的 Front Matter，需要手动进行解析。
		 * 如果为空将返回空字符串
		 */
		frontMatter: string | null;
	};
}
