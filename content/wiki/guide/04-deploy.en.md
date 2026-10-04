+++
title = "04 · Deploy the Site"
date = 2026-09-02
weight = 4
description = "Build static files and publish them to GitHub Pages or another static host."
+++

Zola turns the site into static files. Deployment only needs to publish the generated `public/` directory.

## GitHub Pages

Create `.github/workflows/deploy.yml` in the site repository (same as this repository's file, copy it directly):

{% raw %}
```yaml
name: ci

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v4

      - name: Install Zola
        uses: taiki-e/install-action@v2
        with:
          tool: zola

      - name: Build Zola
        run: zola build --minify

      - name: Encrypt private content
        uses: jhlzlove/ssg-encrypt@main
        with:
          selector: "#encryptedBox"
          content-selector: "#articleContent"
        env:
          SITE_ENCRYPT_PASSWORDS: ${{ secrets.ENCRYPT_PASSWORDS }}

      - name: Build Pagefind index
        run: |
          wget -O pagefind.tar.gz \
            https://github.com/Pagefind/pagefind/releases/download/v1.5.2/pagefind_extended-v1.5.2-x86_64-unknown-linux-musl.tar.gz
          tar -xzf pagefind.tar.gz
          ./pagefind_extended --site public

      - name: Upload Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
{% endraw %}

Then:

1. Set `base_url` to the real URL. A project site usually uses `https://user.github.io/repository/`; a user site uses `https://user.github.io/`.
2. When using a Git submodule, `checkout` must set `submodules: true`, otherwise `themes/elysia` is an empty directory and the built site has no styles.
3. Without encrypted posts, delete the `Encrypt private content` step; with encrypted posts, configure `ENCRYPT_PASSWORDS` as described in "Encrypted posts" below.
4. In GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
5. Push to the `main` branch, wait for Actions to finish, then open the site URL.

## Manual builds

```bash
zola build --force
./pagefind_extended --site public   # required when [extra.search] provider = "pagefind" (the default); Chinese sites must use extended — the regular pagefind binary has no Chinese segmentation
```

Upload `public/` to Nginx, Apache, object storage, or another static host. For example, with rsync:

```bash
rsync -avz --delete public/ user@example.com:/var/www/html/
```

Preview the built files locally:

```bash
npx serve public
```

With encryption enabled, encrypt first, then build the index, then deploy — see "Encrypted posts" below for the fixed order.

## Encrypted posts (optional)

Mark a post in its front matter:

```toml
[extra]
encrypted = true
password = "blog"   # password alias; the real password lives only in the encrypt config, never here
```

[ssg-encrypt](https://github.com/jhlzlove/ssg-encrypt) post-processes the build output (AES-256-GCM). There is exactly one valid order — getting it wrong breaks encryption or leaks plaintext into the index:

```text
zola build → ssg-encrypt public/ → pagefind_extended index → deploy
```

Encrypted entries have their feed body replaced with placeholder text, so the source never leaks via `atom.xml`.

### Manual deploy

1. Download the matching binary from [ssg-encrypt Releases](https://github.com/jhlzlove/ssg-encrypt/releases) into the site root.
2. Prepare `encrypt.toml` in the site root (real passwords only here; the file is already in `.gitignore` and never committed). `[passwords]` keys match `extra.password` in posts:

```toml
[passwords]
blog = "the real password goes here"
```

3. Run in the fixed order:

```bash
zola build
./ssg-encrypt -c encrypt.toml   # -c selects the config file; public/ is the default input and --input may be omitted
./pagefind_extended --site public
# then publish public/ anywhere: Nginx, object storage, a GitHub Pages branch...
```

Use `--dry-run` to scan and verify rule matches before writing files.

### GitHub Actions deploy

Reuse the `.github/workflows/deploy.yml` above as-is; only add `ENCRYPT_PASSWORDS` under **Settings → Secrets and variables → Actions**, using TOML `alias = "password"` format (multiple lines allowed, e.g. `blog = "..."`).

## Netlify, Vercel, and Cloudflare Pages

The general settings are:

| Platform | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `zola build && ./pagefind_extended --site public` | `public` |
| Vercel | `zola build && ./pagefind_extended --site public` | `public` |
| Cloudflare Pages | `zola build && ./pagefind_extended --site public` | `public` |

- The index step is included because the default `provider = "pagefind"`; with `provider = "none"` the build command is just `zola build`.
- With encryption enabled, keep the "encrypt first, then index" order.
- If the platform does not provide Zola, specify `ZOLA_VERSION=0.23.4` or use a compatible Zola build image.

## Custom domains

For GitHub Pages, put the domain in `static/CNAME`:

```text
blog.example.com
```

Also update the configuration:

```toml
base_url = "https://blog.example.com"
```

Add the DNS records required by your domain provider.

## Pre-publish checklist

- `base_url` is the real production URL.
- Image, font, and custom CSS paths work on the deployed site.
- Git submodules are checked out during deployment.
- The search index is up to date.
- Comment service settings are correct.
- HTTPS works for the custom domain.
