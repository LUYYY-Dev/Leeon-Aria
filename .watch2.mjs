const H = { 'User-Agent': 'dsh-agent', 'Accept': 'application/vnd.github+json' };
const REPO = '/repos/LUYYY-Dev/Leeon-Aria';
const api = async (p) => (await fetch('https://api.github.com' + p, { headers: H })).json();
const latest = async () => (await api(REPO + '/actions/runs?per_page=1')).workflow_runs[0];
let run = await latest();
console.log('运行 ' + run.head_sha.slice(0, 7) + ': ' + run.status + ' / ' + (run.conclusion || '进行中'));
const t0 = Date.now();
while (run.status !== 'completed' && Date.now() - t0 < 300000) {
  await new Promise((r) => setTimeout(r, 8000));
  run = await latest();
}
console.log('结果: ' + run.conclusion);
const tree = await api(REPO + '/contents/');
console.log('');
console.log('GitHub 仓库根目录现在的内容:');
tree.forEach((f) => console.log('  ' + (f.type === 'dir' ? '[目录] ' : '       ') + f.name));
const site = await fetch('https://luyyy-dev.github.io/Leeon-Aria/');
console.log('');
console.log('站点状态: HTTP ' + site.status);
