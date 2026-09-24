const H = { 'User-Agent': 'dsh-agent', 'Accept': 'application/vnd.github+json' };
const get = async (p) => {
  const r = await fetch('https://api.github.com' + p, { headers: H });
  return { status: r.status, d: await r.json().catch(() => null) };
};

console.log('===== 对照实验：一个有 Pages 的公开仓库 =====');
const ctrl = await get('/repos/nunocoracao/blowfish/pages');
console.log('  nunocoracao/blowfish 的 /pages => HTTP ' + ctrl.status + '  ' + JSON.stringify(ctrl.d).slice(0, 120));
console.log('  => 若同样是 404，说明这个接口对匿名请求本来就不给看，不能用来判断你有没有开 Pages');

console.log('');
console.log('===== 我们仓库的 Pages 相关字段 =====');
const repo = await get('/repos/LUYYY-Dev/Leeon-Aria');
console.log('  has_pages : ' + repo.d.has_pages);
console.log('  visibility: ' + (repo.d.private ? 'private' : 'public'));

console.log('');
console.log('===== configure-pages 官方 README（节选）=====');
const rm = await get('/repos/actions/configure-pages/readme');
if (rm.status === 200 && rm.d && rm.d.content) {
  const text = Buffer.from(rm.d.content, 'base64').toString('utf8');
  const lines = text.split('\n');
  const start = lines.findIndex(l => /enablement/i.test(l));
  if (start >= 0) console.log(lines.slice(Math.max(0, start - 6), start + 18).join('\n'));
  else console.log(text.slice(0, 900));
} else {
  console.log('  HTTP ' + rm.status);
}
