/* Managekaro — Help centre + full user manual (docs) & feature book */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, UI = MK.UI, icon = MK.icon, $ = U.$, $$ = U.$$;

  /* ------------------------------- HELP HUB ---------------------------- */
  MK.route('/help', {
    title: 'Help & Manual', crumb: () => [{ label: 'Help & Manual' }],
    render() {
      const cards = [
        ['book', 'Complete user manual', 'Every module, every screen, step by step — with screen previews and worked examples.', '/docs', 'Open manual'],
        ['download', 'Download the Windows app', 'Single .exe for any Windows PC. Works offline for site offices.', '/download', 'Download'],
        ['play', 'Guided product tour', 'Open the seeded demo portfolio and follow the 12-step tour.', '/dashboard', 'Start tour'],
        ['sparkles', 'Ask the AI Copilot', 'Ask questions in plain English about your own data.', '/copilot', 'Open Copilot'],
        ['shield', 'Roles & permissions', 'What each role can see and approve.', '/users', 'View roles'],
        ['refresh', 'Reset demo data', 'Restore the seeded ₹68 Cr portfolio if you have edited things.', '/settings', 'Reset']
      ];
      const shortcuts = [['⌘ / Ctrl + K', 'Command palette — jump to any screen, project, person or vendor'], ['Esc', 'Close any modal, drawer or palette'], ['Enter', 'Open the highlighted result in the palette'], ['↑ / ↓', 'Move through palette results']];
      return UI.pageHead('Help centre', 'Manuals, tours, shortcuts and support')
        + `<div class="hero-strip mb16"><div class="row-between wrap"><div><h2>Everything you need to run Managekaro</h2>
            <p>The manual is written for site engineers, project managers, QS, procurement, finance and HR — each chapter maps to the screens your role uses.</p></div>
            <div class="row gap6"><a class="btn" href="#/docs">${icon('book', 14)} User manual</a><a class="btn primary" href="#/download">${icon('download', 14)} Desktop app</a></div></div></div>
          <div class="grid g3 mb16">${cards.map(c => `<div class="card"><div class="card-h"><h3>${icon(c[0], 15)} ${c[1]}</h3></div>
            <div class="card-b"><p class="tiny muted">${c[2]}</p><a class="btn sm mt12" href="#${c[3]}">${c[4]} ${icon('arrowRight', 11)}</a></div></div>`).join('')}</div>
          <div class="grid g23">
            <div class="card"><div class="card-h"><h3>Keyboard shortcuts</h3></div><div class="card-b">
              ${shortcuts.map(s => `<div class="stat-line"><span class="muted">${s[1]}</span><span class="tag mono">${s[0]}</span></div>`).join('')}
            </div></div>
            <div class="card"><div class="card-h"><h3>Support</h3></div><div class="card-b">
              <div class="stat-line"><span class="muted">Email</span><b>help@managekaro.com</b></div>
              <div class="stat-line"><span class="muted">Phone</span><b>+91 124 480 9100</b></div>
              <div class="stat-line"><span class="muted">Response SLA</span><b>4 working hours</b></div>
              <div class="stat-line"><span class="muted">WhatsApp support</span><b>Mon–Sat, 9:30–18:30 IST</b></div>
              <div class="note info mt12">On Enterprise, your dedicated CSM joins the same workspace and can see the screens you are on during a support call.</div>
            </div></div>
          </div>`;
    }
  });

  /* -------------------------------- MANUAL ----------------------------- */
  const CH = [
    { id: 'start', title: '1. Getting started', items: [
      ['1.1 What Managekaro does', 'Managekaro is a single workspace for interior fit-out and construction companies. It connects commercial control (BOQ, procurement, billing) with execution (schedule, DPR, snags, drawings) and people (attendance, leave, payroll). Every record links to a project and, wherever relevant, to a BOQ line — so cost, progress and quality can be read together.'],
      ['1.2 Signing in', 'Open the workspace and choose a persona on the sign-in screen: Director, Project Manager, Procurement, Finance, Site Engineer or HR Manager. In production this screen is replaced by your SSO / email OTP provider. Role determines menus, approvals and data scope.'],
      ['1.3 The layout', 'Left: module navigation grouped by Overview, Delivery, Commercial, Growth, People, Intelligence and Admin. Top: breadcrumb, global search (⌘K), download shortcut, notifications and the user switcher. Main area: the module screen.'],
      ['1.4 Your first 60 minutes', '1) Verify organisation profile and GSTIN in Settings. 2) Import clients, vendors and item master. 3) Create one project and import its BOQ. 4) Invite your PM, QS, procurement and finance leads with the right roles. 5) Raise one test PO, receive it (GRN) and match an invoice. 6) Ask your site engineer to submit a DPR from a phone.']
    ] },
    { id: 'dashboard', title: '2. Command Centre & My Work', items: [
      ['2.1 Command Centre', 'The landing screen for leadership. KPI row: contract value, collected, projected profit and at-risk projects. Second row covers payables, overdue receivables, headcount, pipeline and pending approvals. Charts show planned vs actual portfolio progress, portfolio health split and cash position. Tables list live projects with progress, contract, collected, margin and health.'],
      ['2.2 Exporting an MIS pack', 'Click "Export MIS" to download a CSV of portfolio KPIs, or use Analytics → Export data for a project-level file. Subscribe from Analytics → Subscribe MIS to receive a scheduled pack by email or WhatsApp.'],
      ['2.3 My Work', 'Your personal queue: tasks, approvals waiting, leave balance and today\'s attendance. Switch between List and Board (kanban). "New task" creates a contextual task linked to a project, with priority and due date.'],
      ['2.4 Approvals inbox', 'Every document routed to you appears here with amount, project, requester, level (e.g. L1 of 3) and SLA. Approve or reject with a comment; approving a PO releases it to the vendor, approving a change order updates the project\'s revised value. Bulk approve is available for low-risk batches.']
    ] },
    { id: 'projects', title: '3. Projects & BOQ', items: [
      ['3.1 Creating a project', 'Projects → New project. Capture client, type (corporate, retail, F&B, healthcare, hospitality, residential, commercial, industrial, coworking), city, unit, contract value, area, start and handover dates, PM and budget %. Managekaro creates the project shell, a BOQ template, schedule skeleton, milestones and client portal access.'],
      ['3.2 The project screen', 'Nine tabs: Overview, BOQ & scope, Schedule, Procurement, Commercials, Snags & quality, Drawings, Team and Activity. Overview shows execution rings (schedule, BOQ executed, collection), top BOQ lines, project facts, cost mix, milestones, critical snags and recent activity.'],
      ['3.3 BOQ — the anchor', 'Each line has WBS code, trade, description, quantity, unit, rate, amount, executed quantity, certified quantity, ordered quantity, progress, budget rate and variance. Client confirmation is tracked per line. Use "Export BOQ" for the client, "Add line" for new scope and "Raise change order" for variations.'],
      ['3.4 Reading variance', 'Variance = (ordered rate − budget rate) × quantity. Positive variance is margin leakage — the line was bought above budget. Managekaro surfaces the largest leaks in Cost & Margin so you can renegotiate before month end.'],
      ['3.5 Change orders', 'Raise a variation with type (addition / omission / substitution), amount, schedule impact (days), linked BOQ line and justification. It enters the approval chain and, once client-approved, increases the revised contract value used in P&L.'],
      ['3.6 Client status report', 'Project → Client report produces a printable pack: KPI strip, activity-wise progress, client-facing snags and billing summary — ready to save as PDF or email.'],
      ['3.7 Portfolio view', 'Projects → Portfolio view compares live projects by value, progress and cash gap, with a value split chart. Print it for the leadership review.']
    ] },
    { id: 'schedule', title: '4. Schedule, Gantt & daily progress', items: [
      ['4.1 Activities', 'Every activity carries trade, start, finish, baseline start and finish, weight, progress, owner, dependency and milestone flag. Weighted progress rolls up to the project percentage.'],
      ['4.2 Gantt', 'Bars show actual duration with a baseline bar behind and a milestone diamond at completion. Colour: grey baseline, orange in progress, green complete, red slipping. Slipping activities appear in the Delay register with slack days.'],
      ['4.3 Importing a schedule', 'Import MS Project XML, Primavera XER or CSV. Managekaro maps ID, name, start, finish, percent complete, predecessor and weight, then builds the baseline.'],
      ['4.4 Daily Progress Report (DPR)', 'DPR captures date, manpower (skilled / helpers), progress %, work done, blockers, material inward / outward, safety incidents, weather, photos and quality self-score. Submitting distributes a branded report to client subscribers on WhatsApp and email.'],
      ['4.5 DPR quality gates', 'Configure required sections in Settings → DPR & templates, require at least one photograph, and choose whether cost data is included in the client copy.'],
      ['4.6 Snags', 'Raise a snag with area, trade, description, priority, committed closure date, vendor assignment and client visibility. The resolution workflow is: raised → assigned → vendor submits proof → QC verifies → closed. Overdue snags are highlighted in Command Centre.'],
      ['4.7 RFIs', 'Log technical queries with the addressee (client, PMC, design studio, structural consultant), response due date, and cost / time impact. Answered RFIs remain linked to the project for the final handover pack.']
    ] },
    { id: 'docs', title: '5. Drawings & documents', items: [
      ['5.1 Version control', 'Each drawing sheet keeps one current revision; older revisions are marked Superseded, never deleted. Uploading a new revision creates a transmittal entry and notifies subscribers.'],
      ['5.2 Review & pin comments', 'Review a drawing, add pin comments at coordinates and record your decision. Approved drawings can be auto-shared to the client portal.'],
      ['5.3 Sharing', 'Client-shared documents appear in the client portal. Vendors receive only the sheets attached to their scope.']
    ] },
    { id: 'procurement', title: '6. Procurement & stores', items: [
      ['6.1 The chain', 'Requisition (PR) → approval → vendor selection → purchase order (PO) → goods receipt (GRN) → vendor invoice → 3-way match → payment. Each step is traceable back to the project and BOQ line.'],
      ['6.2 Raising a requisition', 'Procurement → New requisition. Pick item from the master (rate auto-fills), quantity, required-by date and justification. Approval routes by amount; approved PRs convert to PO in one click.'],
      ['6.3 Purchase orders', 'A PO has multiple lines, GST, delivery date, payment terms, retention % and delivery site. Managekaro checks whether each line is within BOQ budget and flags off-BOQ buying. Releasing a PO creates vendor portal access automatically.'],
      ['6.4 Receiving material', 'PO → Receive (GRN). Enter received and rejected quantities per line, choose the store and DC number. Stock is updated, PO received quantity revised, and the invoice becomes eligible for matching.'],
      ['6.5 Vendors & rate contracts', 'Vendor records hold GSTIN, PAN, MSME status, bank details, payment terms and a scorecard (on-time %, quality %, documentation). Rate contracts capture negotiated rates with validity and credit days.'],
      ['6.6 Stores & inventory', 'Stock is tracked per warehouse with minimum and maximum levels. Issue material to site (outward), receive (inward) or transfer. Low stock and out-of-stock rows are surfaced first.'],
      ['6.7 Subcontracts', 'Track scope, value, rate basis, retention, advance and labour count per subcontractor, with progress, billed, paid and compliance validity.']
    ] },
    { id: 'finance', title: '7. Finance, billing & costing', items: [
      ['7.1 Client billing', 'Project → Commercials → Raise invoice, or Finance → Client invoices → Record receipt. Bill by milestone (mobilisation, 40%, 75%, completion, retention release) with GST. Ageing is calculated from the due date.'],
      ['7.2 Vendor invoices', 'Vendor invoices are checked against PO, GRN and measured progress (three-way match). Exceptions are held with a reason. TDS and retention are deducted to arrive at the net payable.'],
      ['7.3 Payments', 'Finance → Payments → release with mode (NEFT, RTGS, cheque, UPI) and bank account. The payment is posted against the invoice and the vendor balance updates.'],
      ['7.4 Site expenses', 'Capture head (travel, labour, transport, consumables, rental, welfare, safety, courier, printing, misc), amount, mode and bill attachment. Expenses above ₹25,000 route for approval automatically.'],
      ['7.5 Journal & ledgers', 'Manual journal entries post to a chosen debit and credit ledger. The trial-balance summary shows receivables, payables, WIP, revenue, retention and net GST. Export is Tally-compatible.'],
      ['7.6 GST, TDS & compliance', 'The compliance tab lists GSTR-1, GSTR-3B, TDS 26Q, PF ECR, ESI, PT, labour licence, fire NOC and shop & establishment filings with period, authority, due date and owner.'],
      ['7.7 Cost & margin', 'Cost & Margin shows project P&L sorted by weakest margin, revised value (contract + approved variations), budget, actual cost, profit and margin %, plus a leakage table of BOQ lines above budget rate with a negotiate action.']
    ] },
    { id: 'crm', title: '8. CRM & quotations', items: [
      ['8.1 Leads', 'Capture company, contact, source (Google, LinkedIn, referral, walk-in, website, WhatsApp, exhibition, existing client), segment, city, indicative value and area. Score and probability drive the weighted pipeline.'],
      ['8.2 Pipeline', 'Six stages: New → Qualified → Site Visit → Proposal Sent → Negotiation → Won. Move a lead by opening it and choosing a stage; probability updates automatically.'],
      ['8.3 Site visits', 'Log a visit with purpose (measurement, design brief, feasibility, presentation), date and remarks. Visits appear on the CRM dashboard with the owner.'],
      ['8.4 Quotations', 'Create from a template (standard fit-out, design + build, civil only, turnkey retail) with value, margin target, validity and recipient. The PDF-ready preview includes scope, GST, payment terms, timeline and validity.'],
      ['8.5 Converting to a project', 'On a Won lead, click "Convert to project". Managekaro creates the project with the lead\'s value, area, type and city, and you can then import the BOQ.']
    ] },
    { id: 'hrm', title: '9. HRM & payroll', items: [
      ['9.1 Employees', 'The employee master holds designation, department, role/access, unit, employment type, joining date, gross, statutory IDs (PAN, Aadhaar, UAN, ESI), bank details, skills and leave balances. Adding an employee creates a login.'],
      ['9.2 Employee profile', 'Profile shows salary structure (basic 50%, HRA 40% of basic, conveyance, special), attendance for the month, leave history, recent payslips, appraisal status and skills.'],
      ['9.3 Attendance', 'Attendance is geo-fenced: punch-in verifies location (250 m default), optional selfie, shift and grace period. The matrix view shows 14 days per employee with present, late, WFH, leave, half-day, absent and weekly-off colours.'],
      ['9.4 Leave', 'Six leave types with entitlement, carry-forward and paid flag. Apply with dates and reason; approval routes manager → HR. Leave beyond balance becomes LOP. Holidays are excluded from computation.'],
      ['9.5 Payroll', 'Choose the cycle, verify gross, LOP and overtime, then Run payroll. Components: basic, HRA, conveyance, special allowance, overtime; deductions: PF, ESI, professional tax, TDS and LOP recovery. Payslips are printable and bank files exportable as CSV.'],
      ['9.6 Recruitment', 'Post a role (department, location, experience, openings, description), track candidates through Applied → Screening → Interview → Offer → Hired, rate them and hire with one click to create the employee record.'],
      ['9.7 Performance', 'Appraisal cycles hold self rating, manager rating, recommended hike, promotion flag and goal completion. Learning & development lists programmes with seats filled and status.']
    ] },
    { id: 'intel', title: '10. Analytics, Copilot & agents', items: [
      ['10.1 Analytics', 'Six dashboard groups: Portfolio (value by type and city, delivery health, progress vs cost, trade heatmap), Project performance (scorecard, S-curve, snag velocity), Financial (cashflow, ageing, cost mix), Procurement (vendor spend and scorecard, GRN quality), People (headcount, utilisation, hours), and Custom dashboards.'],
      ['10.2 Copilot', 'Ask in plain English: "Which projects are bleeding margin?", "How much is outstanding from clients?", "Which vendor is delaying us?", "What is this month\'s payroll cost?". Answers are computed from your live records, with tables and a suggested action. Export the conversation or start a new one.'],
      ['10.3 Agents', 'Analytics, Risk, Reconciliation, Costing, Follow-up and Compliance agents run in the background. They raise findings (slippage, match exceptions, overdue receivables, filings due) and route them to a human approver — agents never approve or pay on their own.'],
      ['10.4 Configuring agents', 'Choose what each agent watches and who is notified, and how often. Every run is logged with findings and notifications sent.']
    ] },
    { id: 'admin', title: '11. Admin, masters & billing', items: [
      ['11.1 Users & roles', 'Nineteen roles including Owner, System Admin, Project Manager, Site Engineer, Designer, Procurement, Finance, HR, QS, Client portal, Vendor portal and Auditor. Switch personas from the avatar menu to test access.'],
      ['11.2 Masters', 'Item/SKU master (code, trade, unit, standard rate, brand, HSN, GST, specification), clients, business units with GSTINs, departments, tags and templates (BOQ, DPR, snag report, approval matrix, quotation, survey checklist).'],
      ['11.3 Approval rules', 'Rules are ordered top-down and first match wins. Example: PO below ₹2 L → PM; ₹2–10 L → PM + Procurement Head; above ₹10 L → PM + Head + Director. Toggle rules on or off without deleting history.'],
      ['11.4 Integrations', 'Connect Tally, Zoho, Gmail/Outlook, Drive, MS Project/P6, Razorpay, biometric devices, EPFO/ESIC, Maps, Slack/Teams and AI. Manage webhooks (event → endpoint) and scoped API keys.'],
      ['11.5 Settings & data', 'Organisation profile, branding, localisation, units, approval rules, DPR templates, backup (full JSON), CSV exports, audit log and reset.'],
      ['11.6 Plan & billing', 'Seats used, storage, add-ons, usage against limits, plan comparison, seat management and GST invoice history.']
    ] },
    { id: 'roles', title: '12. Roles: who does what', items: [
      ['12.1 Daily rhythm by role', 'Site Engineer: DPR (morning punch-in, evening report), GRN on delivery, raise snags, update activity progress. QS: measurement book, certify executed quantity, prepare client billing. Procurement: convert approved PRs to POs, chase delivery, maintain rate contracts. Finance: match invoices, run payments, chase receivables. PM: review delay register, close snags, approve site expenses. HR: attendance exceptions, leave approvals, payroll cycle. Director: approvals inbox, cost & margin, cash position.'],
      ['12.2 Approval matrix (default)', 'Purchase Order: ₹0–2 L PM; ₹2–10 L PM + Procurement Head; ₹10 L+ PM + Head + Director. Vendor invoice: 3-way match then QS + Finance. Change order: QS → PM → Client. Expense above ₹25,000: Site Engineer → PM → Finance. Leave above 3 days: Manager → HR.'],
      ['12.3 Client & vendor portals', 'Clients see progress, drawings, client-facing snags and invoices, and approve variations. Vendors see their POs, delivery schedule, GRN acknowledgements and invoice status. Both are read-scoped and cannot see other clients or vendors.']
    ] },
    { id: 'install', title: '13. Desktop app & deployment', items: [
      ['13.1 Windows app', 'Download Managekaro-Setup-1.0.0.exe from the download page. It is a native 64-bit Windows executable that works on Windows 10, 11, 8.1 and Server 2016+. Double-click to run; if SmartScreen warns, choose More info → Run anyway. The app opens the workspace in your default browser; data stays in local storage on that machine.'],
      ['13.2 Web deployment (Vercel)', 'The workspace is a static site — no build step. Push the repository to GitHub, import it in Vercel, keep the framework preset as "Other" and leave the build command empty. vercel.json already sets headers, rewrites and caching. The site is live at your vercel.app domain and every push redeploys automatically.'],
      ['13.3 Offline & local hosting', 'Because it is static, you can host it on any web server, an intranet share or even open index.html from disk. For a shared team workspace, enable a backend (see 13.4) so data is not limited to one browser.'],
      ['13.4 Data & production notes', 'This build ships with a deterministic demo dataset persisted to browser local storage. To run it as a multi-tenant SaaS, connect the store layer (assets/js/core/store.js) to your API: the CRUD methods (list, add, update, remove) and the session helpers are the only integration points, so screens stay unchanged.']
    ] },
    { id: 'glossary', title: '14. Glossary & shortcuts', items: [
      ['14.1 Glossary', 'BOQ — bill of quantities. WBS — work breakdown structure. PR — purchase requisition. PO — purchase order. GRN — goods receipt note. DPR — daily progress report. RFI — request for information. CO — change order. NCR — non-conformance report. Retention — amount withheld until defect-liability period ends. TDS — tax deducted at source. LOP — loss of pay. GFC — good for construction.'],
      ['14.2 Shortcuts', '⌘/Ctrl + K opens the command palette (pages, projects, people, vendors, actions). Esc closes any overlay. In the palette, ↑/↓ move and Enter opens. Settings → Data exports a full JSON backup at any time.'],
      ['14.3 Troubleshooting', 'Screen appears empty — reset demo data from Settings → Data. Numbers look stale — data is stored per browser; use a single browser profile per demo. PDF print cuts cards — use the print button on the page header, not the browser menu. Excel shows one column — open CSV via Data → From Text and pick comma delimiter.']
    ] }
  ];

  /* real product screenshots (rendered from the same seeded dataset) */
  const SHOT = {
    start: '01-command-centre', dashboard: '01-command-centre', projects: '02-projects',
    boq: '03-project-boq', schedule: '04-gantt', procurement: '05-procurement',
    finance: '06-finance', crm: '07-crm', hrm: '08-hrm', payroll: '09-payroll',
    copilot: '10-copilot', analytics: '11-analytics', admin: '12-settings',
    manual: '13-user-manual', download: '14-download', mobile: '15-mobile-dpr'
  };
  function shot(key, caption) {
    const f = SHOT[key];
    if (!f) return '';
    return `<figure class="shot"><img src="assets/img/shots/${f}.png" alt="${U.attr(caption || key)}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
  }

  /* extras carry their own x.y numbers — continue the chapter sequence */
  function extra(c) {
    const raw = (MK.MANUAL_EXTRA || {})[c.id];
    if (!raw) return '';
    const n = CH.indexOf(c) + 1;
    let k = c.items.length;
    return raw.replace(/<h4>(\d+)\.(\d+)\s+([^<]*)<\/h4>/g, (m, ch, num, title) => {
      k += 1;
      return `<h4>${n}.${k} ${title}</h4>`;
    });
  }

  MK.docsRender = function () {
    const map = { start: 'start', dashboard: 'start', projects: 'projects', schedule: 'gantt', docs: 'boq', procurement: 'procurement', finance: 'finance', crm: 'projects', hrm: 'hrm', intel: 'copilot', admin: 'approvals', roles: 'approvals', install: 'start', glossary: null };
    const figFor = {
      start: [shot('start', 'Figure 1.1 — Command Centre: the first screen after sign-in. Contract value, billing, receivables and margin across the whole portfolio.'),
              shot('mobile', 'Figure 1.2 — The same workspace on a site engineer’s phone: DPR, snags and geo-tagged attendance.')],
      dashboard: [shot('dashboard', 'Figure 2.1 — Portfolio health, today’s work and the approvals waiting on you.')],
      projects: [shot('projects', 'Figure 3.1 — Projects list with health, progress and contract value at a glance.'),
                 shot('boq', 'Figure 3.2 — Project detail → BOQ & scope, with change orders underneath.')],
      schedule: [shot('schedule', 'Figure 4.1 — Schedule & Gantt with baseline, S-curve, slipping activities and milestones.')],
      docs: [shot('analytics', 'Figure 5.1 — Cross-module analytics: every drawing, DPR and cost line can be sliced here.')],
      procurement: [shot('procurement', 'Figure 6.1 — Procurement: POs, 3-way match, vendor scorecard and commitment vs budget.')],
      finance: [shot('finance', 'Figure 7.1 — Finance & billing: ageing, cost vs budget, cash position and recent invoices.')],
      crm: [shot('crm', 'Figure 8.1 — CRM pipeline with deal cards per stage, quotation summary and conversion funnel.')],
      hrm: [shot('hrm', 'Figure 9.1 — HRM dashboard: headcount split, employee directory, attendance and leave.'),
            shot('payroll', 'Figure 9.2 — Payroll: a printable payslip, attendance input, statutory compliance and the pay register.')],
      intel: [shot('copilot', 'Figure 10.1 — AI Copilot answering from live BOQ, PO, invoice and payroll data with a recommended action plan.')],
      admin: [shot('admin', 'Figure 11.1 — Settings: approvals matrix, integrations and data controls.')],
      roles: [shot('admin', 'Figure 12.1 — The approvals matrix is where roles become real: who signs what, above which value.')],
      install: [shot('download', 'Figure 13.1 — The download page and the single-file Windows build it distributes.'),
                shot('manual', 'Figure 13.2 — This manual rendered in the browser, printable to PDF in one click.')],
      glossary: []
    };
    return `<div class="mnav"><div class="wrap-x mnav-in">
        <a href="#/" style="display:flex;align-items:center"><img src="assets/img/logo-dark.svg" alt="Managekaro"></a>
        <nav class="links"><a href="#/site/product">Product</a><a href="#/site/solutions">Solutions</a><a href="#/site/pricing">Pricing</a><a href="#/docs">Documentation</a></nav>
        <div class="right"><a class="mbtn ghost" href="#/login">Sign in</a><a class="mbtn pri" href="#/dashboard">Open live demo</a></div>
      </div></div>
      <section class="doc-hero"><div class="wrap-x">
        <div class="eyebrow">Documentation</div>
        <h1 style="color:#fff;font-size:clamp(28px,4vw,42px);max-width:22ch;letter-spacing:-.035em">Managekaro user manual &amp; feature book</h1>
        <p style="color:#9AA6BC;font-size:14.4px;max-width:70ch;margin-top:12px;line-height:1.65">The complete guide to every module — written for the people who run fit-out and construction projects: site engineers, QS, procurement, finance, HR and leadership. Version 1.0 · ${U.fmtDL(U.today())} · ${CH.reduce((a, c) => a + c.items.length, 0)} topics.</p>
        <div class="row gap8 mt24" style="display:flex;gap:8px;flex-wrap:wrap">
          <a class="mbtn pri" href="downloads/Managekaro-User-Book-1.0.pdf" download>${icon('download', 14)} Download the book (PDF)</a>
          <button class="mbtn ghost" onclick="window.print()">${icon('printer', 14)} Print this page</button>
          <a class="mbtn ghost" href="#/download">${icon('download', 14)} Desktop app</a>
          <a class="mbtn ghost" href="#/dashboard">${icon('play', 14)} Open live demo</a>
        </div>
      </div></section>
      <div class="wrap-x doc-wrap">
        <aside class="doc-nav">${CH.map(c => `<h6>${U.esc(c.title)}</h6>${c.items.map((it, i) => `<a href="#/docs#${c.id}-${i}">${U.esc(it[0])}</a>`).join('')}</nav>`).join('')}
          <h6>Download</h6><a href="#/download">Windows installer (.exe)</a>
        </aside>
        <article class="doc-body">
          <div class="callout"><b>How to use this book:</b> read chapters 1–3 for setup and project control, 4–7 for execution and commercials, 8–9 for growth and people, 10 for intelligence, and 11–14 for administration, roles and deployment. Every figure below is a live preview of the actual screen using the seeded demo portfolio.</div>
          ${CH.map(c => `<h2 id="${c.id}">${U.esc(c.title)}</h2>
            ${c.items.map((it, i) => `<div id="${c.id}-${i}"><h3>${U.esc(it[0])}</h3><p>${U.esc(it[1])}</p></div>`).join('')}
            ${extra(c)}
            ${(figFor[c.id] || []).map(f => f).filter(Boolean).join('')}`).join('')}
          <h2 id="book">Feature book — everything included</h2>
          <table><thead><tr><th>Area</th><th>What you get</th></tr></thead><tbody>
            ${[['Delivery', 'Projects, BOQ with variance, activity schedule, Gantt with baseline, milestones, delay register, DPR with photos, snags with vendor proof-of-resolution, RFIs, drawings with revisions and pin comments, change orders, client status report'],
            ['Commercials', 'Requisitions, RFQs, purchase orders, GRNs, 3-way invoice match, rate contracts, subcontracts, multi-warehouse stock, vendor scorecards, client billing by milestone, retention, TDS, ageing, payments, expenses, journal, GST/TDS compliance, project P&L, margin leakage'],
            ['Growth', 'Lead capture from eight sources, six-stage pipeline, site visits, quotation templates with margin, conversion to project'],
            ['People', 'Employee master with statutory IDs, geo-fenced attendance and shifts, six leave types, payroll with PF/ESI/PT/TDS and payslips, recruitment funnel with one-click hire, appraisals, training, timesheets'],
            ['Intelligence', 'Twenty-plus dashboards, custom dashboards, MIS subscription, AI Copilot over live data, six background agents with risk register'],
            ['Platform', 'Nineteen roles, client and vendor portals, amount-based approval matrix, masters and templates, integrations and webhooks, scoped API keys, audit log, JSON backup, CSV exports, subscription and seats'],
            ['Apps', 'Web workspace (SaaS), installable PWA for site teams, native Windows desktop executable for offline site offices']]
          .map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('')}
          </tbody></table>
          <h2 id="support">Support &amp; contact</h2>
          <p>Email <b>help@managekaro.com</b> · phone <b>+91 124 480 9100</b> · response within four working hours. Enterprise customers get a dedicated CSM and a shared support channel inside the workspace.</p>
          <div class="callout">This manual is generated from the workspace itself — product version 1.0.0, dataset version 14.</div>
        </article>
      </div>`;
  };

  /* register docs as a public route */
  if (MK.site) {
    MK.site.paths.push('/docs');
    const orig = MK.site.render;
    MK.site.render = function (path) {
      if (path === '/docs') return MK.docsRender();
      return orig.call(MK.site, path);
    };
  }
})(window.MK);
