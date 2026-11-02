/* Managekaro — UI kit: shell, router, tables, charts, modals, toasts, command palette */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, icon = MK.icon;
  const UI = {};

  /* ------------------------------ toast -------------------------------- */
  UI.toast = function (msg, type, title) {
    let host = document.getElementById('toasts');
    if (!host) { host = U.el('<div id="toasts"></div>'); document.body.appendChild(host); }
    const map = { ok: '✓', bad: '!', warn: '!', info: 'i' };
    const t = U.el(`<div class="toast ${type || 'info'}"><div class="ic">${map[type || 'info'] || 'i'}</div><div>${title ? '<b>' + U.esc(title) + '</b>' : ''}${U.esc(msg)}</div></div>`);
    host.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(12px)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 320); }, 3800);
  };

  /* ------------------------------ modal -------------------------------- */
  UI.modal = function (opts) {
    const ov = U.el(`<div class="overlay" role="dialog" aria-modal="true">
      <div class="modal ${opts.size || ''}">
        <div class="modal-h">
          <div><h3>${U.esc(opts.title || '')}</h3>${opts.sub ? `<div class="sub">${U.esc(opts.sub)}</div>` : ''}</div>
          <button class="x-btn" data-x aria-label="Close">${icon('x', 15)}</button>
        </div>
        <div class="modal-b">${opts.body || ''}</div>
        ${opts.footer === false ? '' : `<div class="modal-f">${opts.footer || `<button class="btn" data-x>Cancel</button><button class="btn primary" data-ok>${U.esc(opts.okText || 'Save')}</button>`}</div>`}
      </div></div>`);
    document.body.appendChild(ov);
    const close = () => { ov.remove(); document.removeEventListener('keydown', esc); if (opts.onClose) opts.onClose(); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    U.$$('[data-x]', ov).forEach(b => b.addEventListener('click', close));
    const ok = U.$('[data-ok]', ov);
    if (ok) ok.addEventListener('click', async () => {
      if (opts.onOk) {
        const r = await opts.onOk(ov, close);
        if (r !== false) close();
      } else close();
    });
    if (opts.onMount) opts.onMount(ov, close);
    return { el: ov, close };
  };

  UI.confirm = function (title, msg, onYes, danger) {
    return UI.modal({
      title, body: `<p class="sm" style="color:var(--tx-2)">${U.esc(msg || '')}</p>`, size: 'narrow', okText: danger ? 'Delete' : 'Confirm',
      onOk: () => { if (onYes) onYes(); }
    });
  };

  UI.drawer = function (opts) {
    const ov = U.el(`<div class="overlay" style="align-items:stretch;padding:0;justify-content:flex-end"><div class="drawer ${opts.size || ''}">
      <div class="drawer-h"><div><h3>${U.esc(opts.title || '')}</h3>${opts.sub ? `<div class="sub tiny" style="color:var(--tx-3);margin-top:3px">${U.esc(opts.sub)}</div>` : ''}</div><button class="x-btn" data-x>${icon('x', 15)}</button></div>
      <div class="drawer-b">${opts.body || ''}</div>
      ${opts.footer === false ? '' : `<div class="drawer-f">${opts.footer || `<button class="btn" data-x>Close</button>`}</div>`}
    </div></div>`);
    document.body.appendChild(ov);
    const close = () => { ov.remove(); if (opts.onClose) opts.onClose(); };
    U.$$('[data-x]', ov).forEach(b => b.addEventListener('click', close));
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    if (opts.onMount) opts.onMount(ov, close);
    return { el: ov, close };
  };

  /* --------------------------- small pieces ---------------------------- */
  UI.badge = function (text, kind) { return `<span class="badge ${kind || ''}">${U.esc(text)}</span>`; };
  const STATUS_MAP = {
    'In Progress': 'info', 'Completed': 'ok', 'Planning': 'purple', 'On Hold': 'warn', 'Snagging': 'teal', 'Closed': 'ok', 'Cancelled': 'bad',
    'On Track': 'ok', 'At Risk': 'warn', 'Critical': 'bad', 'Approved': 'ok', 'Pending': 'warn', 'Pending Approval': 'warn', 'Rejected': 'bad',
    'Paid': 'ok', 'Partially Paid': 'warn', 'Overdue': 'bad', 'Sent': 'info', 'Draft': 'grey', 'Open': 'bad', 'Resolved': 'teal', 'Reopened': 'bad',
    'Active': 'ok', 'Inactive': 'grey', 'On Notice': 'warn', 'Resigned': 'bad', 'Blacklisted': 'bad', 'Achieved': 'ok', 'Missed': 'bad',
    'Fully Received': 'ok', 'Partially Received': 'warn', 'Accepted': 'ok', 'Partially Accepted': 'warn', 'In Stock': 'ok', 'Low Stock': 'warn',
    'Out of Stock': 'bad', 'Done': 'ok', 'To Do': 'grey', 'Review': 'purple', 'Answered': 'ok', 'Hired': 'ok', 'Screening': 'info',
    'Interview': 'purple', 'Offer': 'warn', 'Applied': 'grey', 'Won': 'ok', 'Lost': 'bad', 'Released': 'ok', 'Processing': 'warn',
    'Connected': 'ok', 'Available': 'grey', 'New': 'info', 'Qualified': 'info', 'Negotiation': 'warn', 'Proposal Sent': 'purple',
    'Site Visit': 'teal', 'Not Started': 'grey', 'Issued': 'info', 'For Review': 'warn', 'Superseded': 'grey', 'Paid ': 'ok',
    'Present': 'ok', 'Absent': 'bad', 'Leave': 'warn', 'Half Day': 'warn', 'Late': 'warn', 'Weekly Off': 'grey', 'Work From Home': 'info',
    'In Review': 'info', 'Under Review': 'info', 'Scheduled': 'info', 'Expiring': 'warn', 'In Use': 'ok', 'In Store': 'grey',
    'Under Repair': 'warn', 'Retired': 'grey', 'Passed': 'ok', 'Failed': 'bad', 'Pending Approval ': 'warn', 'Invoiced': 'info',
    'High': 'bad', 'Medium': 'warn', 'Low': 'grey', 'Urgent': 'bad', 'Normal': 'grey', 'Normal ': 'grey', 'Addition': 'info',
    'Omission': 'warn', 'Substitution': 'purple', 'Posted': 'ok', 'Filed': 'ok', 'Generated': 'info'
  };
  UI.pill = function (text, override) {
    if (text == null || text === '') return '<span class="muted">—</span>';
    const k = override || STATUS_MAP[text] || (/^(Paid|Closed|Completed|Approved|Done|Active|Won|Achieved)$/.test(text) ? 'ok' : /(Pending|Hold|Risk|Late|Partial|Review|Warn)/.test(text) ? 'warn' : /(Reject|Overdue|Missed|Critical|Failed|Absent|Cancelled)/.test(text) ? 'bad' : '');
    return `<span class="badge ${k}">${U.esc(text)}</span>`;
  };
  UI.av = function (name, cls, title) {
    const i = (String(name || '?').charCodeAt(0) + String(name || '').length) % 6;
    return `<span class="av c${i + 1} ${cls || ''}" title="${U.attr(title || name || '')}">${U.initials(name)}</span>`;
  };
  UI.avStack = function (names, max) {
    max = max || 4;
    const list = names.slice(0, max).map(n => UI.av(n)).join('');
    const extra = names.length > max ? `<span class="av" style="background:#EEF1F6;color:#5B6478">+${names.length - max}</span>` : '';
    return `<span class="avatar-stack">${list}${extra}</span>`;
  };
  UI.bar = function (pct, cls) { return `<div class="bar ${cls || ''}"><span style="width:${U.clamp(U.n(pct), 0, 100)}%"></span></div>`; };
  UI.ring = function (pct, label) { return `<div class="ring" style="--p:${U.clamp(U.n(pct), 0, 100)}"><span>${label != null ? label : Math.round(pct) + '%'}</span></div>`; };
  UI.money = (v) => `<span class="mono">${U.cur(v)}</span>`;
  UI.kpi = function (o) {
    return `<div class="kpi">
      ${o.icon ? `<div class="ico" style="${o.iconBg ? 'background:' + o.iconBg + ';color:' + o.iconColor : ''}">${icon(o.icon, 16)}</div>` : ''}
      <div class="lab">${U.esc(o.label)}</div>
      <div class="val">${o.value}${o.unit ? `<small> ${U.esc(o.unit)}</small>` : ''}</div>
      ${o.foot || o.trend ? `<div class="foot">${o.trend ? `<span class="trend ${o.trend.dir || 'up'}">${o.trend.dir === 'down' ? icon('arrowDown', 10) : o.trend.dir === 'flat' ? '' : icon('arrowUp', 10)}${U.esc(o.trend.text)}</span>` : ''}<span>${o.foot || ''}</span></div>` : ''}
    </div>`;
  };
  UI.pageHead = function (title, sub, actions) {
    return `<div class="page-head"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div><div class="row wrap gap6 no-print">${actions || ''}</div></div>`;
  };
  UI.empty = function (title, msg, actionHtml, iconName) {
    return `<div class="empty"><div class="icon">${icon(iconName || 'inbox', 22)}</div><h4>${U.esc(title)}</h4><p>${U.esc(msg || '')}</p>${actionHtml || ''}</div>`;
  };
  UI.card = function (title, bodyHtml, opts) {
    opts = opts || {};
    return `<div class="card ${opts.cls || ''}">${title === false ? '' : `<div class="card-h"><h3>${title}</h3>${opts.actions || ''}</div>`}<div class="card-b ${opts.flush ? 'flush' : ''}">${bodyHtml}</div></div>`;
  };
  UI.tabs = function (id, tabs, active, onPick) {
    return `<div class="tabs" data-tabs="${id}">${tabs.map(t => `<div class="tab ${t.id === active ? 'on' : ''}" data-tab="${t.id}">${U.esc(t.label)}${t.count != null ? `<span class="cnt">${t.count}</span>` : ''}</div>`).join('')}</div>`;
  };
  UI.wireTabs = function (root, onPick) {
    U.$$('[data-tabs]', root).forEach(host => {
      host.addEventListener('click', e => {
        const t = e.target.closest('[data-tab]'); if (!t) return;
        U.$$('.tab', host).forEach(x => x.classList.toggle('on', x === t));
        onPick(t.getAttribute('data-tab'));
      });
    });
  };

  U.wireTabs = UI.wireTabs;

  /* ------------------------------ charts ------------------------------- */
  UI.spark = function (vals, color, w, h) {
    const W = w || 120, H = h || 34, max = Math.max.apply(null, vals.concat([1])), min = Math.min.apply(null, vals.concat([0]));
    const pts = vals.map((v, i) => [i * (W / Math.max(1, vals.length - 1)), H - 2 - ((v - min) / (max - min || 1)) * (H - 6)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = d + ` L${W} ${H} L0 ${H} Z`;
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color || '#F2540B'}" stop-opacity=".28"/><stop offset="1" stop-color="${color || '#F2540B'}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color || '#F2540B'}" stroke-width="2" stroke-linecap="round"/></svg>`;
  };
  UI.lineChart = function (series, labels, opts) {
    opts = opts || {};
    const W = 640, H = opts.height || 210, pl = 44, pr = 12, pt = 12, pb = 26;
    const all = series.reduce((a, s) => a.concat(s.data), []);
    const max = opts.max || Math.max.apply(null, all.concat([1])) * 1.08;
    const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
    const y = (v) => pt + (H - pt - pb) * (1 - v / max);
    const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${pl}" x2="${W - pr}" y1="${(pt + (H - pt - pb) * f).toFixed(1)}" y2="${(pt + (H - pt - pb) * f).toFixed(1)}" stroke="#EEF1F6" stroke-width="1"/><text x="${pl - 7}" y="${(pt + (H - pt - pb) * f + 3.5).toFixed(1)}" font-size="9.5" fill="#A2AABD" text-anchor="end">${U.cur(max * (1 - f), { compact: true, thousand: false })}</text>`).join('');
    const paths = series.map((s, si) => {
      const color = s.color || U.color(si);
      const d = s.data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
      const gid = 'lc' + si + Math.random().toString(36).slice(2, 6);
      const area = s.fill === false ? '' : `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${x(s.data.length - 1)} ${H - pb} L${pl} ${H - pb} Z" fill="url(#${gid})"/>`;
      const dots = s.data.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.6" fill="#fff" stroke="${color}" stroke-width="2"><title>${s.name}: ${U.cur(v)}</title></circle>`).join('');
      return area + `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` + dots;
    }).join('');
    const xlabels = labels.map((l, i) => `<text x="${x(i).toFixed(1)}" y="${H - 7}" font-size="9.8" fill="#78829A" text-anchor="middle">${U.esc(l)}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" style="max-height:${H}px">${grid}${paths}${xlabels}</svg>`;
  };
  UI.barChart = function (rows, opts) {
    opts = opts || {};
    const max = Math.max.apply(null, rows.map(r => r.value).concat([1]));
    return `<div class="col gap6">${rows.map((r, i) => `
      <div>
        <div class="row-between tiny" style="margin-bottom:3px"><span class="trunc" style="max-width:66%;font-weight:600">${U.esc(r.label)}</span><span class="mono" style="color:var(--tx-2)">${r.text || U.cur(r.value)}</span></div>
        <div class="bar ${r.cls || ''}"><span style="width:${U.clamp((r.value / max) * 100, 1, 100)}%;background:${r.color || ''}"></span></div>
      </div>`).join('')}</div>`;
  };
  UI.donut = function (segments, opts) {
    opts = opts || {};
    const total = U.sum(segments, s => s.value) || 1;
    let acc = 0;
    const R = 54, C = 2 * Math.PI * R;
    const rings = segments.map((s, i) => {
      const frac = s.value / total;
      const dash = frac * C;
      const el = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${s.color || U.color(i)}" stroke-width="${opts.width || 17}" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-acc * C).toFixed(2)}" transform="rotate(-90 70 70)"><title>${U.esc(s.label)}: ${s.text || U.num(s.value)}</title></circle>`;
      acc += frac;
      return el;
    }).join('');
    const center = opts.center || '';
    return `<div class="row gap14 wrap"><svg viewBox="0 0 140 140" style="width:${opts.size || 132}px;height:${opts.size || 132}px;flex:0 0 auto">${rings}
      ${center ? `<text x="70" y="67" text-anchor="middle" font-size="15" font-weight="800" fill="#0F172A">${U.esc(center)}</text><text x="70" y="83" text-anchor="middle" font-size="8.5" fill="#78829A">${U.esc(opts.centerSub || '')}</text>` : ''}</svg>
      <div class="col gap6 grow" style="min-width:120px">${segments.map((s, i) => `<div class="row-between tiny"><span class="row gap6"><i style="width:8px;height:8px;border-radius:3px;background:${s.color || U.color(i)};display:inline-block"></i>${U.esc(s.label)}</span><b class="mono">${s.text || U.num(s.value)}</b></div>`).join('')}</div></div>`;
  };
  UI.stackedBar = function (segments) {
    const total = U.sum(segments, s => s.value) || 1;
    return `<div class="bar stacked" style="height:10px">${segments.map((s, i) => `<i style="width:${(s.value / total) * 100}%;background:${s.color || U.color(i)}" title="${U.attr(s.label)}: ${s.text || s.value}"></i>`).join('')}</div>
      <div class="legend mt8">${segments.map((s, i) => `<span><i style="background:${s.color || U.color(i)}"></i>${U.esc(s.label)} <b>${s.text || s.value}</b></span>`).join('')}</div>`;
  };
  UI.heat = function (cells) {
    return `<div class="heat">${cells.map(c => `<i class="l${c}" title="${c} activity"></i>`).join('')}</div>`;
  };

  /* ------------------------- data table helper ------------------------- */
  /* cols: [{key,label,cls,render(row),sortable,width}] */
  UI.table = function (cfg) {
    const id = 'tbl' + Math.random().toString(36).slice(2, 8);
    const st = { q: '', sort: cfg.sortKey || null, dir: cfg.sortDir || 'asc', page: 1, size: cfg.pageSize || 12, ...(cfg.state || {}) };
    const host = U.el(`<div class="card" ${cfg.card === false ? 'style="border:0;box-shadow:none;background:transparent"' : ''}>
      ${cfg.title ? `<div class="card-h"><h3>${U.esc(cfg.title)}</h3><div class="row gap6">${cfg.actions || ''}</div></div>` : ''}
      ${cfg.search === false && cfg.filters === false ? '' : `<div class="toolbar">
        ${cfg.search === false ? '' : `<div class="search-input" style="max-width:260px;flex:1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><input class="input sm" data-q placeholder="${U.attr(cfg.searchPlaceholder || 'Search…')}"></div>`}
        <div class="row gap6 grow wrap" data-filters>${(cfg.filters || []).map(f => `
          <select class="select sm" data-f="${f.key}" style="width:auto;min-width:120px"><option value="">${U.esc(f.label)}: All</option>${f.options.map(o => `<option value="${U.attr(o)}">${U.esc(o)}</option>`).join('')}</select>`).join('')}</div>
        <div class="row gap6" data-actions>${cfg.toolbarActions || ''}</div>
      </div>`}
      <div class="table-wrap"><table class="tbl ${cfg.compact ? 'compact' : ''}"><thead><tr>${cfg.cols.map(c => `<th class="${c.cls || ''} ${c.sortable === false ? '' : 'sortable'}" ${c.sortable === false ? '' : `data-sort="${c.key}" style="cursor:pointer"`}>${U.esc(c.label)}<span data-arrow="${c.key}"></span></th>`).join('')}</tr></thead>
      <tbody data-body></tbody>${cfg.footer !== false ? '<tfoot data-foot></tfoot>' : ''}</table></div>
      <div class="row-between" data-pager style="padding:10px 14px;border-top:1px solid var(--line-2)"></div>
    </div>`);
    let rows = (typeof cfg.rows === 'function' ? cfg.rows() : cfg.rows) || [];

    function filtered() {
      let out = rows.slice();
      const q = st.q.trim().toLowerCase();
      if (q) out = out.filter(r => (cfg.searchText ? cfg.searchText(r) : JSON.stringify(r)).toLowerCase().includes(q));
      Object.keys(st).forEach(k => {
        if (k.startsWith('f_') && st[k]) {
          const key = k.slice(2);
          out = out.filter(r => String(typeof cfg.filterValue === 'function' ? cfg.filterValue(r, key) : r[key]) === st[k]);
        }
      });
      if (st.sort) {
        const col = cfg.cols.find(c => c.key === st.sort);
        const get = col && col.sortValue ? col.sortValue : (r) => r[st.sort];
        out.sort((a, b) => {
          const x = get(a), y = get(b);
          if (x == null) return 1; if (y == null) return -1;
          const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
          return st.dir === 'desc' ? -r : r;
        });
      }
      return out;
    }
    function render() {
      const all = filtered(), pages = Math.max(1, Math.ceil(all.length / st.size));
      st.page = Math.min(st.page, pages);
      const start = (st.page - 1) * st.size;
      const page = cfg.paginate === false ? all : all.slice(start, start + st.size);
      const body = U.$('[data-body]', host);
      body.innerHTML = page.length ? page.map((r, i) => `<tr class="${cfg.rowClick ? 'clickable' : ''}" data-id="${U.attr(r.id || start + i)}">${cfg.cols.map(c => `<td class="${c.cls || ''}">${c.render ? c.render(r) : U.esc(r[c.key])}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${cfg.cols.length}">${UI.empty(cfg.emptyTitle || 'Nothing here yet', cfg.empty || 'Adjust your filters or add a new record.', cfg.emptyAction, cfg.emptyIcon)}</td></tr>`;
      const foot = U.$('[data-foot]', host);
      if (foot) foot.innerHTML = cfg.footer && page.length ? cfg.footer(all, page) : '';
      const pager = U.$('[data-pager]', host);
      if (cfg.paginate === false || all.length === 0) pager.innerHTML = `<span class="tiny muted">${all.length} record${all.length === 1 ? '' : 's'}</span>`;
      else pager.innerHTML = `<span class="tiny muted">Showing <b>${start + 1}–${Math.min(start + st.size, all.length)}</b> of <b>${all.length}</b></span>
        <div class="row gap6"><button class="btn sm" data-pg="prev" ${st.page === 1 ? 'disabled' : ''}>Prev</button><span class="tiny">Page ${st.page} / ${pages}</span><button class="btn sm" data-pg="next" ${st.page === pages ? 'disabled' : ''}>Next</button></div>`;
      U.$$('[data-sort]', host).forEach(th => {
        const a = U.$(`[data-arrow="${th.getAttribute('data-sort')}"]`, th);
        if (a) a.innerHTML = st.sort === th.getAttribute('data-sort') ? (st.dir === 'desc' ? ' ↓' : ' ↑') : '';
      });
      if (cfg.onRender) cfg.onRender(host, all, page);
    }
    host.addEventListener('input', e => { if (e.target.matches('[data-q]')) { st.q = e.target.value; st.page = 1; render(); } });
    host.addEventListener('change', e => {
      if (e.target.matches('[data-f]')) { st['f_' + e.target.getAttribute('data-f')] = e.target.value; st.page = 1; render(); }
    });
    host.addEventListener('click', e => {
      const th = e.target.closest('[data-sort]');
      if (th) { const k = th.getAttribute('data-sort'); if (st.sort === k) st.dir = st.dir === 'asc' ? 'desc' : 'asc'; else { st.sort = k; st.dir = 'asc'; } render(); return; }
      const pg = e.target.closest('[data-pg]');
      if (pg) { st.page += pg.getAttribute('data-pg') === 'next' ? 1 : -1; render(); return; }
      const tr = e.target.closest('tbody tr[data-id]');
      if (tr && cfg.rowClick && !e.target.closest('button,a,input')) {
        const r = all.find(x => String(x.id) === tr.getAttribute('data-id')) || page.find(x => String(x.id) === tr.getAttribute('data-id'));
        if (r) cfg.rowClick(r, host);
      }
    });
    host.setRows = (nr) => { rows = typeof nr === 'function' ? nr() : nr; render(); };
    host.getRows = () => rows;
    host.state = st;
    host.refresh = render;
    render();
    return host;
  };

  /* -------------------------- command palette ------------------------- */
  UI.commands = function () {
    const items = [];
    MK.routes.forEach(r => { if (r.hidden) return; items.push({ label: r.title, group: r.group || 'Go to', icon: r.icon || 'grid', run: () => MK.go(r.path) }); });
    S.db.projects.forEach(p => items.push({ label: p.name, group: 'Project', icon: 'building', hint: p.code, run: () => MK.go('/projects/' + p.id) }));
    S.db.employees.forEach(e => items.push({ label: e.name, group: 'Employee', icon: 'user', hint: e.designation, run: () => MK.go('/hrm/employees/' + e.id) }));
    S.db.vendors.forEach(v => items.push({ label: v.name, group: 'Vendor', icon: 'truck', hint: v.category, run: () => MK.go('/procurement/vendors/' + v.id) }));
    items.push({ label: 'Reset demo data', group: 'Action', icon: 'refresh', run: () => { S.reset(); UI.toast('Demo data regenerated', 'ok'); MK.go(MK.route || '/dashboard'); } });
    items.push({ label: 'Print current page / Save PDF', group: 'Action', icon: 'printer', run: () => window.print() });
    items.push({ label: 'Download user manual', group: 'Action', icon: 'book', run: () => MK.go('/help') });
    const ov = U.el(`<div class="overlay" style="padding:8vh 16px"><div class="modal narrow" style="max-width:560px">
      <div class="modal-h"><div class="row gap10"><span style="color:var(--tx-3)">${icon('search', 17)}</span><input class="input" data-cmd placeholder="Search projects, people, vendors, pages…" style="border:0;box-shadow:none;padding:0;font-size:15px"></div><button class="x-btn" data-x>${icon('x', 15)}</button></div>
      <div class="modal-b" data-res style="padding:8px;max-height:52vh"></div>
      <div class="modal-f left" style="justify-content:space-between"><span class="tiny muted">Type to search · Enter to open · Esc to close</span><span class="tiny muted">⌘K</span></div>
    </div></div>`);
    document.body.appendChild(ov);
    const input = U.$('[data-cmd]', ov), res = U.$('[data-res]', ov);
    let sel = 0, shown = [];
    function draw() {
      const q = input.value.toLowerCase().trim();
      shown = items.filter(i => !q || (i.label + ' ' + (i.hint || '') + ' ' + i.group).toLowerCase().includes(q)).slice(0, 28);
      sel = 0;
      res.innerHTML = shown.length ? shown.map((i, idx) => `<div class="nav-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="color:var(--tx)"><span style="color:var(--tx-3)">${icon(i.icon, 15)}</span><span class="grow trunc">${U.esc(i.label)}</span>${i.hint ? `<span class="tiny muted">${U.esc(i.hint)}</span>` : ''}<span class="tiny muted">${U.esc(i.group)}</span></div>`).join('') : `<div class="tiny muted center" style="padding:20px">No results</div>`;
    }
    function choose(i) { if (!i) return; ov.remove(); i.run(); }
    input.addEventListener('input', draw);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); paint(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); paint(); e.preventDefault(); }
      else if (e.key === 'Enter') { choose(shown[sel]); }
      else if (e.key === 'Escape') ov.remove();
    });
    function paint() { U.$$('[data-idx]', res).forEach(d => d.classList.toggle('active', +d.getAttribute('data-idx') === sel)); const a = U.$('[data-idx="' + sel + '"]', res); if (a) a.scrollIntoView({ block: 'nearest' }); }
    res.addEventListener('click', e => { const d = e.target.closest('[data-idx]'); if (d) choose(shown[+d.getAttribute('data-idx')]); });
    U.$$('[data-x]', ov).forEach(b => b.onclick = () => ov.remove());
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    draw();
    setTimeout(() => input.focus(), 30);
  };

  /* ------------------------------- shell ------------------------------- */
  const NAV = [
    { group: 'Overview', items: [{ path: '/dashboard', title: 'Command Centre', icon: 'home' }, { path: '/my-work', title: 'My Work', icon: 'checksq' }, { path: '/approvals', title: 'Approvals', icon: 'inbox', badge: () => S.db.approvals.filter(a => a.status === 'Pending').length }] },
    { group: 'Delivery', items: [{ path: '/projects', title: 'Projects', icon: 'building', badge: () => S.db.projects.filter(p => ['In Progress', 'Snagging'].includes(p.status)).length, grey: true }, { path: '/schedule', title: 'Schedule & Gantt', icon: 'calendar' }, { path: '/dpr', title: 'Daily Progress', icon: 'camera' }, { path: '/snags', title: 'Snags & Quality', icon: 'alert' }, { path: '/rfis', title: 'RFI & Queries', icon: 'message' }, { path: '/documents', title: 'Drawings & Docs', icon: 'folder' }] },
    { group: 'Commercial', items: [{ path: '/procurement', title: 'Procurement', icon: 'cart' }, { path: '/stores', title: 'Stores & Inventory', icon: 'warehouse' }, { path: '/finance', title: 'Finance & Billing', icon: 'wallet' }, { path: '/costing', title: 'Cost & Margin', icon: 'pie' }] },
    { group: 'Growth', items: [{ path: '/crm', title: 'CRM & Leads', icon: 'target' }, { path: '/quotations', title: 'Quotations', icon: 'file' }] },
    { group: 'People (HRM)', items: [{ path: '/hrm', title: 'HR Dashboard', icon: 'users' }, { path: '/hrm/employees', title: 'Employees', icon: 'user' }, { path: '/hrm/attendance', title: 'Attendance', icon: 'clock' }, { path: '/hrm/leave', title: 'Leave', icon: 'calendar' }, { path: '/hrm/payroll', title: 'Payroll', icon: 'bank' }, { path: '/hrm/recruitment', title: 'Recruitment', icon: 'briefcase' }, { path: '/hrm/performance', title: 'Performance', icon: 'award' }] },
    { group: 'Intelligence', items: [{ path: '/analytics', title: 'Analytics', icon: 'chart' }, { path: '/copilot', title: 'AI Copilot', icon: 'sparkles' }, { path: '/agents', title: 'AI Agents', icon: 'cpu' }] },
    { group: 'Admin', items: [{ path: '/assets', title: 'Assets', icon: 'package' }, { path: '/compliance', title: 'Compliance', icon: 'shield' }, { path: '/masters', title: 'Masters', icon: 'layers' }, { path: '/users', title: 'Users & Roles', icon: 'lock' }, { path: '/integrations', title: 'Integrations', icon: 'plug' }, { path: '/settings', title: 'Settings', icon: 'settings' }, { path: '/subscription', title: 'Plan & Billing', icon: 'card' }, { path: '/help', title: 'Help & Manual', icon: 'book' }] }
  ];
  UI.NAV = NAV;

  function navHtml(path) {
    return `<div class="sb-brand"><img src="assets/img/logo-dark.svg" alt="Managekaro" style="height:32px"></div>
      <div class="sb-org" data-org><div class="av">MS</div><div class="grow" style="min-width:0"><b class="sm trunc" style="display:block;color:#fff">Managekaro Spaces</b><small>Enterprise · 4 units</small></div>${icon('chevronDown', 13)}</div>
      <div class="sb-scroll">${NAV.map(g => `<div class="sb-group"><label>${g.group}</label>${g.items.map(it => {
        const b = it.badge ? it.badge() : null;
        return `<a class="nav-item ${path === it.path || (it.path !== '/dashboard' && path.startsWith(it.path + '/')) ? 'active' : ''}" href="#${it.path}">${icon(it.icon, 16)}<span class="grow trunc">${it.title}</span>${b ? `<span class="pill ${it.grey ? 'grey' : ''}">${b}</span>` : ''}</a>`;
      }).join('')}</div>`).join('')}
      <div class="sb-group" style="padding:6px 2px 18px"><a class="nav-item" href="#/download" style="background:rgba(242,84,11,.14);color:#FFB68C">${icon('download', 16)}<span class="grow">Download App</span></a>
      <a class="nav-item" href="#/help">${icon('book', 16)}<span class="grow">User Manual</span></a></div>
      </div>
      <div class="sb-foot"><div class="av">${U.initials(S.me().name)}</div><div class="grow" style="min-width:0"><b class="sm" style="color:#fff;display:block">${U.esc(S.me().name)}</b><span class="tiny" style="color:#7C86A0">${U.esc(S.roleName())}</span></div><button class="icon-btn" style="background:transparent;border-color:rgba(255,255,255,.12);color:#B9C2D6;width:30px;height:30px" data-logout title="Switch user">${icon('logout', 14)}</button></div>`;
  }

  UI.shell = function () {
    const root = document.getElementById('app');
    root.innerHTML = `<div class="app">
      <aside class="sidebar" id="sidebar"></aside>
      <div class="main" id="main">
        <header class="topbar no-print">
          <button class="burger" id="burger">${icon('list', 17)}</button>
          <div class="crumb" id="crumb"></div>
          <button class="searchbox" id="searchbtn">${icon('search', 15)}<span class="ph">Search anything…</span><kbd>⌘K</kbd></button>
          <a class="icon-btn" href="#/download" title="Download desktop app">${icon('download', 16)}</a>
          <button class="icon-btn" id="bellbtn" title="Notifications">${icon('bell', 16)}${S.db.notifications.some(n => !n.read) ? '<span class="dot"></span>' : ''}</button>
          <button class="icon-btn" id="userbtn" title="Account">${UI.av(S.me().name)}</button>
        </header>
        <main class="content" id="view"></main>
      </div></div><div id="toasts"></div>`;
    document.getElementById('burger').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('searchbtn').onclick = UI.commands;
    document.getElementById('bellbtn').onclick = UI.notifPanel;
    document.getElementById('userbtn').onclick = UI.userPanel;
    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); UI.commands(); } });
  };

  UI.renderNav = function (path) {
    const sb = document.getElementById('sidebar');
    if (sb) { sb.innerHTML = navHtml(path); U.$$('.nav-item', sb).forEach(a => a.addEventListener('click', () => sb.classList.remove('open'))); }
    const crumb = document.getElementById('crumb');
    if (crumb) {
      const r = MK.matchRoute(path);
      const bits = (r && r.crumb) ? r.crumb(path) : [{ label: (r || {}).title || 'Dashboard' }];
      crumb.innerHTML = `<span>Managekaro</span>${bits.map(b => `${icon('chevronRight', 11)}${b.href ? `<a href="#${b.href}">${U.esc(b.label)}</a>` : `<b>${U.esc(b.label)}</b>`}`).join('')}`;
    }
  };

  UI.notifPanel = function () {
    const n = S.db.notifications;
    UI.drawer({
      title: 'Notifications', sub: `${n.filter(x => !x.read).length} unread`, size: '',
      body: `<div class="col gap10">${n.map(x => `<div class="row gap10" style="align-items:flex-start;padding:9px;border:1px solid ${x.read ? 'var(--line-2)' : '#FFE0CE'};background:${x.read ? '#fff' : 'var(--brand-50)'};border-radius:10px">
        <span class="av c${(x.title.length % 6) + 1}">${icon('bell', 13)}</span>
        <div class="grow"><div class="row-between"><b class="sm">${U.esc(x.title)}</b><span class="tiny muted">${U.ago(x.at)}</span></div>
        <div class="tiny" style="color:var(--tx-2);margin-top:2px">${U.esc(x.body)}</div>
        <div class="row gap6 mt4"><span class="tag">${x.channel}</span><a class="tiny" href="#${x.link}" style="color:var(--brand);font-weight:700">Open →</a></div></div></div>`).join('')}</div>`,
      footer: `<button class="btn" data-mark>Mark all read</button><button class="btn primary" data-x>Done</button>`,
      onMount: (ov, close) => {
        U.$('[data-mark]', ov).onclick = () => { S.db.notifications.forEach(x => x.read = true); S.save(); UI.toast('All notifications marked read', 'ok'); close(); MK.render(); };
      }
    });
  };

  UI.userPanel = function () {
    const users = S.db.users.slice(0, 12);
    UI.modal({
      title: 'Switch user / role', sub: 'Demo mode — switch persona to see role-based access', okText: 'Apply',
      body: `<div class="col gap8">${users.map(u => `<label class="row gap10" style="padding:8px;border:1px solid ${u.id === S.prefs.user ? 'var(--brand)' : 'var(--line)'};border-radius:10px;cursor:pointer;background:${u.id === S.prefs.user ? 'var(--brand-50)' : '#fff'}">
        ${UI.av(u.name)}<div class="grow"><b class="sm">${U.esc(u.name)}</b><div class="tiny muted">${U.esc(u.designation)} · ${U.esc((S.db.roles.find(r => r.id === u.roleId) || {}).name)}</div></div>
        <input type="radio" name="userpick" value="${u.id}" ${u.id === S.prefs.user ? 'checked' : ''} style="accent-color:var(--brand)"></label>`).join('')}</div>
        <div class="note mt12">Role-based menus, approvals and data scopes change with the selected persona. Client and vendor personas see restricted portals.</div>`,
      onOk: (ov) => {
        const picked = U.$('input[name=userpick]:checked', ov);
        if (picked) { S.setUser(picked.value); UI.toast('Switched to ' + S.me().name, 'ok'); MK.render(); }
      }
    });
  };

  /* --------------------------- router glue ----------------------------- */
  MK.routes = MK.routes || [];
  MK.route = function (path, def) { MK.routes.push(Object.assign({ path }, def)); };
  MK.matchRoute = function (path) {
    for (const r of MK.routes) {
      if (r.path === path) return r;
      if (r.path.includes(':')) {
        const rp = r.path.split('/'), pp = path.split('/');
        if (rp.length === pp.length) {
          const params = {};
          let ok = true;
          rp.forEach((seg, i) => { if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(pp[i]); else if (seg !== pp[i]) ok = false; });
          if (ok) return Object.assign({}, r, { params });
        }
      }
    }
    // prefix match for module roots
    const sorted = MK.routes.slice().sort((a, b) => b.path.length - a.path.length);
    return sorted.find(r => !r.path.includes(':') && path.startsWith(r.path + '/')) || null;
  };
  MK.go = function (path) { if (('#' + path) === location.hash) MK.render(); else location.hash = path; };

  MK.render = function () {
    const path = (location.hash || '#/').slice(1);
    if (MK.site && MK.site.isSitePath(path)) {
      document.body.classList.add('mk-site');
      MK.site.mount(path);
      document.title = (path === '/' || path === '' ? 'Managekaro — Interior Fit-out & Construction ERP + HRM' : MK.site.titleFor ? MK.site.titleFor(path) : 'Managekaro');
      return;
    }
    document.body.classList.remove('mk-site');
    // Coming back from the marketing site: the shell was replaced, so rebuild it.
    if (!document.getElementById('view') || !document.querySelector('.app')) UI.shell();
    UI.renderNav(path);
    const view = document.getElementById('view');
    const r = MK.matchRoute(path);
    document.title = ((r && r.title) || 'Managekaro') + ' · Managekaro ERP';
    if (!r) {
      view.innerHTML = UI.pageHead('Page not found', 'This route does not exist yet.') + UI.empty('404 — Not found', 'The page you are looking for has moved or is part of a module that will be released soon.', `<a class="btn primary" href="#/dashboard">Back to Command Centre</a>`, 'alert');
      return;
    }
    try {
      view.innerHTML = r.render(path, r.params || {}) || '';
      if (r.mount) r.mount(view, r.params || {});
      U.wireTabs(view, (id) => { if (r.onTab) r.onTab(id); });
      view.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', () => MK.go(a.getAttribute('data-go'))));
      if (MK.afterRender) MK.afterRender(view, path, r);
    } catch (err) {
      console.error(err);
      view.innerHTML = UI.pageHead('Something went wrong', 'This module hit an error while rendering.') + `<div class="card"><div class="card-b"><div class="alert">${U.esc(err.message)}</div><pre class="tiny mono" style="margin-top:10px;white-space:pre-wrap;color:var(--tx-3)">${U.esc((err.stack || '').split('\n').slice(0, 6).join('\n'))}</pre></div></div>`;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  MK.UI = UI;
})(window.MK);
