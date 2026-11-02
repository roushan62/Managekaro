/* Managekaro — CRM (leads, pipeline, site visits) & Quotations */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  const STAGES = ['New', 'Qualified', 'Site Visit', 'Proposal Sent', 'Negotiation', 'Won'];

  MK.route('/crm', {
    title: 'CRM & Leads', crumb: () => [{ label: 'CRM & Leads' }],
    render() {
      const leads = S.db.leads;
      const open = leads.filter(l => l.stage !== 'Won');
      const pipeline = U.sum(open, l => l.value * l.probability / 100);
      const won = leads.filter(l => l.stage === 'Won');
      return UI.pageHead('CRM & pipeline', `${open.length} live leads · ${U.cur(pipeline)} weighted pipeline · ${U.cur(U.sum(won, l => l.value))} won`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-visit>${icon('map', 14)} Log site visit</button>
         <button class="btn primary" data-lead>${icon('plus', 14)} New lead</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Live leads', value: open.length, icon: 'target', foot: leads.filter(l => l.stage === 'New').length + ' new this month' })}
          ${UI.kpi({ label: 'Weighted pipeline', value: U.cur(pipeline), icon: 'trend', foot: 'Probability adjusted' })}
          ${UI.kpi({ label: 'Won value', value: U.cur(U.sum(won, l => l.value)), icon: 'award', foot: won.length + ' conversions' })}
          ${UI.kpi({ label: 'Win rate', value: Math.round(U.pct(won.length, leads.length)) + '%', icon: 'percent', foot: 'Last 90 days' })}
          ${UI.kpi({ label: 'Avg deal size', value: U.cur(U.avg(leads, l => l.value)), icon: 'wallet' })}
        </div>
        <div class="card mb14"><div class="card-h"><h3>Pipeline board</h3><div class="row gap6"><span class="tag">Drag between stages in full version</span></div></div>
          <div class="card-b"><div class="kanban">
            ${STAGES.map(st => `<div class="kcol"><h5>${st}<span>${leads.filter(l => l.stage === st).length}</span></h5>
              ${leads.filter(l => l.stage === st).slice(0, 4).map(l => `<div class="kcard" data-leadview="${l.id}"><div class="t">${U.esc(l.company)}</div>
                <div class="row-between tiny muted"><span>${U.cur(l.value)}</span><span>${l.probability}%</span></div>
                <div class="row gap6 mt8"><span class="tag">${l.source}</span><span class="tag">${l.city}</span></div>
                <div class="row-between mt8 tiny"><span class="row gap4">${UI.av(l.contact)}${U.esc(l.contact.split(' ')[0])}</span><span class="badge ${U.dueCls(l.nextFollowup)}">${U.fmtD(l.nextFollowup)}</span></div></div>`).join('') || '<div class="tiny muted" style="padding:6px 4px">—</div>'}
              <div class="tiny muted" style="padding:6px 4px;border-top:1px dashed var(--line);margin-top:4px">${U.cur(U.sum(leads.filter(l => l.stage === st), l => l.value))}</div></div>`).join('')}
          </div></div></div>
        <div class="grid g23">
          <div data-tbl></div>
          <div class="col gap14">
            <div class="card"><div class="card-h"><h3>Lead sources</h3></div><div class="card-b">${UI.donut(U.uniq(leads.map(l => l.source)).map((s, i) => ({ label: s, value: leads.filter(l => l.source === s).length, color: U.color(i) })), { center: leads.length + '', centerSub: 'leads', size: 124 })}</div></div>
            <div class="card"><div class="card-h"><h3>Upcoming site visits</h3></div><div class="card-b tight">
              ${S.db.visits.slice(0, 5).map(v => `<div class="feed"><span class="av c2">${icon('map', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(v.company)}</div><div class="meta">${v.purpose} · ${U.fmtD(v.date)} · ${U.esc(S.empName(v.by))}</div></div>${UI.pill(v.status)}</div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Follow-ups today</h3></div><div class="card-b tight">
              ${leads.filter(l => U.diff(l.nextFollowup, U.today()) <= 1).slice(0, 4).map(l => `<div class="feed"><span class="av c5">${icon('phone', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(l.company)}</div><div class="meta">${U.esc(l.contact)} · ${U.cur(l.value)}</div></div><button class="btn sm" data-call="${l.id}">Call</button></div>`).join('') || '<div class="tiny muted" style="padding:8px">No follow-ups due.</div>'}
            </div></div>
          </div>
        </div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.leads, pageSize: 12, sortKey: 'value', sortDir: 'desc',
          searchPlaceholder: 'Search lead, company, contact…', searchText: r => [r.company, r.contact, r.city, r.source].join(' '),
          filters: [{ key: 'stage', label: 'Stage', options: STAGES }, { key: 'source', label: 'Source', options: U.uniq(S.db.leads.map(l => l.source)) }],
          rowClick: (r) => MK.leadView(r.id, draw),
          cols: [
            { key: 'company', label: 'Lead', render: r => `<div class="cell-strong trunc" style="max-width:200px">${U.esc(r.company)}</div><span class="sub">${r.code} · ${U.esc(r.type)}</span>` },
            { key: 'contact', label: 'Contact', render: r => `<div class="row gap6">${UI.av(r.contact)}<div><div class="tiny">${U.esc(r.contact)}</div><span class="sub">${U.esc(r.phone)}</span></div></div>` },
            { key: 'value', label: 'Value', cls: 'num', render: r => `<b>${U.cur(r.value)}</b><span class="sub">${r.area.toLocaleString('en-IN')} sqft</span>` },
            { key: 'source', label: 'Source', render: r => `<span class="tag">${U.esc(r.source)}</span>` },
            { key: 'stage', label: 'Stage', render: r => UI.pill(r.stage) },
            { key: 'probability', label: 'Win %', cls: 'num', render: r => `<b>${r.probability}%</b>` },
            { key: 'nextFollowup', label: 'Next action', render: r => `<span class="badge ${U.dueCls(r.nextFollowup)}">${U.fmtD(r.nextFollowup)}</span>` },
            { key: 'ownerId', label: 'Owner', render: r => `<span class="tiny">${U.esc(S.empName(r.ownerId).split(' ')[0])}</span>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('crm-leads', S.db.leads); UI.toast('Leads exported', 'ok'); };
      $('[data-lead]', view).onclick = () => MK.newLead(draw);
      $('[data-visit]', view).onclick = () => UI.modal({
        title: 'Log site visit', sub: 'Capture measurements and client brief',
        body: `<div class="col gap10"><div class="field"><label>Lead</label><select class="input" data-l>${S.db.leads.map(l => `<option value="${l.id}">${U.esc(l.company)} — ${U.cur(l.value)}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Date</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div>
          <div class="field"><label>Purpose</label><select class="input" data-p><option>Site measurement</option><option>Design brief</option><option>Technical feasibility</option><option>Client presentation</option></select></div></div>
          <div class="field"><label>Remarks</label><textarea class="input" data-r placeholder="Measurements captured, site photos uploaded…"></textarea></div></div>`,
        onOk(ov) {
          const l = S.byId('leads', $('[data-l]', ov).value);
          S.add('visits', { leadId: l.id, company: l.company, date: $('[data-d]', ov).value, by: S.me().id, status: 'Completed', purpose: $('[data-p]', ov).value, city: l.city, remarks: $('[data-r]', ov).value });
          S.update('leads', l.id, { stage: l.stage === 'New' ? 'Qualified' : l.stage, lastActivity: U.iso(U.today()) });
          S.log('crm', 'logged site visit', l.company); UI.toast('Site visit logged', 'ok'); MK.render();
        }
      });
      view.addEventListener('click', e => {
        const c = e.target.closest('[data-call]');
        if (c) { const l = S.byId('leads', c.getAttribute('data-call')); UI.toast('Calling ' + l.contact + ' · ' + l.phone, 'info'); }
        const lv = e.target.closest('[data-leadview]');
        if (lv) MK.leadView(lv.getAttribute('data-leadview'), draw);
      });
    }
  });

  MK.newLead = function (after) {
    UI.modal({
      title: 'New lead', sub: 'Capture enquiry from any channel',
      body: `<div class="grid g2 gap10">
        <div class="field span2"><label>Company</label><input class="input" data-c placeholder="e.g. Acme Tech Pvt Ltd"></div>
        <div class="field"><label>Contact person</label><input class="input" data-n placeholder="Full name"></div>
        <div class="field"><label>Phone</label><input class="input" data-ph placeholder="+91 98…"></div>
        <div class="field"><label>Email</label><input class="input" data-e placeholder="contact@company.com"></div>
        <div class="field"><label>Source</label><select class="input" data-s>${['Google Ads', 'LinkedIn', 'Referral', 'Walk-in', 'Website Form', 'WhatsApp', 'Exhibition', 'Existing Client'].map(s => `<option>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Project type</label><select class="input" data-t>${S.const.PROJECT_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label>City</label><select class="input" data-city>${['Gurugram', 'Delhi', 'Noida', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Goa'].map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Indicative value (₹)</label><input class="input" type="number" data-v placeholder="2500000"></div>
        <div class="field"><label>Area (sqft)</label><input class="input" type="number" data-a placeholder="8000"></div>
        <div class="field span2"><label>Notes</label><textarea class="input" data-notes placeholder="Requirement summary…"></textarea></div>
      </div>`,
      onOk(ov) {
        const l = S.add('leads', {
          code: 'LD-' + (2401 + S.db.leads.length), company: $('[data-c]', ov).value, contact: $('[data-n]', ov).value,
          email: $('[data-e]', ov).value, phone: $('[data-ph]', ov).value, source: $('[data-s]', ov).value, stage: 'New',
          value: U.n($('[data-v]', ov).value), city: $('[data-city]', ov).value, type: $('[data-t]', ov).value, ownerId: S.me().id,
          createdOn: U.iso(U.today()), expectedClose: U.iso(U.addD(U.today(), 30)), probability: 10, area: U.n($('[data-a]', ov).value),
          notes: $('[data-notes]', ov).value, lastActivity: U.iso(U.today()), nextFollowup: U.iso(U.addD(U.today(), 2)), score: 45
        });
        S.log('crm', 'created lead', l.company + ' · ' + U.cur(l.value)); UI.toast('Lead created', 'ok');
        if (after) after();
      }
    });
  };

  MK.leadView = function (id, after) {
    const l = S.byId('leads', id);
    const quotes = S.db.quotations.filter(q => q.leadId === id);
    UI.drawer({
      title: l.company, sub: l.code + ' · ' + l.type + ' · ' + l.city, size: 'wide',
      body: `<div class="grid g4 mb16">${UI.kpi({ label: 'Deal value', value: U.cur(l.value), icon: 'wallet' })}${UI.kpi({ label: 'Probability', value: l.probability + '%', icon: 'target' })}${UI.kpi({ label: 'Area', value: l.area.toLocaleString('en-IN'), unit: 'sqft', icon: 'ruler' })}${UI.kpi({ label: 'Stage', value: l.stage, icon: 'route' })}</div>
        <dl class="kv"><dt>Contact</dt><dd>${U.esc(l.contact)} · ${U.esc(l.phone)}</dd><dt>Email</dt><dd>${U.esc(l.email)}</dd>
          <dt>Source</dt><dd>${U.esc(l.source)}</dd><dt>Owner</dt><dd>${U.esc(S.empName(l.ownerId))}</dd>
          <dt>Created</dt><dd>${U.fmtDL(l.createdOn)}</dd><dt>Expected close</dt><dd>${U.fmtDL(l.expectedClose)}</dd>
          <dt>Next follow-up</dt><dd>${U.fmtDL(l.nextFollowup)}</dd><dt>Lead score</dt><dd><b>${l.score}/100</b></dd></dl>
        ${l.notes ? `<div class="note info mt12">${U.esc(l.notes)}</div>` : ''}
        <hr class="hr"><div class="lbl mb8">Move stage</div>
        <div class="pill-row">${STAGES.map(s => `<button class="chip ${l.stage === s ? 'on' : ''}" data-stage="${s}">${s}</button>`).join('')}</div>
        <hr class="hr"><div class="lbl mb8">Quotations</div>
        ${quotes.map(q => `<div class="feed"><span class="av c2">${icon('file', 11)}</span><div class="grow"><div class="txt">${q.code} <span class="tag">v${q.version}</span></div><div class="meta">${U.cur(q.total)} · ${q.status} · valid till ${U.fmtD(q.validTo)}</div></div></div>`).join('') || '<div class="tiny muted">No quotation sent yet.</div>'}
        <hr class="hr"><div class="lbl mb8">Activity</div>
        <div class="tl">
          <div class="tl-item done"><div class="t">Lead created</div><div class="m">${U.fmtDL(l.createdOn)} · ${U.esc(l.source)}</div></div>
          ${l.stage !== 'New' ? `<div class="tl-item done"><div class="t">Qualified by ${U.esc(S.empName(l.ownerId))}</div><div class="m">Budget & timeline confirmed</div></div>` : ''}
          ${['Site Visit', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.stage) ? '<div class="tl-item done"><div class="t">Site visit completed</div><div class="m">Measurements captured</div></div>' : ''}
          ${['Proposal Sent', 'Negotiation', 'Won'].includes(l.stage) ? '<div class="tl-item done"><div class="t">Quotation shared</div><div class="m">Client reviewing</div></div>' : ''}
          ${l.stage === 'Won' ? '<div class="tl-item done"><div class="t">Converted to project</div><div class="m">Work order issued</div></div>' : ''}
        </div>`,
      footer: `<button class="btn" data-x>Close</button><button class="btn" data-quote>${icon('file', 13)} Create quotation</button>${l.stage === 'Won' ? `<button class="btn primary" data-convert>${icon('arrowRight', 13)} Convert to project</button>` : `<button class="btn primary" data-won>Mark won</button>`}`,
      onMount(ov, close) {
        $$('[data-stage]', ov).forEach(b => b.onclick = () => { S.update('leads', l.id, { stage: b.getAttribute('data-stage'), probability: { New: 10, Qualified: 20, 'Site Visit': 30, 'Proposal Sent': 50, Negotiation: 70, Won: 100 }[b.getAttribute('data-stage')] }); S.log('crm', 'moved lead stage', l.company + ' → ' + b.getAttribute('data-stage')); UI.toast('Stage updated', 'ok'); close(); if (after) after(); });
        $('[data-quote]', ov).onclick = () => { close(); MK.newQuotation(l.id, after); };
        const won = $('[data-won]', ov); if (won) won.onclick = () => { S.update('leads', l.id, { stage: 'Won', probability: 100 }); UI.toast('Lead marked won', 'ok'); close(); if (after) after(); };
        const conv = $('[data-convert]', ov);
        if (conv) conv.onclick = () => {
          close();
          const cli = S.db.clients.find(c => c.name === l.company) || S.db.clients[0];
          const pm = S.db.employees.find(e => e.designation.includes('Project Manager')) || S.db.employees[0];
          const p = S.add('projects', {
            code: 'MK-' + (1024 + S.db.projects.length), name: l.company + ' — Fitout Project', type: l.type, city: l.city, state: 'Haryana',
            clientId: cli.id, client: cli.name, clientContact: l.contact, pmId: pm.id, pm: pm.name, status: 'Planning', health: 'On Track',
            start: U.iso(U.today()), end: U.iso(U.addD(U.today(), 150)), baselineEnd: U.iso(U.addD(U.today(), 150)), progress: 0,
            contractValue: l.value, budget: Math.round(l.value * .8), spent: 0, billed: 0, received: 0, area: l.area, floors: 1,
            unitId: 'u1', qs: pm.id, siteEng: pm.id, margin: 20, retentionPct: 5, retainer: 0, tags: ['Converted from CRM'],
            description: 'Converted from lead ' + l.code + '.', createdAt: U.iso(U.today()), clientApproved: 0, lastReport: U.iso(U.today()), statusNote: ''
          });
          S.log('crm', 'converted lead to project', l.company + ' → ' + p.code);
          UI.toast('Project created from lead', 'ok'); MK.go('/projects/' + p.id);
        };
      }
    });
  };

  /* ============================= QUOTATIONS ============================= */
  MK.route('/quotations', {
    title: 'Quotations', crumb: () => [{ label: 'Quotations' }],
    render() {
      const q = S.db.quotations;
      const sent = q.filter(x => x.status === 'Sent' || x.status === 'Under Review');
      const acc = q.filter(x => x.status === 'Accepted');
      return UI.pageHead('Quotations & proposals', `${q.length} quotations · ${U.cur(U.sum(sent, x => x.total))} awaiting response · ${acc.length} accepted`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-tpl>${icon('file', 14)} Templates</button>
         <button class="btn primary" data-new>${icon('plus', 14)} New quotation</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Quotation value', value: U.cur(U.sum(q, x => x.total)), icon: 'file', foot: q.length + ' documents' })}
          ${UI.kpi({ label: 'Awaiting response', value: sent.length, icon: 'clock', foot: U.cur(U.sum(sent, x => x.total)) })}
          ${UI.kpi({ label: 'Accepted', value: acc.length, icon: 'checksq', foot: U.cur(U.sum(acc, x => x.total)) })}
          ${UI.kpi({ label: 'Avg margin', value: U.round(U.avg(q, x => x.margin), 1) + '%', icon: 'percent', foot: 'On quoted value' })}
        </div>
        <div data-tbl></div>`;
    },
    mount(view) {
      const draw = () => {
        const t = UI.table({
          rows: () => S.db.quotations, pageSize: 12, sortKey: 'date', sortDir: 'desc',
          searchPlaceholder: 'Search quotation, client…', searchText: r => [r.code, r.company].join(' '),
          filters: [{ key: 'status', label: 'Status', options: ['Sent', 'Under Review', 'Accepted', 'Rejected'] }],
          cols: [
            { key: 'code', label: 'Quote', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">v${r.version} · ${U.fmtD(r.date)}</span>` },
            { key: 'company', label: 'Client', render: r => `<div class="cell-strong trunc" style="max-width:200px">${U.esc(r.company)}</div><span class="sub">${U.esc(r.template)} · ${r.items} lines</span>` },
            { key: 'amount', label: 'Value', cls: 'num', render: r => `<b>${U.cur(r.amount)}</b><span class="sub">${U.cur(r.total)} incl. GST</span>` },
            { key: 'margin', label: 'Margin', cls: 'num', render: r => `<span style="color:${r.margin < 15 ? 'var(--bad)' : 'var(--ok)'};font-weight:650">${r.margin}%</span>` },
            { key: 'validTo', label: 'Valid till', render: r => `<span class="badge ${U.dueCls(r.validTo)}">${U.fmtD(r.validTo)}</span>` },
            { key: 'preparedBy', label: 'Prepared by', render: r => `<span class="tiny">${U.esc(S.empName(r.preparedBy))}</span>` },
            { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
            { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-qview="${r.id}">View</button>` }
          ]
        });
        const host = $('[data-tbl]', view); host.innerHTML = ''; host.appendChild(t);
      };
      draw();
      $('[data-csv]', view).onclick = () => { U.csv('quotations', S.db.quotations); UI.toast('Quotations exported', 'ok'); };
      $('[data-new]', view).onclick = () => { const l = S.db.leads.find(x => x.stage !== 'Won') || S.db.leads[0]; MK.newQuotation(l.id, draw); };
      $('[data-tpl]', view).onclick = () => UI.modal({
        title: 'Quotation templates', sub: 'Pre-branded proposal layouts',
        body: `<div class="grid g2">${['Standard Fitout', 'Design + Build', 'Civil Only', 'Turnkey Retail'].map((t, i) => `<div class="card"><div class="card-b"><div class="row-between"><b class="sm">${t}</b><span class="tag">v2</span></div>
          <p class="tiny muted mt8">Cover page, scope matrix, BOQ summary, terms & payment schedule, warranty.</p>
          <button class="btn sm mt8" data-use>Use template</button></div></div>`).join('')}</div>`
      });
      view.addEventListener('click', e => {
        const b = e.target.closest('[data-qview]'); if (!b) return;
        const q = S.byId('quotations', b.getAttribute('data-qview'));
        const lead = S.byId('leads', q.leadId);
        UI.modal({
          title: q.code, sub: q.company + ' · prepared by ' + S.empName(q.preparedBy), size: 'xl',
          body: `<div style="background:#fff;border:1px solid var(--line);border-radius:10px;padding:20px">
            <div class="row-between" style="border-bottom:2px solid #0B1220;padding-bottom:10px"><img src="assets/img/logo.svg" style="height:30px"><div class="right tiny"><b>${U.esc(S.db.org.name)}</b><br>GSTIN ${S.db.org.gst}</div></div>
            <h3 style="margin-top:14px">Interior fit-out proposal</h3>
            <div class="tiny muted">${U.esc(q.company)} · ${U.esc(q.template)} · ${U.fmtDL(q.date)} · valid till ${U.fmtDL(q.validTo)}</div>
            <table class="tbl compact mt12"><thead><tr><th>#</th><th>Scope item</th><th class="num">Qty</th><th>Unit</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>
              ${S.db.items.slice(0, 8).map((it, i) => `<tr><td class="tiny">${i + 1}</td><td class="tiny">${U.esc(it.name)}</td><td class="num tiny">${U.num(U.round(q.amount / 8 / it.rate, 0), 0)}</td><td class="tiny">${it.unit}</td><td class="num tiny">${U.curFull(it.rate)}</td><td class="num tiny">${U.cur(U.round(q.amount / 8, 0))}</td></tr>`).join('')}
            </tbody><tfoot><tr><td colspan="5">Sub-total</td><td class="num">${U.curFull(q.amount)}</td></tr><tr><td colspan="5">GST 18%</td><td class="num">${U.curFull(q.tax)}</td></tr><tr><td colspan="5">Total</td><td class="num">${U.curFull(q.total)}</td></tr></tfoot></table>
            <div class="grid g3 mt12 tiny" style="gap:10px">
              <div><b>Payment terms</b><br>30% advance · 40% on material · 25% on completion · 5% retention</div>
              <div><b>Timeline</b><br>Handover in 90 calendar days from work order</div>
              <div><b>Validity</b><br>Quotation valid for 15 days from issue date</div>
            </div>
          </div>`,
          okText: 'Send to client', onOk() { S.update('quotations', q.id, { status: 'Sent' }); S.log('crm', 'sent quotation', q.code); UI.toast('Quotation sent to ' + q.sentTo, 'ok'); draw(); }
        });
      });
    }
  });

  MK.newQuotation = function (leadId, after) {
    const l = S.byId('leads', leadId) || S.db.leads[0];
    UI.modal({
      title: 'New quotation', sub: l.company + ' · indicative ' + U.cur(l.value), size: 'wide', okText: 'Generate & send',
      body: `<div class="grid g2 gap10">
        <div class="field"><label>Template</label><select class="input" data-t><option>Standard Fitout</option><option>Design + Build</option><option>Civil Only</option><option>Turnkey Retail</option></select></div>
        <div class="field"><label>Valid till</label><input class="input" type="date" data-v value="${U.iso(U.addD(U.today(), 15))}"></div>
        <div class="field"><label>Value (₹)</label><input class="input" type="number" data-a value="${l.value}"></div>
        <div class="field"><label>Margin target %</label><input class="input" type="number" data-m value="22"></div>
        <div class="field span2"><label>Send to</label><input class="input" data-e value="${U.attr(l.email)}"></div>
      </div>
      <div class="note info mt12">${icon('sparkles', 12)} Copilot suggests line items from your item master based on ${l.type} and ${l.area.toLocaleString('en-IN')} sqft.</div>
      <div class="card mt12"><div class="card-b tight"><div class="tiny muted">Suggested scope lines</div>
        ${S.db.items.slice(0, 6).map(i => `<div class="row-between tiny" style="padding:4px 0;border-bottom:1px solid var(--line-2)"><span>${U.esc(i.name)}</span><span class="mono">${U.curFull(i.rate)}/${i.unit}</span></div>`).join('')}
      </div></div>`,
      onOk(ov) {
        const amt = U.n($('[data-a]', ov).value), tax = Math.round(amt * .18);
        const q = S.add('quotations', {
          code: 'QT/' + U.fyLabel(U.today()).slice(3, 7).replace(' ', '') + '/' + (101 + S.db.quotations.length), leadId: l.id, company: l.company,
          date: U.iso(U.today()), validTo: $('[data-v]', ov).value, amount: amt, tax, total: amt + tax, status: 'Sent', version: 1,
          preparedBy: S.me().id, sentTo: $('[data-e]', ov).value, items: 8, margin: U.n($('[data-m]', ov).value), template: $('[data-t]', ov).value
        });
        if (l.stage === 'New' || l.stage === 'Qualified' || l.stage === 'Site Visit') S.update('leads', l.id, { stage: 'Proposal Sent', probability: 50, lastActivity: U.iso(U.today()) });
        S.log('crm', 'created quotation', q.code + ' · ' + U.cur(q.total)); UI.toast('Quotation generated & emailed', 'ok');
        if (after) after();
      }
    });
  };
})(window.MK);
