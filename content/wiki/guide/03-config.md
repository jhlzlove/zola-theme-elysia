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
light_theme = "ayu-light"
dark_theme = "ayu-dark"
style = "class"
```

- `render_emoji`：支持 `:smile:` 简码。
- `github_alerts`：支持 `> [!NOTE]` / `> [!TIP]` / `> [!WARNING]` 等。
- `bottom_footnotes`：脚注沉底。
- `highlighting`：`style` 必须为 `"class"`；`light_theme` / `dark_theme` 双主题构建期生成 `giallo-light.css` / `giallo-dark.css`，由站内亮暗切换按需启用。只写单个 `theme` 会导致暗色切换无高亮样式。

## Extra — 站点身份与页脚

```toml
[extra]
avatar = "/avatar.jpg"
avatar_alt = "Elysia"
site_motto = "记录、分享与阅读"

[extra.footer]
text = "© 2026 我的博客"
icp = ""
police = ""
moe = ""
```

- `avatar`：头像路径（`static/` 下）。
- `site_motto`：侧边栏标语。
- `footer.text`：页脚，支持 Markdown，可嵌入 HTML / 脚本；留空则不显示页脚文本行。
- `footer.icp` / `footer.police` / `footer.moe`：备案信息，分别对应 ICP、公安、萌 ICP，留空不显示。其中萌 ICP 只需填写萌号数字（如 `2026xxxx`），主题会自动拼接"萌 ICP 备案 X 号"并链接到查询页。

## 导航与多语言

菜单名称支持 `name` / `name_key` 双模式（与 `[extra.features].i18n` 开关正交，均可用）：

```toml
# 模式一：直接写名称，零 translations 维护成本
[[extra.menus]]
name = "博客"
url = "/"
icon = "✍️"

# 模式二：经 translations 翻译（多语言站点推荐）
[[extra.menus]]
name_key = "menu_wiki"
url = "/wiki/"
icon = "📚"

[translations]
menu_wiki = "Wiki"

[languages.en.translations]
menu_wiki = "Wiki"
```

- 只写 `name`：直接显示；只写 `name_key`：经 `trans(key, lang=cur_lang)` 翻译，需在 `[translations]` 与各 `[languages.<code>.translations]` 中同时存在；两者都写时 `name` 优先。
- `url` 使用不带语言前缀的路径（如 `/wiki/`），模板按 `cur_lang` 自动加前缀。
- 语言切换器（侧栏地球图标）仅在 `[extra.features].i18n = true`（默认）**且**配置了 `config.languages` 时显示，按 `default_language + config.languages` 动态渲染；`i18n = false` 则整个隐藏。单语言用户可直接 `i18n = false` + 全用 `name`，并删除 `[languages.en]` 与 `*.en.md`。

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
default_palette = "default" # default | lime | orange | violet
font_base_size = "16px"
font_body_size = "16px"
font_code_size = "14px"
font_body_family = ["LXGW WenKai Screen", "Inter", "system-ui", "sans-serif"]
font_code_family = ["JetBrains Mono", "ui-monospace", "monospace"]
```

- `inject.head`：任意 `<link>` / `<script>` 注入，用于加载网络字体或自定义 CSS。
- `default_palette`：首屏调色默认值，用户切换后持久化到 `localStorage`。
- `font_*`：数组即 CSS 字体栈；`font_base_size` 为全站基准字号（除正文/代码/简历外的 UI 文字都以此缩放），`font_body_size` 为文章正文字号（全端生效），`font_code_size` 为代码块字号。简历页为定宽打印版式，不跟随这三项。Giscus/Artalk 评论为外部 iframe，不受 `font_base_size` 影响（Waline 跟随）。

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
show_reading_time = true
i18n = true
# 文章过期提示 / 许可声明 / 公式见下文同表字段
expiry_enable = true
expiry_days = 90
license_enable = true
katex_enable = true
lightbox_enable = true
```

- `year_progress`：侧边栏年进度条。
- `toc`：文章右侧目录（`##` 起）。
- `code_line_numbers`：代码行号。
- `show_reading_time`：标题下方阅读时间。
- `i18n`：多语言切换器总开关，默认 `true`；`false` 则隐藏侧栏语言切换器（菜单 `name` / `name_key` 双模式均不受影响）。
- `expiry_enable` / `expiry_days`：文章过期提示总开关与阈值天数（文案见下节）。
- `license_enable`：文章许可声明总开关。
- `katex_enable`：`$...$` / `$$...$$` 数学公式总开关。
- `lightbox_enable`：正文图片点击放大总开关，默认 `true`；`false` 则点击走原链接。

## 搜索

```toml
[extra.search]
enable = true              # 总开关，false 则关闭搜索框与搜索页
provider = "pagefind"      # pagefind（默认，本地索引）| algolia | none
hits_per_page = 8          # 侧栏下拉结果数
placeholder = "search_placeholder"   # 搜索框提示文案的翻译 key
pagefind_path = "pagefind/"         # Pagefind bundle 输出目录（站内相对路径）

[extra.search.algolia]
app_id = "YOUR_APP_ID"
api_key = "YOUR_SEARCH_ONLY_KEY"
index_name = "YOUR_INDEX"
show_powered_by = true
```

- `pagefind`：无需申请 key；每次构建后运行 `pagefind_extended --site public` 生成索引（`pagefind_extended` 需到 [Pagefind Releases](https://github.com/Pagefind/pagefind/releases) 下载对应平台的包，CI 会自动下载执行）。`pagefind_path` 为索引输出目录。搜索页直接使用 Pagefind 官方 UI，侧栏为主题定制下拉。
> [!warning]
> 中文站必须使用 `pagefind_extended`（而非普通版 `pagefind`）：普通版不含中文分词，中文基本搜不出来。[Pagefind Releases](https://github.com/Pagefind/pagefind/releases) 下载对应平台的 `pagefind_extended` 包。
- `algolia`：使用 `[extra.search.algolia]`（需 `app_id + api_key + index_name`，search-only key，勿提交 admin key），并将文章数据推送至对应 index（手动或爬虫抓取 `sitemap.xml`）。
- `placeholder` 为 `[translations]` 中的 key（如默认的 `search_placeholder`），按当前语言显示；自定义 key 必须在各语言 translations 中定义（与菜单 `name_key` 规则一致），否则构建报错。
- `search/_index.md` 为独立搜索页；侧边栏支持 `/` 聚焦，搜索页支持 `?q=` 直达。
- 索引是白名单制：仅博客正文与 wiki 叶子文章进索引，各类列表页（首页/目录/分类/标签/归档/友链/简历/搜索页/404）与加密正文自动排除；新增模板时，被搜页面须加 `data-pagefind-body` 标记，否则整页不会被收录。
- 搜索结果支持标题级跳转：主结果直达最匹配的小节 `#` 锚点（附该小节摘要）。

## API 服务

外部接口按服务独立成子表，后续加新服务只需追加 `[extra.api.xxx]`：

```toml
[extra.api.sitemap]
enable = false
api = "https://melodious-lily-64ecd1.netlify.app/.netlify/functions/index?url={href}"
```

- `sitemap`：`link` 卡片元数据增强。访客打开页面时用卡片 `href` 请求接口（`{href}` 占位符替换为 `encodeURIComponent(href)`，10s 超时），成功则用返回的 `title` / `desc` / `icon` 覆盖卡片（接口优先），失败/超时则保留用户手写信息（纯 CSR，构建期不请求，无 SEO）。
- `enable = false` 或整表缺失时不输出请求、不加载 `static/js/sitemap.js`。

## 评论

统一入口 `extra.comments`，`provider` 为唯一开关：

```toml
[extra.comments]
enable = true
provider = "giscus"  # giscus | artalk | waline | none
comment_title = "欢迎评论 — 留下你的想法"
```

- `enable = false` 全站关闭；单篇 `extra.comments = false` 可关闭当页。
- `provider` 为唯一开关，不再按服务地址自动推断。

### Giscus

```toml
[extra.comments.giscus]
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
```

均为 Giscus 官方字段，按其文档填入。

### Artalk

```toml
[extra.comments.artalk]
server = "https://artalk.example.com"
site = ""
placeholder = ""
no_comment = ""
page_key = ""
gravatar_mirror = ""
avatar_mirror = ""
```

### Waline

```toml
[extra.comments.waline]
serverURL = "https://waline.example.com"
lang = "zh-CN"
dark = "auto"
emoji = ["https://unpkg.com/@waline/emojis@1.1.0/bilibili"]
meta = ["nick", "mail", "link"]
requiredMeta = ["nick", "mail"]
login = "false"
placeholder = ""
```

评论行为脚本已拆为 `static/js/comment.js`，仅在有评论的文章页按需加载（主题切换经 `elysia:theme-change` 事件同步评论区暗色）。

## 文章过期提示

```toml
[extra.features]
expiry_enable = true
expiry_days = 90

[translations]
article_expiry = "本文最后更新于 {date}，距今已有 {diff} 天（超过 {days} 天未更新），内容可能已过时，请注意甄别。"

[languages.en.translations]
article_expiry = "This article was last updated on {date} ({diff} days ago, over the {days}-day threshold). The content may be outdated, please verify the information."
```

- `expiry_days`：阈值天数，超过即显示。
- 文案通过 `translations` 的 `article_expiry` 管理，支持占位符 `{date}`（最后更新日期） `{diff}`（距今实际天数） `{days}`（阈值天数）。
- 单篇覆盖：`extra.expiry = false` 关闭；`extra.expiry_days` 覆写天数；`extra.expiry_text` 覆写文案。

## KaTeX

```toml
[extra.features]
katex_enable = true
# katex_css_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
# katex_js_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
# katex_auto_render_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
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
article_expiry = "本文最后更新于 {date}，距今已有 {diff} 天（超过 {days} 天未更新），内容可能已过时，请注意甄别。"

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
article_expiry = "This article was last updated on {date} ({diff} days ago, over the {days}-day threshold). The content may be outdated, please verify the information."
```

- URL 按 `cur_lang != default_language` 自动加前缀（如 `/en/wiki/`）。
- 自定义 Section（`archive` / `heatmap` / `friends` / `links` / `search` / `resume`）需为每种语言创建对应的 `content/<section>/_index.<lang>.md` 或 `resume.<lang>.md`，否则对应语言下 404。
- 不想要多语言：设 `[extra.features].i18n = false`，菜单全用 `name` 直写，删除 `[languages.en]` 与 `*.en.md` 即可；`[translations]`（默认语言文案）仍需保留供搜索框/目录/过期提示/许可声明使用。

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
sticky = true          # 置顶：sticky / top / pinned 任一为真即置顶
encrypted = true
password = "blog"      # 密码别名，对应 encrypt.toml [passwords] 的 key，真密码只写在那里
password_hint = "提示"
expiry = false         # 关闭本篇过期提示
expiry_days = 60
expiry_text = "自定义 {date} {diff} {days}"
comments = false       # 关闭本篇评论
+++
```

- `categories` / `tags` 必须在 `[taxonomies]` 下且加引号。
- 版式由文件位置与 `_index.md` 的 `template` / `page_template` 决定（`content/blog/` 为博客，`content/wiki/` 子目录为 Wiki），不要写 `extra.style`。
- `weight` 仅用于 Wiki 排序（`sort_by = "weight"` 的目录）；博客排序只看 `date`。
- `password` 是别名而非真密码，加密流程见第 04 章。
