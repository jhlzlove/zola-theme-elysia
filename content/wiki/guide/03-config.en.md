+++
title = "03 · Configuration"
date = 2026-09-02
weight = 3
description = "Every zola.toml option, with copy-ready snippets."
+++

Site configuration lives in the root `zola.toml`. The sections below cover the type, values, and defaults; the repository's `zola.toml` contains the full working example. Add `theme = "elysia"` only when using the theme as a Git submodule.

## Base and build

```toml
base_url = "https://example.com"
title = "My Blog"
description = "Posts and notes"
default_language = "en"
compile_sass = false
build_search_index = false
generate_feeds = true
feed_filenames = ["atom.xml"]
minify_html = false
theme = "elysia"  # only when installed as themes/elysia
```

- `base_url` must be the production URL; it affects links, feeds, sitemap, and canonical URLs.
- `compile_sass` / `build_search_index` stay `false` for this theme.
- `generate_feeds` / `feed_filenames` control feed output.

## Taxonomies

```toml
taxonomies = [
  {name = "categories", feed = true, paginate_by = 12, paginate_path = "page"},
  {name = "tags", feed = true, paginate_by = 12, paginate_path = "page"},
]
```

- `categories` / `tags` must be written under `[taxonomies]` in posts, otherwise counts remain zero.
- `paginate_by` controls per-page size; `feed` controls feed generation.

## Slugify

```toml
[slugify]
paths = "on"
taxonomies = "off"
anchors = "on"
```

- `taxonomies = "off"` keeps non-ASCII names (e.g., Chinese) unchanged. Keep it `off` for Chinese sites.

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

- `render_emoji` enables `:smile:` shortcuts.
- `github_alerts` enables `> [!NOTE]` / `> [!TIP]` / `> [!WARNING]`.
- `bottom_footnotes` collects footnotes at the bottom.
- `style = "class"` outputs highlighting as CSS classes combined with `giallo.css` and light/dark overrides.

## Extra — identity and footer

```toml
[extra]
avatar = "/avatar.jpeg"
avatar_alt = "Site avatar"
site_motto = "Notes, sharing, and reading"
footer = "© 2026 My Blog"
```

- `footer` supports Markdown and raw HTML.

## Filing

```toml
[extra.filing]
icp = ""
police = ""
moe = ""
```

ICP, public security, and Moe ICP numbers. Empty values are not rendered. For Moe ICP, just fill in the number (e.g. `20268080`); the theme renders "萌 ICP 备案 X 号" with a lookup link automatically.

## Navigation and translations

Maintain one menu list; visible labels come from `translations`:

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
menu_blog = "Blog"
menu_wiki = "Wiki"

[languages.zh.translations]
menu_blog = "博客"
menu_wiki = "Wiki"
```

- `name_key` must exist in `[translations]` and every `[languages.<code>.translations]`.
- `url` stays language-agnostic (e.g., `/wiki/`); the template prefixes it by `cur_lang`.
- Rendering uses `trans(key=item.name_key, lang=cur_lang)`; the globe icon appears based on `config.languages`.

## Social links

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

- Built-in SVG icons: `github` / `rss` / `mail`; other values are rendered as Emoji or text.

## Inject and style

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
body_family = ["Inter", "system-ui", "sans-serif"]
code_block_family = ["JetBrains Mono", "ui-monospace", "monospace"]
```

- `inject.head` loads web fonts or custom CSS.
- `default_theme` / `default_palette` are first-paint defaults; toggles persist to `localStorage`.
- Font arrays become CSS stacks; resume page does not inherit body font settings.

Palettes:

| Value | Light `--accent` | Dark |
| --- | --- | --- |
| `default` | `#18181b` | `#fafafa` |
| `lime` | `#5a7f2a` | `#8ab64a` |
| `orange` | `#ea580c` | `#fb923c` |
| `violet` | `#7c3aed` | `#a78bfa` |

## Feature switches

```toml
[extra.features]
year_progress = true
toc = true
code_line_numbers = true
paginate_by = 5
show_reading_time = true
```

- `year_progress`: sidebar year progress bar.
- `toc`: right-side table of contents starting from `##`.
- `code_line_numbers`: code line numbers.

## Search

```toml
[extra.search]
enable = true              # master switch; false disables the search box and page
provider = "pagefind"      # pagefind (default, local index) | algolia | none
hits_per_page = 8          # sidebar dropdown result count
placeholder = "search_placeholder"   # translation key for the input placeholder

[extra.pagefind]
path = "pagefind/"         # Pagefind bundle output dir (relative to site root)
```

- `pagefind`: zero config; run `pagefind_extended --site public` after each build to generate the index (a `pagefind_extended` binary ships in the repo root, CI runs it automatically). `[extra.pagefind].path` controls the bundle output dir. The search page embeds Pagefind's own UI; the sidebar uses a theme-styled dropdown.
> [!warning]
> Sites with Chinese content must use `pagefind_extended` instead of the regular `pagefind` binary: the regular build has no Chinese segmentation and Chinese queries will largely return nothing. On Windows use the `pagefind_extended.exe` in the repo root; on Linux/macOS download the matching `pagefind_extended` archive from [Pagefind Releases](https://github.com/Pagefind/pagefind/releases).
- `algolia`: uses `[extra.algolia]` below (`app_id + api_key + index_name` required), plus pushing content to the index.
- `placeholder` is a key in `[translations]` (e.g. the default `search_placeholder`), rendered in the current language; a custom key must be defined in every language's translations (same rule as menu `name_key`), otherwise the build fails.
- `search/_index.md` is the standalone search page; `/` focuses the sidebar input, `?q=` deep-links the search page.
- Indexing is allowlist-based: only blog posts and wiki leaf articles are indexed; list pages (home/sections/categories/tags/archive/friends/resume/search/404) and encrypted bodies are excluded automatically. New templates must add a `data-pagefind-body` marker to searchable regions, or the page will be silently skipped.
- Heading-level jumps are supported: the main result links straight to the best-matching section `#` anchor (with that section's excerpt).

## Algolia search

```toml
[extra.algolia]
app_id = "YOUR_APP_ID"
api_key = "YOUR_SEARCH_ONLY_KEY"
index_name = "YOUR_INDEX"
show_powered_by = true
```

- Use a search-only key. Push content to the index separately (manual or crawler on `sitemap.xml`).
- `search/_index.md` is the standalone search page; `/` focuses the search input.

## Comments

One entry point, `provider` is the switch:

```toml
[extra.comments]
enable = true
provider = "giscus"  # giscus | artalk | waline | none
comment_title = "Leave a comment"
```

- `enable = false` disables site-wide; `extra.comments = false` in a page disables that page.
- If `provider` is empty, the theme infers it from whether `giscus` / `artalk` / `waline` is configured.

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

All official Giscus fields.

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

## Article expiry

```toml
[extra.article_expiry]
enable = true
days = 90

[translations]
article_expiry = "This article was last updated on {date} and has not been updated for over {days} days. The content may be outdated, please verify the information."

[languages.zh.translations]
article_expiry = "本文最后更新于 {date}，已超过 {days} 天未更新，内容可能已过时，请注意甄别。"
```

- `days` is the threshold. Copy supports `{days}` `{date}` `{diff}` placeholders.
- Per-page overrides: `extra.expiry = false` disables; `extra.expiry_days` overrides threshold; `extra.expiry_text` overrides text.

## KaTeX

```toml
[extra.katex]
enable = true
# css_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
# js_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
# auto_render_url = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
```

Enables `$E=mc^2$` and `$$...$$`. Optional URLs allow self-hosted CDN.

## Languages

```toml
default_language = "en"

[translations]
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

[languages.zh]
title = "Elysia"
description = "A modern minimalist Zola theme"
generate_feeds = true
taxonomies = [{name = "categories", feed = true}, {name = "tags", feed = true}]

[languages.zh.translations]
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
```

- URLs are prefixed by `cur_lang != default_language` (e.g., `/zh/wiki/`).
- Custom sections (`archive` / `heatmap` / `friends` / `links` / `search` / `resume`) need an `_index.<lang>.md` or `resume.<lang>.md` per language, otherwise 404.

## Front Matter quick reference

```toml
+++
title = "Example"
date = 2026-03-03
updated = 2026-03-10
weight = 1
description = "Summary"
[taxonomies]
categories = ["Tech"]
tags = ["zola"]
[extra]
sticky = true          # pinned: sticky / top / pinned
encrypted = true
password = "1234"
password_hint = "hint"
style = "blog"        # marker only, layout is determined by template
expiry = false
expiry_days = 60
expiry_text = "Custom {date} {days} {diff}"
comments = false
+++
```

- `categories` / `tags` must be under `[taxonomies]` and quoted.
- `weight` orders Wiki chapters; `style` is conventional, layout comes from `template`.
