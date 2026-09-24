/**
 * 新建一篇文章。
 *
 * 一般不用直接运行：双击根目录的「新建文章.cmd」即可。
 * 也可以直接带标题运行：node tools/new-post.mjs "文章标题"
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");

/**
 * 读一行输入。输入流结束时会返回空字符串，绝不让 Promise 悬空。
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let settled = false;

    rl.on("close", () => {
      if (settled) return;
      settled = true;
      resolve("");
    });

    rl.question(question, (answer) => {
      if (settled) return;
      settled = true;
      rl.close();
      resolve(answer);
    });
  });
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base) {
  const safe = base || ("post-" + Date.now());
  let slug = safe;
  let n = 2;
  while (existsSync(path.join(POSTS_DIR, slug + ".md"))) {
    slug = safe + "-" + n;
    n += 1;
  }
  return slug;
}

function buildFile(title) {
  const date = today();
  return [
    "---",
    "title: " + JSON.stringify(title),
    "date: " + date,
    "lastmod: " + date,
    "draft: true",
    "summary: \"\"",
    "tags: []",
    "categories: []",
    "series: []",
    "---",
    "",
    "在这里开始写正文。",
    "",
    "## 小标题",
    "",
    "正文内容。",
    "",
  ].join("\n");
}

async function main() {
  let title = process.argv.slice(2).join(" ").trim();

  if (!title) {
    console.log("");
    title = (await ask("文章标题：")).trim();
  }

  if (!title) {
    console.log("");
    console.log("没有输入标题，已取消。");
    process.exit(1);
  }

  const slug = uniqueSlug(slugify(title));
  mkdirSync(POSTS_DIR, { recursive: true });

  const target = path.join(POSTS_DIR, slug + ".md");
  writeFileSync(target, buildFile(title), "utf8");

  const rel = path.relative(ROOT, target);
  console.log("");
  console.log("已创建：" + rel);
  console.log("");
  console.log("文件名是文章网址的一部分，想改就现在改（保持英文/数字最好）。");
  console.log("正文写完后，把文件里的 draft: true 改成 draft: false 就会发布出去。");
  console.log("");

  // 尝试用系统默认程序打开，失败也不影响结果
  try {
    const child = spawn("cmd", ["/c", "start", "", target], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    console.log("已尝试用默认程序打开它。如果没有弹出窗口，手动打开：" + target);
    console.log("");
  } catch (e) {
    console.log("请手动打开这个文件：" + target);
    console.log("");
  }
}

await main();
