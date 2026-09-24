# Leeon & Aria · 个人博客

> 基于 Hugo 的静态博客。零 npm 依赖，一个 `hugo.exe` 就能构建，推送到 GitHub 自动发布。

## 这个博客有什么

- 首页动态主视觉：极光渐变、粒子星链、打字机、3D 倾斜卡片、滚动渐入
- 深色 + 浅色双主题，可跟随系统，也可手动切换
- 纯前端站内搜索，快捷键 `/` 或 `Ctrl+K`，不需要任何服务器
- 标签 / 分类 / 系列三种聚合方式，外加时间线归档页
- 文章自动目录、阅读进度条、代码高亮与一键复制、上下篇、相关阅读
- Giscus 评论（基于 GitHub Discussions，免费无广告）
- RSS 订阅、站点地图、Open Graph 与 JSON-LD 结构化数据

## 目录结构

```
.
├─ hugo.toml            站点总配置：标题、导航、配色、动效开关都在这里
├─ content/             你写的所有内容
│  ├─ posts/            文章（.md 文件）
│  ├─ about/            关于页
│  └─ archives/         归档页
├─ assets/
│  ├─ css/main.css      设计系统：配色、排版、组件样式
│  └─ js/               动效与交互脚本
├─ layouts/             页面模板
├─ static/              原样拷贝的文件，图片和图标放这里
├─ tools/               辅助脚本
├─ .github/workflows/   自动部署配置
├─ 预览博客.cmd          双击本地预览
├─ 新建文章.cmd          双击写新文章
├─ 发布到网站.cmd        双击发布
└─ 安装Hugo.cmd          双击安装 Hugo（只做一次）
```

## 日常只需要做三件事

### 1. 写一篇新文章

双击 `新建文章.cmd`，输入标题后回车。它会在 `content/posts/` 下生成一个 `.md` 文件，
用记事本或 VS Code 打开写正文即可。

### 2. 本地预览

双击 `预览博客.cmd`，浏览器会自动打开 http://localhost:1313/ 。
改动文件会实时刷新，关掉黑色的命令行窗口就停止预览。

### 3. 发布

双击 `发布到网站.cmd`，输入一句改动说明。1~2 分钟后 GitHub 会自动构建并更新线上网站。

---

## 第一次使用：从零到上线

### 第 1 步：安装 Hugo

双击 `安装Hugo.cmd`，它会把 Hugo 下载到本项目的 `.tools/` 目录里。

如果下载失败（GitHub 在国内偶尔不稳定），可以改用：

```bash
winget install Hugo.Hugo.Extended
```

### 第 2 步：在 GitHub 上创建仓库

1. 打开 https://github.com/new
2. Repository name 填 `Leeon-Aria`（要和下面第 3 步的地址保持一致）
3. 选择 **Public**（私有仓库用不了免费的 GitHub Pages）
4. **不要**勾选 Add a README file
5. 点 Create repository

### 第 3 步：先开启 GitHub Pages（务必在推送之前做）

1. 进入仓库，点 **Settings**
2. 左侧选 **Pages**
3. **Source** 选择 **GitHub Actions**
4. 保存

**顺序很重要。** GitHub 会在你推送的那一刻立刻启动构建，如果那时 Pages 还没开，
工作流会失败在「读取 Pages 配置」这一步。补救办法：等 Pages 开好后重新跑一次
（见第 5 步）。

### 第 4 步：把本地代码推上去

在这个文件夹里打开命令行（在文件夹地址栏输入 `cmd` 后回车），依次执行：

```bash
git init
git add -A
git commit -m "初始化博客"
git branch -M main
git remote add origin https://github.com/LUYYY-Dev/Leeon-Aria.git
git push -u origin main
```

如果 git 提示没有配置身份，先执行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

首次推送需要登录 GitHub。推荐安装 GitHub CLI：`winget install GitHub.cli`，
然后执行 `gh auth login` 按提示授权，之后推送就不需要再输密码了。

### 第 5 步：等待自动部署

回到仓库的 **Actions** 标签页，会看到一个正在运行的 workflow。
等它出现绿色对勾，网站就上线了。

**注意网址要带仓库名**，项目仓库的地址是：

```
https://LUYYY-Dev.github.io/Leeon-Aria/
```

之后每次双击 `发布到网站.cmd`，都会自动重新构建。

---

## 常见修改速查表

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名称 | `hugo.toml` 的 `title` |
| 站点简介 | `hugo.toml` 的 `description` |
| 首页大标题 / 副标题 / 打字文案 | `hugo.toml` 的 `[params.hero]` |
| 配色 | `hugo.toml` 的 `[params.appearance]` → `accent`，可选 violet / cyan / amber / rose / emerald |
| 默认深色或浅色 | `hugo.toml` 的 `[params.appearance]` → `default`，可选 dark / light / auto |
| 关掉某个动效 | `hugo.toml` 的 `[params.effects]`，把对应项改成 `false` |
| 页脚社交链接 | `hugo.toml` 的 `[[params.social]]` |
| 顶部导航 | `hugo.toml` 的 `[[menus.main]]` |
| 每页文章数 | `hugo.toml` 的 `[pagination]` → `pagerSize` |
| 关于页内容 | `content/about/index.md` |
| 代码高亮配色 | 改 `tools/update-chroma.mjs` 里的 LIGHT_STYLE / DARK_STYLE，然后运行 `node tools/update-chroma.mjs` |

## 文章怎么写

每篇文章开头是一段 front matter：

```markdown
---
title: "文章标题"
date: 2026-09-24
lastmod: 2026-09-24     # 可选，改过这篇文章就写这里
draft: true             # 草稿。要发布时改成 false
summary: "列表页显示的一句话摘要"
tags: ["标签A", "标签B"]
categories: ["分类"]
series: ["系列名"]        # 可选
---
```

- `draft: true` 的文章只在本地预览里出现，不会被发布出去
- 标签、分类、系列会自动生成聚合页，不需要手动创建
- 正文是标准 Markdown：`## 小标题`、`- 列表`、`| 表格 |`、三个反引号包裹代码块

## 可用的短代码

提示框，type 可选 tip / info / warning / danger：

```markdown
{{< notice type="tip" title="小技巧" >}}
这里写内容，支持 Markdown。
{{< /notice >}}
```

## 怎么开启评论

1. 新建一个 **公开** 仓库专门放评论，比如 `blog-comments`
2. 在该仓库进入 **Settings** → **General** → **Features**，勾选 **Discussions**
3. 打开 https://giscus.app ，填入仓库名，按提示授权 giscus App
4. 页面会生成一段配置，把 `data-repo` / `data-repo-id` / `data-category-id` 三个值抄到 `hugo.toml`：

```toml
[params.comments]
  enable     = true
  repo       = "LUYYY-Dev/blog-comments"
  repoId     = "R_xxxxxxxx"
  categoryId = "DIC_kwDOxxxxxxxx"
```

5. 双击 `发布到网站.cmd` 即可生效。

## 常见问题

**预览窗口一闪而过？**
说明 Hugo 没装好，先双击 `安装Hugo.cmd`。

**推送后 Actions 报错？**
打开仓库的 Actions 标签页，点进失败的那次运行看红色日志。
如果失败步骤是「读取 Pages 配置 / configure-pages」，说明推送时 Pages 还没开：
开好 Pages 后，点右上角的 **Re-run all jobs** 重新跑一次即可。

**网站打开是 404？**
首次部署需要等 1~2 分钟。另外确认仓库是 Public，并且 Pages 的 Source 选了 GitHub Actions。

**搜索没有结果？**
搜索索引是站点根目录的 `index.json`，必须通过网站地址访问才会加载，直接双击本地 HTML 文件是搜不到的。

**想绑定自己的域名？**
在 `static/` 下新建一个名为 `CNAME` 的文件，内容写你的域名，例如 `blog.example.com`，
然后到域名服务商那里把 DNS 指向 GitHub Pages。

---

## 技术说明

- 构建：Hugo Extended 0.166.0，纯静态输出，不需要 Node 或 npm
- 样式和脚本由 Hugo 的 asset pipeline 打包、压缩并加内容哈希
- 代码高亮用 Chroma，浅色与深色各一套，通过 `data-theme` 作用域切换
- 部署：GitHub Actions 构建 → GitHub Pages 托管

### 改脚本时注意（Windows 编码坑）

- `.cmd` 批处理文件**必须保存为 CRLF 换行**。用 LF 换行会让 cmd.exe 从单词中间截断命令，双击后直接报一堆莫名其妙的错甚至闪退。
- `tools/*.ps1` **必须保存为「UTF-8 带 BOM」**。Windows PowerShell 5.1 对没有 BOM 的文件会用系统 ANSI 代码页解析，中文会乱码并触发语法错误。
- `.cmd` 里的中文依赖开头的 `chcp 65001`，不要删掉那一行。
- 站内链接一律写成 `{{ partial "url.html" "/posts/" }}`，**不要**直接写 `{{ "/posts/" | relURL }}`。
  Hugo 的 `relURL` 对以 `/` 开头的路径不会拼上仓库子路径，本项目部署在 `/Leeon-Aria/` 下，
  直接写会导致线上大面积 404。

## 许可

文章内容版权归作者所有，站点代码可自由取用。
