/* Managekaro — public website: landing, solutions, pricing, security, login, download */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store, icon = MK.icon;
  const SITE = {};
  MK.site = SITE;

  const NAVLINKS = [
    ['/site/product', 'Product'],
    ['/site/solutions', 'Solutions'],
    ['/site/pricing', 'Pricing'],
    ['/site/security', 'Security'],
    ['/docs', 'Documentation']
  ];

  const LOGO = '<a href="#/" style="display:flex;align-items:center"><img src="assets/img/logo-dark.svg" alt="Managekaro"></a>';

  function nav(active) {
    return `<div class="mnav"><div class="wrap-x mnav-in">
      ${LOGO}
      <nav class="links">${NAVLINKS.map(([h, l]) => `<a href="#${h}">${l}</a>`).join('')}</nav>
      <div class="right">
        <a class="mbtn ghost" href="#/login">Sign in</a>
        <a class="mbtn pri" href="#/dashboard">${icon('play', 14)} Open live demo</a>
        <button class="mnav-burger" id="mnav-burger">${icon('list', 17)}</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu">${NAVLINKS.map(([h, l]) => `<a href="#${h}">${l}</a>`).join('')}
      <a href="#/download">Download for Windows</a><a href="#/login">Sign in</a><a href="#/dashboard" style="color:#FF9A5A;font-weight:700">Open live demo →</a></div></div>`;
  }

  function footer() {
    const col = (h, links) => `<div><h5>${h}</h5>${links.map(([t, u]) => `<a href="#${u}">${t}</a>`).join('')}</div>`;
    return `<footer class="foot"><div class="wrap-x">
      <div class="foot-grid">
        <div class="about">${LOGO}<p>Managekaro is the ERP + HRM built for interior fit-out and construction companies — one workspace for projects, BOQ, procurement, stores, finance, people and AI-led intelligence.</p>
          <div class="row gap6 mt12" style="display:flex;gap:6px;flex-wrap:wrap">
            <span class="tag" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#B6C0D4">Made in India 🇮🇳</span>
            <span class="tag" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#B6C0D4">SOC2-ready</span>
          </div></div>
        ${col('Product', [['Overview', '/site/product'], ['Project & Design', '/site/solutions/projects'], ['Procurement & Stores', '/site/solutions/procurement'], ['Finance & Billing', '/site/solutions/finance'], ['HRM & Payroll', '/site/solutions/hrm'], ['AI Copilot', '/site/solutions/ai']])}
        ${col('Industries', [['Corporate Fit-out', '/site/solutions/corporate'], ['Retail & F&B', '/site/solutions/retail'], ['Healthcare', '/site/solutions/healthcare'], ['Real Estate', '/site/solutions/realestate'], ['MEP Contractors', '/site/solutions/mep']])}
        ${col('Resources', [['User Manual', '/docs'], ['Feature Book', '/docs#book'], ['Download App', '/download'], ['Live Demo', '/dashboard'], ['Pricing', '/site/pricing']])}
        ${col('Company', [['Security', '/site/security'], ['Contact Sales', '/site/contact'], ['Status', '/site/security'], ['Privacy', '/site/privacy'], ['Terms', '/site/terms']])}
      </div>
      <div class="foot-bot"><span>© 2026 Managekaro Technologies Pvt. Ltd. All rights reserved.</span><span>GSTIN 06AABCM1234K1ZP · Gurugram, India · <a href="#/login">Sign in</a></span></div>
    </div></footer>`;
  }

  const LOGOS = ['Amazon', 'Concentrix', 'ICICI Home Finance', 'The Executive Centre', 'Livspace', 'JSW', 'Semac', 'Café Mocha', 'MedCare', 'Nexus Mall', 'DHLSupply', 'Urban Nest'];

  const MOCK = `<div class="mock fade-up">
    <div class="mock-bar"><i></i><i></i><i></i><span class="url">managekaro.app/dashboard</span></div>
    <div class="mock-body">
      <div class="mock-side">
        <div class="mi on"><i></i>Command Centre</div><div class="mi"><i></i>Projects</div><div class="mi"><i></i>Schedule</div>
        <div class="mi"><i></i>Snags & Quality</div><div class="mi"><i></i>Procurement</div><div class="mi"><i></i>Finance</div>
        <div class="mi"><i></i>HRM & Payroll</div><div class="mi"><i></i>CRM</div><div class="mi"><i></i>AI Copilot</div><div class="mi"><i></i>Analytics</div>
      </div>
      <div class="mock-main">
        <div class="mock-h"><div><b>Portfolio command centre</b><div style="font-size:10.5px;color:#6B7894">11 live projects · ₹62.4 Cr in execution</div></div><span>FY 26-27 · Today</span></div>
        <div class="mock-kpis">
          <div class="mock-kpi"><small>Contract value</small><b>₹68.2 Cr</b><span class="up">▲ 12.4% vs LY</span></div>
          <div class="mock-kpi"><small>Collected</small><b>₹41.9 Cr</b><span class="up">61.4% of billed</span></div>
          <div class="mock-kpi"><small>Payables</small><b>₹7.8 Cr</b><span style="font-size:9.5px;color:#FBBF24;font-weight:700">3 invoices hold</span></div>
          <div class="mock-kpi"><small>Open snags</small><b>128</b><span style="font-size:9.5px;color:#F87171;font-weight:700">14 critical</span></div>
        </div>
        <div class="mock-chart">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#6B7894;margin-bottom:8px"><span>Planned vs actual progress</span><span>Last 6 months</span></div>
          ${MK.UI ? MK.UI.lineChart([{ name: 'Planned', data: [22, 34, 41, 52, 63, 74], color: '#5B7099', fill: false }, { name: 'Actual', data: [20, 31, 39, 47, 58, 69], color: '#F2540B' }], ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], { height: 130 }) : ''}
        </div>
        <div style="margin-top:12px;display:grid;grid-template-columns:1fr;gap:0">
          <div class="mrow"><span class="b"></span>Amazon BLR8 Fitout · MK-1024<span class="p">62%</span><span class="st">On track</span></div>
          <div class="mrow"><span class="b" style="background:#2563EB"></span>Concentrix Floor 7 & 8 · MK-1025<span class="p">74%</span><span class="st">On track</span></div>
          <div class="mrow"><span class="b" style="background:#E0A800"></span>Nexus Mall Food Court · MK-1028<span class="p">28%</span><span class="st w">At risk</span></div>
        </div>
      </div>
    </div>
    <div class="mock-float"><span class="ic">${icon('sparkles', 14)}</span><div><b>Copilot:</b> Margin on MK-1028 dropped 2.1% — 3 POs above BOQ rate.</div></div>
  </div>`;

  const FEATURES = [
    ['building', 'Projects & BOQ', 'BOQ-first project control: scope, quantities, installed progress, change orders and item-level margin guardrails.', '/site/solutions/projects'],
    ['calendar', 'Schedule & Gantt', 'Import from MS Project / P6, dependencies, critical path, planned vs actual and mobile daily updates.', '/site/solutions/projects'],
    ['folder', 'Design & Drawings', 'Version-controlled GFC sets, pin comments, transmittals, and multi-level design approvals with audit trail.', '/site/solutions/projects'],
    ['cart', 'Procurement', 'PR → RFQ → comparative → PO → GRN → 3-way match. Rate contracts and vendor scorecards out of the box.', '/site/solutions/procurement'],
    ['warehouse', 'Stores & Inventory', 'Multi-warehouse stock, min/max alerts, material issue to site, wastage tracking and reconciliation.', '/site/solutions/procurement'],
    ['wallet', 'Finance & Billing', 'Client billing by milestone, certified work, retention, TDS, aging, cashflow and project P&L in real time.', '/site/solutions/finance'],
    ['users', 'HRM & Payroll', 'Geo-fenced attendance, shifts, leave, payroll with PF/ESI/PT/TDS, hiring, onboarding and appraisals.', '/site/solutions/hrm'],
    ['target', 'CRM & Quotations', 'Lead funnels, site visits, quotations with margins, and one-click conversion to a live project.', '/site/solutions/retail'],
    ['sparkles', 'AI Copilot & Agents', 'Ask anything about cost, delay, vendors or people. Risk and reconciliation agents work in the background.', '/site/solutions/ai']
  ];

  function landing() {
    return `${nav('/')}
    <section class="hero"><div class="wrap-x hero-in">
      <div class="pill-ann"><b>New</b> AI agents for delay & cost risk · v1.0 Enterprise</div>
      <h1>Run your entire <em>fit-out & construction</em> company on one ERP</h1>
      <p class="lede">Managekaro unifies projects, BOQ, design, procurement, stores, finance, CRM, HRM and payroll for interior fit-out and construction teams — with an AI copilot that reads every department and tells you what to fix before it costs you money.</p>
      <div class="hero-cta">
        <a class="mbtn pri lg" href="#/dashboard">${icon('play', 15)} Explore live demo</a>
        <a class="mbtn ghost lg" href="#/download">${icon('download', 15)} Download for Windows</a>
      </div>
      <div class="hero-note"><span>${icon('check', 13)} No credit card for demo</span><span>${icon('check', 13)} Go live in 21 days</span><span>${icon('check', 13)} Tally / WhatsApp / P6 ready</span></div>
      ${MOCK}
    </div></section>

    <section class="sec tight"><div class="wrap-x">
      <p class="center" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6B7894;font-weight:750;margin-bottom:20px">Trusted by 450+ construction & fit-out teams</p>
      <div class="logos">${LOGOS.map(l => `<b>${l}</b>`).join('')}</div>
    </div></section>

    <section class="sec alt"><div class="wrap-x">
      <div class="sec-head"><div class="eyebrow">Why Managekaro</div>
        <h2>From WhatsApp, Excel and disconnected ERPs — to one operating system</h2>
        <p>Every department works from the same record. That is the difference between reporting a problem and preventing it.</p></div>
      <div class="stats">
        <div class="stat"><b>24<i>%</i></b><span>Faster project close-out with snag and handover control</span></div>
        <div class="stat"><b>18<i>%</i></b><span>Procurement saving through rate contracts and 3-way matching</span></div>
        <div class="stat"><b>70<i>%</i></b><span>Faster approval turnaround with mobile approvals</span></div>
        <div class="stat"><b>11<i>+</i></b><span>Departments managed in a single workspace</span></div>
      </div>
    </div></section>

    <section class="sec"><div class="wrap-x">
      <div class="sec-head"><div class="eyebrow">Product</div><h2>Nine modules. One data model.</h2>
        <p>Everything is connected: a BOQ line knows its orders, GRNs, invoices, snags and people. Nothing is typed twice.</p></div>
      <div class="mgrid c3">${FEATURES.map(f => `<a class="mcard" href="#${f[3]}"><div class="mic">${icon(f[0], 18)}</div><h4>${f[1]}</h4><p>${f[2]}</p><span class="lnk">Explore module →</span></a>`).join('')}</div>
    </div></section>

    <section class="sec alt"><div class="wrap-x">
      <div class="split">
        <div><div class="eyebrow">BOQ-first control</div><h3>Your BOQ is the single source of truth</h3>
          <p>In fit-out, margin dies in the gap between what was quoted and what was ordered. Managekaro ties every PO, GRN, measurement, snag and invoice back to a BOQ line, so variance is visible the day it happens.</p>
          <ul class="flist">
            <li><span class="tick">${icon('check', 11)}</span><span>Item-level margin guardrails with budget rate vs ordered rate</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>Installed progress certified by QS, auto-linked to client billing</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>Change orders with client approval and schedule impact</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>Client login to confirm scope, approve variations and track progress</span></li>
          </ul></div>
        <div class="panel"><div class="ptitle"><b>BOQ · MK-1024 Amazon BLR8</b><span>Rev R3 · client confirmed</span></div>
          <table class="tblx"><thead><tr><th>Item</th><th>Qty</th><th>Exec</th><th>Progress</th><th>Variance</th></tr></thead><tbody>
            <tr><td>Gypsum partition 12.5mm</td><td>8,400 sf</td><td>7,610</td><td class="s">91%</td><td class="s">+₹0.4 L</td></tr>
            <tr><td>VRV indoor cassette 2.0 TR</td><td>42 nos</td><td>38</td><td class="s">90%</td><td class="w">−₹1.1 L</td></tr>
            <tr><td>Carpet tile 50×50</td><td>12,200 sf</td><td>9,900</td><td class="s">81%</td><td class="b">−₹2.6 L</td></tr>
            <tr><td>Workstations (MDF)</td><td>184 nos</td><td>120</td><td class="w">65%</td><td class="s">+₹3.2 L</td></tr>
            <tr><td>LED panel 36W</td><td>420 nos</td><td>402</td><td class="s">96%</td><td class="s">+₹0.9 L</td></tr>
          </tbody></table>
          <div class="note" style="margin-top:12px;background:rgba(242,84,11,.1);border:1px solid rgba(242,84,11,.28);color:#FFC9AC">${icon('alert', 12)} 2 items are bleeding margin — 3 POs ordered above budget rate.</div>
        </div>
      </div>
    </div></section>

    <section class="sec"><div class="wrap-x">
      <div class="split rev">
        <div><div class="eyebrow">Execution</div><h3>Site teams update once. Everyone else gets the truth.</h3>
          <p>Daily progress reports from mobile — manpower, work done, materials in/out, blockers and photos — roll up into schedule, billing and client reports automatically.</p>
          <ul class="flist">
            <li><span class="tick">${icon('check', 11)}</span><span>Gantt with dependencies, baseline and delay register</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>DPR with photo evidence, auto WhatsApp to client group</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>Snags assigned to vendors with proof-of-resolution workflow</span></li>
            <li><span class="tick">${icon('check', 11)}</span><span>RFIs, transmittals and drawing revisions under version control</span></li>
          </ul></div>
        <div class="panel"><div class="ptitle"><b>Activity schedule</b><span>Planned vs actual · 6 weeks</span></div>
          <div class="gantt-mini">
            <div class="gr"><span class="nm">Civil & masonry</span><div class="track"><div class="barx" style="left:0%;width:26%"></div></div></div>
            <div class="gr"><span class="nm">Electrical containment</span><div class="track"><div class="barx g" style="left:12%;width:32%"></div></div></div>
            <div class="gr"><span class="nm">HVAC ducting</span><div class="track"><div class="barx" style="left:20%;width:34%"></div></div></div>
            <div class="gr"><span class="nm">Ceiling framework</span><div class="track"><div class="barx g" style="left:38%;width:26%"></div></div></div>
            <div class="gr"><span class="nm">Flooring</span><div class="track"><div class="barx r" style="left:52%;width:22%"></div></div></div>
            <div class="gr"><span class="nm">Painting</span><div class="track"><div class="barx" style="left:64%;width:20%"></div></div></div>
            <div class="gr"><span class="nm">Furniture install</span><div class="track"><div class="barx" style="left:76%;width:20%"></div></div></div>
          </div>
          <div class="mini-bars" style="margin-top:14px">
            <div class="mb"><span style="width:96px">Manpower</span><div class="tr"><i style="width:78%"></i></div><b>78%</b></div>
            <div class="mb"><span style="width:96px">Material in</span><div class="tr"><i style="width:64%"></i></div><b>64%</b></div>
            <div class="mb"><span style="width:96px">Quality score</span><div class="tr"><i style="width:91%"></i></div><b>91%</b></div>
            <div class="mb"><span style="width:96px">Safety compliance</span><div class="tr"><i style="width:86%"></i></div><b>86%</b></div>
          </div></div>
      </div>
    </div></section>

    <section class="sec alt"><div class="wrap-x">
      <div class="sec-head"><div class="eyebrow">Complete ERP + HRM</div><h2>Every department. Every role. One login.</h2>
        <p>19 configurable roles with scoped access, plus dedicated client and vendor portals.</p></div>
      <div class="mgrid c2">
        <div class="mcard"><div class="mic">${icon('layers', 18)}</div><h4>Departments covered</h4>
          <ul><li>Projects, Planning & QS</li><li>Design Studio & Drawings</li><li>Procurement & Rate Contracts</li><li>Stores, Logistics & Assets</li><li>Finance, Billing & Compliance</li><li>Sales / CRM & Pre-sales</li><li>HR — hiring to payroll</li><li>QHSE, Safety & Quality</li><li>IT, Masters & Administration</li></ul></div>
        <div class="mcard"><div class="mic">${icon('lock', 18)}</div><h4>Role-based access</h4>
          <ul><li>Owner / Director — full financials and approvals</li><li>Project Manager — own projects end to end</li><li>Site Engineer — DPR, GRN, snags, checklists</li><li>Quantity Surveyor — BOQ, measurement, billing</li><li>Procurement — PR, PO, vendors, contracts</li><li>Finance — invoices, payments, P&L</li><li>HR — people, attendance, payroll</li><li>Client portal — read-only progress + approvals</li><li>Vendor portal — POs, delivery, invoices</li></ul></div>
      </div>
    </div></section>

    <section class="sec"><div class="wrap-x">
      <div class="sec-head"><div class="eyebrow">Intelligence</div><h2>AI that actually reads your project data</h2>
        <p>Ask in plain English. Get numbers, tables and charts from your own BOQ, POs, invoices, attendance and schedule.</p></div>
      <div class="mgrid c3">
        <div class="mcard"><div class="mic">${icon('sparkles', 18)}</div><h4>Copilot</h4><p>“Which projects will miss the handover date?” — with reasons, owners and suggested actions, grounded in Managekaro records.</p></div>
        <div class="mcard"><div class="mic">${icon('alert', 18)}</div><h4>Risk agent</h4><p>Flags slipping activities, vendor delays, aged receivables and budget burn before month end.</p></div>
        <div class="mcard"><div class="mic">${icon('checksq', 18)}</div><h4>Reconciliation agent</h4><p>Matches invoice vs PO vs GRN vs measured progress, and holds mismatches for approval.</p></div>
      </div>
    </div></section>

    <section class="sec alt"><div class="wrap-x"><div class="cta-band">
      <h2>Your next project should not run on 40 WhatsApp groups</h2>
      <p>Open the live demo with a fully seeded ₹68 Cr portfolio, or download the Windows app for offline, single-file access.</p>
      <div class="row-btns"><a class="mbtn pri lg" href="#/dashboard">${icon('play', 15)} Open live demo</a><a class="mbtn ghost lg" href="#/site/contact">Talk to sales</a><a class="mbtn ghost lg" href="#/download">${icon('download', 15)} Download app</a></div>
    </div></div></section>
    ${footer()}`;
  }

  /* ------------------------------ solutions ------------------------------ */
  const SOLUTIONS = {
    projects: ['Projects, Design & Execution', 'Plan, design, execute and hand over fit-out projects with BOQ-first control.', ['Lead to handover workflow', 'Activity schedule + Gantt', 'Drawing versions & pin comments', 'DPR with photos', 'Snags & handover', 'Client portal']],
    procurement: ['Procurement & Stores', 'Turn requisitions into traceable orders, receipts and reconciled payables.', ['PR → RFQ → PO → GRN', 'Rate contracts', 'Vendor scorecards', '3-way invoice match', 'Multi-warehouse stock', 'Material issue & wastage']],
    finance: ['Finance & Project Accounting', 'Certified progress in, cashflow out — with retention, TDS and GST handled.', ['Milestone client billing', 'Retention & TDS', 'Receivables aging', 'Cashflow forecast', 'Project P&L', 'Tally / Zoho sync']],
    hrm: ['HRM & Payroll', 'Hire, roster, pay and appraise site and office teams from one system.', ['Geo-fenced attendance', 'Shift & overtime', 'Leave workflows', 'Payroll with PF/ESI/PT/TDS', 'Recruitment pipeline', 'Appraisals & training']],
    ai: ['AI Copilot & Agents', 'A control layer that reads across departments and tells you what to fix.', ['Natural language analytics', 'Delay risk detection', 'Cost leakage flags', 'Invoice reconciliation', 'Auto MIS', 'Chat history & exports']],
    corporate: ['Corporate Fit-out', 'Fast-track office fit-outs with multi-floor phasing and client-side reporting.', ['Floor-wise BOQ', 'After-hours work tracking', 'Landlord & building compliance', 'Client dashboard', 'Snag closure before handover']],
    retail: ['Retail & F&B', 'Roll out outlets on repeatable templates — brand standards, same BOQ, every site.', ['Template BOQ per brand', 'Multi-outlet programme view', 'Vendor rate contracts', 'Fast snag closure', 'Repeat client history']],
    healthcare: ['Healthcare Fit-out', 'Compliance-heavy builds with MEP coordination and infection-control checks.', ['MEP clash tracking', 'Commissioning checklists', 'Validation documentation', 'Fire & NOC compliance', 'As-built handover pack']],
    realestate: ['Real Estate & Construction', 'Tower and unit-level construction control with contractor billing.', ['WBS up to unit level', 'Measurement books', 'Contractor RA bills', 'Material reconciliation', 'Progress certification']],
    mep: ['MEP Contractors', 'Design, install, test and commission MEP scopes with service-level tracking.', ['Service-wise BOQ', 'T&C checklists', 'AMC & warranty register', 'Technician scheduling', 'Spare parts stock']]
  };

  function solutionPage(slug) {
    const s = SOLUTIONS[slug] || SOLUTIONS.projects;
    return `${nav('/site/solutions')}
    <section class="hero" style="padding:52px 0 20px"><div class="wrap-x">
      <a class="tiny" href="#/site/solutions" style="color:#FF9A5A;font-weight:700">← All solutions</a>
      <h1 style="text-align:left;max-width:22ch;margin-top:14px">${U.esc(s[0])}</h1>
      <p class="lede" style="text-align:left;margin-left:0">${U.esc(s[1])}</p>
      <div class="hero-cta" style="justify-content:flex-start"><a class="mbtn pri lg" href="#/dashboard">Open live demo</a><a class="mbtn ghost lg" href="#/site/pricing">See pricing</a></div>
      <div class="mgrid c3 mt40">${s[2].map((x, i) => `<div class="mcard"><div class="mic">${icon(['check', 'layers', 'chart', 'users', 'shield', 'sparkles'][i % 6], 17)}</div><h4>${U.esc(x)}</h4><p>Configured for ${U.esc(s[0].toLowerCase())} with ready-to-use masters, templates and approval chains.</p></div>`).join('')}</div>
    </div></section>
    <section class="sec alt"><div class="wrap-x"><div class="cta-band">
      <h2>See it with your own portfolio</h2><p>Book a 30-minute walkthrough. We will map your departments, approval hierarchy and reporting into Managekaro.</p>
      <div class="row-btns"><a class="mbtn pri lg" href="#/site/contact">Book a walkthrough</a><a class="mbtn ghost lg" href="#/docs">Read the manual</a></div>
    </div></div></section>${footer()}`;
  }

  function solutionsIndex() {
    return `${nav('/site/solutions')}
    <section class="hero" style="padding:56px 0 10px"><div class="wrap-x">
      <div class="eyebrow">Solutions</div>
      <h1 style="text-align:left;max-width:24ch">Built for how fit-out and construction actually works</h1>
      <p class="lede" style="text-align:left;margin:14px 0 0">Pick your segment — the masters, templates and approval chains are pre-configured.</p>
    </div></section>
    <section class="sec"><div class="wrap-x"><div class="mgrid c3">${Object.keys(SOLUTIONS).map(k => {
      const s = SOLUTIONS[k];
      return `<a class="mcard" href="#/site/solutions/${k}"><div class="mic">${icon('building', 17)}</div><h4>${U.esc(s[0])}</h4><p>${U.esc(s[1])}</p><span class="lnk">Explore →</span></a>`;
    }).join('')}</div></div></section>${footer()}`;
  }

  function productPage() {
    return `${nav('/site/product')}
    <section class="hero" style="padding:54px 0 10px"><div class="wrap-x">
      <div class="eyebrow">Product overview</div>
      <h1 style="text-align:left;max-width:23ch">One platform for every department you run</h1>
      <p class="lede" style="text-align:left;margin:14px 0 0">Managekaro is delivered as a SaaS workspace with role-based apps for office, site, client and vendor.</p>
    </div></section>
    <section class="sec"><div class="wrap-x">
      <div class="mgrid c3">${FEATURES.map(f => `<a class="mcard" href="#${f[3]}"><div class="mic">${icon(f[0], 17)}</div><h4>${f[1]}</h4><p>${f[2]}</p><span class="lnk">Explore →</span></a>`).join('')}</div>
      <div class="split mt40">
        <div><div class="eyebrow">Modules at a glance</div><h3>45+ screens, one design system</h3>
        <p>Every list has search, filters, saved views, inline actions, CSV export and drill-down. Every record has an audit trail, comments, attachments and linked records.</p>
        <ul class="flist">
          <li><span class="tick">${icon('check', 11)}</span><span>Command centre with portfolio KPIs and risk feed</span></li>
          <li><span class="tick">${icon('check', 11)}</span><span>Approvals inbox with amount-based hierarchies</span></li>
          <li><span class="tick">${icon('check', 11)}</span><span>Analytics with 20+ dashboards and CSV export</span></li>
          <li><span class="tick">${icon('check', 11)}</span><span>Masters, users, roles and subscription administration</span></li>
        </ul></div>
        <div class="panel"><div class="ptitle"><b>Approvals inbox</b><span>4 pending</span></div>
          <table class="tblx"><thead><tr><th>Type</th><th>Ref</th><th>Amount</th><th>Level</th><th>Status</th></tr></thead><tbody>
            <tr><td>Purchase Order</td><td>PO/2425/0018</td><td>₹4.62 L</td><td>1 of 2</td><td class="w">Pending</td></tr>
            <tr><td>Vendor Invoice</td><td>VINV-0032</td><td>₹1.84 L</td><td>2 of 2</td><td class="w">Pending</td></tr>
            <tr><td>Change Order</td><td>CO-014</td><td>₹6.20 L</td><td>1 of 3</td><td class="w">Pending</td></tr>
            <tr><td>Expense</td><td>EXP-0210</td><td>₹38,400</td><td>2 of 3</td><td class="w">Pending</td></tr>
          </tbody></table></div>
      </div>
    </div></section>${footer()}`;
  }

  function pricingPage() {
    const plans = S.db ? S.db.plans : [];
    return `${nav('/site/pricing')}
    <section class="hero" style="padding:56px 0 12px"><div class="wrap-x hero-in">
      <div class="eyebrow" style="justify-content:center">Pricing</div>
      <h1>Simple plans that scale with your sites</h1>
      <p class="lede">Start with one project, or run a multi-city portfolio. All plans include the full project module — pay for the departments you switch on.</p>
    </div></section>
    <section class="sec tight"><div class="wrap-x"><div class="price-grid">
      ${plans.map(p => `<div class="pcard ${p.popular ? 'pop' : ''}">${p.popular ? '<span class="tagtop">Most popular</span>' : ''}
        <h4>${p.name}</h4>
        <div class="pr">${p.price ? '₹' + U.num(p.price) : 'Custom'}<small>${p.price ? ' / ' + p.per : ' · annual contract'}</small></div>
        <div class="pd">${p.users >= 999 ? 'Unlimited users' : 'Up to ' + p.users + ' users'} · ${p.projects >= 999 ? 'unlimited projects' : p.projects + ' projects'} · ${p.storage}</div>
        <ul>${p.features.map(f => `<li>${icon('check', 12)}<span>${U.esc(f)}</span></li>`).join('')}</ul>
        <a class="mbtn ${p.popular ? 'pri' : 'ghost'} block" href="#/site/contact" style="width:100%">${p.price ? 'Start 14-day trial' : 'Talk to sales'}</a>
      </div>`).join('')}
    </div>
    <div class="note mt24" style="background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.1);color:#B6C0D4;text-align:center">Prices exclude 18% GST. Annual billing saves 15%. Implementation, data migration and training included from Growth onwards.</div>
    </div></section>
    <section class="sec alt"><div class="wrap-x"><div class="sec-head"><div class="eyebrow">Compare</div><h2>What is inside each plan</h2></div>
      <div class="panel"><table class="tblx"><thead><tr><th>Capability</th><th>Starter</th><th>Growth</th><th>Enterprise</th></tr></thead><tbody>
        ${[['Projects & BOQ', 1, 1, 1], ['Schedule / Gantt', 1, 1, 1], ['DPR + client reports', 1, 1, 1], ['Snags, RFI, documents', 1, 1, 1], ['Procurement & stores', 0, 1, 1], ['Finance & client billing', 0, 1, 1], ['CRM & quotations', 0, 1, 1], ['HRM & payroll', 0, 0, 1], ['AI Copilot & agents', 0, 1, 1], ['Multi-company / units', 0, 0, 1], ['SSO, audit logs, API', 0, 0, 1], ['Dedicated CSM', 0, 0, 1]].map(r => `<tr><td>${r[0]}</td>${[1, 2, 3].map(i => `<td class="${r[i] ? 's' : 'b'}">${r[i] ? 'Included' : '—'}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
    </div></section>
    <section class="sec"><div class="wrap-x"><div class="sec-head"><div class="eyebrow">FAQ</div><h2>Questions buyers actually ask</h2></div>
    <div class="faq">
      <details class="fq" open><summary>How long does implementation take?</summary><p>Most fit-out companies go live in 3–4 weeks: week 1 masters (projects, BOQ, vendors, users, roles), week 2 procurement and finance, week 3 site teams and DPR, week 4 client portal and analytics. Data migration from Excel is included from Growth.</p></details>
      <details class="fq"><summary>Can my site engineers use it on mobile?</summary><p>Yes. The workspace is a responsive web app, and the Windows desktop app runs the same UI offline. Field updates (DPR, GRN, snags, checklists) are designed mobile-first with photo capture and geo-tagged attendance.</p></details>
      <details class="fq"><summary>Does it replace Tally / Zoho Books?</summary><p>It can sit alongside them. Managekaro pushes purchase orders, invoices, payments and expenses to Tally Prime, Zoho Books, Dynamics or SAP via standard connectors, and can also own project accounting end to end.</p></details>
      <details class="fq"><summary>How is my data secured?</summary><p>Role-based access down to record level, per-tenant encryption, full audit logs, SSO on Enterprise, daily backups with 30-day retention and India/UAE data residency options.</p></details>
      <details class="fq"><summary>Do clients and vendors get access?</summary><p>Yes — dedicated portals. Clients see progress, drawings, snags and invoices, and can approve variations. Vendors see their POs, delivery schedules and invoice status.</p></details>
    </div></div></section>${footer()}`;
  }

  function securityPage() {
    return `${nav('/site/security')}
    <section class="hero" style="padding:54px 0 10px"><div class="wrap-x"><div class="eyebrow">Security & trust</div>
      <h1 style="text-align:left;max-width:20ch">Project data is your commercial advantage. We protect it.</h1></div></section>
    <section class="sec"><div class="wrap-x"><div class="mgrid c3">
      ${[['shield', 'Access control', '19 configurable roles, project-level scoping, record-level permissions and approval limits.'],
      ['lock', 'Encryption', 'TLS 1.3 in transit, AES-256 at rest, per-tenant data isolation and encrypted backups.'],
      ['checksq', 'Audit trail', 'Every create, update, approval and export is logged with user, IP, device and timestamp.'],
      ['cpu', 'Resilience', 'Daily automated backups, 30-day retention, point-in-time restore and status transparency.'],
      ['globe', 'Residency', 'Choose India, UAE or KSA hosting. Data never leaves your chosen region.'],
      ['key', 'Enterprise controls', 'SSO (OIDC/SAML), SCIM provisioning, IP allowlists and API keys with scoped access.']].map(x => `<div class="mcard"><div class="mic">${icon(x[0], 18)}</div><h4>${x[1]}</h4><p>${x[2]}</p></div>`).join('')}
    </div></div></section>${footer()}`;
  }

  function contactPage() {
    return `${nav('/site/contact')}
    <section class="sec"><div class="wrap-x"><div class="split">
      <div><div class="eyebrow">Talk to us</div><h3 style="font-size:32px">See Managekaro with your own data</h3>
        <p>Tell us your segment, project count and current stack. We will show the exact screens your team will use — no generic slide deck.</p>
        <ul class="flist mt24">
          <li><span class="tick">${icon('check', 11)}</span><span>Sales: sales@managekaro.com · +91 124 480 9100</span></li>
          <li><span class="tick">${icon('check', 11)}</span><span>Support: help@managekaro.com (response under 4 working hours)</span></li>
          <li><span class="tick">${icon('check', 11)}</span><span>Office: Unit 712, Tower B, Emaar Digital Greens, Sector 61, Gurugram</span></li>
        </ul></div>
      <form class="panel" data-contact style="padding:22px">
        <div class="mfield"><label>Full name</label><input required placeholder="Your name"></div>
        <div class="mfield"><label>Work email</label><input type="email" required placeholder="you@company.com"></div>
        <div class="mfield"><label>Company</label><input required placeholder="Company name"></div>
        <div class="mfield"><label>Segment</label><select><option>Corporate fit-out</option><option>Retail / F&B</option><option>Healthcare</option><option>Real estate / construction</option><option>MEP contractor</option></select></div>
        <div class="mfield"><label>Live projects</label><input placeholder="e.g. 12 projects, 90 users"></div>
        <button class="mbtn pri lg block" style="width:100%;margin-top:16px" type="submit">Request walkthrough</button>
        <div class="dl-note">By submitting you agree to be contacted about Managekaro. Demo requests are answered within one business day.</div>
      </form>
    </div></div></section>${footer()}`;
  }

  function legalPage(which) {
    const isPrivacy = which === 'privacy';
    return `${nav('')}<section class="sec"><div class="wrap-x doc-body" style="max-width:800px">
      <h2 style="border:0">${isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h2>
      <p>Last updated 1 November 2026 · Managekaro Technologies Pvt. Ltd.</p>
      <h3>1. Scope</h3><p>This ${isPrivacy ? 'policy' : 'agreement'} governs the use of the Managekaro workspace, website and desktop application (the “Service”).</p>
      <h3>2. ${isPrivacy ? 'Data we process' : 'Your account'}</h3><p>${isPrivacy ? 'We process account data (name, work email, role, organisation), project records you upload, device/usage telemetry required to operate the Service, and support correspondence. We do not sell personal data.' : 'You are responsible for the accuracy of data entered by your users, for maintaining credentials, and for configuring roles and access scopes appropriate to your organisation.'}</p>
      <h3>3. ${isPrivacy ? 'How we use it' : 'Subscription & billing'}</h3><p>${isPrivacy ? 'Data is used to provide and secure the Service, deliver support, generate your reports and improve product reliability. Regional hosting is honoured per your contract.' : 'Subscriptions renew automatically unless cancelled 30 days before renewal. Prices are exclusive of applicable taxes. Implementation and custom development are billed separately.'}</p>
      <h3>4. ${isPrivacy ? 'Retention & your rights' : 'Data ownership'}</h3><p>${isPrivacy ? 'Project data is retained while your workspace is active and for 30 days after termination, then deleted from backups within the retention window. You may request export or deletion at any time.' : 'You own your data. On request we provide a full export (CSV/JSON) of your workspace. Managekaro may use aggregated, anonymised metrics for product benchmarking.'}</p>
      <h3>5. Contact</h3><p>legal@managekaro.com · Unit 712, Tower B, Emaar Digital Greens, Sector 61, Gurugram 122102, Haryana, India.</p>
    </div></section>${footer()}`;
  }

  /* -------------------------------- login -------------------------------- */
  function loginPage(mode) {
    const signup = mode === 'signup';
    return `<div class="auth">
      <div class="side">
        <a href="#/" style="display:flex;align-items:center"><img src="assets/img/logo-dark.svg" alt="Managekaro" style="height:34px"></a>
        <div>
          <h2 style="font-size:30px;color:#fff;letter-spacing:-.03em;max-width:18ch;line-height:1.2">Every department, one workspace.</h2>
          <p style="color:#9AA6BC;font-size:13.6px;margin-top:12px;max-width:40ch;line-height:1.65">Projects, BOQ, procurement, finance, CRM and HRM with an AI copilot that reads across all of them.</p>
          <div class="mt24" style="display:flex;flex-direction:column;gap:10px;max-width:420px">
            ${['Live ₹68 Cr demo portfolio pre-loaded', 'Role-based apps for office, site, client & vendor', 'Approvals, DPR and payroll in one login', 'Available as a Windows desktop app'].map(t => `<div style="display:flex;gap:9px;align-items:center;font-size:12.8px;color:#C2CBDD"><span style="width:18px;height:18px;border-radius:50%;background:rgba(14,159,110,.16);color:#34D399;display:grid;place-items:center">${icon('check', 11)}</span>${t}</div>`).join('')}
          </div>
        </div>
        <div style="font-size:11.4px;color:#5F6B85">© 2026 Managekaro Technologies Pvt. Ltd. · SOC2-ready · Data residency: India / UAE</div>
      </div>
      <div class="form">
        <div class="box">
          <h1>${signup ? 'Create your workspace' : 'Sign in to Managekaro'}</h1>
          <p class="sub">${signup ? '14-day trial · no card required · your data stays yours' : 'Demo mode — choose a persona, no password needed'}</p>
          <form data-auth="${signup ? 'signup' : 'signin'}">
            ${signup ? '<div class="mfield"><label>Company name</label><input required placeholder="Your company"></div><div class="mfield"><label>Work email</label><input type="email" required placeholder="you@company.com"></div>' : '<div class="mfield"><label>Work email</label><input type="email" value="aarav.sharma@managekaro.com" placeholder="you@company.com"></div><div class="mfield"><label>Password</label><input type="password" value="demo1234" placeholder="••••••••"></div>'}
            ${signup ? '<div class="mfield"><label>Password</label><input type="password" required placeholder="Minimum 8 characters"></div>' : ''}
            <div class="mfield"><label>Sign in as</label>
              <div class="rolepick" data-rolepick>
                <button type="button" class="on" data-role="owner" data-user="USR-0001">Director<small>Full access</small></button>
                <button type="button" data-role="pm" data-user="USR-0007">Project Manager<small>Delivery</small></button>
                <button type="button" data-role="proc" data-user="USR-0015">Procurement<small>Buying</small></button>
                <button type="button" data-role="fin" data-user="USR-0018">Finance<small>Commercials</small></button>
                <button type="button" data-role="site" data-user="USR-0009">Site Engineer<small>Field</small></button>
                <button type="button" data-role="hr" data-user="USR-0005">HR Manager<small>People</small></button>
              </div>
            </div>
            <button class="mbtn pri lg block" style="width:100%;margin-top:18px" type="submit">${signup ? 'Create workspace' : 'Sign in to workspace'}</button>
          </form>
          <div class="switch">${signup ? 'Already have an account? <a href="#/login">Sign in</a>' : 'New to Managekaro? <a href="#/login/signup">Create a workspace</a>'}</div>
          <div class="switch" style="margin-top:10px"><a href="#/dashboard">Skip — open live demo →</a></div>
          <div class="dl-note" style="margin-top:20px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.13);color:#7C86A0">Demo credentials are pre-filled. In production this screen connects to your SSO / email OTP provider.</div>
        </div>
      </div>
    </div>`;
  }

  /* ------------------------------- download ------------------------------ */
  function downloadPage() {
    const exe = 'downloads/Managekaro-Setup-1.0.0.exe';
    return `${nav('')}
    <section class="dl-hero"><div class="wrap-x">
      <div class="eyebrow">Desktop app</div>
      <h1 style="text-align:left;font-size:clamp(28px,4vw,46px);max-width:20ch">Download Managekaro for Windows</h1>
      <p class="lede" style="text-align:left;margin-left:0">One file. Any Windows system — 64-bit and 32-bit, Windows 10, 11, Server 2016 and later. Runs fully offline with your local workspace, no installation of runtimes required.</p>
      <div class="dl-grid mt40">
        <div class="dl-card">
          <div class="dl-os"><span class="o on">${icon('grid', 14)} Windows 10 / 11</span><span class="o">${icon('grid', 14)} Windows 8.1</span><span class="o">${icon('grid', 14)} Server 2016+</span></div>
          <div class="row-between" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div><b style="color:#fff;font-size:15px">Managekaro Desktop</b><div style="font-size:12px;color:#94A0B8;margin-top:3px">Version 1.0.0 · Enterprise build</div></div>
            <a class="mbtn pri lg" href="${exe}" download>${icon('download', 16)} Download .exe</a>
          </div>
          <div class="dl-meta">
            <div><small>File</small><b>Managekaro-Setup-1.0.0.exe</b></div>
            <div><small>Architecture</small><b>64-bit core · x86 build below</b></div>
            <div><small>Not signed</small><b>Click “More info → Run anyway”</b></div>
          </div>
          <div class="dl-note">${icon('shield', 12)} The installer is a native Windows executable. Because the build is not code-signed, Windows SmartScreen may show a warning on first run — choose <b>More info → Run anyway</b>. You can verify the SHA-256 checksum below against the published hash.</div>
          <div class="copy" style="margin-top:10px"><span style="color:#B6C0D4;word-break:break-all" id="sha">computing…</span><button data-copy-sha>Copy</button></div>
          <div class="row gap8 mt16" style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="mbtn ghost" href="${exe}" download="Managekaro-Setup-1.0.0.exe">Direct download (x64)</a>
            <a class="mbtn ghost" href="downloads/Managekaro-Setup-1.0.0-x86.exe" download="Managekaro-Setup-1.0.0-x86.exe">32-bit build</a>
            <a class="mbtn ghost" href="#/site/product">What's included</a>
            <a class="mbtn ghost" href="downloads/Managekaro-User-Book-1.0.pdf" download>User book (PDF · 36 pages)</a>
          </div>
        </div>
        <div>
          <div class="dl-steps">
            <div class="dl-step"><span class="n">1</span><div><b>Download the file</b><p>Save <code style="font-size:11px">Managekaro-Setup-1.0.0.exe</code> anywhere on your PC.</p></div></div>
            <div class="dl-step"><span class="n">2</span><div><b>Run it</b><p>Double-click. If SmartScreen appears, select <b>More info</b> then <b>Run anyway</b>.</p></div></div>
            <div class="dl-step"><span class="n">3</span><div><b>It opens your browser workspace</b><p>The app starts an embedded local server and opens Managekaro — same ERP, offline-capable, single file.</p></div></div>
            <div class="dl-step"><span class="n">4</span><div><b>Your data stays local</b><p>Local storage on your machine. The web version at managekaro.app keeps your cloud workspace.</p></div></div>
          </div>
          <div class="panel mt24"><div class="ptitle"><b>System requirements</b><span>all editions</span></div>
            <table class="tblx"><tbody>
              <tr><td>OS</td><td>Windows 10, 11, 8.1, Server 2016+</td></tr>
              <tr><td>Architecture</td><td>64-bit (x64) — 32-bit compatible build</td></tr>
              <tr><td>RAM</td><td>4 GB minimum, 8 GB recommended</td></tr>
              <tr><td>Disk</td><td>250 MB free</td></tr>
              <tr><td>Browser</td><td>Edge, Chrome or any modern browser</td></tr>
              <tr><td>Network</td><td>Not required for local mode</td></tr>
              <tr><td>Manual</td><td><a href="downloads/Managekaro-User-Book-1.0.pdf" download style="color:#FF9A5A">Managekaro-User-Book-1.0.pdf</a> — 36 pages, 71 topics</td></tr>
            </tbody></table></div>
        </div>
      </div>
    </div></section>
    <section class="sec"><div class="wrap-x"><div class="sec-head"><div class="eyebrow">Also available</div><h2>Same workspace, every device</h2></div>
      <div class="mgrid c3">
        <div class="mcard"><div class="mic">${icon('globe', 18)}</div><h4>Web app (SaaS)</h4><p>Open the demo or sign in — hosted, multi-tenant, always latest version. Nothing to install.</p><a class="lnk" href="#/dashboard">Open web app →</a></div>
        <div class="mcard"><div class="mic">${icon('grid', 18)}</div><h4>Windows desktop</h4><p>Single-file executable for site offices with poor connectivity. Local data, same UI.</p><a class="lnk" href="${exe}" download>Download .exe →</a></div>
        <div class="mcard"><div class="mic">${icon('phone', 18)}</div><h4>Mobile web</h4><p>Installable PWA for site engineers: DPR, GRN, snags and geo-tagged attendance.</p><a class="lnk" href="#/docs">How it works →</a></div>
      </div>
    </div></section>
    <section class="sec" id="brand"><div class="wrap-x"><div class="sec-head"><div class="eyebrow">Brand kit</div><h2>Logo &amp; assets, in CSV</h2><p class="lede">The full identity pack — logos, app icon, colour tokens and the brand guide — as files you can hand to a printer, a sign vendor or your design team.</p></div>
      <div class="mgrid c2" style="align-items:start">
        <div class="panel"><div class="ptitle"><b>Brand files</b><span>download</span></div>
          <table class="tblx"><tbody>
            <tr><td><a href="brand/Managekaro-Logo.svg" download>Managekaro-Logo.svg</a></td><td>Primary lockup</td></tr>
            <tr><td><a href="brand/Managekaro-Logo-Dark.svg" download>Managekaro-Logo-Dark.svg</a></td><td>For dark backgrounds</td></tr>
            <tr><td><a href="brand/Managekaro-Wordmark.svg" download>Managekaro-Wordmark.svg</a></td><td>Wordmark only</td></tr>
            <tr><td><a href="brand/Managekaro-AppIcon.svg" download>Managekaro-AppIcon.svg</a></td><td>App icon</td></tr>
            <tr><td><a href="brand/Managekaro-Social-Card.png" download>Managekaro-Social-Card.png</a></td><td>1200 × 630 social card</td></tr>
            <tr><td><a href="brand/README.csv" download>README.csv</a></td><td>Asset index</td></tr>
          </tbody></table>
        </div>
        <div class="panel"><div class="ptitle"><b>Colour &amp; rules as CSV</b><span>tokens</span></div>
          <table class="tblx"><tbody>
            <tr><td><a href="brand/Managekaro-Colours.csv" download>Managekaro-Colours.csv</a></td><td>16 tokens with RGB + usage</td></tr>
            <tr><td><a href="brand/Managekaro-Brand-Guide.csv" download>Managekaro-Brand-Guide.csv</a></td><td>Type, spacing, voice, do/don't</td></tr>
          </tbody></table>
          <div class="dl-note">Every CSV is plain UTF-8 with a header row, so it opens straight in Excel, Sheets or Figma Tokens Studio.</div>
          <div class="row gap8 mt16" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <span class="o" style="border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:7px 11px;font-size:11.6px;color:#C2CBDD">#F2540B brand</span>
            <span class="o" style="border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:7px 11px;font-size:11.6px;color:#C2CBDD">#0B1220 ink</span>
            <span class="o" style="border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:7px 11px;font-size:11.6px;color:#C2CBDD">Inter · JetBrains Mono</span>
          </div>
        </div>
      </div>
    </div></section>${footer()}`;
  }

  /* ------------------------------- router -------------------------------- */
  SITE.paths = ['/', '/site/product', '/site/solutions', '/site/pricing', '/site/security', '/site/contact', '/site/privacy', '/site/terms', '/login', '/login/signup', '/download'];
  SITE.isSitePath = function (p) {
    if (p === '' || p === '/') return true;
    if (SITE.paths.includes(p)) return true;
    if (p.startsWith('/site/solutions/')) return true;
    return false;
  };
  SITE.render = function (path) {
    switch (path) {
      case '': case '/': return landing();
      case '/site/product': return productPage();
      case '/site/solutions': return solutionsIndex();
      case '/site/pricing': return pricingPage();
      case '/site/security': return securityPage();
      case '/site/contact': return contactPage();
      case '/site/privacy': return legalPage('privacy');
      case '/site/terms': return legalPage('terms');
      case '/login': return loginPage('signin');
      case '/login/signup': return loginPage('signup');
      case '/download': return downloadPage();
      default:
        if (path.startsWith('/site/solutions/')) return solutionPage(path.split('/').pop());
        return landing();
    }
  };
  SITE.mount = function (path) {
    document.body.classList.add('mk-site');
    const app = document.getElementById('app');
    app.innerHTML = `<div class="site">${SITE.render(path)}</div>`;
    const burger = document.getElementById('mnav-burger');
    if (burger) burger.onclick = () => document.getElementById('mobile-menu').classList.toggle('open');
    const rp = app.querySelector('[data-rolepick]');
    if (rp) rp.addEventListener('click', e => {
      const b = e.target.closest('[data-role]'); if (!b) return;
      U.$$('[data-role]', rp).forEach(x => x.classList.toggle('on', x === b));
      MK.site._pick = { role: b.dataset.role, user: b.dataset.user };
    });
    const auth = app.querySelector('[data-auth]');
    if (auth) auth.addEventListener('submit', e => {
      e.preventDefault();
      const pick = MK.site._pick || { role: 'owner', user: 'USR-0001' };
      MK.store.prefs.role = pick.role; MK.store.prefs.user = pick.user; MK.store.savePrefs();
      MK.site._pick = null;
      MK.UI.toast('Signed in as ' + MK.store.me().name, 'ok', 'Welcome back');
      location.hash = '/dashboard';
    });
    const cf = app.querySelector('[data-contact]');
    if (cf) cf.addEventListener('submit', e => {
      e.preventDefault();
      cf.innerHTML = `<div style="text-align:center;padding:30px 10px"><div style="width:52px;height:52px;border-radius:16px;background:rgba(14,159,110,.16);color:#34D399;display:grid;place-items:center;margin:0 auto 14px">${icon('check', 24)}</div><h4 style="color:#fff;font-size:17px">Request received</h4><p style="color:#94A0B8;font-size:13px;margin-top:8px">Our team will reach you within one business day. Meanwhile, explore the live demo.</p><a class="mbtn pri" style="margin-top:16px" href="#/dashboard">Open live demo</a></div>`;
    });
    const sha = document.getElementById('sha');
    if (sha) {
      fetch('downloads/Managekaro-Setup-1.0.0.exe.sha256').then(r => r.ok ? r.text() : Promise.reject()).then(t => { sha.textContent = t.trim(); })
        .catch(() => { sha.textContent = 'SHA-256 available in downloads/Managekaro-Setup-1.0.0.exe.sha256'; });
      const btn = app.querySelector('[data-copy-sha]');
      if (btn) btn.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(sha.textContent); MK.UI.toast('Checksum copied', 'ok'); };
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
})(window.MK);
