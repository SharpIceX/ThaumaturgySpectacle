using Markdig.Extensions.CustomContainers;
using Markdig.Renderers;
using Markdig.Renderers.Html;

namespace LumirayRender.ObjectRenderers
{
	internal class CustomContainerRenderer : HtmlObjectRenderer<CustomContainer>
	{
		protected override void Write(HtmlRenderer renderer, CustomContainer obj)
		{

			var infoRaw = obj.Info ?? "";

			Console.WriteLine(infoRaw);

		}
	}
}
