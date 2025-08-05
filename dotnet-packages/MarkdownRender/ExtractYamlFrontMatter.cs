using Markdig.Extensions.Yaml;
using Markdig.Syntax;

namespace MarkdownRender
{
	internal static class ExtractYamlFrontMatter
	{
		internal static string Parse(MarkdownDocument markdownText)
		{
			var yamlBlock = markdownText.Descendants<YamlFrontMatterBlock>().FirstOrDefault();

			if (yamlBlock == null)
			{
				return string.Empty;
			}

			return yamlBlock.Lines.ToString().Trim();
		}
	}
}
