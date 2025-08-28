using Markdig;
using Microsoft.JavaScript.NodeApi;

namespace MarkdownRender
{
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
			.Build();

		[JSExport("Render")]
		public static JSObject Render(string MarkdownText, bool UseProcessor)
		{
			// 判断是否为空
			if (string.IsNullOrWhiteSpace(MarkdownText))
			{
				throw new Exception("输入的 Markdown 文本不能为空");
			}

			// 解析 Markdown 文本
			var document = Markdown.Parse(MarkdownText, pipeline);

			// 提取 Front Matter
			var FrontMatter = ExtractYamlFrontMatter.Parse(document) ?? JSValue.Undefined;

			// 转换为 HTML
			var HTML = document.ToHtml(pipeline);

			if (string.IsNullOrWhiteSpace(HTML))
			{
				throw new Exception("Markdown 渲染后的 HTML 结果为空");
			}

			if (UseProcessor)
			{
				// 使用自定义处理器进行二次处理
				HTML = Process.Render(HTML);
			}

			return new JSObject { { "html", HTML }, { "frontMatter", FrontMatter } };
		}
	}
}
