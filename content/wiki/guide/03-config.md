+++
title = "03 · 配置详解"
date = 2026-09-02
weight = 3
description = "逐项说明 zola.toml 的配置，覆盖所有常用项，开箱即用。"
+++

根配置为站点根目录的 `zola.toml`。下文按区块说明字段含义、取值与默认值，完整示例见仓库根 `zola.toml`。使用 Git 子模块时需额外设置 `theme = "elysia"`。

## 基础与构建

```toml
base_url = "https://example.com"
title = "我的博客"
description = "记录文章和笔记"
default_language = "zh"
compile_sass = false
build_search_index = false
generate_feeds = true
feed_filenames = ["atom.xml"]
minify_html = false
theme = "elysia"  # 仅子模块方式需要
```

- `base_url`：线上真实地址，影响链接、Feed、sitemap 与 canonical。上线前必改。
- `default_language`：默认语言，如 `zh` / `en`。
- `compile_sass`：本主题不使用 Sass，保持 `false`。
- `build_search_index`：Zola 自带索引，本主题不用（默认 Pagefind 本地索引，另可选 Algolia），保持 `false`。
- `generate_feeds` / `feed_filenames`：生成 `atom.xml` 等订阅。
- `theme`：主题目录名，仅在 `themes/elysia/` 方式下需要。

## Taxonomies

```toml
taxonomies = [
  {name = "categories", feed = true, paginate_by = 12, paginate_path = "page"},
  {name = "tags", feed = true, paginate_by = 12, paginate_path = "page"},
]
```

- `categories` / `tags` 为内置分类与标签，必须通过 `[taxonomies]` 写入文章，前台才会计数。
- `paginate_by`：taxonomy 列表分页数；`feed`：是否生成订阅。

## Slugify

```toml
[slugify]
paths = "on"
taxonomies = "off"
anchors = "on"
```

- `taxonomies = "off"`：保留中文分类/标签原文，否则会被转写导致 404。
- `paths` / `anchors`：路径与锚点转写规则，一般保持默认。

## Markdown

```toml
[markdown]
render_emoji = true
github_alerts = true
bottom_footnotes = true

[markdown.highlighting]
theme = "catppuccin-mocha"
style = "class"
```

- `render_emoji`：支持 `:smile:` 简码。
- `github_alerts`：支持 `> [!NOTE]` / `> [!TIP]` / `> [!WARNING]` 等。
- `bottom_footnotes`：脚注沉底。
- `highlighting.style = "class"`：以 CSS class 输出高亮，配合 `giallo.css` 与主题亮/暗覆写；`theme` 为构建期语法色。

## Extra — 站点身份与页脚

```toml
[extra]
avatar = "/avatar.jpg"
avatar_alt = "Elysia"
site_motto = "记录、分享与阅读"
footer = "© 2026 我的博客"
```

- `avatar`：头像路径（`static/` 下）。
- `site_motto`：侧边栏标语。
- `footer`：页脚，支持 Markdown，可嵌入 HTML / 脚本。

## 备案信息

```toml
[extra.filing]
icp = ""
police = ""
moe = ""
```

三项分别对应 ICP、公安、萌 ICP，留空不显示。其中萌 ICP 只需填写萌号数字（如 `20268080`），主题会自动拼接"萌 ICP 备案 X 号"并链接到查询页。

## 导航与多语言

菜单仅维护一套，显示文本由 `translations` 提供：

```toml
[[extra.menus]]
name_key = "menu_blog"
url = "/"
icon = "✍️"

[[extra.menus]]
name_key = "menu_wiki"
url = "/wiki/"
icon = "📚"

[translations]
menu_blog = "博客"
menu_wiki = "Wiki"

[languages.en.translations]
menu_blog = "Blog"
menu_wiki = "Wiki"
```

- `name_key` 必须在 `[translations]` 与各 `[languages.<code>.translations]` 中同时存在。
- `url` 使用不带语言前缀的路径（如 `/wiki/`），模板按 `cur_lang` 自动加前缀。
- 新增/删除菜单时，同步增删翻译 key。

模板通过 `trans(key=item.name_key, lang=cur_lang)` 渲染；侧边栏地球图标根据 `config.languages` 自动显示语言切换。

## 社交链接

```toml
[[extra.socials]]
name = "GitHub"
url = "https://github.com/yourname"
icon = "github"

[[extra.socials]]
name = "RSS"
url = "/atom.xml"
icon = "rss"
```

- 内置 SVG：`github` / `rss` / `mail`，其他值按 Emoji 或文本原样渲染。

## 注入与样式

```toml
[extra.inject]
head = [
  { rel = "stylesheet", href = "https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web/style.css" },
  { rel = "stylesheet", href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" },
]

[extra.style]
default_theme = "auto"      # auto | light | dark
default_palette = "default" # default | lime | orange | violet

[extra.style.fonts]
root_size = "16px"
body_size = "16px"
code_block_size = "14px"
body_family = ["LXGW WenKai Screen", "Inter", "system-ui", "sans-serif"]
code_block_family = ["JetBrains Mono", "ui-monospace", "monospace"]
```

- `inject.head`：任意 `<link>` / `<script>` 注入，用于加载网络字体或自定义 CSS。
- `default_theme` / `default_palette`：首屏默认值，`auto` 跟随系统，用户切换后持久化到 `localStorage`。
- `fonts`：数组即 CSS 字体栈；`root_size` 为 `html` 字号，`body_size` 为正文字号，`code_block_size` 为代码块字号。简历页不继承正文字体设置。

调色盘：

| 值 | 亮色 `--accent` | 暗色 |
| --- | --- | --- |
| `default` | `#18181b` | `#fafafa` |
| `lime` | `#5a7f2a` | `#8ab64a` |
| `orange` | `#ea580c` | `#fb923c` |
| `violet` | `#7c3aed` | `#a78bfa` |

## 功能开关

```toml
[extra.features]
year_progress = true
toc = true
code_line_numbers = true
paginate_by = 5
show_reading_time = true
```

- `year_progress`：侧边栏年进度条。
- `toc`：文章右侧目录（`##` 起）。
- `code_line_numbers`：代码行号。
- `paginate_by`：首页列表每页数量。
- `show_reading_time`：标题下方阅读时间。

## 搜索

```toml
[extra.search]
enable = true              # 总开关，false 则关闭搜索框与搜索页
provider = "pagefind"      # pagefind（默认，本地索引）| algolia | none
hits_per_page = 8          # 侧栏下拉结果数
placeholder = "search_placeholder"   # 搜索框提示文案的翻译 key

[extra.pagefind]
path = "pagefind/"         # Pagefind bundle 输出目录（站内相对路径）
```

- `pagefind`：零配置；每次构建后运行 `pagefind_extended --site public` 生成索引（仓库根目录已附带 `pagefind_extended` 二进制，CI 会自动执行）。`[extra.pagefind].path` 为索引输出目录。搜索页直接使用 Pagefind 官方 UI，侧栏为主题定制下拉。
> [!warning]
> 中文站必须使用 `pagefind_extended`（而非普通版 `pagefind`）：普通版不含中文分词，中文基本搜不出来。[Pagefind Releases](https://github.com/Pagefind/pagefind/releases) 下载对应平台的 `pagefind_extended` 包。
- `algolia`：沿用下方 `[extra.algolia]`（需 `app_id + api_key + index_name`），并将文章数据推送至对应 index。
- `placeholder` 为 `[translations]` 中的 key（如默认的 `search_placeholder`），按当前语言显示；自定义 key 必须在各语言 translations 中定义（与菜单 `name_key` 规则一致），否则构建报错。
- `search/_index.md` 为独立搜索页；侧边栏支持 `/` 聚焦，搜索页支持 `?q=` 直达。
- 索引是白名单制：仅博客正文与 wiki 叶子文章进索引，各类列表页（首页/目录/分类/标签/归档/友链/简历/搜索页/404）与加密正文自动排除；新增模板时，被搜页面须加 `data-pagefind-body` 标记，否则整页不会被收录。
- 搜索结果支持标题级跳转：主结果直达最匹配的小节 `#` 锚点（附该小节摘要）。

## Algolia 搜索

```toml
[extra.algolia]
app_id = "YOUR_APP_ID"
api_key = "YOUR_SEARCH_ONLY_KEY"
index_name = "YOUR_INDEX"
show_powered_by = true
```

- 使用 search-only key，勿提交 admin key。
- 启用后需将文章数据推送至对应 index（手动或爬虫抓取 `sitemap.xml`）。
- `search/_index.md` 为独立搜索页；侧边栏支持 `/` 聚焦。

## 评论

统一入口 `extra.comments`，`provider` 为唯一开关：

```toml
[extra.comments]
enable = true
provider = "giscus"  # giscus | artalk | waline | none
comment_title = "欢迎评论 — 留下你的想法"
```

- `enable = false` 全站关闭；单篇 `extra.comments = false` 可关闭当页。
- 未设置 `provider` 时，按 `giscus` → `artalk` → `waline` 是否填有服务地址自动推断。

### Giscus

```toml
[extra.giscus]
repo = "user/repo"
repo_id = ""
category = "General"
category_id = ""
mapping = "pathname"
strict = "0"
reactions_enabled = "1"
emit_metadata = "0"
input_position = "top"
theme = "preferred_color_scheme"
lang = "zh-CN"
loading = "lazy"
```

均为 Giscus 官方字段，按其文档填入。

### Artalk

```toml
[extra.artalk]
server = "https://artalk.example.com"
site = ""
placeholder = ""
no_comment = ""
emit_own = false
page_key = ""
gravatar_mirror = ""
avatar_mirror = ""
```

### Waline

```toml
[extra.waline]
serverURL = "https://waline.example.com"
lang = "zh-CN"
dark = "auto"
emoji = ["https://unpkg.com/@waline/emojis@1.1.0/bilibili"]
meta = ["nick", "mail", "link"]
requiredMeta = ["nick", "mail"]
login = "false"
placeholder = ""
```

## 文章过期提示

```toml
[extra.article_expiry]
enable = true
days = 90

[translations]
article_expiry = "本文最后更新于 {date}，已超过 {days} 天未更新，内容可能已过时，请注意甄别。"

[languages.en.translations]
article_expiry = "This article was last updated on {date} and has not been updated for over {days} days. The content may be outdated, please verify the information."
```

- `days`：阈值天数，超过即显示。
- 文案通过 `translations` 的 `article_expiry` 管理，支持占位符 `{days}` `{date}` `{diff}`。
- 单篇覆盖：`extra.expiry = false` 关闭；`extra.expiry_days` 覆写天数；`extra.expiry_text` 覆写文案。

## KaTeX

```toml
[extra.katex]
enable = true
# css_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
# js_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
# auto_render_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
```

启用后正文可写 `$E=mc^2$` 与 `$$...$$`，可选字段用于自托管 CDN。

## 多语言

```toml
default_language = "zh"

[translations]
menu_blog = "博客"
menu_wiki = "Wiki"
menu_archive = "归档"
menu_categories = "分类"
menu_tags = "标签"
menu_heatmap = "热力图"
menu_resume = "简历"
menu_friends = "友链"
menu_links = "工具集"
toc_title = "目录"
toc_on_this_page = "本页目录"
article_expiry = "本文最后更新于 {date}，已超过 {days} 天未更新，内容可能已过时，请注意甄别。"

[languages.en]
title = "Elysia EN"
description = "A modern minimalist Zola theme — Reading is enjoyment."
generate_feeds = true
taxonomies = [{name = "categories", feed = true}, {name = "tags", feed = true}]

[languages.en.translations]
menu_blog = "Blog"
menu_wiki = "Wiki"
menu_archive = "Archive"
menu_categories = "Categories"
menu_tags = "Tags"
menu_heatmap = "Heatmap"
menu_resume = "Resume"
menu_friends = "Friends"
menu_links = "Tools"
toc_title = "On this page"
toc_on_this_page = "On this page"
article_expiry = "This article was last updated on {date} and has not been updated for over {days} days. The content may be outdated, please verify the information."
```

- URL 按 `cur_lang != default_language` 自动加前缀（如 `/en/wiki/`）。
- 自定义 Section（`archive` / `heatmap` / `friends` / `links` / `search` / `resume`）需为每种语言创建对应的 `content/<section>/_index.<lang>.md` 或 `resume.<lang>.md`，否则对应语言下 404。

## Front Matter 速查

```toml
+++
title = "示例"
date = 2026-03-03
updated = 2026-03-10
weight = 1
description = "摘要"
[taxonomies]
categories = ["技术"]
tags = ["zola"]
[extra]
sticky = true          # 置顶：sticky / top / pinned 任一
encrypted = true
password = "1234"
password_hint = "提示"
style = "blog"        # 仅作标记，版式由 template 决定
expiry = false         # 关闭本篇过期提示
expiry_days = 60
expiry_text = "自定义 {date} {days} {diff}"
comments = false       # 关闭本篇评论
+++
```

- `categories` / `tags` 必须在 `[taxonomies]` 下且加引号。
- `weight` 用于 Wiki 排序；`style` 为约定字段，真正版式由 `template` 决定。
