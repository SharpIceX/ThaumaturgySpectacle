using Markdig;

namespace LumirayRender
{
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
            .UseCustomContainers() // 启用自定义容器支持，用来做模板
            .Build();

        public static RenderResult Render(string MarkdownText)
        {
            // 判断是否为空
            if (string.IsNullOrWhiteSpace(MarkdownText)) throw new Exception("输入的 Markdown 文本不能为空");

            var document = Markdown.Parse(MarkdownText, pipeline); // 解析 Markdown

            string FrontMatter = utils.ExtractYamlFrontMatter.Parse(document); // 解析 Front Matter 得到 YAML
            string HTML = document.ToHtml(pipeline); // 转换为 HTML

            return new RenderResult
            {
                FrontMatter = FrontMatter,
                HTML = HTML
			};
        }
    }
}
