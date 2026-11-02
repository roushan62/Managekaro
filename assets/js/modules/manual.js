/* Managekaro — extended handbook sections for the in-app user manual.
   Each entry is appended after the chapter's short topics on /docs. */
(function (MK) {
  'use strict';
  MK.MANUAL_EXTRA = {

    /* ------------------------------------------------ 1. getting started */
    start: `
<h4>1.5 The demo dataset</h4>
<p>The workspace ships with a complete, deterministic demo company: <b>16 projects</b>, 57 employees, live BOQ lines,
purchase orders, invoices, payroll and snags, all pinned to a fixed seed so every screen looks identical for every user.
Nothing you see is a mock-up — KPIs, charts and tables are computed from that dataset. Reset it any time from
<b>Settings → Data &amp; backup → Reset demo data</b>.</p>

<h4>1.6 Department map — who works where</h4>
<table><thead><tr><th>Department</th><th>Owns in Managekaro</th><th>Primary screens</th></tr></thead><tbody>
<tr><td>Leadership</td><td>Portfolio value, margin, cash, risk</td><td>Command Centre, Analytics, Approvals</td></tr>
<tr><td>Sales &amp; CRM</td><td>Leads, site surveys, quotations, win rate</td><td>CRM &amp; Leads, Quotations</td></tr>
<tr><td>Design &amp; Studio</td><td>Drawings, revisions, GFC approvals, design BOQ</td><td>Project → Design, Documents</td></tr>
<tr><td>Projects &amp; Site</td><td>WBS, schedule, DPR, snags, RFIs, handover</td><td>Schedule, DPR, Snags, RFIs</td></tr>
<tr><td>Quantity Surveying</td><td>BOQ, variations, change orders, certification</td><td>Project → BOQ &amp; Scope</td></tr>
<tr><td>Procurement &amp; Stores</td><td>Indents, RFQs, POs, GRN, stock, vendors</td><td>Procurement, Stores &amp; Inventory</td></tr>
<tr><td>Finance &amp; Accounts</td><td>Invoices, retention, TDS, GST, payables, cash</td><td>Finance &amp; Billing, Costing</td></tr>
<tr><td>HR &amp; Admin</td><td>Hiring, attendance, leave, payroll, appraisals</td><td>HRM, Attendance, Payroll</td></tr>
</tbody></table>

<h4>1.7 The problems this replaces</h4>
<ul>
<li><b>Excel BOQ drift</b> — every revision lives in a new file, so certified value, variations and margin disagree.
Managekaro keeps one BOQ per project with executed quantity and variance on every line.</li>
<li><b>WhatsApp DPRs</b> — progress and photos arrive in six groups and never reach billing. DPRs are linked to
schedule activities and feed certification.</li>
<li><b>Procurement leakage</b> — ordered vs received vs billed is reconciled by hand at month-end. Three-way match and
committed-cost tracking close that gap daily.</li>
<li><b>Billing lag</b> — milestones are certified but not invoiced for weeks. The billing tab always shows
certified-but-not-invoiced value per project.</li>
<li><b>Payroll &amp; attendance chaos</b> — muster rolls for site labour and a separate register for staff. One
attendance engine feeds both.</li>
<li><b>No single truth for the founder</b> — six spreadsheets and three versions of the pipeline. The Command Centre
recomputes from transactions, never from typed-in summaries.</li>
</ul>`,

    /* ------------------------------------------------ 2. command centre */
    dashboard: `
<h4>2.3 My Work</h4>
<p>Every user gets a personal queue: tasks assigned to them across projects, DPRs awaiting review, approvals in their
name, snags they own and RFIs they must answer. Overdue items sort to the top with a red SLA chip, and any row
deep-links into the record. Filter by project, module or due window.</p>

<h4>2.4 Approvals inbox</h4>
<p>Amount-based hierarchy: a PO under ₹5 L goes to the Project Manager, ₹5–25 L to the Head of Procurement, above
₹25 L to the Founder / CFO. Each request shows type, reference, amount, level (for example L2 of 3), SLA and the full
trail. Actions: approve, reject with reason, request changes, or delegate. Bulk actions work on multi-select for
related documents.</p>

<h4>2.5 Notifications &amp; the command palette</h4>
<p>The bell collects approvals, mentions, SLA breaches, low-stock alerts and payroll confirmations.
<b>⌘K / Ctrl+K</b> opens the palette: type a project code, employee name, vendor, invoice number or module name and
jump straight there; actions such as “new purchase order” or “run payroll” are searchable too.</p>

<h4>2.6 Exporting an MIS pack</h4>
<p>Use the export button on any list to download exactly the rows and columns you filtered. Analytics → Export gives a
project-level file; scheduled MIS subscriptions deliver the same pack by email or WhatsApp on a cadence you set.</p>`,

    /* ------------------------------------------------ 3. projects */
    projects: `
<h4>3.6 The nine project tabs</h4>
<table><thead><tr><th>Tab</th><th>What lives there</th></tr></thead><tbody>
<tr><td>Overview</td><td>Health, progress, key dates, team, risks, recent activity</td></tr>
<tr><td>BOQ &amp; Scope</td><td>Line items by WBS and trade, executed quantity, variance, change orders</td></tr>
<tr><td>Schedule</td><td>Activities with baseline vs actual, dependencies, milestones, delays</td></tr>
<tr><td>Design &amp; Drawings</td><td>Drawing register, revision history, GFC status, pin comments</td></tr>
<tr><td>Procurement</td><td>Indents, POs and GRNs for this project, committed vs budget</td></tr>
<tr><td>DPR</td><td>Daily reports with manpower, work done, blockers and photos</td></tr>
<tr><td>Snags</td><td>Issue list with trade, priority, owner and proof of resolution</td></tr>
<tr><td>Billing</td><td>Milestones, invoices, retention, TDS, collection status</td></tr>
<tr><td>Documents</td><td>Contracts, approvals, checklists, handover pack</td></tr>
</tbody></table>

<h4>3.7 BOQ hygiene the app enforces</h4>
<ul>
<li>Every line needs a WBS code, trade, unit, quantity and rate — blank cells are rejected on import.</li>
<li>Executed quantity cannot exceed BOQ quantity unless a change order is approved first.</li>
<li>Rate variance above the budget rate is highlighted, and the copilot reports leakage per trade.</li>
<li>Certified value rolls into the billing tab, so “certified but not invoiced” is always visible.</li>
</ul>

<h4>3.8 Change orders</h4>
<p>Raise a CO against a project (optionally against a BOQ line), attach justification and client approval, route it
through the approval matrix, then apply it. Applied COs increase contract value and create the matching BOQ lines, so
billing stays aligned with what was actually built.</p>

<h4>3.9 Creating a project</h4>
<p><b>New project</b> asks for client, type (corporate fit-out, coworking, retail, F&amp;B, healthcare, civil), city,
contract value, start and end dates, PM and site engineer. It creates the project code, the default tab set and an
empty BOQ. Import the BOQ from CSV or build it from a template — both keep WBS and trade structure intact.</p>`,

    /* ------------------------------------------------ 4. schedule */
    schedule: `
<h4>4.5 Reading the Gantt</h4>
<ul>
<li>Grey bar = baseline; coloured bar = actual progress to date.</li>
<li>Orange = critical path; a red dot marks an activity already late against its baseline finish.</li>
<li>The vertical line is today — bars to its right are future work.</li>
<li>The S-curve compares cumulative planned vs actual progress; the gap between the curves is your slippage.</li>
</ul>

<h4>4.6 Submitting a DPR from site</h4>
<p>A site engineer opens <b>Daily Progress</b> on a phone, picks the project and records manpower by trade, work done
per activity, material received, blockers and up to nine photos. Submitting time-stamps the report, geo-tags it when
permission is granted and notifies the PM. Reviewed DPRs update activity progress, which updates the Gantt and the
project progress KPI.</p>

<h4>4.7 Snags, RFIs and documents</h4>
<p>Snags carry trade, location, priority, owner, due date and a photo; closure needs a resolution photo, so vendors
cannot self-certify. RFIs track questions to consultants with due dates, and the answer is attached to the drawing
revision it affects. The document register keeps contracts, drawings and approvals with revision numbers and pin
comments.</p>

<h4>4.8 Delay register</h4>
<p>Any activity whose actual finish runs past baseline lands in the delay register with reason codes (design change,
material delay, labour, client decision, weather). Reasons roll up into the delivery analytics tab, which is what you
quote in a client delay discussion.</p>`,

    /* ------------------------------------------------ 5. documents */
    docs: `
<h4>5.5 Document control rules</h4>
<ul>
<li>One register per project: contracts, drawings, approvals, checklists and the handover pack.</li>
<li>Every drawing has a revision number, issue date, status (WIP / For review / GFC / As-built) and pin comments.</li>
<li>Search by number, title, tag or issuer — results stay project-scoped by default.</li>
<li>Nothing is deleted: superseded revisions remain visible as history, which matters in a dispute.</li>
</ul>

<h4>5.6 Handover pack</h4>
<p>At completion, the handover pack assembles as-built drawings, O&amp;M manuals, warranties, test certificates,
snag-closure evidence and the final bill. Export it as a single PDF per project — the same pack a client's facility
team asks for six months later.</p>`,

    /* ------------------------------------------------ 6. procurement */
    procurement: `
<h4>6.5 The five-step chain</h4>
<ol>
<li><b>Indent</b> — site or PM raises a requisition against BOQ lines; approval follows the matrix.</li>
<li><b>RFQ</b> — send to three or more vendors from the vendor master and compare landed rates side by side.</li>
<li><b>PO</b> — convert the winning quote; committed cost posts to the project budget immediately.</li>
<li><b>GRN</b> — stores records receipt (full, partial, rejected); stock and PO status follow.</li>
<li><b>Vendor bill</b> — three-way match (PO ↔ GRN ↔ invoice) before any payment is released.</li>
</ol>

<h4>6.6 Stores &amp; inventory</h4>
<p>Multi-warehouse stock with issue-to-project, returns, transfers and reorder levels. Every issue is charged to a
project and a BOQ line, so material cost per line is real rather than estimated. Low-stock alerts reach both the
storekeeper and the procurement head.</p>

<h4>6.7 Vendor scorecards</h4>
<p>Delivery reliability, quality rejections, rate competitiveness and dispute count, all computed from transactions.
Use it when choosing the next RFQ winner — not gut feel.</p>

<h4>6.8 Rate contracts and subcontracts</h4>
<p>Fix rates per item and vendor for a period, and POs inherit them automatically. Subcontracts carry scope, retention,
mobilisation advance and measurement rules, so sub-contractor bills are checked against contract scope before payment.</p>`,

    /* ------------------------------------------------ 7. finance */
    finance: `
<h4>7.5 Client billing by milestone</h4>
<p>Billing milestones are defined per project (mobilisation, design freeze, 30% progress, handover…). Certifying a
milestone creates a draft invoice with GST, retention and TDS applied; sending it posts a receivable. The ageing view
splits outstanding into 0–30, 31–60, 61–90 and 90+ days.</p>

<h4>7.6 Costing &amp; margin</h4>
<ul>
<li>Budget vs committed vs actual per cost head — material, labour, sub-contract and overheads.</li>
<li>Gross margin from BOQ rates; actual margin after real purchases, labour and overhead allocation.</li>
<li>Margin-leakage view: BOQ lines above budget rate, wastage, unbilled variations, overtime.</li>
<li>Project P&amp;L printable per project and consolidated for the portfolio.</li>
</ul>

<h4>7.7 Statutory</h4>
<p>GST on invoices (CGST / SGST / IGST), TDS deduction on vendor bills, retention withholding and e-invoice-ready
numbering. Every export is CSV so your accountant can post to Tally or Zoho Books; the integrations page can push them
automatically.</p>

<h4>7.8 Month-end close checklist</h4>
<ol>
<li>Confirm every GRN has a matching vendor bill or an open accrual.</li>
<li>Certify progress with QS and raise all milestone invoices.</li>
<li>Post payroll and record statutory challans.</li>
<li>Reconcile bank entries against receipts and payments.</li>
<li>Lock the month and export the P&amp;L, cash flow and ageing pack.</li>
</ol>`,
    /* ------------------------------------------------ 8. crm */
    crm: `
<h4>8.5 Pipeline stages</h4>
<p>Qualified → Site survey → Proposal → Negotiation → Won / Lost. Each card carries client, project type, carpet
area, estimated value, source and owner. Moving a card forward immediately updates the weighted pipeline shown on the
Command Centre.</p>

<h4>8.6 Lead to project in three clicks</h4>
<ol>
<li>Log the enquiry (source, site address, area, budget band) and schedule the site survey.</li>
<li>Build a quotation from a template: scope lines, rates, margin target and GST. Send as PDF and track revisions.</li>
<li>On win, convert — the project is created with the quotation scope as the starting BOQ and the client as the
billing party.</li>
</ol>

<h4>8.7 Quotation discipline</h4>
<p>Every revision is retained with a timestamp and the margin at that moment, so you can see exactly how much margin
you traded away during negotiation.</p>

<h4>8.8 Sources that are tracked</h4>
<p>Referral, architect / consultant, repeat client, broker, website, campaign, walk-in and cold outreach — each with
conversion numbers in the growth analytics tab, so you can stop paying for the sources that never close.</p>`,

    /* ------------------------------------------------ 9. hrm */
    hrm: `
<h4>9.5 Attendance &amp; shifts</h4>
<p>Geo-fenced check-in from the phone, biometric import, or a manual muster for site labour. Shifts, weekly offs,
holidays and overtime are configurable, and late marks or absent days feed payroll automatically.</p>

<h4>9.6 Leave</h4>
<p>Six leave types with balances (EL, SL, CL, comp-off, maternity, LOP). Requests route to the reporting manager;
approved leave updates attendance and payroll. The team calendar shows who is away and when.</p>

<h4>9.7 Payroll cycle</h4>
<ol>
<li>Lock attendance for the month.</li>
<li>Run payroll: gross from the CTC structure, deductions for PF (12%), ESI (0.75%), professional tax and TDS.</li>
<li>Review the register and adjust arrears or LOP.</li>
<li>Generate payslips (printable, per employee) and the NEFT bank file.</li>
<li>File the statutory challans and record the payment.</li>
</ol>

<h4>9.8 Recruitment, appraisals and training</h4>
<p>Job openings with a candidate funnel (applied → screened → interview → offer → hired) and one-click hire that
creates the employee record and login. Appraisal cycles carry ratings and increments; the training calendar tracks
enrolment and completion per department.</p>

<h4>9.9 Employee self-service</h4>
<p>Each employee sees their own attendance, leave balance, payslips, documents (offer letter, ID proof, policy
acknowledgements), appraisal history and timesheets. Managers see their team; HR sees everyone; nobody sees salaries
outside their scope.</p>`,

    /* ------------------------------------------------ 10. intelligence */
    intel: `
<h4>10.5 Copilot question patterns that work</h4>
<ul>
<li>“Which projects are bleeding margin?” — ranks by actual margin and names the driver.</li>
<li>“What is my cash position in the next 30 days?” — billed, collectable and payables due.</li>
<li>“Show DPR gaps for last week.” — projects where a site report is missing.</li>
<li>“Which vendors slip deliveries most?” — vendor scorecard sorted by delay days.</li>
<li>“Draft a snag closure mail to Amazon.” — built from the open snag list for that project.</li>
<li>“Who is on leave tomorrow?” — HR calendar across departments.</li>
</ul>

<h4>10.6 Background agents</h4>
<p>Six always-on agents watch the workspace: cost overrun, billing lag, snag ageing, low stock, schedule slippage and
statutory deadlines. Every finding lands in the risk register with an owner and severity, and surfaces in
Analytics → Exceptions.</p>

<h4>10.7 Analytics tabs</h4>
<p>Executive, Delivery, Commercial, People, Supply chain and Client. Every tab exports CSV and can be scheduled as an
MIS email or WhatsApp digest.</p>

<h4>10.8 How the answers are computed</h4>
<p>The copilot is grounded: it reads the same store the screens read — projects, BOQ, POs, GRNs, invoices, payroll,
attendance and snags — then aggregates before answering. That is why numbers in an answer always match the module
you click through to, and why “no data” is an honest answer instead of an invented one.</p>`,

    /* ------------------------------------------------ 11. admin */
    admin: `
<h4>11.5 Masters to load first</h4>
<table><thead><tr><th>Master</th><th>Why it matters</th></tr></thead><tbody>
<tr><td>Company &amp; units</td><td>Legal entity, GSTIN, state codes, logo — appears on every document</td></tr>
<tr><td>Clients</td><td>Billing party, GSTIN, contacts, credit terms</td></tr>
<tr><td>Vendors</td><td>Rate contracts, payment terms, category, scorecard history</td></tr>
<tr><td>Items &amp; trades</td><td>Units, HSN / SAC, standard rates, reorder levels</td></tr>
<tr><td>Employees &amp; roles</td><td>Approval authority, data scope, module access</td></tr>
<tr><td>Templates</td><td>BOQ, quotation, DPR, snag and checklist templates</td></tr>
</tbody></table>

<h4>11.6 Users, roles and scope</h4>
<p>Nineteen roles ship out of the box — owner, admin, project director, PM, site engineer, QS, procurement,
storekeeper, finance, HR, designer, sales, client, vendor and more. Each role has permission patterns per module plus a
data scope: own projects, own department or whole company. Client and vendor portals are read-mostly logins limited
to their own records.</p>

<h4>11.7 Integrations, API and audit</h4>
<p>Connect Tally Prime, Zoho Books, WhatsApp Business, Google Workspace, AutoCAD / Revit exports, Razorpay,
DigiLocker / eSign and Power BI. Scoped API keys with webhooks let your own systems push leads or GRNs and fetch
billing data. The audit log records who changed what, when, with before/after values — filterable by module and user.</p>

<h4>11.8 Plan, seats and data</h4>
<p>The subscription page shows plan, seats used, invoices and add-ons. Data &amp; backup gives a full JSON export, CSV
per module and a one-click reset of the demo dataset.</p>`,

    /* ------------------------------------------------ 12. roles */
    roles: `
<h4>12.5 A week in the life</h4>
<table><thead><tr><th>Role</th><th>Monday</th><th>Wednesday</th><th>Friday</th></tr></thead><tbody>
<tr><td>Founder</td><td>Command Centre + approvals above ₹25 L</td><td>Margin review on two critical projects</td><td>Cash and billing forecast</td></tr>
<tr><td>Project Manager</td><td>Schedule review, assign snags</td><td>Client walkthrough, DPR review</td><td>Certification pack to QS</td></tr>
<tr><td>Site Engineer</td><td>Submit DPR with photos</td><td>Raise snags and a material indent</td><td>Verify GRN, close snags</td></tr>
<tr><td>QS</td><td>Update executed quantities</td><td>Raise change orders</td><td>Milestone certification</td></tr>
<tr><td>Procurement</td><td>Clear indents, float RFQs</td><td>Compare rates, release POs</td><td>Chase deliveries, review vendors</td></tr>
<tr><td>Finance</td><td>Raise invoices, chase overdue</td><td>Three-way match vendor bills</td><td>Cash position, GST / TDS check</td></tr>
<tr><td>HR</td><td>Attendance exceptions</td><td>Interview panel, offers</td><td>Payroll inputs, leave approvals</td></tr>
</tbody></table>

<h4>12.6 Permission patterns</h4>
<p>View, create, edit, approve and delete — per module, per role, with amount ceilings on approvals. A site engineer
can raise an indent but not approve it; a PM approves up to ₹5 L; finance posts payments but cannot create projects.
Client users see only their own project's progress, snags and invoices.</p>

<h4>12.7 Switching persona in the demo</h4>
<p>From the sign-in screen pick Director, PM, Procurement, Finance, Site Engineer or HR Manager. Menus, approval
authority and data scope change with the persona, which is the fastest way to show a department what they will
actually see.</p>`,

    /* ------------------------------------------------ 13. install */
    install: `
<h4>13.5 Running the Windows build</h4>
<ol>
<li>Download <code>Managekaro-Setup-1.0.0.exe</code> from the Download page.</li>
<li>Double-click it. If SmartScreen appears, choose <b>More info → Run anyway</b> — the build is not code-signed.</li>
<li>The launcher unpacks the app to <code>%LOCALAPPDATA%\\Managekaro\\app-1.0.0</code>, starts a local server on
<code>127.0.0.1</code> and opens your default browser.</li>
<li>Keep the console window open while you work; closing it stops the local server. Data lives in that browser's local
storage.</li>
</ol>
<p>A 32-bit build (<code>Managekaro-Setup-1.0.0-x86.exe</code>) is published alongside for older machines. Compare the
SHA-256 shown on the download page against the published <code>.sha256</code> file before running.</p>

<h4>13.6 Deploying the web app</h4>
<p>The web app is a static bundle — no build step, no server runtime. On Vercel, import the repository and keep the
root as the output directory; the included <code>vercel.json</code> handles clean URLs (<code>/download</code>,
<code>/app</code>, <code>/login</code>, <code>/docs</code>), cache headers and security headers. Any static host works
the same way. Locally run <code>npm start</code> and open <code>http://localhost:5173</code>.</p>

<h4>13.7 Data, backup and reset</h4>
<p>The demo persists to browser local storage under <code>managekaro.db.v14</code>. Settings → Data &amp; backup exports
the whole dataset as JSON and can reset it to the deterministic seed. A production deployment swaps the store for an
API — module code reads through <code>MK.store</code>, so no screen logic changes.</p>

<h4>13.8 Publishing a new build</h4>
<p>Run <code>node tools/desktop/build.js</code> to compile the launcher, embed the current web assets and write the
installer plus its SHA-256 file into <code>downloads/</code>. Run <code>node tools/smoke.js</code> first: it boots the app
headlessly, walks all 48 routes and fails on any missing asset or runtime error.</p>`,

    /* ------------------------------------------------ 14. glossary */
    glossary: `
<h4>14.4 Acronyms used across the app</h4>
<table><thead><tr><th>Term</th><th>Meaning</th></tr></thead><tbody>
<tr><td>BOQ / WBS</td><td>Bill of quantities / work breakdown structure</td></tr>
<tr><td>GFC</td><td>Good for construction — drawing cleared for site use</td></tr>
<tr><td>GRN</td><td>Goods receipt note, the store's proof of delivery</td></tr>
<tr><td>DPR</td><td>Daily progress report from site</td></tr>
<tr><td>RFI / NCR</td><td>Request for information / non-conformance report</td></tr>
<tr><td>CO</td><td>Change order — approved scope or rate variation</td></tr>
<tr><td>3-way match</td><td>PO ↔ GRN ↔ vendor invoice reconciliation before payment</td></tr>
<tr><td>Retention</td><td>Percentage withheld until the defect-liability period ends</td></tr>
<tr><td>TDS / GST</td><td>Tax deducted at source / goods and services tax</td></tr>
<tr><td>LOP</td><td>Loss of pay day in payroll</td></tr>
<tr><td>CTC</td><td>Cost to company — annual package including employer contributions</td></tr>
<tr><td>DSO</td><td>Days sales outstanding — average time to collect a receivable</td></tr>
</tbody></table>

<h4>14.5 Where to get help</h4>
<p>In-app: <b>Help &amp; Manual</b> (this page) and the AI Copilot for data questions. Human support:
<b>help@managekaro.com</b>, +91 124 480 9100, four working hours response. Enterprise customers get a named CSM and a
shared channel inside the workspace.</p>`
  };
})(window.MK);
