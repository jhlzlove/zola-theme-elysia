+++
title = "05 · Markdown and Components"
date = 2026-09-02
weight = 5
description = "Front Matter, Markdown, and Elysia components (syntax plus rendered output)."
+++

Examples in this chapter can be copied into posts. Components use the Zola 0.23+ component syntax. Each section shows the syntax first, then the rendered result.

> [!tip]
> When using {% raw %}`{{ ... }}` or `{% ... %}`{% endraw %} in Markdown, you must wrap the expression with `raw` / `endraw`, otherwise Zola will try to execute it and fail to parse.

## Article Front Matter

Minimal post:

```toml
+++
title = "My first post"
date = 2026-03-10
description = "A short summary"
+++
```

Common fields for blog posts:

```toml
+++
title = "A post"
date = 2026-03-10
updated = 2026-03-12
description = "Summary shown in lists"
weight = 1

[taxonomies]
categories = ["Technology"]
tags = ["zola", "blog"]

[extra]
sticky = true
+++
```

- `date` controls sorting and display; `updated` records a later update.
- `description` is used for summaries and page metadata; regular posts can also use `<!-- more -->` to generate `page.summary`.
- `weight` orders Wiki chapters.
- `sticky`, `top`, or `pinned` pins a post.
- Categories and tags belong under `[taxonomies]`.

Encrypted post:

```toml
+++
title = "Private post"
[extra]
encrypted = true
password = "change-this-password"
password_hint = "Enter the password"
+++
```

Do not commit a real password to a public repository; client-side encryption only provides basic protection.

## Basic Markdown

**Syntax:**

```md
# Heading 1
## Heading 2

This paragraph contains **bold**, *italic*, ~~strikethrough~~, `code`, and a [link](https://example.com).

- Unordered item
- Another item

1. Ordered item
2. Another item

> A quotation.

---

| Name | Age | City |
| --- | --- | --- |
| Alice | 24 | Beijing |
| Bob | 30 | Shanghai |
```

**Rendered:**

# Heading 1
## Heading 2

This paragraph contains **bold**, *italic*, ~~strikethrough~~, `code`, and a [link](https://example.com).

- Unordered item
- Another item

1. Ordered item
2. Another item

> A quotation.

---

| Name | Age | City |
| --- | --- | --- |
| Alice | 24 | Beijing |
| Bob | 30 | Shanghai |

Markdown links inside article content automatically receive a link icon; image links are excluded.

## Alerts, footnotes, and formulas

**Syntax (GitHub Alerts):**

```md
> [!NOTE]
> A regular note.

> [!TIP]
> A useful tip.

> [!WARNING]
> A warning.
```

**Rendered:**

> [!NOTE]
> A regular note.

> [!TIP]
> A useful tip.

> [!WARNING]
> A warning.

**Syntax (footnotes):**

```md
This sentence has a footnote[^source].

[^source]: The footnote text.
```

**Rendered:**

This sentence has a footnote[^source].

[^source]: The footnote text.

**Syntax (KaTeX, requires `extra.katex.enable = true`):**

```md
Inline formula: $E=mc^2$

$$
\int_0^\infty e^{-x}dx = 1
$$
```

**Rendered:**

Inline formula: $E=mc^2$

$$
\int_0^\infty e^{-x}dx = 1
$$

Configuration:

```toml
[extra.katex]
enable = true
```

## Code blocks

**Syntax:** language, line numbers, filename, and highlighted lines:

````md
```ts,linenos,name=example.ts,hl_lines=2 3
interface User {
  name: string;
  age: number;
}
```
````

**Rendered:**

```ts,linenos,name=example.ts,hl_lines=2 3
interface User {
  name: string;
  age: number;
}
```

Line numbers are controlled by `extra.features.code_line_numbers`; the copy button is provided automatically by the script.

## Component syntax

Inline component:

```jinja
{% raw %}{{ <component-name parameter="value" /> }}{% endraw %}
```

Block component:

```jinja
{% raw %}{% <component-name parameter="value"> %}{% endraw %}
body
{% raw %}{% </component-name> %}{% endraw %}
```

Parameters normally use double quotes; body supports full Markdown.

### note

**Syntax:**

{% raw %}
```jinja
{% <note title="Note" color="blue"> %}
This is a note.
{% </note> %}
{% <note title="Success" color="green"> %}...{% </note> %}
```
{% endraw %}

Available colors are `blue`, `green`, `yellow`, `orange`, `red`, and `black`.

**Rendered:**

{% <note title="Note" color="blue"> %}
This is a note with `color="blue"` (default).
{% </note> %}

{% <note title="Success" color="green"> %}green{% </note> %}
{% <note title="Warning" color="yellow"> %}yellow{% </note> %}
{% <note title="Attention" color="orange"> %}orange{% </note> %}
{% <note title="Danger" color="red"> %}red{% </note> %}
{% <note title="Black" color="black"> %}black{% </note> %}

### video

**Syntax:**

{% raw %}
```jinja
{{ <video bilibili="BV1n8Q7B7Ekz" caption="Bilibili video" /> }}
{{ <video youtube="GoxJ4H8Chz8" width="80%" /> }}
{{ <video src="/video/demo.mp4" caption="Local video" /> }}
```
{% endraw %}

Use one of `bilibili`, `youtube`, or `src`. `width` sets the width, `caption` adds a caption, and `autoplay` will autoplay when set to `true`.

**Rendered:**

{{ <video bilibili="BV1n8Q7B7Ekz" caption="Bilibili video" autoplay="false" /> }}

### audio

**Syntax:**

Local audio:

{% raw %}
```jinja
{{ <audio src="/audio/demo.mp3" caption="Remote audio" autoplay="true" /> }}
```
{% endraw %}

NetEase (`type` supports `single` / `album` / `playlist`):

{% raw %}
```jinja
{{ <audio netease="1852892593" type="single" /> }}
{{ <audio netease="128938811" type="album" /> }}
{{ <audio netease="2246151876" type="playlist" /> }}
```
{% endraw %}

Spotify (`type` supports `single` / `album` / `playlist`, `single` maps to `track`):

{% raw %}
```jinja
{{ <audio spotify="3QQcmb87X6e10gdEXDx1ep" type="single" /> }}
{{ <audio spotify="3mlG9PR20AaeQQGA18PJ18" type="album" /> }}
{{ <audio spotify="6UEIDpoU9CJD0b0jg04kgP" type="playlist" /> }}
```
{% endraw %}

**Rendered (local player):**

{{ <audio src="/audio/demo.wav" caption="Local audio example" autoplay="false" /> }}

**Rendered (NetEase single / album / playlist):**

{{ <audio netease="1852892593" type="single" /> }}

{{ <audio netease="128938811" type="album" /> }}

{{ <audio netease="2246151876" type="playlist" /> }}

**Rendered (Spotify single / album / playlist):**

{{ <audio spotify="3QQcmb87X6e10gdEXDx1ep" type="single" /> }}

{{ <audio spotify="3mlG9PR20AaeQQGA18PJ18" type="album" /> }}

{{ <audio spotify="6UEIDpoU9CJD0b0jg04kgP" type="playlist" /> }}

### image

**Syntax:**

{% raw %}
```jinja
{{ <image src="https://picsum.photos/seed/elysia/800/300" alt="Example image" width="100%" caption="Image caption" /> }}
```
{% endraw %}

Put image files in the site's `static/` directory.

**Rendered:**

{{ <image src="https://picsum.photos/seed/elysia/800/300" alt="Example image" width="100%" caption="Image caption" /> }}

### link card

**Syntax:**

{% raw %}
```jinja
{{ <link href="https://www.getzola.org/" title="Zola" icon="https://www.getzola.org/icons/apple-touch-icon.png" desc="The official Zola website" /> }}
```
{% endraw %}

**Rendered:**

{{ <link href="https://www.getzola.org/" title="Zola" icon="https://www.getzola.org/icons/apple-touch-icon.png" desc="The official Zola website" /> }}

### links collection

Prepare `data/links.yaml`:

```yaml
github:
  - title: Zola
    url: https://github.com/getzola/zola
    cover: https://picsum.photos/seed/zola/600/300
    desc: Official Zola repository
```

Cards show only the cover, title, and summary — no URL or icon. `cover` accepts remote URLs and local images (placed under `static/`, e.g. `/images/tool.jpg`, automatically prefixed with `base_url`); the ★ before the title marks a personal pick. When the summary is clamped, hovering reveals the full text.

**Syntax:**

{% raw %}
```jinja
{{ <links group="github" /> }}
```
{% endraw %}

**Rendered:**

{{ <links group="github" /> }}

### friends

`friends` reads `data/friends.yaml` (only these fields):

```yaml
developer:
  - title: Friend name
    url: https://example.com
    icon: https://example.com/avatar.jpg
    description: One-line intro
    feed: https://example.com/atom.xml
```

- `title` / `url`: display name and homepage (clicking the card opens it).
- `icon`: site icon; falls back to the first letter of the title when empty.
- `description`: one-line intro, shown below the name.
- `feed`: subscription URL; the latest 3 posts are fetched at build time and shown on the right side of the card.
  Empty shows a "no feed configured" note and sorts later; an unreachable feed shows an "unavailable" note without breaking the build.
- The card no longer shows the raw site URL; top-level keys are groups, use `group` to render one group only.

The `api` parameter fetches remote data with pure client-side rendering: nothing is requested
at build time; `friends.js` fetches and renders on every page visit (empty in view-source, no SEO;
the endpoint must allow CORS via `Access-Control-Allow-Origin`). If the fetch fails or returns
no data, the whole remote grid is hidden without breaking the build.
The endpoint returns `{"version": "v2", "content": [...]}`; only the same fields as static (`title/url/icon/description/feed`) plus the `posts` list
(`posts[].title / posts[].link / posts[].published`, first 3) are used, other fields are ignored;
entries with `feed` sort first. `group` is ignored when `api` is set; to show both sources,
use two blocks (as the friends page does):

**Syntax:**

{% raw %}
```jinja
{{ <friends group="developer" /> }}
{{ <friends /> }}
{{ <friends api="https://example.com/api/friends" /> }}
```
{% endraw %}

**Rendered (developer group):**

{{ <friends group="developer" /> }}

### poetry

**Syntax:**

{% raw %}
```jinja
{% <poetry title="Spring Dawn" author="Meng Haoran"> %}
Spring sleep unaware of dawn,
Everywhere I hear birds.
{% </poetry> %}
```
{% endraw %}

**Rendered:**

{% <poetry title="Spring Dawn" author="Meng Haoran"> %}
Spring sleep unaware of dawn,
Everywhere I hear birds.
{% </poetry> %}

### tabs

**Syntax:**

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

Separate panels with `<!-- tab label -->` comments; labels are lowercased.

**Rendered:**

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

## Wiki sections

Create a directory and `_index.md`:

```text
content/wiki/my-guide/
├── _index.md
├── 01-start.md
└── 02-config.md
```

The `_index.md`:

```toml
+++
title = "My Guide"
description = "One-line intro shown as the card summary in the Wiki list."
sort_by = "weight"
template = "section.html"
page_template = "page.html"
+++
```

Use `weight` to order chapter pages. Do not add `extra.series`; Wiki navigation comes from the directory structure.

> [!NOTE]
> A Wiki project homepage (`_index.md`) is a Section, so it has no `page.summary` and `<!-- more -->` does not work there.
> To show a proper summary in the Wiki list, set `description` in the front matter; otherwise the template falls back to truncating the full body text.

## Custom CSS

Create `static/css/custom.css` in the site root and inject it:

```toml
[extra.inject]
head = [
  { rel = "stylesheet", href = "/css/custom.css" },
]
```

Example:

```css
:root {
  --accent: #0ea5e9;
}
```
