/* Managekaro — Assets, Compliance/QHSE, Masters, Users & Roles, Integrations, Settings, Subscription */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ------------------------------- ASSETS ------------------------------ */
  MK.route('/assets', {
    title: 'Assets', crumb: () => [{ label: 'Assets' }],
    render() {
      const a = S.db.assets;
      return UI.pageHead('Assets & equipment', `${a.length} assets · ${U.cur(U.sum(a, x => x.cost))} book value · ${a.filter(x => x.status === 'Under Repair').length} under repair`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button><button class="btn primary" data-new>${icon('plus', 14)} Add asset</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Total assets', value: a.length, icon: 'package' })}
          ${UI.kpi({ label: 'Book value', value: U.cur(U.sum(a, x => x.cost)), icon: 'wallet' })}
          ${UI.kpi({ label: 'In use', value: a.filter(x => x.status === 'In Use').length, icon: 'checksq' })}
          ${UI.kpi({ label: 'Under repair', value: a.filter(x => x.status === 'Under Repair').length, icon: 'hammer' })}
          ${UI.kpi({ label: 'Warranty expiring', value: a.filter(x => U.diff(x.warrantyTo, U.today()) < 60 && U.diff(x.warrantyTo, U.today()) > 0).length, icon: 'shield' })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>By category</h3></div><div class="card-b">${UI.donut(U.uniq(a.map(x => x.category)).map((c, i) => ({ label: c, value: a.filter(x => x.category === c).length, color: U.color(i) })), { center: a.length + '', centerSub: 'assets', size: 124 })}</div></div>
            <div class="card"><div class="card-h"><h3>Service due</h3></div><div class="card-b tight">
              ${a.filter(x => U.diff(x.lastService, U.today()) > 120).slice(0, 5).map(x => `<div class="feed"><span class="av c5">${icon('hammer', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(x.name)}</div><div class="meta">Last serviced ${U.fmtD(x.lastService)} · ${U.esc(x.condition)}</div></div><button class="btn sm" data-serv="${x.id}">Schedule</button></div>`).join('') || '<div class="tiny muted" style="padding:8px">All assets serviced.</div>'}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.assets, pageSize: 12,
          searchPlaceholder: 'Search asset, code, make…', searchText: r => [r.name, r.code, r.make, r.serial].join(' '),
          filters: [{ key: 'category', label: 'Category', options: U.uniq(S.db.assets.map(a => a.category)) }, { key: 'status', label: 'Status', options: ['In Use', 'In Store', 'Under Repair', 'Retired'] }],
          cols: [
            { key: 'name', label: 'Asset', render: r => `<div class="row gap8">${icon('package', 14)}<div><div class="cell-strong trunc" style="max-width:220px">${U.esc(r.name)}</div><span class="sub mono">${r.code} · ${U.esc(r.make)}</span></div></div>` },
            { key: 'category', label: 'Category', render: r => `<span class="tag">${r.category}</span>` },
            { key: 'assignedTo', label: 'Assigned to', render: r => r.assignedTo ? `<span class="tiny">${U.esc(S.empName(r.assignedTo))}</span>` : '<span class="muted tiny">—</span>' },
            { key: 'projectId', label: 'Project', render: r => r.projectId ? `<span class="tiny trunc" style="display:inline-block;max-width:150px">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` : '—' },
            { key: 'cost', label: 'Cost', cls: 'num', render: r => U.curFull(r.cost) },
            { key: 'condition', label: 'Condition', render: r => `<span class="badge ${r.condition === 'Good' || r.condition === 'Excellent' ? 'ok' : 'warn'}">${r.condition}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-edit="${r.id}">${icon('edit', 11)}</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('asset-register', S.db.assets); UI.toast('Asset register exported', 'ok'); };
      $('[data-new]', view).onclick = () => UI.modal({
        title: 'Add asset', sub: 'Tag, assign and track depreciation',
        body: `<div class="grid g2 gap10"><div class="field span2"><label>Asset name</label><input class="input" data-n placeholder="Scaffolding set 12m"></div>
          <div class="field"><label>Category</label><select class="input" data-c>${['Equipment', 'IT', 'Vehicle', 'Furniture', 'Safety', 'Survey', 'Power Tool', 'Media'].map(c => `<option>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Make</label><input class="input" data-m placeholder="Bosch"></div>
          <div class="field"><label>Cost (₹)</label><input class="input" type="number" data-cost placeholder="48000"></div>
          <div class="field"><label>Purchase date</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div>
          <div class="field"><label>Assign to</label><select class="input" data-a><option value="">— unassigned —</option>${S.db.employees.map(e => `<option value="${e.id}">${U.esc(e.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Project</label><select class="input" data-p><option value="">— none —</option>${S.db.projects.map(p => `<option value="${p.id}">${U.esc(p.code)}</option>`).join('')}</select></div></div>`,
        onOk(ov) {
          S.add('assets', { code: 'AST-' + (1001 + S.db.assets.length), name: $('[data-n]', ov).value, category: $('[data-c]', ov).value, make: $('[data-m]', ov).value, serial: 'SN' + Math.floor(1e6 + Math.random() * 9e6), assignedTo: $('[data-a]', ov).value, projectId: $('[data-p]', ov).value, warehouseId: 'w1', purchaseDate: $('[data-d]', ov).value, cost: U.n($('[data-cost]', ov).value), status: 'In Use', warrantyTo: U.iso(U.addD(U.today(), 365)), condition: 'Good', lastService: U.iso(U.today()) });
          S.log('asset', 'added asset', $('[data-n]', ov).value); UI.toast('Asset added', 'ok'); draw();
        }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-serv]');
        if (b) { S.update('assets', b.getAttribute('data-serv'), { status: 'Under Repair', lastService: U.iso(U.today()) }); UI.toast('Service scheduled', 'ok'); draw(); }
      });
    }
  });

  /* ----------------------------- COMPLIANCE ---------------------------- */
  MK.route('/compliance', {
    title: 'Compliance', crumb: () => [{ label: 'Compliance & QHSE' }],
    render() {
      const safety = S.db.safety;
      return UI.pageHead('Compliance, safety & quality', `${S.db.compliance.filter(c => c.status !== 'Filed').length} statutory filings open · ${safety.filter(s => s.status !== 'Closed').length} safety observations open`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button><button class="btn primary" data-log>${icon('plus', 14)} Log observation</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Filings due', value: S.db.compliance.filter(c => c.status !== 'Filed').length, icon: 'shield', foot: 'Across 6 authorities' })}
          ${UI.kpi({ label: 'Safety incidents', value: safety.filter(s => s.type === 'Incident').length, icon: 'alert', foot: 'Last 60 days' })}
          ${UI.kpi({ label: 'Toolbox talks', value: safety.filter(s => s.type === 'Toolbox Talk').length, icon: 'hardhat' })}
          ${UI.kpi({ label: 'Open observations', value: safety.filter(s => s.status !== 'Closed').length, icon: 'eye' })}
        </div>
        <div class="grid g23">
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Statutory compliance calendar</h3></div>
              <div class="table-wrap"><table class="tbl"><thead><tr><th>Filing</th><th>Period</th><th>Authority</th><th>Due date</th><th>Status</th></tr></thead><tbody>
                ${S.db.compliance.map(c => `<tr><td class="cell-strong">${U.esc(c.name)}</td><td class="tiny">${c.period}</td><td><span class="tag">${c.authority}</span></td>
                <td><span class="badge ${U.dueCls(c.dueDate)}">${U.fmtD(c.dueDate)}</span></td><td>${UI.pill(c.status)}</td></tr>`).join('')}
              </tbody></table></div></div>
            <div class="card"><div class="card-h"><h3>Safety &amp; quality log</h3><span class="badge">${safety.length} entries</span></div>
              <div class="table-wrap" style="max-height:360px"><table class="tbl compact"><thead><tr><th>Date</th><th>Type</th><th>Project</th><th>Observation</th><th>Severity</th><th>Status</th></tr></thead><tbody>
                ${safety.map(s => `<tr><td class="tiny">${U.fmtD(s.date)}</td><td><span class="tag">${s.type}</span></td><td class="tiny trunc" style="max-width:120px">${U.esc(S.projName(s.projectId).split('—')[0].trim())}</td>
                <td class="tiny trunc" style="max-width:230px">${U.esc(s.description)}</td><td>${UI.pill(s.severity)}</td><td>${UI.pill(s.status)}</td></tr>`).join('')}
              </tbody></table></div></div>
          </div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Safety index</h3></div><div class="card-b">
              <div class="row gap10">${UI.ring(86, '86')}<div><b class="sm">Compliant</b><div class="tiny muted">12 safety audits passed this quarter</div></div></div>
              <hr class="hr">
              <div class="stat-line"><span class="muted">Days without incident</span><b>38</b></div>
              <div class="stat-line"><span class="muted">PPE compliance</span><b>94%</b></div>
              <div class="stat-line"><span class="muted">Training coverage</span><b>88%</b></div>
              <div class="stat-line"><span class="muted">Fire NOC validity</span><b>Valid till Dec 26</b></div>
            </div></div>
            <div class="card"><div class="card-h"><h3>Documents due</h3></div><div class="card-b tight">
              ${[['Labour licence renewal', '31 Dec 2026', 'warn'], ['Fire NOC — Amazon BLR8', '30 Nov 2026', 'bad'], ['Contract labour register', '5 Nov 2026', 'warn'], ['PF ECR — Oct', '15 Nov 2026', 'bad']].map(d => `<div class="feed"><span class="av c5">${icon('file', 11)}</span><div class="grow"><div class="txt">${d[0]}</div><div class="meta">Due ${d[1]}</div></div><span class="badge ${d[2]}">Due</span></div>`).join('')}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      $('[data-csv]', view).onclick = () => { U.csv('compliance-register', S.db.compliance); UI.toast('Compliance register exported', 'ok'); };
      $('[data-log]', view).onclick = () => UI.modal({
        title: 'Log safety / quality observation', sub: 'Captured on site, routed to QHSE',
        body: `<div class="col gap10"><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Type</label><select class="input" data-t><option>Toolbox Talk</option><option>Safety Observation</option><option>Near Miss</option><option>Incident</option><option>Inspection</option></select></div>
          <div class="field"><label>Severity</label><select class="input" data-s><option>Low</option><option>Medium</option><option>High</option></select></div></div>
          <div class="field"><label>Observation</label><textarea class="input" data-o placeholder="Describe what you observed…"></textarea></div>
          <div class="field"><label>Corrective action</label><input class="input" data-c placeholder="Action taken"></div></div>`,
        onOk(ov) {
          S.add('safety', { projectId: $('[data-p]', ov).value, date: U.iso(U.today()), type: $('[data-t]', ov).value, severity: $('[data-s]', ov).value, description: $('[data-o]', ov).value, status: 'Open', reportedBy: S.me().id, corrective: $('[data-c]', ov).value });
          S.log('qhse', 'logged safety observation', $('[data-o]', ov).value); UI.toast('Observation logged', 'ok'); MK.render();
        }
      });
    }
  });

  /* ------------------------------ MASTERS ------------------------------ */
  MK.route('/masters', {
    title: 'Masters', crumb: () => [{ label: 'Masters' }],
    render() {
      MK._mtab = MK._mtab || 'items';
      const tabs = [{ id: 'items', label: 'Item / SKU master', count: S.db.items.length }, { id: 'clients', label: 'Clients', count: S.db.clients.length },
      { id: 'units', label: 'Business units', count: S.db.units.length }, { id: 'depts', label: 'Departments', count: S.db.departments.length },
      { id: 'tags', label: 'Tags & categories', count: S.db.tags.length }, { id: 'templates', label: 'Templates' }];
      return UI.pageHead('Masters', 'Item catalogue, clients, units, departments, tags and templates',
        `<button class="btn" data-csv>${icon('download', 14)} Export master</button><button class="btn primary" data-add>${icon('plus', 14)} Add record</button>`)
        + UI.tabs('mst', tabs, MK._mtab) + `<div data-host class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-host]', view);
      const draw = (t) => {
        MK._mtab = t; host.innerHTML = '';
        if (t === 'items') {
          host.appendChild(UI.table({
            rows: () => S.db.items, pageSize: 14, sortKey: 'code',
            searchPlaceholder: 'Search item, code, brand…', searchText: r => [r.code, r.name, r.brand, r.trade].join(' '),
            filters: [{ key: 'trade', label: 'Trade', options: U.uniq(S.db.items.map(i => i.trade)) }, { key: 'type', label: 'Type', options: ['Material', 'Service'] }],
            cols: [
              { key: 'code', label: 'Code', render: r => `<span class="mono tiny cell-strong">${r.code}</span>` },
              { key: 'name', label: 'Item', render: r => `<div class="trunc" style="max-width:290px;font-weight:600">${U.esc(r.name)}</div><span class="sub">${U.esc(r.spec)}</span>` },
              { key: 'trade', label: 'Trade', render: r => `<span class="tag">${U.esc(r.trade)}</span>` },
              { key: 'brand', label: 'Brand', render: r => `<span class="tiny">${U.esc(r.brand)}</span>` },
              { key: 'unit', label: 'UoM', render: r => `<span class="tiny">${r.unit}</span>` },
              { key: 'rate', label: 'Std rate', cls: 'num', render: r => `<b>${U.curFull(r.rate)}</b>` },
              { key: 'gst', label: 'GST', cls: 'num', render: r => r.gst + '%' },
              { key: 'hsn', label: 'HSN', render: r => `<span class="mono tiny">${r.hsn}</span>` },
              { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-item="${r.id}">${icon('edit', 11)}</button>` }
            ]
          }));
        }
        if (t === 'clients') {
          host.appendChild(UI.table({
            rows: () => S.db.clients, pageSize: 12,
            searchPlaceholder: 'Search client, city…', searchText: r => [r.name, r.city, r.contact].join(' '),
            cols: [
              { key: 'name', label: 'Client', render: r => `<div class="row gap8">${UI.av(r.name)}<div><div class="cell-strong">${U.esc(r.name)}</div><span class="sub">${r.type} · ${r.city}</span></div></div>` },
              { key: 'contact', label: 'Contact', render: r => `<span class="tiny">${U.esc(r.contact)}</span><span class="sub">${U.esc(r.email)}</span>` },
              { key: 'gst', label: 'GSTIN', render: r => `<span class="mono tiny">${r.gst}</span>` },
              { key: 'terms', label: 'Terms', render: r => `<span class="tag">${r.terms}</span>` },
              { key: 'rating', label: 'Rating', render: r => `<span class="badge ok">★ ${r.rating}</span>` },
              { key: 'proj', label: 'Projects', cls: 'num', render: r => S.db.projects.filter(p => p.clientId === r.id).length },
              { key: 'val', label: 'Lifetime value', cls: 'num', render: r => U.cur(U.sum(S.db.projects.filter(p => p.clientId === r.id), p => p.contractValue)) }
            ]
          }));
        }
        if (t === 'units') {
          host.innerHTML = `<div class="grid g2">${S.db.units.map(u => `<div class="card"><div class="card-h"><h3>${U.esc(u.name)}</h3>${u.active ? UI.pill('Active') : UI.pill('Inactive')}</div>
            <div class="card-b"><dl class="kv"><dt>Code</dt><dd>${u.code}</dd><dt>Type</dt><dd>${u.type}</dd><dt>City</dt><dd>${u.city}, ${u.state} — ${u.pincode}</dd>
            <dt>GSTIN</dt><dd class="mono tiny">${u.gst}</dd><dt>Head</dt><dd>${U.esc(u.head)}</dd><dt>Seats</dt><dd>${u.seats}</dd><dt>Phone</dt><dd class="tiny">${u.phone}</dd></dl></div></div>`).join('')}</div>`;
        }
        if (t === 'depts') {
          host.innerHTML = `<div class="grid g3">${S.db.departments.map(d => `<div class="card"><div class="card-b">
            <div class="row gap10 mb8"><span class="av" style="background:${d.color}22;color:${d.color}">${U.initials(d.name)}</span><div><b class="sm">${U.esc(d.name)}</b><div class="tiny muted">${S.db.employees.filter(e => e.deptId === d.id).length} people</div></div></div>
            <div class="bar"><span style="width:${U.pct(S.db.employees.filter(e => e.deptId === d.id).length, S.db.employees.length)}%;background:${d.color}"></span></div>
            <div class="row-between tiny mt8"><span class="muted">Monthly cost</span><b>${U.cur(U.sum(S.db.employees.filter(e => e.deptId === d.id), e => e.gross))}</b></div>
          </div></div>`).join('')}</div>`;
        }
        if (t === 'tags') {
          host.innerHTML = `<div class="grid g2">
            <div class="card"><div class="card-h"><h3>Project tags</h3></div><div class="card-b tight">
              ${S.db.tags.map(t => `<div class="feed"><span class="badge ${t.color}">${t.name}</span><span class="grow"></span><span class="tiny muted">${S.db.projects.filter(p => (p.tags || []).includes(t.name)).length} projects</span></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Trades</h3></div><div class="card-b"><div class="pill-row">${S.const.TRADES.map(t => `<span class="tag">${t}</span>`).join('')}</div>
              <hr class="hr"><div class="lbl mb8">Units of measure</div><div class="pill-row">${S.const.UNITS.map(t => `<span class="tag">${t}</span>`).join('')}</div></div></div>
          </div>`;
        }
        if (t === 'templates') {
          host.innerHTML = `<div class="grid g3">${[['BOQ template', 'Corporate fit-out standard BOQ with 54 lines', 'layers'], ['DPR template', 'Sections: manpower, work done, material, blockers, photos', 'camera'],
            ['Snag report template', 'Client-facing layout with committed dates', 'alert'], ['Approval matrix', 'Amount-based chain for 5 document types', 'route'],
            ['Quotation template', 'Branded proposal with cover, scope, terms', 'file'], ['Survey checklist', 'HSE, quality, measurement, technical diligence', 'clipboard']]
            .map(x => `<div class="card"><div class="card-h"><h3>${x[0]}</h3>${icon(x[2], 15)}</div><div class="card-b"><p class="tiny muted">${x[1]}</p><button class="btn sm mt12">Edit template</button></div></div>`).join('')}</div>`;
        }
      };
      draw(MK._mtab);
      U.wireTabs(view, draw);
      $('[data-csv]', view).onclick = () => { U.csv('item-master', S.db.items); UI.toast('Master exported', 'ok'); };
      $('[data-add]', view).onclick = () => UI.modal({
        title: 'Add item to master', sub: 'Available for BOQ, PO and rate contracts', size: 'wide',
        body: `<div class="grid g2 gap10"><div class="field span2"><label>Item name *</label><input class="input" data-n placeholder="Gypsum board partition 12.5mm"></div>
          <div class="field"><label>Code</label><input class="input" data-c placeholder="CIV-GYP-12"></div>
          <div class="field"><label>Trade / category</label><select class="input" data-t>${S.const.TRADES.map(t => `<option>${t}</option>`).join('')}</select></div>
          <div class="field"><label>Unit</label><select class="input" data-u>${S.const.UNITS.map(u => `<option>${u}</option>`).join('')}</select></div>
          <div class="field"><label>Standard rate (₹)</label><input class="input" type="number" data-r placeholder="168"></div>
          <div class="field"><label>Brand / make</label><input class="input" data-b placeholder="Saint-Gobain"></div>
          <div class="field"><label>GST %</label><select class="input" data-g><option>18</option><option>12</option><option>28</option><option>0</option></select></div>
          <div class="field span2"><label>Specification</label><textarea class="input" data-s placeholder="Technical spec, warranty, approved makes…"></textarea></div></div>`,
        onOk(ov) {
          S.add('items', { code: $('[data-c]', ov).value, name: $('[data-n]', ov).value, trade: $('[data-t]', ov).value, unit: $('[data-u]', ov).value, rate: U.n($('[data-r]', ov).value), brand: $('[data-b]', ov).value, hsn: '7308', gst: U.n($('[data-g]', ov).value), type: 'Material', spec: $('[data-s]', ov).value, status: 'Active', lastRate: U.n($('[data-r]', ov).value), category: $('[data-t]', ov).value, stockUom: $('[data-u]', ov).value });
          S.log('master', 'added item', $('[data-n]', ov).value); UI.toast('Item added to master', 'ok'); draw(MK._mtab);
        }
      });
    }
  });

  /* --------------------------- USERS & ROLES --------------------------- */
  MK.route('/users', {
    title: 'Users & Roles', crumb: () => [{ label: 'Users & Roles' }],
    render() {
      const users = S.db.users;
      return UI.pageHead('Users, roles & access', `${users.length} users · ${S.db.roles.length} roles · SSO available on Enterprise`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button><button class="btn primary" data-invite>${icon('plus', 14)} Invite user</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Active users', value: users.filter(u => u.active).length, icon: 'users' })}
          ${UI.kpi({ label: 'Seats used', value: S.db.subscription.used + ' / ' + S.db.subscription.seats, icon: 'lock' })}
          ${UI.kpi({ label: 'Client logins', value: S.db.clients.length, icon: 'globe', foot: 'Portal access' })}
          ${UI.kpi({ label: 'Vendor logins', value: S.db.vendors.length, icon: 'truck', foot: 'Portal access' })}
        </div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="card"><div class="card-h"><h3>Roles & permissions</h3><span class="badge">${S.db.roles.length} roles</span></div>
            <div class="card-b tight">${S.db.roles.map(r => `<div class="feed"><span class="badge ${r.color === 'brand' ? 'brand' : r.color === 'purple' ? 'purple' : r.color === 'info' ? 'info' : r.color === 'ok' ? 'ok' : r.color === 'teal' ? 'teal' : r.color === 'warn' ? 'warn' : ''}">${U.esc(r.id)}</span>
              <div class="grow"><div class="txt">${U.esc(r.name)}</div><div class="meta">${U.esc(r.scope)}</div></div></div>`).join('')}
            </div></div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.users, pageSize: 12,
          searchPlaceholder: 'Search user, email, role…', searchText: r => [r.name, r.email, r.designation].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['Active', 'Inactive'] }],
          cols: [
            { key: 'name', label: 'User', render: r => `<div class="row gap8">${UI.av(r.name)}<div><div class="cell-strong">${U.esc(r.name)}</div><span class="sub">${U.esc(r.email)}</span></div></div>` },
            { key: 'designation', label: 'Designation', render: r => `<span class="tiny">${U.esc(r.designation)}</span><span class="sub">${U.esc((S.dept(r.deptId) || {}).name || '')}</span>` },
            { key: 'roleId', label: 'Role', render: r => { const ro = S.db.roles.find(x => x.id === r.roleId); return `<span class="badge info">${ro ? ro.name : r.roleId}</span>`; } },
            { key: 'unitId', label: 'Unit', render: r => `<span class="tiny">${U.esc((S.byId('units', r.unitId) || {}).code || '—')}</span>` },
            { key: 'lastLogin', label: 'Last login', render: r => `<span class="tiny">${r.lastLogin ? U.ago(r.lastLogin) : '—'}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-user="${r.id}">Manage</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('users', S.db.users.map(u => ({ Name: u.name, Email: u.email, Role: u.roleId, Designation: u.designation, Status: u.status }))); UI.toast('Users exported', 'ok'); };
      $('[data-invite]', view).onclick = () => UI.modal({
        title: 'Invite user', sub: 'Sends email invite with scoped access',
        body: `<div class="col gap10"><div class="field"><label>Email</label><input class="input" data-e placeholder="name@company.com"></div>
          <div class="grid g2"><div class="field"><label>Role</label><select class="input" data-r>${S.db.roles.map(r => `<option value="${r.id}">${U.esc(r.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Business unit</label><select class="input" data-u>${S.db.units.map(u => `<option value="${u.id}">${U.esc(u.name)}</option>`).join('')}</select></div></div>
          <div class="field"><label>Project scope</label><select class="input" data-p><option>All projects</option>${S.db.projects.map(p => `<option>${U.esc(p.code)}</option>`).join('')}</select></div>
          <div class="check"><input type="checkbox" checked> Send WhatsApp onboarding link</div></div>`,
        okText: 'Send invite', onOk(ov) {
          const email = $('[data-e]', ov).value;
          S.add('users', { name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email, phone: '', roleId: $('[data-r]', ov).value, deptId: 'd1', designation: 'Invited user', unitId: $('[data-u]', ov).value, status: 'Active', avatar: U.initials(email), lastLogin: '', active: true, portal: 'internal' });
          S.log('admin', 'invited user', email); UI.toast('Invite sent to ' + email, 'ok'); draw();
        }
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-user]'); if (!b) return;
        const u = S.byId('users', b.getAttribute('data-user'));
        UI.drawer({
          title: u.name, sub: u.email,
          body: `<dl class="kv"><dt>Role</dt><dd>${UI.pill((S.db.roles.find(r => r.id === u.roleId) || {}).name || u.roleId)}</dd>
            <dt>Designation</dt><dd>${U.esc(u.designation)}</dd><dt>Department</dt><dd>${U.esc((S.dept(u.deptId) || {}).name || '')}</dd>
            <dt>Unit</dt><dd>${U.esc((S.byId('units', u.unitId) || {}).name || '')}</dd><dt>Last login</dt><dd>${u.lastLogin ? U.ago(u.lastLogin) : 'Never'}</dd>
            <dt>Status</dt><dd>${UI.pill(u.status)}</dd></dl>
            <hr class="hr"><div class="lbl mb8">Effective permissions</div>
            <div class="pill-row">${((S.db.roles.find(r => r.id === u.roleId) || {}).perms || []).map(p => `<span class="tag">${U.esc(p)}</span>`).join('')}</div>
            <hr class="hr"><div class="lbl mb8">Quick actions</div>
            <div class="col gap8"><button class="btn" data-imp>Impersonate (view as)</button><button class="btn" data-reset>${icon('key', 13)} Reset password</button><button class="btn danger" data-deact>Deactivate</button></div>`,
          footer: '<button class="btn" data-x>Close</button>',
          onMount(ov, close) {
            $('[data-imp]', ov).onclick = () => { S.setUser(u.id); close(); UI.toast('Now viewing as ' + u.name, 'ok'); MK.render(); };
            $('[data-reset]', ov).onclick = () => UI.toast('Password reset link emailed', 'ok');
            $('[data-deact]', ov).onclick = () => { S.update('users', u.id, { status: 'Inactive', active: false }); UI.toast('User deactivated', 'warn'); close(); draw(); };
          }
        });
      });
    }
  });

  /* ---------------------------- INTEGRATIONS --------------------------- */
  MK.route('/integrations', {
    title: 'Integrations', crumb: () => [{ label: 'Integrations' }],
    render() {
      const ints = S.db.integrations;
      return UI.pageHead('Integrations & API', `${ints.filter(i => i.status === 'Connected').length} connected · webhooks, API keys and data sync`,
        `<button class="btn" data-doc>${icon('book', 14)} API docs</button><button class="btn primary" data-webhook>${icon('plus', 14)} Add webhook</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Connected', value: ints.filter(i => i.status === 'Connected').length, icon: 'plug' })}
          ${UI.kpi({ label: 'Available', value: ints.filter(i => i.status === 'Available').length, icon: 'grid' })}
          ${UI.kpi({ label: 'API calls (30d)', value: U.num(S.db.usage.apiCalls, 0), icon: 'activity' })}
          ${UI.kpi({ label: 'Webhooks', value: S.db.webhooks.length, icon: 'link', foot: S.db.webhooks.filter(w => w.active).length + ' active' })}
        </div>
        <div class="grid g3 mb16">${ints.map(i => `<div class="card"><div class="card-b">
          <div class="row-between mb8"><span class="av" style="background:${i.color}18;color:${i.color}">${icon(i.icon, 15)}</span>${i.status === 'Connected' ? '<span class="badge ok">Connected</span>' : '<span class="badge">Available</span>'}</div>
          <b class="sm">${U.esc(i.name)}</b><div class="tiny muted mt4">${U.esc(i.desc)}</div>
          <div class="row-between mt12"><span class="tiny muted">${i.cat} · ${i.lastSync}</span><button class="btn sm" data-int="${i.id}">${i.status === 'Connected' ? 'Manage' : 'Connect'}</button></div>
        </div></div>`).join('')}</div>
        <div class="grid g2">
          <div class="card"><div class="card-h"><h3>Webhooks</h3></div><div class="card-b tight">
            ${S.db.webhooks.map(w => `<div class="feed"><span class="av c2">${icon('link', 11)}</span><div class="grow"><div class="txt">${U.esc(w.name)}</div><div class="meta mono tiny">${U.esc(w.event)} → ${U.esc(w.url.slice(0, 38))}…</div></div>${w.active ? '<span class="badge ok">Active</span>' : '<span class="badge">Off</span>'}</div>`).join('')}
          </div></div>
          <div class="card"><div class="card-h"><h3>API keys</h3></div><div class="card-b tight">
            ${S.db.apiKeys.map(k => `<div class="feed"><span class="av c5">${icon('key', 11)}</span><div class="grow"><div class="txt">${U.esc(k.label)}</div><div class="meta mono tiny">${k.key} · last used ${k.lastUsed}</div></div><span class="badge info">${k.scopes.length} scopes</span></div>`).join('')}
            <div class="copy mt12"><span>POST https://api.managekaro.com/v1/purchase-orders</span><button data-copy>Copy</button></div>
          </div></div>
        </div>`;
    },
    mount(view) {
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-int]'); if (!b) return;
        const i = S.byId('integrations', b.getAttribute('data-int'));
        if (i.status === 'Connected') { UI.toast(i.name + ' is connected and healthy', 'ok'); return; }
        UI.confirm('Connect ' + i.name + '?', 'You will be redirected to authorise Managekaro. Data sync begins immediately after authorisation.', () => {
          S.update('integrations', i.id, { status: 'Connected', lastSync: 'Just now' });
          S.log('admin', 'connected integration', i.name); UI.toast(i.name + ' connected', 'ok'); MK.render();
        });
      });
      const c = view.querySelector('[data-copy]');
      if (c) c.onclick = () => { navigator.clipboard && navigator.clipboard.writeText('POST https://api.managekaro.com/v1/purchase-orders'); UI.toast('Endpoint copied', 'ok'); };
      $('[data-doc]', view).onclick = () => UI.modal({
        title: 'Managekaro API', sub: 'REST · JSON · token auth',
        body: `<div class="col gap8"><div class="lbl">Authentication</div><div class="copy"><span>Authorization: Bearer mk_live_…</span></div>
          <div class="lbl mt8">Endpoints</div>
          ${[['GET', '/projects'], ['GET', '/projects/:id/boq'], ['POST', '/purchase-orders'], ['GET', '/invoices'], ['POST', '/snags'], ['GET', '/employees'], ['POST', '/attendance/punch'], ['GET', '/analytics/portfolio']].map(x => `<div class="row-between tiny" style="padding:5px 0;border-bottom:1px solid var(--line-2)"><span><span class="badge ${x[0] === 'GET' ? 'info' : 'ok'}" style="font-size:9.5px">${x[0]}</span> <span class="mono">${x[1]}</span></span></div>`).join('')}
        </div>`, size: 'wide', footer: '<button class="btn" data-x>Close</button>'
      });
      $('[data-webhook]', view).onclick = () => UI.modal({
        title: 'Add webhook', sub: 'Push events to your systems',
        body: `<div class="col gap10"><div class="field"><label>Name</label><input class="input" data-n placeholder="PO approved → Slack"></div>
          <div class="field"><label>Event</label><select class="input" data-e>${['po.approved', 'po.created', 'grn.posted', 'invoice.received', 'progress.updated', 'snag.raised', 'approval.pending', 'payroll.processed'].map(x => `<option>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Endpoint URL</label><input class="input" data-u placeholder="https://hooks.example.com/mk"></div></div>`,
        onOk(ov) { S.add('webhooks', { name: $('[data-n]', ov).value, event: $('[data-e]', ov).value, url: $('[data-u]', ov).value, active: true }); UI.toast('Webhook created', 'ok'); MK.render(); }
      });
    }
  });

  /* ------------------------------ SETTINGS ----------------------------- */
  MK.route('/settings', {
    title: 'Settings', crumb: () => [{ label: 'Settings' }],
    render() {
      MK._settab = MK._settab || 'org';
      const tabs = [{ id: 'org', label: 'Organisation' }, { id: 'units', label: 'Business units' }, { id: 'approvals', label: 'Approval rules' }, { id: 'dpr', label: 'DPR & templates' }, { id: 'data', label: 'Data & backup' }, { id: 'audit', label: 'Audit log' }];
      return UI.pageHead('Settings', 'Organisation profile, approval hierarchy, templates and data controls')
        + UI.tabs('set', tabs, MK._settab) + `<div data-host class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-host]', view);
      const draw = (t) => {
        MK._settab = t; host.innerHTML = '';
        const o = S.db.org;
        if (t === 'org') {
          host.innerHTML = `<div class="grid g23"><div class="card"><div class="card-h"><h3>Organisation profile</h3><button class="btn sm primary" data-save>Save changes</button></div>
            <div class="card-b"><div class="grid g2 gap10">
              <div class="field span2"><label>Legal name</label><input class="input" data-f="legal" value="${U.attr(o.legal)}"></div>
              <div class="field"><label>Trade name</label><input class="input" data-f="name" value="${U.attr(o.name)}"></div>
              <div class="field"><label>GSTIN</label><input class="input" data-f="gst" value="${o.gst}"></div>
              <div class="field"><label>PAN</label><input class="input" data-f="pan" value="${o.pan}"></div>
              <div class="field"><label>CIN</label><input class="input" data-f="cin" value="${o.cin}"></div>
              <div class="field span2"><label>Registered address</label><textarea class="input" data-f="address">${U.esc(o.address)}</textarea></div>
              <div class="field"><label>City</label><input class="input" data-f="city" value="${o.city}"></div>
              <div class="field"><label>State</label><input class="input" data-f="state" value="${o.state}"></div>
              <div class="field"><label>Phone</label><input class="input" data-f="phone" value="${o.phone}"></div>
              <div class="field"><label>Email</label><input class="input" data-f="email" value="${o.email}"></div>
              <div class="field"><label>Fiscal year start</label><select class="input" data-f="fiscalStart"><option ${o.fiscalStart === 'April' ? 'selected' : ''}>April</option><option>January</option></select></div>
              <div class="field"><label>Currency</label><select class="input" data-f="currency"><option>INR</option><option>AED</option><option>SAR</option><option>USD</option></select></div>
              <div class="field"><label>Work week</label><input class="input" data-f="workWeek" value="${U.attr(o.workWeek)}"></div>
              <div class="field"><label>Shift</label><input class="input" data-f="shift" value="${U.attr(o.shift)}"></div>
            </div></div></div>
            <div class="col gap14">
              <div class="card"><div class="card-h"><h3>Branding</h3></div><div class="card-b">
                <div class="row gap10"><img src="assets/img/logo.svg" style="height:36px;border:1px solid var(--line);border-radius:8px;padding:4px;background:#fff"><div><b class="sm">Managekaro</b><div class="tiny muted">Primary logo · SVG</div></div></div>
                <button class="btn sm mt12">${icon('upload', 12)} Replace logo</button>
                <div class="lbl mt16 mb8">Accent colour</div>
                <div class="row gap6">${['#F2540B', '#2563EB', '#0E9F6E', '#7C3AED', '#0D9488', '#0B1220'].map(c => `<span style="width:24px;height:24px;border-radius:7px;background:${c};cursor:pointer;border:2px solid ${c === '#F2540B' ? '#fff' : 'transparent'};box-shadow:var(--sh-1)"></span>`).join('')}</div>
              </div></div>
              <div class="card"><div class="card-h"><h3>Localisation</h3></div><div class="card-b">
                <div class="field mb12"><label>Timezone</label><select class="input"><option>Asia/Kolkata (GMT+5:30)</option><option>Asia/Dubai (GMT+4)</option><option>Asia/Riyadh (GMT+3)</option></select></div>
                <div class="field"><label>Number format</label><select class="input"><option>Indian (₹1,00,00,000)</option><option>International (₹10,000,000)</option></select></div>
              </div></div>
            </div></div>`;
          const save = $('[data-save]', host);
          save.onclick = () => {
            const patch = {};
            $$('[data-f]', host).forEach(i => patch[i.getAttribute('data-f')] = i.value);
            S.db.org = Object.assign(S.db.org, patch); S.save();
            S.log('settings', 'updated organisation profile', patch.name); UI.toast('Organisation settings saved', 'ok');
          };
        }
        if (t === 'units') {
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Business units & GSTINs</h3><button class="btn sm primary" data-addunit>${icon('plus', 12)} Add unit</button></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Unit</th><th>Code</th><th>Type</th><th>City</th><th>GSTIN</th><th>Head</th><th class="num">Seats</th><th>Status</th><th></th></tr></thead><tbody>
              ${S.db.units.map(u => `<tr><td class="cell-strong">${U.esc(u.name)}</td><td class="mono tiny">${u.code}</td><td><span class="tag">${u.type}</span></td><td class="tiny">${u.city}</td>
              <td class="mono tiny">${u.gst}</td><td class="tiny">${U.esc(u.head)}</td><td class="num">${u.seats}</td><td>${UI.pill(u.active ? 'Active' : 'Inactive')}</td>
              <td><button class="btn sm" data-toggle="${u.id}">${u.active ? 'Disable' : 'Enable'}</button></td></tr>`).join('')}
            </tbody></table></div></div>`;
          $$('[data-toggle]', host).forEach(b => b.onclick = () => {
            const u = S.byId('units', b.getAttribute('data-toggle'));
            S.update('units', u.id, { active: !u.active }); UI.toast('Unit ' + (u.active ? 'enabled' : 'disabled'), 'ok'); draw('units');
          });
          $('[data-addunit]', host).onclick = () => UI.modal({
            title: 'Add business unit', sub: 'Each unit can have its own GSTIN',
            body: `<div class="grid g2 gap10"><div class="field span2"><label>Unit name</label><input class="input" data-n placeholder="Hyderabad Branch"></div>
              <div class="field"><label>Code</label><input class="input" data-c placeholder="HYD"></div><div class="field"><label>City</label><input class="input" data-city placeholder="Hyderabad"></div>
              <div class="field"><label>State</label><input class="input" data-s placeholder="Telangana"></div><div class="field"><label>GSTIN</label><input class="input" data-g placeholder="36AABCM1234K1Z9"></div>
              <div class="field"><label>Type</label><select class="input" data-t><option>Branch</option><option>Head Office</option><option>Site Store</option><option>Delivery / Workshop</option></select></div>
              <div class="field"><label>Seats</label><input class="input" type="number" data-seat value="12"></div></div>`,
            onOk(ov) {
              S.add('units', { name: $('[data-n]', ov).value, code: $('[data-c]', ov).value, city: $('[data-city]', ov).value, state: $('[data-s]', ov).value, pincode: '', gst: $('[data-g]', ov).value, type: $('[data-t]', ov).value, head: S.me().name, seats: U.n($('[data-seat]', ov).value), phone: '', active: true });
              UI.toast('Business unit added', 'ok'); draw('units');
            }
          });
        }
        if (t === 'approvals') {
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Approval hierarchy</h3><button class="btn sm primary" data-addrule>${icon('plus', 12)} Add rule</button></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Rule</th><th>Module</th><th>Condition</th><th>Approval chain</th><th>Status</th><th></th></tr></thead><tbody>
              ${S.db.approvalRules.map(r => `<tr><td class="cell-strong">${U.esc(r.name)}</td><td><span class="tag">${r.module}</span></td><td class="tiny">${U.esc(r.cond)}</td>
              <td><span class="badge info plain">${U.esc(r.chain)}</span></td><td>${r.active ? UI.pill('Active') : UI.pill('Off')}</td>
              <td><button class="switch ${r.active ? 'on' : ''}" data-rule="${r.id}"></button></td></tr>`).join('')}
            </tbody></table></div></div>
            <div class="note info mt12">${icon('route', 12)} Rules evaluate top-down. First match wins. Amount thresholds are per document, before tax.</div>`;
          $$('[data-rule]', host).forEach(b => b.onclick = () => {
            const r = S.byId('approvalRules', b.getAttribute('data-rule'));
            S.update('approvalRules', r.id, { active: !r.active }); b.classList.toggle('on'); UI.toast('Rule ' + (r.active ? 'enabled' : 'disabled'), 'ok');
          });
          $('[data-addrule]', host).onclick = () => UI.modal({
            title: 'Add approval rule', sub: 'Amount and role based routing',
            body: `<div class="col gap10"><div class="field"><label>Rule name</label><input class="input" data-n placeholder="PO above ₹25 L — Director + CFO"></div>
              <div class="grid g2"><div class="field"><label>Module</label><select class="input" data-m>${['Purchase Order', 'Vendor Invoice', 'Purchase Request', 'Change Order', 'Expense', 'Leave'].map(m => `<option>${m}</option>`).join('')}</select></div>
              <div class="field"><label>Threshold (₹)</label><input class="input" type="number" data-t placeholder="2500000"></div></div>
              <div class="field"><label>Approval chain</label><input class="input" data-c placeholder="PM → Procurement Head → Director → CFO"></div></div>`,
            onOk(ov) { S.add('approvalRules', { name: $('[data-n]', ov).value, module: $('[data-m]', ov).value, cond: 'Amount ≥ ₹' + U.num($('[data-t]', ov).value, 0), chain: $('[data-c]', ov).value, active: true }); UI.toast('Approval rule created', 'ok'); draw('approvals'); }
          });
        }
        if (t === 'dpr') {
          host.innerHTML = `<div class="grid g2"><div class="card"><div class="card-h"><h3>DPR template</h3></div><div class="card-b">
            ${['Manpower summary', 'Work done by area', 'Material inward / outward', 'Site blockers', 'Photographs (geo-tagged)', 'Safety observations', 'Next day plan'].map((s, i) => `<div class="row-between" style="padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px"><span class="sm">${i + 1}. ${s}</span><button class="switch on"></button></div>`).join('')}
            <button class="btn sm mt8">${icon('plus', 12)} Add section</button>
          </div></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Distribution</h3></div><div class="card-b">
              <label class="check mb8"><input type="checkbox" checked> Auto-send to client WhatsApp group</label>
              <label class="check mb8"><input type="checkbox" checked> Email PDF to subscribers at 19:00</label>
              <label class="check mb8"><input type="checkbox"> Include cost data in client copy</label>
              <label class="check"><input type="checkbox" checked> Require photo before submit</label>
            </div></div>
            <div class="card"><div class="card-h"><h3>Numbering & templates</h3></div><div class="card-b">
              <div class="field mb12"><label>DPR format</label><input class="input" value="DPR/{PROJECT}/{YYYY}{MM}{DD}"></div>
              <div class="field mb12"><label>PO format</label><input class="input" value="PO/{FY}/{SEQ}"></div>
              <div class="field"><label>Invoice format</label><input class="input" value="MKINV/{FY}/{SEQ}"></div>
            </div></div>
          </div></div>`;
        }
        if (t === 'data') {
          const size = (JSON.stringify(S.db).length / 1024 / 1024).toFixed(2);
          host.innerHTML = `<div class="grid g2"><div class="card"><div class="card-h"><h3>Data & backup</h3></div><div class="card-b">
            <div class="stat-line"><span class="muted">Workspace size</span><b>${size} MB</b></div>
            <div class="stat-line"><span class="muted">Records</span><b>${U.num(Object.keys(S.db).reduce((a, k) => a + (Array.isArray(S.db[k]) ? S.db[k].length : 0), 0), 0)}</b></div>
            <div class="stat-line"><span class="muted">Storage used</span><b>${S.db.subscription.storageUsed} GB of ${S.db.subscription.storageTotal} GB</b></div>
            <hr class="hr">
            <div class="row gap8 wrap"><button class="btn" data-backup>${icon('download', 13)} Download full backup (JSON)</button>
            <button class="btn" data-export-all>${icon('sheet', 13)} Export all CSVs</button></div>
            <div class="alert mt12">Danger zone — resetting restores the seeded demo dataset and discards your edits.</div>
            <div class="row gap8 mt8"><button class="btn danger" data-reset>${icon('refresh', 13)} Reset demo data</button><button class="btn danger" data-wipe>${icon('trash', 13)} Clear all data</button></div>
          </div></div>
          <div class="card"><div class="card-h"><h3>Record counts</h3></div><div class="card-b tight"><div class="table-wrap" style="max-height:360px"><table class="tbl compact"><thead><tr><th>Entity</th><th class="num">Records</th></tr></thead><tbody>
            ${Object.keys(S.db).filter(k => Array.isArray(S.db[k])).sort().map(k => `<tr><td class="tiny">${k}</td><td class="num tiny">${S.db[k].length}</td></tr>`).join('')}
          </tbody></table></div></div></div></div>`;
          $('[data-backup]', host).onclick = () => { U.download('managekaro-backup-' + U.iso(U.today()) + '.json', JSON.stringify(S.db, null, 2), 'application/json'); UI.toast('Backup downloaded', 'ok'); };
          $('[data-export-all]', host).onclick = () => {
            ['projects', 'boq', 'pos', 'invoices', 'employees', 'payroll', 'snags'].forEach(k => S.db[k] && U.csv(k, S.db[k]));
            UI.toast('CSV pack generated (7 files)', 'ok');
          };
          $('[data-reset]', host).onclick = () => UI.confirm('Reset demo data?', 'Your edits will be lost and the seeded dataset restored.', () => { S.reset(); UI.toast('Demo data restored', 'ok'); MK.go('/dashboard'); }, true);
          $('[data-wipe]', host).onclick = () => UI.confirm('Clear all data?', 'All records will be removed from this browser.', () => { S.clearAll(); UI.toast('All data cleared', 'bad'); MK.go('/dashboard'); }, true);
        }
        if (t === 'audit') {
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Audit log</h3><span class="tiny muted">${S.db.activityLog.length} events · immutable</span></div>
            <div class="table-wrap" style="max-height:520px"><table class="tbl compact"><thead><tr><th>Time</th><th>User</th><th>Role</th><th>Module</th><th>Action</th><th>Detail</th></tr></thead><tbody>
              ${S.db.activityLog.map(l => `<tr><td class="tiny">${U.fmtDT(l.at)}</td><td class="tiny">${U.esc(l.user)}</td><td class="tiny">${U.esc(l.role)}</td><td><span class="tag">${U.esc(l.module)}</span></td>
              <td class="tiny">${U.esc(l.action)}</td><td class="tiny trunc" style="max-width:260px">${U.esc(l.detail)}</td></tr>`).join('')}
            </tbody></table></div></div>`;
        }
      };
      draw(MK._settab);
      U.wireTabs(view, draw);
    }
  });

  /* --------------------------- SUBSCRIPTION ---------------------------- */
  MK.route('/subscription', {
    title: 'Plan & Billing', crumb: () => [{ label: 'Plan & Billing' }],
    render() {
      const sub = S.db.subscription;
      return UI.pageHead('Plan & billing', `${sub.plan} plan · renews ${U.fmtDL(sub.renewal)} · ${sub.seats - sub.used} seats available`,
        `<button class="btn" data-invoice>${icon('receipt', 14)} Billing history</button><button class="btn primary" data-seats>${icon('users', 14)} Manage seats</button>`)
        + `<div class="hero-strip mb16"><div class="row-between wrap">
          <div><h2>${sub.plan} plan · ${sub.billing}</h2><p>${sub.seats} seats (${sub.used} used) · ${sub.storageUsed} GB of ${sub.storageTotal} GB storage · add-ons: ${sub.addons.join(', ')}</p></div>
          <div class="right"><div style="font-size:26px;font-weight:800;color:#fff">${U.cur(sub.mrr)}<span style="font-size:13px;color:#A9B3C8">/mo</span></div><span class="badge ok">${sub.status}</span></div>
        </div></div>
        <div class="grid g3 mb16">${S.db.plans.map(p => `<div class="card ${p.id === 'enterprise' ? '' : ''}" style="${p.id === 'enterprise' ? 'border-color:var(--brand);box-shadow:var(--sh-brand)' : ''}">
          <div class="card-h"><h3>${p.name}</h3>${p.id === 'enterprise' ? '<span class="badge brand">Current</span>' : p.popular ? '<span class="badge info">Popular</span>' : ''}</div>
          <div class="card-b"><div style="font-size:22px;font-weight:800;letter-spacing:-.03em">${p.price ? U.curFull(p.price) + '<small class="tiny muted"> /mo</small>' : 'Custom'}</div>
            <div class="tiny muted mt4">${p.users >= 999 ? 'Unlimited users' : p.users + ' users'} · ${p.projects >= 999 ? 'unlimited projects' : p.projects + ' projects'} · ${p.storage}</div>
            <ul style="margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">${p.features.slice(0, 5).map(f => `<li class="tiny" style="display:flex;gap:6px">${icon('check', 11)}<span>${U.esc(f)}</span></li>`).join('')}</ul>
            <button class="btn ${p.id === 'enterprise' ? 'primary' : ''} block mt12" data-plan="${p.id}">${p.id === 'enterprise' ? 'Current plan' : 'Switch plan'}</button>
          </div></div>`).join('')}</div>
        <div class="grid g23">
          <div class="card"><div class="card-h"><h3>Usage this billing cycle</h3></div><div class="card-b">
            ${[['Active users', S.db.usage.activeUsers, sub.seats], ['Live projects', S.db.usage.projectsLive, 200], ['DPRs this month', S.db.usage.dprsThisMonth, 400], ['Documents', S.db.usage.documents, 2000], ['AI Copilot queries', S.db.usage.copilotQueries, 500]].map(x => `<div class="mb12"><div class="row-between tiny"><span>${x[0]}</span><b>${x[1]} / ${x[2]}</b></div>${UI.bar(U.pct(x[1], x[2]), U.pct(x[1], x[2]) > 80 ? 'red' : '')}</div>`).join('')}
          </div></div>
          <div class="card"><div class="card-h"><h3>Add-ons</h3></div><div class="card-b tight">
            ${[['AI Copilot', 'Included', true], ['WhatsApp alerts', 'Included', true], ['Client portal', 'Included', true], ['Extra storage (1 TB)', '₹4,000/mo', false], ['Dedicated CSM', '₹18,000/mo', false]].map(a => `<div class="feed"><span class="av c2">${icon('zap', 11)}</span><div class="grow"><div class="txt">${a[0]}</div><div class="meta">${a[1]}</div></div><button class="switch ${a[2] ? 'on' : ''}"></button></div>`).join('')}
          </div></div>
        </div>`;
    },
    mount(view) {
      $$('[data-plan]', view).forEach(b => b.onclick = () => {
        const p = S.byId('plans', b.getAttribute('data-plan'));
        if (p.id === 'enterprise') { UI.toast('You are already on Enterprise', 'info'); return; }
        UI.confirm('Switch to ' + p.name + '?', 'Billing is prorated from today. Features not included in the new plan are disabled at the end of the cycle.', () => {
          S.db.subscription.plan = p.name; S.db.subscription.mrr = p.price; S.save();
          S.log('admin', 'changed plan', p.name); UI.toast('Plan switched to ' + p.name, 'ok'); MK.render();
        });
      });
      $('[data-seats]', view).onclick = () => UI.modal({
        title: 'Manage seats', sub: 'Add or reduce user licences',
        body: `<div class="field"><label>Seats</label><input class="input" type="number" data-s value="${S.db.subscription.seats}"></div>
          <div class="note info mt12">Each additional seat is billed at ₹449/month, prorated for the cycle. Client and vendor portal logins are free.</div>`,
        onOk(ov) { S.db.subscription.seats = U.n($('[data-s]', ov).value); S.save(); UI.toast('Seats updated', 'ok'); MK.render(); }
      });
      $('[data-invoice]', view).onclick = () => UI.modal({
        title: 'Billing history', sub: 'GST invoices from Managekaro Technologies',
        body: `<table class="tbl compact"><thead><tr><th>Invoice</th><th>Date</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead><tbody>
          ${[1, 2, 3, 4].map(i => `<tr><td class="mono tiny">MKSUB/26/${String(120 + i)}</td><td class="tiny">${U.fmtD(U.addD(U.today(), -30 * i))}</td><td class="num tiny">${U.curFull(39999 * 1.18)}</td><td><span class="badge ok">Paid</span></td><td><button class="btn sm" onclick="window.print()">PDF</button></td></tr>`).join('')}
        </tbody></table>`, footer: '<button class="btn" data-x>Close</button>'
      });
    }
  });
})(window.MK);
