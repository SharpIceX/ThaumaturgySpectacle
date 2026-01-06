using AngleSharp.Dom;
using AngleSharp.Html.Dom;

namespace MarkdownRender.Processor
{
	internal static class Task
	{
		private const string DoneMark = "✓";
		private const string UndoneMark = "✗";

		internal static void Render(IHtmlElement body)
		{
			var owner = body.Owner!;

			foreach (var list in body.QuerySelectorAll("ul.contains-task-list"))
			{
				foreach (var item in list.QuerySelectorAll("li"))
				{
					var checkbox = item.QuerySelector("input[type=checkbox]");
					if (checkbox == null)
						continue;

					var taskDone = checkbox.HasAttribute("checked");

					// 获取文本内容（排除原有的 checkbox）
					var contentNode = item.Clone(true) as IElement;
					contentNode?.QuerySelector("input[type=checkbox]")?.Remove();
					var content = contentNode?.TextContent.Trim() ?? string.Empty;

					// 清空原始项
					item.InnerHtml = string.Empty;

					// 创建状态容器
					var statusWrapper = owner.CreateElement("span");
					statusWrapper.SetAttribute("role", "checkbox");
					statusWrapper.SetAttribute("aria-checked", taskDone ? "true" : "false");
					statusWrapper.SetAttribute(
						"aria-label",
						$"任务：{content}，状态：{(taskDone ? "已完成" : "未完成")}"
					);

					// 支持键盘操作
					statusWrapper.SetAttribute("tabindex", "0");

					// 创建视觉图标 Span
					var statusMark = owner.CreateElement("span");
					statusMark.ClassName = taskDone ? "task-status-done" : "task-status-undone";
					statusMark.TextContent = taskDone ? DoneMark : UndoneMark;

					// 创建内容 Span
					var contentSpan = owner.CreateElement("span");
					contentSpan.ClassName = "task-content";
					contentSpan.TextContent = content;

					// 组装结构
					statusWrapper.Append(statusMark);
					item.Append(statusWrapper);
					item.Append(contentSpan);
				}
			}
		}
	}
}
