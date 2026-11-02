/* Managekaro — state store, persistence, session, change bus */
(function (MK) {
  'use strict';
  const U = MK.U;
  const KEY = 'managekaro.db.v14';
  const PREF = 'managekaro.prefs.v1';
  const S = {};

  const listeners = {};
  S.on = function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return () => { listeners[evt] = listeners[evt].filter(f => f !== fn); }; };
  S.emit = function (evt, data) { (listeners[evt] || []).forEach(f => { try { f(data); } catch (e) { console.warn('listener', evt, e); } }); (listeners['*'] || []).forEach(f => { try { f({ evt, data }); } catch (e) { } }); };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.meta && d.meta.version === 14) return d;
      }
    } catch (e) { console.warn('load failed', e); }
    const fresh = MK.Seed.build();
    persist(fresh);
    return fresh;
  }
  let persistTimer = null;
  function persist(d) {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(d)); }
      catch (e) { console.warn('persist skipped (quota)', e); }
    }, 250);
  }

  S.init = function () {
    S.db = load();
    S.prefs = Object.assign({
      theme: 'light', sidebarCollapsed: false, density: 'comfortable', currency: 'compacted',
      user: 'USR-0001', role: 'owner', tenant: 'MK Spaces', notifications: true
    }, (function () { try { return JSON.parse(localStorage.getItem(PREF)) || {}; } catch (e) { return {}; } })());
    S.savePrefs();
    return S.db;
  };
  S.savePrefs = function () { try { localStorage.setItem(PREF, JSON.stringify(S.prefs)); } catch (e) { } };
  S.setPref = function (k, v) { S.prefs[k] = v; S.savePrefs(); S.emit('prefs', S.prefs); };

  S.save = function () { persist(S.db); };
  S.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { }
    S.db = MK.Seed.build();
    S.save();
    S.emit('reset', S.db);
  };
  S.clearAll = function () {
    try { localStorage.clear(); } catch (e) { }
    S.db = MK.Seed.build();
    S.emit('reset', S.db);
  };

  /* ------------------------------- CRUD -------------------------------- */
  S.coll = (name) => (S.db[name] = S.db[name] || []);
  S.list = function (name, filter, sort) {
    let rows = (S.db[name] || []).slice();
    if (typeof filter === 'function') rows = rows.filter(filter);
    else if (filter && typeof filter === 'object') rows = rows.filter(o => Object.keys(filter).every(k => o[k] === filter[k]));
    if (typeof sort === 'function') rows.sort(sort);
    return rows;
  };
  S.one = function (name, pred) {
    if (typeof pred !== 'function') { const id = pred; return (S.db[name] || []).find(o => o.id === id); }
    return (S.db[name] || []).find(pred);
  };
  S.byId = function (name, id) { return (S.db[name] || []).find(o => o.id === id); };
  S.add = function (name, obj) {
    const list = S.coll(name);
    obj.id = obj.id || U.uid(name.slice(0, 3).toUpperCase());
    obj.createdAt = obj.createdAt || new Date().toISOString();
    list.unshift(obj);
    S.save(); S.emit('change', { name, type: 'add', obj });
    return obj;
  };
  S.update = function (name, id, patch) {
    const o = S.byId(name, id);
    if (!o) return null;
    Object.assign(o, patch, { updatedAt: new Date().toISOString() });
    S.save(); S.emit('change', { name, type: 'update', obj: o });
    return o;
  };
  S.remove = function (name, id) {
    const list = S.coll(name);
    const i = list.findIndex(o => o.id === id);
    if (i > -1) { const [o] = list.splice(i, 1); S.save(); S.emit('change', { name, type: 'remove', obj: o }); return o; }
    return null;
  };
  S.log = function (module, action, detail) {
    S.db.activityLog.unshift({
      id: U.uid('LOG'), module, action, detail: detail || '', role: S.roleName(), user: S.me().name,
      at: new Date().toISOString(), projectId: S.prefs.projectId || ''
    });
    S.db.activityLog = S.db.activityLog.slice(0, 260);
    S.save();
  };

  /* ------------------------------ session ------------------------------ */
  S.me = function () {
    const u = S.byId('users', S.prefs.user);
    if (u) return u;
    S.prefs.user = 'USR-0001';
    return S.byId('users', 'USR-0001');
  };
  S.setUser = function (id) { const u = S.byId('users', id); if (u) { S.prefs.user = id; S.prefs.role = u.roleId; S.savePrefs(); S.emit('session', u); } };
  S.role = function () { return S.prefs.role; };
  S.roleName = function () { const r = S.db.roles.find(r => r.id === S.prefs.role); return r ? r.name : 'Member'; };
  S.can = function (perm) {
    const role = S.db.roles.find(r => r.id === S.prefs.role) || { perms: [] };
    if (role.perms.includes('*')) return true;
    if (role.perms.includes(perm)) return true;
    const mod = perm.split(':')[0];
    return role.perms.some(p => p === mod + ':*' || p === mod + ':read' && /:read$/.test(perm) || p === '*:read' && /:read$/.test(perm));
  };
  S.isAdminLike = () => ['owner', 'admin'].includes(S.prefs.role);

  /* --------------------------- derived helpers ------------------------- */
  S.project = (id) => S.byId('projects', id);
  S.projects = () => S.db.projects;
  S.emp = (id) => S.byId('employees', id);
  S.user = (id) => S.byId('users', id);
  S.vendor = (id) => S.byId('vendors', id);
  S.client = (id) => S.byId('clients', id);
  S.item = (id) => S.byId('items', id);
  S.dept = (id) => S.byId('departments', id);
  S.empName = (id) => (S.byId('employees', id) || {}).name || '—';
  S.projName = (id) => (S.byId('projects', id) || {}).name || '—';
  S.empByUser = (uid) => S.byId('employees', uid) || S.db.employees.find(e => e.userId === uid);

  /* portfolio metrics */
  S.metrics = function () {
    const P = S.db.projects.filter(p => p.status !== 'Closed');
    const live = P.filter(p => ['In Progress', 'Snagging'].includes(p.status));
    const cv = U.sum(S.db.projects, p => p.contractValue);
    const liveValue = U.sum(live, p => p.contractValue);
    const billed = U.sum(S.db.projects, p => p.billed);
    const received = U.sum(S.db.projects, p => p.received);
    const cost = U.sum(S.db.projects, p => p.spent);
    const budget = U.sum(S.db.projects, p => p.budget);
    const receivable = U.sum(S.db.clientInvoices.filter(i => i.status !== 'Paid'), i => i.total - i.received);
    const overdueRec = U.sum(S.db.clientInvoices.filter(i => i.status === 'Overdue'), i => i.total - i.received);
    const payable = U.sum(S.db.invoices.filter(i => i.status !== 'Paid'), i => i.net - i.paid);
    const openSnags = S.db.snags.filter(s => s.status !== 'Closed').length;
    const criticalSnags = S.db.snags.filter(s => s.status !== 'Closed' && s.priority === 'Critical').length;
    const pendingApprovals = S.db.approvals.filter(a => a.status === 'Pending').length;
    const weighting = U.sum(live, p => p.progress * p.contractValue) / (liveValue || 1);
    return {
      totalProjects: S.db.projects.length, live: live.length, planning: S.db.projects.filter(p => p.status === 'Planning').length,
      completed: S.db.projects.filter(p => p.status === 'Completed').length, hold: S.db.projects.filter(p => p.status === 'On Hold').length,
      cv, liveValue, billed, received, cost, budget, receivable, overdueRec, payable,
      grossMargin: cv ? U.round(((cv - budget) / cv) * 100, 1) : 0,
      actualMargin: received ? U.round(((received - cost) / received) * 100, 1) : 0,
      progress: U.round(weighting, 1), openSnags, criticalSnags, pendingApprovals,
      collectionPct: billed ? U.round((received / billed) * 100, 1) : 0,
      burnPct: budget ? U.round((cost / budget) * 100, 1) : 0,
      atRisk: S.db.projects.filter(p => ['At Risk', 'Critical'].includes(p.health)).length,
      headcount: S.db.employees.filter(e => e.status !== 'Resigned').length,
      onNotice: S.db.employees.filter(e => e.status === 'Notice Period').length,
      openLeaves: S.db.leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length,
      pipeline: U.sum(S.db.leads.filter(l => l.stage !== 'Won'), l => l.value * (l.probability / 100)),
      wonValue: U.sum(S.db.leads.filter(l => l.stage === 'Won'), l => l.value),
      payrollCost: U.sum(S.db.payroll.filter(p => p.month === U.lastMonths(1)[0].key), p => p.net),
      avgDaysToClose: 42,
      ncr: S.db.safety.filter(s => s.status !== 'Closed').length,
      docs: S.db.docs.length, dprs: S.db.dprs.length
    };
  };

  S.projectStats = function (pid) {
    const p = S.project(pid) || {};
    const boq = S.db.boq.filter(b => b.projectId === pid);
    const acts = S.db.activities.filter(a => a.projectId === pid);
    const snags = S.db.snags.filter(s => s.projectId === pid);
    const pos = S.db.pos.filter(o => o.projectId === pid);
    const cis = S.db.clientInvoices.filter(c => c.projectId === pid);
    const vis = S.db.invoices.filter(i => i.projectId === pid);
    const cos = S.db.changeOrders.filter(c => c.projectId === pid);
    const tasks = S.db.tasks.filter(t => t.projectId === pid);
    const cost = S.db.costEntries.filter(c => c.projectId === pid);
    const late = acts.filter(a => a.late);
    return {
      p, boq, acts, snags, pos, cis, vis, cos, tasks, cost,
      boqValue: U.sum(boq, b => b.amount), boqExecuted: U.sum(boq, b => b.executedQty * b.rate),
      committed: U.sum(pos.filter(o => o.status !== 'Cancelled'), o => o.total),
      invoiced: U.sum(vis, i => i.total), paidVendors: U.sum(vis, i => i.paid),
      billed: U.sum(cis, c => c.total), received: U.sum(cis, c => c.received),
      openSnags: snags.filter(s => s.status !== 'Closed').length,
      criticalSnags: snags.filter(s => s.priority === 'Critical' && s.status !== 'Closed').length,
      openTasks: tasks.filter(t => t.status !== 'Done').length,
      overdueTasks: tasks.filter(t => t.status !== 'Done' && U.diff(t.due, U.today()) < 0).length,
      coValue: U.sum(cos.filter(c => c.status === 'Approved'), c => c.amount),
      lateActs: late, schedule: acts.length ? U.round(U.sum(acts, a => a.progress * a.weight) / (U.sum(acts, a => a.weight) || 1), 1) : 0,
      budgetActual: U.sum(cost, c => c.actual), budgetCommitted: U.sum(cost, c => c.committed), budgetTotal: U.sum(cost, c => c.budget)
    };
  };

  S.const = (MK.Seed && MK.Seed.const) || {};
  MK.store = S;
})(window.MK);
