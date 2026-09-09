+++
title = "05 · Markdown 与组件"
date = 2026-09-02
weight = 5
description = "掌握文章 Front Matter、Markdown 写法和 Elysia 内置组件（附写法与效果）。"
+++

本章示例可直接复制到文章中。组件使用 Zola 0.23+ 的 component 语法；每节先给写法，再给效果。

> [!tip]
> 在 md 文章中使用 {% raw %} `{{ ... }}` 或 `{% ... %}` {% endraw %} 时必须使用 `raw`、`endraw` 进行包裹，以避免被当前页执行，导致 zola 解析导致报错。

## 文章 Front Matter

最简文章：

```toml
+++
title = "我的第一篇文章"
date = 2026-03-10
description = "这是一段摘要"
+++
```

博客常用字段：

```toml
+++
title = "一篇文章"
date = 2026-03-10
updated = 2026-03-12
description = "列表页显示的摘要"
weight = 1

[taxonomies]
categories = ["技术"]
tags = ["zola", "博客"]

[extra]
sticky = true
+++
```

- `date`：排序与显示日期；`updated`：更新时间（用于过期提示）。
- `description`：列表摘要与页面描述；普通文章也可用正文 `<!-- more -->` 分隔生成 `page.summary`。
- `weight`：Wiki 章节排序；`sticky` / `top` / `pinned` 置顶。
- 分类与标签必须写在 `[taxonomies]` 下。

加密文章：

```toml
+++
title = "私密文章"
[extra]
encrypted = true
password = "change-this-password"
password_hint = "请输入密码"
+++
```

不要把真实密码提交到公开仓库，前端加密仅作轻量保护。

## 基础 Markdown

**写法：**

```md
# 一级标题
## 二级标题

这是一段包含 **粗体**、*斜体*、~~删除线~~、`代码` 和 [链接](https://example.com) 的文字。

- 无序列表
- 另一项

1. 有序列表
2. 另一项

> 这是一段引用。

---

| 姓名 | 年龄 | 城市 |
| --- | --- | --- |
| Alice | 24 | 北京 |
| Bob | 30 | 上海 |
```

**效果：**

# 一级标题
## 二级标题

这是一段包含 **粗体**、*斜体*、~~删除线~~、`代码` 和 [链接](https://example.com) 的文字。

- 无序列表
- 另一项

1. 有序列表
2. 另一项

> 这是一段引用。

---

| 姓名 | 年龄 | 城市 |
| --- | --- | --- |
| Alice | 24 | 北京 |
| Bob | 30 | 上海 |

正文中的 Markdown 链接会自动显示链接图标，图片链接除外。

## 提示块、脚注和公式

**写法（GitHub Alerts）：**

```md
> [!NOTE]
> 这是普通提示。

> [!TIP]
> 这是一个技巧。

> [!WARNING]
> 这是警告。
```

**效果：**

> [!NOTE]
> 这是普通提示。

> [!TIP]
> 这是一个技巧。

> [!WARNING]
> 这是警告。

**写法（脚注）：**

```md
这句话有一个脚注[^source]。

[^source]: 脚注内容。
```

**效果：**

这句话有一个脚注[^source]。

[^source]: 脚注内容。

**写法（KaTeX，需 `extra.katex.enable = true`）：**

```md
行内公式：$E=mc^2$

$$
\int_0^\infty e^{-x}dx = 1
$$
```

**效果：**

行内公式：$E=mc^2$

$$
\int_0^\infty e^{-x}dx = 1
$$

配置：

```toml
[extra.katex]
enable = true
```

## 代码块

**写法：** 支持 `linenos` / `name` / `hl_lines`：

````md
```ts,linenos,name=example.ts,hl_lines=2 3
interface User {
  name: string;
  age: number;
}
```
````

**效果：**

```ts,linenos,name=example.ts,hl_lines=2 3
interface User {
  name: string;
  age: number;
}
```

行号由 `extra.features.code_line_numbers` 控制，复制按钮由脚本自动提供。

## 组件语法

行组件：

```jinja
{% raw %}{{ <component-name parameter="value" /> }}{% endraw %}
```

块组件：

```jinja
{% raw %}{% <component-name parameter="value"> %}{% endraw %}
内容
{% raw %}{% </component-name> %}{% endraw %}
```

参数均使用双引号。块组件内容支持完整 Markdown。

### note 提示块

**写法：**

{% raw %}
```jinja
{% <note title="提示" color="blue"> %}
这是一段提示内容。
{% </note> %}
{% <note title="成功" color="green"> %}...{% </note> %}
```
{% endraw %}

`color` 可选 `blue` / `green` / `yellow` / `orange` / `red` / `black`。

**效果：**

{% <note title="提示" color="blue"> %}
这是一段提示内容，`color="blue"` 为默认。
{% </note> %}

{% <note title="成功" color="green"> %}green{% </note> %}
{% <note title="警告" color="yellow"> %}yellow{% </note> %}
{% <note title="注意" color="orange"> %}orange{% </note> %}
{% <note title="危险" color="red"> %}red{% </note> %}
{% <note title="黑色" color="black"> %}black{% </note> %}

### video 视频

**写法：**

```jinja
{% raw %}{{ <video bilibili="BV1n8Q7B7Ekz" caption="B 站示例" /> }}{% endraw %}
{% raw %}{{ <video youtube="GoxJ4H8Chz8" width="80%" /> }}{% endraw %}
{% raw %}{{ <video src="/video/demo.mp4" caption="本地视频" /> }}{% endraw %}
```

参数：`bilibili` / `youtube` / `src` 三选一；`width` 宽度；`caption` 说明；`autoplay` 为 true 时自动播放。

**效果：**

{{ <video bilibili="BV1n8Q7B7Ekz" caption="B 站示例" autoplay="false" /> }}

### audio 音频

**写法：**

本地音频：

```jinja
{% raw %}{{ <audio src="/audio/demo.mp3" caption="远程音频" autoplay="true" /> }}{% endraw %}
```

网易云（`type` 支持 `single` / `album` / `playlist`）：

{% raw %}
```jinja
{{ <audio netease="1852892593" type="single" /> }}
{{ <audio netease="128938811" type="album" /> }}
{{ <audio netease="2246151876" type="playlist" /> }}
```
{% endraw %}

Spotify（`type` 支持 `single` / `album` / `playlist`，`single` 对应 `track`）：

{% raw %}
```jinja
{{ <audio spotify="3QQcmb87X6e10gdEXDx1ep" type="single" /> }}
{{ <audio spotify="3mlG9PR20AaeQQGA18PJ18" type="album" /> }}
{{ <audio spotify="6UEIDpoU9CJD0b0jg04kgP" type="playlist" /> }}
```
{% endraw %}

**效果（本地播放器）：**

{{ <audio src="https://www.kumeiwp.com/wj/531/2021/02/24/514624f352b5b765149dd19a279af7c6.mp3" caption="远程音频示例" autoplay="false" /> }}

**效果（网易云 single / album / playlist）：**

{{ <audio netease="1852892593" type="single" /> }}

{{ <audio netease="288635756" type="album" /> }}

{{ <audio netease="2246151876" type="playlist" /> }}

**效果（Spotify single / album / playlist）：**

{{ <audio spotify="3QQcmb87X6e10gdEXDx1ep" type="single" /> }}

{{ <audio spotify="3mlG9PR20AaeQQGA18PJ18" type="album" /> }}

{{ <audio spotify="6UEIDpoU9CJD0b0jg04kgP" type="playlist" /> }}

### image 图片

**写法：**

{% raw %}
```jinja
{{ <image src="https://picsum.photos/seed/elysia/800/300" alt="示例图片" width="100%" caption="图片说明" /> }}
```
{% endraw %}

图片文件建议放在站点的 `static/` 目录。

**效果：**

{{ <image src="https://picsum.photos/seed/elysia/800/300" alt="示例图片" width="100%" caption="图片说明" /> }}

### link 单个链接卡片

**写法：**

{% raw %}
```jinja
{{ <link href="https://www.getzola.org/" title="Zola" icon="https://www.getzola.org/icons/apple-touch-icon.png" desc="Zola 官方网站" /> }}
```
{% endraw %}

**效果：**

{{ <link href="https://www.getzola.org/" title="Zola" icon="https://www.getzola.org/icons/apple-touch-icon.png" desc="Zola 官方网站" /> }}

### links 链接集合

在 `data/links.yaml` 中准备数据：

```yaml
github:
  - title: Zola
    url: https://github.com/getzola/zola
    cover: https://picsum.photos/seed/zola/600/300
    desc: Zola 官方仓库
```

卡片只显示封面、标题与摘要，不显示链接地址与图标；`cover` 支持远程地址与本地图片（放在 `static/` 下，如 `/images/tool.jpg`，会自动拼接 `base_url`）；标题前方的 ★ 为个人精选标识；摘要超出两行被截断时，鼠标悬浮显示全文。

**写法：**

{% raw %}
```jinja
{{ <links group="github" /> }}
```
{% endraw %}

**效果：**

{{ <links group="github" /> }}

### friends 友链

`friends` 默认读取 `data/friends.yaml`，数据格式（仅以下字段）：

```yaml
developer:
  - title: 对方名称
    url: https://example.com
    icon: https://example.com/avatar.jpg
    description: 一句话自我描述
    feed: https://example.com/atom.xml
```

- `title` / `url`：显示名称与主页链接（点击卡片跳转）。
- `icon`：网站图标，为空时显示标题首字母。
- `description`：一句话简介，显示在名称下方。
- `feed`：订阅地址；构建时自动抓取最近 3 篇文章展示在卡片右侧。
  为空显示"暂未配置 feed 订阅"且排序靠后；地址无效或抓取失败显示"订阅暂不可用"，不影响构建。
- 卡片不再显示网站链接地址；顶层键为分组名，可用 `group` 参数只渲染某一组。

支持 `api` 参数调用远程接口获取数据。`api` 为纯前端实时渲染：构建时不请求，
访客每次进入页面由 `friends.js` 拉取并渲染（查看源代码为空、无 SEO；需要接口允许跨域，
即返回 `Access-Control-Allow-Origin`）。获取失败或没有数据时整个远端网格不显示，不影响构建。
远程返回 `{"version": "v2", "content": [...]}`，仅取与静态相同的字段（`title/url/icon/description/feed`）和 `posts` 列表
（`posts[].title / posts[].link / posts[].published`，最多取前 3 篇），其余字段忽略；
有 `feed` 的靠前、无 `feed` 的靠后。`group` 与 `api` 混用时 `group` 被忽略，
要同时展示静态与远端请写两个块（如友链页现状）：

**写法：**

{% raw %}
```jinja
{{ <friends group="developer" /> }}
{{ <friends /> }}
{{ <friends api="https://example.com/api/friends" /> }}
```
{% endraw %}

**效果（developer 分组）：**

{{ <friends group="developer" /> }}

### poetry 诗词

**写法：**
{% raw %}
```jinja
{% <poetry title="春晓" author="孟浩然"> %}
春眠不觉晓，处处闻啼鸟。

夜来风雨声，花落知多少。
{% </poetry> %}
```
{% endraw %}

**效果：**

{% <poetry title="春晓" author="孟浩然"> %}
春眠不觉晓，处处闻啼鸟。

夜来风雨声，花落知多少。
{% </poetry> %}

### tabs 多标签页

**写法：**

{% raw %}
````jinja
{% <tabs> %}
<!-- tab bash -->

```bash
echo "hello"
```

<!-- tab powershell -->
```powershell
Write-Output "hello"
```

{% </tabs> %}
````
{% endraw %}

`<!-- tab 名称 -->` 为面板分隔符，标签名会自动小写显示。

**效果：**

{% <tabs> %}
<!-- tab bash -->
```bash
echo "hello"
```
<!-- tab powershell -->
```powershell
Write-Output "hello"
```
<!-- tab javascript -->
```javascript
console.log("hello")
```
{% </tabs> %}

## Wiki 章节

创建目录和 `_index.md`：

```text
content/wiki/my-guide/
├── _index.md
├── 01-start.md
└── 02-config.md
```

`_index.md`：

```toml
+++
title = "我的指南"
description = "一句话介绍这个项目，显示在 Wiki 列表的卡片摘要中。"
sort_by = "weight"
template = "section.html"
page_template = "page.html"
+++
```

章节文章使用 `weight` 排序；Wiki 导航来自目录结构。

> [!NOTE]
> Wiki 项目首页即 `_index.md` 是一个 Section，没有 `page.summary`，`<!-- more -->` 对它无效。
> 如需在 Wiki 列表中正常显示摘要，必须在 Front Matter 写 `description`；不写则回退为正文截断（会把正文一起显示）。

## 自定义样式

在站点根目录创建 `static/css/custom.css`，然后注入：

```toml
[extra.inject]
head = [
  { rel = "stylesheet", href = "/css/custom.css" },
]
```

示例：

```css
:root {
  --accent: #0ea5e9;
}
```
