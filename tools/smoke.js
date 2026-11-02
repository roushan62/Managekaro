// Headless smoke test for Managekaro using jsdom: loads the app, visits every route,
// triggers key interactions, and reports runtime errors.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('/tmp/domtest/node_modules/jsdom');

const ROOT = '/home/user/Managekaro';
const errors = [];
let CUR = 'boot';
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => { errors.push('[' + CUR + '] ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); });
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', () => {});
vc.on('log', () => {});

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  // strip remote font links (no network in test)
  .replace(/<link[^>]*fonts\.googleapis[^>]*>/g, '')
  .replace(/<link[^>]*fonts\.gstatic[^>]*>/g, '');

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), {
  url: 'https://managekaro.test/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;
// shims
window.fetch = () => Promise.reject(new Error('no network'));
window.print = () => {};
window.scrollTo = () => {};
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
window.HTMLElement.prototype.scrollIntoView = function () {};
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => 'blob:test';
if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = () => {};
Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: () => Promise.resolve() } });

for (const src of scripts) {
  const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
  try { window.eval(code); } catch (e) { errors.push('LOAD ' + src + ': ' + e.message); }
}

const MK = window.MK;
if (!MK) { console.error('MK missing'); process.exit(1); }

// boot
try {
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
} catch (e) { errors.push('BOOT: ' + (e.stack || e.message)); }

const siteRoutes = ['/', '/site/product', '/site/solutions', '/site/solutions/projects', '/site/pricing', '/site/security', '/site/contact', '/site/privacy', '/site/terms', '/login', '/login/signup', '/download', '/docs'];
const erpRoutes = ['/dashboard', '/my-work', '/approvals', '/projects', '/schedule', '/dpr', '/snags', '/rfis', '/documents', '/procurement', '/stores', '/finance', '/costing', '/crm', '/quotations', '/hrm', '/hrm/employees', '/hrm/attendance', '/hrm/leave', '/hrm/payroll', '/hrm/recruitment', '/hrm/performance', '/analytics', '/copilot', '/agents', '/assets', '/compliance', '/masters', '/users', '/integrations', '/settings', '/subscription', '/help'];

function visit(route) {
  CUR = route;
  try {
    window.location.hash = '#' + route;
    window.dispatchEvent(new window.Event('hashchange'));
    const len = window.document.getElementById('view') ? window.document.getElementById('view').innerHTML.length : window.document.getElementById('app').innerHTML.length;
    const app = window.document.getElementById('app').innerHTML;
    if (/Something went wrong/.test(app)) errors.push('RENDER FAIL ' + route + ': ' + (app.match(/class="alert">([^<]*)/) || [])[1]);
    if (len < 300) errors.push('SHORT RENDER ' + route + ' len=' + len);
    const root2 = window.document.getElementById('view') || window.document.getElementById('app');
    const imgs = [...root2.querySelectorAll('img')].map(i => i.getAttribute('src'));
    const bad = imgs.filter(src => src && !src.startsWith('http') && !fs.existsSync(path.join(ROOT, src)));
    if (bad.length) errors.push('MISSING IMG ' + route + ': ' + bad.join(', '));
    const txt = root2.textContent;
    if (/Page not found|404 — Not found/.test(txt)) errors.push('404 ' + route);
    return len;
  } catch (e) { errors.push('VISIT ' + route + ': ' + (e.stack || e.message)); return 0; }
}

let n = 0, total = 0;
siteRoutes.forEach(r => { total += visit(r); n++; });
erpRoutes.forEach(r => { total += visit(r); n++; });
// detail routes
const db = MK.store.db || (window.document.dispatchEvent(new window.Event('DOMContentLoaded')), MK.store.db);
if (!db) { console.log('no db — boot failed'); console.log(errors.slice(0,10)); process.exit(1); }
['projects', 'hrm/employees'].forEach((seg, i) => {
  const id = i === 0 ? db.projects[0].id : db.employees[0].id;
  total += visit('/' + seg + '/' + id); n++;
});

// interactions: open modals / tabs / drawers on key pages
function clickAll(route, sel, limit) {
  window.location.hash = '#' + route;
  window.dispatchEvent(new window.Event('hashchange'));
  const nodes = [...window.document.querySelectorAll(sel)].slice(0, limit || 3);
  nodes.forEach((el) => {
    try { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); }
    catch (e) { errors.push('CLICK ' + route + ' ' + sel + ': ' + e.message); }
  });
  // close overlays
  [...window.document.querySelectorAll('.overlay, .drawer')].forEach(o => o.remove());
}
[['/dashboard', '[data-export]'], ['/projects', '[data-new]'], ['/approvals', '[data-bulk]'], ['/snags', '[data-new]'], ['/procurement', '[data-po]'],
['/finance', '[data-expense]'], ['/crm', '[data-lead]'], ['/hrm/employees', '[data-emp]'], ['/hrm/payroll', '[data-run]'], ['/settings', '[data-addrule]'],
['/copilot', '[data-q]'], ['/masters', '[data-add]'], ['/users', '[data-invite]'], ['/stores', '[data-issue]']].forEach(x => clickAll(x[0], x[1], 2));

// tab clicks
['/procurement', '/finance', '/analytics', '/masters', '/settings', '/hrm'].forEach(r => {
  window.location.hash = '#' + r; window.dispatchEvent(new window.Event('hashchange'));
  [...window.document.querySelectorAll('.tab')].slice(0, 8).forEach(t => { try { t.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); } catch (e) { errors.push('TAB ' + r + ': ' + e.message); } });
});

// project detail tabs
window.location.hash = '#/projects/' + db.projects[0].id; window.dispatchEvent(new window.Event('hashchange'));
[...window.document.querySelectorAll('.tab')].forEach(t => { try { t.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); } catch (e) { errors.push('PROJTAB: ' + e.message); } });

// copilot ask
window.location.hash = '#/copilot'; window.dispatchEvent(new window.Event('hashchange'));
const inp = window.document.querySelector('[data-in]');
if (inp) { inp.value = 'Which projects are bleeding margin?'; const f = window.document.querySelector('[data-form]'); f.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); }

// reset & re-render
try { MK.store.reset(); } catch (e) { errors.push('RESET: ' + e.message); }

console.log('\n--- routes visited:', n, ' total HTML chars:', total);
console.log('--- errors:', errors.length);
const uniq = [...new Set(errors)];
uniq.slice(0, 40).forEach(e => console.log(' • ' + e.slice(0, 400)));
process.exit(uniq.length ? 1 : 0);
