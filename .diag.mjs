const H = { 'User-Agent': 'dsh-agent', 'Accept': 'application/vnd.github+json' };
const api = async (p) => {
  const r = await fetch('https://api.github.com' + p, { headers: H });
  let d = null;
  try { d = await r.json(); } catch (e) {}
  return { status: r.status, d };
};

const REPO = '/repos/LUYYY-Dev/Leeon-Aria';

const r0 = await api(REPO);
console.log('===== 仓库 =====');
if (r0.status !== 200) { console.log('  查询失败 HTTP ' + r0.status + ' ' + JSON.stringify(r0.d).slice(0,200)); process.exit(0); }
console.log('  可见性     : ' + (r0.d.private ? '私有 ← 问题！' : '公开'));
console.log('  默认分支   : ' + r0.d.default_branch);
console.log('  最后推送   : ' + r0.d.pushed_at);
console.log('  仓库大小   : ' + r0.d.size + ' KB');
console.log('  已启用Pages: ' + r0.d.has_pages);

const r1 = await api(REPO + '/pages');
console.log('');
console.log('===== Pages 配置 =====');
if (r1.status === 200) {
  console.log('  状态     : ' + r1.d.status + (r1.d.status === 'built' ? '  (已部署)' : ''));
  console.log('  访问地址 : ' + r1.d.html_url);
  console.log('  cname    : ' + (r1.d.cname || '(无)'));
  console.log('  build_type: ' + r1.d.build_type);
} else {
  console.log('  HTTP ' + r1.status + '  ' + JSON.stringify(r1.d).slice(0, 200));
  console.log('  （未启用 Pages 或是私有仓库）');
}

console.log('');
console.log('===== 工作流运行记录 =====');
const r2 = await api(REPO + '/actions/runs?per_page=5');
if (r2.status !== 200) {
  console.log('  HTTP ' + r2.status + '  ' + JSON.stringify(r2.d).slice(0, 200));
} else {
  console.log('  总运行次数: ' + r2.d.total_count);
  for (const run of r2.d.workflow_runs) {
    console.log('  ------------------------------------------');
    console.log('   名称   : ' + run.name);
    console.log('   触发   : ' + run.event + '  分支 ' + run.head_branch);
    console.log('   状态   : ' + run.status + ' / ' + (run.conclusion || '进行中'));
    console.log('   提交   : ' + run.head_sha.slice(0, 7));
    console.log('   时间   : ' + run.created_at);
    console.log('   链接   : ' + run.html_url);
    if (run.conclusion === 'failure') {
      const r3 = await api(REPO + '/actions/runs/' + run.id + '/jobs');
      if (r3.status === 200) {
        for (const job of r3.d.jobs) {
          console.log('   >>> 作业 [' + job.name + '] => ' + job.conclusion);
          for (const s of job.steps) {
            if (s.conclusion === 'failure') console.log('        失败步骤: ' + s.name);
          }
        }
      }
    }
  }
}

console.log('');
console.log('===== 仓库根目录内容 =====');
const r4 = await api(REPO + '/contents/');
if (r4.status === 200) {
  r4.d.forEach(f => console.log('  ' + (f.type === 'dir' ? '[目录] ' : '       ') + f.name));
} else { console.log('  HTTP ' + r4.status); }
