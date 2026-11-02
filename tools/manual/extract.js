// Extract live seeded data from the app (via jsdom) for docs screenshots + figures.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('/tmp/domtest/node_modules/jsdom');
const ROOT = path.resolve(__dirname, '..', '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g, '');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), { url: 'https://m.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.print = () => {}; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
for (const s of scripts) w.eval(fs.readFileSync(path.join(ROOT, s), 'utf8'));
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

const MK = w.MK, S = MK.store, U = MK.U, db = S.db;
const m = S.metrics();
const out = {
  brand: 'Managekaro',
  metrics: m,
  org: { name: 'Managekaro Spaces', user: S.me().name, role: S.roleName() },
  months: U.lastMonths(6).map(d => d.label + " '" + String(d.date.getFullYear()).slice(2)),
  revenue: U.lastMonths(6).map(d => U.sum(db.clientInvoices.filter(i => (i.date || '').slice(0, 7) === d.key), i => i.total)),
  collected: U.lastMonths(6).map(d => U.sum(db.clientInvoices.filter(i => (i.date || '').slice(0, 7) === d.key), i => i.received || 0)),
  projects: db.projects.slice(0, 8).map(p => ({ id: p.id, name: p.name, client: p.client, type: p.type, status: p.status, health: p.health, budget: p.budget, spent: p.spent, progress: p.progress, pm: p.pm, city: p.city, due: p.due })),
  tasks: db.tasks.slice(0, 8).map(t => ({ title: t.title, due: t.due, status: t.status, pri: t.priority, owner: S.empName(t.assignee) })),
  employees: db.employees.slice(0, 8).map(e => Object.assign({}, e, { dept: (db.departments.find(x => x.id === e.deptId) || {}).name || '—' })),
  counts: Object.fromEntries(Object.entries(db).filter(([k, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])),
  payroll: (S.db.payrollRuns || []).slice(0, 3),
  vendors: (db.vendors || []).slice(0, 6).map(v => ({ name: v.name, cat: v.category, rating: v.rating, outstanding: v.outstanding })),
  nav: MK.UI.NAV.map(g => ({ group: g.group, items: g.items.map(i => i.title) }))
};
fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(out, null, 1));
console.log('counts', out.counts);
console.log('metrics keys', Object.keys(m).slice(0, 40).join(','));
