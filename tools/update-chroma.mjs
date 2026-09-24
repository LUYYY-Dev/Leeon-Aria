/**
 * 重新生成 assets/css/chroma.css —— 代码块语法高亮配色。
 *
 * 用法：
 *   node tools/update-chroma.mjs
 *
 * 想换配色就改下面的 LIGHT_STYLE / DARK_STYLE，可选值见
 * https://gohugo.io/quick-reference/syntax-highlighting-styles/
 */
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const LIGHT_STYLE = "github";
const DARK_STYLE = "github-dark";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "assets", "css", "chroma.css");

function hugoBin() {
  const candidates = [
    process.env.HUGO_BIN,
    path.join(ROOT, ".tools", "hugo", "hugo.exe"),
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return "hugo"; // 回退到 PATH 里的 hugo
}

function generate(style) {
  const bin = hugoBin();
  const args = ["gen", "chromastyles", "--style=" + style];
  const dir = mkdtempSync(path.join(tmpdir(), "chroma-"));
  const file = path.join(dir, style + ".css");

  // 直接把文件描述符交给子进程，避开管道（某些沙箱环境禁止管道 stdio）。
  const fd = openSync(file, "w");
  try {
    execFileSync(bin, args, { stdio: ["ignore", fd, "ignore"] });
  } finally {
    closeSync(fd);
  }
  return readFileSync(file, "utf8").replace(/^\uFEFF/, "");
}

/* 给每条选择器加上主题作用域前缀，实现亮/暗自动切换 */
function scope(css, selector) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return clean.replace(/([^{}]+)\{/g, (whole, sels) => {
    const parts = sels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => selector + " " + s)
      .join(",\n");
    return parts ? "\n" + parts + " {" : whole;
  });
}

const dark = scope(generate(DARK_STYLE), '[data-theme="dark"]');
const light = scope(generate(LIGHT_STYLE), '[data-theme="light"]');

const header =
  "/* ------------------------------------------------------------------\n" +
  "   代码块语法高亮配色，由 tools/update-chroma.mjs 自动生成。\n" +
  "   请勿手动编辑；要换配色请修改该脚本后重新运行。\n" +
  "   浅色：" + LIGHT_STYLE + "   深色：" + DARK_STYLE + "\n" +
  "   ------------------------------------------------------------------ */\n";

writeFileSync(OUT, header + dark + "\n" + light + "\n", "utf8");
console.log("已生成 " + path.relative(ROOT, OUT) + "  (" + (header + dark + light).length + " 字符)");
