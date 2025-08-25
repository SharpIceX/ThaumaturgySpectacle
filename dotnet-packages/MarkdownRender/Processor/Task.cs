using AngleSharp.Html.Dom;

namespace MarkdownRender.Processor
{
	internal static class Task
	{
		internal static void Render(IHtmlElement body)
		{
			var owner = body.Owner;

			// 找到所有任务列表项
			// <ul class="contains-task-list">
			var taskListItems = body.QuerySelectorAll("ul.contains-task-list");

			foreach (var list in taskListItems)
			{
				var listItems = list.QuerySelectorAll("li");

				foreach (var item in listItems)
				{
					// 获取任务状态
					var taskStatus = item.QuerySelector("input")?.GetAttribute("checked") == "checked";

					// 获取内容
					var content = item.TextContent.Trim();

					// 任务状态元素
					var statusSpan = owner!.CreateElement("span");
					statusSpan.ClassName = taskStatus ? "task-status-done" : "task-status-undone";
					statusSpan.TextContent = taskStatus ? "✓" : "✗";

					// 任务内容元素
					var contentSpan = owner.CreateElement("span");
					contentSpan.ClassName = "task-content";
					contentSpan.TextContent = content;

					// 清空原有内容
					item.InnerHtml = string.Empty;

					// 设置无障碍相关属性
					item.SetAttribute("aria-label", $"任务：{content}，状态：{(taskStatus ? "已完成" : "未完成")}");

					// 添加新内容
					item.Append(statusSpan);
					item.Append(contentSpan);
				}
			}
		}
	}
}
