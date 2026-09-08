+++
title = "Hello, Elysia — A Modern Zola Theme"
date = 2026-09-02
[taxonomies]
categories = ["THEME", "zola"]
tags = ["zola", "elysia", "design"]

[extra]
sticky = true
+++

Welcome to **Elysia**! This is a pinned post (posts with earlier dates appear first when multiple are pinned).

<!-- more -->

[hexo-theme-stellar]: https://github.com/xaoxuu/hexo-theme-stellar
[hugo-theme-reimu]: https://github.com/D-Sketon/hugo-theme-reimu

## Zola 0.23+

0.23 is a breaking change: you can treat it as a major update. Shortcodes were removed and all similar features are now provided through components.

Reference: https://github.com/getzola/zola/blob/master/CHANGELOG.md#0230-2026-08-05

## Component syntax

Zola components come in two forms, inline and block:

- Inline:

  ```md
  {% raw %}{{ <component-name attr=""/> }}{% endraw %}
  ```

- Block:

  ```md
  {% raw %}
  {% <component-name attr=""> %}
    some text...
  {% <component-name/> %}
  {% endraw %}
  ```

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

Zola uses `_index.md` to declare a section. Articles inside a Wiki directory naturally belong to that directory; its title comes from `_index.md`.

## Blog vs Wiki

Blog posts usually live under `content/blog/` and are collected by the home page and archive. Wiki sections are better for tutorials and maintained documentation; placing pages in a subdirectory is enough to get directory navigation.

The page type is mainly determined by its location and template:

- Regular posts use `page.html`.
- Wiki posts also use `page.html`, with Wiki navigation inferred from their directory.
- The resume uses `template = "resume.html"` and is excluded from blog previous/next navigation.

## No cover images

Card layouts with cover images can look nice, but they require careful design. I previously tried the lists with images from [hexo-theme-stellar] and [hugo-theme-reimu] — nice designs worth checking if you like that style.

This theme intentionally avoids cover images to save bandwidth (though it is not much) 😄. Images inside posts are supported via the `image` component; fancybox is not included yet — that can wait until it is actually needed.

## Local search

Pagefind local search is the default and works with Chinese out of the box — just run `pagefind --site public` after building to generate the index. You can switch to Algolia (requires pushing the index yourself) or `none` in `[extra.search]`.

## Nested directories in Zola

For a subdirectory to appear in its parent list, it must contain an `_index.md` with at least `transparent = true`. Without it the section behaves differently from Hexo or Hugo.

Even without being listed, Zola still compiles those pages and they are reachable by direct URL. They are called "orphan pages" in the docs, so a navigation entry is needed for convenient access. ~~(Who types URLs manually? 😑)~~

## Use categories

Because of orphan pages, a flat directory for posts is generally recommended. Use categories to group posts; Zola's taxonomy pages make it easy to find posts in the same category.

> [!tip]
> If you have multiple subdirectories with related content, the Wiki layout provided by the theme is a better fit.

## Blog

Content in `content/blog/`. Blog posts should include the following fields; both TOML and YAML are supported.

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

Wiki does not need separate deployment configuration. Put `_index.md` and articles under `content/wiki/` and the build will generate pages and chapter navigation. Wiki pages should include:

```md
title = "01 · Meet Elysia"
date = 2026-03-01
weight = 1
```

`weight` is required for ordering chapters.

> [!note]
> In principle, a Wiki page only needs the three fields above. If you are not sure about future migration, it is recommended to include `taxonomies` as well. No need to explain why — Zola is just that opinionated...

## Resume page

The resume is a standalone page and does not inherit the blog sidebar or table of contents. Create `content/resume.md` with:

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

Zola handles summaries well. You can use `description` in front matter or `<!-- more -->` in the body; any amount of whitespace is accepted, which is much better than Hugo — migration from Hexo to Zola is seamless. This was a pain point when migrating from Hexo to Hugo.

## Limitations

Wiki categories and tags do not appear on the menu's category/tag pages; Wiki forms its own collection.

The resume page is also standalone and not included in the blog list.

## Inspirations

This theme "copies homework" from the layout and features of the following open-source projects and blogs:

- [Hexo Stellar](https://xaoxuu.com/)
- [Hugo reimu](https://github.com/D-Sketon/hugo-theme-reimu)
- [BelResume](https://github.com/cx48/BelResume)
- [Hugo 椒盐豆豉](https://blog.douchi.space/)
- AI: Claude, ChatGPT, Opencode

See the full guide:

{{ <link href="/wiki/guide" title="Elysia Guide" icon="/avatar.svg" desc="Complete guide from install to writing and deployment"/> }}

You can also explore this project's source structure to learn from it.
