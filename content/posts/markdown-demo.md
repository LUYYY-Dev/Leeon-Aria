---
title: "排版参考：这个博客支持的所有写作格式"
date: 2026-09-18
draft: false
summary: "一篇用来测试样式的参考文章，包含标题、列表、表格、代码、引用、图片与提示框。写新文章时可以对照这篇。"
tags: ["指南"]
categories: ["使用说明"]
---

这篇是**排版参考**，不是正经文章。写新内容时照抄需要的部分即可。

## 文本样式

支持 **加粗**、*斜体*、~~删除线~~、`行内代码`，以及 [外部链接](https://gohugo.io)。

## 列表

无序列表：

- 第一项
- 第二项
  - 嵌套一项
  - 嵌套二项
- 第三项

有序列表：

1. 第一步
2. 第二步
3. 第三步

## 引用

> 一句话引用。
>
> 多段引用也可以，第二段继续写。
>
> —— 某个人

## 表格

| 功能 | 是否支持 | 说明 |
| --- | :---: | --- |
| 标签分类 | ✅ | 自动生成标签页 |
| 站内搜索 | ✅ | 纯前端，无需服务器 |
| 评论 | ✅ | 基于 Giscus |
| 数学公式 | ➖ | 需自行接入 KaTeX |

## 代码块

行内代码写作 `npm run build`。代码块会自动高亮并带上复制按钮：

```typescript
type Post = {
  title: string;
  tags: string[];
  date: string;
};

function readingTime(words: number): number {
  // 中文按 350 字/分钟估算
  return Math.max(1, Math.round(words / 350));
}
```

```bash
# 本地预览
hugo server -D

# 构建静态文件到 public/
hugo --minify
```

```python
import json
from pathlib import Path

def load_posts(root: str) -> list[dict]:
    return [json.loads(p.read_text("utf-8"))
            for p in Path(root).glob("*.json")]
```

## 提示框

{{< notice type="tip" title="小技巧" >}}
把常用的短代码记在 `archetypes/default.md` 里，新建文章就会自动带上。
{{< /notice >}}

{{< notice type="warning" title="注意" >}}
修改 `hugo.toml` 之后需要重启 `hugo server` 才会完全生效。
{{< /notice >}}

{{< notice type="info" title="说明" >}}
短代码的写法是 `{{</* notice type="tip" title="标题" */>}} … {{</* /notice */>}}`，
可选类型有 tip、info、warning、danger 四种。
{{< /notice >}}

## 图片

把图片放进 `static/images/` 目录，然后用绝对路径引用：

```markdown
![图片说明](/images/example.png)
```

## 数学公式

需要的话可以自行引入 KaTeX，默认没有开启，避免拖慢加载速度。
