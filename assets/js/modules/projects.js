/* Managekaro — Projects, BOQ, change orders, client portal */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  const HEALTH_CLS = (h) => h === 'On Track' ? 'ok' : h === 'At Risk' ? 'warn' : h === 'Critical' ? 'bad' : 'teal';

  /* ============================= PROJECT LIST ============================ */
  MK.route('/projects', {
    title: 'Projects', crumb: () => [{ label: 'Projects' }],
    render() {
      const P = S.db.projects;
      const m = S.metrics();
      const live = P.filter(p => ['In Progress', 'Snagging'].includes(p.status));
      return UI.pageHead('Projects', `${P.length} projects · ${m.live} live · ${U.cur(m.liveValue)} under execution`,
        `<button class="btn" data-export>${icon('download', 14)} Export</button>
         <button class="btn" data-portfolio>${icon('chart', 14)} Portfolio view</button>
         <button class="btn primary" data-new>${icon('plus', 14)} New project</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Live projects', value: live.length, icon: 'building', foot: `${P.filter(p => p.status === 'Planning').length} in planning` })}
          ${UI.kpi({ label: 'Contract value', value: U.cur(m.cv), icon: 'wallet', foot: `Live ${U.cur(m.liveValue)}` })}
          ${UI.kpi({ label: 'Weighted progress', value: m.progress + '%', icon: 'activity', foot: `${m.completed} completed · ${m.hold} on hold` })}
          ${UI.kpi({ label: 'At risk', value: m.atRisk, icon: 'alert', foot: `${m.criticalSnags} critical snags open` })}
        </div>
        <div class="grid g5 mb16">${['Corporate Fitout', 'Retail Fitout', 'F&B Fitout', 'Healthcare Fitout', 'Residential Construction'].map((t, i) => {
          const rows = P.filter(p => p.type === t);
          return `<div class="kpi"><div class="lab">${t}</div><div class="val">${rows.length}<small> projects</small></div><div class="foot">${U.cur(U.sum(rows, r => r.contractValue))} value</div></div>`;
        }).join('')}</div>
        <div data-tbl></div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.projects, pageSize: 12, sortKey: 'contractValue', sortDir: 'desc',
          searchPlaceholder: 'Search project, code, client…',
          searchText: r => [r.name, r.code, r.client, r.city, r.pm, r.type].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['In Progress', 'Planning', 'Snagging', 'On Hold', 'Completed'] }, { key: 'type', label: 'Type', options: S.const.PROJECT_TYPES }, { key: 'health', label: 'Health', options: ['On Track', 'At Risk', 'Critical', 'Closed'] }],
          rowClick: (r) => MK.go('/projects/' + r.id),
          cols: [
            { key: 'name', label: 'Project', render: r => `<div class="cell-strong trunc" style="max-width:250px">${U.esc(r.name)}</div><span class="sub mono">${r.code} · ${r.type} · ${r.city}</span>` },
            { key: 'client', label: 'Client', render: r => `<div class="trunc" style="max-width:150px">${U.esc(r.client)}</div><span class="sub">${U.esc(r.clientContact)}</span>` },
            { key: 'pm', label: 'Project manager', render: r => `<div class="row gap6">${UI.av(r.pm)}<span class="trunc tiny">${U.esc(r.pm)}</span></div>` },
            { key: 'progress', label: 'Progress', render: r => `<div style="min-width:96px"><div class="row-between tiny"><b>${r.progress}%</b><span class="muted">${r.clientApproved}% appr.</span></div>${UI.bar(r.progress, r.health === 'Critical' ? 'red' : r.progress > 70 ? 'green' : '')}</div>` },
            { key: 'contractValue', label: 'Contract', cls: 'num', render: r => `<b>${U.cur(r.contractValue)}</b><span class="sub">${r.area.toLocaleString('en-IN')} sqft</span>` },
            { key: 'received', label: 'Collected', cls: 'num', render: r => `${U.cur(r.received)}<span class="sub">${U.pct(r.received, r.billed)}% of billed</span>` },
            { key: 'margin', label: 'Margin', cls: 'num', render: r => `<b style="color:${r.margin < 15 ? 'var(--bad)' : 'var(--ok)'}">${r.margin}%</b>` },
            { key: 'health', label: 'Health', render: r => UI.pill(r.health) },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'end', label: 'Handover', render: r => `<span class="tiny">${U.fmtD(r.end)}</span><span class="sub">${r.status === 'Completed' ? 'Closed' : U.inDays(U.diff(r.end, U.today()))}</span>` }
          ],
          footer: (all) => `<tr><td colspan="4">Portfolio total · ${all.length} projects</td><td class="num">${U.cur(U.sum(all, r => r.contractValue))}</td><td class="num">${U.cur(U.sum(all, r => r.received))}</td><td class="num">${U.round(U.avg(all, r => r.margin), 1)}%</td><td colspan="3"></td></tr>`
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-export]', view).onclick = () => { U.csv('managekaro-projects', S.db.projects.map(p => ({ Code: p.code, Project: p.name, Client: p.client, PM: p.pm, Type: p.type, Status: p.status, Health: p.health, Progress: p.progress, Contract: p.contractValue, Billed: p.billed, Received: p.received, Margin: p.margin, Start: p.start, End: p.end }))); UI.toast('Projects exported', 'ok'); };
      $('[data-new]', view).onclick = () => window.MK.newProject(draw);
      $('[data-portfolio]', view).onclick = () => window.MK.portfolioView();
    }
  });

  MK.newProject = function (after) {
    const clients = S.db.clients, emps = S.db.employees.filter(e => /Manager|Director|Head/.test(e.designation));
    UI.modal({
      title: 'Create project', sub: 'A project is created from a client, contract value and BOQ template', size: 'wide', okText: 'Create project',
      body: `<div class="grid g2 gap10">
        <div class="field span2"><label>Project name *</label><input class="input" data-n placeholder="e.g. Amazon Development Centre — BLR9 Fitout"></div>
        <div class="field"><label>Client</label><select class="input" data-c>${clients.map(c => `<option value="${c.id}">${U.esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Project type</label><select class="input" data-t>${S.const.PROJECT_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label>City</label><select class="input" data-city>${['Gurugram', 'Delhi', 'Noida', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Goa'].map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Business unit</label><select class="input" data-u>${S.db.units.filter(u => u.active).map(u => `<option value="${u.id}">${U.esc(u.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Contract value (₹)</label><input class="input" data-v type="number" placeholder="6500000"></div>
        <div class="field"><label>Area (sqft)</label><input class="input" data-a type="number" placeholder="18000"></div>
        <div class="field"><label>Start date</label><input class="input" type="date" data-s value="${U.iso(U.today())}"></div>
        <div class="field"><label>Target handover</label><input class="input" type="date" data-e value="${U.iso(U.addD(U.today(), 150))}"></div>
        <div class="field"><label>Project manager</label><select class="input" data-pm>${emps.map(e => `<option value="${e.id}">${U.esc(e.name)} — ${U.esc(e.designation)}</option>`).join('')}</select></div>
        <div class="field"><label>Budget as % of contract</label><input class="input" data-b type="number" value="82"></div>
        <div class="field span2"><label>Scope summary</label><textarea class="input" data-d placeholder="Civil, MEP, finishes, furniture, handover…"></textarea></div>
      </div>
      <div class="note info mt12">${icon('sparkles', 12)} Managekaro will create the project shell, BOQ template lines, activity schedule skeleton, milestone set and client portal access.</div>`,
      onOk(ov) {
        const name = $('[data-n]', ov).value.trim();
        if (!name) { UI.toast('Project name is required', 'bad'); return false; }
        const cv = U.n($('[data-v]', ov).value) || 5000000;
        const budgetPct = U.n($('[data-b]', ov).value) || 82;
        const pm = S.emp($('[data-pm]', ov).value);
        const cli = S.client($('[data-c]', ov).value);
        const p = S.add('projects', {
          code: 'MK-' + (1024 + S.db.projects.length), name, type: $('[data-t]', ov).value, city: $('[data-city]', ov).value,
          state: 'Haryana', clientId: cli.id, client: cli.name, clientContact: cli.contact, pmId: pm.id, pm: pm.name,
          status: 'Planning', health: 'On Track', start: $('[data-s]', ov).value, end: $('[data-e]', ov).value, baselineEnd: $('[data-e]', ov).value,
          progress: 0, contractValue: cv, budget: Math.round(cv * budgetPct / 100), spent: 0, billed: 0, received: 0,
          area: U.n($('[data-a]', ov).value) || Math.round(cv / 3200), floors: 1, unitId: $('[data-u]', ov).value,
          qs: pm.id, siteEng: pm.id, margin: U.round(100 - budgetPct, 1), retentionPct: 5, retainer: 0, tags: [],
          description: $('[data-d]', ov).value || 'New fit-out project.', createdAt: U.iso(U.today()), clientApproved: 0,
          lastReport: U.iso(U.today()), statusNote: ''
        });
        // seed BOQ template (10 lines with zero executed)
        const tpl = S.db.items.filter(i => i.type === 'Material').slice(0, 10);
        tpl.forEach((it, i) => {
          const qty = Math.max(10, Math.round((cv / tpl.length) / it.rate));
          S.add('boq', { projectId: p.id, code: 'B-' + String(i + 1).padStart(2, '0') + '-' + it.trade.slice(0, 3).toUpperCase(), trade: it.trade, description: it.name, itemId: it.id, unit: it.unit, qty, rate: it.rate, amount: qty * it.rate, executedQty: 0, certifiedQty: 0, orderedQty: 0, progress: 0, clientConfirmed: false, status: 'Active', budgetRate: Math.round(it.rate * 0.86), variance: 0, wbs: it.trade.slice(0, 3).toUpperCase() + '-0' + (i + 1), notes: '' });
        });
        S.log('project', 'created project', p.name + ' · ' + U.cur(cv));
        UI.toast('Project created with BOQ template', 'ok');
        if (after) after();
        MK.go('/projects/' + p.id);
      }
    });
  };

  MK.portfolioView = function () {
    const P = S.db.projects.filter(p => p.status !== 'Completed');
    UI.modal({
      title: 'Portfolio view', sub: 'Live projects by value, progress and cash position', size: 'xl',
      body: `<div class="grid g3 mb16">
        ${UI.kpi({ label: 'Portfolio value', value: U.cur(U.sum(P, p => p.contractValue)), icon: 'wallet' })}
        ${UI.kpi({ label: 'Weighted progress', value: U.round(U.sum(P, p => p.progress * p.contractValue) / U.sum(P, p => p.contractValue), 1) + '%', icon: 'activity' })}
        ${UI.kpi({ label: 'Cash gap', value: U.cur(U.sum(P, p => p.billed - p.received)), icon: 'scale' })}
      </div>
      ${UI.barChart(P.slice(0, 12).map(p => ({ label: p.code + ' ' + p.name.split('—')[0], value: p.contractValue, text: U.cur(p.contractValue) + ' · ' + p.progress + '%' })))}
      <hr class="hr"><div class="grid g2">${UI.donut(P.map((p, i) => ({ label: p.code, value: p.contractValue, color: U.color(i) })).slice(0, 6), { center: P.length + '', centerSub: 'live' })}</div>`,
      footer: '<button class="btn" data-x>Close</button><button class="btn primary" onclick="window.print()">Print</button>'
    });
  };

  /* =========================== PROJECT DETAIL =========================== */
  MK.route('/projects/:id', {
    title: 'Project', crumb: (path) => { const id = path.split('/')[2]; const p = S.project(id); return [{ label: 'Projects', href: '/projects' }, { label: p ? p.code : id }]; },
    render(path, params) {
      const id = params.id, p = S.project(id);
      if (!p) return UI.pageHead('Project not found', '') + UI.empty('No such project', 'It may have been deleted.', '<a class="btn" href="#/projects">Back to projects</a>');
      const st = S.projectStats(id);
      const tabs = [
        { id: 'overview', label: 'Overview' }, { id: 'boq', label: 'BOQ & scope', count: st.boq.length },
        { id: 'schedule', label: 'Schedule', count: st.acts.length }, { id: 'procurement', label: 'Procurement', count: st.pos.length },
        { id: 'finance', label: 'Commercials' }, { id: 'quality', label: 'Snags & quality', count: st.snags.length },
        { id: 'docs', label: 'Drawings', count: S.db.docs.filter(d => d.projectId === id).length }, { id: 'team', label: 'Team' },
        { id: 'activity', label: 'Activity' }
      ];
      const active = (MK._ptab && MK._ptab[id]) || 'overview';
      return `<div class="row-between mb16 wrap gap10"><div>
          <div class="row gap6 tiny muted"><a href="#/projects">Projects</a>${icon('chevronRight', 10)}<span>${p.code}</span></div>
          <h1 style="margin-top:6px">${U.esc(p.name)}</h1>
          <div class="row gap6 wrap mt8">${UI.pill(p.status)}${UI.pill(p.health)}<span class="tag">${p.type}</span><span class="tag">${icon('map', 11)} ${p.city}</span><span class="tag">${p.area.toLocaleString('en-IN')} sqft</span>${p.pmc ? `<span class="tag">PMC: ${U.esc(p.pmc)}</span>` : ''}</div>
        </div>
        <div class="row gap6 wrap no-print">
          <button class="btn" data-dpr>${icon('camera', 14)} Add DPR</button>
          <button class="btn" data-report>${icon('printer', 14)} Client report</button>
          <button class="btn primary" data-edit>${icon('edit', 14)} Edit</button>
        </div></div>

        <div class="grid g5 mb16">
          ${UI.kpi({ label: 'Contract value', value: U.cur(p.contractValue), icon: 'wallet', foot: `${U.cur(p.area ? p.contractValue / p.area : 0)} / sqft` })}
          ${UI.kpi({ label: 'Progress', value: p.progress + '%', icon: 'activity', foot: `Client approved ${p.clientApproved}%` })}
          ${UI.kpi({ label: 'Billed / collected', value: U.cur(st.billed), icon: 'receipt', foot: `Received ${U.cur(st.received)}` })}
          ${UI.kpi({ label: 'Committed cost', value: U.cur(st.committed), icon: 'cart', foot: `Budget ${U.cur(st.budgetTotal || p.budget)}` })}
          ${UI.kpi({ label: 'Open snags', value: st.openSnags, icon: 'alert', foot: `${st.criticalSnags} critical · ${st.lateActs.length} late activities` })}
        </div>
        ${UI.tabs('proj', tabs, active)}
        <div data-tabhost class="mt16"></div>`;
    },
    mount(view, params) {
      const id = params.id;
      const host = $('[data-tabhost]', view);
      const setTab = (t) => { MK._ptab = MK._ptab || {}; MK._ptab[id] = t; draw(t); };
      function draw(tab) {
        host.innerHTML = '';
        const p = S.project(id), st = S.projectStats(id);
        if (tab === 'overview') {
          const boqTop = st.boq.slice().sort((a, b) => b.amount - a.amount).slice(0, 6);
          const costSeg = ['Material', 'Subcontract', 'Labour', 'Site Overheads', 'Equipment', 'Consultancy'].map((h, i) => {
            const row = st.cost.find(c => c.head === h) || { actual: 0 };
            return { label: h, value: row.actual, color: U.color(i) };
          });
          host.innerHTML = `<div class="grid g23 mb14">
            <div class="card"><div class="card-h"><h3>Execution snapshot</h3><span class="tiny muted">Updated ${U.ago(p.lastReport)}</span></div>
              <div class="card-b">
                <div class="grid g3 mb16">
                  <div><div class="tiny muted">Schedule progress (weighted)</div><div class="row gap10 mt8">${UI.ring(st.schedule, st.schedule + '%')}<div><b class="sm">${st.acts.filter(a => a.status === 'Completed').length} of ${st.acts.length}</b><div class="tiny muted">activities done</div></div></div></div>
                  <div><div class="tiny muted">BOQ executed value</div><div class="row gap10 mt8">${UI.ring(U.pct(st.boqExecuted, st.boqValue), Math.round(U.pct(st.boqExecuted, st.boqValue)) + '%')}<div><b class="sm">${U.cur(st.boqExecuted)}</b><div class="tiny muted">of ${U.cur(st.boqValue)}</div></div></div></div>
                  <div><div class="tiny muted">Collection</div><div class="row gap10 mt8">${UI.ring(U.pct(st.received, st.billed), U.pct(st.received, st.billed) + '%')}<div><b class="sm">${U.cur(st.received)}</b><div class="tiny muted">of ${U.cur(st.billed)} billed</div></div></div></div>
                </div>
                <div class="row-between tiny muted mb8"><span>Top BOQ lines by value</span><a href="#" data-tablink="boq" style="color:var(--brand);font-weight:700">Full BOQ →</a></div>
                ${boqTop.map(b => `<div class="mb12"><div class="row-between tiny"><span class="trunc" style="max-width:70%">${U.esc(b.description)}</span><span class="mono">${U.cur(b.amount)} · <b>${b.progress}%</b></span></div>${UI.bar(b.progress, b.progress > 75 ? 'green' : b.progress < 30 ? 'red' : '')}</div>`).join('')}
              </div></div>
            <div class="col gap14">
              <div class="card"><div class="card-h"><h3>Project facts</h3></div><div class="card-b">
                <dl class="kv">
                  <dt>Client</dt><dd>${U.esc(p.client)}</dd>
                  <dt>Client contact</dt><dd>${U.esc(p.clientContact)}</dd>
                  <dt>Project manager</dt><dd>${U.esc(p.pm)}</dd>
                  <dt>Site engineer</dt><dd>${U.esc(S.empName(p.siteEng))}</dd>
                  <dt>Start</dt><dd>${U.fmtDL(p.start)}</dd>
                  <dt>Target handover</dt><dd>${U.fmtDL(p.end)} <span class="badge ${U.dueCls(p.end)}">${U.inDays(U.diff(p.end, U.today()))}</span></dd>
                  <dt>Baseline</dt><dd>${U.fmtDL(p.baselineEnd)}</dd>
                  <dt>Budget / margin</dt><dd>${U.cur(p.budget)} · ${p.margin}%</dd>
                  <dt>Retention</dt><dd>${p.retentionPct}% (${U.cur(p.contractValue * p.retentionPct / 100)})</dd>
                  <dt>Business unit</dt><dd>${U.esc((S.byId('units', p.unitId) || {}).name || '—')}</dd>
                </dl>
                <hr class="hr">
                <div class="tiny muted mb8">Tags</div>
                <div class="pill-row">${(p.tags || []).map(t => `<span class="tag">${U.esc(t)}</span>`).join('') || '<span class="muted tiny">No flags</span>'}</div>
                ${p.statusNote ? `<div class="alert warn mt12">${U.esc(p.statusNote)}</div>` : ''}
              </div></div>
              <div class="card"><div class="card-h"><h3>Cost mix (actual)</h3></div><div class="card-b">${UI.donut(costSeg, { size: 118, center: U.cur(st.budgetActual), centerSub: 'actual' })}</div></div>
            </div></div>

            <div class="grid g3">
              <div class="card"><div class="card-h"><h3>Upcoming milestones</h3></div><div class="card-b tight">
                ${S.db.milestones.filter(m => m.projectId === id).slice(0, 5).map(m => `<div class="feed"><span class="av c${m.status === 'Achieved' ? '3' : m.status === 'Missed' ? '5' : '2'}">${icon(m.status === 'Achieved' ? 'check' : 'flag', 11)}</span><div class="grow"><div class="txt">${U.esc(m.name)}</div><div class="meta">${U.fmtD(m.date)}</div></div>${UI.pill(m.status)}</div>`).join('')}
              </div></div>
              <div class="card"><div class="card-h"><h3>Critical snags</h3><a class="tiny" data-tablink="quality" style="color:var(--brand);font-weight:700;cursor:pointer">All</a></div><div class="card-b tight">
                ${st.snags.filter(s => s.status !== 'Closed').slice(0, 5).map(s => `<div class="feed"><span class="av c5">${icon('alert', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(s.description)}</div><div class="meta">${s.code} · ${U.esc(s.area)} · due ${U.fmtD(s.dueDate)}</div></div>${UI.pill(s.priority)}</div>`).join('') || '<div class="tiny muted" style="padding:8px">No open snags 🎉</div>'}
              </div></div>
              <div class="card"><div class="card-h"><h3>Recent activity</h3></div><div class="card-b tight">
                ${S.db.activityLog.filter(a => a.projectId === id).slice(0, 5).map(a => `<div class="feed"><span class="av c2">${icon('activity', 11)}</span><div class="grow"><div class="txt"><b>${U.esc(a.user.split(' ')[0])}</b> ${U.esc(a.action)}</div><div class="meta">${U.ago(a.at)}</div></div></div>`).join('') || '<div class="tiny muted" style="padding:8px">No activity logged.</div>'}
              </div></div>
            </div>`;
        }

        if (tab === 'boq') {
          const boqRows = st.boq;
          const total = U.sum(boqRows, b => b.amount);
          host.innerHTML = `<div class="card mb14"><div class="card-h"><h3>Bill of quantities</h3>
            <div class="row gap6"><button class="btn sm" data-boq-csv>${icon('download', 12)} Export BOQ</button><button class="btn sm" data-boq-add>${icon('plus', 12)} Add line</button><button class="btn sm primary" data-co>${icon('refresh', 12)} Raise change order</button></div></div>
            <div class="toolbar"><div class="row gap6 wrap">
              <span class="tag">${boqRows.length} lines</span><span class="tag">Value ${U.cur(total)}</span>
              <span class="tag">Executed ${U.cur(U.sum(boqRows, b => b.executedQty * b.rate))}</span>
              <span class="tag">Certified ${U.cur(U.sum(boqRows, b => b.certifiedQty * b.rate))}</span>
              <span class="tag">${boqRows.filter(b => b.clientConfirmed).length} client confirmed</span>
            </div></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>WBS</th><th>Description</th><th>Trade</th><th class="num">Qty</th><th>Unit</th><th class="num">Rate</th><th class="num">Amount</th><th class="num">Executed</th><th>Progress</th><th class="num">Variance</th><th>Client</th><th></th></tr></thead><tbody>
            ${boqRows.map(b => `<tr>
              <td class="mono tiny">${b.wbs}</td>
              <td><div class="cell-strong trunc" style="max-width:280px">${U.esc(b.description)}</div><span class="sub">${U.esc(b.notes || b.code)}</span></td>
              <td><span class="tag">${U.esc(b.trade)}</span></td>
              <td class="num">${U.num(b.qty, 0)}</td><td class="tiny">${b.unit}</td>
              <td class="num">${U.curFull(b.rate)}</td>
              <td class="num"><b>${U.curFull(b.amount)}</b></td>
              <td class="num">${U.num(b.executedQty, 0)}<span class="sub">${U.cur(b.executedQty * b.rate)}</span></td>
              <td style="min-width:96px"><div class="row gap6">${UI.bar(b.progress, b.progress > 75 ? 'green' : b.progress < 30 ? 'red' : '')}<b class="tiny">${b.progress}%</b></div></td>
              <td class="num" style="color:${b.variance > 0 ? 'var(--bad)' : 'var(--ok)'}">${b.variance ? (b.variance > 0 ? '+' : '') + U.cur(b.variance) : '—'}</td>
              <td>${b.clientConfirmed ? '<span class="badge ok">Confirmed</span>' : '<span class="badge warn">Pending</span>'}</td>
              <td><button class="btn sm" data-boq-edit="${b.id}">${icon('edit', 11)}</button></td></tr>`).join('')}
            </tbody><tfoot><tr><td colspan="6">Total BOQ value</td><td class="num">${U.curFull(total)}</td><td class="num">${U.curFull(U.sum(boqRows, b => b.executedQty * b.rate))}</td><td>${U.round(U.pct(U.sum(boqRows, b => b.executedQty * b.rate), total), 1)}%</td><td class="num">${U.cur(U.sum(boqRows, b => b.variance))}</td><td colspan="2"></td></tr></tfoot></table></div></div>

            <div class="grid g2">
              <div class="card"><div class="card-h"><h3>Trade-wise split</h3></div><div class="card-b">${UI.barChart(U.uniq(boqRows.map(b => b.trade)).map((t, i) => ({ label: t, value: U.sum(boqRows.filter(b => b.trade === t), b => b.amount), color: U.color(i) })).sort((a, b) => b.value - a.value))}</div></div>
              <div class="card"><div class="card-h"><h3>Change orders</h3><span class="badge brand">${U.cur(st.coValue)} approved</span></div>
                <div class="card-b tight">${st.cos.map(c => `<div class="feed"><span class="av c1">${icon('refresh', 11)}</span><div class="grow"><div class="txt"><b>${c.code}</b> ${U.esc(c.title)}</div><div class="meta">${c.type} · ${U.cur(c.amount)} · ${c.impactDays}d impact · ${U.fmtD(c.raisedOn)}</div></div>${UI.pill(c.status)}</div>`).join('') || '<div class="tiny muted" style="padding:8px">No variations raised.</div>'}</div></div>
            </div>`;
        }

        if (tab === 'schedule') {
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Activity schedule — planned vs actual</h3>
            <div class="row gap6"><span class="tag">${st.acts.filter(a => a.late).length} slipping</span><a class="btn sm" href="#/schedule">Full Gantt ${icon('arrowRight', 11)}</a></div></div>
            ${window.MK.gantt ? window.MK.gantt(st.acts) : ''}</div>
          <div class="grid g2 mt14">
            <div class="card"><div class="card-h"><h3>Milestones</h3></div><div class="card-b tight">${S.db.milestones.filter(m => m.projectId === id).map(m => `<div class="feed"><span class="av c${m.status === 'Achieved' ? '3' : m.status === 'Missed' ? '5' : '2'}">${icon('flag', 11)}</span><div class="grow"><div class="txt">${U.esc(m.name)}</div><div class="meta">${U.fmtDL(m.date)}</div></div>${UI.pill(m.status)}</div>`).join('')}</div></div>
            <div class="card"><div class="card-h"><h3>Delay register</h3></div><div class="card-b tight">${st.lateActs.map(a => `<div class="feed"><span class="av c5">${icon('clock', 11)}</span><div class="grow"><div class="txt">${U.esc(a.name)}</div><div class="meta">${a.progress}% vs ${100 - Math.abs(a.slack)}% plan · slack ${a.slack}d · ${U.esc(a.notes)}</div></div><span class="badge bad">${Math.abs(a.slack)}d late</span></div>`).join('') || '<div class="tiny muted" style="padding:8px">No delays registered 🎉</div>'}</div></div>
          </div>`;
        }

        if (tab === 'procurement') {
          host.innerHTML = `<div class="grid g4 mb14">
            ${UI.kpi({ label: 'Purchase orders', value: st.pos.length, icon: 'cart', foot: U.cur(U.sum(st.pos, o => o.total)) + ' committed' })}
            ${UI.kpi({ label: 'Vendor invoices', value: st.vis.length, icon: 'receipt', foot: U.cur(U.sum(st.vis, i => i.total)) })}
            ${UI.kpi({ label: 'Paid to vendors', value: U.cur(U.sum(st.vis, i => i.paid)), icon: 'bank' })}
            ${UI.kpi({ label: 'Purchase requests', value: S.db.prs.filter(r => r.projectId === id).length, icon: 'clipboard' })}
          </div>
          <div class="card mb14"><div class="card-h"><h3>Purchase orders on this project</h3><a class="btn sm" href="#/procurement">Procurement ${icon('arrowRight', 11)}</a></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>PO</th><th>Vendor</th><th>Date</th><th class="num">Lines</th><th class="num">Value</th><th>Delivery</th><th>GRNs</th><th>Status</th></tr></thead><tbody>
              ${st.pos.map(o => `<tr><td class="mono tiny">${o.code}</td><td class="trunc" style="max-width:180px">${U.esc(o.vendor)}</td><td class="tiny">${U.fmtD(o.date)}</td>
              <td class="num">${o.items.length}</td><td class="num"><b>${U.cur(o.total)}</b></td><td class="tiny">${U.fmtD(o.deliveryDate)}</td><td>${o.grnCount || '—'}</td><td>${UI.pill(o.status)}</td></tr>`).join('')}
            </tbody></table></div></div>
          <div class="card"><div class="card-h"><h3>Material movement (GRN)</h3></div><div class="table-wrap"><table class="tbl compact"><thead><tr><th>GRN</th><th>PO</th><th>Vendor</th><th>Received</th><th>Quality</th><th>Status</th></tr></thead><tbody>
            ${S.db.grns.filter(g => g.projectId === id).map(g => `<tr><td class="mono tiny">${g.code}</td><td class="tiny">${g.poCode}</td><td class="trunc" style="max-width:160px">${U.esc(g.vendor)}</td><td class="tiny">${U.fmtD(g.date)}</td><td>${UI.pill(g.qualityCheck)}</td><td>${UI.pill(g.status)}</td></tr>`).join('') || '<tr><td colspan="6" class="center muted tiny" style="padding:16px">No GRN yet</td></tr>'}
          </tbody></table></div></div>`;
        }

        if (tab === 'finance') {
          const cis = st.cis;
          host.innerHTML = `<div class="grid g4 mb14">
            ${UI.kpi({ label: 'Contract value', value: U.cur(p.contractValue), icon: 'wallet' })}
            ${UI.kpi({ label: 'Billed', value: U.cur(st.billed), icon: 'receipt', foot: U.pct(st.billed, p.contractValue) + '% of contract' })}
            ${UI.kpi({ label: 'Collected', value: U.cur(st.received), icon: 'bank', foot: 'Receivable ' + U.cur(st.billed - st.received) })}
            ${UI.kpi({ label: 'Cost incurred', value: U.cur(p.spent), icon: 'pie', foot: 'Budget ' + U.cur(p.budget) })}
          </div>
          <div class="grid g2 mb14">
            <div class="card"><div class="card-h"><h3>Project P&amp;L (live)</h3></div><div class="card-b">
              <table class="tbl compact"><tbody>
                <tr><td>Contract value</td><td class="num cell-strong">${U.curFull(p.contractValue)}</td></tr>
                <tr><td>Approved variations</td><td class="num">${U.curFull(st.coValue)}</td></tr>
                <tr><td>Revised contract value</td><td class="num cell-strong">${U.curFull(p.contractValue + st.coValue)}</td></tr>
                <tr><td>Material cost (actual + committed)</td><td class="num">${U.curFull((st.cost.find(c => c.head === 'Material') || {}).actual || 0)}</td></tr>
                <tr><td>Subcontract &amp; labour</td><td class="num">${U.curFull(((st.cost.find(c => c.head === 'Subcontract') || {}).actual || 0) + ((st.cost.find(c => c.head === 'Labour') || {}).actual || 0))}</td></tr>
                <tr><td>Site overheads &amp; equipment</td><td class="num">${U.curFull(((st.cost.find(c => c.head === 'Site Overheads') || {}).actual || 0) + ((st.cost.find(c => c.head === 'Equipment') || {}).actual || 0))}</td></tr>
                <tr><td class="cell-strong">Gross profit</td><td class="num cell-strong" style="color:var(--ok)">${U.curFull(p.contractValue + st.coValue - p.spent)}</td></tr>
                <tr><td>Margin %</td><td class="num"><b>${U.round(U.pct(p.contractValue + st.coValue - p.spent, p.contractValue + st.coValue), 1)}%</b></td></tr>
                <tr><td>Retention held</td><td class="num">${U.curFull(p.contractValue * p.retentionPct / 100)}</td></tr>
              </tbody></table></div></div>
            <div class="card"><div class="card-h"><h3>Budget vs committed vs actual</h3></div><div class="card-b">
              ${st.cost.map(c => `<div class="mb12"><div class="row-between tiny"><span>${c.head}</span><span class="mono">${U.cur(c.actual)} / ${U.cur(c.budget)}</span></div>
                ${UI.bar(U.pct(c.actual, c.budget), c.actual > c.budget ? 'red' : 'green')}
                <div class="tiny muted mt4">Committed ${U.cur(c.committed)}</div></div>`).join('')}
            </div></div>
          </div>
          <div class="card"><div class="card-h"><h3>Client invoices</h3><button class="btn sm primary" data-newinv>${icon('plus', 12)} Raise invoice</button></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Invoice</th><th>Milestone</th><th>Date</th><th>Due</th><th class="num">Amount</th><th class="num">Received</th><th>Status</th><th>Aging</th></tr></thead><tbody>
              ${cis.map(c => `<tr><td class="mono tiny">${c.code}</td><td class="tiny">${U.esc(c.milestone)}</td><td class="tiny">${U.fmtD(c.date)}</td><td class="tiny">${U.fmtD(c.dueDate)}</td>
              <td class="num"><b>${U.curFull(c.total)}</b></td><td class="num">${U.curFull(c.received)}</td><td>${UI.pill(c.status)}</td><td>${c.aging > 0 ? `<span class="badge ${c.aging > 30 ? 'bad' : 'warn'}">${c.aging}d</span>` : '—'}</td></tr>`).join('') || '<tr><td colspan="8" class="center muted tiny" style="padding:16px">No invoice raised</td></tr>'}
            </tbody></table></div></div>`;
        }

        if (tab === 'quality') {
          const sn = st.snags;
          host.innerHTML = `<div class="grid g4 mb14">
            ${UI.kpi({ label: 'Open snags', value: sn.filter(s => s.status !== 'Closed').length, icon: 'alert' })}
            ${UI.kpi({ label: 'Critical', value: sn.filter(s => s.priority === 'Critical' && s.status !== 'Closed').length, icon: 'flag' })}
            ${UI.kpi({ label: 'Closed', value: sn.filter(s => s.status === 'Closed').length, icon: 'checksq', foot: U.pct(sn.filter(s => s.status === 'Closed').length, sn.length) + '% closure' })}
            ${UI.kpi({ label: 'Cost impact', value: U.cur(U.sum(sn, s => s.costImpact)), icon: 'wallet' })}
          </div>
          <div class="card"><div class="card-h"><h3>Snag register</h3><a class="btn sm primary" href="#/snags">Open snag module ${icon('arrowRight', 11)}</a></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Code</th><th>Area</th><th>Trade</th><th>Description</th><th>Priority</th><th>Assigned</th><th>Due</th><th>Status</th></tr></thead><tbody>
              ${sn.map(s => `<tr><td class="mono tiny">${s.code}</td><td class="tiny">${U.esc(s.area)}</td><td><span class="tag">${U.esc(s.trade)}</span></td><td class="trunc" style="max-width:230px">${U.esc(s.description)}</td>
              <td>${UI.pill(s.priority)}</td><td class="tiny">${U.esc(S.vendor(s.assignedTo) ? S.vendor(s.assignedTo).name : S.empName(s.assignedTo))}</td><td class="tiny">${U.fmtD(s.dueDate)}</td><td>${UI.pill(s.status)}</td></tr>`).join('')}
            </tbody></table></div></div>
          <div class="card mt14"><div class="card-h"><h3>RFIs &amp; clarifications</h3></div>
            <div class="table-wrap"><table class="tbl compact"><thead><tr><th>RFI</th><th>Subject</th><th>To</th><th>Raised</th><th>Due</th><th>Status</th></tr></thead><tbody>
              ${S.db.rfis.filter(r => r.projectId === id).map(r => `<tr><td class="mono tiny">${r.code}</td><td class="trunc" style="max-width:260px">${U.esc(r.subject)}</td><td class="tiny">${r.toWhom}</td><td class="tiny">${U.fmtD(r.raisedOn)}</td><td class="tiny">${U.fmtD(r.dueDate)}</td><td>${UI.pill(r.status)}</td></tr>`).join('') || '<tr><td colspan="6" class="center muted tiny" style="padding:16px">No RFI raised</td></tr>'}
            </tbody></table></div></div>`;
        }

        if (tab === 'docs') {
          const docs = S.db.docs.filter(d => d.projectId === id);
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Drawings &amp; documents</h3><a class="btn sm" href="#/documents">Document manager ${icon('arrowRight', 11)}</a></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Drawing</th><th>No.</th><th>Discipline</th><th>Rev</th><th>Status</th><th>Uploaded</th><th>Client shared</th><th class="num">Size</th></tr></thead><tbody>
              ${docs.map(d => `<tr><td class="cell-strong">${U.esc(d.name)}</td><td class="mono tiny">${d.drawingNo}</td><td><span class="tag">${d.discipline}</span></td><td><span class="badge ${d.status === 'Approved' ? 'ok' : d.status === 'Superseded' ? '' : 'warn'}">${d.version}</span></td>
              <td>${UI.pill(d.status)}</td><td class="tiny">${U.fmtD(d.uploadedOn)}</td><td>${d.clientShared ? icon('check', 12) : '—'}</td><td class="num tiny">${d.size}</td></tr>`).join('')}
            </tbody></table></div></div>`;
        }

        if (tab === 'team') {
          const team = [p.pm, S.empName(p.siteEng), S.empName(p.qs), ...S.db.employees.slice(3, 8).map(e => e.name)];
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Project team</h3><span class="badge">${U.uniq(team).length} members</span></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Member</th><th>Role</th><th>Department</th><th>Phone</th><th>Since</th></tr></thead><tbody>
            ${U.uniq(team).map(n => { const e = S.db.employees.find(x => x.name === n) || S.db.employees[0]; return `<tr><td><div class="row gap8">${UI.av(e.name)}<div><div class="cell-strong">${U.esc(e.name)}</div><span class="sub">${U.esc(e.email)}</span></div></div></td>
              <td>${U.esc(e.designation)}</td><td><span class="tag">${U.esc((S.dept(e.deptId) || {}).name || '')}</span></td><td class="tiny mono">${U.esc(e.phone)}</td><td class="tiny">${U.fmtD(e.doj)}</td></tr>`; }).join('')}
            </tbody></table></div></div>
            <div class="grid g2 mt14"><div class="card"><div class="card-h"><h3>Access</h3></div><div class="card-b">
              <div class="note info">Client portal access is enabled for <b>${U.esc(p.client)}</b>. They can view progress, drawings, snags and invoices, and approve change orders.</div>
              <div class="copy mt12"><span>portal.managekaro.app/${S.db.clients.find(c => c.id === p.clientId) ? U.slug(S.db.clients.find(c => c.id === p.clientId).name) : 'client'}/${p.code}</span><button data-copy>Copy</button></div>
            </div></div>
            <div class="card"><div class="card-h"><h3>Vendor access</h3></div><div class="card-b tight">
              ${U.uniq(st.pos.map(o => o.vendor)).slice(0, 5).map(v => `<div class="feed"><span class="av c2">${icon('truck', 11)}</span><div class="grow"><div class="txt">${U.esc(v)}</div><div class="meta">Vendor portal • PO & delivery access</div></div><span class="badge ok">Active</span></div>`).join('')}
            </div></div></div>`;
        }

        if (tab === 'activity') {
          const logs = S.db.activityLog.filter(a => a.projectId === id);
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Audit trail</h3><span class="tiny muted">${logs.length} events</span></div>
            <div class="card-b"><div class="tl">${logs.map(l => `<div class="tl-item done"><div class="t">${U.esc(l.action)} — ${U.esc(l.detail || '')}</div><div class="m">${U.esc(l.user)} · ${U.esc(l.role)} · ${U.fmtDT(l.at)}</div></div>`).join('') || '<div class="tiny muted">No events yet.</div>'}</div></div></div>`;
        }
        // wire tab-local actions
        $$('[data-tablink]', host).forEach(b => b.onclick = (e) => { e.preventDefault(); const id2 = b.getAttribute('data-tablink'); MK._ptab[id] = id2; $$('.tab', view).forEach(t => t.classList.toggle('on', t.getAttribute('data-tab') === id2)); draw(id2); });
        $$('[data-copy]', host).forEach(b => b.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(b.previousElementSibling.textContent); UI.toast('Portal link copied', 'ok'); });
        const boqCsv = $('[data-boq-csv]', host);
        if (boqCsv) boqCsv.onclick = () => { U.csv('boq-' + p.code, S.db.boq.filter(b => b.projectId === id)); UI.toast('BOQ exported', 'ok'); };
        const addLine = $('[data-boq-add]', host);
        if (addLine) addLine.onclick = () => MK.boqModal(id, () => draw('boq'));
        const co = $('[data-co]', host);
        if (co) co.onclick = () => MK.changeOrderModal(id, () => draw('boq'));
        const ni = $('[data-newinv]', host);
        if (ni) ni.onclick = () => MK.invoiceModal(id, () => draw('finance'));
        $$('[data-boq-edit]', host).forEach(b => b.onclick = () => MK.boqModal(id, () => draw('boq'), b.getAttribute('data-boq-edit')));
      }
      setTab((MK._ptab && MK._ptab[id]) || 'overview');
      U.wireTabs(view, (id2) => { MK._ptab = MK._ptab || {}; MK._ptab[id] = id2; draw(id2); });
      $('[data-edit]', view).onclick = () => MK.editProject(id, () => MK.render());
      $('[data-report]', view).onclick = () => MK.clientReport(id);
      $('[data-dpr]', view).onclick = () => { MK._dprProject = id; MK.go('/dpr'); };
    }
  });

  MK.boqModal = function (projectId, after, boqId) {
    const existing = boqId ? S.byId('boq', boqId) : null;
    UI.modal({
      title: existing ? 'Edit BOQ line' : 'Add BOQ line', sub: 'BOQ is the anchor for orders, measurement, billing and snags', size: 'wide',
      body: `<div class="grid g2 gap10">
        <div class="field span2"><label>Description *</label><input class="input" data-d value="${U.attr(existing ? existing.description : '')}" placeholder="e.g. Gypsum partition 12.5mm both side"></div>
        <div class="field"><label>Trade</label><select class="input" data-tr>${S.const.TRADES.map(t => `<option ${existing && existing.trade === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Item master</label><select class="input" data-item><option value="">— none —</option>${S.db.items.map(i => `<option value="${i.id}" ${existing && existing.itemId === i.id ? 'selected' : ''}>${U.esc(i.code)} · ${U.esc(i.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Quantity</label><input class="input" type="number" data-q value="${existing ? existing.qty : ''}" placeholder="1200"></div>
        <div class="field"><label>Unit</label><select class="input" data-u>${S.const.UNITS.map(u => `<option ${existing && existing.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
        <div class="field"><label>Rate (₹)</label><input class="input" type="number" data-r value="${existing ? existing.rate : ''}" placeholder="168"></div>
        <div class="field"><label>Budget rate (₹)</label><input class="input" type="number" data-br value="${existing ? existing.budgetRate : ''}" placeholder="142"></div>
        <div class="field"><label>Executed qty</label><input class="input" type="number" data-e value="${existing ? existing.executedQty : 0}"></div>
        <div class="field"><label>Client confirmed</label><select class="input" data-cc><option value="0" ${existing && !existing.clientConfirmed ? 'selected' : ''}>Pending</option><option value="1" ${existing && existing.clientConfirmed ? 'selected' : ''}>Confirmed</option></select></div>
        <div class="field span2"><label>Notes / specification</label><input class="input" data-n value="${U.attr(existing ? existing.notes : '')}" placeholder="Approved make list applies…"></div>
      </div>`,
      onOk(ov) {
        const desc = $('[data-d]', ov).value.trim();
        if (!desc) { UI.toast('Description required', 'bad'); return false; }
        const qty = U.n($('[data-q]', ov).value), rate = U.n($('[data-r]', ov).value), ex = U.n($('[data-e]', ov).value);
        const patch = {
          description: desc, trade: $('[data-tr]', ov).value, itemId: $('[data-item]', ov).value, qty, unit: $('[data-u]', ov).value, rate,
          amount: qty * rate, budgetRate: U.n($('[data-br]', ov).value) || Math.round(rate * .85), executedQty: ex,
          progress: U.clamp(Math.round(U.pct(ex, qty)), 0, 100), clientConfirmed: $('[data-cc]', ov).value === '1',
          notes: $('[data-n]', ov).value, variance: Math.round((rate - (U.n($('[data-br]', ov).value) || rate)) * qty), updatedAt: U.iso(U.today())
        };
        if (existing) { S.update('boq', existing.id, patch); S.log('boq', 'updated BOQ line', desc); UI.toast('BOQ line updated', 'ok'); }
        else {
          S.add('boq', Object.assign({ projectId, code: 'B-NEW', wbs: patch.trade.slice(0, 3).toUpperCase() + '-NEW', certifiedQty: 0, orderedQty: 0, status: 'Active' }, patch));
          S.log('boq', 'added BOQ line', desc + ' · ' + U.cur(qty * rate)); UI.toast('BOQ line added', 'ok');
        }
        if (after) after();
      }
    });
  };

  MK.changeOrderModal = function (projectId, after) {
    UI.modal({
      title: 'Raise change order', sub: 'Variations require client approval before billing',
      body: `<div class="col gap10">
        <div class="field"><label>Title *</label><input class="input" data-t placeholder="Additional workstations at Level 8"></div>
        <div class="grid g2"><div class="field"><label>Type</label><select class="input" data-ty><option>Addition</option><option>Omission</option><option>Substitution</option></select></div>
        <div class="field"><label>Amount (₹)</label><input class="input" type="number" data-a placeholder="250000"></div></div>
        <div class="grid g2"><div class="field"><label>Impact on schedule (days)</label><input class="input" type="number" data-d value="0"></div>
        <div class="field"><label>Linked BOQ line</label><select class="input" data-b>${S.db.boq.filter(b => b.projectId === projectId).map(b => `<option value="${b.id}">${b.wbs} · ${U.esc(b.description.slice(0, 40))}</option>`).join('')}</select></div></div>
        <div class="field"><label>Justification</label><textarea class="input" data-j placeholder="Client instruction received on…"></textarea></div>
      </div>`,
      onOk(ov) {
        const title = $('[data-t]', ov).value.trim(); if (!title) { UI.toast('Title required', 'bad'); return false; }
        const co = S.add('changeOrders', {
          code: 'CO-' + String(S.db.changeOrders.length + 1).padStart(3, '0'), projectId, title, type: $('[data-ty]', ov).value,
          amount: U.n($('[data-a]', ov).value), raisedOn: U.iso(U.today()), status: 'Pending', raiser: S.me().id,
          impactDays: U.n($('[data-d]', ov).value), clientPo: '', notes: $('[data-j]', ov).value, approver: S.project(projectId).pmId
        });
        S.add('approvals', { type: 'Change Order', ref: co.code, amount: co.amount, projectId, entityId: co.id, requestedBy: S.me().id, requestedOn: U.iso(U.today()), status: 'Pending', level: 1, levels: 3, approverId: S.prefs.user, sla: 3, comments: '', priority: 'High' });
        S.log('co', 'raised change order', co.code + ' · ' + U.cur(co.amount));
        UI.toast('Change order raised — sent for approval', 'ok');
        if (after) after();
      }
    });
  };

  MK.invoiceModal = function (projectId, after) {
    const p = S.project(projectId);
    UI.modal({
      title: 'Raise client invoice', sub: p.code + ' · ' + p.client,
      body: `<div class="col gap10">
        <div class="field"><label>Milestone / billing stage</label><select class="input" data-m><option>Mobilisation advance</option><option>On 40% progress</option><option>On 75% progress</option><option>On completion</option><option>Retention release</option></select></div>
        <div class="grid g2"><div class="field"><label>Work value (₹)</label><input class="input" type="number" data-a placeholder="1500000"></div>
        <div class="field"><label>GST %</label><input class="input" type="number" data-g value="18"></div></div>
        <div class="field"><label>Due in (days)</label><input class="input" type="number" data-d value="30"></div>
        <div class="note info">Invoice is generated against certified progress. Retention ${p.retentionPct}% and TDS will be shown on the client statement.</div>
      </div>`,
      onOk(ov) {
        const amt = U.n($('[data-a]', ov).value);
        if (!amt) { UI.toast('Invoice amount required', 'bad'); return false; }
        const tax = Math.round(amt * U.n($('[data-g]', ov).value) / 100);
        const inv = S.add('clientInvoices', {
          code: 'MKINV/26/' + String(S.db.clientInvoices.length + 1).padStart(3, '0'), projectId, clientId: p.clientId, client: p.client,
          date: U.iso(U.today()), dueDate: U.iso(U.addD(U.today(), U.n($('[data-d]', ov).value))), amount: amt, tax, total: amt + tax,
          received: 0, status: 'Sent', workOrder: p.code, milestone: $('[data-m]', ov).value, gstType: 'IGST 18%', remarks: '', aging: 0
        });
        S.update('projects', projectId, { billed: p.billed + amt + tax });
        S.log('invoice', 'raised client invoice', inv.code + ' · ' + U.cur(amt + tax));
        UI.toast('Client invoice raised', 'ok');
        if (after) after();
      }
    });
  };

  MK.editProject = function (id, after) {
    const p = S.project(id);
    UI.modal({
      title: 'Edit project', sub: p.code, size: 'wide',
      body: `<div class="grid g2 gap10">
        <div class="field span2"><label>Project name</label><input class="input" data-n value="${U.attr(p.name)}"></div>
        <div class="field"><label>Status</label><select class="input" data-s>${['Planning', 'In Progress', 'Snagging', 'On Hold', 'Completed'].map(s => `<option ${p.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Health</label><select class="input" data-h>${['On Track', 'At Risk', 'Critical', 'Closed'].map(s => `<option ${p.health === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Progress %</label><input class="input" type="number" data-p value="${p.progress}"></div>
        <div class="field"><label>Client approved %</label><input class="input" type="number" data-ca value="${p.clientApproved}"></div>
        <div class="field"><label>Contract value (₹)</label><input class="input" type="number" data-cv value="${p.contractValue}"></div>
        <div class="field"><label>Budget (₹)</label><input class="input" type="number" data-b value="${p.budget}"></div>
        <div class="field"><label>Handover date</label><input class="input" type="date" data-e value="${p.end}"></div>
        <div class="field"><label>Project manager</label><select class="input" data-pm>${S.db.employees.map(e => `<option value="${e.id}" ${e.id === p.pmId ? 'selected' : ''}>${U.esc(e.name)}</option>`).join('')}</select></div>
        <div class="field span2"><label>Status note</label><textarea class="input" data-note>${U.esc(p.statusNote || '')}</textarea></div>
      </div>`,
      onOk(ov) {
        const pm = S.emp($('[data-pm]', ov).value);
        const cv = U.n($('[data-cv]', ov).value), b = U.n($('[data-b]', ov).value);
        S.update('projects', id, {
          name: $('[data-n]', ov).value, status: $('[data-s]', ov).value, health: $('[data-h]', ov).value,
          progress: U.n($('[data-p]', ov).value), clientApproved: U.n($('[data-ca]', ov).value), contractValue: cv, budget: b,
          end: $('[data-e]', ov).value, pmId: pm.id, pm: pm.name, statusNote: $('[data-note]', ov).value,
          margin: U.round(((cv - b) / cv) * 100, 1)
        });
        S.log('project', 'updated project', p.name); UI.toast('Project updated', 'ok');
        if (after) after();
      }
    });
  };

  /* ---------------------------- client report --------------------------- */
  MK.clientReport = function (id) {
    const p = S.project(id), st = S.projectStats(id);
    const html = `<div style="padding:6px 4px">
      <div class="row-between" style="border-bottom:2px solid #0B1220;padding-bottom:12px;margin-bottom:16px">
        <div class="row gap10"><img src="assets/img/logo.svg" style="height:34px"></div>
        <div class="right tiny"><b style="font-size:13px">${U.esc(S.db.org.name)}</b><br>${U.esc(S.db.org.address)}<br>GSTIN ${S.db.org.gst}</div>
      </div>
      <h2 style="font-size:18px">Project status report — ${U.esc(p.name)}</h2>
      <div class="tiny muted">${p.code} · ${U.esc(p.client)} · generated ${U.fmtDL(U.today())} · period to date</div>
      <div class="grid g4 mt16" style="gap:8px">
        ${[['Contract value', U.cur(p.contractValue)], ['Progress', p.progress + '%'], ['Billed', U.cur(st.billed)], ['Received', U.cur(st.received)]].map(x => `<div class="card"><div class="card-b" style="padding:10px"><div class="tiny muted">${x[0]}</div><b style="font-size:15px">${x[1]}</b></div></div>`).join('')}
      </div>
      <h4 class="mt16">Progress by activity</h4>
      ${st.acts.slice(0, 10).map(a => `<div style="margin-bottom:7px"><div class="row-between tiny"><span>${U.esc(a.name)}</span><b>${a.progress}%</b></div>${UI.bar(a.progress, a.progress > 70 ? 'green' : '')}</div>`).join('')}
      <h4 class="mt16">Open snags (client facing)</h4>
      <table class="tbl compact"><thead><tr><th>Code</th><th>Area</th><th>Description</th><th>Due</th><th>Status</th></tr></thead><tbody>
        ${st.snags.filter(s => s.clientFacing).slice(0, 8).map(s => `<tr><td class="mono tiny">${s.code}</td><td class="tiny">${U.esc(s.area)}</td><td class="tiny">${U.esc(s.description)}</td><td class="tiny">${U.fmtD(s.dueDate)}</td><td class="tiny">${s.status}</td></tr>`).join('')}
      </tbody></table>
      <h4 class="mt16">Billing summary</h4>
      <table class="tbl compact"><thead><tr><th>Invoice</th><th>Milestone</th><th class="num">Amount</th><th class="num">Received</th><th>Status</th></tr></thead><tbody>
        ${st.cis.map(c => `<tr><td class="mono tiny">${c.code}</td><td class="tiny">${U.esc(c.milestone)}</td><td class="num tiny">${U.curFull(c.total)}</td><td class="num tiny">${U.curFull(c.received)}</td><td class="tiny">${c.status}</td></tr>`).join('')}
      </tbody></table>
      <div class="tiny muted mt24" style="border-top:1px solid #E6E9F0;padding-top:10px">This report is generated from live Managekaro data. For queries contact ${U.esc(p.pm)} (Project Manager).</div>
    </div>`;
    UI.modal({ title: 'Client status report', sub: 'Print or save as PDF to share with the client', size: 'xl', body: html, okText: 'Print / Save PDF', onOk() { window.print(); return false; } });
  };
})(window.MK);
