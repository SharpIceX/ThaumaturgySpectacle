using Markdig;
using Microsoft.JavaScript.NodeApi;

namespace MarkdownRender
{
	[JSExport("Renderer")]
	public static class Renderer
	{
		private static readonly MarkdownPipeline pipeline = new MarkdownPipelineBuilder()
			.UseFootnotes() // 启用脚注
			.UseTaskLists() // 启用任务列表
			.UseEmphasisExtras() // 启用强调扩展
			.UseAlertBlocks((_renderer, _kind) => { }) //启用 GFM 警报块支持，并移除默认的 Action
			.UsePipeTables() // 启用管道表格支持（默认表格）
			.UseGenericAttributes() // 启用通用属性支持
			.UseSoftlineBreakAsHardlineBreak() // 将软换行视为硬换行
			.Build();

		[JSExport("Render")]
		public static string Render(string markdownText)
		{
			if (string.IsNullOrWhiteSpace(markdownText))
			{
				return string.Empty;
			}

			string RenderHTML = Markdown.ToHtml(markdownText, pipeline);
			return Process.Render(RenderHTML.ToString());
		}
	}
}
