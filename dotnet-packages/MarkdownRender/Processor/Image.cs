using AngleSharp.Dom;
using AngleSharp.Html.Dom;

namespace MarkdownRender.Processor
{
	internal static class Image
	{
		private const string DefaultAlt = "此图片无描述信息";

		private static IElement ImageProcessor(IElement imageElement)
		{
			var owner = imageElement.Owner!;

			var title = imageElement.GetAttribute("title");

			// 创建 p.image 容器
			var pElement = owner.CreateElement("p");
			pElement.ClassName = "image";

			if (!string.IsNullOrEmpty(title))
			{
				// 移除 title，避免重复朗读
				imageElement.RemoveAttribute("title");
				imageElement.SetAttribute("aria-hidden", "true");

				// span 作为标题
				var spanElement = owner.CreateElement("span");
				spanElement.TextContent = title;

				// 容器承担 img 语义
				pElement.SetAttribute("role", "img");
				pElement.SetAttribute("aria-label", title);

				pElement.Append(imageElement);
				pElement.Append(spanElement);

				return pElement;
			}

			// 无 title 的情况，使用 alt
			var alt = imageElement.GetAttribute("alt");
			if (string.IsNullOrEmpty(alt))
			{
				alt = DefaultAlt;
			}

			imageElement.SetAttribute("role", "img");
			imageElement.SetAttribute("aria-label", alt);

			pElement.Append(imageElement);
			return pElement;
		}

		internal static void Render(IHtmlElement body)
		{
			var owner = body.Owner ?? throw new InvalidOperationException("Body element has no owner document");

			// 遍历所有 p
			foreach (var element in body.QuerySelectorAll("p"))
			{
				var imgElements = element.QuerySelectorAll("img");
				if (imgElements.Length == 0)
					continue;

				IElement newElement;

				if (imgElements.Length == 1)
				{
					// 单图：p.image
					newElement = ImageProcessor(imgElements[0]);
				}
				else
				{
					// 多图：div.image-group
					var group = owner.CreateElement("div");
					group.ClassName = "image-group";

					foreach (var img in imgElements)
					{
						group.Append(ImageProcessor(img));
					}

					newElement = group;
				}

				element.Replace(newElement);
			}
		}
	}
}
