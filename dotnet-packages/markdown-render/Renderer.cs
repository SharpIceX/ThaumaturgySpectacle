using Markdig;
using Microsoft.JavaScript.NodeApi;

namespace MarkdownRender;

[JSExport("Renderer")]
public static class Renderer
{
	internal static readonly MarkdownPipeline pipeline = new MarkdownPipelineBuilder()
		.UseFootnotes() // 启用脚注
		.UseTaskLists() // 启用任务列表
		.UseEmphasisExtras() // 启用强调扩展
		.UseAlertBlocks((_renderer, _kind) => { }) //启用 GFM 警报块支持，并移除默认的 Action
		.UseYamlFrontMatter() // 启用 Front Matter 支持
		.UsePipeTables() // 启用管道表格支持（默认表格）
		.UseGenericAttributes() // 启用通用属性支持
		.Build();

	[JSExport("Render")]
	public static JSObject Render(string markdownText)
	{
		if (string.IsNullOrWhiteSpace(markdownText))
			throw new ArgumentException("Markdown 内容不能为空", nameof(markdownText));

		var document = Markdown.Parse(markdownText, pipeline); // 解析 Markdown

		string metadata = ExtractYamlFrontMatter.Parse(document); // 解析 Front Matter 得到 YAML

		string html = document.ToHtml(pipeline); // 转换为 HTML

		return new JSObject { { "html", html }, { "metadata", metadata } };
	}
}
