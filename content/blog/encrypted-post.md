+++
title = "加密文章示例 — 需要密码才能阅读"
date = 2026-09-02
description = "演示文章加密功能"
[taxonomies]
categories = ["SECRET"]
tags = ["encrypt", "demo"]

[extra]
encrypted = true
password = "elysia"
password_hint = "主题名称"
+++

这是加密的正文，只有输入正确密码（`elysia`）后才会显示。

## 隐藏内容

恭喜你解锁了！这里可以看到：

- 支持所有 Markdown 与组件
- 代码块：

```js,name=secret.js
const secret = "Elysia 🔐";
console.log(secret);
```

> [!IMPORTANT]
> 加密使用 AES 加密，需要手动进行；推荐使用 CI，在推送后可以自动完成加密，相关内容可以查看 wiki 的使用指南。

{% <note title="提示" color="yellow"> %}
密码别名通过 front matter 的 `extra.password` 配置（如 `key1`），真密码只存放在加密脚本的 `encrypt.toml` 中；构建后脚本对正文做 AES-GCM 加密，前端解密。适合简单的访问控制。
{% </note> %}
