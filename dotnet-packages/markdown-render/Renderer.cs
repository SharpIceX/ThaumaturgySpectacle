using Markdig;
using Microsoft.JavaScript.NodeApi;

namespace markdown_render;

[JSExport]
public static class Renderer
{
	[JSExport("Render")]
	public static string Render(string markdownText)
	{
		return Markdown.ToHtml(markdownText);
	}
}
