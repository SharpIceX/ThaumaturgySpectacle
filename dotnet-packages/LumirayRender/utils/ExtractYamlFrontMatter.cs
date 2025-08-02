using Markdig.Extensions.Yaml;
using Markdig.Syntax;

namespace LumirayRender.utils
{
	internal static class ExtractYamlFrontMatter
	{
		internal static string Parse(MarkdownDocument markdownText)
		{
			var yamlBlock =
				markdownText.Descendants<YamlFrontMatterBlock>().FirstOrDefault()
				?? throw new InvalidDataException("未找到 Markdown Front Matter");

			var frontMatterText = yamlBlock.Lines.ToString().Trim();

			return frontMatterText;
		}
	}
}
