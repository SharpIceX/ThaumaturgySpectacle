using AngleSharp.Dom;
using AngleSharp.Html.Dom;

namespace MarkdownRender.Processor
{
	internal static class Image
	{
		private static IElement ImageProcessor(IElement imageElement)
		{
			// 获取 title 属性
			var title = imageElement.GetAttribute("title");
			var owner = imageElement.Owner;

			// 新建 p.image 容器
			var pElement = owner!.CreateElement("p");
			pElement.ClassName = "image";

			if (!string.IsNullOrEmpty(title))
			{
				// 删除 title 属性
				imageElement.RemoveAttribute("title");

				// 添加 aria-hidden，避免重复朗读
				imageElement.SetAttribute("aria-hidden", "true");

				// 新建 span 作为标题
				var spanElement = owner.CreateElement("span");
				spanElement.TextContent = title;

				// 无障碍相关属性
				pElement.SetAttribute("aria-label", title);
				pElement.SetAttribute("role", "img");

				pElement.Append(imageElement);
				pElement.Append(spanElement);

				return pElement;
			}
			else
			{
				// 获取 alt 属性
				var alt = imageElement.GetAttribute("alt");
				if (string.IsNullOrEmpty(alt))
				{
					alt = "此图片无描述信息";
				}

				// 设置图片本身的无障碍属性
				imageElement.SetAttribute("aria-label", alt);
				imageElement.SetAttribute("role", "img");

				pElement.Append(imageElement);
				return pElement;
			}
		}

		internal static void Render(IHtmlElement body)
		{
			// 查找所有包含 img 的 p 元素
			var pElements = body.QuerySelectorAll("p");
			var filteredPElements = pElements.Where(p => p.QuerySelectorAll("img").Length > 0).ToArray();

			// 没有包含 img 的 p 元素，不处理
			if (filteredPElements.Length == 0)
				return;

			foreach (var element in filteredPElements)
			{
				// 获取所有 img 元素
				var imgElements = element.QuerySelectorAll("img");
				IElement newElement;

				if (imgElements.Length == 1)
				{
					// 单图片，直接替换为处理后的 p.image
					newElement = ImageProcessor(imgElements[0]);
				}
				else
				{
					// 多图片，放入 div.image-group
					newElement = body.Owner!.CreateElement("div");
					newElement.ClassName = "image-group";
					foreach (var img in imgElements)
					{
						newElement.Append(ImageProcessor(img));
					}
				}

				element.Replace(newElement);
			}
		}
	}
}
