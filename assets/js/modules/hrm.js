/* Managekaro — HRM: dashboard, employees, attendance, leave, payroll, recruitment, performance */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  const HR_TABS = [
    { path: '/hrm', label: 'Dashboard' }, { path: '/hrm/employees', label: 'Employees' }, { path: '/hrm/attendance', label: 'Attendance' },
    { path: '/hrm/leave', label: 'Leave' }, { path: '/hrm/payroll', label: 'Payroll' }, { path: '/hrm/recruitment', label: 'Recruitment' },
    { path: '/hrm/performance', label: 'Performance' }
  ];
  function hrSub(active) {
    return `<div class="tabs mb16 no-print">${HR_TABS.map(t => `<a class="tab ${t.path === active ? 'on' : ''}" href="#${t.path}">${t.label}</a>`).join('')}</div>`;
  }

  /* --------------------------- HR DASHBOARD ---------------------------- */
  MK.route('/hrm', {
    title: 'HR Dashboard', crumb: () => [{ label: 'HRM' }, { label: 'Dashboard' }],
    render() {
      const emps = S.db.employees.filter(e => e.status !== 'Resigned');
      const depts = S.db.departments;
      const month = U.monthKey(U.today());
      const att = MK.Seed.attendance(S.db, month);
      const todayIso = U.iso(U.today());
      const todayRows = att.filter(a => a.date === todayIso);
      const present = todayRows.filter(a => ['Present', 'Late', 'Work From Home', 'Half Day'].includes(a.status)).length;
      const onLeave = todayRows.filter(a => a.status === 'Leave').length;
      const payroll = S.db.payroll.filter(p => p.month === month);
      const pendingLeaves = S.db.leaves.filter(l => l.status === 'Pending');
      const cost = U.sum(emps, e => e.ctc);
      return UI.pageHead('HR dashboard', `${emps.length} employees · ${U.cur(cost)} annual CTC · ${S.db.jobs.filter(j => j.status === 'Open').length} open positions`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-leave>${icon('calendar', 14)} Leave requests (${pendingLeaves.length})</button>
         <button class="btn primary" data-emp>${icon('plus', 14)} Add employee</button>`)
        + hrSub('/hrm')
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Headcount', value: emps.length, icon: 'users', foot: `${S.db.employees.filter(e => e.type === 'Contract').length} contract · ${S.db.employees.filter(e => e.status === 'Notice Period').length} on notice` })}
          ${UI.kpi({ label: 'Present today', value: present, unit: 'of ' + (todayRows.length || emps.length), icon: 'checksq', foot: `${onLeave} on leave` })}
          ${UI.kpi({ label: 'Monthly payroll', value: U.cur(U.sum(payroll, p => p.net)), icon: 'bank', foot: U.fmtM(U.today()) + ' cycle' })}
          ${UI.kpi({ label: 'Open positions', value: U.sum(S.db.jobs.filter(j => j.status === 'Open'), j => j.openings), icon: 'briefcase', foot: S.db.candidates.length + ' candidates in pipeline' })}
          ${UI.kpi({ label: 'Attrition', value: '8.4%', icon: 'trend', foot: 'Rolling 12 months', trend: { text: '1.2% better', dir: 'up' } })}
        </div>
        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Attendance trend — this month</h3><span class="tiny muted">${U.fmtM(U.today())}</span></div>
            <div class="card-b">${(() => {
          const byDay = {};
          att.forEach(a => { byDay[a.date] = byDay[a.date] || { p: 0, t: 0 }; byDay[a.date].t++; if (['Present', 'Late', 'Work From Home'].includes(a.status)) byDay[a.date].p++; });
          const days = Object.keys(byDay).sort();
          return UI.lineChart([
            { name: 'Present', data: days.map(d => byDay[d].p), color: '#0E9F6E' },
            { name: 'Headcount', data: days.map(d => byDay[d].t), color: '#94A3B8', fill: false }
          ], days.map(d => d.slice(8)), { height: 210 });
        })()}
            <div class="legend mt8"><span><i style="background:#0E9F6E"></i>Present / WFH / Late</span><span><i style="background:#94A3B8"></i>Headcount on rolls</span></div>
            </div></div>
          <div class="card"><div class="card-h"><h3>Headcount by department</h3></div><div class="card-b">
            ${UI.donut(depts.map((d, i) => ({ label: d.name.replace(' (QHSE)', ''), value: emps.filter(e => e.deptId === d.id).length, color: d.color })).filter(x => x.value), { center: emps.length + '', centerSub: 'people', size: 128 })}
          </div></div>
        </div>
        <div class="grid g3 mb14">
          <div class="card"><div class="card-h"><h3>Leave requests</h3><a class="tiny" href="#/hrm/leave" style="color:var(--brand);font-weight:700">All</a></div><div class="card-b tight">
            ${pendingLeaves.slice(0, 5).map(l => `<div class="feed"><span class="av c5">${icon('calendar', 11)}</span><div class="grow"><div class="txt">${U.esc(l.employee)}</div><div class="meta">${l.type} · ${l.days}d · ${U.fmtD(l.from)}</div></div><button class="btn sm" data-approve="${l.id}">Approve</button></div>`).join('') || '<div class="tiny muted" style="padding:8px">No pending leave.</div>'}
          </div></div>
          <div class="card"><div class="card-h"><h3>Hiring pipeline</h3><a class="tiny" href="#/hrm/recruitment" style="color:var(--brand);font-weight:700">Open</a></div><div class="card-b tight">
            ${['Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map(st => `<div class="stat-line"><span class="muted">${st}</span><b>${S.db.candidates.filter(c => c.stage === st).length}</b></div>`).join('')}
          </div></div>
          <div class="card"><div class="card-h"><h3>People to watch</h3></div><div class="card-b tight">
            ${S.db.employees.filter(e => e.status === 'Notice Period').map(e => `<div class="feed"><span class="av c5">${icon('user', 11)}</span><div class="grow"><div class="txt">${U.esc(e.name)}</div><div class="meta">${U.esc(e.designation)} · notice period</div></div>${UI.pill('On Notice')}</div>`).join('')}
            ${S.db.appraisals.filter(a => a.status === 'Pending').slice(0, 2).map(a => `<div class="feed"><span class="av c2">${icon('award', 11)}</span><div class="grow"><div class="txt">${U.esc(a.employee)}</div><div class="meta">Appraisal pending · due ${U.fmtD(a.dueDate)}</div></div><span class="badge warn">Pending</span></div>`).join('')}
          </div></div>
        </div>
        <div class="grid g2">
          <div class="card"><div class="card-h"><h3>Payroll cost by department</h3></div><div class="card-b">
            ${UI.barChart(depts.map((d, i) => ({ label: d.name, value: U.sum(emps.filter(e => e.deptId === d.id), e => e.gross), color: d.color })).filter(x => x.value).sort((a, b) => b.value - a.value))}
          </div></div>
          <div class="card"><div class="card-h"><h3>Upcoming holidays &amp; training</h3></div><div class="card-b tight">
            ${S.db.holidays.slice(0, 3).map(h => `<div class="feed"><span class="av c3">${icon('sun', 11)}</span><div class="grow"><div class="txt">${U.esc(h.name)}</div><div class="meta">${U.fmtDL(h.date)} · ${h.type}</div></div><span class="badge ok">Holiday</span></div>`).join('')}
            ${S.db.trainings.filter(t => t.status === 'Scheduled').slice(0, 2).map(t => `<div class="feed"><span class="av c2">${icon('graduation', 11)}</span><div class="grow"><div class="txt">${U.esc(t.title)}</div><div class="meta">${U.fmtDL(t.date)} · ${t.enrolled}/${t.seats} enrolled</div></div><span class="badge info">Training</span></div>`).join('')}
          </div></div>
        </div>`;
    },
    mount(view) {
      $('[data-csv]', view).onclick = () => { U.csv('hr-dashboard', S.db.employees.map(e => ({ ID: e.id, Name: e.name, Dept: (S.dept(e.deptId) || {}).name, Designation: e.designation, DOJ: e.doj, CTC: e.ctc, Status: e.status }))); UI.toast('HR data exported', 'ok'); };
      $('[data-leave]', view).onclick = () => MK.go('/hrm/leave');
      $('[data-emp]', view).onclick = () => MK.newEmployee(() => MK.render());
      $$('[data-approve]', view).forEach(b => b.onclick = () => {
        S.update('leaves', b.getAttribute('data-approve'), { status: 'Approved' });
        UI.toast('Leave approved', 'ok'); MK.render();
      });
    }
  });

  /* ---------------------------- EMPLOYEES ------------------------------ */
  MK.route('/hrm/employees', {
    title: 'Employees', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Employees' }],
    render() {
      const emps = S.db.employees;
      const active = emps.filter(e => e.status === 'Active');
      return UI.pageHead('Employees', `${emps.length} records · ${active.length} active · ${emps.filter(e => e.type === 'Contract').length} on contract`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-import>${icon('upload', 14)} Bulk import</button>
         <button class="btn primary" data-emp>${icon('plus', 14)} Add employee</button>`)
        + hrSub('/hrm/employees')
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Total employees', value: emps.length, icon: 'users' })}
          ${UI.kpi({ label: 'Active', value: active.length, icon: 'checksq' })}
          ${UI.kpi({ label: 'Annual CTC', value: U.cur(U.sum(active, e => e.ctc)), icon: 'wallet', foot: 'Excludes variable' })}
          ${UI.kpi({ label: 'Avg tenure', value: '3.4 yrs', icon: 'clock', foot: 'Across departments' })}
        </div>
        <div data-tbl></div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.employees, pageSize: 12, sortKey: 'name',
          searchPlaceholder: 'Search name, ID, designation…', searchText: r => [r.name, r.id, r.designation, r.email, (S.dept(r.deptId) || {}).name].join(' '),
          filters: [{ key: 'deptId', label: 'Department', options: S.db.departments.map(d => d.id), filterLabel: true }, { key: 'status', label: 'Status', options: ['Active', 'Notice Period', 'Resigned'] }, { key: 'type', label: 'Type', options: ['Full-time', 'Contract'] }],
          filterValue: (r, k) => r[k],
          rowClick: (r) => MK.go('/hrm/employees/' + r.id),
          cols: [
            { key: 'name', label: 'Employee', render: r => `<div class="row gap8">${UI.av(r.name)}<div><div class="cell-strong">${U.esc(r.name)}</div><span class="sub mono">${r.id}</span></div></div>` },
            { key: 'designation', label: 'Designation', render: r => `<div class="trunc" style="max-width:180px">${U.esc(r.designation)}</div><span class="sub">${U.esc((S.dept(r.deptId) || {}).name || '')}</span>` },
            { key: 'type', label: 'Type', render: r => `<span class="tag">${r.type}</span><span class="sub">${r.grade}</span>` },
            { key: 'doj', label: 'Date of joining', render: r => `<span class="tiny">${U.fmtD(r.doj)}</span>` },
            { key: 'gross', label: 'Monthly gross', cls: 'num', render: r => U.curFull(r.gross) },
            { key: 'ctc', label: 'Annual CTC', cls: 'num', render: r => U.cur(r.ctc) },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
          ]
        });
        // patch department filter to show names
        const sel = t.querySelector('[data-f="deptId"]');
        if (sel) sel.innerHTML = '<option value="">Department: All</option>' + S.db.departments.map(d => `<option value="${d.id}">${U.esc(d.name)}</option>`).join('');
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('employee-master', S.db.employees.map(e => ({ ID: e.id, Name: e.name, Email: e.email, Dept: (S.dept(e.deptId) || {}).name, Designation: e.designation, Type: e.type, DOJ: e.doj, Gross: e.gross, CTC: e.ctc, Status: e.status }))); UI.toast('Employee master exported', 'ok'); };
      $('[data-emp]', view).onclick = () => MK.newEmployee(draw);
      $('[data-import]', view).onclick = () => UI.modal({
        title: 'Bulk import employees', sub: 'CSV with columns: name, email, department, designation, doj, gross',
        body: `<div class="note info">Download the template, fill it, and upload. Managekaro validates duplicates by email and PAN before importing.</div>
          <button class="btn mt12" data-tpl>${icon('download', 13)} Download CSV template</button>
          <div class="field mt12"><label>Upload file</label><input class="input" type="file" accept=".csv"></div>`,
        okText: 'Validate & import', onOk() { UI.toast('12 employees imported, 1 duplicate skipped', 'ok'); draw(); },
        onMount(ov) { const b = $('[data-tpl]', ov); b.onclick = () => U.csv('employee-import-template', [{ name: 'Jane Doe', email: 'jane@company.com', department: 'Projects & Delivery', designation: 'Site Engineer', doj: '2026-01-15', gross: 56000 }]); }
      });
    }
  });

  MK.newEmployee = function (after) {
    UI.modal({
      title: 'Add employee', sub: 'Creates an employee record, user login and leave balances', size: 'wide',
      body: `<div class="grid g2 gap10">
        <div class="field"><label>Full name *</label><input class="input" data-n placeholder="Full name"></div>
        <div class="field"><label>Work email *</label><input class="input" data-e placeholder="name@managekaro.com"></div>
        <div class="field"><label>Department</label><select class="input" data-d>${S.db.departments.map(d => `<option value="${d.id}">${U.esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Designation</label><select class="input" data-des>${S.const.DESIGNS.map(d => `<option>${d}</option>`).join('')}</select></div>
        <div class="field"><label>Role / access</label><select class="input" data-r>${S.db.roles.slice(0, 11).map(r => `<option value="${r.id}">${U.esc(r.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Business unit</label><select class="input" data-u>${S.db.units.filter(u => u.active).map(u => `<option value="${u.id}">${U.esc(u.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Employment type</label><select class="input" data-t><option>Full-time</option><option>Contract</option></select></div>
        <div class="field"><label>Date of joining</label><input class="input" type="date" data-j value="${U.iso(U.today())}"></div>
        <div class="field"><label>Monthly gross (₹)</label><input class="input" type="number" data-g placeholder="56000"></div>
        <div class="field"><label>Phone</label><input class="input" data-p placeholder="+91 98…"></div>
        <div class="field"><label>PAN</label><input class="input" data-pan placeholder="ABCDE1234F"></div>
        <div class="field"><label>Bank / IFSC</label><input class="input" data-b placeholder="HDFC / HDFC0001234"></div>
      </div>
      <div class="note info mt12">${icon('shield', 12)} Payroll components (basic, HRA, PF, ESI, PT, TDS) are auto-derived from gross. Leave balances initialise at EL 18 / SL 12 / CL 10.</div>`,
      onOk(ov) {
        const name = $('[data-n]', ov).value.trim(), email = $('[data-e]', ov).value.trim();
        if (!name || !email) { UI.toast('Name and email are required', 'bad'); return false; }
        const gross = U.n($('[data-g]', ov).value) || 45000;
        const count = S.db.employees.length + 1;
        const ep = S.add('employees', {
          id: 'EMP-' + String(count).padStart(4, '0'), userId: '', name, email, phone: $('[data-p]', ov).value, deptId: $('[data-d]', ov).value,
          designation: $('[data-des]', ov).value, roleId: $('[data-r]', ov).value, unitId: $('[data-u]', ov).value, type: $('[data-t]', ov).value,
          grade: 'L2', doj: $('[data-j]', ov).value, dob: '', gross, status: 'Active', pan: $('[data-pan]', ov).value,
          aadhaar: '', uan: '', esi: '', bank: ($('[data-b]', ov).value.split('/')[0] || 'HDFC').trim(), ac: String(Math.floor(1e10 + Math.random() * 9e10)),
          ifsc: ($('[data-b]', ov).value.split('/')[1] || 'HDFC0001234').trim(), bloodGroup: 'O+', gender: '—', emergency: '', address: '',
          skills: [], leaveBal: { EL: 18, SL: 12, CL: 10 }, ctc: gross * 12, shift: 'General (09:30-18:30)'
        });
        const u = S.add('users', { empId: ep.id, name, email, phone: ep.phone, roleId: ep.roleId, deptId: ep.deptId, designation: ep.designation, unitId: ep.unitId, status: 'Active', avatar: U.initials(name), lastLogin: '', active: true, managerId: null, portal: 'internal' });
        S.update('employees', ep.id, { userId: u.id });
        S.log('hr', 'added employee', name + ' · ' + ep.designation); UI.toast('Employee added with login', 'ok');
        if (after) after();
      }
    });
  };

  MK.route('/hrm/employees/:id', {
    title: 'Employee', crumb: (path) => [{ label: 'HRM', href: '/hrm' }, { label: 'Employees', href: '/hrm/employees' }, { label: path.split('/')[3] }],
    render(path, params) {
      const e = S.emp(params.id);
      if (!e) return UI.pageHead('Employee not found', '') + UI.empty('Not found', 'This employee record does not exist.');
      const att = MK.Seed.attendance(S.db, U.monthKey(U.today()), [e.id]);
      const present = att.filter(a => ['Present', 'Late', 'Work From Home'].includes(a.status)).length;
      const pay = S.db.payroll.filter(p => p.employeeId === e.id).slice(0, 3);
      const leaves = S.db.leaves.filter(l => l.employeeId === e.id);
      const appraisal = S.db.appraisals.find(a => a.employeeId === e.id);
      return `<div class="row-between mb16 wrap"><div class="row gap14">
          ${UI.av(e.name, 'xl')}
          <div><div class="row gap6 tiny muted"><a href="#/hrm">HRM</a>${icon('chevronRight', 10)}<a href="#/hrm/employees">Employees</a></div>
          <h1 style="margin-top:4px">${U.esc(e.name)}</h1>
          <div class="row gap6 wrap mt8"><span class="tag">${e.id}</span><span class="tag">${U.esc(e.designation)}</span><span class="tag">${U.esc((S.dept(e.deptId) || {}).name || '')}</span>${UI.pill(e.status)}</div></div></div>
        <div class="row gap6 no-print"><button class="btn" data-payslip>${icon('file', 14)} Payslip</button><button class="btn primary" data-edit>${icon('edit', 14)} Edit</button></div></div>
        <div class="grid g4 mb16">
          ${UI.kpi({ label: 'Monthly gross', value: U.curFull(e.gross), icon: 'wallet', foot: 'CTC ' + U.cur(e.ctc) })}
          ${UI.kpi({ label: 'Attendance (MTD)', value: present, unit: 'days', icon: 'checksq', foot: att.filter(a => a.status === 'Leave').length + ' leave days' })}
          ${UI.kpi({ label: 'Leave balance', value: e.leaveBal.EL + e.leaveBal.SL + e.leaveBal.CL, unit: 'days', icon: 'calendar', foot: `EL ${e.leaveBal.EL} · SL ${e.leaveBal.SL} · CL ${e.leaveBal.CL}` })}
          ${UI.kpi({ label: 'Tenure', value: ((U.diff(U.today(), e.doj) / 365) || 0).toFixed(1), unit: 'years', icon: 'clock', foot: 'Joined ' + U.fmtDL(e.doj) })}
        </div>
        <div class="grid g23">
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Personal &amp; statutory details</h3></div><div class="card-b">
              <dl class="kv"><dt>Email</dt><dd>${U.esc(e.email)}</dd><dt>Phone</dt><dd>${U.esc(e.phone)}</dd>
                <dt>Date of birth</dt><dd>${e.dob ? U.fmtDL(e.dob) : '—'}</dd><dt>Blood group</dt><dd>${e.bloodGroup}</dd>
                <dt>Address</dt><dd>${U.esc(e.address)}</dd><dt>Emergency</dt><dd>${U.esc(e.emergency)}</dd>
                <dt>PAN</dt><dd class="mono tiny">${e.pan}</dd><dt>Aadhaar</dt><dd class="mono tiny">${e.aadhaar}</dd>
                <dt>UAN / ESI</dt><dd class="mono tiny">${e.uan || '—'} / ${e.esi || '—'}</dd>
                <dt>Bank</dt><dd class="mono tiny">${e.bank} · ${e.ac} · ${e.ifsc}</dd>
                <dt>Shift</dt><dd>${e.shift}</dd><dt>Manager</dt><dd>${U.esc(S.empName(e.manager) || '—')}</dd></dl>
            </div></div>
            <div class="card"><div class="card-h"><h3>Attendance — ${U.fmtM(U.today())}</h3></div>
              <div class="table-wrap" style="max-height:320px"><table class="tbl compact"><thead><tr><th>Date</th><th>Status</th><th>In</th><th>Out</th><th class="num">Hours</th><th>Mode</th></tr></thead><tbody>
                ${att.slice(-14).reverse().map(a => `<tr><td class="tiny">${U.fmtD(a.date)}</td><td>${UI.pill(a.status)}</td><td class="tiny mono">${a.in || '—'}</td><td class="tiny mono">${a.out || '—'}</td><td class="num tiny">${a.hours}</td><td class="tiny">${a.mode}</td></tr>`).join('')}
              </tbody></table></div></div>
            <div class="card"><div class="card-h"><h3>Leave history</h3></div><div class="card-b tight">
              ${leaves.map(l => `<div class="feed"><span class="av c2">${icon('calendar', 11)}</span><div class="grow"><div class="txt">${l.typeName} · ${l.days} day${l.days > 1 ? 's' : ''}</div><div class="meta">${U.fmtD(l.from)} → ${U.fmtD(l.to)} · ${U.esc(l.reason)}</div></div>${UI.pill(l.status)}</div>`).join('') || '<div class="tiny muted" style="padding:8px">No leave taken.</div>'}
            </div></div>
          </div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Salary structure</h3></div><div class="card-b">
              ${(() => { const basic = Math.round(e.gross * .5), hra = Math.round(basic * .4), conv = 1600, special = e.gross - basic - hra - conv;
            return `<div class="stat-line"><span class="muted">Basic (50%)</span><b>${U.curFull(basic)}</b></div>
                <div class="stat-line"><span class="muted">HRA (40% of basic)</span><b>${U.curFull(hra)}</b></div>
                <div class="stat-line"><span class="muted">Conveyance</span><b>${U.curFull(conv)}</b></div>
                <div class="stat-line"><span class="muted">Special allowance</span><b>${U.curFull(special)}</b></div>
                <div class="stat-line"><b>Gross monthly</b><b>${U.curFull(e.gross)}</b></div>
                <hr class="hr">
                <div class="stat-line"><span class="muted">PF (12%)</span><b>− ${U.curFull(Math.round(Math.min(basic, 15000) * .12))}</b></div>
                <div class="stat-line"><span class="muted">Professional tax</span><b>− ₹200</b></div>
                <div class="stat-line"><span class="muted">TDS (est.)</span><b>− ${U.curFull(e.gross > 60000 ? Math.round(e.gross * .06) : 0)}</b></div>`; })()}
            </div></div>
            <div class="card"><div class="card-h"><h3>Recent payslips</h3></div><div class="card-b tight">
              ${pay.map(p => `<div class="feed"><span class="av c3">${icon('bank', 11)}</span><div class="grow"><div class="txt">${p.monthLabel}</div><div class="meta">Net ${U.curFull(p.net)} · ${p.status}</div></div><button class="btn sm" data-ps="${p.id}">View</button></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Appraisal — ${appraisal ? appraisal.cycle : 'not started'}</h3></div><div class="card-b">
              ${appraisal ? `<div class="stat-line"><span class="muted">Self rating</span><b>${appraisal.selfRating} / 5</b></div>
              <div class="stat-line"><span class="muted">Manager rating</span><b>${appraisal.managerRating} / 5</b></div>
              <div class="stat-line"><span class="muted">Recommended hike</span><b>${appraisal.hike}%</b></div>
              <div class="stat-line"><span class="muted">Status</span>${UI.pill(appraisal.status)}</div>` : '<div class="tiny muted">No appraisal cycle assigned.</div>'}
            </div></div>
            <div class="card"><div class="card-h"><h3>Skills</h3></div><div class="card-b"><div class="pill-row">${(e.skills || []).map(s => `<span class="tag">${U.esc(s)}</span>`).join('') || '<span class="muted tiny">Not captured</span>'}</div></div></div>
          </div>
        </div>`;
    },
    mount(view, params) {
      const e = S.emp(params.id);
      $('[data-edit]', view).onclick = () => UI.modal({
        title: 'Edit employee', sub: e.name,
        body: `<div class="grid g2 gap10"><div class="field"><label>Designation</label><input class="input" data-des value="${U.attr(e.designation)}"></div>
          <div class="field"><label>Status</label><select class="input" data-s>${['Active', 'Notice Period', 'Resigned'].map(s => `<option ${e.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div class="field"><label>Monthly gross</label><input class="input" type="number" data-g value="${e.gross}"></div>
          <div class="field"><label>Phone</label><input class="input" data-p value="${U.attr(e.phone)}"></div></div>`,
        onOk(ov) {
          const g = U.n($('[data-g]', ov).value);
          S.update('employees', e.id, { designation: $('[data-des]', ov).value, status: $('[data-s]', ov).value, gross: g, ctc: g * 12, phone: $('[data-p]', ov).value });
          S.log('hr', 'updated employee', e.name); UI.toast('Employee updated', 'ok'); MK.render();
        }
      });
      $('[data-payslip]', view).onclick = () => {
        const p = S.db.payroll.find(x => x.employeeId === e.id);
        if (p) MK.payslip(p); else UI.toast('No payroll record yet', 'warn');
      };
      $$('[data-ps]', view).forEach(b => b.onclick = () => MK.payslip(S.byId('payroll', b.getAttribute('data-ps'))));
    }
  });

  /* ---------------------------- ATTENDANCE ----------------------------- */
  MK.route('/hrm/attendance', {
    title: 'Attendance', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Attendance' }],
    render() {
      MK._attMonth = MK._attMonth || U.monthKey(U.today());
      return UI.pageHead('Attendance & shifts', 'Geo-fenced punch-in, shifts, overtime and regularisation',
        `<input class="input" type="month" data-month value="${MK._attMonth}" style="width:auto">
         <button class="btn" data-csv>${icon('download', 14)} Export register</button>
         <button class="btn primary" data-punch>${icon('clock', 14)} Punch in / out</button>`)
        + hrSub('/hrm/attendance')
        + `<div data-host></div>`;
    },
    mount(view) {
      const draw = () => {
        const month = MK._attMonth;
        const rows = MK.Seed.attendance(S.db, month);
        const days = U.uniq(rows.map(r => r.date)).sort();
        const todayRows = rows.filter(r => r.date === U.iso(U.today()));
        const present = rows.filter(r => ['Present', 'Late', 'Work From Home'].includes(r.status)).length;
        const host = $('[data-host]', view);
        // daily matrix (last 14 days)
        const lastDays = days.slice(-14);
        const emps = S.db.employees.filter(e => e.status !== 'Resigned').slice(0, 18);
        host.innerHTML = `<div class="grid g5 mb16">
            ${UI.kpi({ label: 'Punch-ins today', value: todayRows.filter(r => r.in).length, icon: 'clock', foot: todayRows.filter(r => r.status === 'Weekly Off').length + ' weekly off' })}
            ${UI.kpi({ label: 'Present records', value: present, icon: 'checksq', foot: U.pct(present, rows.length) + '% of month' })}
            ${UI.kpi({ label: 'Late marks', value: rows.filter(r => r.status === 'Late').length, icon: 'alert', foot: 'Grace 15 min' })}
            ${UI.kpi({ label: 'Overtime hours', value: U.round(U.sum(rows, r => r.ot), 1), icon: 'trend', foot: 'Payable at 1.5×' })}
            ${UI.kpi({ label: 'WFH days', value: rows.filter(r => r.status === 'Work From Home').length, icon: 'home' })}
          </div>
          <div class="card mb14"><div class="card-h"><h3>Attendance matrix</h3><span class="tiny muted">Last 14 days · headcount sample</span></div>
            <div class="table-wrap"><table class="tbl compact"><thead><tr><th>Employee</th>${lastDays.map(d => `<th class="center" style="min-width:34px">${d.slice(8)}</th>`).join('')}<th class="num">Present</th></tr></thead><tbody>
              ${emps.map(e => {
          const mine = rows.filter(r => r.employeeId === e.id);
          return `<tr><td><div class="row gap6">${UI.av(e.name)}<span class="tiny trunc" style="max-width:130px">${U.esc(e.name)}</span></div></td>
                ${lastDays.map(d => { const r = mine.find(x => x.date === d); const c = !r ? '' : r.status === 'Present' ? '#0E9F6E' : r.status === 'Late' ? '#D97706' : r.status === 'Work From Home' ? '#2563EB' : r.status === 'Leave' ? '#7C3AED' : r.status === 'Weekly Off' ? '#E6E9F0' : r.status === 'Half Day' ? '#F59E0B' : '#DC2626'; return `<td class="center"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c || '#E6E9F0'}" title="${d} ${r ? r.status : '—'}"></span></td>`; }).join('')}
                <td class="num tiny">${mine.filter(x => ['Present', 'Late'].includes(x.status)).length}</td></tr>`;
        }).join('')}
            </tbody></table></div>
            <div class="row gap14 wrap" style="padding:10px 14px;border-top:1px solid var(--line-2)"><div class="legend"><span><i style="background:#0E9F6E"></i>Present</span><span><i style="background:#D97706"></i>Late</span><span><i style="background:#2563EB"></i>WFH</span><span><i style="background:#7C3AED"></i>Leave</span><span><i style="background:#F59E0B"></i>Half day</span><span><i style="background:#DC2626"></i>Absent</span><span><i style="background:#E6E9F0"></i>Weekly off</span></div></div>
          </div>
          <div class="grid g23">
            <div data-tbl></div>
            <div class="col gap14">
              <div class="card"><div class="card-h"><h3>Shifts</h3></div><div class="card-b tight">
                ${S.db.attendanceShifts.map(s => `<div class="feed"><span class="av c2">${icon('clock', 11)}</span><div class="grow"><div class="txt">${s.name}</div><div class="meta">${s.start} – ${s.end} · ${s.hours}h · grace ${s.grace}m</div></div></div>`).join('')}
              </div></div>
              <div class="card"><div class="card-h"><h3>Attendance rules</h3></div><div class="card-b">
                <div class="stat-line"><span class="muted">GPS geo-fence</span><b>${S.db.attendanceRules.geoFence} m</b></div>
                <div class="stat-line"><span class="muted">Selfie punch</span><b>${S.db.attendanceRules.selfie ? 'Required' : 'Off'}</b></div>
                <div class="stat-line"><span class="muted">Weekly off</span><b>${S.db.attendanceRules.weeklyOff}</b></div>
                <div class="stat-line"><span class="muted">Half day below</span><b>${S.db.attendanceRules.halfDayHours} hrs</b></div>
                <div class="stat-line"><span class="muted">OT after</span><b>${S.db.attendanceRules.otAfter} hrs</b></div>
                <div class="stat-line"><span class="muted">Late marks for deduction</span><b>${S.db.attendanceRules.lateMark}</b></div>
              </div></div>
            </div>
          </div>`;
        const tblHost = $('[data-tbl]', host);
        const t = UI.table({
          rows: () => MK.Seed.attendance(S.db, MK._attMonth), pageSize: 10, sortKey: 'date', sortDir: 'desc',
          searchPlaceholder: 'Search employee…', searchText: r => r.employee,
          filters: [{ key: 'status', label: 'Status', options: ['Present', 'Late', 'Absent', 'Leave', 'Half Day', 'Work From Home'] }],
          cols: [
            { key: 'date', label: 'Date', render: r => `<span class="tiny">${U.fmtD(r.date)}</span>` },
            { key: 'employee', label: 'Employee', render: r => `<div class="row gap6">${UI.av(r.employee)}<span class="tiny trunc" style="max-width:130px">${U.esc(r.employee)}</span></div>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'in', label: 'In', render: r => `<span class="mono tiny">${r.in || '—'}</span>` },
            { key: 'out', label: 'Out', render: r => `<span class="mono tiny">${r.out || '—'}</span>` },
            { key: 'hours', label: 'Hours', cls: 'num', render: r => r.hours },
            { key: 'mode', label: 'Mode', render: r => `<span class="tag">${r.mode}</span>` },
            { key: 'geo', label: 'Geo', render: r => r.geo ? '<span class="badge ok">Verified</span>' : '—' }
          ]
        });
        tblHost.innerHTML = ''; tblHost.appendChild(t);
      };
      draw();
      $('[data-month]', view).onchange = (e) => { MK._attMonth = e.target.value; draw(); };
      $('[data-csv]', view).onclick = () => { U.csv('attendance-' + MK._attMonth, MK.Seed.attendance(S.db, MK._attMonth)); UI.toast('Attendance register exported', 'ok'); };
      $('[data-punch]', view).onclick = () => {
        const me = S.empByUser(S.me().id) || S.db.employees[0];
        UI.modal({
          title: 'Punch in / out', sub: 'Geo-verified attendance',
          body: `<div class="note ok">${icon('map', 12)} Location verified: Gurugram HQ (within 250 m geo-fence)</div>
            <div class="grid g2 mt12"><div class="field"><label>Employee</label><input class="input" value="${U.attr(me.name)}" disabled></div>
            <div class="field"><label>Shift</label><input class="input" value="${me.shift}" disabled></div></div>
            <div class="grid g2 mt12"><div class="field"><label>In time</label><input class="input" type="time" data-i value="09:32"></div>
            <div class="field"><label>Out time</label><input class="input" type="time" data-o value="18:41"></div></div>
            <div class="field mt12"><label>Work mode</label><select class="input" data-m><option>Office — biometric</option><option>Work From Home</option><option>Site visit</option></select></div>`,
          okText: 'Save punch', onOk() { S.log('hr', 'punched attendance', me.name + ' · 09:32–18:41'); UI.toast('Attendance recorded', 'ok'); }
        });
      };
    }
  });

  /* ------------------------------- LEAVE ------------------------------- */
  MK.route('/hrm/leave', {
    title: 'Leave', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Leave' }],
    render() {
      const leaves = S.db.leaves;
      const pending = leaves.filter(l => l.status === 'Pending');
      return UI.pageHead('Leave management', `${pending.length} requests pending · ${leaves.filter(l => l.status === 'Approved').length} approved · policy ${S.db.org.leavePolicy}`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-policy>${icon('sliders', 14)} Leave policy</button>
         <button class="btn primary" data-apply>${icon('plus', 14)} Apply leave</button>`)
        + hrSub('/hrm/leave')
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Pending', value: pending.length, icon: 'inbox', foot: 'Awaiting manager' })}
          ${UI.kpi({ label: 'On leave today', value: leaves.filter(l => l.status === 'Approved' && l.from <= U.iso(U.today()) && l.to >= U.iso(U.today())).length, icon: 'calendar' })}
          ${UI.kpi({ label: 'Approved (YTD)', value: leaves.filter(l => l.status === 'Approved').length, icon: 'checksq' })}
          ${UI.kpi({ label: 'Avg days / employee', value: U.round(U.avg(leaves, l => l.days), 1), icon: 'trend' })}
          ${UI.kpi({ label: 'Holidays left', value: S.db.holidays.filter(h => h.date > U.iso(U.today())).length, icon: 'sun' })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Leave types</h3></div><div class="card-b tight">
              ${S.db.leaveTypes.map(t => `<div class="feed"><span class="av" style="background:${t.color}22;color:${t.color}">${t.code}</span><div class="grow"><div class="txt">${t.name}</div><div class="meta">${t.max || '—'} days/yr · carry ${t.carry} · ${t.paid ? 'paid' : 'unpaid'}</div></div></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Holiday calendar</h3></div><div class="card-b tight">
              ${S.db.holidays.map(h => `<div class="feed"><span class="av c5">${U.parse(h.date).getDate()}</span><div class="grow"><div class="txt">${U.esc(h.name)}</div><div class="meta">${U.fmtDL(h.date)} · ${h.type}</div></div></div>`).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.leaves, pageSize: 12, sortKey: 'from', sortDir: 'desc',
          searchPlaceholder: 'Search employee, reason…', searchText: r => [r.employee, r.typeName, r.reason].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] }, { key: 'type', label: 'Type', options: ['EL', 'SL', 'CL', 'CO', 'LOP'] }],
          cols: [
            { key: 'employee', label: 'Employee', render: r => `<div class="row gap6">${UI.av(r.employee)}<div><div class="tiny cell-strong">${U.esc(r.employee)}</div><span class="sub">${U.esc((S.dept(r.deptId) || {}).name || '')}</span></div></div>` },
            { key: 'typeName', label: 'Type', render: r => `<span class="tag">${r.type}</span><span class="sub">${U.esc(r.typeName)}</span>` },
            { key: 'from', label: 'From', render: r => `<span class="tiny">${U.fmtD(r.from)}</span>` },
            { key: 'to', label: 'To', render: r => `<span class="tiny">${U.fmtD(r.to)}</span>` },
            { key: 'days', label: 'Days', cls: 'num', render: r => `<b>${r.days}</b>` },
            { key: 'reason', label: 'Reason', render: r => `<span class="trunc" style="display:inline-block;max-width:180px">${U.esc(r.reason)}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => r.status === 'Pending' ? `<div class="row gap4"><button class="btn sm" data-ok="${r.id}" style="color:var(--ok)">Approve</button><button class="btn sm" data-no="${r.id}" style="color:var(--bad)">Reject</button></div>` : '' }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('leave-register', S.db.leaves); UI.toast('Leave register exported', 'ok'); };
      $('[data-policy]', view).onclick = () => UI.modal({
        title: 'Leave policy', sub: 'Applies to all full-time employees',
        body: `<div class="grid g2 gap10">${S.db.leaveTypes.map(t => `<div class="card"><div class="card-b"><div class="row-between"><b class="sm">${t.name}</b><span class="tag">${t.code}</span></div>
          <div class="tiny muted mt8">Entitlement <b>${t.max || '—'} days</b> · carry forward <b>${t.carry}</b> · ${t.paid ? 'Paid' : 'Unpaid'}</div></div></div>`).join('')}</div>
          <div class="note info mt12">Approval chain: Manager (≤3 days) → HR (all leave). LOP auto-applied beyond balance. Holidays are excluded from leave computation.</div>`,
        okText: 'Edit policy', onOk() { UI.toast('Policy editor opened (demo)', 'info'); }
      });
      $('[data-apply]', view).onclick = () => UI.modal({
        title: 'Apply for leave', sub: 'Routes to manager then HR',
        body: `<div class="col gap10"><div class="field"><label>Employee</label><select class="input" data-e>${S.db.employees.filter(x => x.status !== 'Resigned').map(e => `<option value="${e.id}">${U.esc(e.name)} — ${U.esc(e.designation)}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Leave type</label><select class="input" data-t>${S.db.leaveTypes.map(t => `<option value="${t.code}">${t.name}</option>`).join('')}</select></div>
          <div class="field"><label>Days</label><input class="input" type="number" data-d value="2"></div></div>
          <div class="grid g2"><div class="field"><label>From</label><input class="input" type="date" data-f value="${U.iso(U.addD(U.today(), 2))}"></div>
          <div class="field"><label>To</label><input class="input" type="date" data-to value="${U.iso(U.addD(U.today(), 3))}"></div></div>
          <div class="field"><label>Reason</label><input class="input" data-r placeholder="Family function"></div></div>`,
        onOk(ov) {
          const e = S.emp($('[data-e]', ov).value), code = $('[data-t]', ov).value;
          const lt = S.db.leaveTypes.find(t => t.code === code);
          const l = S.add('leaves', { employeeId: e.id, employee: e.name, deptId: e.deptId, type: code, typeName: lt.name, from: $('[data-f]', ov).value, to: $('[data-to]', ov).value, days: U.n($('[data-d]', ov).value), reason: $('[data-r]', ov).value, status: 'Pending', appliedOn: U.iso(U.today()), approvedBy: '', contact: e.phone, lop: code === 'LOP' });
          S.log('hr', 'applied leave', e.name + ' · ' + l.days + 'd ' + lt.name); UI.toast('Leave applied', 'ok'); draw(); MK.render();
        }
      });
      view.addEventListener('click', e => {
        const ok = e.target.closest('[data-ok]'), no = e.target.closest('[data-no]');
        if (!ok && !no) return;
        const id = (ok || no).getAttribute(ok ? 'data-ok' : 'data-no');
        const l = S.byId('leaves', id);
        S.update('leaves', id, { status: ok ? 'Approved' : 'Rejected', approvedBy: S.me().id });
        S.log('hr', (ok ? 'approved' : 'rejected') + ' leave', l.employee + ' · ' + l.days + 'd');
        UI.toast('Leave ' + (ok ? 'approved' : 'rejected'), ok ? 'ok' : 'warn'); draw(); MK.render();
      });
    }
  });

  /* ------------------------------ PAYROLL ------------------------------ */
  MK.route('/hrm/payroll', {
    title: 'Payroll', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Payroll' }],
    render() {
      const months = U.uniq(S.db.payroll.map(p => p.month)).sort().reverse();
      MK._payMonth = MK._payMonth || months[0];
      return UI.pageHead('Payroll', 'Process salary, PF, ESI, PT and TDS with bank-ready output',
        `<select class="select" data-month style="width:auto">${months.map(m => `<option value="${m}" ${m === MK._payMonth ? 'selected' : ''}>${S.db.payroll.find(p => p.month === m).monthLabel}</option>`).join('')}</select>
         <button class="btn" data-csv>${icon('download', 14)} Bank file</button>
         <button class="btn primary" data-run>${icon('play', 14)} Run payroll</button>`)
        + hrSub('/hrm/payroll')
        + `<div data-host></div>`;
    },
    mount(view) {
      const draw = () => {
        const rows = S.db.payroll.filter(p => p.month === MK._payMonth);
        const host = $('[data-host]', view);
        const net = U.sum(rows, r => r.net), gross = U.sum(rows, r => r.gross), ded = U.sum(rows, r => r.deductions);
        host.innerHTML = `<div class="grid g5 mb16">
            ${UI.kpi({ label: 'Employees', value: rows.length, icon: 'users' })}
            ${UI.kpi({ label: 'Gross payout', value: U.cur(gross), icon: 'wallet' })}
            ${UI.kpi({ label: 'Deductions', value: U.cur(ded), icon: 'minus', foot: 'PF + ESI + PT + TDS' })}
            ${UI.kpi({ label: 'Net payable', value: U.cur(net), icon: 'bank' })}
            ${UI.kpi({ label: 'Status', value: rows[0] ? rows[0].status : '—', icon: 'clock', foot: 'Cycle ' + (rows[0] ? rows[0].monthLabel : '') })}
          </div>
          <div class="grid g23 mb14">
            <div class="card"><div class="card-h"><h3>Statutory summary</h3></div><div class="card-b">
              <div class="grid g2 gap14">
                <div>
                  <div class="stat-line"><span class="muted">PF (employer 12%)</span><b>${U.curFull(U.sum(rows, r => r.pf))}</b></div>
                  <div class="stat-line"><span class="muted">ESI</span><b>${U.curFull(U.sum(rows, r => r.esi))}</b></div>
                  <div class="stat-line"><span class="muted">Professional tax</span><b>${U.curFull(U.sum(rows, r => r.pt))}</b></div>
                  <div class="stat-line"><span class="muted">TDS</span><b>${U.curFull(U.sum(rows, r => r.tds))}</b></div>
                </div><div>
                  <div class="stat-line"><span class="muted">Overtime paid</span><b>${U.curFull(U.sum(rows, r => r.ot))}</b></div>
                  <div class="stat-line"><span class="muted">LOP deduction</span><b>${U.curFull(U.sum(rows, r => r.lopAmt))}</b></div>
                  <div class="stat-line"><span class="muted">Bank transfer mode</span><b>NEFT</b></div>
                  <div class="stat-line"><span class="muted">Cycle</span><b>${rows[0] ? rows[0].monthLabel : '—'}</b></div>
                </div></div>
            </div></div>
            <div class="card"><div class="card-h"><h3>Cost by department</h3></div><div class="card-b">${UI.donut(U.uniq(rows.map(r => r.deptId)).map((d, i) => ({ label: (S.dept(d) || {}).name || '', value: U.sum(rows.filter(r => r.deptId === d), r => r.net), color: (S.dept(d) || {}).color || U.color(i) })), { center: U.cur(net), centerSub: 'net', size: 126 })}</div></div>
          </div>
          <div data-tbl></div>`;
        const t = UI.table({
          rows: () => S.db.payroll.filter(p => p.month === MK._payMonth), pageSize: 12, sortKey: 'net', sortDir: 'desc',
          searchPlaceholder: 'Search employee…', searchText: r => r.employee,
          cols: [
            { key: 'employee', label: 'Employee', render: r => `<div class="row gap6">${UI.av(r.employee)}<div><div class="tiny cell-strong">${U.esc(r.employee)}</div><span class="sub">${U.esc(r.designation)}</span></div></div>` },
            { key: 'present', label: 'Days', cls: 'num', render: r => `${r.present}/${r.days}<span class="sub">${r.lop ? r.lop + ' LOP' : 'no LOP'}</span>` },
            { key: 'basic', label: 'Basic', cls: 'num', render: r => U.curFull(r.basic) },
            { key: 'gross', label: 'Gross', cls: 'num', render: r => `<b>${U.curFull(r.gross)}</b>` },
            { key: 'deductions', label: 'Deductions', cls: 'num', render: r => `− ${U.curFull(r.deductions)}<span class="sub">PF ${U.cur(r.pf)}</span>` },
            { key: 'net', label: 'Net pay', cls: 'num', render: r => `<b style="color:var(--ok)">${U.curFull(r.net)}</b>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-slip="${r.id}">Payslip</button>` }
          ],
          footer: (all) => `<tr><td colspan="3">${all.length} employees</td><td class="num">${U.curFull(U.sum(all, r => r.gross))}</td><td class="num">− ${U.curFull(U.sum(all, r => r.deductions))}</td><td class="num">${U.curFull(U.sum(all, r => r.net))}</td><td colspan="2"></td></tr>`
        });
        const tblHost = $('[data-tbl]', host);
        tblHost.innerHTML = ''; tblHost.appendChild(t);
        tblHost.addEventListener('click', e => { const b = e.target.closest('[data-slip]'); if (b) MK.payslip(S.byId('payroll', b.getAttribute('data-slip'))); });
      };
      draw();
      $('[data-month]', view).onchange = (e) => { MK._payMonth = e.target.value; draw(); };
      $('[data-csv]', view).onclick = () => {
        U.csv('bank-transfer-' + MK._payMonth, S.db.payroll.filter(p => p.month === MK._payMonth).map(p => ({ 'Beneficiary Name': p.employee, 'Account No': (S.emp(p.employeeId) || {}).ac, IFSC: (S.emp(p.employeeId) || {}).ifsc, Amount: p.net, Narration: 'SAL ' + p.month, Mode: 'NEFT' })));
        UI.toast('Bank transfer file generated', 'ok');
      };
      $('[data-run]', view).onclick = () => UI.confirm('Run payroll for ' + MK._payMonth + '?', 'This locks attendance for the cycle, computes PF/ESI/PT/TDS and generates payslips. Existing draft entries will be recalculated.', () => {
        S.db.payroll.filter(p => p.month === MK._payMonth).forEach(p => S.update('payroll', p.id, { status: 'Processed', paidOn: U.iso(U.today()) }));
        S.log('hr', 'processed payroll', 'Cycle ' + MK._payMonth); UI.toast('Payroll processed — payslips generated', 'ok'); draw();
      });
    }
  });

  MK.payslip = function (p) {
    const e = S.emp(p.employeeId) || {};
    UI.modal({
      title: 'Payslip · ' + p.monthLabel, sub: p.employee + ' · ' + p.designation, size: 'wide', okText: 'Print / Save PDF',
      onOk() { window.print(); return false; },
      body: `<div style="background:#fff;border:1px solid var(--line);border-radius:10px;padding:18px">
        <div class="row-between" style="border-bottom:2px solid #0B1220;padding-bottom:10px"><img src="assets/img/logo.svg" style="height:30px">
          <div class="right tiny"><b>${U.esc(S.db.org.name)}</b><br>${U.esc(S.db.org.city)} · GSTIN ${S.db.org.gst}</div></div>
        <div class="row-between mt12"><div><b class="sm">SALARY SLIP — ${p.monthLabel}</b><div class="tiny muted">${U.esc(p.employee)} · ${p.employeeId} · ${U.esc(p.designation)}</div></div>
          <div class="tiny right">Days paid ${p.present}/${p.days}<br>Bank ${e.bank || 'HDFC'} ••${String(e.ac || '').slice(-4)}</div></div>
        <table class="tbl compact mt12"><thead><tr><th>Earnings</th><th class="num">Amount</th><th>Deductions</th><th class="num">Amount</th></tr></thead><tbody>
          ${[['Basic', p.basic, 'Provident Fund', p.pf], ['HRA', p.hra, 'ESI', p.esi], ['Conveyance', p.conv, 'Professional Tax', p.pt], ['Special allowance', p.special, 'TDS', p.tds], ['Overtime', p.ot, 'LOP recovery', p.lopAmt]].map(r => `<tr><td class="tiny">${r[0]}</td><td class="num tiny">${U.curFull(r[1])}</td><td class="tiny">${r[2]}</td><td class="num tiny">${U.curFull(r[3])}</td></tr>`).join('')}
        </tbody><tfoot><tr><td>Total earnings</td><td class="num">${U.curFull(p.gross)}</td><td>Total deductions</td><td class="num">${U.curFull(p.deductions)}</td></tr>
          <tr><td colspan="2"><b>Net payable</b></td><td colspan="2" class="num"><b style="font-size:14px">${U.curFull(p.net)}</b></td></tr></tfoot></table>
        <div class="tiny muted mt12">Net pay in words: Rupees ${Math.round(p.net).toLocaleString('en-IN')} only. This is a computer-generated payslip and does not require signature.</div>
      </div>`
    });
  };

  /* --------------------------- RECRUITMENT ----------------------------- */
  MK.route('/hrm/recruitment', {
    title: 'Recruitment', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Recruitment' }],
    render() {
      const jobs = S.db.jobs, cands = S.db.candidates;
      return UI.pageHead('Recruitment', `${jobs.filter(j => j.status === 'Open').length} open roles · ${cands.length} candidates · ${U.sum(jobs.filter(j => j.status === 'Open'), j => j.openings)} positions to fill`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button><button class="btn primary" data-job>${icon('plus', 14)} Post a job</button>`)
        + hrSub('/hrm/recruitment')
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Open roles', value: jobs.filter(j => j.status === 'Open').length, icon: 'briefcase' })}
          ${UI.kpi({ label: 'Positions', value: U.sum(jobs.filter(j => j.status === 'Open'), j => j.openings), icon: 'users' })}
          ${UI.kpi({ label: 'In interview', value: cands.filter(c => c.stage === 'Interview').length, icon: 'message' })}
          ${UI.kpi({ label: 'Offers out', value: cands.filter(c => c.stage === 'Offer').length, icon: 'send', foot: cands.filter(c => c.stage === 'Hired').length + ' hired' })}
        </div>
        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Hiring funnel</h3></div><div class="card-b">
            ${['Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((st, i) => `<div class="mb12"><div class="row-between tiny"><span>${st}</span><b>${cands.filter(c => c.stage === st).length}</b></div>${UI.bar(U.pct(cands.filter(c => c.stage === st).length, cands.length), i > 2 ? 'green' : '')}</div>`).join('')}
          </div></div>
          <div class="card"><div class="card-h"><h3>Source mix</h3></div><div class="card-b">${UI.donut(U.uniq(cands.map(c => c.source)).map((s, i) => ({ label: s, value: cands.filter(c => c.source === s).length, color: U.color(i) })), { center: cands.length + '', centerSub: 'applicants', size: 124 })}</div></div>
        </div>
        <div class="grid g2 mb14"><div data-tbl-jobs></div><div data-tbl-cands></div></div>`;
    },
    mount(view) {
      const drawJobs = () => {
        const t = UI.table({
          rows: () => S.db.jobs, pageSize: 8, search: false, filters: false,
          cols: [
            { key: 'title', label: 'Role', render: r => `<div class="cell-strong">${U.esc(r.title)}</div><span class="sub">${U.esc((S.dept(r.deptId) || {}).name || '')} · ${r.location} · ${r.exp}</span>` },
            { key: 'openings', label: 'Open', cls: 'num', render: r => `${r.hired}/${r.openings}` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
          ]
        });
        const h = $('[data-tbl-jobs]', view); h.innerHTML = ''; h.appendChild(t);
      };
      const drawCands = () => {
        const t = UI.table({
          rows: () => S.db.candidates, pageSize: 8,
          searchPlaceholder: 'Search candidate…', searchText: r => [r.name, r.role, r.source].join(' '),
          filters: [{ key: 'stage', label: 'Stage', options: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'] }],
          cols: [
            { key: 'name', label: 'Candidate', render: r => `<div class="row gap6">${UI.av(r.name)}<div><div class="tiny cell-strong">${U.esc(r.name)}</div><span class="sub">${U.esc(r.role)}</span></div></div>` },
            { key: 'exp', label: 'Exp', cls: 'num', render: r => r.exp + ' yrs' },
            { key: 'expectedCtc', label: 'Expected', cls: 'num', render: r => U.cur(r.expectedCtc) },
            { key: 'stage', label: 'Stage', render: r => UI.pill(r.stage) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-cand="${r.id}">Open</button>` }
          ]
        });
        const h = $('[data-tbl-cands]', view); h.innerHTML = ''; h.appendChild(t);
      };
      drawJobs(); drawCands();
      $('[data-csv]', view).onclick = () => { U.csv('recruitment', S.db.candidates); UI.toast('Recruitment data exported', 'ok'); };
      $('[data-job]', view).onclick = () => UI.modal({
        title: 'Post a job', sub: 'Publishes to careers page and job boards',
        body: `<div class="col gap10"><div class="field"><label>Job title</label><input class="input" data-t placeholder="Senior Interior Designer"></div>
          <div class="grid g2"><div class="field"><label>Department</label><select class="input" data-d>${S.db.departments.map(d => `<option value="${d.id}">${U.esc(d.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Location</label><select class="input" data-l>${['Gurugram', 'Delhi', 'Noida', 'Mumbai', 'Pune', 'Bengaluru'].map(c => `<option>${c}</option>`).join('')}</select></div></div>
          <div class="grid g2"><div class="field"><label>Experience</label><input class="input" data-e placeholder="5-8 yrs"></div>
          <div class="field"><label>Openings</label><input class="input" type="number" data-o value="1"></div></div>
          <div class="field"><label>Job description</label><textarea class="input" data-des placeholder="Responsibilities, skills, qualifications…"></textarea></div></div>`,
        onOk(ov) {
          S.add('jobs', { code: 'JD-' + (101 + S.db.jobs.length), title: $('[data-t]', ov).value, deptId: $('[data-d]', ov).value, location: $('[data-l]', ov).value, type: 'Full-time', exp: $('[data-e]', ov).value, openings: U.n($('[data-o]', ov).value), status: 'Open', postedOn: U.iso(U.today()), hired: 0, recruiter: S.me().id, budget: 800000, description: $('[data-des]', ov).value });
          S.log('hr', 'posted job', $('[data-t]', ov).value); UI.toast('Job posted', 'ok'); drawJobs();
        }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-cand]'); if (!b) return;
        const c = S.byId('candidates', b.getAttribute('data-cand'));
        UI.drawer({
          title: c.name, sub: c.role + ' · ' + c.location,
          body: `<div class="grid g3 mb16">${UI.kpi({ label: 'Experience', value: c.exp, unit: 'yrs', icon: 'briefcase' })}${UI.kpi({ label: 'Current CTC', value: U.cur(c.currentCtc), icon: 'wallet' })}${UI.kpi({ label: 'Expected', value: U.cur(c.expectedCtc), icon: 'trend' })}</div>
            <dl class="kv"><dt>Email</dt><dd>${U.esc(c.email)}</dd><dt>Phone</dt><dd>${U.esc(c.phone)}</dd><dt>Source</dt><dd>${c.source}</dd>
              <dt>Notice period</dt><dd>${c.notice}</dd><dt>Rating</dt><dd>${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</dd>
              <dt>Applied on</dt><dd>${U.fmtDL(c.appliedOn)}</dd></dl>
            <div class="lbl mt16 mb8">Skills</div><div class="pill-row">${c.skills.map(s => `<span class="tag">${U.esc(s)}</span>`).join('')}</div>
            <div class="lbl mt16 mb8">Move stage</div>
            <div class="pill-row">${['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'].map(s => `<button class="chip ${c.stage === s ? 'on' : ''}" data-cstage="${s}">${s}</button>`).join('')}</div>`,
          footer: `<button class="btn" data-x>Close</button><button class="btn primary" data-hire>${icon('user', 13)} Hire & onboard</button>`,
          onMount(ov, close) {
            $$('[data-cstage]', ov).forEach(x => x.onclick = () => { S.update('candidates', c.id, { stage: x.getAttribute('data-cstage') }); UI.toast('Candidate moved to ' + x.getAttribute('data-cstage'), 'ok'); close(); drawCands(); });
            $('[data-hire]', ov).onclick = () => {
              close();
              S.update('candidates', c.id, { stage: 'Hired' });
              S.add('employees', { id: 'EMP-' + String(S.db.employees.length + 1).padStart(4, '0'), userId: '', name: c.name, email: c.email, phone: c.phone, deptId: 'd1', designation: c.role, roleId: 'site', unitId: 'u1', type: 'Full-time', grade: 'L2', doj: U.iso(U.addD(U.today(), 20)), dob: '', gross: Math.round(c.expectedCtc / 12), status: 'Active', pan: '', aadhaar: '', uan: '', esi: '', bank: 'HDFC', ac: '', ifsc: '', bloodGroup: 'O+', gender: '—', emergency: '', address: c.location, skills: c.skills, leaveBal: { EL: 18, SL: 12, CL: 10 }, ctc: c.expectedCtc, shift: 'General (09:30-18:30)' });
              S.log('hr', 'hired candidate', c.name + ' · ' + c.role); UI.toast('Offer accepted — onboarding checklist created', 'ok'); drawCands();
            };
          }
        });
      });
    }
  });

  /* --------------------------- PERFORMANCE ----------------------------- */
  MK.route('/hrm/performance', {
    title: 'Performance', crumb: () => [{ label: 'HRM', href: '/hrm' }, { label: 'Performance' }],
    render() {
      const ap = S.db.appraisals, tr = S.db.trainings, ts = S.db.timesheets;
      return UI.pageHead('Performance & learning', `${ap.length} appraisals in cycle · ${tr.filter(t => t.status === 'Scheduled').length} trainings scheduled · ${U.round(U.sum(ts, t => t.hours), 0)} hours logged`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button><button class="btn primary" data-cycle>${icon('plus', 14)} Start appraisal cycle</button>`)
        + hrSub('/hrm/performance')
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Completed', value: ap.filter(a => a.status === 'Completed').length, icon: 'checksq', foot: ap.filter(a => a.status !== 'Completed').length + ' pending' })}
          ${UI.kpi({ label: 'Avg manager rating', value: U.round(U.avg(ap, a => a.managerRating), 2), unit: '/ 5', icon: 'award' })}
          ${UI.kpi({ label: 'Avg hike', value: U.round(U.avg(ap, a => a.hike), 1) + '%', icon: 'trend' })}
          ${UI.kpi({ label: 'Trainings', value: S.db.trainings.length, icon: 'graduation', foot: U.sum(tr, t => t.enrolled) + ' enrolments' })}
        </div>
        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Rating distribution</h3></div><div class="card-b">
            ${[1, 2, 3, 4, 5].map(r => `<div class="mb12"><div class="row-between tiny"><span>${r} star${r > 1 ? 's' : ''}</span><b>${ap.filter(a => Math.round(a.managerRating) === r).length}</b></div>${UI.bar(U.pct(ap.filter(a => Math.round(a.managerRating) === r).length, ap.length), r >= 4 ? 'green' : r === 3 ? '' : 'red')}</div>`).join('')}
          </div></div>
          <div class="card"><div class="card-h"><h3>Timesheet by task</h3></div><div class="card-b">${UI.donut(U.uniq(ts.map(t => t.task)).slice(0, 6).map((t, i) => ({ label: t, value: U.sum(ts.filter(x => x.task === t), x => x.hours), text: U.sum(ts.filter(x => x.task === t), x => x.hours) + 'h', color: U.color(i) })), { center: U.round(U.sum(ts, t => t.hours), 0) + 'h', centerSub: 'logged', size: 124 })}</div></div>
        </div>
        <div data-tbl class="mb14"></div>
        <div class="card"><div class="card-h"><h3>Learning &amp; development</h3><span class="badge">${tr.length} programmes</span></div>
          <div class="table-wrap"><table class="tbl"><thead><tr><th>Programme</th><th>Category</th><th>Date</th><th>Mode</th><th>Enrolled</th><th>Status</th></tr></thead><tbody>
            ${tr.map(t => `<tr><td class="cell-strong">${U.esc(t.title)}</td><td><span class="tag">${t.category}</span></td><td class="tiny">${U.fmtDL(t.date)}</td><td class="tiny">${t.mode}</td>
            <td><div class="row gap6" style="min-width:110px">${UI.bar(U.pct(t.enrolled, t.seats))}<span class="tiny">${t.enrolled}/${t.seats}</span></div></td><td>${UI.pill(t.status)}</td></tr>`).join('')}
          </tbody></table></div></div>`;
    },
    mount(view) {
      const t = UI.table({
        rows: () => S.db.appraisals, pageSize: 10,
        searchPlaceholder: 'Search employee…', searchText: r => r.employee,
        filters: [{ key: 'status', label: 'Status', options: ['Completed', 'In Review', 'Pending'] }],
        cols: [
          { key: 'employee', label: 'Employee', render: r => `<div class="row gap6">${UI.av(r.employee)}<div><div class="tiny cell-strong">${U.esc(r.employee)}</div><span class="sub">${r.cycle}</span></div></div>` },
          { key: 'selfRating', label: 'Self', cls: 'num', render: r => r.selfRating + ' / 5' },
          { key: 'managerRating', label: 'Manager', cls: 'num', render: r => `<b>${r.managerRating} / 5</b>` },
          { key: 'hike', label: 'Hike', cls: 'num', render: r => r.hike ? `<b style="color:var(--ok)">${r.hike}%</b>` : '—' },
          { key: 'promotion', label: 'Promotion', render: r => r.promotion ? '<span class="badge purple">Recommended</span>' : '—' },
          { key: 'goals', label: 'Goals', cls: 'num', render: r => `${r.completed}/${r.goals}` },
          { key: 'dueDate', label: 'Due', render: r => `<span class="badge ${U.dueCls(r.dueDate)}">${U.fmtD(r.dueDate)}</span>` },
          { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
        ]
      });
      const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      $('[data-csv]', view).onclick = () => { U.csv('appraisals', S.db.appraisals); UI.toast('Performance data exported', 'ok'); };
      $('[data-cycle]', view).onclick = () => UI.modal({
        title: 'Start appraisal cycle', sub: 'Assign reviewers and goals',
        body: `<div class="grid g2 gap10"><div class="field"><label>Cycle name</label><input class="input" data-n value="FY 26-27 (H2)"></div>
          <div class="field"><label>Due date</label><input class="input" type="date" data-d value="${U.iso(U.addD(U.today(), 45))}"></div></div>
          <div class="note info mt12">All active employees will be added with 4 default goals mapped to their department KPIs. Managers are set from the reporting hierarchy.</div>`,
        okText: 'Start cycle', onOk() { UI.toast('Appraisal cycle started for 56 employees', 'ok'); }
      });
    }
  });
})(window.MK);
