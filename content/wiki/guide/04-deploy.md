+++
title = "04 · 部署网站"
date = 2026-09-02
weight = 4
description = "构建静态文件，并部署到 GitHub Pages 或其他静态托管平台。"
+++

Zola 会把站点构建成纯静态文件。部署时只需要把 `public/` 发布到静态托管平台。

## GitHub Pages

在站点仓库中创建 `.github/workflows/deploy.yml`（与本仓库同名文件一致，可直接复制）：

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
        # 如果使用 git submodules 使用本主题需要开启此项
        # with:
        #   submodules: true

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
          SITE_ENCRYPT_PASSWORDS: {% raw %}${{ secrets.ENCRYPT_PASSWORDS }}{% endraw %}

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
      url: {% raw %}${{ steps.deployment.outputs.page_url }}{% endraw %}
    steps:
      - name: Deploy Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

然后：

1. 将 `base_url` 改成实际地址。项目站点通常是 `https://用户名.github.io/仓库名/`，用户站点则是 `https://用户名.github.io/`。
2. 使用 Git 子模块时，`checkout` 必须加 `submodules: true`，否则 `themes/elysia` 为空目录，构建产物无样式。
3. 无加密文章时删除 `Encrypt private content` 步骤；有加密文章时按一下“文章加密”一节配置 `ENCRYPT_PASSWORDS`。
4. 在 GitHub 的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
5. 推送到 `main` 分支，等待 Actions 完成后打开站点地址。

## 手动构建

```bash
zola build --force
./pagefind_extended --site public   # provider = "pagefind"（默认）时必需；中文站必须用 extended，普通版 pagefind 不含中文分词
```

把 `public/` 上传到 Nginx、Apache、对象存储或其他静态托管服务。例如使用 rsync：

```bash
rsync -avz --delete public/ user@example.com:/var/www/html/
```

本地检查构建结果：

```bash
npx serve public
```

启用加密时，先加密再建索引再部署，顺序见“文章加密”一节。

## 文章加密（可选）

本主题支持加密文章，在文章 front matter 中标记即可：

```toml
[extra]
encrypted = true
password = "blog"   # 密码别名，真密码只放在加密配置里，不要写在这里
```

加密由 [ssg-encrypt](https://github.com/jhlzlove/ssg-encrypt) 对构建产物做后处理（AES-256-GCM），顺序固定且只有一种，错一步就会导致加密失效或索引泄漏原文：

```text
zola build → ssg-encrypt 加密 public/ → pagefind_extended 建索引 → 部署
```

加密后订阅源（atom.xml）中对应条目的正文会被替换为占位文本，不会泄漏原文。

### 手动部署

1. 到 [ssg-encrypt Releases](https://github.com/jhlzlove/ssg-encrypt/releases) 下载对应平台的二进制文件，放到站点根目录。
2. 在站点根目录准备 `encrypt.toml`（真密码只写在这里；该文件已在 `.gitignore` 中，不会提交到仓库），`[passwords]` 的别名与文章 `extra.password` 对应：

```toml
[passwords]
blog = "真正的密码写这里"
```

3. 按固定顺序执行：

```bash
zola build
./ssg-encrypt -c encrypt.toml   # -c 指定配置文件；public/ 为默认输入目录，可省略 --input
./pagefind_extended --site public
# 然后把 public/ 发布到任意平台：Nginx、对象存储、GitHub Pages……
```

可用 `--dry-run` 先扫描校验而不写文件，确认规则命中后再正式执行。

### GitHub Action 自动部署

直接复用上节 `.github/workflows/deploy.yml`，无需另写流程，只需在仓库 **Settings → Secrets and variables → Actions** 中添加 `ENCRYPT_PASSWORDS`，内容为 TOML 格式的 `别名 = "密码"`（可多行，如 `blog = "……"`）。

## Netlify、Vercel 和 Cloudflare Pages

通用设置如下：

| 平台 | 构建命令 | 发布目录 |
| --- | --- | --- |
| Netlify | `zola build && ./pagefind_extended --site public` | `public` |
| Vercel | `zola build && ./pagefind_extended --site public` | `public` |
| Cloudflare Pages | `zola build && ./pagefind_extended --site public` | `public` |

- 构建命令包含建索引是因为默认 `provider = "pagefind"`；若改为 `provider = "none"`，构建命令只需 `zola build`。
- 启用加密时同样遵守“先加密再建索引”的顺序。
- 如果平台没有预装 Zola，请指定 `ZOLA_VERSION=0.23.4` 或使用对应的 Zola 构建镜像。

## 自定义域名

GitHub Pages 可以在 `static/CNAME` 中写入域名：

```text
blog.example.com
```

同时将配置改为：

```toml
base_url = "https://blog.example.com"
```

再按域名服务商要求添加 DNS 记录。

## 发布前检查

- `base_url` 是否为线上真实地址。
- 图片、字体和自定义 CSS 的路径是否以 `/` 开头并能被访问。
- Git 子模块是否随部署一起检出。
- 搜索索引是否已更新。
- 评论服务的域名、仓库或服务器配置是否正确。
- 自定义域名的 HTTPS 是否已生效。
