using AngleSharp;

namespace MarkdownRender
{
	internal static class Process
	{
		internal static string Render(string MarkdownHTML)
		{
			var context = BrowsingContext.New(Configuration.Default);
			var document = context.OpenAsync(req => req.Content(MarkdownHTML)).GetAwaiter().GetResult();
			var body = document.Body;

			// 图像处理
			Processor.Image.Render(body!);

			// 任务列表处理 - 无障碍相关
			Processor.Task.Render(body!);

			return body!.InnerHtml;
		}
	}
}
