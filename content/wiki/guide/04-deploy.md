+++
title = "04 · 部署网站"
date = 2026-09-02
weight = 4
description = "构建静态文件，并部署到 GitHub Pages 或其他静态托管平台。"
+++

Zola 会把站点构建成纯静态文件。部署时只需要把 `public/` 发布到静态托管平台。

## GitHub Pages

在站点仓库中创建 `.github/workflows/deploy.yml`：

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
          PAGES_BRANCH: 部署的分支
          REPOSITORY: 部署的仓库
          TOKEN: {% raw %}${{ secrets.GITHUB_TOKEN }}{% endraw %}
```

然后：

1. 将 `base_url` 改成实际地址。项目站点通常是 `https://用户名.github.io/仓库名/`，用户站点则是 `https://用户名.github.io/`。
2. 推送到 `main` 分支。
3. 在 GitHub 的 **Settings → Pages** 中选择 Action 或构建输出分支。
4. 等待 Actions 完成后打开站点地址。

> [!warning]
> 如果站点启用了文章加密（见下文），不能使用上面这种构建+部署一步完成的一键脚本，必须拆成手动三步：build → 加密 → 部署。

## 手动构建

```bash
zola build --force
```

把 `public/` 上传到 Nginx、Apache、对象存储或其他静态托管服务。例如使用 rsync：

```bash
rsync -avz --delete public/ user@example.com:/var/www/html/
```

本地检查构建结果：

```bash
npx serve public
```

## 文章加密（可选）

本主题支持加密文章，在文章 front matter 中标记即可：

```toml
[extra]
encrypted = true
password = "blog"   # 密码别名，真密码只放在加密配置里，不要写在这里
```

加密由 [ssg-encrypt](https://github.com/jhlzlove/ssg-encrypt) 对构建产物做后处理（AES-256-GCM），流程固定为：

```text
zola build → ssg-encrypt 加密 public/ → 部署
```

> [!warning]
> 加密必须发生在构建之后、部署之前。一旦启用加密，就不能再使用构建+部署一步完成的官方一键脚本（如 `shalzz/zola-deploy-action`），必须手动拆成 build → 加密 → 部署三步。

加密后订阅源（atom.xml / rss.xml）中对应条目的正文会被替换为占位文本，不会泄漏原文。

### 手动部署

1. 到 [ssg-encrypt Releases](https://github.com/jhlzlove/ssg-encrypt/releases) 下载对应平台的二进制文件，放到站点根目录。
2. 在站点根目录准备 `encrypt.toml`（真密码只写在这里；该文件已在 `.gitignore` 中，不会提交到仓库），`[passwords]` 的别名与文章 `extra.password` 对应：

```toml
[passwords]
blog = "真正的密码写这里"
```

3. 构建、加密、建索引、再部署：

```bash
zola build
./ssg-encrypt -c encrypt.toml   # -c 指定配置文件；public/ 为默认输入目录，可省略 --input
./pagefind_extended --site public   # 生成本地搜索索引（provider = "pagefind" 时必需；中文站必须用 extended，普通版 pagefind 不含中文分词）
# 然后把 public/ 发布到任意平台：Nginx、对象存储、GitHub Pages 分支……
```

可用 `--dry-run` 先扫描校验而不写文件，确认规则命中后再正式执行。

### GitHub Action 自动部署

参考本仓库 `.github/workflows/deploy.yml`：在 `zola build` 之后、上传部署产物之前插入加密步骤，真密码通过 Secrets 传入：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Zola
        uses: taiki-e/install-action@v2
        with:
          tool: zola

      - name: Build Zola
        run: zola build

      - name: Encrypt private content
        uses: jhlzlove/ssg-encrypt@main
        with:
          selector: "#encryptedBox"
          content-selector: "#articleContent"
        env:
          SITE_ENCRYPT_PASSWORDS: {% raw %}${{ secrets.ENCRYPT_PASSWORDS }}{% endraw %}

      - name: Build Pagefind index
        env:
          GH_TOKEN: {% raw %}${{ github.token }}{% endraw %}
        run: |
          gh release download v1.5.2 --repo CloudCannon/pagefind --pattern '*extended*x86_64-unknown-linux-musl.tar.gz' --dir /tmp --clobber
          tar -xzf /tmp/pagefind-*.tar.gz -C /tmp
          /tmp/pagefind_extended --site public   # 中文站必须用 extended，普通版 pagefind 不含中文分词

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

要点：

- 在仓库 **Settings → Secrets and variables → Actions** 中添加 `ENCRYPT_PASSWORDS`，内容为 TOML 格式的 `别名 = "密码"`（可多行，如 `blog = "……"`）。
- 顺序不能错：先 `zola build`，再加密，再 `pagefind_extended --site public` 建索引，最后才上传/部署产物。仓库里已有可直接抄的完整流程，见 `.github/workflows/deploy.yml`。

## Netlify、Vercel 和 Cloudflare Pages

通用设置如下：

| 平台 | 构建命令 | 发布目录 |
| --- | --- | --- |
| Netlify | `zola build` | `public` |
| Vercel | `zola build` | `public` |
| Cloudflare Pages | `zola build` | `public` |

如果平台没有预装 Zola，请指定 `ZOLA_VERSION=0.23.4` 或使用对应的 Zola 构建镜像。

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
