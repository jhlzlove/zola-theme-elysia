+++
title = "04 · Deploy the Site"
date = 2026-09-02
weight = 4
description = "Build static files and publish them to GitHub Pages or another static host."
+++

Zola turns the site into static files. Deployment only needs to publish the generated `public/` directory.

## GitHub Pages

Create `.github/workflows/deploy.yml` in the site repository:

```yaml
name: Deploy Zola site

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0
      - uses: shalzz/zola-deploy-action@master
        env:
          PAGES_BRANCH: <deploy-branch>
          REPOSITORY: <deploy-repository>
          TOKEN: {% raw %}${{ secrets.GITHUB_TOKEN }}{% endraw %}
```

Then:

1. Set `base_url` to the real URL. A project site usually uses `https://user.github.io/repository/`; a user site uses `https://user.github.io/`.
2. Push to the `main` branch.
3. In GitHub, open **Settings → Pages** and select the Action or deployment branch.
4. Wait for Actions to finish, then open the site URL.

## Manual builds

```bash
zola build --force
./pagefind_extended --site public   # required when [extra.search] provider = "pagefind" (the default); Chinese sites must use extended — the regular pagefind binary has no Chinese segmentation
```

> [!warning]
> Sites with Chinese content must use `pagefind_extended` instead of the regular `pagefind` binary, otherwise Chinese queries will largely return nothing. Download the matching `pagefind_extended` archive from [Pagefind Releases](https://github.com/Pagefind/pagefind/releases).

Upload `public/` to Nginx, Apache, object storage, or another static host. For example, with rsync:

```bash
rsync -avz --delete public/ user@example.com:/var/www/html/
```

Preview the built files locally:

```bash
npx serve public
```

## Netlify, Vercel, and Cloudflare Pages

The general settings are:

| Platform | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `zola build` | `public` |
| Vercel | `zola build` | `public` |
| Cloudflare Pages | `zola build` | `public` |

If the platform does not provide Zola, specify `ZOLA_VERSION=0.23.4` or use a compatible Zola build image.

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
