using Markdig.Extensions.Yaml;
using Markdig.Syntax;

namespace MarkdownRender
{
	internal static class ExtractYamlFrontMatter
	{
		internal static string? Parse(MarkdownDocument markdownText)
		{
			var yamlBlock = markdownText.Descendants<YamlFrontMatterBlock>().FirstOrDefault();

			if (yamlBlock == null)
			{
				return null;
			}

			return yamlBlock.Lines.ToString().Trim();
		}
	}
}
