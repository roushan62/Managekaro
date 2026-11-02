/* Managekaro — Procurement (PR/PO/GRN/vendors/rate contracts), Stores & Inventory */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ============================ PROCUREMENT ============================= */
  MK.route('/procurement', {
    title: 'Procurement', crumb: () => [{ label: 'Procurement' }],
    render() {
      const pos = S.db.pos, prs = S.db.prs, grns = S.db.grns, invs = S.db.invoices, vens = S.db.vendors;
      const committed = U.sum(pos.filter(p => !['Cancelled'].includes(p.status)), p => p.total);
      const pending = prs.filter(p => p.status === 'Pending Approval');
      const tabs = [{ id: 'pos', label: 'Purchase orders', count: pos.length }, { id: 'prs', label: 'Requisitions', count: prs.length },
      { id: 'grn', label: 'Goods receipt (GRN)', count: grns.length }, { id: 'vendors', label: 'Vendors', count: vens.length },
      { id: 'contracts', label: 'Rate contracts', count: S.db.rateContracts.length }, { id: 'subcontracts', label: 'Subcontracts', count: S.db.subcontracts.length }];
      return UI.pageHead('Procurement', `${pos.length} POs · ${U.cur(committed)} committed · ${pending.length} requisitions awaiting approval`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-pr>${icon('clipboard', 14)} New requisition</button>
         <button class="btn primary" data-po>${icon('cart', 14)} Create purchase order</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Committed', value: U.cur(committed), icon: 'cart', foot: `${pos.length} purchase orders` })}
          ${UI.kpi({ label: 'Pending approval', value: pending.length, icon: 'inbox', foot: U.cur(U.sum(pending, p => p.estAmount)) + ' value' })}
          ${UI.kpi({ label: 'GRNs this month', value: grns.filter(g => U.monthKey(g.date) === U.monthKey(U.today())).length, icon: 'truck', foot: grns.filter(g => g.qualityCheck === 'Failed').length + ' failed QC' })}
          ${UI.kpi({ label: 'Vendor payables', value: U.cur(U.sum(invs.filter(i => i.status !== 'Paid'), i => i.net - i.paid)), icon: 'receipt', foot: invs.filter(i => !i.threeWayMatch).length + ' match exceptions' })}
          ${UI.kpi({ label: 'Rate contracts', value: S.db.rateContracts.filter(r => r.status === 'Active').length, icon: 'scale', foot: 'Active agreements' })}
        </div>
        ${UI.tabs('proc', tabs, (MK._proctab || 'pos'))}
        <div data-tabhost class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-tabhost]', view);
      const draw = (tab) => {
        MK._proctab = tab; host.innerHTML = '';
        if (tab === 'pos') {
          const t = UI.table({
            rows: () => S.db.pos, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            searchPlaceholder: 'Search PO, vendor, project…', searchText: r => [r.code, r.vendor, S.projName(r.projectId)].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Approved', 'Partially Received', 'Fully Received', 'Pending Approval', 'Closed', 'Cancelled'] }],
            rowClick: (r) => MK.poView(r.id),
            cols: [
              { key: 'code', label: 'PO', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'vendor', label: 'Vendor', render: r => `<div class="cell-strong trunc" style="max-width:180px">${U.esc(r.vendor)}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
              { key: 'items', label: 'Lines', cls: 'num', sortable: false, render: r => r.items.length },
              { key: 'amount', label: 'Value', cls: 'num', render: r => `<b>${U.cur(r.total)}</b><span class="sub">${U.cur(r.amount)} + GST</span>` },
              { key: 'deliveryDate', label: 'Delivery', render: r => `<span class="tiny">${U.fmtD(r.deliveryDate)}</span><span class="sub badge ${U.dueCls(r.deliveryDate)}" style="font-size:9.5px">${U.inDays(U.diff(r.deliveryDate, U.today()))}</span>` },
              { key: 'grnCount', label: 'GRN', cls: 'num', render: r => r.grnCount || '—' },
              { key: 'budgeted', label: 'BOQ', render: r => r.budgeted ? '<span class="badge ok">Linked</span>' : '<span class="badge bad">Off-BOQ</span>' },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ],
            footer: (all) => `<tr><td colspan="3">Total ${all.length} POs</td><td class="num">${U.cur(U.sum(all, r => r.total))}</td><td colspan="4"></td></tr>`
          });
          host.appendChild(t);
        }
        if (tab === 'prs') {
          host.appendChild(UI.table({
            rows: () => S.db.prs, pageSize: 12,
            searchPlaceholder: 'Search requisition…', searchText: r => [r.code, r.item, S.projName(r.projectId)].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Pending Approval', 'Approved', 'PO Created', 'Rejected'] }, { key: 'priority', label: 'Priority', options: ['Urgent', 'High', 'Normal'] }],
            cols: [
              { key: 'code', label: 'PR', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'item', label: 'Item', render: r => `<div class="trunc" style="max-width:230px">${U.esc(r.item)}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
              { key: 'qty', label: 'Qty', cls: 'num', render: r => `${U.num(r.qty, 0)} <span class="tiny muted">${r.unit}</span>` },
              { key: 'estAmount', label: 'Est. value', cls: 'num', render: r => U.cur(r.estAmount) },
              { key: 'requiredBy', label: 'Required by', render: r => `<span class="badge ${U.dueCls(r.requiredBy)}">${U.fmtD(r.requiredBy)}</span>` },
              { key: 'priority', label: 'Priority', render: r => UI.pill(r.priority) },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
              { key: 'act', label: '', sortable: false, render: r => r.status === 'Approved' ? `<button class="btn sm" data-topo="${r.id}">Create PO</button>` : '' }
            ]
          }));
        }
        if (tab === 'grn') {
          host.appendChild(UI.table({
            rows: () => S.db.grns, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            searchPlaceholder: 'Search GRN, PO, vendor…', searchText: r => [r.code, r.poCode, r.vendor].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Accepted', 'Partially Accepted', 'Rejected'] }, { key: 'qualityCheck', label: 'QC', options: ['Passed', 'Passed with remarks', 'Failed'] }],
            cols: [
              { key: 'code', label: 'GRN', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'poCode', label: 'Against PO', render: r => `<span class="mono tiny">${r.poCode}</span><span class="sub">${U.esc(r.vendor)}</span>` },
              { key: 'items', label: 'Material', sortable: false, render: r => `<span class="trunc" style="display:inline-block;max-width:220px">${U.esc(r.items[0] ? r.items[0].name : '')}</span><span class="sub">${r.items.length} line${r.items.length > 1 ? 's' : ''}</span>` },
              { key: 'dcNo', label: 'DC / Invoice', render: r => `<span class="tiny mono">${r.dcNo}</span><span class="sub">${r.invoiceNo || 'no invoice'}</span>` },
              { key: 'warehouseId', label: 'Store', render: r => `<span class="tag">${U.esc((S.byId('warehouses', r.warehouseId) || {}).name || '—')}</span>` },
              { key: 'qualityCheck', label: 'QC', render: r => UI.pill(r.qualityCheck) },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ]
          }));
        }
        if (tab === 'vendors') {
          host.appendChild(UI.table({
            rows: () => S.db.vendors, pageSize: 12,
            searchPlaceholder: 'Search vendor, category, city…', searchText: r => [r.name, r.category, r.city, r.contact].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Active', 'On Hold', 'Blacklisted'] }, { key: 'city', label: 'City', options: U.uniq(S.db.vendors.map(v => v.city)) }],
            rowClick: (r) => MK.vendorView(r.id),
            cols: [
              { key: 'name', label: 'Vendor', render: r => `<div class="row gap8"><span class="av c2">${icon('truck', 12)}</span><div><div class="cell-strong">${U.esc(r.name)}</div><span class="sub">${r.code} · ${U.esc(r.category)}</span></div></div>` },
              { key: 'city', label: 'City', render: r => U.esc(r.city) },
              { key: 'contact', label: 'Contact', render: r => `<span class="tiny">${U.esc(r.contact)}</span><span class="sub">${U.esc(r.phone)}</span>` },
              { key: 'rating', label: 'Rating', render: r => `<span class="badge ${r.rating >= 4 ? 'ok' : r.rating >= 3 ? 'warn' : 'bad'}">★ ${r.rating}</span><span class="sub">${r.ratingCount} reviews</span>` },
              { key: 'onTime', label: 'On-time', cls: 'num', render: r => `<b>${r.onTime}%</b>` },
              { key: 'terms', label: 'Terms', render: r => `<span class="tag">${r.terms}</span>` },
              { key: 'msme', label: 'MSME', render: r => r.msme ? '<span class="badge teal">Yes</span>' : '—' },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ]
          }));
        }
        if (tab === 'contracts') {
          host.appendChild(UI.table({
            rows: () => S.db.rateContracts, pageSize: 12,
            cols: [
              { key: 'code', label: 'Contract', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.esc(r.category)}</span>` },
              { key: 'vendor', label: 'Vendor', render: r => `<div class="cell-strong trunc" style="max-width:200px">${U.esc(r.vendor)}</div><span class="sub">${r.items} items · ${r.discount}% discount</span>` },
              { key: 'validFrom', label: 'Validity', render: r => `<span class="tiny">${U.fmtD(r.validFrom)} → ${U.fmtD(r.validTo)}</span>` },
              { key: 'spend', label: 'Spend', cls: 'num', render: r => U.cur(r.spend) },
              { key: 'creditDays', label: 'Credit', render: r => `<span class="tag">${r.creditDays} days</span>` },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ]
          }));
        }
        if (tab === 'subcontracts') {
          host.appendChild(UI.table({
            rows: () => S.db.subcontracts, pageSize: 12,
            cols: [
              { key: 'code', label: 'Subcontract', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
              { key: 'vendor', label: 'Vendor', render: r => `<div class="trunc" style="max-width:170px">${U.esc(r.vendor)}</div><span class="sub">${r.labourCount} labour on roll</span>` },
              { key: 'scope', label: 'Scope', render: r => `<span class="trunc" style="display:inline-block;max-width:200px">${U.esc(r.scope)}</span><span class="sub">${r.rateBasis}</span>` },
              { key: 'value', label: 'Value', cls: 'num', render: r => U.cur(r.value) },
              { key: 'progress', label: 'Progress', render: r => `<div class="row gap6" style="min-width:90px">${UI.bar(r.progress, r.progress > 80 ? 'green' : '')}<b class="tiny">${r.progress}%</b></div>` },
              { key: 'billed', label: 'Billed / paid', cls: 'num', render: r => `${U.cur(r.billed)}<span class="sub">${U.cur(r.paid)} paid</span>` },
              { key: 'complianceOk', label: 'Compliance', render: r => r.complianceOk ? '<span class="badge ok">Valid</span>' : '<span class="badge bad">Expired</span>' },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ]
          }));
        }
        // wire actions inside tab
        $$('[data-topo]', host).forEach(b => b.onclick = () => {
          const pr = S.byId('prs', b.getAttribute('data-topo'));
          MK.createPOFromPR(pr, () => draw('pos'));
        });
      };
      draw(MK._proctab || 'pos');
      U.wireTabs(view, (t) => draw(t));
      $('[data-csv]', view).onclick = () => { U.csv('purchase-orders', S.db.pos.map(p => ({ PO: p.code, Vendor: p.vendor, Project: S.projName(p.projectId), Date: p.date, Value: p.total, Status: p.status }))); UI.toast('Procurement data exported', 'ok'); };
      $('[data-pr]', view).onclick = () => MK.newPR(() => draw('prs'));
      $('[data-po]', view).onclick = () => MK.newPO(() => draw('pos'));
    }
  });

  MK.newPR = function (after) {
    UI.modal({
      title: 'New purchase requisition', sub: 'Site raises → PM approves → procurement converts to PO', size: 'wide',
      body: `<div class="grid g2 gap10">
        <div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Required by</label><input class="input" type="date" data-r value="${U.iso(U.addD(U.today(), 7))}"></div>
        <div class="field span2"><label>Item</label><select class="input" data-i>${S.db.items.filter(i => i.type === 'Material').map(i => `<option value="${i.id}">${U.esc(i.code)} · ${U.esc(i.name)} — ${U.curFull(i.rate)}/${i.unit}</option>`).join('')}</select></div>
        <div class="field"><label>Quantity</label><input class="input" type="number" data-q value="50"></div>
        <div class="field"><label>Priority</label><select class="input" data-pr><option>Normal</option><option>High</option><option>Urgent</option></select></div>
        <div class="field span2"><label>Justification</label><textarea class="input" data-j placeholder="Required for ongoing gypsum activity as per schedule…"></textarea></div>
      </div>`,
      onOk(ov) {
        const it = S.item($('[data-i]', ov).value), qty = U.n($('[data-q]', ov).value);
        const pr = S.add('prs', {
          code: 'PR-' + String(S.db.prs.length + 1).padStart(3, '0'), projectId: $('[data-p]', ov).value, date: U.iso(U.today()),
          raisedBy: S.me().id, item: it.name, itemId: it.id, qty, unit: it.unit, estRate: it.rate, estAmount: Math.round(qty * it.rate),
          requiredBy: $('[data-r]', ov).value, status: 'Pending Approval', priority: $('[data-pr]', ov).value, budgetLine: it.trade,
          justification: $('[data-j]', ov).value || 'Site requirement.', approver: S.project($('[data-p]', ov).value).pmId
        });
        S.add('approvals', { type: 'Purchase Request', ref: pr.code, amount: pr.estAmount, projectId: pr.projectId, entityId: pr.id, requestedBy: S.me().id, requestedOn: U.iso(U.today()), status: 'Pending', level: 1, levels: 2, approverId: S.prefs.user, sla: 2, comments: '', priority: pr.priority });
        S.log('pr', 'raised requisition', pr.code + ' · ' + U.cur(pr.estAmount)); UI.toast('Requisition raised for approval', 'ok');
        if (after) after();
      }
    });
  };

  MK.createPOFromPR = function (pr, after) {
    MK.newPO(after, pr);
  };

  MK.newPO = function (after, pr) {
    const items = S.db.items.filter(i => i.type === 'Material');
    const rowHtml = (sel, qty) => `<tr><td><select class="select sm" data-line-item>${items.map(i => `<option value="${i.id}" ${sel === i.id ? 'selected' : ''}>${U.esc(i.name)}</option>`).join('')}</select></td>
      <td><input class="input sm" type="number" data-line-qty value="${qty || 10}" style="width:80px"></td>
      <td><input class="input sm" type="number" data-line-rate value="${sel ? (S.item(sel) || {}).rate || 100 : 100}" style="width:100px"></td>
      <td class="num tiny" data-line-amt>—</td><td><button class="btn sm" data-row-del>${icon('trash', 11)}</button></td></tr>`;
    UI.modal({
      title: 'Create purchase order', sub: pr ? 'Converting requisition ' + pr.code : 'Raise against BOQ with approval hierarchy', size: 'xl', okText: 'Create & send for approval',
      body: `<div class="grid g3 gap10 mb12">
        <div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}" ${pr && pr.projectId === p.id ? 'selected' : ''}>${U.esc(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Vendor</label><select class="input" data-v>${S.db.vendors.filter(v => v.status === 'Active').map(v => `<option value="${v.id}">${U.esc(v.name)} — ${U.esc(v.category)}</option>`).join('')}</select></div>
        <div class="field"><label>Delivery required by</label><input class="input" type="date" data-d value="${U.iso(U.addD(U.today(), 10))}"></div>
      </div>
      <table class="tbl"><thead><tr><th>Item</th><th style="width:90px">Qty</th><th style="width:110px">Rate</th><th class="num">Amount</th><th></th></tr></thead>
        <tbody data-lines>${pr ? rowHtml(pr.itemId, pr.qty) : rowHtml(items[0].id, 20) + rowHtml(items[1].id, 40)}</tbody></table>
      <button class="btn sm mt8" data-addrow>${icon('plus', 12)} Add line</button>
      <div class="grid g3 mt12 gap10">
        <div class="field"><label>Payment terms</label><select class="input" data-pt><option>30 days</option><option>45 days</option><option>15 days</option><option>Advance 50%</option></select></div>
        <div class="field"><label>Retention %</label><input class="input" type="number" data-ret value="5"></div>
        <div class="field"><label>Budget check</label><div class="note ok" style="padding:8px">Within BOQ budget</div></div>
      </div>
      <div class="card mt12" style="background:#FAFBFD"><div class="card-b" style="padding:10px 14px"><div class="row-between"><span class="sm muted">Sub-total</span><b data-sub>—</b></div>
        <div class="row-between mt4"><span class="sm muted">GST 18%</span><b data-tax>—</b></div>
        <div class="row-between mt4" style="border-top:1px dashed var(--line);padding-top:6px"><span class="sm bold">Total (incl. GST)</span><b data-tot style="font-size:15px">—</b></div></div></div>
      <div class="note info mt10">${icon('route', 12)} Approval rule: ${'PM → Procurement Head → Director'} based on amount. Vendor gets portal access on release.</div>`,
      onOk(ov) {
        const lines = [];
        $$('[data-lines] tr', ov).forEach(tr => {
          const itId = $('[data-line-item]', tr).value, it = S.item(itId);
          const qty = U.n($('[data-line-qty]', tr).value), rate = U.n($('[data-line-rate]', tr).value);
          if (qty > 0) lines.push({ itemId: itId, name: it.name, unit: it.unit, qty, rate, amount: qty * rate, received: 0 });
        });
        if (!lines.length) { UI.toast('Add at least one line', 'bad'); return false; }
        const amount = U.sum(lines, l => l.amount), tax = Math.round(amount * .18);
        const po = S.add('pos', {
          code: 'PO/' + U.fyLabel(U.today()).slice(3, 7).replace(' ', '') + '/' + String(S.db.pos.length + 1).padStart(4, '0'),
          projectId: $('[data-p]', ov).value, vendorId: $('[data-v]', ov).value, vendor: S.vendor($('[data-v]', ov).value).name,
          date: U.iso(U.today()), deliveryDate: $('[data-d]', ov).value, items: lines, amount, tax, total: amount + tax,
          status: 'Pending Approval', paymentTerms: $('[data-pt]', ov).value, approvedBy: '', grnCount: 0, invoiced: 0, paid: 0,
          budgeted: true, notes: 'As per approved BOQ and technical specification.', deliverySite: S.project($('[data-p]', ov).value).city,
          retention: U.n($('[data-ret]', ov).value), advance: 0
        });
        S.add('approvals', { type: 'Purchase Order', ref: po.code, amount: po.total, projectId: po.projectId, entityId: po.id, requestedBy: S.me().id, requestedOn: U.iso(U.today()), status: 'Pending', level: 1, levels: 3, approverId: S.prefs.user, sla: 2, comments: '', priority: amount > 1000000 ? 'Urgent' : 'Normal' });
        if (pr) S.update('prs', pr.id, { status: 'PO Created' });
        S.log('po', 'created purchase order', po.code + ' · ' + U.cur(po.total)); UI.toast('PO created and routed for approval', 'ok');
        if (after) after();
      },
      onMount(ov) {
        const recalc = () => {
          let sub = 0;
          $$('[data-lines] tr', ov).forEach(tr => {
            const q = U.n($('[data-line-qty]', tr).value), r = U.n($('[data-line-rate]', tr).value);
            $('[data-line-amt]', tr).textContent = U.curFull(q * r); sub += q * r;
          });
          $('[data-sub]', ov).textContent = U.curFull(sub);
          $('[data-tax]', ov).textContent = U.curFull(Math.round(sub * .18));
          $('[data-tot]', ov).textContent = U.curFull(Math.round(sub * 1.18));
        };
        ov.addEventListener('input', e => {
          if (e.target.matches('[data-line-item]')) { const it = S.item(e.target.value); $('[data-line-rate]', e.target.closest('tr')).value = it.rate; }
          recalc();
        });
        $('[data-addrow]', ov).onclick = () => { U.$('[data-lines]', ov).insertAdjacentHTML('beforeend', rowHtml(items[0].id, 10)); recalc(); };
        ov.addEventListener('click', e => { const d = e.target.closest('[data-row-del]'); if (d) { d.closest('tr').remove(); recalc(); } });
        recalc();
      }
    });
  };

  MK.poView = function (id) {
    const po = S.byId('pos', id);
    const v = S.vendor(po.vendorId) || {};
    const grns = S.db.grns.filter(g => g.poId === id);
    const invs = S.db.invoices.filter(i => i.poId === id);
    UI.drawer({
      title: po.code, sub: po.vendor + ' · ' + S.projName(po.projectId), size: 'wide',
      body: `<div class="row-between mb16"><div class="row gap6">${UI.pill(po.status)}<span class="tag">${po.paymentTerms}</span><span class="tag">Retention ${po.retention}%</span></div><span class="tiny muted">Raised ${U.fmtDL(po.date)}</span></div>
        <div class="grid g3 mb16">${UI.kpi({ label: 'PO value', value: U.cur(po.total), icon: 'cart' })}${UI.kpi({ label: 'Received', value: grns.length, unit: 'GRNs', icon: 'truck' })}${UI.kpi({ label: 'Invoiced', value: U.cur(U.sum(invs, i => i.total)), icon: 'receipt' })}</div>
        <table class="tbl"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th><th class="num">Received</th></tr></thead><tbody>
          ${po.items.map(l => `<tr><td>${U.esc(l.name)}<span class="sub">${l.unit}</span></td><td class="num">${U.num(l.qty, 0)}</td><td class="num">${U.curFull(l.rate)}</td><td class="num">${U.curFull(l.amount)}</td>
            <td class="num"><b>${U.num(l.received, 0)}</b><span class="sub">${U.pct(l.received, l.qty)}%</span></td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="3">Sub-total</td><td class="num">${U.curFull(po.amount)}</td><td></td></tr>
          <tr><td colspan="3">GST 18%</td><td class="num">${U.curFull(po.tax)}</td><td></td></tr>
          <tr><td colspan="3">Total</td><td class="num">${U.curFull(po.total)}</td><td></td></tr></tfoot></table>
        <div class="grid g2 mt16">
          <div class="card"><div class="card-h"><h3>Vendor</h3></div><div class="card-b"><dl class="kv">
            <dt>Name</dt><dd>${U.esc(po.vendor)}</dd><dt>Contact</dt><dd>${U.esc(v.contact || '—')}</dd><dt>Phone</dt><dd>${U.esc(v.phone || '—')}</dd>
            <dt>GSTIN</dt><dd class="mono tiny">${U.esc(v.gst || '—')}</dd><dt>Rating</dt><dd>★ ${v.rating || '—'}</dd></dl></div></div>
          <div class="card"><div class="card-h"><h3>Goods receipts</h3></div><div class="card-b tight">
            ${grns.map(g => `<div class="feed"><span class="av c3">${icon('truck', 11)}</span><div class="grow"><div class="txt">${g.code}</div><div class="meta">${U.fmtD(g.date)} · ${g.qualityCheck}</div></div>${UI.pill(g.status)}</div>`).join('') || '<div class="tiny muted" style="padding:8px">No GRN raised yet.</div>'}
          </div></div></div>
        <div class="note ${po.budgeted ? 'ok' : 'warn'} mt12">${po.budgeted ? 'All lines traced to BOQ. Three-way match ready on invoice.' : 'This PO is not linked to a BOQ line — margin reporting will be approximate.'}</div>`,
      footer: `<button class="btn" data-grn>${icon('truck', 13)} Receive (GRN)</button><button class="btn" data-print>${icon('printer', 13)} PO PDF</button>${po.status === 'Pending Approval' ? `<button class="btn primary" data-appr>Approve</button>` : ''}`,
      onMount(ov, close) {
        $('[data-grn]', ov).onclick = () => { close(); MK.newGRN(po.id); };
        $('[data-print]', ov).onclick = () => window.print();
        const ap = $('[data-appr]', ov);
        if (ap) ap.onclick = () => { S.update('pos', id, { status: 'Approved' }); S.log('po', 'approved purchase order', po.code); UI.toast('PO approved', 'ok'); close(); MK.render(); };
      }
    });
  };

  MK.newGRN = function (poId, after) {
    const po = poId ? S.byId('pos', poId) : S.db.pos.find(p => p.status === 'Approved') || S.db.pos[0];
    UI.modal({
      title: 'Goods receipt note', sub: po.code + ' · ' + po.vendor, size: 'wide', okText: 'Post GRN',
      body: `<div class="grid g3 gap10 mb12">
        <div class="field"><label>Received on</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div>
        <div class="field"><label>Store</label><select class="input" data-w>${S.db.warehouses.map(w => `<option value="${w.id}">${U.esc(w.name)}</option>`).join('')}</select></div>
        <div class="field"><label>DC number</label><input class="input" data-dc placeholder="DC-1024"></div>
      </div>
      <table class="tbl"><thead><tr><th>Item</th><th class="num">Ordered</th><th class="num">Received</th><th class="num">Rejected</th><th>QC</th></tr></thead><tbody>
        ${po.items.map(l => `<tr data-gline><td>${U.esc(l.name)}<span class="sub">${l.unit}</span></td><td class="num">${U.num(l.qty, 0)}</td>
          <td><input class="input sm" type="number" data-gq value="${Math.max(0, l.qty - l.received)}" style="width:90px"></td>
          <td><input class="input sm" type="number" data-gr value="0" style="width:80px"></td>
          <td><select class="select sm" data-qc style="width:auto"><option>Passed</option><option>Passed with remarks</option><option>Failed</option></select></td></tr>`).join('')}
      </tbody></table>
      <div class="field mt12"><label>Remarks</label><input class="input" data-rem placeholder="Short supply, damage, balance to follow…"></div>
      <div class="note info mt10">On posting, stock is updated, PO received quantity is revised and the vendor invoice becomes eligible for 3-way match.</div>`,
      onOk(ov) {
        const recs = $$('[data-gline]', ov).map((tr, i) => {
          const item = po.items[i];
          const received = U.n($('[data-gq]', tr).value), rejected = U.n($('[data-gr]', tr).value);
          return { name: item.name, ordered: item.qty, received, rejected, accepted: Math.max(0, received - rejected) };
        });
        const g = S.add('grns', {
          code: 'GRN-' + String(S.db.grns.length + 1).padStart(4, '0'), poId: po.id, poCode: po.code, projectId: po.projectId,
          vendor: po.vendor, vendorId: po.vendorId, date: $('[data-d]', ov).value, items: recs,
          status: recs.some(r => r.rejected > 0) ? 'Partially Accepted' : 'Accepted', receivedBy: S.me().id,
          warehouseId: $('[data-w]', ov).value, invoiceNo: '', dcNo: $('[data-dc]', ov).value || 'DC-0000',
          qualityCheck: 'Passed', remarks: $('[data-rem]', ov).value
        });
        po.items.forEach((l, i) => { l.received = Math.min(l.qty, l.received + recs[i].accepted); });
        S.update('pos', po.id, { grnCount: (po.grnCount || 0) + 1, status: po.items.every(l => l.received >= l.qty) ? 'Fully Received' : 'Partially Received' });
        // stock inward
        recs.forEach((r, i) => {
          const it = S.item(po.items[i].itemId);
          if (!it) return;
          const st = S.db.stock.find(s => s.itemId === it.id && s.warehouseId === $('[data-w]', ov).value);
          if (st) S.update('stock', st.id, { qty: st.qty + r.accepted, value: (st.qty + r.accepted) * st.rate, status: st.qty + r.accepted < st.min ? 'Low Stock' : 'In Stock' });
        });
        S.log('grn', 'posted goods receipt', g.code + ' · ' + po.code); UI.toast('GRN posted — stock updated', 'ok');
        if (after) after(); else MK.render();
      }
    });
  };

  MK.vendorView = function (id) {
    const v = S.vendor(id);
    const pos = S.db.pos.filter(p => p.vendorId === id);
    const invs = S.db.invoices.filter(i => i.vendorId === id);
    const grns = S.db.grns.filter(g => g.vendorId === id);
    const spend = U.sum(pos, p => p.total);
    UI.drawer({
      title: v.name, sub: v.code + ' · ' + v.category + ' · ' + v.city, size: 'wide',
      body: `<div class="grid g4 mb16">${UI.kpi({ label: 'Lifetime spend', value: U.cur(spend), icon: 'wallet' })}${UI.kpi({ label: 'Open POs', value: pos.filter(p => !['Closed', 'Cancelled'].includes(p.status)).length, icon: 'cart' })}${UI.kpi({ label: 'On-time', value: v.onTime + '%', icon: 'clock' })}${UI.kpi({ label: 'Quality', value: v.quality + '%', icon: 'award' })}</div>
        <dl class="kv mb16"><dt>Contact</dt><dd>${U.esc(v.contact)} · ${U.esc(v.phone)}</dd><dt>Email</dt><dd>${U.esc(v.email)}</dd>
          <dt>GSTIN / PAN</dt><dd class="mono tiny">${v.gst} · ${v.pan}</dd><dt>Payment terms</dt><dd>${v.terms}</dd>
          <dt>Credit days</dt><dd>${v.terms}</dd><dt>MSME</dt><dd>${v.msme ? 'Registered' : 'Not registered'}</dd>
          <dt>Bank</dt><dd class="mono tiny">${v.ifsc} · ${v.ac}</dd><dt>Since</dt><dd>${U.fmtDL(v.since)}</dd>
          <dt>Status</dt><dd>${UI.pill(v.status)}</dd></dl>
        <div class="card mb14"><div class="card-h"><h3>Scorecard</h3></div><div class="card-b">
          ${[['Delivery on time', v.onTime], ['Quality acceptance', v.quality], ['Documentation', v.docs ? 92 : 61], ['Commercial competitiveness', 74]].map(x => `<div class="mb12"><div class="row-between tiny"><span>${x[0]}</span><b>${x[1]}%</b></div>${UI.bar(x[1], x[1] > 80 ? 'green' : x[1] > 65 ? '' : 'red')}</div>`).join('')}
        </div></div>
        <div class="card"><div class="card-h"><h3>Recent purchase orders</h3></div><div class="table-wrap"><table class="tbl compact"><thead><tr><th>PO</th><th>Project</th><th class="num">Value</th><th>Status</th></tr></thead><tbody>
          ${pos.slice(0, 8).map(p => `<tr><td class="mono tiny">${p.code}</td><td class="tiny trunc" style="max-width:180px">${U.esc(S.projName(p.projectId).split('—')[0].trim())}</td><td class="num tiny">${U.cur(p.total)}</td><td><span class="tiny">${p.status}</span></td></tr>`).join('') || '<tr><td colspan="4" class="tiny muted center" style="padding:14px">No POs</td></tr>'}
        </tbody></table></div></div>`,
      footer: `<button class="btn" data-x>Close</button><button class="btn" data-mail>${icon('mail', 13)} Email vendor</button><button class="btn primary" data-po>${icon('plus', 13)} New PO</button>`,
      onMount(ov, close) {
        $('[data-mail]', ov).onclick = () => UI.toast('Email drafted to ' + v.email, 'ok');
        $('[data-po]', ov).onclick = () => { close(); MK.newPO(() => MK.render()); };
      }
    });
  };

  /* ============================== STORES ================================ */
  MK.route('/stores', {
    title: 'Stores & Inventory', crumb: () => [{ label: 'Stores & Inventory' }],
    render() {
      const st = S.db.stock, wh = S.db.warehouses;
      const totalVal = U.sum(st, s => s.value);
      const low = st.filter(s => s.status === 'Low Stock');
      const out = st.filter(s => s.status === 'Out of Stock');
      const tabs = [{ id: 'stock', label: 'Stock ledger', count: st.length }, { id: 'moves', label: 'Material movement', count: S.db.stockMoves.length }, { id: 'warehouses', label: 'Warehouses', count: wh.length }];
      return UI.pageHead('Stores & inventory', `${st.length} SKU rows · ${U.cur(totalVal)} stock value · ${low.length + out.length} need replenishment`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-issue>${icon('send', 14)} Issue to site</button>
         <button class="btn primary" data-inward>${icon('upload', 14)} Stock inward</button>`)
        + `<div class="grid g5 mb16">
          ${UI.kpi({ label: 'Stock value', value: U.cur(totalVal), icon: 'warehouse', foot: `${wh.length} warehouses` })}
          ${UI.kpi({ label: 'SKU lines', value: st.length, icon: 'box', foot: `${U.uniq(st.map(s => s.itemId)).length} unique items` })}
          ${UI.kpi({ label: 'Low stock', value: low.length, icon: 'alert', foot: 'Below minimum' })}
          ${UI.kpi({ label: 'Out of stock', value: out.length, icon: 'minus', foot: 'Blocking work' })}
          ${UI.kpi({ label: 'Movements (30d)', value: S.db.stockMoves.length, icon: 'activity' })}
        </div>
        ${UI.tabs('store', tabs, (MK._storetab || 'stock'))}
        <div data-tabhost class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-tabhost]', view);
      const draw = (tab) => {
        MK._storetab = tab; host.innerHTML = '';
        if (tab === 'stock') {
          host.appendChild(UI.table({
            rows: () => S.db.stock, pageSize: 14,
            searchPlaceholder: 'Search item, code, location…', searchText: r => [r.item, r.code, r.location].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] }],
            cols: [
              { key: 'item', label: 'Item', render: r => `<div class="cell-strong trunc" style="max-width:250px">${U.esc(r.item)}</div><span class="sub mono">${r.code} · ${r.location}</span>` },
              { key: 'warehouseId', label: 'Warehouse', render: r => `<span class="tag">${U.esc((S.byId('warehouses', r.warehouseId) || {}).name || '—')}</span>` },
              { key: 'qty', label: 'Qty', cls: 'num', render: r => `<b>${U.num(r.qty, 0)}</b> <span class="tiny muted">${r.unit}</span><span class="sub">min ${r.min} / max ${r.max}</span>` },
              { key: 'rate', label: 'Rate', cls: 'num', render: r => U.curFull(r.rate) },
              { key: 'value', label: 'Value', cls: 'num', render: r => U.cur(r.value) },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
              { key: 'lastMove', label: 'Last move', render: r => `<span class="tiny">${U.fmtD(r.lastMove)}</span>` }
            ],
            footer: (all) => `<tr><td colspan="4">Total stock value</td><td class="num">${U.cur(U.sum(all, r => r.value))}</td><td colspan="2"></td></tr>`
          }));
        }
        if (tab === 'moves') {
          host.appendChild(UI.table({
            rows: () => S.db.stockMoves, pageSize: 14, sortKey: 'date', sortDir: 'desc',
            filters: [{ key: 'type', label: 'Type', options: ['Inward', 'Outward', 'Transfer', 'Adjustment'] }],
            cols: [
              { key: 'date', label: 'Date', render: r => `<span class="tiny">${U.fmtD(r.date)}</span>` },
              { key: 'item', label: 'Item', render: r => `<span class="trunc" style="display:inline-block;max-width:220px">${U.esc(r.item)}</span>` },
              { key: 'type', label: 'Type', render: r => `<span class="badge ${r.type === 'Inward' ? 'ok' : r.type === 'Outward' ? 'info' : r.type === 'Transfer' ? 'purple' : 'warn'}">${r.type}</span>` },
              { key: 'qty', label: 'Qty', cls: 'num', render: r => (r.type === 'Outward' ? '−' : '+') + U.num(r.qty, 0) },
              { key: 'ref', label: 'Reference', render: r => `<span class="mono tiny">${r.ref}</span>` },
              { key: 'projectId', label: 'Project', render: r => `<span class="tiny trunc" style="display:inline-block;max-width:160px">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
              { key: 'by', label: 'By', render: r => `<span class="tiny">${U.esc(S.empName(r.by))}</span>` }
            ]
          }));
        }
        if (tab === 'warehouses') {
          host.innerHTML = `<div class="grid g2">${S.db.warehouses.map(w => `<div class="card"><div class="card-h"><h3>${U.esc(w.name)}</h3>${UI.pill('Active')}</div><div class="card-b">
            <div class="grid g2 mb12"><div><div class="tiny muted">Incharge</div><b class="sm">${U.esc(S.empName(w.incharge))}</b></div><div><div class="tiny muted">Area</div><b class="sm">${w.area}</b></div></div>
            <div class="row-between tiny mb8"><span>Capacity used</span><b>${w.capacity}%</b></div>${UI.bar(w.capacity, w.capacity > 85 ? 'red' : w.capacity > 70 ? '' : 'green')}
            <div class="grid g3 mt12">
              <div><div class="tiny muted">SKUs</div><b>${S.db.stock.filter(s => s.warehouseId === w.id).length}</b></div>
              <div><div class="tiny muted">Value</div><b>${U.cur(U.sum(S.db.stock.filter(s => s.warehouseId === w.id), s => s.value))}</b></div>
              <div><div class="tiny muted">Low stock</div><b>${S.db.stock.filter(s => s.warehouseId === w.id && s.status !== 'In Stock').length}</b></div>
            </div></div></div>`).join('')}</div>`;
        }
      };
      draw(MK._storetab || 'stock');
      U.wireTabs(view, draw);
      $('[data-csv]', view).onclick = () => { U.csv('stock-ledger', S.db.stock); UI.toast('Stock ledger exported', 'ok'); };
      $('[data-issue]', view).onclick = () => UI.modal({
        title: 'Issue material to site', sub: 'Stock movement out, linked to project and BOQ',
        body: `<div class="col gap10"><div class="field"><label>Item</label><select class="input" data-i>${S.db.stock.filter(s => s.qty > 0).map(s => `<option value="${s.id}">${U.esc(s.item)} — ${s.qty} ${s.unit} at ${U.esc((S.byId('warehouses', s.warehouseId) || {}).name || '')}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Quantity</label><input class="input" type="number" data-q value="5"></div><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div></div>
          <div class="field"><label>Issued to</label><select class="input" data-e>${S.db.employees.map(e => `<option value="${e.id}">${U.esc(e.name)}</option>`).join('')}</select></div></div>`,
        onOk(ov) {
          const s = S.byId('stock', $('[data-i]', ov).value), qty = U.n($('[data-q]', ov).value);
          if (qty > s.qty) { UI.toast('Quantity exceeds available stock', 'bad'); return false; }
          S.update('stock', s.id, { qty: s.qty - qty, value: (s.qty - qty) * s.rate, status: s.qty - qty < s.min ? (s.qty - qty === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock', lastMove: U.iso(U.today()) });
          S.add('stockMoves', { itemId: s.itemId, item: s.item, warehouseId: s.warehouseId, type: 'Outward', qty, date: U.iso(U.today()), ref: 'MR-' + String(S.db.stockMoves.length + 1).padStart(4, '0'), projectId: $('[data-p]', ov).value, by: $('[data-e]', ov).value, notes: '' });
          S.log('store', 'issued material', s.item + ' × ' + qty); UI.toast('Material issued — stock updated', 'ok'); MK.render();
        }
      });
      $('[data-inward]', view).onclick = () => UI.modal({
        title: 'Stock inward', sub: 'Purchase, return or opening stock',
        body: `<div class="col gap10"><div class="field"><label>Item</label><select class="input" data-i>${S.db.stock.map(s => `<option value="${s.id}">${U.esc(s.item)} — ${U.esc((S.byId('warehouses', s.warehouseId) || {}).name || '')}</option>`).join('')}</select></div>
          <div class="grid g2"><div class="field"><label>Quantity</label><input class="input" type="number" data-q value="20"></div><div class="field"><label>Reference</label><input class="input" data-r value="GRN-0000"></div></div></div>`,
        onOk(ov) {
          const s = S.byId('stock', $('[data-i]', ov).value), qty = U.n($('[data-q]', ov).value);
          S.update('stock', s.id, { qty: s.qty + qty, value: (s.qty + qty) * s.rate, status: 'In Stock', lastMove: U.iso(U.today()) });
          S.add('stockMoves', { itemId: s.itemId, item: s.item, warehouseId: s.warehouseId, type: 'Inward', qty, date: U.iso(U.today()), ref: $('[data-r]', ov).value, projectId: '', by: S.me().id, notes: '' });
          S.log('store', 'stock inward', s.item + ' × ' + qty); UI.toast('Stock updated', 'ok'); MK.render();
        }
      });
    }
  });
})(window.MK);
