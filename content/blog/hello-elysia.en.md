+++
title = "Hello, Elysia — A Modern Zola Theme"
date = 2026-09-02
[taxonomies]
categories = ["THEME", "zola"]
tags = ["zola", "elysia", "design"]

[extra]
sticky = true
+++

Welcome to **Elysia**! This is a pinned post (when multiple posts are pinned, earlier dates come first, since pinned posts sort by date ascending).

<!-- more -->

[hexo-theme-stellar]: https://github.com/xaoxuu/hexo-theme-stellar
[hugo-theme-reimu]: https://github.com/D-Sketon/hugo-theme-reimu

## Zola 0.23+

0.23+ is a breaking update — you can treat it as a major release. Shortcode support was removed, and everything similar is now provided through components.

Official reference: https://github.com/getzola/zola/blob/master/CHANGELOG.md#0230-2026-08-05

## Component syntax

Zola components come in two forms: inline and block.

- Inline:

  {% raw %}
  ```md
  {{ <component-name parameter=""/> }}
  ```
  {% endraw %}

- Block:

  {% raw %}
  ```md
  {% <component-name parameter=""> %}
  some text...
  {% </component-name> %}
  ```
  {% endraw %}

## Content layout

```text
content/
├── _index.md                 # Blog home
├── blog/
│   ├── _index.md             # Blog section
│   └── first-post.md         # A post
├── wiki/
│   ├── _index.md             # Wiki home
│   └── guide/
│       ├── _index.md         # A Wiki section
│       └── 01-intro.md       # A page in that section
├── resume.md                 # Independent resume page
├── archive/_index.md         # Archive
├── categories/_index.md      # Categories
├── tags/_index.md            # Tags
├── heatmap/_index.md         # Heatmap
├── search/_index.md          # Search page
├── friends/_index.md         # Friends
└── links/_index.md           # Link collections
```

Zola uses `_index.md` to declare a section. Articles inside a Wiki subdirectory naturally belong to it; the section title comes from its `_index.md`.

## Nested directories in Zola

When `content` has nested subdirectories, a subdirectory only shows up in its parent list if it contains an `_index.md` with at least one line, `transparent = true` — meaning pages inside use the same templates, sorting, and pagination rules as the parent. Otherwise the list won't show them (they can't be reached through Zola's API objects). This works differently from Hexo or Hugo.

Even when hidden from the parent, Zola still compiles these pages and they are reachable by direct URL. The docs call them "orphan pages", and visiting one is only convenient with an entry button. ~~(Who types URLs by hand? 😑)~~ See the `Resume` nav menu (that page works like an "orphan page"): without an entry point it never appears in any list, but you can still open it by typing its URL in the address bar.

## Blog vs Wiki

Blog posts usually live under `content/blog/` and are collected by the home page and archive. Wiki fits tutorials, manuals, and continuously maintained docs — placing pages in a subdirectory of `content/wiki/` is enough to get directory navigation.

The page type is mainly determined by file location and template:

- Regular posts use `page.html`.
- Wiki posts also use `page.html`, with Wiki navigation inferred from their directory.
- The resume uses `template = "resume.html"` and is excluded from blog previous/next navigation.

## No cover images

Card layouts look good with cover images, but those need careful design. I previously used [hexo-theme-stellar] and [hugo-theme-reimu], whose image lists look quite nice — worth a look if you like that style~

This theme intentionally skips image covers to save bandwidth (though it wouldn't cost much) 😄. Images inside posts are supported via the image component; fancybox hasn't been introduced yet — that can wait until it's actually needed.

## Search

Local search is implemented with [Pagefind](https://pagefind.app/). After building the site, run `pagefind_extended --site public` to build the index — search only works once indexed.

> [!important]
> You need the `pagefind_extended` build — extended supports Chinese indexing.

You can also switch to Algolia in `[extra.search]` (push the index yourself or use the Algolia crawler) or `none` to disable it.

## Use categories well

Because of orphan pages, blog sources are best kept flat in a single directory. But every post should still get a category or tags, so the theme can aggregate them via taxonomies and readers can find posts in the same category.

> [!tip]
> If you have multiple subdirectories with related content, use the Wiki layout provided by this theme.

## Blog

Content in `content/blog/`. Blog front matter should include the following fields; Zola supports both TOML and YAML.

```md
<!--toml-->
+++
title = "Hello, Elysia — A Modern Zola Theme"
date = 2026-01-15
[taxonomies]
categories = ["THEME", "ZOLA"]
tags = ["zola", "elysia", "design"]
description = "If you like writing summaries in front matter, Zola supports it"
+++

<!--yaml-->
---
title: Hello, Elysia — A Modern Zola Theme
date: 2026-01-15
taxonomies:
  categories: ["THEME", "ZOLA"]
  tags: ["zola", "elysia", "design"]
description: "If you like writing summaries in front matter, Zola supports it"
---
```

## Wiki

`content/wiki/` is the Wiki root, whose `_index.md` needs the following:

```toml,name=content/wiki/_index.md,hl_lines=3-6
title = "Wiki"
description = "Knowledge base · docs-style layout"
sort_by = "date"
template = "wiki/grid.html"
page_template = "wiki/page.html"
transparent = false
```

> [!note]
> The highlighted lines 3–6 are the point. Create this file once and leave it alone afterwards.

Each directory under the Wiki root is a project — create directories and write their content following this site's structure.

Wiki front matter should include:

```toml
title = "01 · Meet Elysia"
date = 2026-03-01
weight = 1
[taxonomies]
  categories = ["xx"]
  tags = ["xxx"]
```

> [!note]
> The `weight` field orders pages and is one of the required fields.
>
> In principle Wiki pages don't need taxonomies. But in case you migrate to another site or theme later that doesn't support this style or has no Wiki feature, it's better to include taxonomies just like regular blog posts — future migration will be easier to adjust.

## Resume page

The resume is a standalone page that doesn't inherit the blog sidebar or the article table of contents. When creating `content/resume.md`, use:

```toml
+++
title = "Resume"
template = "resume.html"
[extra]
style = "resume"
name = "Your Name"
role = "Software Engineer"
+++
```

## Summary

Zola handles summaries well. You can define one with the `description` front matter field, or use `<!-- more -->` — any amount of whitespace around it is accepted, which is much better than Hugo. Migrating from Hexo to Zola is seamless; moving from Hexo to Hugo previously required changing all of these.

## Limitations

Wiki posts form their own collection — their categories and tags don't appear on the menu's category/tag pages. The resume page is also standalone and not in the blog list.

## Inspirations

This theme "copies homework" from the layouts and features of the following open-source projects and blogs:

- [Hexo Stellar](https://xaoxuu.com/)
- [Hugo reimu](https://github.com/D-Sketon/hugo-theme-reimu)
- [BelResume](https://github.com/cx48/BelResume)
- [Hugo 椒盐豆豉](https://blog.douchi.space/)
- AI: Claude, ChatGPT, Opencode

See the full guide:

{{ <link href="/wiki/guide" title="Elysia Guide" icon="/avatar.svg" desc="Elysia user guide"/> }}

You can also explore this project's source structure to learn from it.
