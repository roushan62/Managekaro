/* Managekaro — Schedule, Gantt, site progress, DPR, snags, RFI, documents */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ------------------------------- GANTT -------------------------------- */
  MK.gantt = function (acts, opts) {
    opts = opts || {};
    if (!acts || !acts.length) return UI.empty('No activities', 'Add activities to build the schedule.');
    const start = new Date(Math.min.apply(null, acts.map(a => U.parse(a.start))));
    const end = new Date(Math.max.apply(null, acts.map(a => U.parse(a.end))));
    const totalDays = Math.max(14, U.diff(end, start));
    const weeks = Math.min(18, Math.max(6, Math.ceil(totalDays / 7)));
    const spanDays = weeks * 7;
    const pos = (d) => (U.diff(d, start) / spanDays) * 100;
    const width = (a) => Math.max(1.4, (U.diff(a.end, a.start) / spanDays) * 100);
    return `<div class="gantt"><div class="gantt-inner">
      <div class="gantt-head"><div class="gantt-name">Activity</div><div class="gantt-weeks">${Array.from({ length: weeks }, (_, i) => `<div>W${i + 1}<div style="font-weight:500;font-size:9px;color:#A2AABD">${U.fmtD(U.addD(start, i * 7))}</div></div>`).join('')}</div></div>
      ${acts.map(a => {
      const p = S.project(a.projectId);
      const cls = a.progress >= 100 ? 'done' : a.late ? 'late' : '';
      return `<div class="gantt-row">
        <div class="gantt-name">
          <span class="dotc" style="background:${a.progress >= 100 ? '#0E9F6E' : a.late ? '#DC2626' : '#F2540B'}"></span>
          <div style="min-width:0"><div class="trunc" style="max-width:200px">${U.esc(a.name)}</div><span class="tiny muted">${a.code} · ${a.progress}%${a.late ? ' · ' + Math.abs(a.slack) + 'd late' : ''}</span></div>
        </div>
        <div class="gantt-track">
          <div class="cells">${Array.from({ length: weeks }, () => '<i></i>').join('')}</div>
          <div class="taskbar plan" style="left:${pos(a.baselineStart)}%;width:${Math.max(1.2, (U.diff(a.baselineEnd, a.baselineStart) / spanDays) * 100)}%;top:${6}px" title="Baseline"></div>
          <div class="taskbar ${cls}" style="left:${pos(a.start)}%;width:${width(a)}%" title="${U.attr(a.name)} · ${a.progress}%"><div class="fill" style="width:${100 - a.progress}%;right:0;left:auto"></div><span>${a.progress}%</span></div>
          ${a.milestone ? `<div class="milestone" style="left:${pos(a.end)}%;top:13px" title="Milestone"></div>` : ''}
        </div>
      </div>`;
    }).join('')}
    </div></div>
    <div class="row gap14 wrap" style="padding:10px 14px;border-top:1px solid var(--line-2)">
      <div class="legend"><span><i style="background:#CBD5E1"></i>Baseline</span><span><i style="background:#F2540B"></i>In progress</span><span><i style="background:#0E9F6E"></i>Complete</span><span><i style="background:#DC2626"></i>Slipping</span><span><i style="background:#7C3AED"></i>Milestone</span></div>
      <span class="tiny muted" style="margin-left:auto">Today: ${U.fmtDL(U.today())}</span>
    </div>`;
  };

  /* ----------------------------- SCHEDULE ------------------------------- */
  MK.route('/schedule', {
    title: 'Schedule & Gantt', crumb: () => [{ label: 'Schedule' }],
    render() {
      const projParam = (location.hash.split('?p=')[1] || '').split('&')[0];
      const pid = projParam || (S.db.projects.find(p => p.status === 'In Progress') || {}).id;
      const p = S.project(pid) || S.db.projects[0];
      const acts = S.db.activities.filter(a => a.projectId === p.id);
      const late = acts.filter(a => a.late);
      return UI.pageHead('Schedule & Gantt', `${U.esc(p.name)} · ${acts.length} activities · ${late.length} slipping · baseline tracked`,
        `<select class="select" data-proj style="width:auto;max-width:340px">${S.db.projects.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${U.esc(x.name)}</option>`).join('')}</select>
         <button class="btn" data-import>${icon('upload', 14)} Import MS Project / P6</button>
         <button class="btn primary" data-addact>${icon('plus', 14)} Add activity</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Activities', value: acts.length, icon: 'calendar', foot: `${acts.filter(a => a.status === 'Completed').length} complete` })}
          ${UI.kpi({ label: 'Weighted progress', value: U.round(U.sum(acts, a => a.progress * a.weight) / (U.sum(acts, a => a.weight) || 1), 1) + '%', icon: 'activity' })}
          ${UI.kpi({ label: 'Slipping', value: late.length, icon: 'alert', foot: 'Behind baseline' })}
          ${UI.kpi({ label: 'Milestones', value: acts.filter(a => a.milestone).length, icon: 'flag' })}
          ${UI.kpi({ label: 'Days to handover', value: Math.max(0, U.diff(p.end, U.today())), icon: 'clock', foot: U.fmtDL(p.end) })}
        </div>
        <div class="card mb14"><div class="card-h"><h3>Gantt chart</h3><div class="row gap6"><span class="tag">Baseline vs actual</span><span class="tag">Dependencies</span></div></div>${MK.gantt(acts)}</div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Delay register</h3></div><div class="card-b tight">
              ${late.map(a => `<div class="feed"><span class="av c5">${icon('clock', 11)}</span><div class="grow"><div class="txt">${U.esc(a.name)}</div><div class="meta">${a.progress}% vs plan · slack ${a.slack}d · ${U.esc(S.empName(a.assigneeId))}</div></div><span class="badge bad">${Math.abs(a.slack)}d</span></div>`).join('') || '<div class="tiny muted" style="padding:8px">All activities on baseline.</div>'}
            </div></div>
            <div class="card"><div class="card-h"><h3>Milestones</h3></div><div class="card-b tight">
              ${S.db.milestones.filter(m => m.projectId === p.id).map(m => `<div class="feed"><span class="av c${m.status === 'Achieved' ? '3' : m.status === 'Missed' ? '5' : '2'}">${icon('flag', 11)}</span><div class="grow"><div class="txt">${U.esc(m.name)}</div><div class="meta">${U.fmtDL(m.date)}</div></div>${UI.pill(m.status)}</div>`).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const pid = (location.hash.split('?p=')[1] || '').split('&')[0] || (S.db.projects.find(p => p.status === 'In Progress') || {}).id;
      const p = S.project(pid);
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.activities.filter(a => a.projectId === p.id), pageSize: 10, search: false, filters: false,
          cols: [
            { key: 'code', label: 'ID', render: r => `<span class="mono tiny">${r.code}</span>` },
            { key: 'name', label: 'Activity', render: r => `<div class="cell-strong">${U.esc(r.name)}</div><span class="sub">${U.esc(r.trade)} · weight ${r.weight}</span>` },
            { key: 'assigneeId', label: 'Owner', render: r => `<div class="row gap6">${UI.av(S.empName(r.assigneeId))}<span class="tiny trunc">${U.esc(S.empName(r.assigneeId))}</span></div>` },
            { key: 'start', label: 'Start', render: r => `<span class="tiny">${U.fmtD(r.start)}</span>` },
            { key: 'end', label: 'Finish', render: r => `<span class="tiny">${U.fmtD(r.end)}</span><span class="sub">baseline ${U.fmtD(r.baselineEnd)}</span>` },
            { key: 'progress', label: 'Progress', render: r => `<div class="row gap6" style="min-width:90px">${UI.bar(r.progress, r.progress >= 100 ? 'green' : r.late ? 'red' : '')}<b class="tiny">${r.progress}%</b></div>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-upd="${r.id}">Update</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-proj]', view).onchange = (e) => { location.hash = '/schedule?p=' + e.target.value; };
      $('[data-addact]', view).onclick = () => UI.modal({
        title: 'Add activity', sub: 'Added to ' + p.name,
        body: `<div class="col gap10"><div class="field"><label>Activity name</label><input class="input" data-n placeholder="e.g. Ceiling framework Level 3"></div>
          <div class="grid g2"><div class="field"><label>Trade</label><select class="input" data-t>${S.const.TRADES.map(t => `<option>${t}</option>`).join('')}</select></div>
          <div class="field"><label>Weight %</label><input class="input" type="number" data-w value="5"></div></div>
          <div class="grid g2"><div class="field"><label>Start</label><input class="input" type="date" data-s value="${U.iso(U.today())}"></div>
          <div class="field"><label>Finish</label><input class="input" type="date" data-e value="${U.iso(U.addD(U.today(), 10))}"></div></div>
          <div class="field"><label>Assigned to</label><select class="input" data-a>${S.db.employees.map(e => `<option value="${e.id}">${U.esc(e.name)}</option>`).join('')}</select></div></div>`,
        onOk(ov) {
          S.add('activities', { projectId: p.id, code: 'A' + String(S.db.activities.filter(a => a.projectId === p.id).length + 1).padStart(2, '0'), name: $('[data-n]', ov).value, trade: $('[data-t]', ov).value, start: $('[data-s]', ov).value, end: $('[data-e]', ov).value, baselineStart: $('[data-s]', ov).value, baselineEnd: $('[data-e]', ov).value, progress: 0, weight: U.n($('[data-w]', ov).value), assigneeId: $('[data-a]', ov).value, status: 'Not Started', dependency: '', milestone: false, late: false, slack: 0, notes: '' });
          S.log('schedule', 'added activity', $('[data-n]', ov).value); UI.toast('Activity added', 'ok'); MK.render();
        }
      });
      $('[data-import]', view).onclick = () => UI.modal({
        title: 'Import schedule', sub: 'MS Project XML, Primavera XER or CSV', body: `<div class="note info">Drop your export here or paste the XML. Managekaro maps activity ID, name, start, finish, % complete, predecessor and weight.</div><textarea class="input mt12" style="min-height:120px" placeholder="&lt;Project&gt;…&lt;/Project&gt; or CSV rows"></textarea>`,
        okText: 'Import & map', onOk() { S.log('schedule', 'imported schedule', 'MS Project XML'); UI.toast('Schedule imported — 17 activities mapped', 'ok'); }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-upd]'); if (!b) return;
        const a = S.byId('activities', b.getAttribute('data-upd'));
        UI.modal({
          title: 'Update progress', sub: a.name,
          body: `<div class="col gap10"><div class="field"><label>Progress %</label><input class="input" type="range" min="0" max="100" value="${a.progress}" data-p oninput="this.nextElementSibling.textContent=this.value+'%'"><b data-pv>${a.progress}%</b></div>
            <div class="field"><label>Status</label><select class="input" data-s>${['Not Started', 'In Progress', 'Completed', 'On Hold'].map(s => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <div class="field"><label>Note</label><input class="input" data-n placeholder="Reason for delay, blocker…"></div></div>`,
          onOk(ov) {
            const pr = U.n($('[data-p]', ov).value);
            S.update('activities', a.id, { progress: pr, status: $('[data-s]', ov).value, late: pr < 100 && U.diff(a.end, U.today()) > 0, notes: $('[data-n]', ov).value });
            S.log('schedule', 'updated activity', a.name + ' → ' + pr + '%'); UI.toast('Activity updated', 'ok'); MK.render();
          },
          onMount(ov) { $('[data-p]', ov).oninput = (e) => { $('[data-pv]', ov).textContent = e.target.value + '%'; }; }
        });
      });
    }
  });

  /* -------------------------------- DPR --------------------------------- */
  MK.route('/dpr', {
    title: 'Daily Progress', crumb: () => [{ label: 'Daily Progress Reports' }],
    render() {
      const dprs = S.db.dprs.slice().sort((a, b) => b.date.localeCompare(a.date));
      const today = dprs.filter(d => d.date === U.iso(U.today()));
      const avgQuality = U.round(U.avg(dprs, d => d.qualityScore), 0);
      return UI.pageHead('Daily progress reports', `${dprs.length} reports · ${today.length} submitted today · auto-shared to client WhatsApp groups`,
        `<button class="btn" data-export>${icon('download', 14)} Export</button>
         <button class="btn primary" data-newdpr>${icon('camera', 14)} New DPR</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'DPRs this month', value: dprs.filter(d => U.monthKey(d.date) === U.monthKey(U.today())).length, icon: 'camera', foot: `${U.uniq(dprs.map(d => d.projectId)).length} projects reporting` })}
          ${UI.kpi({ label: 'Manpower on site', value: U.sum(today, d => d.manpower) || 214, icon: 'hardhat', foot: 'Today across sites' })}
          ${UI.kpi({ label: 'Quality score', value: avgQuality + '%', icon: 'award', foot: 'Average self-assessment' })}
          ${UI.kpi({ label: 'Blockers open', value: dprs.filter(d => d.blockers && d.blockers !== 'No blocker reported.').length, icon: 'alert', foot: 'Escalated to PM' })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Manpower trend</h3></div><div class="card-b">${UI.lineChart([{ name: 'Manpower', data: dprs.slice(0, 10).reverse().map(d => d.manpower), color: '#F2540B' }], dprs.slice(0, 10).reverse().map(d => U.fmtD(d.date).split(' ')[0] + ' ' + U.fmtD(d.date).split(' ')[1]), { height: 160 })}</div></div>
            <div class="card"><div class="card-h"><h3>DPR subscribers</h3></div><div class="card-b tight">
              ${S.db.clients.slice(0, 5).map((c, i) => `<div class="feed"><span class="av c${(i % 6) + 1}">${U.initials(c.contact)}</span><div class="grow"><div class="txt">${U.esc(c.contact)}</div><div class="meta">${U.esc(c.name)} · WhatsApp + Email</div></div><span class="badge ok">Subscribed</span></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-b"><a class="btn block" href="#/settings">${icon('settings', 13)} Configure DPR template</a></div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.dprs.slice().sort((a, b) => b.date.localeCompare(a.date)),
          searchPlaceholder: 'Search DPR, project, work done…',
          searchText: r => [S.projName(r.projectId), r.workDone, r.date, r.blockers].join(' '),
          cols: [
            { key: 'date', label: 'Date', render: r => `<div class="cell-strong">${U.fmtD(r.date)}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
            { key: 'by', label: 'Submitted by', render: r => `<div class="row gap6">${UI.av(S.empName(r.by))}<span class="tiny">${U.esc(S.empName(r.by))}</span></div>` },
            { key: 'manpower', label: 'Manpower', cls: 'num', render: r => `<b>${r.manpower}</b><span class="sub">${r.skilled} skilled</span>` },
            { key: 'workDone', label: 'Work done', render: r => `<span class="trunc" style="display:inline-block;max-width:250px">${U.esc(r.workDone)}</span><span class="sub">${r.materialIn} in · ${r.materialOut} out · ${r.photos} photos</span>` },
            { key: 'blockers', label: 'Blockers', render: r => r.blockers === 'No blocker reported.' ? '<span class="badge ok">None</span>' : `<span class="badge warn">${U.esc(r.blockers.slice(0, 34))}…</span>` },
            { key: 'qualityScore', label: 'Quality', cls: 'num', render: r => `<b style="color:${r.qualityScore > 88 ? 'var(--ok)' : 'var(--warn)'}">${r.qualityScore}</b>` },
            { key: 'approved', label: 'Shared', render: r => r.clientVisible ? '<span class="badge ok">Client</span>' : '<span class="badge">Internal</span>' }
          ],
          rowClick: (r) => MK.dprView(r)
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-export]', view).onclick = () => { U.csv('dpr-register', S.db.dprs); UI.toast('DPR register exported', 'ok'); };
      $('[data-newdpr]', view).onclick = () => MK.newDPR((MK._dprProject) || (S.db.projects.find(p => p.status === 'In Progress') || {}).id);
    }
  });

  MK.newDPR = function (pid) {
    const p = S.project(pid) || S.db.projects[0];
    UI.modal({
      title: 'New daily progress report', sub: p.name + ' · ' + U.fmtDL(U.today()), size: 'wide', okText: 'Submit DPR',
      body: `<div class="grid g2 gap10">
        <div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${U.esc(x.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Date</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div>
        <div class="field"><label>Total manpower</label><input class="input" type="number" data-m value="42"></div>
        <div class="field"><label>Skilled</label><input class="input" type="number" data-s value="16"></div>
        <div class="field span2"><label>Work done today</label><textarea class="input" data-w placeholder="Describe progress by area…">Gypsum ceiling framing completed in Workstation B. Flooring in cabins completed; skirting pending.</textarea></div>
        <div class="field span2"><label>Blockers / support needed</label><input class="input" data-b placeholder="Leave blank if none"></div>
        <div class="field"><label>Material inward (nos)</label><input class="input" type="number" data-mi value="3"></div>
        <div class="field"><label>Material outward (nos)</label><input class="input" type="number" data-mo value="1"></div>
        <div class="field"><label>Safety incidents</label><input class="input" type="number" data-si value="0"></div>
        <div class="field"><label>Quality self-score</label><input class="input" type="number" data-q value="92"></div>
        <div class="field span2"><label>Photos</label><div class="note info">${icon('camera', 12)} In the field app, photographs are geo-tagged and auto-linked to the BOQ item and area. Attach up to 12 per DPR.</div></div>
      </div>`,
      onOk(ov) {
        const dpr = S.add('dprs', {
          projectId: $('[data-p]', ov).value, date: $('[data-d]', ov).value, by: S.me().id,
          manpower: U.n($('[data-m]', ov).value), skilled: U.n($('[data-s]', ov).value), helpers: Math.max(0, U.n($('[data-m]', ov).value) - U.n($('[data-s]', ov).value)),
          progressPct: S.project($('[data-p]', ov).value).progress, workDone: $('[data-w]', ov).value,
          blockers: $('[data-b]', ov).value || 'No blocker reported.', materialIn: U.n($('[data-mi]', ov).value), materialOut: U.n($('[data-mo]', ov).value),
          safetyIncidents: U.n($('[data-si]', ov).value), weather: 'Clear', photos: 4, clientVisible: true, approved: false, qualityScore: U.n($('[data-q]', ov).value)
        });
        S.log('dpr', 'submitted DPR', U.fmtD(dpr.date) + ' · manpower ' + dpr.manpower);
        UI.toast('DPR submitted — client pack generated', 'ok');
        MK.render();
      }
    });
  };

  MK.dprView = function (r) {
    const p = S.project(r.projectId);
    UI.drawer({
      title: 'DPR · ' + U.fmtDL(r.date), sub: p ? p.name : '',
      body: `<div class="grid g3 mb16">
          ${UI.kpi({ label: 'Manpower', value: r.manpower, icon: 'hardhat' })}
          ${UI.kpi({ label: 'Progress', value: r.progressPct + '%', icon: 'activity' })}
          ${UI.kpi({ label: 'Quality', value: r.qualityScore, icon: 'award' })}
        </div>
        <div class="field mb16"><div class="lbl">Work done</div><div class="note">${U.esc(r.workDone)}</div></div>
        <div class="field mb16"><div class="lbl">Blockers</div><div class="alert ${r.blockers === 'No blocker reported.' ? 'ok' : 'warn'}">${U.esc(r.blockers)}</div></div>
        <dl class="kv"><dt>Submitted by</dt><dd>${U.esc(S.empName(r.by))}</dd><dt>Skilled / helpers</dt><dd>${r.skilled} / ${r.helpers}</dd>
          <dt>Material in / out</dt><dd>${r.materialIn} / ${r.materialOut}</dd><dt>Safety incidents</dt><dd>${r.safetyIncidents}</dd>
          <dt>Weather</dt><dd>${r.weather}</dd><dt>Shared with client</dt><dd>${r.clientVisible ? 'Yes — WhatsApp + email' : 'Internal only'}</dd></dl>
        <div class="mt16"><div class="lbl mb8">Site photographs</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
          ${Array.from({ length: Math.min(6, r.photos) }, (_, i) => `<div style="aspect-ratio:4/3;border-radius:8px;background:linear-gradient(${135 + i * 30}deg,#E8ECF5,#CBD5E1);display:grid;place-items:center;color:#78829A;font-size:10px">site photo ${i + 1}</div>`).join('')}
        </div></div>`,
      footer: `<button class="btn" data-print>${icon('printer', 13)} PDF</button><button class="btn primary" data-wa>${icon('whatsapp', 13)} Share to WhatsApp</button>`,
      onMount(ov, close) {
        $('[data-print]', ov).onclick = () => window.print();
        $('[data-wa]', ov).onclick = () => { UI.toast('DPR queued to client WhatsApp group', 'ok'); close(); };
      }
    });
  };

  /* ------------------------------- SNAGS -------------------------------- */
  MK.route('/snags', {
    title: 'Snags & Quality', crumb: () => [{ label: 'Snags & Quality' }],
    render() {
      const sn = S.db.snags;
      const open = sn.filter(s => s.status !== 'Closed');
      const over = open.filter(s => U.diff(s.dueDate, U.today()) < 0);
      return UI.pageHead('Snags & quality control', `${open.length} open · ${over.length} overdue · ${sn.filter(s => s.priority === 'Critical' && s.status !== 'Closed').length} critical`,
        `<button class="btn" data-export>${icon('download', 14)} Export</button><button class="btn primary" data-new>${icon('plus', 14)} Raise snag</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Open snags', value: open.length, icon: 'alert' })}
          ${UI.kpi({ label: 'Overdue', value: over.length, icon: 'clock', foot: 'Beyond committed date' })}
          ${UI.kpi({ label: 'Closed', value: sn.filter(s => s.status === 'Closed').length, icon: 'checksq', foot: U.pct(sn.filter(s => s.status === 'Closed').length, sn.length) + '% closure rate' })}
          ${UI.kpi({ label: 'Client facing', value: open.filter(s => s.clientFacing).length, icon: 'eye' })}
          ${UI.kpi({ label: 'Cost impact', value: U.cur(U.sum(open, s => s.costImpact)), icon: 'wallet' })}
        </div>
        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Snag ageing by trade</h3></div><div class="card-b">${UI.barChart(U.uniq(open.map(s => s.trade)).map((t, i) => ({ label: t, value: open.filter(s => s.trade === t).length, color: U.color(i), text: open.filter(s => s.trade === t).length + ' snags' })).sort((a, b) => b.value - a.value).slice(0, 8))}</div></div>
          <div class="card"><div class="card-h"><h3>By status</h3></div><div class="card-b">${UI.donut(['Open', 'In Progress', 'Resolved', 'Reopened', 'Closed'].map((s, i) => ({ label: s, value: sn.filter(x => x.status === s).length, color: ['#DC2626', '#D97706', '#0D9488', '#7C3AED', '#0E9F6E'][i] })), { center: sn.length + '', centerSub: 'total', size: 132 })}</div></div>
        </div>
        <div data-tbl></div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.snags, pageSize: 14, sortKey: 'raisedOn', sortDir: 'desc',
          searchPlaceholder: 'Search snag, area, description…',
          searchText: r => [r.code, r.description, r.area, r.trade, S.projName(r.projectId)].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Resolved', 'Reopened', 'Closed'] }, { key: 'priority', label: 'Priority', options: ['Critical', 'High', 'Medium', 'Low'] }, { key: 'trade', label: 'Trade', options: S.const.TRADES }],
          cols: [
            { key: 'code', label: 'Code', render: r => `<span class="mono tiny">${r.code}</span>` },
            { key: 'description', label: 'Snag', render: r => `<div class="cell-strong trunc" style="max-width:280px">${U.esc(r.description)}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())} · ${U.esc(r.area)}</span>` },
            { key: 'trade', label: 'Trade', render: r => `<span class="tag">${U.esc(r.trade)}</span>` },
            { key: 'priority', label: 'Priority', render: r => UI.pill(r.priority) },
            { key: 'assignedTo', label: 'Assigned', render: r => `<span class="tiny">${U.esc(S.vendor(r.assignedTo) ? S.vendor(r.assignedTo).name : S.empName(r.assignedTo))}</span>` },
            { key: 'dueDate', label: 'Due', render: r => `<span class="badge ${r.status === 'Closed' ? 'ok' : U.dueCls(r.dueDate)}">${U.fmtD(r.dueDate)}</span>` },
            { key: 'clientFacing', label: 'Client', render: r => r.clientFacing ? '<span class="badge purple">Visible</span>' : '<span class="badge">Internal</span>' },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-edit="${r.id}">${icon('edit', 11)}</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-export]', view).onclick = () => { U.csv('snag-register', S.db.snags); UI.toast('Snag register exported', 'ok'); };
      $('[data-new]', view).onclick = () => MK.newSnag(draw);
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-edit]'); if (!b) return;
        const s = S.byId('snags', b.getAttribute('data-edit'));
        UI.drawer({
          title: s.code + ' · ' + s.description, sub: U.esc(S.projName(s.projectId)) + ' · ' + s.area,
          body: `<div class="grid g3 mb16">${UI.kpi({ label: 'Priority', value: s.priority, icon: 'flag' })}${UI.kpi({ label: 'Status', value: s.status, icon: 'activity' })}${UI.kpi({ label: 'Cost impact', value: U.cur(s.costImpact), icon: 'wallet' })}</div>
            <dl class="kv"><dt>Trade</dt><dd>${U.esc(s.trade)}</dd><dt>Category</dt><dd>${U.esc(s.category)}</dd>
            <dt>Raised by</dt><dd>${U.esc(S.empName(s.raisedBy))} on ${U.fmtDL(s.raisedOn)}</dd>
            <dt>Assigned to</dt><dd>${U.esc(S.vendor(s.assignedTo) ? S.vendor(s.assignedTo).name + ' (vendor)' : S.empName(s.assignedTo))}</dd>
            <dt>Committed date</dt><dd>${U.fmtDL(s.dueDate)} ${U.dueCls(s.dueDate) === 'bad' ? '<span class="badge bad">Overdue</span>' : ''}</dd>
            <dt>Root cause</dt><dd>${U.esc(s.rootCause || '—')}</dd><dt>Client visible</dt><dd>${s.clientFacing ? 'Yes' : 'No'}</dd>
            <dt>Closed on</dt><dd>${s.closedOn ? U.fmtDL(s.closedOn) : '—'}</dd></dl>
            <hr class="hr"><div class="lbl mb8">Resolution workflow</div>
            <div class="tl">
              <div class="tl-item done"><div class="t">Snag raised</div><div class="m">${U.esc(S.empName(s.raisedBy))} · ${U.fmtDL(s.raisedOn)}</div></div>
              <div class="tl-item done"><div class="t">Assigned to vendor</div><div class="m">Committed closure ${U.fmtDL(s.dueDate)}</div></div>
              <div class="tl-item ${s.status === 'Resolved' || s.status === 'Closed' ? 'done' : ''}"><div class="t">Vendor submits proof of resolution</div><div class="m">${s.status === 'Resolved' || s.status === 'Closed' ? 'Photo proof uploaded' : 'Pending'}</div></div>
              <div class="tl-item ${s.status === 'Closed' ? 'done' : ''}"><div class="t">QC verifies &amp; closes</div><div class="m">${s.closedOn ? U.fmtDL(s.closedOn) : 'Pending verification'}</div></div>
            </div>`,
          footer: `<button class="btn" data-close-drawer data-x>Close</button><button class="btn primary" data-status>Update status</button>`,
          onMount(ov, close) {
            $('[data-status]', ov).onclick = () => {
              const next = s.status === 'Closed' ? 'Open' : s.status === 'Open' ? 'In Progress' : s.status === 'In Progress' ? 'Resolved' : 'Closed';
              S.update('snags', s.id, { status: next, closedOn: next === 'Closed' ? U.iso(U.today()) : s.closedOn });
              S.log('snag', 'updated snag', s.code + ' → ' + next); UI.toast('Snag moved to ' + next, 'ok'); close(); draw();
            };
          }
        });
      });
    }
  });

  MK.newSnag = function (after) {
    UI.modal({
      title: 'Raise snag', sub: 'Assign to a vendor or internal team with a committed closure date',
      body: `<div class="col gap10">
        <div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
        <div class="grid g2"><div class="field"><label>Area / location</label><input class="input" data-a placeholder="e.g. Board Room"></div>
        <div class="field"><label>Trade</label><select class="input" data-t>${S.const.TRADES.map(t => `<option>${t}</option>`).join('')}</select></div></div>
        <div class="field"><label>Description</label><input class="input" data-d placeholder="e.g. Paint patchy on bulkhead"></div>
        <div class="grid g2"><div class="field"><label>Priority</label><select class="input" data-pr><option>Medium</option><option>High</option><option>Critical</option><option>Low</option></select></div>
        <div class="field"><label>Committed closure</label><input class="input" type="date" data-due value="${U.iso(U.addD(U.today(), 5))}"></div></div>
        <div class="grid g2"><div class="field"><label>Assign to vendor</label><select class="input" data-v><option value="">— internal team —</option>${S.db.vendors.map(v => `<option value="${v.id}">${U.esc(v.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Client facing?</label><select class="input" data-cf><option value="1">Yes — visible in client portal</option><option value="0">No — internal only</option></select></div></div>
        <div class="field"><label>Photograph</label><div class="note info">In production, capture with the device camera — geo-tagged and linked to the drawing pin location.</div></div>
      </div>`,
      onOk(ov) {
        const v = $('[data-v]', ov).value;
        const s = S.add('snags', {
          code: 'SN-' + String(S.db.snags.length + 1).padStart(3, '0'), projectId: $('[data-p]', ov).value, area: $('[data-a]', ov).value || 'General',
          trade: $('[data-t]', ov).value, category: 'Fitment', description: $('[data-d]', ov).value, priority: $('[data-pr]', ov).value,
          raisedBy: S.me().id, raisedOn: U.iso(U.today()), assignedTo: v || S.me().id, assignType: v ? 'vendor' : 'internal',
          dueDate: $('[data-due]', ov).value, status: 'Open', closedOn: '', clientFacing: $('[data-cf]', ov).value === '1', photos: 1,
          rootCause: '', costImpact: 0, severityScore: 3
        });
        S.log('snag', 'raised snag', s.code + ' · ' + s.description); UI.toast('Snag raised and assigned', 'ok');
        if (after) after();
      }
    });
  };

  /* -------------------------------- RFI --------------------------------- */
  MK.route('/rfis', {
    title: 'RFI & Queries', crumb: () => [{ label: 'RFI & Queries' }],
    render() {
      const rfis = S.db.rfis;
      const open = rfis.filter(r => r.status === 'Open');
      return UI.pageHead('RFIs & technical queries', `${open.length} open · avg response 2.4 days · ${U.cur(U.sum(rfis, r => r.costImpact))} cost impact logged`,
        `<button class="btn" data-export>${icon('download', 14)} Export</button><button class="btn primary" data-new>${icon('plus', 14)} Raise RFI</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Open RFIs', value: open.length, icon: 'message' })}
          ${UI.kpi({ label: 'Overdue', value: open.filter(r => U.diff(r.dueDate, U.today()) < 0).length, icon: 'clock' })}
          ${UI.kpi({ label: 'Time impact', value: U.sum(rfis, r => r.timeImpact) + 'd', icon: 'calendar' })}
          ${UI.kpi({ label: 'Cost impact', value: U.cur(U.sum(rfis, r => r.costImpact)), icon: 'wallet' })}
        </div>
        <div data-tbl></div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.rfis, pageSize: 12,
          filters: [{ key: 'status', label: 'Status', options: ['Open', 'Answered', 'Closed'] }, { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] }],
          cols: [
            { key: 'code', label: 'RFI', render: r => `<span class="mono tiny">${r.code}</span>` },
            { key: 'subject', label: 'Subject', render: r => `<div class="cell-strong trunc" style="max-width:300px">${U.esc(r.subject)}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
            { key: 'toWhom', label: 'To', render: r => `<span class="tag">${U.esc(r.toWhom)}</span>` },
            { key: 'raisedOn', label: 'Raised', render: r => `<span class="tiny">${U.fmtD(r.raisedOn)}</span><span class="sub">${U.esc(S.empName(r.raisedBy).split(' ')[0])}</span>` },
            { key: 'dueDate', label: 'Response due', render: r => `<span class="badge ${r.status === 'Open' ? U.dueCls(r.dueDate) : 'ok'}">${U.fmtD(r.dueDate)}</span>` },
            { key: 'priority', label: 'Priority', render: r => UI.pill(r.priority) },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-view="${r.id}">Open</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-export]', view).onclick = () => { U.csv('rfi-register', S.db.rfis); UI.toast('RFI register exported', 'ok'); };
      $('[data-new]', view).onclick = () => UI.modal({
        title: 'Raise RFI', sub: 'Track technical clarifications with cost & time impact',
        body: `<div class="col gap10"><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Subject</label><input class="input" data-s placeholder="e.g. Clarification on ceiling height at lobby"></div>
          <div class="grid g2"><div class="field"><label>Addressed to</label><select class="input" data-t><option>Client</option><option>PMC</option><option>Design Studio</option><option>Structural Consultant</option></select></div>
          <div class="field"><label>Response needed by</label><input class="input" type="date" data-d value="${U.iso(U.addD(U.today(), 5))}"></div></div>
          <div class="field"><label>Detail</label><textarea class="input" data-x placeholder="Describe the query and reference drawing numbers…"></textarea></div></div>`,
        onOk(ov) {
          const r = S.add('rfis', { code: 'RFI-' + String(S.db.rfis.length + 1).padStart(3, '0'), projectId: $('[data-p]', ov).value, subject: $('[data-s]', ov).value, raisedBy: S.me().id, raisedOn: U.iso(U.today()), toWhom: $('[data-t]', ov).value, status: 'Open', priority: 'Medium', dueDate: $('[data-d]', ov).value, answer: '', costImpact: 0, timeImpact: 0, attachment: false });
          S.log('rfi', 'raised RFI', r.code + ' · ' + r.subject); UI.toast('RFI raised', 'ok'); draw();
        }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-view]'); if (!b) return;
        const r = S.byId('rfis', b.getAttribute('data-view'));
        UI.drawer({
          title: r.code + ' · ' + r.subject, sub: U.esc(S.projName(r.projectId)),
          body: `<dl class="kv"><dt>Status</dt><dd>${UI.pill(r.status)}</dd><dt>Addressed to</dt><dd>${U.esc(r.toWhom)}</dd>
            <dt>Raised</dt><dd>${U.fmtDL(r.raisedOn)} by ${U.esc(S.empName(r.raisedBy))}</dd><dt>Response due</dt><dd>${U.fmtDL(r.dueDate)}</dd>
            <dt>Cost impact</dt><dd>${U.cur(r.costImpact)}</dd><dt>Time impact</dt><dd>${r.timeImpact} days</dd></dl>
            <hr class="hr"><div class="lbl mb8">Response</div>${r.answer ? `<div class="note ok">${U.esc(r.answer)}</div>` : '<div class="note warn">Awaiting response</div>'}`,
          footer: `<button class="btn" data-x>Close</button>${r.status === 'Open' ? '<button class="btn primary" data-ans>Add response</button>' : ''}`,
          onMount(ov, close) {
            const ans = $('[data-ans]', ov);
            if (ans) ans.onclick = () => { S.update('rfis', r.id, { status: 'Answered', answer: 'Refer GFC rev-R3. Proceed as directed by consultant.' }); S.log('rfi', 'answered RFI', r.code); UI.toast('RFI answered', 'ok'); close(); draw(); };
          }
        });
      });
    }
  });

  /* ----------------------------- DOCUMENTS ------------------------------ */
  MK.route('/documents', {
    title: 'Drawings & Docs', crumb: () => [{ label: 'Drawings & Documents' }],
    render() {
      const docs = S.db.docs;
      return UI.pageHead('Drawings & documents', `${docs.length} documents · ${docs.filter(d => d.status === 'For Review').length} awaiting review · version controlled`,
        `<button class="btn" data-export>${icon('download', 14)} Export register</button><button class="btn primary" data-upload>${icon('upload', 14)} Upload revision</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Total documents', value: docs.length, icon: 'folder', foot: docs.filter(d => d.category === 'Drawing').length + ' drawings' })}
          ${UI.kpi({ label: 'Awaiting approval', value: docs.filter(d => d.status === 'For Review').length, icon: 'eye' })}
          ${UI.kpi({ label: 'Shared with client', value: docs.filter(d => d.clientShared).length, icon: 'send' })}
          ${UI.kpi({ label: 'Open pin comments', value: U.sum(docs, d => d.pins), icon: 'message', foot: 'On drawings' })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>By discipline</h3></div><div class="card-b">${UI.donut(U.uniq(docs.map(d => d.discipline)).map((d, i) => ({ label: d, value: docs.filter(x => x.discipline === d).length, color: U.color(i) })), { center: docs.length + '', centerSub: 'docs' })}</div></div>
            <div class="card"><div class="card-h"><h3>Approval queue</h3></div><div class="card-b tight">
              ${docs.filter(d => d.status === 'For Review').slice(0, 6).map(d => `<div class="feed"><span class="av c2">${icon('file', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(d.name)} <span class="tag">${d.version}</span></div><div class="meta">${U.esc(d.drawingNo)} · ${U.esc(S.projName(d.projectId).split('—')[0].trim())}</div></div><button class="btn sm" data-appr="${d.id}">Review</button></div>`).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.docs, pageSize: 14,
          searchPlaceholder: 'Search drawing, number, discipline…',
          searchText: r => [r.name, r.drawingNo, r.discipline, S.projName(r.projectId), r.status].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['Approved', 'For Review', 'Issued', 'Superseded'] }, { key: 'discipline', label: 'Discipline', options: ['Architecture', 'MEP', 'Electrical', 'Structure'] }],
          cols: [
            { key: 'name', label: 'Document', render: r => `<div class="row gap8">${icon('file', 15)}<div><div class="cell-strong">${U.esc(r.name)}</div><span class="sub mono">${r.drawingNo} · ${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span></div></div>` },
            { key: 'discipline', label: 'Discipline', render: r => `<span class="tag">${r.discipline}</span>` },
            { key: 'version', label: 'Rev', render: r => `<span class="badge ${r.status === 'Approved' ? 'ok' : r.status === 'Superseded' ? '' : 'warn'}">${r.version}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'uploadedBy', label: 'Uploaded', render: r => `<span class="tiny">${U.esc(S.empName(r.uploadedBy))}</span><span class="sub">${U.fmtD(r.uploadedOn)}</span>` },
            { key: 'pins', label: 'Pins', cls: 'num', render: r => r.pins ? `<span class="badge purple">${r.pins}</span>` : '—' },
            { key: 'clientShared', label: 'Client', render: r => r.clientShared ? '<span class="badge ok">Shared</span>' : '<span class="badge">—</span>' },
            { key: 'size', label: 'Size', cls: 'num', render: r => `<span class="tiny">${r.size}</span>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-export]', view).onclick = () => { U.csv('document-register', S.db.docs); UI.toast('Document register exported', 'ok'); };
      $('[data-upload]', view).onclick = () => UI.modal({
        title: 'Upload drawing revision', sub: 'Version control keeps one current drawing per sheet',
        body: `<div class="col gap10"><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Drawing name</label><input class="input" data-n placeholder="Reflected Ceiling Plan"></div><div class="field"><label>Drawing no.</label><input class="input" data-dn placeholder="A-201"></div></div>
          <div class="grid g2"><div class="field"><label>Discipline</label><select class="input" data-d><option>Architecture</option><option>MEP</option><option>Electrical</option><option>Structure</option></select></div><div class="field"><label>Revision</label><select class="input" data-r><option>R1</option><option>R2</option><option>R3</option><option>R4</option></select></div></div>
          <div class="field"><label>File</label><input class="input" type="file"></div>
          <div class="check"><input type="checkbox" data-cs checked> Share with client portal on approval</div></div>`,
        onOk(ov) {
          const d = S.add('docs', { projectId: $('[data-p]', ov).value, name: $('[data-n]', ov).value, drawingNo: $('[data-dn]', ov).value, category: 'Drawing', discipline: $('[data-d]', ov).value, version: $('[data-r]', ov).value, status: 'For Review', uploadedBy: S.me().id, uploadedOn: U.iso(U.today()), size: '2.4 MB', ext: 'pdf', clientShared: $('[data-cs]', ov).checked, rev: 1, pins: 0, transmittals: 1, approvalBy: 'PMC + Client', tags: [] });
          S.log('design', 'uploaded drawing revision', d.name + ' ' + d.version); UI.toast('Revision uploaded — sent for review', 'ok'); draw();
        }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-appr]'); if (!b) return;
        const d = S.byId('docs', b.getAttribute('data-appr'));
        UI.modal({
          title: 'Review drawing', sub: d.name + ' · ' + d.drawingNo + ' · ' + d.version,
          body: `<div style="border:1px solid var(--line);border-radius:10px;height:240px;background:repeating-linear-gradient(45deg,#F7F8FC,#F7F8FC 10px,#EEF1F6 10px,#EEF1F6 20px);display:grid;place-items:center;position:relative">
            <div style="position:absolute;left:22%;top:34%" class="av c5">1</div><div style="position:absolute;left:61%;top:58%" class="av c2">2</div><div style="position:absolute;left:44%;top:20%" class="av c3">3</div>
            <div class="tiny muted">drawing preview · pin comments rendered here</div></div>
          <div class="col gap8 mt12"><div class="note info">3 pin comments: grid alignment at lobby, diffuser clash, skirting detail missing.</div>
          <div class="field"><label>Review comment</label><textarea class="input" placeholder="Add your comment…"></textarea></div></div>`,
          okText: 'Approve & issue', onOk() { S.update('docs', d.id, { status: 'Approved' }); S.log('design', 'approved drawing', d.name + ' ' + d.version); UI.toast('Drawing approved & issued', 'ok'); draw(); }
        });
      });
    }
  });
})(window.MK);
