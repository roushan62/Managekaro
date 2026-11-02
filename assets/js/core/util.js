/* Managekaro core utilities: dom, format, dates, randomness, csv */
window.MK = window.MK || {};
(function (MK) {
  'use strict';
  const U = {};

  /* ------------------------------- dom ---------------------------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  U.$ = $; U.$$ = $$;
  U.el = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  U.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); };
  U.on = function (root, ev, sel, fn) {
    (root || document).addEventListener(ev, function (e) {
      const t = e.target.closest(sel);
      if (t && (root || document).contains(t)) fn.call(t, e, t);
    });
  };
  U.attr = (s) => String(s).replace(/["'&<>]/g, c => '&#' + c.charCodeAt(0) + ';');
  U.debounce = (fn, ms) => { let t; return function () { clearTimeout(t); const a = arguments, s = this; t = setTimeout(() => fn.apply(s, a), ms || 200); }; };

  /* ----------------------------- numbers -------------------------------- */
  U.n = (v) => { const x = Number(v); return isFinite(x) ? x : 0; };
  U.round = (v, d) => { const m = Math.pow(10, d == null ? 2 : d); return Math.round((U.n(v) + Number.EPSILON) * m) / m; };
  U.sum = (arr, f) => arr.reduce((a, x) => a + U.n(f ? f(x) : x), 0);
  U.pct = (a, b) => (U.n(b) === 0 ? 0 : U.round((U.n(a) / U.n(b)) * 100, 1));
  U.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  U.avg = (arr, f) => (arr.length ? U.sum(arr, f) / arr.length : 0);

  const nf = (min, max) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: min, maximumFractionDigits: max });
  const nf0 = nf(0, 0), nf2 = nf(2, 2), nf1 = nf(0, 1);
  U.num = (v, d) => (d === 0 ? nf0 : d === 1 ? nf1 : nf2).format(U.n(v));

  /* ------------------------------ money --------------------------------- */
  U.cur = function (v, opts) {
    opts = opts || {};
    const n = U.n(v);
    const a = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    const pre = opts.bare ? '' : (opts.sym || '₹');
    if (opts.compact !== false) {
      if (a >= 1e7) return sign + pre + nf2.format(a / 1e7) + ' Cr';
      if (a >= 1e5) return sign + pre + nf2.format(a / 1e5) + ' L';
      if (a >= 1e3 && opts.thousand !== false) return sign + pre + nf0.format(a);
    }
    return sign + pre + nf0.format(a);
  };
  U.curFull = (v) => (U.n(v) < 0 ? '-' : '') + '₹' + nf0.format(Math.abs(U.n(v)));
  U.lakh = (v) => '₹' + nf2.format(U.n(v) / 1e5) + ' L';
  U.crore = (v) => '₹' + nf2.format(U.n(v) / 1e7) + ' Cr';
  /* smart money: exact under 1L, else compact */
  U.money = (v) => { const a = Math.abs(U.n(v)); return a > 99999 ? U.crore(v).replace('₹', '₹') : U.curFull(v); };

  /* ------------------------------ dates --------------------------------- */
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY = 864e5;
  U.M = M;
  U.today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  U.parse = (v) => (v instanceof Date ? new Date(v) : new Date(String(v).length <= 10 ? v + 'T00:00:00' : v));
  U.iso = (d) => { if (!d) return ''; const x = U.parse(d); if (isNaN(x)) return ''; return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  U.fmtD = (d) => { if (!d) return '—'; const x = U.parse(d); if (isNaN(x)) return '—'; return x.getDate() + ' ' + M[x.getMonth()] + ' ' + String(x.getFullYear()).slice(2); };
  U.fmtDL = (d) => { if (!d) return '—'; const x = U.parse(d); if (isNaN(x)) return '—'; return x.getDate() + ' ' + M[x.getMonth()] + ' ' + x.getFullYear(); };
  U.fmtDT = (d) => { if (!d) return '—'; const x = U.parse(d); if (isNaN(x)) return '—'; return U.fmtD(x) + ', ' + x.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); };
  U.fmtM = (d) => { const x = U.parse(d); return M[x.getMonth()] + " '" + String(x.getFullYear()).slice(2); };
  U.addD = (d, n) => { const x = U.parse(d); x.setDate(x.getDate() + n); return x; };
  U.diff = (a, b) => Math.round((U.parse(a) - U.parse(b)) / DAY);
  U.ago = function (d) {
    if (!d) return '—';
    const diff = Math.round((U.today() - U.parse(d)) / DAY);
    if (isNaN(diff)) return '—';
    if (diff < 0) return U.inDays(-diff);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return diff + 'd ago';
    if (diff < 30) return Math.floor(diff / 7) + 'w ago';
    if (diff < 365) return Math.floor(diff / 30) + 'mo ago';
    return Math.floor(diff / 365) + 'y ago';
  };
  U.inDays = (n) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 0 ? 'in ' + n + 'd' : Math.abs(n) + 'd overdue');
  U.dueCls = (d) => { if (!d) return ''; const n = U.diff(d, U.today()); return n < 0 ? 'bad' : n <= 3 ? 'warn' : 'ok'; };
  U.monthKey = (d) => { const x = U.parse(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); };
  U.lastMonths = (n) => {
    const out = [], t = U.today();
    for (let i = n - 1; i >= 0; i--) { const d = new Date(t.getFullYear(), t.getMonth() - i, 1); out.push({ key: U.monthKey(d), label: M[d.getMonth()], full: M[d.getMonth()] + ' ' + d.getFullYear(), date: d }); }
    return out;
  };
  U.fyLabel = function (d) { const x = U.parse(d || new Date()); const y = x.getMonth() >= 3 ? x.getFullYear() : x.getFullYear() - 1; return 'FY ' + String(y).slice(2) + '-' + String(y + 1).slice(2); };

  /* ---------------------------- randomness ------------------------------ */
  U.rng = function (seed) {
    let a = seed >>> 0;
    const f = function () { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.int = (min, max) => Math.floor(f() * (max - min + 1)) + min;
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.chance = (p) => f() < p;
    f.some = (arr, k) => { const c = arr.slice(), o = []; k = Math.min(k, c.length); for (let i = 0; i < k; i++) o.push(c.splice(Math.floor(f() * c.length), 1)[0]); return o; };
    f.amt = (min, max) => Math.round((min + f() * (max - min)) / 100) * 100;
    return f;
  };

  /* ------------------------------ text ---------------------------------- */
  U.initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  U.title = (s) => String(s || '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  U.slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  U.uid = (pre) => (pre || 'id') + '_' + Math.random().toString(36).slice(2, 9);
  U.sortBy = (arr, f, dir) => arr.slice().sort((a, b) => { const x = f(a), y = f(b); if (x === y) return 0; const r = x > y ? 1 : -1; return dir === 'desc' ? -r : r; });
  U.groupBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});
  U.uniq = (arr) => Array.from(new Set(arr));
  U.tonum = (v) => { const s = String(v == null ? '' : v).replace(/[₹,\s]/g, '').replace(/(cr|l|k)$/i, m => ({ cr: '0000000', l: '00000', k: '000' }[m.toLowerCase()] || '')); return Number(s) || 0; };

  /* ------------------------------- csv ---------------------------------- */
  U.toCSV = function (rows, headers) {
    const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = headers ? headers.map(h => esc(h.label || h)).join(',') : Object.keys(rows[0] || {}).join(',');
    const keys = headers ? headers.map(h => h.key || h) : Object.keys(rows[0] || {});
    return [head].concat(rows.map(r => keys.map(k => esc(typeof r[k] === 'number' ? r[k] : r[k])).join(','))).join('\n');
  };
  U.download = function (filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  U.csv = (filename, rows, headers) => U.download(filename.replace(/\.csv$/i, '') + '.csv', '\ufeff' + U.toCSV(rows, headers), 'text/csv');

  /* --------------------------- text extraction -------------------------- */
  U.words = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s.]/g, ' ').split(/\s+/).filter(Boolean);
  U.jaccard = (a, b) => { const A = new Set(U.words(a)), B = new Set(U.words(b)); let i = 0; A.forEach(w => { if (B.has(w)) i++; }); return i / (A.size + B.size - i || 1); };

  /* ------------------------------ palette ------------------------------- */
  U.palette = ['#F2540B', '#2563EB', '#0E9F6E', '#7C3AED', '#0D9488', '#D97706', '#DB2777', '#4B5563', '#84CC16', '#0891B2'];
  U.color = (i) => U.palette[Math.abs(i) % U.palette.length];

  MK.U = U;
})(window.MK);
