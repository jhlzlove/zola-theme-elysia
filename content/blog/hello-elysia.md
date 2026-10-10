+++
title = "你好，Elysia — 现代化 Zola 主题初体验"
date = 2026-09-02
[taxonomies]
categories = ["THEME", "zola"]
tags = ["zola", "elysia", "design"]

[extra]
sticky = true
+++

欢迎使用 **Elysia**！这是一篇置顶文章（日期较早的置顶会排在前面，因为多置顶按日期正序）。

<!-- more -->

[hexo-theme-stellar]: https://github.com/xaoxuu/hexo-theme-stellar
[hugo-theme-reimu]: https://github.com/D-Sketon/hugo-theme-reimu

## zola 0.23+ 版本

0.23+ 是个破坏性更新，可以理解为大版本的更新，移除了 shortcode 的支持，所有类似的功能通过 component 组件进行支持。

官方参考链接：https://github.com/getzola/zola/blob/master/CHANGELOG.md#0230-2026-08-05

## zola 组件写法

zola 的组件主要分为两种：行组件和块组件。写法如下：

- 行写法：

  {% raw %}
  ```md
  {{ <component-name parameter=""/> }}
  ```
  {% endraw %}

- 块写法：

  {% raw %}
  ```md
  {% <component-name parameter=""> %}
  some text...
  {% </component-name> %}
  ```
  {% endraw %}

## 内容组织与目录结构

```text
content/
├── _index.md                 # 博客首页
├── blog/
│   ├── _index.md             # 博客入口
│   └── first-post.md         # 文章
├── wiki/
│   ├── _index.md             # Wiki 首页
│   └── guide/
│       ├── _index.md         # 一个 Wiki 目录
│       └── 01-intro.md       # 目录中的文章
├── resume.md                 # 独立简历页
├── archive/_index.md         # 归档页
├── categories/_index.md      # 分类页
├── tags/_index.md            # 标签页
├── heatmap/_index.md         # 热力图
├── search/_index.md          # 搜索页
├── friends/_index.md         # 友链页
└── links/_index.md           # 链接集合页
```

Zola 使用 `_index.md` 表示一个 section。Wiki 子目录中的文章会自然属于该目录；目录标题来自对应的 `_index.md`。

## zola 嵌套目录的局限性

content 目录中有子目录嵌套时，子目录想要在父级列表中显示必须要有 `_index.md` 文件，里面至少有一行内容 `transparent = true`，这表示内层的文章使用和父级相同的模板、排序、分页等规则。否则列表中不会显示（无法使用 zola 的 API 对象获取到）。这和 Hexo、Hugo 这些框架不太一样。

虽然不会被父级显示，但是 zola 是会编译该文章的，可以使用该文章的 url 直接访问，这样的页面官方称为“孤儿页”，访问孤儿页必须添加入口按钮才方便。~~（谁会手动输入 url 啊喂 😑）~~ 可以查看 `简历` 导航菜单(该页面类似于 “孤儿页”)，该菜单如果没有访问入口，列表中是不会存在该内容的，但是可以在地址栏直接输入链接访问。

## 博客与 Wiki 的区别

博客文章通常放在 `content/blog/` 下，由首页和归档聚合。Wiki 更适合教程、手册和持续维护的文档，放在 `content/wiki/` 的子目录中即可获得目录导航。

文章所属类型主要由文件位置和模板决定：

- 普通文章使用 `page.html`。
- Wiki 文章也使用 `page.html`，但通过所在目录显示 Wiki 导航。
- 简历使用 `template = "resume.html"`，不参与博客的上一篇/下一篇列表。

## 本主题不支持封面图

卡片式的布局使用封面图好看，不过本身也需要设计。之前自己使用过的 [hexo-theme-stellar] 主题和 [hugo-theme-reimu] 主题设计的带图片的列表挺好看的，喜欢的朋友可以去瞧瞧~

这个主题不打算使用图片封面，比较节省流量吧（虽然费不了多少）😄但是文章内部是支持图片组件的，目前没有引入 fancybox，后面有需要再说。

## 搜索

本地搜索使用 [Pagefind](https://pagefind.app/) 实现。网站构建后使用 `pagefind_extended --site public` 进行索引构建，只有索引后才能进行搜索。

> [!important]
> 需要使用 `pagefind_extended` 版本，extended 支持中文索引

也可以在 `[extra.search]` 中切换到 Algolia（需自行推送索引或使用 Algolia crawler）或 `none` 关闭。

## 利用好分类

由于 zola 孤儿页的影响，博客源文件建议一个目录平铺。但是建议给每篇文章添加分类或者标签，利用 zola 主题根据分类、标签进行聚合，方便找到同一分类的文章。

> [!tip]
> 如果有多个子目录且文章具备关联性，可以使用本主题提供的 wiki 布局。

## 博客

blog 目录中的文档。博客文章的 front matter 中建议包含以下几项，zola 支持 toml 或者 yaml 格式。

```md
<!--toml-->
+++
title = "你好，Elysia — 现代化 Zola 主题初体验"
date = 2026-01-15
[taxonomies]
categories = ["THEME", "ZOLA"]
tags = ["zola", "elysia", "design"]
description = "如果你喜欢使用在 front matter 中编写摘要，zola 也是支持的"
+++

<!--yaml-->
---
title: 你好，Elysia — 现代化 Zola 主题初体验
date: 2026-01-15
taxonomies:
  categories: ["THEME", "ZOLA"]
  tags: ["zola", "elysia", "design"]
description: "如果你喜欢使用在 front matter 中编写摘要，zola 也是支持的"
---
```

## wiki

`content/wiki/` 是 wiki 的目录，wiki 根目录的 `_index.md` 需要有以下内容：

```toml,name=content/wiki/_index.md,hl_lines=3-6
title = "Wiki"
description = "知识库 · 文档式布局"
sort_by = "date"
template = "wiki/grid.html"
page_template = "wiki/page.html"
transparent = false
```

> [!note]
> 重点是高亮的 3 ~ 6 行内容。此文件创建写入一次，之后保留此文件无需改动。

wiki 根目录中的每一个目录相当于一个项目，创建文件目录，仿照此站点结构的信息编写即可。

wiki 文章的 front matter 推荐包含以下内容：

```toml
title = "01 · 认识 Elysia"
date = 2026-03-01
weight = 1
[taxonomies]
  categories = ["xx"]
  tags = ["xxx"]
```

> [!note]
> 其中 `weight` 字段进行文章排序，属于必填字段之一。
>
> 原则上，wiki 文章不需要 taxonomies。但是考虑未来可能迁移到其它站点或主题，可能就不支持这种写法或是没有 wiki 的功能，建议和普通的博客文章一样包含 taxonomies，未来迁移方便修改。

## 简历页

简历是独立页面，不会继承博客侧栏和右侧文章目录。创建 `content/resume.md` 时使用：

```toml
title = "简历"
template = "resume.html"
[extra]
style = "resume"
name = "你的名字"
role = "软件工程师"
```

## 文章摘要

zola 的文章摘要支持不错，可以使用 front matter 中的 `description` 属性定义；也可以使用 `<!-- more -->`，不管中间有没有空格、多少空格都支持，这点儿比 hugo 好多了，hexo 到 zola 属于是无缝迁移。之前从 hexo 迁移到 hugo 时必须要改这个。

## 主题限制

wiki 相关文章自成一派，其中文章的 categories、tags 不会出现在导航菜单中的分类、标签页面。简历页面也是单独的，不在博客列表里面。

## 主题灵感

本主题的创作抄袭了以下开源项目或博客的布局 or 功能：

- [Hexo Stellar](https://xaoxuu.com/)
- [Hugo reimu](https://github.com/D-Sketon/hugo-theme-reimu)
- [BelResume](https://github.com/cx48/BelResume)
- [Hugo 椒盐豆豉](https://blog.douchi.space/)
- AI：Claude、ChatGPT、Opencode

使用说明详见：

{{ <link href="/wiki/guide" title="Elysia 完全指南" icon="/avatar.svg" desc="Elysia 的使用说明指南"/> }}

你也可以直接查看本项目的源码结构学习。
