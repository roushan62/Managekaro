/* Managekaro — Analytics, AI Copilot, AI Agents */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ============================= ANALYTICS ============================= */
  MK.route('/analytics', {
    title: 'Analytics', crumb: () => [{ label: 'Analytics' }],
    render() {
      MK._anatab = MK._anatab || 'portfolio';
      const tabs = [{ id: 'portfolio', label: 'Portfolio' }, { id: 'projects', label: 'Project performance' }, { id: 'financial', label: 'Financial' }, { id: 'procurement', label: 'Procurement & vendors' }, { id: 'people', label: 'People & productivity' }, { id: 'custom', label: 'Custom dashboards' }];
      return UI.pageHead('Analytics', '20+ live dashboards across delivery, commercials and people',
        `<button class="btn" data-print>${icon('printer', 14)} Print</button><button class="btn" data-sched>${icon('mail', 14)} Subscribe MIS</button><button class="btn primary" data-csv>${icon('download', 14)} Export data</button>`)
        + UI.tabs('ana', tabs, MK._anatab)
        + `<div data-host class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-host]', view);
      const draw = (t) => {
        MK._anatab = t; host.innerHTML = '';
        const P = S.db.projects, m = S.metrics();

        if (t === 'portfolio') {
          const byType = U.uniq(P.map(p => p.type)).map((ty, i) => ({ label: ty, value: U.sum(P.filter(p => p.type === ty), p => p.contractValue), color: U.color(i) }));
          const byCity = U.uniq(P.map(p => p.city)).map((c, i) => ({ label: c, value: U.sum(P.filter(p => p.city === c), p => p.contractValue), color: U.color(i) }));
          host.innerHTML = `<div class="grid g2 mb14">
            <div class="card"><div class="card-h"><h3>Contract value by project type</h3></div><div class="card-b">${UI.barChart(byType.sort((a, b) => b.value - a.value))}</div></div>
            <div class="card"><div class="card-h"><h3>Contract value by city</h3></div><div class="card-b">${UI.barChart(byCity.sort((a, b) => b.value - a.value))}</div></div>
          </div>
          <div class="grid g3 mb14">
            <div class="card"><div class="card-h"><h3>Delivery health</h3></div><div class="card-b">${UI.donut(['On Track', 'At Risk', 'Critical', 'Closed'].map((h, i) => ({ label: h, value: P.filter(p => p.health === h).length, color: ['#0E9F6E', '#D97706', '#DC2626', '#94A3B8'][i] })), { center: m.progress + '%', centerSub: 'progress', size: 124 })}</div></div>
            <div class="card"><div class="card-h"><h3>Schedule vs cost</h3></div><div class="card-b">
              ${P.filter(p => p.status === 'In Progress').slice(0, 8).map(p => `<div class="mb12"><div class="row-between tiny"><span class="trunc" style="max-width:60%">${U.esc(p.code)}</span><span>${p.progress}% · burn ${U.pct(p.spent, p.budget)}%</span></div>
                <div class="bar stacked" style="height:8px"><i style="width:${p.progress}%;background:#F2540B"></i><i style="width:${U.clamp(U.pct(p.spent, p.budget) - p.progress, 0, 100)}%;background:#DC2626"></i><i style="width:${U.clamp(100 - Math.max(p.progress, U.pct(p.spent, p.budget)), 0, 100)}%;background:#E6E9F0"></i></div></div>`).join('')}
              <div class="legend mt8"><span><i style="background:#F2540B"></i>Progress</span><span><i style="background:#DC2626"></i>Cost ahead of progress</span></div>
            </div></div>
            <div class="card"><div class="card-h"><h3>Portfolio KPIs</h3></div><div class="card-b">
              <div class="stat-line"><span class="muted">Contract value</span><b>${U.cur(m.cv)}</b></div>
              <div class="stat-line"><span class="muted">Billed</span><b>${U.cur(m.billed)}</b></div>
              <div class="stat-line"><span class="muted">Collected</span><b>${U.cur(m.received)}</b></div>
              <div class="stat-line"><span class="muted">Gross margin</span><b>${m.grossMargin}%</b></div>
              <div class="stat-line"><span class="muted">Open snags</span><b>${m.openSnags}</b></div>
              <div class="stat-line"><span class="muted">Headcount</span><b>${m.headcount}</b></div>
              <div class="stat-line"><span class="muted">Won pipeline</span><b>${U.cur(m.wonValue)}</b></div>
            </div></div>
          </div>
          <div class="card"><div class="card-h"><h3>Progress heatmap — activity completion by trade</h3></div><div class="card-b">
            ${U.uniq(S.db.activities.map(a => a.trade)).slice(0, 14).map(t2 => {
            const rows = S.db.activities.filter(a => a.trade === t2);
            const cells = Array.from({ length: 16 }, (_, i) => { const v = rows[i]; return v ? (v.progress > 85 ? 4 : v.progress > 60 ? 3 : v.progress > 30 ? 2 : v.progress > 0 ? 1 : 0) : 0; });
            return `<div class="row gap10 mb8"><span class="tiny" style="width:110px;flex:0 0 110px">${U.esc(t2)}</span><div class="heat grow">${cells.map(c => `<i class="l${c}"></i>`).join('')}</div>
              <span class="tiny muted" style="width:44px;text-align:right">${U.round(U.avg(rows, r => r.progress), 0)}%</span></div>`;
          }).join('')}
            <div class="legend mt12"><span><i style="background:#EEF1F6"></i>0%</span><span><i style="background:#FFE0CE"></i>1-30%</span><span><i style="background:#FFBE9C"></i>31-60%</span><span><i style="background:#FF9A5A"></i>61-85%</span><span><i style="background:#F2540B"></i>86-100%</span></div>
          </div></div>`;
        }

        if (t === 'projects') {
          const rows = P.map(p => ({ p, st: S.projectStats(p.id) }));
          host.innerHTML = `<div class="card mb14"><div class="card-h"><h3>Project scorecard</h3><span class="tiny muted">Progress · cost · schedule · quality</span></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Project</th><th>PM</th><th>Progress</th><th class="num">Schedule var.</th><th class="num">Cost var.</th><th class="num">Margin</th><th class="num">Snags</th><th>Health</th></tr></thead><tbody>
              ${rows.map(r => {
            const sv = U.round(r.p.progress - (U.diff(U.today(), r.p.start) / Math.max(1, U.diff(r.p.end, r.p.start))) * 100, 1);
            const cv = U.round(U.pct(r.p.spent, r.p.budget) - r.p.progress, 1);
            return `<tr class="clickable" data-pr="${r.p.id}"><td><div class="cell-strong trunc" style="max-width:210px">${U.esc(r.p.name)}</div><span class="sub">${r.p.code} · ${r.p.type}</span></td>
              <td class="tiny">${U.esc(r.p.pm)}</td><td style="min-width:100px"><div class="row gap6">${UI.bar(r.p.progress)}<b class="tiny">${r.p.progress}%</b></div></td>
              <td class="num" style="color:${sv < -5 ? 'var(--bad)' : 'var(--ok)'}">${sv > 0 ? '+' : ''}${sv}%</td>
              <td class="num" style="color:${cv > 5 ? 'var(--bad)' : 'var(--ok)'}">${cv > 0 ? '+' : ''}${cv}%</td>
              <td class="num"><b>${r.p.margin}%</b></td><td class="num">${r.st.openSnags}</td><td>${UI.pill(r.p.health)}</td></tr>`;
          }).join('')}
            </tbody></table></div></div>
            <div class="grid g2">
              <div class="card"><div class="card-h"><h3>S-curve — planned vs actual</h3></div><div class="card-b">${UI.lineChart([{ name: 'Planned', data: [8, 18, 30, 44, 60, 74, 88, 100], color: '#5B7099', fill: false }, { name: 'Actual', data: [6, 15, 27, 39, 52, 66, 79, 90], color: '#F2540B' }], ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], { height: 210, max: 110 })}</div></div>
              <div class="card"><div class="card-h"><h3>Snag closure velocity</h3></div><div class="card-b">${UI.lineChart([{ name: 'Raised', data: [22, 34, 28, 41, 30, 24], color: '#DC2626', fill: false }, { name: 'Closed', data: [14, 27, 31, 33, 38, 29], color: '#0E9F6E' }], ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'], { height: 210 })}</div></div>
            </div>`;
          $$('[data-pr]', host).forEach(tr => tr.onclick = () => MK.go('/projects/' + tr.getAttribute('data-pr')));
        }

        if (t === 'financial') {
          const cash = S.db.cashflow;
          host.innerHTML = `<div class="grid g4 mb14">
            ${UI.kpi({ label: 'Revenue billed', value: U.cur(m.billed), icon: 'receipt' })}
            ${UI.kpi({ label: 'Collected', value: U.cur(m.received), icon: 'bank', foot: m.collectionPct + '%' })}
            ${UI.kpi({ label: 'Cost', value: U.cur(m.cost), icon: 'trend' })}
            ${UI.kpi({ label: 'Working capital gap', value: U.cur(m.receivable - m.payable), icon: 'scale' })}
          </div>
          <div class="grid g23 mb14">
            <div class="card"><div class="card-h"><h3>Cash flow — 6 month view</h3></div><div class="card-b">${UI.lineChart([{ name: 'Inflow', data: cash.map(c => c.inflow), color: '#0E9F6E' }, { name: 'Outflow', data: cash.map(c => c.outflow), color: '#DC2626', fill: false }, { name: 'Collections', data: cash.map(c => c.collections), color: '#2563EB', fill: false }], cash.map(c => c.label), { height: 230 })}
              <div class="legend mt8"><span><i style="background:#0E9F6E"></i>Inflow</span><span><i style="background:#DC2626"></i>Outflow</span><span><i style="background:#2563EB"></i>Collections</span></div></div></div>
            <div class="card"><div class="card-h"><h3>Cost head mix</h3></div><div class="card-b">${UI.donut(U.uniq(S.db.costEntries.map(c => c.head)).map((h, i) => ({ label: h, value: U.sum(S.db.costEntries.filter(c => c.head === h), c => c.actual), color: U.color(i) })), { center: U.cur(m.cost), centerSub: 'actual', size: 128 })}</div></div>
          </div>
          <div class="grid g2">
            <div class="card"><div class="card-h"><h3>Receivable ageing</h3></div><div class="card-b">
              ${[['0-30', 0, 30], ['31-60', 30, 60], ['61-90', 60, 90], ['90+', 90, 9999]].map((b, i) => {
            const v = U.sum(S.db.clientInvoices.filter(c => c.status !== 'Paid' && c.aging > b[1] && c.aging <= b[2]), c => c.total - c.received);
            return `<div class="mb12"><div class="row-between tiny"><span>${b[0]} days</span><b>${U.cur(v)}</b></div>${UI.bar(U.pct(v, m.receivable || 1), i === 0 ? 'green' : i === 1 ? '' : 'red')}</div>`;
          }).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Expense trend</h3></div><div class="card-b">${UI.lineChart([{ name: 'Expenses', data: cash.map(c => c.payables), color: '#D97706' }], cash.map(c => c.label), { height: 190 })}</div></div>
          </div>`;
        }

        if (t === 'procurement') {
          const vendors = S.db.vendors.slice().sort((a, b) => b.rating - a.rating);
          host.innerHTML = `<div class="grid g23 mb14">
            <div class="card"><div class="card-h"><h3>Top vendors by spend</h3></div><div class="card-b">
              ${UI.barChart(U.uniq(S.db.pos.map(p => p.vendor)).map((v, i) => ({ label: v, value: U.sum(S.db.pos.filter(p => p.vendor === v), p => p.total), color: U.color(i) })).sort((a, b) => b.value - a.value).slice(0, 10))}
            </div></div>
            <div class="card"><div class="card-h"><h3>Vendor scorecard</h3></div><div class="card-b tight" style="max-height:340px;overflow:auto">
              ${vendors.slice(0, 8).map(v => `<div class="feed"><span class="av c2">${icon('truck', 11)}</span><div class="grow"><div class="txt">${U.esc(v.name)}</div><div class="meta">On-time ${v.onTime}% · Quality ${v.quality}% · ${U.esc(v.terms)}</div></div><span class="badge ${v.rating >= 4 ? 'ok' : v.rating >= 3 ? 'warn' : 'bad'}">★ ${v.rating}</span></div>`).join('')}
            </div></div>
          </div>
          <div class="grid g3">
            <div class="card"><div class="card-h"><h3>PO status</h3></div><div class="card-b">${UI.donut(U.uniq(S.db.pos.map(p => p.status)).map((s, i) => ({ label: s, value: S.db.pos.filter(p => p.status === s).length, color: U.color(i) })), { center: S.db.pos.length + '', centerSub: 'POs', size: 120 })}</div></div>
            <div class="card"><div class="card-h"><h3>GRN quality</h3></div><div class="card-b">${UI.donut(U.uniq(S.db.grns.map(g => g.qualityCheck)).map((s, i) => ({ label: s, value: S.db.grns.filter(g => g.qualityCheck === s).length, color: ['#0E9F6E', '#D97706', '#DC2626'][i] || U.color(i) })), { center: S.db.grns.length + '', centerSub: 'GRNs', size: 120 })}</div></div>
            <div class="card"><div class="card-h"><h3>Buying metrics</h3></div><div class="card-b">
              <div class="stat-line"><span class="muted">Committed value</span><b>${U.cur(U.sum(S.db.pos, p => p.total))}</b></div>
              <div class="stat-line"><span class="muted">Avg PO value</span><b>${U.cur(U.avg(S.db.pos, p => p.total))}</b></div>
              <div class="stat-line"><span class="muted">Off-BOQ POs</span><b>${S.db.pos.filter(p => !p.budgeted).length}</b></div>
              <div class="stat-line"><span class="muted">Match exceptions</span><b>${S.db.invoices.filter(i => !i.threeWayMatch).length}</b></div>
              <div class="stat-line"><span class="muted">Rate contracts active</span><b>${S.db.rateContracts.filter(r => r.status === 'Active').length}</b></div>
            </div></div>
          </div>`;
        }

        if (t === 'people') {
          const emps = S.db.employees;
          const ts = S.db.timesheets;
          host.innerHTML = `<div class="grid g4 mb14">
            ${UI.kpi({ label: 'Headcount', value: emps.length, icon: 'users' })}
            ${UI.kpi({ label: 'Billable utilisation', value: Math.round(U.pct(ts.filter(t => t.billable).length, ts.length)) + '%', icon: 'percent' })}
            ${UI.kpi({ label: 'Hours logged', value: U.round(U.sum(ts, t => t.hours), 0), icon: 'clock' })}
            ${UI.kpi({ label: 'Avg rating', value: U.round(U.avg(S.db.appraisals, a => a.managerRating), 2), unit: '/5', icon: 'award' })}
          </div>
          <div class="grid g2 mb14">
            <div class="card"><div class="card-h"><h3>Headcount by department</h3></div><div class="card-b">${UI.barChart(S.db.departments.map(d => ({ label: d.name, value: emps.filter(e => e.deptId === d.id).length, color: d.color, text: emps.filter(e => e.deptId === d.id).length + ' people' })).filter(x => x.value).sort((a, b) => b.value - a.value))}</div></div>
            <div class="card"><div class="card-h"><h3>Project hours by task</h3></div><div class="card-b">${UI.barChart(U.uniq(ts.map(t => t.task)).map((k, i) => ({ label: k, value: U.sum(ts.filter(t => t.task === k), t => t.hours), color: U.color(i), text: U.sum(ts.filter(t => t.task === k), t => t.hours) + 'h' })).sort((a, b) => b.value - a.value))}</div></div>
          </div>
          <div class="card"><div class="card-h"><h3>Team utilisation</h3></div><div class="table-wrap"><table class="tbl compact"><thead><tr><th>Employee</th><th>Department</th><th>Tasks open</th><th class="num">Hours (14d)</th><th>Utilisation</th></tr></thead><tbody>
            ${emps.slice(0, 12).map(e => {
            const mine = ts.filter(t => t.employeeId === e.id);
            const hrs = U.sum(mine, t => t.hours);
            const util = U.clamp(Math.round((hrs / 80) * 100), 0, 130);
            return `<tr><td><div class="row gap6">${UI.av(e.name)}<span class="tiny">${U.esc(e.name)}</span></div></td><td class="tiny">${U.esc((S.dept(e.deptId) || {}).name || '')}</td>
              <td class="num">${S.db.tasks.filter(t => t.assigneeId === e.id && t.status !== 'Done').length}</td><td class="num">${hrs}</td>
              <td style="min-width:120px"><div class="row gap6">${UI.bar(util, util > 100 ? 'red' : util > 60 ? 'green' : '')}<b class="tiny">${util}%</b></div></td></tr>`;
          }).join('')}
          </tbody></table></div></div>`;
        }

        if (t === 'custom') {
          host.innerHTML = `<div class="grid g3">${[
            ['CEO cockpit', 'Contract value, cash, margin, risk by project', 'wallet'],
            ['Project health board', 'Progress vs cost vs schedule heatmap', 'activity'],
            ['Procurement savings', 'Rate contract vs market comparison', 'cart'],
            ['Vendor performance', 'On-time, quality, disputes, spend', 'truck'],
            ['Client profitability', 'Margin by client across projects', 'users'],
            ['DPR compliance', 'Sites reporting daily, avg delay', 'camera'],
            ['Snag ageing', 'Open snags by age bucket and trade', 'alert'],
            ['Payroll cost ratio', 'Salary vs revenue by month', 'bank'],
            ['Safety index', 'Incidents, near-miss, training coverage', 'shield']
          ].map(x => `<div class="card"><div class="card-h"><h3>${x[0]}</h3>${icon(x[2], 15)}</div><div class="card-b"><p class="tiny muted">${x[1]}</p>
            <button class="btn sm mt12" data-blank>Open dashboard</button></div></div>`).join('')}
            <div class="card" style="border-style:dashed"><div class="card-b center" style="padding:26px"><div class="icon" style="width:44px;height:44px;border-radius:12px;background:var(--brand-50);color:var(--brand);display:grid;place-items:center;margin:0 auto 10px">${icon('plus', 18)}</div>
            <b class="sm">Build custom dashboard</b><p class="tiny muted mt4">Pick metrics, group by project / trade / month and save.</p></div></div>
          </div>`;
          $$('[data-blank]', host).forEach(b => b.onclick = () => UI.toast('Dashboard opened in builder (demo)', 'info'));
        }
      };
      draw(MK._anatab);
      U.wireTabs(view, draw);
      $('[data-csv]', view).onclick = () => { U.csv('analytics-projects', S.db.projects.map(p => ({ Code: p.code, Name: p.name, Client: p.client, Contract: p.contractValue, Budget: p.budget, Spent: p.spent, Billed: p.billed, Received: p.received, Progress: p.progress, Margin: p.margin, Health: p.health }))); UI.toast('Analytics data exported', 'ok'); };
      $('[data-print]', view).onclick = () => window.print();
      $('[data-sched]', view).onclick = () => UI.modal({
        title: 'Subscribe to MIS', sub: 'Automated packs to your inbox and WhatsApp',
        body: `<div class="col gap10"><div class="field"><label>Frequency</label><select class="input" data-f><option>Daily (7:00 AM)</option><option>Weekly (Monday 8:00 AM)</option><option>Monthly (1st, 8:00 AM)</option></select></div>
          <div class="field"><label>Recipients</label><input class="input" data-r value="leadership@managekaro.com, pm.group@managekaro.com"></div>
          <div class="field"><label>Include</label><div class="col gap6 mt4">${['Portfolio KPIs', 'Project health', 'Cash & receivables', 'Snags & quality', 'People & payroll'].map(x => `<label class="check"><input type="checkbox" checked>${x}</label>`).join('')}</div></div></div>`,
        okText: 'Schedule reports', onOk() { UI.toast('MIS subscription created', 'ok'); }
      });
    }
  });

  /* ============================== COPILOT ============================== */
  const QA = [
    {
      match: /margin|profit|leak|cost overrun/i,
      ask: ['Which projects are bleeding margin?', 'Show margin leakage'],
      answer() {
        const leak = S.db.boq.filter(b => b.variance > 0);
        const worst = S.db.projects.map(p => { const st = S.projectStats(p.id); return { p, m: U.round(U.pct(p.contractValue + st.coValue - p.spent, p.contractValue + st.coValue), 1), st }; }).sort((a, b) => a.m - b.m);
        return {
          text: `Across ${S.db.projects.length} projects the portfolio margin is <b>${S.metrics().grossMargin}%</b>. <b>${leak.length}</b> BOQ lines are ordered above budget rate, leaking <b>${U.cur(U.sum(leak, b => b.variance))}</b>. The three weakest projects are ${worst.slice(0, 3).map(w => `<b>${w.p.code}</b> (${w.m}%)`).join(', ')}.`,
          table: { head: ['Project', 'Revised value', 'Actual cost', 'Margin'], rows: worst.slice(0, 5).map(w => [w.p.code + ' · ' + w.p.name.split('—')[0], U.cur(w.p.contractValue + w.st.coValue), U.cur(w.p.spent), w.m + '%']) },
          actions: ['Open Cost & Margin', 'Export leakage list'],
          hint: 'Biggest single leak: carpet tile ordered ₹12/sf above budget on MK-1024. Renegotiating 3 lines could recover ~₹4.8 L.'
        };
      }
    },
    {
      match: /delay|late|slipp|schedule|handover|time/i,
      ask: ['Which projects will miss handover?', 'Show slipping activities'],
      answer() {
        const acts = S.db.activities.filter(a => a.late);
        const projs = U.uniq(acts.map(a => a.projectId)).map(id => S.project(id)).filter(Boolean);
        return {
          text: `<b>${acts.length}</b> activities are behind baseline across <b>${projs.length}</b> projects. Most exposed: ${projs.slice(0, 3).map(p => `<b>${p.code}</b> (${p.progress}% done, handover ${U.fmtD(p.end)})`).join(', ')}.`,
          table: { head: ['Activity', 'Project', 'Progress', 'Slack'], rows: acts.slice(0, 6).map(a => [a.name, S.projName(a.projectId).split('—')[0], a.progress + '%', a.slack + ' d']) },
          actions: ['Open Schedule', 'Message PMs'],
          hint: 'Two root causes dominate the delay register: client approvals on finishes and late HVAC duct delivery. Escalating both recovers ~9 days.'
        };
      }
    },
    {
      match: /receivable|collect|outstanding|cash|payment|dso/i,
      ask: ['How much is outstanding from clients?', 'Show cash position'],
      answer() {
        const rec = S.db.clientInvoices.filter(c => c.status !== 'Paid');
        const over = rec.filter(c => c.aging > 30);
        return {
          text: `Receivable stands at <b>${U.cur(S.metrics().receivable)}</b> across <b>${rec.length}</b> invoices; <b>${U.cur(U.sum(over, c => c.total - c.received))}</b> is older than 30 days. Payables are <b>${U.cur(S.metrics().payable)}</b>, so net working capital gap is <b>${U.cur(S.metrics().receivable - S.metrics().payable)}</b>.`,
          table: { head: ['Client', 'Invoice', 'Outstanding', 'Ageing'], rows: rec.slice(0, 6).map(c => [c.client, c.code, U.cur(c.total - c.received), c.aging + ' d']) },
          actions: ['Open Receivables', 'Draft reminder emails'],
          hint: 'Collections improve fastest by chasing the top 5 invoices — they represent 68% of overdue value.'
        };
      }
    },
    {
      match: /snag|quality|ncr|defect/i,
      ask: ['How many snags are open?', 'Which trades have most defects?'],
      answer() {
        const open = S.db.snags.filter(s => s.status !== 'Closed');
        const byTrade = U.uniq(open.map(s => s.trade)).map(t => ({ t, n: open.filter(s => s.trade === t).length })).sort((a, b) => b.n - a.n);
        return {
          text: `<b>${open.length}</b> snags are open, of which <b>${open.filter(s => s.priority === 'Critical').length}</b> are critical and <b>${open.filter(s => U.diff(s.dueDate, U.today()) < 0).length}</b> are past their committed closure date. Top trades: ${byTrade.slice(0, 3).map(x => `<b>${x.t}</b> (${x.n})`).join(', ')}.`,
          table: { head: ['Trade', 'Open', 'Avg age'], rows: byTrade.slice(0, 6).map(x => [x.t, x.n, Math.round(U.avg(open.filter(s => s.trade === x.t), s => U.diff(U.today(), s.raisedOn))) + ' d']) },
          actions: ['Open Snags', 'Assign to vendors'],
          hint: 'Painting and carpentry account for 46% of open snags — a single snagging blitz week would close most of them.'
        };
      }
    },
    {
      match: /vendor|procure|po\b|purchase|grn|supplier/i,
      ask: ['Which vendor is delaying us?', 'Show off-BOQ purchases'],
      answer() {
        const low = S.db.vendors.slice().sort((a, b) => a.onTime - b.onTime).slice(0, 3);
        const off = S.db.pos.filter(p => !p.budgeted);
        return {
          text: `Vendor reliability range is ${low[2] ? low[2].onTime : 70}–${S.db.vendors.slice().sort((a, b) => b.onTime - a.onTime)[0].onTime}% on-time. Weakest: ${low.map(v => `<b>${v.name}</b> (${v.onTime}%)`).join(', ')}. <b>${off.length}</b> POs are not linked to BOQ — margin reporting on those is approximate.`,
          table: { head: ['Vendor', 'Category', 'On-time', 'Rating'], rows: low.map(v => [v.name, v.category, v.onTime + '%', '★ ' + v.rating]) },
          actions: ['Open Procurement', 'Review rate contracts'],
          hint: 'Cool Air Systems has slipped 3 of 4 deliveries. Consider invoking the LD clause in RC-104 and adding a backup VRV vendor.'
        };
      }
    },
    {
      match: /payroll|salary|attendance|leave|headcount|employee|hr/i,
      ask: ['What is this month payroll cost?', 'Who is on leave today?'],
      answer() {
        const month = U.lastMonths(1)[0].key;
        const pay = S.db.payroll.filter(p => p.month === month);
        const onLeave = S.db.leaves.filter(l => l.status === 'Approved' && l.from <= U.iso(U.today()) && l.to >= U.iso(U.today()));
        return {
          text: `Payroll for <b>${U.fmtM(U.today())}</b> is <b>${U.cur(U.sum(pay, p => p.net))}</b> net across <b>${pay.length}</b> employees. Statutory outflow is ${U.cur(U.sum(pay, p => p.pf + p.esi + p.pt + p.tds))}. <b>${onLeave.length}</b> people are on approved leave today; attrition is tracking at 8.4%.`,
          table: { head: ['Department', 'Headcount', 'Net payroll'], rows: S.db.departments.slice(0, 6).map(d => [d.name, S.db.employees.filter(e => e.deptId === d.id).length, U.cur(U.sum(pay.filter(p => p.deptId === d.id), p => p.net))]) },
          actions: ['Open Payroll', 'View attendance'],
          hint: 'Overtime is concentrated in Site Operations — 62% of OT pay. Rota rebalancing would cut ~₹1.4 L/month.'
        };
      }
    },
    {
      match: /lead|crm|pipeline|sale|quotation|convert/i,
      ask: ['What is my pipeline value?', 'Which leads need follow-up?'],
      answer() {
        const open = S.db.leads.filter(l => l.stage !== 'Won');
        const due = open.filter(l => U.diff(l.nextFollowup, U.today()) <= 0);
        return {
          text: `Weighted pipeline is <b>${U.cur(S.metrics().pipeline)}</b> across <b>${open.length}</b> live leads; won value this FY is <b>${U.cur(S.metrics().wonValue)}</b>. <b>${due.length}</b> leads have a follow-up due today or earlier.`,
          table: { head: ['Company', 'Stage', 'Value', 'Prob.'], rows: open.sort((a, b) => b.value * b.probability - a.value * a.probability).slice(0, 6).map(l => [l.company, l.stage, U.cur(l.value), l.probability + '%']) },
          actions: ['Open CRM', 'Log site visit'],
          hint: 'Two retail deals worth ₹4.2 Cr sit in Negotiation. Sending revised quotations with a 3-week validity usually converts 40% of these.'
        };
      }
    },
    {
      match: /boq|bill of quantities|scope|variation|change order/i,
      ask: ['Show BOQ status for my projects', 'Which change orders are pending?'],
      answer() {
        const pending = S.db.changeOrders.filter(c => c.status === 'Pending');
        const boq = S.db.boq;
        return {
          text: `BOQ across live projects is <b>${U.cur(U.sum(boq, b => b.amount))}</b> with <b>${U.cur(U.sum(boq, b => b.executedQty * b.rate))}</b> executed. <b>${pending.length}</b> change orders worth <b>${U.cur(U.sum(pending, c => c.amount))}</b> await client approval, and ${boq.filter(b => !b.clientConfirmed).length} BOQ lines are not yet client-confirmed.`,
          table: { head: ['Change order', 'Project', 'Amount', 'Impact'], rows: pending.slice(0, 6).map(c => [c.code + ' · ' + c.title.slice(0, 34), S.projName(c.projectId).split('—')[0], U.cur(c.amount), c.impactDays + ' d']) },
          actions: ['Open Projects', 'Chase client approvals'],
          hint: 'Unconfirmed BOQ lines are the biggest billing risk — 214 lines have no client sign-off. A single transmittal can clear them.'
        };
      }
    }
  ];

  function answerFor(q) {
    for (const a of QA) if (a.match.test(q)) return a.answer();
    const m = S.metrics();
    return {
      text: `Here is the current portfolio position: <b>${m.live}</b> live projects worth <b>${U.cur(m.liveValue)}</b>, weighted progress <b>${m.progress}%</b>, collected <b>${U.cur(m.received)}</b> against <b>${U.cur(m.billed)}</b> billed. <b>${m.openSnags}</b> snags are open and <b>${m.pendingApprovals}</b> approvals are waiting.`,
      table: { head: ['Metric', 'Value'], rows: [['Contract value', U.cur(m.cv)], ['Collected', U.cur(m.received)], ['Receivable', U.cur(m.receivable)], ['Payable', U.cur(m.payable)], ['Gross margin', m.grossMargin + '%'], ['Headcount', m.headcount]] },
      actions: ['Open Command Centre', 'Show project health'],
      hint: 'Try asking about margin, delays, receivables, snags, vendors, payroll or pipeline for a focused answer.'
    };
  }

  MK.route('/copilot', {
    title: 'AI Copilot', crumb: () => [{ label: 'AI Copilot' }],
    render() {
      return UI.pageHead('AI Copilot', 'Ask anything about your projects, commercials, people or vendors — grounded in Managekaro data',
        `<button class="btn" data-clear>${icon('refresh', 14)} New chat</button><button class="btn primary" data-csv>${icon('download', 14)} Export chat</button>`)
        + `<div class="grid g23">
          <div class="card" style="display:flex;flex-direction:column;min-height:600px">
            <div class="card-h"><h3>${icon('sparkles', 15)} Copilot</h3><span class="live">GROUNDED ON YOUR DATA</span></div>
            <div class="card-b" data-chat style="flex:1;overflow-y:auto;max-height:520px;display:flex;flex-direction:column;gap:14px"></div>
            <div style="border-top:1px solid var(--line-2);padding:12px 14px">
              <div class="row gap8 wrap mb8" data-suggest>${QA.slice(0, 4).map(q => `<button class="chip" data-q="${U.attr(q.ask[0])}">${U.esc(q.ask[0])}</button>`).join('')}</div>
              <form class="row gap8" data-form><input class="input grow" data-in placeholder="Ask: which projects will miss handover?"><button class="btn primary" type="submit">${icon('send', 14)} Ask</button></form>
            </div>
          </div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>What I can read</h3></div><div class="card-b tight">
              ${[['building', 'Projects & BOQ', 'Scope, quantity, executed value, margin'], ['cart', 'Procurement', 'PR, PO, GRN, vendor scorecards'], ['wallet', 'Finance', 'Invoices, receipts, payables, cashflow'], ['calendar', 'Schedule', 'Activities, baseline, slack, delays'], ['alert', 'Quality', 'Snags, RFIs, NCRs, closure velocity'], ['users', 'People', 'Attendance, payroll, leave, utilisation'], ['target', 'CRM', 'Leads, quotations, conversion']].map(x => `<div class="feed"><span class="av c2">${icon(x[0], 11)}</span><div class="grow"><div class="txt">${x[1]}</div><div class="meta">${x[2]}</div></div></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Proactive alerts</h3></div><div class="card-b tight">
              ${[
            ['bad', 'Cash risk', U.cur(S.metrics().overdueRec) + ' overdue beyond 30 days'],
            ['warn', 'Schedule risk', S.db.activities.filter(a => a.late).length + ' activities behind baseline'],
            ['info', 'Approvals', S.metrics().pendingApprovals + ' awaiting your action'],
            ['ok', 'Data health', 'All masters up to date']
          ].map(a => `<div class="feed"><span class="av c${a[0] === 'bad' ? '5' : a[0] === 'warn' ? '6' : '2'}">${icon('alert', 11)}</span><div class="grow"><div class="txt">${a[1]}</div><div class="meta">${a[2]}</div></div></div>`).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const chat = $('[data-chat]', view);
      MK._chat = MK._chat || [
        { role: 'bot', text: `Hi ${S.me().name.split(' ')[0]} — I have read <b>${S.db.projects.length} projects</b>, <b>${S.db.pos.length} purchase orders</b>, <b>${S.db.invoices.length} invoices</b> and <b>${S.db.snags.length} snags</b>. Ask me about margin, delays, cash, vendors, BOQ or people.`, table: null, hint: null }
      ];
      function push(m) { MK._chat.push(m); paint(); }
      function paint() {
        chat.innerHTML = MK._chat.map(m => m.role === 'user'
          ? `<div class="row gap8" style="justify-content:flex-end"><div style="background:var(--ink);color:#fff;border-radius:12px 12px 2px 12px;padding:9px 13px;max-width:78%;font-size:13px">${U.esc(m.text)}</div>${UI.av(S.me().name)}</div>`
          : `<div class="row gap8" style="align-items:flex-start"><span class="av c1" style="background:linear-gradient(135deg,#FF8A3D,#F2540B);color:#fff">${icon('sparkles', 12)}</span>
              <div style="max-width:86%"><div style="background:#F7F8FC;border:1px solid var(--line);border-radius:2px 12px 12px 12px;padding:10px 13px;font-size:13px;line-height:1.6">${m.text}
              ${m.table ? `<table class="tbl compact mt8" style="background:#fff"><thead><tr>${m.table.head.map(h => `<th>${U.esc(h)}</th>`).join('')}</tr></thead><tbody>${m.table.rows.map(r => `<tr>${r.map((c, i) => `<td class="${i > 0 ? 'num' : ''}">${U.esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
              ${m.hint ? `<div class="note info mt8" style="font-size:11.6px">${icon('zap', 11)} ${m.hint}</div>` : ''}</div>
              ${m.actions ? `<div class="row gap6 mt8 wrap">${m.actions.map(a => `<button class="btn sm" data-act="${U.attr(a)}">${U.esc(a)}</button>`).join('')}<span class="tiny muted" style="align-self:center">Sources: ${S.db.projects.length} projects · ${S.db.pos.length} POs</span></div>` : ''}
              </div></div>`).join('');
        chat.scrollTop = chat.scrollHeight;
      }
      paint();
      const ask = (q) => {
        push({ role: 'user', text: q });
        setTimeout(() => {
          const a = answerFor(q);
          push({ role: 'bot', text: a.text, table: a.table, hint: a.hint, actions: a.actions });
        }, 380);
      };
      $('[data-form]', view).addEventListener('submit', (e) => { e.preventDefault(); const i = $('[data-in]', view); if (!i.value.trim()) return; ask(i.value.trim()); i.value = ''; });
      $('[data-suggest]', view).addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) ask(b.getAttribute('data-q')); });
      chat.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const a = b.getAttribute('data-act');
        if (/cost|margin/i.test(a)) MK.go('/costing');
        else if (/schedule|delay/i.test(a)) MK.go('/schedule');
        else if (/receivable|payment/i.test(a)) MK.go('/finance');
        else if (/snag/i.test(a)) MK.go('/snags');
        else if (/procure|vendor|rate/i.test(a)) MK.go('/procurement');
        else if (/payroll|attendance/i.test(a)) MK.go('/hrm/payroll');
        else if (/crm|visit/i.test(a)) MK.go('/crm');
        else if (/project/i.test(a)) MK.go('/projects');
        else if (/export/i.test(a)) { U.csv('copilot-data', S.db.projects); UI.toast('Data exported', 'ok'); }
        else UI.toast(a + ' — queued', 'info');
      });
      $('[data-clear]', view).onclick = () => { MK._chat = [{ role: 'bot', text: 'New conversation started. What would you like to review?', table: null }]; paint(); };
      $('[data-csv]', view).onclick = () => { U.download('managekaro-copilot-chat.txt', MK._chat.map(m => (m.role === 'user' ? 'You: ' : 'Copilot: ') + m.text.replace(/<[^>]+>/g, '')).join('\n\n')); UI.toast('Chat exported', 'ok'); };
    }
  });

  /* ============================== AGENTS =============================== */
  MK.route('/agents', {
    title: 'AI Agents', crumb: () => [{ label: 'AI Agents' }],
    render() {
      const m = S.metrics();
      const risks = [
        ...S.db.projects.filter(p => ['At Risk', 'Critical'].includes(p.health)).slice(0, 3).map(p => ({
          level: p.health === 'Critical' ? 'bad' : 'warn', title: p.code + ' · ' + p.name.split('—')[0].trim(),
          body: `Progress ${p.progress}% with ${U.pct(p.spent, p.budget)}% budget burn. ${p.health === 'Critical' ? 'Two critical paths blocked.' : 'Schedule variance -6%.'}`,
          action: 'Open project', link: '/projects/' + p.id
        })),
        ...S.db.invoices.filter(i => !i.threeWayMatch).slice(0, 3).map(i => ({ level: 'warn', title: 'Match exception · ' + i.code, body: `${i.vendor} invoice of ${U.cur(i.total)} does not match PO + GRN. Payment on hold.`, action: 'Review', link: '/finance' })),
        ...S.db.clientInvoices.filter(c => c.aging > 30).slice(0, 3).map(c => ({ level: 'bad', title: 'Overdue receivable · ' + c.code, body: `${c.client} — ${U.cur(c.total - c.received)} overdue by ${c.aging} days.`, action: 'Chase', link: '/finance' }))
      ];
      return UI.pageHead('AI agents', 'Background agents that watch delivery, cost and reconciliation for you',
        `<button class="btn" data-run>${icon('play', 14)} Run all agents</button><button class="btn primary" data-config>${icon('sliders', 14)} Configure</button>`)
        + `<div class="grid g3 mb16">
          ${[['activity', 'Analytics Agent', 'Builds daily MIS, trend analysis and anomaly alerts.', 'Running', S.db.projects.length + ' projects scanned'],
          ['alert', 'Risk Agent', 'Follows up on delays, escalates slippage, flags cost overrun.', 'Running', risks.length + ' risks found'],
          ['checksq', 'Reconciliation Agent', 'Cross-checks invoice vs PO vs GRN vs progress.', 'Running', S.db.invoices.filter(i => !i.threeWayMatch).length + ' exceptions'],
          ['calc', 'Costing Agent', 'Auto-quantifies BOQ from drawings, benchmarks rates.', 'Beta', 'Rate library 2,140 items'],
          ['message', 'Follow-up Agent', 'Nudges owners on pending tasks, approvals and DPRs.', 'Running', S.metrics().pendingApprovals + ' nudges queued'],
          ['shield', 'Compliance Agent', 'Tracks GST, TDS, PF, ESI and labour licence due dates.', 'Running', S.db.compliance.filter(c => c.status !== 'Filed').length + ' open filings']]
          .map(a => `<div class="card"><div class="card-h"><h3>${a[1]}</h3><span class="badge ${a[3] === 'Beta' ? 'purple' : 'ok'}">${a[3]}</span></div>
            <div class="card-b"><div class="row gap10 mb8"><span class="av c1">${icon(a[0], 14)}</span><div class="tiny muted">${a[2]}</div></div>
            <div class="tiny"><b>${a[4]}</b></div>
            <div class="row gap6 mt12"><button class="btn sm" data-agent="${a[1]}">View log</button><button class="btn sm">Pause</button></div></div></div>`).join('')}
        </div>
        <div class="grid g23">
          <div class="card"><div class="card-h"><h3>Risk register (live)</h3><span class="badge bad">${risks.length} open</span></div>
            <div class="card-b tight">
              ${risks.map(r => `<div class="feed"><span class="av c${r.level === 'bad' ? '5' : '6'}">${icon('alert', 11)}</span><div class="grow"><div class="txt"><b>${U.esc(r.title)}</b></div><div class="meta">${U.esc(r.body)}</div></div>
                <a class="btn sm" href="#${r.link}">${r.action}</a></div>`).join('')}
            </div></div>
          <div class="card"><div class="card-h"><h3>Agent activity</h3><span class="live">LIVE</span></div>
            <div class="card-b tight" style="max-height:420px;overflow:auto">
              ${[
            ['Risk Agent', 'Escalated 2 slipping activities on MK-1028 to PM', '12 min ago', 'warn'],
            ['Reconciliation Agent', 'Held VINV-0032 — GRN short by 40 sqft', '38 min ago', 'bad'],
            ['Analytics Agent', 'Generated Monday MIS pack (18 pages)', '2 hours ago', 'ok'],
            ['Follow-up Agent', 'Reminded 6 owners about pending DPRs', '3 hours ago', 'info'],
            ['Compliance Agent', 'PF ECR due in 4 days', '5 hours ago', 'warn'],
            ['Costing Agent', 'Benchmarked 12 BOQ rates against rate library', 'Yesterday', 'ok'],
            ['Risk Agent', 'Flagged vendor Cool Air Systems — 3rd late delivery', 'Yesterday', 'bad'],
            ['Reconciliation Agent', 'Cleared 14 of 17 invoice exceptions', '2 days ago', 'ok']
          ].map(a => `<div class="feed"><span class="av c${a[3] === 'bad' ? '5' : a[3] === 'warn' ? '6' : a[3] === 'ok' ? '3' : '2'}">${icon('cpu', 11)}</span><div class="grow"><div class="txt"><b>${a[0]}</b></div><div class="meta">${U.esc(a[1])} · ${a[2]}</div></div></div>`).join('')}
            </div></div>
        </div>`;
    },
    mount(view) {
      $('[data-run]', view).onclick = () => { UI.toast('All agents executed — 6 new findings', 'ok'); S.log('ai', 'ran agents', 'manual run'); };
      $('[data-config]', view).onclick = () => UI.modal({
        title: 'Configure agents', sub: 'Choose what each agent watches and who gets alerted',
        body: `<div class="col gap10">${['Risk Agent', 'Reconciliation Agent', 'Follow-up Agent', 'Compliance Agent'].map(a => `<div class="row-between" style="padding:8px;border:1px solid var(--line);border-radius:9px"><div><b class="sm">${a}</b><div class="tiny muted">Notify: PM + Finance Head · daily 08:00</div></div><button class="switch on" data-sw></button></div>`).join('')}</div>
          <div class="note info mt12">Agents never approve or pay anything on their own — they raise findings and route them to a human approver.</div>`,
        okText: 'Save configuration', onOk() { UI.toast('Agent configuration saved', 'ok'); }
      });
      $$('[data-agent]', view).forEach(b => b.onclick = () => UI.drawer({
        title: b.getAttribute('data-agent') + ' — log', sub: 'Last 7 days',
        body: `<div class="tl">${[['Portfolio scan completed', '18 projects · 0 errors', 'Today 08:00'], ['Raised 3 findings', '2 slippage, 1 cost overrun', 'Today 08:02'], ['Notified PMs', 'WhatsApp + in-app', 'Today 08:03'], ['Exception cleared', 'GRN-0042 reconciled', 'Yesterday'], ['Rule updated', 'Threshold for delay = 5 days', '2 days ago']].map((l, i) => `<div class="tl-item ${i < 3 ? 'done' : ''}"><div class="t">${l[0]}</div><div class="m">${l[1]} · ${l[2]}</div></div>`).join('')}</div>`,
        footer: '<button class="btn" data-x>Close</button><button class="btn primary" data-x>Run now</button>'
      }));
    }
  });
})(window.MK);
