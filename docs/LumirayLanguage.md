## 关于 Lumiray 语言

Lumiray 是基于 Markdown 改进扩展的语法，专为 Wiki 内容编写和展示优化，支持结构化模板、属性注解等功能。

## 语法特性

### 模板

Lumiray 语言支持模板功能，可以通过 `:::` 来定义和使用模板。

语法示例：

```
::: 模板名称 参数1 参数2
内容
:::
```

其中的`模板名称`为必要部分，此部分决定了要使用什么模板处理器去处理。

`参数1`和`参数2`为可选参数。

> [!TIP]
> 模板名称和参数等对大小写敏感！

### 属性

Lumiray 语言支持在模板中使用属性以满足 Web 端的渲染需求。

语法示例：

```
![这是一个启用懒加载属性的图片]("https://example.com/image.png" '图片标题'){lazy="true" class="image-test" style="min-width: 20rem;" other_attribute="value"}
```

渲染结果：

```html
<img
  src="https://example.com/image.png"
  alt="这是一个启用懒加载属性的图片"
  title="图片标题"
  lazy="true"
  class="image-test"
  style="min-width: 20rem;"
  other_attribute="value" />
```

## 所有模板

### InfoBox

`InfoBox` 模板用于创建信息框，显示在页面右上角

使用示例：

```
::: InfoBox Caption=false
| 标题 |
| ![站点图标]("/favicon.png" '站点图标') |
| 列 1 | 列 2 |
| 转义测试 | 「\|」这是一个转义的竖线 |
:::
```

参数：

- `Caption`：是否显示标题栏，默认 `true`；当指定 `Template` 时强制设为 false。
- `Template`：指定使用的子模板名称。
- `Reprocessing`：是否将内容再次作为 Markdown 解析，默认 `true`，使用 `Template` 时强制为 `false`，因为`Template` 会自动处理内容。

> [!TIP]
> 如果模板中包含图片，将默认添加 `lazy="false"` 属性。
> `\|` 不会被视为表格分隔符，而是作为普通文本处理。


#### 子模板功能

InfoBox 支持结构化的子模板，适合重复格式的展示（如角色卡片等）。

模板结构：

``` json
[
	{ "content": "角色信息" },
	{ "content": "信息名", "content_right": "信息值" },
	{ "name": "名称", "content": "角色名字" },
	{ "name": "描述", "content": "简要描述" },
	{ "name": "图片" },
	{ "name": "年龄", "content": "年龄" },
	{ "name": "性别", "content": "性别" },
	{ "name": "其他信息", "content": "其他角色信息" }
]
```
> [!TIP]
> 结构化子模板是按顺序渲染的

- 第 1、2 项为固定内容，直接渲染为标题行和两列表格。
- 第 3 项及以后由`name`变量控制字段名称，`content`为值。
- 图片字段支持直接插入图片（无右列）。

模板使用示例：

```
::: InfoBox Template=CharacterInfo
名称 | 角色名称 Name
描述 | 角色描述 Description
图片 | ![角色图标标题]("/path/to/icon.png" '角色图片标题')
年龄 | 20
性别 | 男
其他信息 | _remove
:::
```

其中：

- `_remove`表示移除该字段（用于动态隐藏）。
- 若不设置`content`或`_remove`，字段仍会显示但为空。

处理后的中间格式（伪）：

```
::: InfoBox Caption=false Reprocessing=false
| 角色信息 |
| 信息名 | 信息值 |
| 名称 | 角色名称 Name |
| 描述 | 角色描述 Description |
| <img src="/path/to/icon.png" alt="角色图标标题" title="角色图片标题" lazy="false" /> |
| 年龄 | 20 |
| 性别 | 男 |
:::
```
