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

Encrypted post (`password` is an alias matching a key in `encrypt.toml` `[passwords]`; the real password lives only there and takes effect via post-build encryption, see chapter 04):

```toml
+++
title = "Private post"
[extra]
encrypted = true
password = "blog"
password_hint = "Enter the password"
+++
```

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

| Parameter | Required | Description |
| --- | --- | --- |
| `title` | No | Heading text; no heading bar when omitted |
| `color` | No | `blue` (default) / `green` / `yellow` / `orange` / `red` / `black`; invalid values fall back to `blue` |
| Body | Yes | Note text, full Markdown supported |

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

| Parameter | Required | Description |
| --- | --- | --- |
| `bilibili` | One of three | Bilibili BV id, e.g. `BV1n8Q7B7Ekz` |
| `youtube` | One of three | YouTube video id |
| `src` | One of three | Direct video URL (local videos go under `static/`) |
| `width` | No | Width, defaults to `100%` |
| `caption` | No | Caption text |
| `autoplay` | No | `true` to autoplay, off by default |

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

| Parameter | Required | Description |
| --- | --- | --- |
| `src` | One of three | Local/remote direct audio URL |
| `netease` | One of three | NetEase music id |
| `spotify` | One of three | Spotify id |
| `type` | No | `single` (default) / `album` / `playlist`; only applies to NetEase/Spotify (`single` maps to `track` on Spotify) |
| `caption` | No | Caption (shown as the track title in the local player) |
| `autoplay` | No | `true` to autoplay, off by default |

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
{{ <image src="https://picsum.photos/seed/elysia/400/300" alt="Example image" position="left" caption="Floated left, text wraps" /> }}
{{ <image src="https://picsum.photos/seed/elysia/400/300" alt="Example image" position="right" caption="Floated right, text wraps" /> }}
```
{% endraw %}

Put image files in the site's `static/` directory.

| Parameter | Required | Description |
| --- | --- | --- |
| `src` | Yes | Image URL; local images under `static/` use a `/`-prefixed path |
| `alt` | No | Alt text; falls back to `caption`, then `src` |
| `width` | No | Applies to the image when `center`, to the whole figure (incl. caption) when `left`/`right` |
| `caption` | No | Image caption |
| `position` | No | `center` (default, centered block) / `left` / `right`; invalid values fall back to `center` |

`position` accepts `center` (default, centered block) / `left` (floated left, text wraps on the right) / `right` (floated right, text wraps on the left); invalid values fall back to `center`. With `left`/`right` and no `width`, the figure is auto-capped at `min(42%, 320px)`; a given `width` (e.g. `30%–50%` or `200px–400px`, avoid `100%`) applies to the whole figure including the caption. On narrow screens (≤640px) floats are disabled and the image stacks centered. Floated images must be placed on their own line and only followed by body paragraphs — avoid placing them right before headings, code blocks, or tables.

**Rendered:**

{{ <image src="https://picsum.photos/seed/elysia/800/300" alt="Example image" width="100%" caption="Image caption" /> }}

**Rendered (floated left, text wraps):**

{{ <image src="https://picsum.photos/seed/elysia/400/300" alt="Example image" position="left" caption="Floated left example" /> }}

This is sample body text demonstrating text wrap. With `position="left"`, the image floats left and paragraphs flow around its right side — handy for profiles or mixed text-image layouts. Without `width` it is auto-capped; on narrow screens it stacks centered for readability.

**Rendered (floated right, text wraps):**

{{ <image src="https://picsum.photos/seed/elysia/400/300" alt="Example image" position="right" caption="Floated right example" /> }}

This is sample body text demonstrating text wrap. With `position="right"`, the image floats right and paragraphs flow around its left side, mirroring `left`. Use `width="300px"` or `width="40%"` to size the whole figure including its caption.

### link card

**Syntax:**

{% raw %}
```jinja
{{ <link href="https://www.getzola.org/" title="Zola" icon="https://www.getzola.org/icons/apple-touch-icon.png" desc="The official Zola website" /> }}
```
{% endraw %}

| Parameter | Required | Description |
| --- | --- | --- |
| `href` | Yes | Link URL; `/`-prefixed internal paths get `base_url` prepended, `http` links open in a new tab |
| `title` | No | Card title, defaults to `href` |
| `icon` | No | Icon: remote/local image URL, or an emoji/character (image URLs follow the same rules as `href`) |
| `desc` | No | Description text |

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

Component parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `group` | Yes | Top-level group name in `data/links.yaml` |

Data fields (each entry in `data/links.yaml`):

| Field | Required | Description |
| --- | --- | --- |
| `title` | No | Title, falls back to `name`, then `url` |
| `url` | No | Link, falls back to `href`, then `#` |
| `cover` | No | Cover image; `/`-prefixed paths get `base_url` prepended, empty shows a gradient placeholder |
| `desc` | No | Summary, falls back to `description`; clamped to two lines, full text on hover |

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

- `title` / `url` / `icon`: required (strings). `title` is the display name, `url` the homepage (clicking the card opens it), `icon` the site icon (may be an empty string; falls back to the first letter of the title when empty).
- `description`: optional one-line intro, shown below the name; missing/non-string values are treated as empty.
- `feed`: optional subscription URL; nothing is fetched at build time — the latest 3 posts are fetched by `friends.js` when a visitor opens the page and shown on the right side of the card.
  Missing, empty, or non-string values show a "no feed configured" note and sort later; an unreachable feed (or one disallowing cross-origin access) shows an "unavailable" note without breaking the build.
- The card no longer shows the raw site URL; top-level keys are groups, use `group` to render one group only.

Component parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `group` | No | Renders that group only; defaults to all groups; ignored when `api` is set |
| `api` | No | Remote endpoint URL, pure client-side rendering (no SEO, endpoint must allow CORS); the whole grid hides on failure or empty data |

Data fields (each entry in `data/friends.yaml`, only these fields):

| Field | Required | Description |
| --- | --- | --- |
| `title` | Yes (string) | Display name |
| `url` | Yes (string) | Homepage link, defaults to `#` |
| `icon` | Yes (string, may be empty) | Site icon; empty shows the first letter of the title |
| `description` | No | One-line intro; missing/non-string values are treated as empty |
| `feed` | No | Subscription URL; entries without a feed show a "no feed configured" note and sort later |

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

| Parameter | Required | Description |
| --- | --- | --- |
| `title` | No | Poem title |
| `author` | No | Author, shown as `— Author` |
| Body | Yes | Poem text, Markdown supported |

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
{% <tab title="bash"> %}
```bash
echo "hello"
```
{% </tab> %}

{% <tab title="powershell"> %}
```powershell
Write-Output "hello"
```
{% </tab> %}
{% </tabs> %}
````
{% endraw %}

Wrap each panel in {% raw %}`{% <tab title="label"> %}...{% </tab> %}`{% endraw %}; labels are lowercased. Panels can nest (a `tabs` inside a `tab`, or any other block component).

`tabs` takes no parameters; its body is a set of `tab` blocks (required).

`tab` parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `title` | No | Tab label, defaults to `Tab`; blank values fall back to `Tab` |

**Rendered:**

{% <tabs> %}
{% <tab title="bash"> %}
```bash
echo "hello"
```
{% </tab> %}

{% <tab title="powershell"> %}
```powershell
Write-Output "hello"
```
{% </tab> %}

{% <tab title="javascript"> %}
```javascript
console.log("hello")
```
{% </tab> %}
{% </tabs> %}

**Rendered (nested):**

{% <tabs> %}
{% <tab title="outer"> %}

Outer text.

{% <tabs> %}
{% <tab title="inner-a"> %}
Inner A.
{% </tab> %}

{% <tab title="inner-b"> %}
Inner B.
{% </tab> %}
{% </tabs> %}

{% </tab> %}

{% <tab title="note"> %}
{% <note title="Tip" color="blue"> %}
A `note` inside a `tab`.
{% </note> %}
{% </tab> %}
{% </tabs> %}

### columns

**Syntax:**

{% raw %}
````jinja
{% <columns layout="h"> %}
{% <column color="green" width="1"> %}
Left column, full Markdown supported, other block components can nest inside.
{% </column> %}

{% <column color="red" width="2"> %}
Right column, `width="2"` takes two shares of the row.
{% </column> %}
{% </columns> %}
````
{% endraw %}

- Outer `columns`: `layout="h"` for horizontal (default), `layout="v"` for vertical stacking.
- Inner `column`: `color` sets the whole card background, accepting `blue` / `green` / `yellow` / `orange` / `red` / `black` (defaults to a neutral card); `width` is a flex ratio from `1` to `6` (defaults to `1`, invalid values fall back to `1`).
- Other block components (e.g. `poetry`) and inline components (e.g. `link`) can nest inside; keep blank lines between outer and inner blocks; on narrow screens (≤640px) columns stack vertically and `width` is ignored.

`columns` parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `layout` | No | `h` for horizontal (default) / `v` for vertical; invalid values fall back to `h`; narrow screens always stack |
| Body | Yes | A set of `column` blocks with blank lines between them |

`column` parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `color` | No | Whole-card background, `blue` / `green` / `yellow` / `orange` / `red` / `black` (neutral card by default) |
| `width` | No | Flex ratio `1`–`6` (defaults to `1`, invalid values fall back to `1`); ignored on narrow screens |
| Body | Yes | Column text, full Markdown supported, other block/inline components may nest inside |

**Rendered:**

{% <columns layout="h"> %}
{% <column color="green" width="1"> %}
Left column, `width="1"`.

{% <poetry title="Spring Dawn" author="Meng Haoran"> %}
`poetry` nested inside a `column`.
{% </poetry> %}
{% </column> %}

{% <column color="red" width="2"> %}
Right column, `width="2"`, takes two shares.

{{ <link href="https://www.getzola.org/" title="Zola" desc="Inline components nest too" /> }}
{% </column> %}
{% </columns> %}

## Wiki sections

The Wiki root (`/wiki/` project hub) and subdirectories (reading units) use different templates — do not mix them:

```text
content/wiki/
├── _index.md          # Wiki home: template = "wiki/grid.html", page_template = "wiki/page.html"
└── my-guide/
    ├── _index.md      # reading unit home: template = "wiki/doc.html", page_template = "wiki/page.html"
    ├── 01-start.md
    └── 02-config.md
```

`content/wiki/_index.md`:

```toml
+++
title = "Wiki"
description = "Knowledge base"
sort_by = "date"
template = "wiki/grid.html"
page_template = "wiki/page.html"
transparent = false
+++
```

`content/wiki/my-guide/_index.md`:

```toml
+++
title = "My Guide"
description = "One-line intro shown as the card summary in the Wiki list."
sort_by = "weight"
weight = 2
template = "wiki/doc.html"
page_template = "wiki/page.html"
+++
```

- A reading unit's `_index.md` uses `wiki/doc.html`; its pages automatically use `wiki/page.html` with the left directory. The Wiki root uses `wiki/grid.html` for the project card grid.
- Chapter pages order by `weight` (`sort_by = "weight"`); blog posts order by `date`.
- Layout comes from file location plus the `template` / `page_template` above. Do not set `extra.style`.

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
