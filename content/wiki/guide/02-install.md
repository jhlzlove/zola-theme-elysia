+++
title = "02 · 快速安装"
date = 2026-09-02
weight = 2
description = "安装 Zola，启动本地预览，并了解站点文件的位置。"
+++

## 环境要求

- Zola `0.23.4` 或更高版本。主题使用 Zola 0.23+ 的 component 语法。
- Git。使用主题仓库或 Git 子模块时需要。
- 一个可以编辑 UTF-8 文本的编辑器。

检查 Zola：

```bash
zola --version
```

## 直接使用本仓库

如果当前目录就是站点根目录：

```bash
zola serve --open
```

编辑 `content/` 或 `zola.toml` 后，预览页面会自动刷新。

生成静态文件：

```bash
zola build
```

构建结果位于 `public/`，这个目录可以上传到任意静态文件服务器。

## 使用 Git 子模块

将主题放入一个独立的 Zola 站点：

```bash
git init my-blog
cd my-blog
git submodule add https://github.com/jhlzlove/zola-theme-elysia.git themes/elysia
```

然后复制或参考主题根目录的 `zola.toml`，并确保站点配置包含：

```toml
theme = "elysia"
```

至少修改这些值：

```toml
base_url = "https://example.com"
title = "我的博客"
description = "我的个人网站"
default_language = "zh"
```

主题文件在 `themes/elysia/`，自己的文章和配置放在站点根目录。站点根目录中的 `templates/`、`static/` 和 `content/` 可以覆盖主题对应文件。`theme` 的值必须与 `themes/` 下的目录名一致。

版式由文件位置决定，无需额外标记：`content/blog/` 下为博客文章，`content/wiki/` 子目录下为 Wiki 文章，`content/resume.md` 为简历页，`content/archive/`、`heatmap/`、`search/`、`friends/`、`links/` 为对应功能页。

## 最小内容结构

```text
my-blog/
├── zola.toml
├── content/
│   ├── _index.md          # 首页：template = "index.html"，page_template = "blog/page.html"
│   └── blog/
│       ├── _index.md      # 博客入口：transparent = true，直通首页
│       └── first-post.md
├── static/
└── themes/
    └── elysia/
```

`content/_index.md`：

```toml
+++
title = "我的博客"
sort_by = "date"
paginate_by = 8
template = "index.html"
page_template = "blog/page.html"
+++
```

`content/blog/_index.md`：

```toml
+++
transparent = true
+++
```

创建文章时，在 Markdown 文件顶部写 Front Matter：

```toml
+++
title = "我的第一篇文章"
date = 2026-03-10
description = "文章摘要"
+++

正文从这里开始。
```

Wiki 与功能页的 `_index.md` 写法见第 05 章（`wiki/grid.html` / `wiki/doc.html` / `wiki/page.html`、`archive.html`、`heatmap.html`、`search.html`、`friends.html`、`links.html`、`resume.html`）。

## 常见问题

| 问题 | 处理方式 |
| --- | --- |
| 找不到 `components.html` | 升级到 Zola 0.23 或更高版本 |
| 页面样式不正确 | 检查 `base_url`，并确认主题路径与 `theme` 名称一致 |
| 中文分类或标签异常 | 使用 `[taxonomies]`，并保持配置中的 `slugify.taxonomies = "off"` |
| 端口被占用 | 使用 `zola serve --port 19191` |
| 修改后没有更新 | 重新启动 `zola serve`，或删除 `public/` 后重新构建 |

下一章介绍 `zola.toml` 中最常用的配置。
