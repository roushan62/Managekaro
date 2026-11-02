/* Managekaro — Finance & Billing, Cost & Margin */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ============================== FINANCE =============================== */
  MK.route('/finance', {
    title: 'Finance & Billing', crumb: () => [{ label: 'Finance & Billing' }],
    render() {
      const m = S.metrics(), db = S.db;
      const invs = db.invoices, cis = db.clientInvoices, pays = db.payments, exps = db.expenses;
      const tabs = [
        { id: 'overview', label: 'Overview' }, { id: 'receivables', label: 'Client invoices', count: cis.length },
        { id: 'payables', label: 'Vendor invoices', count: invs.length }, { id: 'payments', label: 'Payments', count: pays.length },
        { id: 'expenses', label: 'Site expenses', count: exps.length }, { id: 'ledger', label: 'Journal & ledgers' },
        { id: 'compliance', label: 'GST / TDS', count: db.compliance.length }
      ];
      return UI.pageHead('Finance & billing', `${U.cur(m.receivable)} receivable · ${U.cur(m.payable)} payable · ${m.collectionPct}% collection efficiency`,
        `<button class="btn" data-csv>${icon('download', 14)} Export</button>
         <button class="btn" data-expense>${icon('receipt', 14)} Add expense</button>
         <button class="btn primary" data-pay>${icon('bank', 14)} Release payment</button>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Billed', value: U.cur(m.billed), icon: 'receipt', foot: `${cis.length} client invoices` })}
          ${UI.kpi({ label: 'Collected', value: U.cur(m.received), icon: 'bank', foot: `${m.collectionPct}% of billed`, trend: { text: 'on track', dir: 'up' } })}
          ${UI.kpi({ label: 'Receivable', value: U.cur(m.receivable), icon: 'clock', foot: `${U.cur(m.overdueRec)} overdue` })}
          ${UI.kpi({ label: 'Payable', value: U.cur(m.payable), icon: 'wallet', foot: `${invs.filter(i => i.status !== 'Paid').length} open invoices` })}
        </div>
        ${UI.tabs('fin', tabs, (MK._fintab || 'overview'))}
        <div data-tabhost class="mt16"></div>`;
    },
    mount(view) {
      const host = $('[data-tabhost]', view);
      const draw = (tab) => {
        MK._fintab = tab; host.innerHTML = '';
        const db = S.db;

        if (tab === 'overview') {
          const months = db.cashflow;
          const ageBuckets = [['0-30', 0], ['31-60', 0], ['61-90', 0], ['90+', 0]];
          db.clientInvoices.filter(c => c.status !== 'Paid').forEach(c => {
            const a = c.aging || 0;
            const i = a <= 30 ? 0 : a <= 60 ? 1 : a <= 90 ? 2 : 3;
            ageBuckets[i][1] += (c.total - c.received);
          });
          host.innerHTML = `<div class="grid g23 mb14">
            <div class="card"><div class="card-h"><h3>Cash flow — inflow vs outflow</h3><span class="tiny muted">Last 6 months</span></div>
              <div class="card-b">${UI.lineChart([{ name: 'Inflow', data: months.map(c => c.inflow), color: '#0E9F6E' }, { name: 'Outflow', data: months.map(c => c.outflow), color: '#DC2626', fill: false }], months.map(c => c.label), { height: 220 })}</div></div>
            <div class="card"><div class="card-h"><h3>Receivable ageing</h3></div><div class="card-b">
              ${ageBuckets.map((b, i) => `<div class="mb12"><div class="row-between tiny"><span class="muted">${b[0]} days</span><b>${U.cur(b[1])}</b></div>${UI.bar(U.pct(b[1], U.sum(ageBuckets, x => x[1]) || 1), i === 0 ? 'green' : i === 1 ? '' : i === 2 ? 'red' : 'red')}</div>`).join('')}
              <hr class="hr">
              <div class="stat-line"><span class="muted">DSO (days sales outstanding)</span><b>47 days</b></div>
              <div class="stat-line"><span class="muted">DPO (days payable outstanding)</span><b>38 days</b></div>
            </div></div>
          </div>
          <div class="grid g3">
            <div class="card"><div class="card-h"><h3>Expense by head</h3></div><div class="card-b">${UI.donut(U.uniq(db.expenses.map(e => e.head)).slice(0, 6).map((h, i) => ({ label: h, value: U.sum(db.expenses.filter(e => e.head === h), e => e.amount), color: U.color(i) })), { size: 120, center: U.cur(U.sum(db.expenses, e => e.amount)), centerSub: 'total' })}</div></div>
            <div class="card"><div class="card-h"><h3>Top receivables</h3><a class="tiny" data-jump="receivables" style="cursor:pointer;color:var(--brand);font-weight:700">All</a></div><div class="card-b tight">
              ${db.clientInvoices.filter(c => c.status !== 'Paid').sort((a, b) => (b.total - b.received) - (a.total - a.received)).slice(0, 5).map(c => `<div class="feed"><span class="av c5">${icon('receipt', 11)}</span><div class="grow"><div class="txt trunc">${U.esc(c.client)}</div><div class="meta">${c.code} · due ${U.fmtD(c.dueDate)}</div></div><b class="sm">${U.cur(c.total - c.received)}</b></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Payment run</h3></div><div class="card-b">
              <div class="stat-line"><span class="muted">Due this week</span><b>${U.cur(U.sum(db.invoices.filter(i => i.status !== 'Paid' && U.diff(i.dueDate, U.today()) <= 7), i => i.net - i.paid))}</b></div>
              <div class="stat-line"><span class="muted">TDS to deposit</span><b>${U.cur(U.sum(db.invoices, i => i.tds))}</b></div>
              <div class="stat-line"><span class="muted">Retention held</span><b>${U.cur(U.sum(db.invoices, i => i.retention))}</b></div>
              <a class="btn primary block mt12" href="#/finance" data-jump="payments">${icon('bank', 13)} Open payment run</a>
            </div></div>
          </div>`;
        }

        if (tab === 'receivables') {
          host.appendChild(UI.table({
            rows: () => S.db.clientInvoices, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            searchPlaceholder: 'Search invoice, client, WO…', searchText: r => [r.code, r.client, r.workOrder].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Paid', 'Partially Paid', 'Sent', 'Overdue'] }],
            cols: [
              { key: 'code', label: 'Invoice', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'client', label: 'Client / project', render: r => `<div class="trunc" style="max-width:180px">${U.esc(r.client)}</div><span class="sub">${U.esc(r.workOrder)} · ${U.esc(r.milestone)}</span>` },
              { key: 'total', label: 'Invoice value', cls: 'num', render: r => `<b>${U.cur(r.total)}</b><span class="sub">${U.cur(r.amount)} + GST</span>` },
              { key: 'received', label: 'Received', cls: 'num', render: r => `${U.cur(r.received)}<span class="sub">${U.pct(r.received, r.total)}%</span>` },
              { key: 'dueDate', label: 'Due', render: r => `<span class="tiny">${U.fmtD(r.dueDate)}</span>` },
              { key: 'aging', label: 'Aging', render: r => r.aging > 0 ? `<span class="badge ${r.aging > 45 ? 'bad' : 'warn'}">${r.aging}d</span>` : '<span class="badge ok">On time</span>' },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
              { key: 'act', label: '', sortable: false, render: r => r.status !== 'Paid' ? `<button class="btn sm" data-recv="${r.id}">Record receipt</button>` : `<button class="btn sm" data-invview="${r.id}">View</button>` }
            ],
            footer: (all) => `<tr><td colspan="2">Total</td><td class="num">${U.cur(U.sum(all, r => r.total))}</td><td class="num">${U.cur(U.sum(all, r => r.received))}</td><td colspan="4"></td></tr>`
          }));
        }

        if (tab === 'payables') {
          host.appendChild(UI.table({
            rows: () => S.db.invoices, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            searchPlaceholder: 'Search invoice, vendor, PO…', searchText: r => [r.code, r.vendor, r.poCode].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Paid', 'Partially Paid', 'Pending'] }, { key: 'approval', label: 'Approval', options: ['Approved', 'Pending Approval', 'On Hold'] }],
            cols: [
              { key: 'code', label: 'Invoice', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${r.invoiceNo} · ${U.fmtD(r.date)}</span>` },
              { key: 'vendor', label: 'Vendor', render: r => `<div class="trunc" style="max-width:170px">${U.esc(r.vendor)}</div><span class="sub mono">${r.poCode}</span>` },
              { key: 'total', label: 'Invoice', cls: 'num', render: r => `<b>${U.cur(r.total)}</b><span class="sub">net ${U.cur(r.net)}</span>` },
              { key: 'tds', label: 'TDS/Retention', cls: 'num', render: r => `<span class="tiny">${U.cur(r.tds)} / ${U.cur(r.retention)}</span>` },
              { key: 'threeWayMatch', label: '3-way match', render: r => r.threeWayMatch ? '<span class="badge ok">Matched</span>' : '<span class="badge bad">Exception</span>' },
              { key: 'dueDate', label: 'Due', render: r => `<span class="badge ${U.dueCls(r.dueDate)}">${U.fmtD(r.dueDate)}</span>` },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) },
              { key: 'act', label: '', sortable: false, render: r => `<button class="btn sm" data-payinv="${r.id}">${r.status === 'Paid' ? 'View' : 'Pay'}</button>` }
            ],
            footer: (all) => `<tr><td colspan="2">Total</td><td class="num">${U.cur(U.sum(all, r => r.total))}</td><td class="num">${U.cur(U.sum(all, r => r.tds + r.retention))}</td><td colspan="4"></td></tr>`
          }));
        }

        if (tab === 'payments') {
          host.appendChild(UI.table({
            rows: () => S.db.payments, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            filters: [{ key: 'mode', label: 'Mode', options: ['NEFT', 'RTGS', 'Cheque', 'UPI'] }],
            cols: [
              { key: 'code', label: 'Payment', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'vendor', label: 'Vendor', render: r => `<div class="trunc" style="max-width:180px">${U.esc(r.vendor)}</div><span class="sub mono">${r.invoiceCode}</span>` },
              { key: 'amount', label: 'Amount', cls: 'num', render: r => `<b>${U.cur(r.amount)}</b>` },
              { key: 'mode', label: 'Mode', render: r => `<span class="tag">${r.mode}</span>` },
              { key: 'ref', label: 'UTR / Ref', render: r => `<span class="mono tiny">${r.ref}</span>` },
              { key: 'bank', label: 'Bank', render: r => `<span class="tiny">${U.esc(r.bank)}</span>` },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ],
            footer: (all) => `<tr><td colspan="2">Total released</td><td class="num">${U.cur(U.sum(all, r => r.amount))}</td><td colspan="4"></td></tr>`
          }));
        }

        if (tab === 'expenses') {
          host.appendChild(UI.table({
            rows: () => S.db.expenses, pageSize: 12, sortKey: 'date', sortDir: 'desc',
            searchPlaceholder: 'Search expense, head, project…', searchText: r => [r.code, r.head, r.description, S.projName(r.projectId)].join(' '),
            filters: [{ key: 'status', label: 'Status', options: ['Approved', 'Pending', 'Rejected'] }, { key: 'mode', label: 'Mode', options: ['Cash', 'UPI', 'Company Card', 'Reimbursement'] }],
            cols: [
              { key: 'code', label: 'Expense', render: r => `<div class="mono tiny cell-strong">${r.code}</div><span class="sub">${U.fmtD(r.date)}</span>` },
              { key: 'head', label: 'Head', render: r => `<span class="tag">${U.esc(r.head)}</span><span class="sub">${U.esc(S.projName(r.projectId).split('—')[0].trim())}</span>` },
              { key: 'description', label: 'Description', render: r => `<span class="trunc" style="display:inline-block;max-width:230px">${U.esc(r.description)}</span>` },
              { key: 'amount', label: 'Amount', cls: 'num', render: r => `<b>${U.curFull(r.amount)}</b>` },
              { key: 'by', label: 'Claimed by', render: r => `<span class="tiny">${U.esc(S.empName(r.by))}</span>` },
              { key: 'mode', label: 'Mode', render: r => `<span class="tiny">${r.mode}</span>` },
              { key: 'bill', label: 'Bill', render: r => r.bill ? '<span class="badge ok">Attached</span>' : '<span class="badge warn">Missing</span>' },
              { key: 'status', label: 'Status', render: r => UI.pill(r.status) }
            ],
            footer: (all) => `<tr><td colspan="3">Total</td><td class="num">${U.cur(U.sum(all, r => r.amount))}</td><td colspan="4"></td></tr>`
          }));
        }

        if (tab === 'ledger') {
          host.innerHTML = `<div class="grid g23">
            <div class="card"><div class="card-h"><h3>Journal entries</h3><button class="btn sm" data-jv>${icon('plus', 12)} Manual entry</button></div>
              <div class="table-wrap"><table class="tbl"><thead><tr><th>Voucher</th><th>Date</th><th>Narration</th><th>Debit</th><th>Credit</th><th class="num">Amount</th><th>Project</th></tr></thead><tbody>
                ${S.db.journalEntries.map(j => `<tr><td class="mono tiny">${j.code}</td><td class="tiny">${U.fmtD(j.date)}</td><td class="tiny">${U.esc(j.narration)}</td><td class="tiny">${j.debit}</td><td class="tiny">${j.credit}</td><td class="num">${U.curFull(j.amount)}</td><td class="tiny trunc" style="max-width:140px">${U.esc(S.projName(j.projectId).split('—')[0].trim())}</td></tr>`).join('')}
              </tbody></table></div></div>
            <div class="card"><div class="card-h"><h3>Trial balance (summary)</h3></div><div class="card-b">
              ${[['Debtors (clients)', S.metrics().receivable, 'Dr'], ['Creditors (vendors)', S.metrics().payable, 'Cr'], ['Work in progress', U.sum(S.db.projects, p => p.spent), 'Dr'],
              ['Revenue recognised', S.metrics().billed, 'Cr'], ['Retention receivable', U.sum(S.db.clientInvoices, c => c.total * 0.05), 'Dr'],
              ['Retention payable', U.sum(S.db.invoices, i => i.retention), 'Cr'], ['TDS receivable', U.sum(S.db.invoices, i => i.tds), 'Dr'],
              ['GST payable (net)', U.sum(S.db.clientInvoices, c => c.tax) - U.sum(S.db.invoices, i => i.tax), 'Cr']].map(r => `<div class="stat-line"><span class="muted">${r[0]}</span><b class="mono">${U.cur(r[1])} <span class="tiny muted">${r[2]}</span></b></div>`).join('')}
              <a class="btn block mt12" data-export-ledger>${icon('download', 13)} Export to Tally XML</a>
            </div></div>
          </div>`;
          const jv = $('[data-jv]', host);
          if (jv) jv.onclick = () => UI.modal({
            title: 'Manual journal entry', sub: 'Balanced double entry',
            body: `<div class="col gap10"><div class="field"><label>Narration</label><input class="input" data-n placeholder="Retention release adjustment"></div>
              <div class="grid g2"><div class="field"><label>Debit ledger</label><select class="input" data-d><option>Project WIP</option><option>Site Expense</option><option>Debtors</option><option>Contract Cost</option></select></div>
              <div class="field"><label>Credit ledger</label><select class="input" data-c><option>Creditors</option><option>Bank</option><option>Revenue</option><option>Retention Payable</option></select></div></div>
              <div class="grid g2"><div class="field"><label>Amount (₹)</label><input class="input" type="number" data-a placeholder="50000"></div><div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.map(p => `<option value="${p.id}">${U.esc(p.code)}</option>`).join('')}</select></div></div></div>`,
            onOk(ov) {
              S.add('journalEntries', { code: 'JV-' + String(S.db.journalEntries.length + 1).padStart(4, '0'), date: U.iso(U.today()), narration: $('[data-n]', ov).value, debit: $('[data-d]', ov).value, credit: $('[data-c]', ov).value, amount: U.n($('[data-a]', ov).value), projectId: $('[data-p]', ov).value, status: 'Posted' });
              S.log('finance', 'posted journal entry', $('[data-n]', ov).value); UI.toast('Journal posted', 'ok'); draw('ledger');
            }
          });
          const el = $('[data-export-ledger]', host);
          if (el) el.onclick = () => { U.csv('journal-entries', S.db.journalEntries); UI.toast('Tally-compatible export generated', 'ok'); };
        }

        if (tab === 'compliance') {
          host.innerHTML = `<div class="card"><div class="card-h"><h3>Statutory compliance calendar</h3><span class="badge warn">${S.db.compliance.filter(c => c.status !== 'Filed').length} open</span></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Filing</th><th>Period</th><th>Authority</th><th>Due</th><th>Owner</th><th>Status</th></tr></thead><tbody>
              ${S.db.compliance.map(c => `<tr><td class="cell-strong">${U.esc(c.name)}</td><td class="tiny">${U.esc(c.period)}</td><td><span class="tag">${c.authority}</span></td>
              <td><span class="badge ${U.dueCls(c.dueDate)}">${U.fmtD(c.dueDate)}</span></td><td class="tiny">${U.esc(S.empName(c.owner))}</td><td>${UI.pill(c.status)}</td></tr>`).join('')}
            </tbody></table></div></div>
            <div class="grid g2 mt14">
              <div class="card"><div class="card-h"><h3>GST summary (current month)</h3></div><div class="card-b">
                <div class="stat-line"><span class="muted">Output GST (sales)</span><b>${U.cur(U.sum(S.db.clientInvoices, c => c.tax))}</b></div>
                <div class="stat-line"><span class="muted">Input GST (purchases)</span><b>${U.cur(U.sum(S.db.invoices, i => i.tax))}</b></div>
                <div class="stat-line"><span class="muted">Net GST payable</span><b>${U.cur(U.sum(S.db.clientInvoices, c => c.tax) - U.sum(S.db.invoices, i => i.tax))}</b></div>
                <div class="stat-line"><span class="muted">TDS deducted (194C/194J)</span><b>${U.cur(U.sum(S.db.invoices, i => i.tds))}</b></div>
              </div></div>
              <div class="card"><div class="card-h"><h3>Filing readiness</h3></div><div class="card-b">
                ${[['GSTR-1', 96], ['GSTR-3B', 92], ['TDS 26Q', 88], ['PF ECR', 74], ['ESI', 71]].map(x => `<div class="mb12"><div class="row-between tiny"><span>${x[0]}</span><b>${x[1]}% complete</b></div>${UI.bar(x[1], x[1] > 85 ? 'green' : '')}</div>`).join('')}
              </div></div>
            </div>`;
        }

        // shared actions
        host.addEventListener('click', e => {
          const r = e.target.closest('[data-recv]');
          if (r) {
            const inv = S.byId('clientInvoices', r.getAttribute('data-recv'));
            UI.modal({
              title: 'Record client receipt', sub: inv.code + ' · ' + inv.client,
              body: `<div class="col gap10"><div class="field"><label>Amount received (₹)</label><input class="input" type="number" data-a value="${inv.total - inv.received}"></div>
                <div class="grid g2"><div class="field"><label>Mode</label><select class="input" data-m><option>NEFT</option><option>RTGS</option><option>Cheque</option><option>UPI</option></select></div>
                <div class="field"><label>Date</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div></div></div>`,
              onOk(ov) {
                const amt = U.n($('[data-a]', ov).value);
                S.update('clientInvoices', inv.id, { received: inv.received + amt, status: inv.received + amt >= inv.total ? 'Paid' : 'Partially Paid' });
                S.log('invoice', 'recorded client receipt', inv.code + ' · ' + U.cur(amt)); UI.toast('Receipt recorded', 'ok'); draw('receivables');
              }
            });
          }
          const p = e.target.closest('[data-payinv]');
          if (p) {
            const inv = S.byId('invoices', p.getAttribute('data-payinv'));
            if (inv.status === 'Paid') { UI.toast('Invoice already paid', 'info'); return; }
            UI.modal({
              title: 'Release vendor payment', sub: inv.code + ' · ' + inv.vendor,
              body: `<div class="note ${inv.threeWayMatch ? 'ok' : 'warn'}">${inv.threeWayMatch ? 'Three-way match passed (PO + GRN + Invoice).' : 'Three-way match exception — payment will need finance head override.'}</div>
                <div class="col gap10 mt12"><div class="field"><label>Net payable (after TDS & retention)</label><input class="input" type="number" data-a value="${inv.net - inv.paid}"></div>
                <div class="grid g2"><div class="field"><label>Mode</label><select class="input" data-m><option>NEFT</option><option>RTGS</option><option>Cheque</option><option>UPI</option></select></div>
                <div class="field"><label>Bank account</label><select class="input" data-b><option>HDFC ••4567</option><option>ICICI ••8821</option></select></div></div></div>`,
              okText: 'Release payment',
              onOk(ov) {
                const amt = U.n($('[data-a]', ov).value);
                S.add('payments', {
                  code: 'PAY-' + String(S.db.payments.length + 1).padStart(4, '0'), projectId: inv.projectId, vendorId: inv.vendorId, vendor: inv.vendor,
                  invoiceId: inv.id, invoiceCode: inv.code, date: U.iso(U.today()), amount: amt, mode: $('[data-m]', ov).value,
                  ref: 'HDFC' + Math.floor(Math.random() * 1e9), status: 'Released', releasedBy: S.me().id, tds: inv.tds, approvedBy: S.me().id, bank: $('[data-b]', ov).value
                });
                S.update('invoices', inv.id, { paid: inv.paid + amt, status: inv.paid + amt >= inv.total ? 'Paid' : 'Partially Paid' });
                S.log('payment', 'released payment', inv.code + ' · ' + U.cur(amt)); UI.toast('Payment released', 'ok'); draw('payables');
              }
            });
          }
          const v = e.target.closest('[data-invview]');
          if (v) {
            const inv = S.byId('clientInvoices', v.getAttribute('data-invview'));
            UI.modal({ title: inv.code, sub: inv.client, body: `<dl class="kv"><dt>Amount</dt><dd class="mono">${U.curFull(inv.amount)}</dd><dt>GST</dt><dd class="mono">${U.curFull(inv.tax)}</dd><dt>Total</dt><dd class="mono">${U.curFull(inv.total)}</dd><dt>Received</dt><dd class="mono">${U.curFull(inv.received)}</dd><dt>Milestone</dt><dd>${U.esc(inv.milestone)}</dd><dt>Work order</dt><dd>${inv.workOrder}</dd></dl>` });
          }
          const j = e.target.closest('[data-jump]');
          if (j) { const t = j.getAttribute('data-jump'); $$('.tab', view).forEach(x => x.classList.toggle('on', x.getAttribute('data-tab') === t)); draw(t); }
        }, { once: true });
      };
      draw(MK._fintab || 'overview');
      U.wireTabs(view, draw);
      $('[data-csv]', view).onclick = () => { U.csv('finance-export', S.db.clientInvoices); UI.toast('Finance data exported', 'ok'); };
      $('[data-expense]', view).onclick = () => MK.newExpense(() => draw(MK._fintab || 'expenses'));
      $('[data-pay]', view).onclick = () => { const t = $('.tab[data-tab="payables"]', view); if (t) { $$('.tab', view).forEach(x => x.classList.toggle('on', x === t)); draw('payables'); } };
    }
  });

  MK.newExpense = function (after) {
    UI.modal({
      title: 'Add site expense', sub: 'Routed for approval based on amount',
      body: `<div class="col gap10">
        <div class="field"><label>Project</label><select class="input" data-p>${S.db.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
        <div class="grid g2"><div class="field"><label>Head</label><select class="input" data-h>${['Travel', 'Labour', 'Transport', 'Site Consumables', 'Equipment Rental', 'Food & Welfare', 'Safety Gear', 'Courier', 'Printing', 'Miscellaneous'].map(h => `<option>${h}</option>`).join('')}</select></div>
        <div class="field"><label>Amount (₹)</label><input class="input" type="number" data-a placeholder="12500"></div></div>
        <div class="grid g2"><div class="field"><label>Paid by</label><select class="input" data-m><option>Cash</option><option>UPI</option><option>Company Card</option><option>Reimbursement</option></select></div>
        <div class="field"><label>Date</label><input class="input" type="date" data-d value="${U.iso(U.today())}"></div></div>
        <div class="field"><label>Description</label><input class="input" data-x placeholder="Site consumables for Level 3"></div>
      </div>`,
      onOk(ov) {
        const amt = U.n($('[data-a]', ov).value);
        const ex = S.add('expenses', { code: 'EXP-' + String(S.db.expenses.length + 1).padStart(4, '0'), projectId: $('[data-p]', ov).value, head: $('[data-h]', ov).value, amount: amt, date: $('[data-d]', ov).value, by: S.me().id, mode: $('[data-m]', ov).value, status: amt > 25000 ? 'Pending' : 'Approved', bill: true, gst: false, description: $('[data-x]', ov).value, costCode: 'CC-' + Math.floor(100 + Math.random() * 900), approvedBy: amt > 25000 ? '' : S.me().id });
        if (amt > 25000) S.add('approvals', { type: 'Expense', ref: ex.code, amount: amt, projectId: ex.projectId, entityId: ex.id, requestedBy: S.me().id, requestedOn: U.iso(U.today()), status: 'Pending', level: 1, levels: 3, approverId: S.prefs.user, sla: 2, comments: '', priority: 'Normal' });
        S.log('finance', 'added expense', ex.code + ' · ' + U.cur(amt)); UI.toast(amt > 25000 ? 'Expense sent for approval' : 'Expense recorded', 'ok');
        if (after) after();
      }
    });
  };

  /* ============================ COST & MARGIN =========================== */
  MK.route('/costing', {
    title: 'Cost & Margin', crumb: () => [{ label: 'Cost & Margin' }],
    render() {
      const P = S.db.projects.filter(p => p.status !== 'Planning');
      const m = S.metrics();
      const rows = P.map(p => {
        const st = S.projectStats(p.id);
        const revised = p.contractValue + st.coValue;
        const profit = revised - p.spent;
        return { p, st, revised, profit, marginPct: U.round(U.pct(profit, revised), 1) };
      }).sort((a, b) => a.marginPct - b.marginPct);
      const leakage = S.db.boq.filter(b => b.variance > 0 && b.projectId && P.find(p => p.id === b.projectId));
      return UI.pageHead('Cost & margin control', `Portfolio margin ${m.grossMargin}% · ${leakage.length} BOQ lines bleeding margin · leakage ${U.cur(U.sum(leakage, b => b.variance))}`,
        `<button class="btn" data-csv>${icon('download', 14)} Export P&L</button><a class="btn primary" href="#/copilot">${icon('sparkles', 14)} Ask Copilot</a>`)
        + `<div class="grid g4 mb16">
          ${UI.kpi({ label: 'Contract value', value: U.cur(m.cv), icon: 'wallet' })}
          ${UI.kpi({ label: 'Budget', value: U.cur(m.budget), icon: 'pie' })}
          ${UI.kpi({ label: 'Actual cost', value: U.cur(m.cost), icon: 'trend', foot: 'Burn ' + m.burnPct + '%' })}
          ${UI.kpi({ label: 'Margin leakage', value: U.cur(U.sum(leakage, b => b.variance)), icon: 'alert', foot: leakage.length + ' BOQ lines', trend: { text: 'recoverable', dir: 'down' } })}
        </div>
        <div class="grid g23 mb14">
          <div class="card"><div class="card-h"><h3>Project P&amp;L</h3><span class="tiny muted">Sorted by margin — lowest first</span></div>
            <div class="table-wrap"><table class="tbl"><thead><tr><th>Project</th><th class="num">Revised value</th><th class="num">Budget</th><th class="num">Actual cost</th><th class="num">Profit</th><th>Margin</th><th class="num">Received</th><th>Risk</th></tr></thead><tbody>
              ${rows.map(r => `<tr class="clickable" data-p="${r.p.id}">
                <td><div class="cell-strong trunc" style="max-width:220px">${U.esc(r.p.name)}</div><span class="sub">${r.p.code} · ${r.p.progress}% done</span></td>
                <td class="num">${U.cur(r.revised)}</td><td class="num">${U.cur(r.p.budget)}</td><td class="num">${U.cur(r.p.spent)}</td>
                <td class="num" style="color:${r.profit < 0 ? 'var(--bad)' : 'var(--ok)'};font-weight:650">${U.cur(r.profit)}</td>
                <td style="min-width:110px"><div class="row gap6">${UI.bar(U.clamp(r.marginPct, 0, 100), r.marginPct < 12 ? 'red' : r.marginPct < 20 ? '' : 'green')}<b class="tiny">${r.marginPct}%</b></div></td>
                <td class="num">${U.cur(r.p.received)}</td>
                <td>${r.marginPct < 12 ? UI.pill('Critical') : r.marginPct < 20 ? UI.pill('At Risk') : UI.pill('On Track')}</td></tr>`).join('')}
            </tbody></table></div></div>
          <div class="card"><div class="card-h"><h3>Margin distribution</h3></div><div class="card-b">
            ${UI.donut([
              { label: 'Above 20%', value: rows.filter(r => r.marginPct >= 20).length, color: '#0E9F6E' },
              { label: '12–20%', value: rows.filter(r => r.marginPct >= 12 && r.marginPct < 20).length, color: '#D97706' },
              { label: 'Below 12%', value: rows.filter(r => r.marginPct < 12).length, color: '#DC2626' }
            ], { center: m.grossMargin + '%', centerSub: 'portfolio', size: 132 })}
            <hr class="hr">
            <div class="stat-line"><span class="muted">Avg margin</span><b>${U.round(U.avg(rows, r => r.marginPct), 1)}%</b></div>
            <div class="stat-line"><span class="muted">Cash gap</span><b>${U.cur(m.billed - m.received)}</b></div>
            <div class="stat-line"><span class="muted">Retention held</span><b>${U.cur(U.sum(P, p => p.contractValue * 0.05))}</b></div>
          </div></div>
        </div>
        <div class="card"><div class="card-h"><h3>Margin leakage — BOQ lines ordered above budget rate</h3><span class="badge bad">${leakage.length} lines</span></div>
          <div class="table-wrap"><table class="tbl"><thead><tr><th>Project</th><th>BOQ line</th><th class="num">Qty</th><th class="num">Budget rate</th><th class="num">Ordered rate</th><th class="num">Leakage</th><th>Action</th></tr></thead><tbody>
            ${leakage.sort((a, b) => b.variance - a.variance).slice(0, 12).map(b => `<tr><td class="tiny trunc" style="max-width:160px">${U.esc(S.projName(b.projectId).split('—')[0].trim())}</td>
              <td><div class="trunc" style="max-width:250px">${U.esc(b.description)}</div><span class="sub mono">${b.wbs}</span></td>
              <td class="num">${U.num(b.qty, 0)}</td><td class="num">${U.curFull(b.budgetRate)}</td><td class="num">${U.curFull(b.rate)}</td>
              <td class="num" style="color:var(--bad);font-weight:650">${U.cur(b.variance)}</td>
              <td><button class="btn sm" data-neg="${b.id}">Negotiate</button></td></tr>`).join('')}
          </tbody></table></div></div>`;
    },
    mount(view) {
      $$('[data-p]', view).forEach(tr => tr.addEventListener('click', (e) => { if (!e.target.closest('button')) MK.go('/projects/' + tr.getAttribute('data-p')); }));
      $$('[data-neg]', view).forEach(b => b.onclick = () => {
        const boq = S.byId('boq', b.getAttribute('data-neg'));
        UI.modal({
          title: 'Negotiate rate', sub: boq.description,
          body: `<div class="grid g2 gap10"><div class="field"><label>Current rate</label><input class="input" value="${boq.rate}" disabled></div>
            <div class="field"><label>Target rate</label><input class="input" type="number" data-r value="${boq.budgetRate}"></div></div>
            <div class="note ok mt12">Re-negotiating to budget rate recovers ${U.cur(boq.variance)} on this line.</div>
            <div class="field mt12"><label>Vendor</label><select class="input" data-v>${S.db.vendors.slice(0, 10).map(v => `<option>${U.esc(v.name)}</option>`).join('')}</select></div>`,
          okText: 'Send negotiation', onOk() { S.log('costing', 'initiated rate negotiation', boq.description); UI.toast('Negotiation request sent to vendor', 'ok'); }
        });
      });
      $('[data-csv]', view).onclick = () => {
        const rows = S.db.projects.map(p => { const st = S.projectStats(p.id); return { Project: p.code, Name: p.name, Contract: p.contractValue, Variations: st.coValue, Budget: p.budget, Actual: p.spent, Profit: p.contractValue + st.coValue - p.spent, Progress: p.progress }; });
        U.csv('project-pnl', rows); UI.toast('P&L exported', 'ok');
      };
    }
  });
})(window.MK);
