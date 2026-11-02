/* Managekaro — Command Centre, My Work, Approvals */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* =========================== COMMAND CENTRE =========================== */
  MK.route('/dashboard', {
    title: 'Command Centre', crumb: () => [{ label: 'Command Centre' }],
    render() {
      const m = S.metrics(), db = S.db;
      const me = S.me();
      const months = U.lastMonths(6);
      const planned = [12, 24, 36, 47, 58, 68], actual = [10, 21, 33, 43, 52, 61];
      const cash = db.cashflow;
      const health = ['On Track', 'At Risk', 'Critical', 'Closed'].map((h, i) => ({ label: h, value: db.projects.filter(p => p.health === h).length, color: ['#0E9F6E', '#D97706', '#DC2626', '#94A3B8'][i] }));
      const live = db.projects.filter(p => ['In Progress', 'Snagging'].includes(p.status)).slice().sort((a, b) => b.contractValue - a.contractValue);
      const myTasks = db.tasks.filter(t => t.status !== 'Done').slice(0, 6);
      const pend = db.approvals.filter(a => a.status === 'Pending').slice(0, 5);
      const atRiskActs = db.activities.filter(a => a.late && db.projects.find(p => p.id === a.projectId && p.status !== 'Completed')).slice(0, 5);
      const topSnags = db.snags.filter(s => s.status !== 'Closed' && s.priority === 'Critical').slice(0, 4);

      return UI.pageHead('Good to see you, ' + me.name.split(' ')[0],
        `${U.fyLabel(U.today())} · ${m.live} live projects · ${U.cur(m.liveValue)} in execution · ${db.units.filter(u => u.active).length} active units`,
        `<button class="btn" data-export>${icon('download', 14)} Export MIS</button>
         <a class="btn" href="#/analytics">${icon('chart', 14)} Analytics</a>
         <a class="btn primary" href="#/copilot">${icon('sparkles', 14)} Ask Copilot</a>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Contract value', value: U.cur(m.cv), icon: 'wallet', foot: `Budget ${U.cur(m.budget)}`, trend: { text: 'Gross margin ' + m.grossMargin + '%', dir: 'up' } })}
          ${UI.kpi({ label: 'Collected', value: U.cur(m.received), icon: 'bank', foot: `Billed ${U.cur(m.billed)} · ${m.collectionPct}%`, trend: { text: U.cur(m.receivable) + ' receivable', dir: 'flat' } })}
          ${UI.kpi({ label: 'Projected profit', value: U.cur(m.cv - m.budget), icon: 'trend', foot: `Burn ${m.burnPct}% of budget`, trend: { text: m.actualMargin + '% realised', dir: 'up' } })}
          ${UI.kpi({ label: 'At-risk projects', value: m.atRisk, unit: 'of ' + m.live, icon: 'alert', foot: `${m.openSnags} open snags · ${m.criticalSnags} critical`, trend: { text: 'needs review', dir: 'down' } })}
        </div>

        <div class="grid g5 mb14">
          ${UI.kpi({ label: 'Payables', value: U.cur(m.payable), icon: 'receipt', foot: db.invoices.filter(i => i.status !== 'Paid').length + ' open invoices' })}
          ${UI.kpi({ label: 'Overdue receivable', value: U.cur(m.overdueRec), icon: 'clock', foot: db.clientInvoices.filter(i => i.status === 'Overdue').length + ' invoices overdue' })}
          ${UI.kpi({ label: 'Headcount', value: m.headcount, icon: 'users', foot: m.onNotice + ' on notice · ' + db.leads.length + ' leads live' })}
          ${UI.kpi({ label: 'Pipeline', value: U.cur(m.pipeline), icon: 'target', foot: 'Won ' + U.cur(m.wonValue) + ' this FY' })}
          ${UI.kpi({ label: 'Approvals waiting', value: m.pendingApprovals, icon: 'inbox', foot: 'Avg TAT 1.8 days' })}
        </div>

        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Planned vs actual portfolio progress</h3>
            <div class="legend"><span><i style="background:#5B7099"></i>Planned</span><span><i style="background:#F2540B"></i>Actual</span><span><i style="background:#0E9F6E"></i>Collected</span></div></div>
            <div class="card-b">${UI.lineChart([
        { name: 'Planned', data: planned.map(v => v * m.liveValue / 100), color: '#5B7099', fill: false },
        { name: 'Actual', data: actual.map(v => v * m.liveValue / 100), color: '#F2540B' },
        { name: 'Collected', data: cash.map(c => c.collections), color: '#0E9F6E', fill: false }
      ], months.map(x => x.label), { height: 232 })}
            <div class="row-between mt12 tiny muted"><span>Weighted by contract value across live projects</span><span class="live">LIVE DATA</span></div></div></div>

          <div class="card"><div class="card-h"><h3>Portfolio health</h3><a class="tiny" href="#/projects" style="color:var(--brand);font-weight:700">All projects</a></div>
            <div class="card-b">${UI.donut(health, { center: m.live + '', centerSub: 'live', size: 140 })}
              <hr class="hr">
              <div class="stat-line"><span class="muted">Weighted progress</span><b>${m.progress}%</b></div>
              <div class="stat-line"><span class="muted">Budget burn</span><b style="color:${m.burnPct > 95 ? 'var(--bad)' : 'var(--tx)'}">${m.burnPct}%</b></div>
              <div class="stat-line"><span class="muted">Collection</span><b>${m.collectionPct}%</b></div>
              <div class="stat-line"><span class="muted">Open snags</span><b>${m.openSnags}</b></div>
            </div></div>
        </div>

        <div class="card mb14"><div class="card-h"><h3>Live project portfolio</h3>
          <div class="row gap6"><span class="tag">${live.length} projects</span><a class="btn sm" href="#/projects">Open projects ${icon('arrowRight', 12)}</a></div></div>
          <div class="table-wrap"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>PM</th><th>Progress</th><th class="num">Contract</th><th class="num">Collected</th><th class="num">Margin</th><th>Health</th><th>Due</th><th></th></tr></thead><tbody>
          ${live.map(p => `<tr class="clickable" data-p="${p.id}">
            <td><div class="cell-strong trunc" style="max-width:230px">${U.esc(p.name)}</div><span class="sub mono">${p.code} · ${p.type}</span></td>
            <td class="trunc" style="max-width:150px">${U.esc(p.client)}</td>
            <td><div class="row gap6">${UI.av(p.pm)}<span class="trunc" style="max-width:90px">${U.esc(p.pm.split(' ')[0])}</span></div></td>
            <td style="min-width:112px"><div class="row gap6">${UI.bar(p.progress, p.progress >= 100 ? 'green' : '')}<b class="tiny">${p.progress}%</b></div></td>
            <td class="num">${U.cur(p.contractValue)}</td>
            <td class="num">${U.cur(p.received)}</td>
            <td class="num" style="color:${p.margin < 15 ? 'var(--bad)' : 'var(--ok)'};font-weight:650">${p.margin}%</td>
            <td>${UI.pill(p.health)}</td>
            <td class="tiny">${U.fmtD(p.end)}<span class="sub ${U.dueCls(p.end) === 'bad' ? 'muted' : ''}">${U.inDays(U.diff(p.end, U.today()))}</span></td>
            <td>${icon('chevronRight', 13)}</td></tr>`).join('')}
          </tbody></table></div></div>

        <div class="grid g3 mb14">
          <div class="card"><div class="card-h"><h3>Pending approvals</h3><a class="tiny" href="#/approvals" style="color:var(--brand);font-weight:700">${pend.length} to review</a></div>
            <div class="card-b tight">${pend.map(a => `<div class="feed"><span class="av c5">${icon('inbox', 12)}</span><div class="grow"><div class="txt"><b>${U.esc(a.type)}</b> · ${U.esc(a.ref)}</div><div class="meta">${U.cur(a.amount)} · L${a.level}/${a.levels} · ${U.ago(a.requestedOn)}</div></div>${UI.pill(a.status)}</div>`).join('') || UI.empty('Clean inbox', 'No approvals waiting.')}</div>
            <div class="card-b" style="border-top:1px solid var(--line-2);padding:10px 14px"><a class="btn sm block" href="#/approvals">Open approvals inbox</a></div></div>

          <div class="card"><div class="card-h"><h3>Schedule slippage</h3><span class="badge bad">${atRiskActs.length} flagged</span></div>
            <div class="card-b tight">${atRiskActs.map(a => { const p = S.project(a.projectId); return `<div class="feed"><span class="av c1">${U.initials(a.trade)}</span><div class="grow"><div class="txt"><b>${U.esc(a.name)}</b></div><div class="meta">${U.esc(p ? p.code : '')} · ${a.progress}% done · slipping ${Math.abs(a.slack)}d</div></div><a class="tiny" href="#/schedule?p=${a.projectId}" style="color:var(--brand);font-weight:700">Fix</a></div>`; }).join('') || UI.empty('On schedule', 'No activity is behind baseline.')}</div>
            <div class="card-b" style="border-top:1px solid var(--line-2);padding:10px 14px"><a class="btn sm block" href="#/schedule">Open schedule</a></div></div>

          <div class="card"><div class="card-h"><h3>My work</h3><a class="tiny" href="#/my-work" style="color:var(--brand);font-weight:700">All (${db.tasks.filter(t => t.status !== 'Done').length})</a></div>
            <div class="card-b tight">${myTasks.map(t => { const p = S.project(t.projectId); return `<div class="feed"><span class="dotc" style="background:${t.priority === 'Critical' ? '#DC2626' : t.priority === 'High' ? '#D97706' : '#94A3B8'};margin-top:5px"></span><div class="grow"><div class="txt trunc">${U.esc(t.title)}</div><div class="meta">${U.esc(p ? p.code : '')} · due ${U.fmtD(t.due)} <span class="badge ${U.dueCls(t.due)}" style="font-size:9.5px">${U.inDays(U.diff(t.due, U.today()))}</span></div></div></div>`; }).join('')}</div>
            <div class="card-b" style="border-top:1px solid var(--line-2);padding:10px 14px"><a class="btn sm block" href="#/my-work">Open my work</a></div></div>
        </div>

        <div class="grid g23">
          <div class="card"><div class="card-h"><h3>Cash position &amp; forecast</h3>
            <div class="btn-group" data-cash><button class="on" data-k="inflow">Inflow</button><button data-k="outflow">Outflow</button><button data-k="collections">Collections</button></div></div>
            <div class="card-b">${UI.lineChart([{ name: 'Cash', data: cash.map(c => c.inflow), color: '#0E9F6E' }, { name: 'Outflow', data: cash.map(c => c.outflow), color: '#DC2626', fill: false }], cash.map(c => c.label), { height: 210 })}
              <div class="grid g3 mt12">
                ${UI.kpi({ label: 'Receivable', value: U.cur(m.receivable), icon: 'bank' })}
                ${UI.kpi({ label: 'Payable', value: U.cur(m.payable), icon: 'receipt' })}
                ${UI.kpi({ label: 'Net position', value: U.cur(m.receivable - m.payable), icon: 'scale' })}
              </div></div></div>

          <div class="card"><div class="card-h"><h3>Activity feed</h3><span class="live">LIVE</span></div>
            <div class="card-b tight" style="max-height:452px;overflow:auto">
              ${db.activityLog.slice(0, 12).map(a => `<div class="feed"><span class="av c${(a.module.length % 6) + 1}">${icon({ boq: 'layers', po: 'cart', dpr: 'camera', snag: 'alert', design: 'folder', invoice: 'receipt', hr: 'users', crm: 'target', payment: 'bank', site: 'hardhat' }[a.module] || 'activity', 12)}</span>
                <div class="grow"><div class="txt"><b>${U.esc(a.user.split(' ')[0])}</b> ${U.esc(a.action)}<div class="meta">${U.esc(a.detail)}</div></div><div class="meta">${U.ago(a.at)} · ${U.esc(a.role)}</div></div></div>`).join('')}
            </div></div>
        </div>`;
    },
    mount(view) {
      $$('[data-p]', view).forEach(tr => tr.addEventListener('click', () => MK.go('/projects/' + tr.getAttribute('data-p'))));
      const ex = $('[data-export]', view);
      if (ex) ex.onclick = () => {
        const m = S.metrics();
        U.csv('managekaro-mis-' + U.iso(U.today()), [
          { metric: 'Contract value', value: m.cv }, { metric: 'Budget', value: m.budget }, { metric: 'Billed', value: m.billed },
          { metric: 'Collected', value: m.received }, { metric: 'Receivable', value: m.receivable }, { metric: 'Payable', value: m.payable },
          { metric: 'Open snags', value: m.openSnags }, { metric: 'Live projects', value: m.live }, { metric: 'Headcount', value: m.headcount }
        ]);
        UI.toast('MIS exported as CSV', 'ok');
      };
      const grp = $('[data-cash]', view);
      if (grp) {
        const cash = S.db.cashflow;
        const draw = (k, color) => {
          const host = grp.closest('.card').querySelector('.chart').parentNode;
          host.innerHTML = UI.lineChart([{ name: k, data: cash.map(c => c[k]), color }], cash.map(c => c.label), { height: 210 }) +
            `<div class="grid g3 mt12">${UI.kpi({ label: 'Receivable', value: U.cur(S.metrics().receivable), icon: 'bank' })}${UI.kpi({ label: 'Payable', value: U.cur(S.metrics().payable), icon: 'receipt' })}${UI.kpi({ label: 'Net position', value: U.cur(S.metrics().receivable - S.metrics().payable), icon: 'scale' })}</div>`;
        };
        grp.addEventListener('click', e => {
          const b = e.target.closest('[data-k]'); if (!b) return;
          $$('button', grp).forEach(x => x.classList.toggle('on', x === b));
          draw(b.getAttribute('data-k'), b.getAttribute('data-k') === 'outflow' ? '#DC2626' : b.getAttribute('data-k') === 'collections' ? '#2563EB' : '#0E9F6E');
        });
      }
    }
  });

  /* ============================== MY WORK =============================== */
  MK.route('/my-work', {
    title: 'My Work', crumb: () => [{ label: 'My Work' }],
    render() {
      const me = S.me(), emp = S.empByUser(me.id) || S.db.employees[0];
      const tasks = S.db.tasks;
      const mine = tasks.filter(t => t.assigneeId === emp.id);
      const open = mine.filter(t => t.status !== 'Done');
      const overdue = open.filter(t => U.diff(t.due, U.today()) < 0);
      const today = open.filter(t => U.diff(t.due, U.today()) === 0);
      const apps = S.db.approvals.filter(a => a.status === 'Pending');
      const leaves = S.db.leaves.filter(l => l.employeeId === emp.id);
      const att = MK.Seed.attendance(S.db, U.monthKey(U.today()), [emp.id]);
      const todayAtt = att.find(a => a.date === U.iso(U.today()));
      const myProj = S.db.projects.filter(p => p.pmId === emp.id || p.siteEng === emp.id || p.qs === emp.id);
      return UI.pageHead('My Work', `${emp.designation} · ${S.dept(emp.deptId) ? S.dept(emp.deptId).name : ''} · ${emp.id}`,
        `<button class="btn" onclick="window.print()">${icon('printer', 14)} Print day plan</button>
         <button class="btn primary" data-newtask>${icon('plus', 14)} New task</button>`)
        + `<div class="hero-strip mb16"><div class="row-between wrap">
          <div><h2>Today · ${U.fmtDL(U.today())}</h2><p>${todayAtt ? `${todayAtt.status} · in ${todayAtt.in || '—'} · out ${todayAtt.out || '—'} · ${todayAtt.hours}h logged` : 'Attendance not yet marked'} · ${myProj.length} projects assigned</p></div>
          <div class="row gap6">${UI.av(me.name, 'lg')}<div><b style="color:#fff">${U.esc(me.name)}</b><div class="tiny" style="color:#A9B3C8">${U.esc(S.roleName())}</div></div></div>
        </div></div>
        <div class="grid g4 mb16">
          ${UI.kpi({ label: 'Open tasks', value: open.length, icon: 'checksq', foot: `${today.length} due today` })}
          ${UI.kpi({ label: 'Overdue', value: overdue.length, icon: 'alert', foot: 'Escalated to PM' })}
          ${UI.kpi({ label: 'Waiting approvals', value: apps.length, icon: 'inbox', foot: 'Across your projects' })}
          ${UI.kpi({ label: 'Leave balance', value: emp.leaveBal.EL, unit: 'EL days', icon: 'calendar', foot: `SL ${emp.leaveBal.SL} · CL ${emp.leaveBal.CL}` })}
        </div>
        <div class="grid g23">
          <div class="card"><div class="card-h"><h3>My task board</h3><div class="btn-group" data-tv><button class="on" data-v="list">List</button><button data-v="board">Board</button></div></div>
            <div class="card-b" data-taskhost></div></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>My projects</h3></div><div class="card-b tight">
              ${myProj.length ? myProj.map(p => `<a class="feed" href="#/projects/${p.id}" style="align-items:flex-start"><span class="av c1">${icon('building', 12)}</span><div class="grow"><div class="txt"><b>${U.esc(p.name)}</b></div><div class="meta">${p.code} · ${p.progress}% · ${UI.pill(p.health)}</div>${UI.bar(p.progress)}</div></a>`).join('') : UI.empty('No project assigned', 'Your PM will add you to project teams.')}
            </div></div>
            <div class="card"><div class="card-h"><h3>My leave requests</h3><a class="btn sm" href="#/hrm/leave">Apply</a></div><div class="card-b tight">
              ${leaves.length ? leaves.slice(0, 4).map(l => `<div class="feed"><span class="av c${l.status === 'Approved' ? '3' : '5'}">${icon('calendar', 11)}</span><div class="grow"><div class="txt">${l.typeName} · ${l.days}d</div><div class="meta">${U.fmtD(l.from)} → ${U.fmtD(l.to)}</div></div>${UI.pill(l.status)}</div>`).join('') : '<div class="tiny muted" style="padding:8px">No leave applied this cycle.</div>'}
            </div></div>
            <div class="card"><div class="card-h"><h3>Quick actions</h3></div><div class="card-b"><div class="grid g2" style="gap:8px">
              ${[['camera', 'Add DPR', '/dpr'], ['alert', 'Raise snag', '/snags'], ['cart', 'New PR', '/procurement'], ['receipt', 'Expense', '/finance/expenses'], ['clock', 'Attendance', '/hrm/attendance'], ['message', 'Raise RFI', '/rfis']].map(a => `<a class="btn sm" href="#${a[2]}" style="justify-content:flex-start">${icon(a[0], 13)}${a[1]}</a>`).join('')}
            </div></div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const host = $('[data-taskhost]', view);
      const me = S.me(), emp = S.empByUser(me.id) || S.db.employees[0];
      const mine = () => S.db.tasks.filter(t => t.assigneeId === emp.id);
      let mode = 'list';
      function draw() {
        if (mode === 'list') {
          const t = UI.table({
            rows: () => mine(), card: false, pageSize: 20,
            cols: [
              { key: 'title', label: 'Task', render: r => `<div class="cell-strong">${U.esc(r.title)}</div><span class="sub">${U.esc(S.projName(r.projectId))}</span>` },
              { key: 'priority', label: 'Priority', render: r => UI.pill(r.priority) },
              { key: 'due', label: 'Due', render: r => `<span class="badge ${U.dueCls(r.due)}">${U.fmtD(r.due)}</span>` },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
              { key: 'x', label: '', sortable: false, render: r => `<button class="btn sm" data-done="${r.id}">${r.status === 'Done' ? 'Reopen' : 'Complete'}</button>` }
            ]
          });
          host.innerHTML = ''; host.appendChild(t);
        } else {
          const cols = ['To Do', 'In Progress', 'Review', 'Done'];
          host.innerHTML = `<div class="kanban">${cols.map(c => `<div class="kcol"><h5>${c}<span>${mine().filter(t => t.status === c).length}</span></h5>
            ${mine().filter(t => t.status === c).map(t => `<div class="kcard"><div class="t">${U.esc(t.title)}</div><div class="row gap6 wrap"><span class="tag">${U.esc(S.projName(t.projectId).split('—')[0].trim())}</span>${UI.pill(t.priority)}</div><div class="row-between mt8 tiny muted"><span>${U.fmtD(t.due)}</span><span>${t.comments} 💬</span></div></div>`).join('') || '<div class="tiny muted" style="padding:6px 4px">—</div>'}</div>`).join('')}</div>`;
        }
      }
      draw();
      $('[data-tv]', view).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; $$('[data-v]', view).forEach(x => x.classList.toggle('on', x === b)); mode = b.dataset.v; draw(); });
      host.addEventListener('click', e => {
        const d = e.target.closest('[data-done]'); if (!d) return;
        const t = S.byId('tasks', d.dataset.done);
        S.update('tasks', t.id, { status: t.status === 'Done' ? 'In Progress' : 'Done' });
        S.log('task', 'updated task status', t.title + ' → ' + (t.status === 'Done' ? 'In Progress' : 'Done'));
        UI.toast('Task updated', 'ok'); draw();
      });
      $('[data-newtask]', view).onclick = () => {
        UI.modal({
          title: 'New task', sub: 'Contextual task linked to a project',
          body: `<div class="col gap10">
            <div class="field"><label>Title</label><input class="input" data-t placeholder="e.g. Verify GRN for tiles"></div>
            <div class="grid g2"><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
            <div class="field"><label>Priority</label><select class="input" data-pr><option>Medium</option><option>High</option><option>Critical</option><option>Low</option></select></div></div>
            <div class="field"><label>Due date</label><input class="input" type="date" data-d value="${U.iso(U.addD(U.today(), 3))}"></div>
          </div>`,
          onOk(ov) {
            const title = $('[data-t]', ov).value.trim(); if (!title) { UI.toast('Title is required', 'bad'); return false; }
            const t = S.add('tasks', { projectId: $('[data-p]', ov).value, title, assigneeId: emp.id, createdBy: S.me().id, status: 'To Do', priority: $('[data-pr]', ov).value, due: $('[data-d]', ov).value, createdOn: U.iso(U.today()), tags: [], comments: 0, attachments: 0, checklist: [] });
            S.log('task', 'created task', t.title); UI.toast('Task created', 'ok'); draw();
          }
        });
      };
    }
  });

  /* ============================= APPROVALS ============================== */
  MK.route('/approvals', {
    title: 'Approvals', crumb: () => [{ label: 'Approvals' }],
    render() {
      const a = S.db.approvals;
      const pend = a.filter(x => x.status === 'Pending');
      return UI.pageHead('Approvals inbox', `${pend.length} requests waiting · ${U.cur(U.sum(pend, x => x.amount))} value · SLA tracked`,
        `<a class="btn" href="#/settings">${icon('sliders', 14)} Approval rules</a><button class="btn primary" data-bulk>${icon('checksq', 14)} Bulk approve</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Pending', value: pend.length, icon: 'inbox', foot: 'Across 5 document types' })}
          ${UI.kpi({ label: 'Value waiting', value: U.cur(U.sum(pend, x => x.amount)), icon: 'wallet', foot: 'Approve to commit' })}
          ${UI.kpi({ label: 'Breaching SLA', value: pend.filter(x => x.sla < 0).length, icon: 'clock', foot: 'Older than 3 days' })}
          ${UI.kpi({ label: 'Approved (30d)', value: a.filter(x => x.status === 'Approved').length, icon: 'checksq', foot: 'Avg TAT 1.8 days', trend: { text: 'on target', dir: 'up' } })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Approval hierarchies</h3></div><div class="card-b tight">
              ${S.db.approvalRules.map(r => `<div class="feed"><span class="av c2">${icon('route', 12)}</span><div class="grow"><div class="txt"><b>${U.esc(r.name)}</b></div><div class="meta">${U.esc(r.chain)} · ${U.esc(r.cond)}</div></div>${r.active ? UI.pill('Active') : UI.pill('Off')}</div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>SLA by type</h3></div><div class="card-b">
              ${['Purchase Order', 'Vendor Invoice', 'Purchase Request', 'Change Order', 'Expense'].map((t, i) => {
                const rows = a.filter(x => x.type === t);
                const p = rows.length ? Math.round((rows.filter(x => x.status === 'Approved').length / rows.length) * 100) : 0;
                return `<div class="mb12"><div class="row-between tiny mb8"><span>${t}</span><b>${p}% approved</b></div>${UI.bar(p, p > 60 ? 'green' : '')}</div>`;
              }).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.approvals, pageSize: 14,
          filters: [{ key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] }, { key: 'type', label: 'Type', options: ['Purchase Order', 'Vendor Invoice', 'Purchase Request', 'Change Order', 'Expense'] }],
          cols: [
            { key: 'type', label: 'Type', render: r => `<div class="cell-strong">${U.esc(r.type)}</div><span class="sub mono">${U.esc(r.ref)}</span>` },
            { key: 'project', label: 'Project', render: r => `<span class="trunc" style="display:inline-block;max-width:170px">${U.esc(S.projName(r.projectId))}</span>` },
            { key: 'amount', label: 'Amount', cls: 'num', render: r => U.cur(r.amount) },
            { key: 'requestedBy', label: 'Raised by', render: r => `<div class="row gap6">${UI.av(S.empName(r.requestedBy))}<span class="trunc tiny">${U.esc(S.empName(r.requestedBy))}</span></div>` },
            { key: 'level', label: 'Level', sortable: false, render: r => `<span class="tag">L${r.level} of ${r.levels}</span>` },
            { key: 'sla', label: 'SLA', render: r => `<span class="badge ${r.sla < 0 ? 'bad' : r.sla <= 1 ? 'warn' : 'ok'}">${r.sla < 0 ? Math.abs(r.sla) + 'd over' : r.sla + 'd left'}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            {
              key: 'act', label: '', sortable: false, render: r => r.status === 'Pending'
                ? `<div class="row gap4"><button class="btn sm" data-ok="${r.id}" style="color:var(--ok);border-color:#B7E7D6">Approve</button><button class="btn sm" data-no="${r.id}" style="color:var(--bad);border-color:#F6C6C6">Reject</button></div>`
                : `<button class="btn sm" data-view="${r.id}">View</button>`
            }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      view.addEventListener('click', e => {
        const ok = e.target.closest('[data-ok]'), no = e.target.closest('[data-no]'), vw = e.target.closest('[data-view]');
        if (ok || no) {
          const id = (ok || no).getAttribute(ok ? 'data-ok' : 'data-no');
          const rec = S.byId('approvals', id);
          const act = ok ? 'Approved' : 'Rejected';
          UI.modal({
            title: (ok ? 'Approve' : 'Reject') + ' ' + rec.type, sub: rec.ref + ' · ' + U.cur(rec.amount),
            body: `<div class="col gap10"><div class="note ${ok ? 'ok' : 'warn'}">${ok ? 'Approving will commit this value against the project budget.' : 'Rejection returns the document to the requester with your comment.'}</div>
              <div class="field"><label>Comment (optional)</label><textarea class="input" data-c placeholder="Add a note for the requester…"></textarea></div></div>`,
            okText: act, onOk(ov) {
              const c = $('[data-c]', ov).value;
              S.update('approvals', id, { status: act, comments: c, actedOn: U.iso(U.today()) });
              if (rec.type === 'Purchase Order') S.update('pos', rec.entityId, { status: ok ? 'Approved' : 'Cancelled' });
              if (rec.type === 'Purchase Request') S.update('prs', rec.entityId, { status: ok ? 'Approved' : 'Rejected' });
              if (rec.type === 'Vendor Invoice') S.update('invoices', rec.entityId, { approval: ok ? 'Approved' : 'On Hold' });
              if (rec.type === 'Change Order') S.update('changeOrders', rec.entityId, { status: ok ? 'Approved' : 'Rejected' });
              if (rec.type === 'Expense') S.update('expenses', rec.entityId, { status: ok ? 'Approved' : 'Rejected' });
              S.log('approval', act.toLowerCase() + ' ' + rec.type, rec.ref + ' · ' + U.cur(rec.amount));
              UI.toast(rec.type + ' ' + act.toLowerCase(), ok ? 'ok' : 'warn'); draw();
            }
          });
        }
        if (vw) {
          const r = S.byId('approvals', vw.getAttribute('data-view'));
          UI.modal({
            title: r.type + ' · ' + r.ref, sub: 'Requested by ' + S.empName(r.requestedBy) + ' on ' + U.fmtDL(r.requestedOn),
            body: `<dl class="kv"><dt>Amount</dt><dd class="mono">${U.curFull(r.amount)}</dd><dt>Project</dt><dd>${U.esc(S.projName(r.projectId))}</dd>
              <dt>Approval chain</dt><dd>${S.db.approvalRules.filter(x => x.module === r.type).map(x => x.chain).join(' / ') || 'PM → Finance'}</dd>
              <dt>Level</dt><dd>${r.level} of ${r.levels}</dd><dt>Status</dt><dd>${UI.pill(r.status)}</dd>
              <dt>Comments</dt><dd>${U.esc(r.comments || '—')}</dd></dl>`, footer: '<button class="btn" data-x>Close</button>'
          });
        }
      });
      $('[data-bulk]', view).onclick = () => {
        const pend = S.db.approvals.filter(x => x.status === 'Pending');
        UI.confirm('Bulk approve ' + pend.length + ' requests?', 'Only approve if you have verified supporting documents. Every approval is audit-logged against your user.', () => {
          pend.forEach(p => { S.update('approvals', p.id, { status: 'Approved', actedOn: U.iso(U.today()) }); });
          S.log('approval', 'bulk approved', pend.length + ' requests');
          UI.toast(pend.length + ' requests approved', 'ok'); draw();
        });
      };
    }
  });
})(window.MK);
