const H = { 'User-Agent': 'dsh-agent', 'Accept': 'application/vnd.github+json' };
const r = await fetch('https://api.github.com/repos/actions/configure-pages/contents/action.yml', { headers: H });
if (r.status !== 200) { console.log('action.yml HTTP ' + r.status); process.exit(0); }
const j = await r.json();
const text = Buffer.from(j.content, 'base64').toString('utf8');
const lines = text.split('\n');
const i = lines.findIndex(l => /enablement/i.test(l));
console.log('===== configure-pages action.yml 中 enablement 的说明 =====');
console.log(lines.slice(Math.max(0, i - 2), i + 12).join('\n'));
