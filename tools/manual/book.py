#!/usr/bin/env python3
"""
Managekaro — printable user book (PDF).

Pulls the chapter text from assets/js/modules/manual.js and help.js, pairs it with the
rendered screenshots, and writes downloads/Managekaro-User-Book-1.0.pdf A4 portrait.
Run after tools/manual/render.py.
"""
import json, os, re, textwrap
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Unicode-capable fonts (the platform lacks Helvetica glyphs for ₹, ⌘, → and ×)
_FD = '/usr/share/fonts/truetype/dejavu'
pdfmetrics.registerFont(TTFont('DK', _FD + '/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DKB', _FD + '/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DKM', _FD + '/DejaVuSansMono.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DK', normal='DK', bold='DKB', italic='DK', boldItalic='DKB')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'downloads', 'Managekaro-User-Book-1.0.pdf')
SHOTS = os.path.join(ROOT, 'assets', 'img', 'shots')
INK = colors.HexColor('#0B1220')
BRAND = colors.HexColor('#F2540B')
TX = colors.HexColor('#1F2737')
TX2 = colors.HexColor('#4C566B')
TX3 = colors.HexColor('#8B94A7')
LINE = colors.HexColor('#E4E7EF')
BG = colors.HexColor('#F7F8FC')

ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Heading1'], fontName='DKB', fontSize=25, leading=29,
                    textColor=INK, spaceAfter=6)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontName='DKB', fontSize=16.5, leading=20,
                    textColor=INK, spaceBefore=14, spaceAfter=6)
H3 = ParagraphStyle('H3', parent=ss['Heading3'], fontName='DKB', fontSize=12, leading=15,
                    textColor=INK, spaceBefore=11, spaceAfter=4)
H4 = ParagraphStyle('H4', parent=H3, fontSize=11, textColor=colors.HexColor('#9A3A0A'), spaceBefore=12)
P = ParagraphStyle('P', parent=ss['BodyText'], fontName='DK', fontSize=9.6, leading=14.6,
                   textColor=TX, alignment=TA_LEFT, spaceAfter=5)
LI = ParagraphStyle('LI', parent=P, leftIndent=12, bulletIndent=0, spaceAfter=2.5,
                    bulletFontName='DK', bulletFontSize=8.2, bulletColor=colors.HexColor('#8B94A7'))
LI2 = LI
SM = ParagraphStyle('SM', parent=P, fontSize=8.4, leading=12, textColor=TX2)
CAP = ParagraphStyle('CAP', parent=SM, fontSize=8, textColor=TX3, spaceBefore=3)
MONO = ParagraphStyle('MONO', parent=P, fontName='DKM', fontSize=8.6)


# ------------------------------------------------------------------ content ---
def read_js(path):
    return open(os.path.join(ROOT, path), encoding='utf-8').read()


def parse_js_object(src, start_marker):
    """Crude but reliable reader for `id: ` ... `` template blocks."""
    out = {}
    i = src.index(start_marker)
    body = src[i:]
    for m in re.finditer(r"^\s{4}(\w+): `(.*?)`,\s*$", body, re.S | re.M):
        out[m.group(1)] = m.group(2)
    return out


def chapters():
    """Chapter titles + short topics from help.js, long sections from manual.js."""
    h = read_js('assets/js/modules/help.js')
    chs = []
    for m in re.finditer(r"\{ id: '(\w+)', title: '([^']+)', items: \[(.*?)\n    \] \}", h, re.S):
        cid, title, block = m.group(1), m.group(2), m.group(3)
        items = re.findall(r"\['((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\]", block)
        items = [(a.replace("\\'", "'"), b.replace("\\'", "'")) for a, b in items]
        chs.append({'id': cid, 'title': unesc(title), 'items': items})
    return chs


def unesc(s):
    return (s.replace('\\u2014', '—').replace('\\u2019', '’')
             .replace("\\'", "'").replace('\\&', '&'))


def html_to_flow(raw, story):
    """Convert the small HTML subset used in manual.js into reportlab flowables."""
    raw = unesc(raw)
    # split into blocks
    tokens = re.split(r'(<h4>.*?</h4>|<ul>.*?</ul>|<ol>.*?</ol>|<table>.*?</table>|<p>.*?</p>)', raw, flags=re.S)
    for t in tokens:
        t = t.strip()
        if not t:
            continue
        if t.startswith('<h4>'):
            story.append(Paragraph(inline(re.sub('<[^>]+>', '', t)), H4))
        elif t.startswith('<p>'):
            story.append(Paragraph(inline(re.sub('<[^>]+>', '', t)), P))
        elif t.startswith('<ul>') or t.startswith('<ol>'):
            ordered = t.startswith('<ol>')
            items = re.findall(r'<li>(.*?)</li>', t, re.S)
            for n, it in enumerate(items, 1):
                bullet = ('%d.' % n) if ordered else '\u2022'
                story.append(Paragraph(inline(re.sub('<[^>]+>', '', it)), LI, bulletText=bullet))
            story.append(Spacer(1, 4))
        elif t.startswith('<table>'):
            head = re.findall(r'<th>(.*?)</th>', t, re.S)
            rows = []
            for tr in re.findall(r'<tr>(.*?)</tr>', t, re.S):
                cells = re.findall(r'<t[dh]>(.*?)</t[dh]>', tr, re.S)
                if cells and not (head and cells == head):
                    rows.append([Paragraph(inline(re.sub('<[^>]+>', '', c)), SM) for c in cells])
            if not head or not rows:
                continue
            data = [[Paragraph('<b>%s</b>' % inline(re.sub('<[^>]+>', '', c)), SM)
                     for c in head]] + rows
            ncol = len(data[0])
            total = 168.0
            if ncol == 2:
                frac = [0.30, 0.70]
            elif ncol == 3:
                frac = [0.22, 0.46, 0.32]
            elif ncol == 4:
                frac = [0.22, 0.42, 0.18, 0.18]
            else:
                frac = [1.0 / ncol] * ncol
            widths = [total * f * mm for f in frac]
            tbl = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
            tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), BG),
                ('TEXTCOLOR', (0, 0), (-1, 0), INK),
                ('GRID', (0, 0), (-1, -1), 0.4, LINE),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FBFCFE')]),
            ]))
            story.append(Spacer(1, 3))
            story.append(tbl)
            story.append(Spacer(1, 7))


def renumber(raw, chapter_no, base_items):
    """Extras carry their own x.y numbers; rewrite them to continue the chapter's sequence."""
    counter = [base_items]

    def repl(m):
        counter[0] += 1
        return '<h4>%d.%d %s</h4>' % (chapter_no, counter[0], m.group(3))

    return re.sub(r'<h4>(\d+)\.(\d+)\s+([^<]*)</h4>', repl, raw)


def inline(s):
    s = (s.replace('&amp;', '\x00').replace('&lt;', '<').replace('&gt;', '>')
          .replace('&quot;', '"').replace('&#39;', "'"))
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.+?)`', r'<font face="DKM" color="#9A3A0A">\1</font>', s)
    return s.replace('\x00', '&amp;')


FIGURES = {
    1: [('01-command-centre', 'Figure 1.1 — Command Centre: contract value, billing, receivables and margin for the whole portfolio.'),
        ('15-mobile-dpr', 'Figure 1.2 — The same workspace on a site engineer’s phone: DPR, snags and geo-tagged attendance.')],
    2: [('01-command-centre', 'Figure 2.1 — Portfolio health, today’s work and the approvals waiting on you.')],
    3: [('02-projects', 'Figure 3.1 — Projects list with health, progress and contract value at a glance.'),
        ('03-project-boq', 'Figure 3.2 — Project detail → BOQ & scope, with change orders underneath.')],
    4: [('04-gantt', 'Figure 4.1 — Schedule & Gantt with baseline, S-curve, slipping activities and milestones.')],
    5: [('11-analytics', 'Figure 5.1 — Cross-module analytics: every drawing, DPR and cost line can be sliced here.')],
    6: [('05-procurement', 'Figure 6.1 — Procurement: POs, three-way match, vendor scorecard and commitment vs budget.')],
    7: [('06-finance', 'Figure 7.1 — Finance & billing: ageing, cost vs budget, cash position and recent invoices.')],
    8: [('07-crm', 'Figure 8.1 — CRM pipeline with deal cards per stage, quotation summary and conversion funnel.')],
    9: [('08-hrm', 'Figure 9.1 — HRM dashboard: headcount split, employee directory, attendance and leave.'),
        ('09-payroll', 'Figure 9.2 — Payroll: printable payslip, attendance input, statutory compliance and pay register.')],
    10: [('10-copilot', 'Figure 10.1 — AI Copilot answering from live BOQ, PO, invoice and payroll data with a recommended action plan.')],
    11: [('12-settings', 'Figure 11.1 — Settings: approvals matrix, integrations and data controls.')],
    12: [('12-settings', 'Figure 12.1 — The approvals matrix is where roles become real: who signs what, above which value.')],
    13: [('14-download', 'Figure 13.1 — The download page and the single-file Windows build it distributes.'),
         ('13-user-manual', 'Figure 13.2 — This manual rendered in the browser, printable to PDF in one click.')],
    14: [],
}


def cover(story, meta):
    story.append(Spacer(1, 40 * mm))
    story.append(Paragraph('<font color="#F2540B" size="10"><b>MANAGEKARO  ·  ERP · HRM · PROJECTS</b></font>', P))
    story.append(Spacer(1, 6))
    story.append(Paragraph('The Managekaro<br/>User Book', ParagraphStyle(
        'cov', parent=H1, fontName='DKB', fontSize=36, leading=42)))
    story.append(Spacer(1, 8))
    story.append(Paragraph('Every module, every department, every workflow — for interior fit-out and construction companies.',
                           ParagraphStyle('covsub', parent=P, fontSize=12.5, leading=19, textColor=TX2)))
    story.append(Spacer(1, 16))
    img = os.path.join(SHOTS, '01-command-centre.png')
    story.append(Image(img, width=170 * mm, height=170 * mm * 900 / 1440))
    story.append(Spacer(1, 10))
    story.append(Paragraph('Version 1.0 · %s · %d chapters · %d topics' % (
        meta['date'], meta['chapters'], meta['topics']), ParagraphStyle('meta', parent=SM, fontSize=9)))
    story.append(PageBreak())


def toc(story, chs):
    story.append(Paragraph('Contents', H1))
    story.append(Paragraph('Read chapters 1–3 for setup and project control, 4–7 for execution and commercials, '
                           '8–9 for growth and people, 10 for intelligence, and 11–14 for administration, roles and deployment.',
                           P))
    story.append(Spacer(1, 8))
    rows = []
    for i, c in enumerate(chs, 1):
        rows.append([Paragraph('<b>%02d</b>' % i, SM), Paragraph('<b>%s</b>' % inline(c['title']), SM),
                     Paragraph('%d topics' % len(c['items']), SM)])
    t = Table(rows, colWidths=[14 * mm, 126 * mm, 20 * mm], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t)
    story.append(PageBreak())


def build():
    data = json.load(open(os.path.join(ROOT, 'tools', 'manual', 'data.json'), encoding='utf-8'))
    chs = chapters()
    extras = parse_js_object(read_js('assets/js/modules/manual.js'), 'MK.MANUAL_EXTRA = {')

    story = []
    cover(story, {'date': '2 November 2026', 'chapters': len(chs),
                  'topics': sum(len(c['items']) for c in chs)})
    toc(story, chs)

    def fig_flow(fname, cap):
        path = os.path.join(SHOTS, fname + '.png')
        if not os.path.exists(path):
            return None
        from PIL import Image as PILImage
        with PILImage.open(path) as im:
            w, h = im.size
        tw = 168 * mm
        th = tw * h / w
        if th > 96 * mm:
            th = 96 * mm
            tw = th * w / h
        return KeepTogether([Image(path, width=tw, height=th), Paragraph(cap, CAP)])

    for n, c in enumerate(chs, 1):
        story.append(Paragraph('%02d' % n, ParagraphStyle('num', parent=H2, textColor=BRAND, fontSize=10, spaceAfter=0)))
        story.append(Paragraph(inline(c['title']), H1))
        first = c['items'][0][1] if c['items'] else ''
        story.append(Paragraph(inline(first), ParagraphStyle('lede', parent=P, fontSize=10.6, leading=16, textColor=TX2)))
        story.append(Spacer(1, 6))

        figs = FIGURES.get(n, [])
        # first figure sits with the intro so pages do not end up half empty
        if figs:
            f = fig_flow(*figs[0])
            if f:
                story.append(Spacer(1, 4))
                story.append(f)
                figs = figs[1:]

        for title, body in c['items'][1:]:
            story.append(Paragraph(inline(title), H3))
            story.append(Paragraph(inline(body), P))

        if extras.get(c['id']):
            html_to_flow(renumber(extras[c['id']], n, len(c['items'])), story)

        for fname, cap in figs:
            f = fig_flow(fname, cap)
            if f:
                story.append(Spacer(1, 6))
                story.append(f)
        story.append(PageBreak())

    # feature book appendix
    story.append(Paragraph('Appendix A', ParagraphStyle('num', parent=H2, textColor=BRAND, fontSize=10, spaceAfter=0)))
    story.append(Paragraph('Feature book — everything included', H1))
    story.append(Paragraph('One workspace covering the full operating model of a fit-out and construction company.', P))
    story.append(Spacer(1, 6))
    areas = json.load(open(os.path.join(ROOT, 'tools', 'manual', 'features.json'), encoding='utf-8'))
    for a, desc, items in areas:
        story.append(Paragraph(inline(a), H3))
        story.append(Paragraph(inline(desc), SM))
        for it in items:
            story.append(Paragraph('<font color="#8B94A7">\u2022</font>&nbsp;' + inline(it), LI2))
        story.append(Spacer(1, 3))

    story.append(PageBreak())
    story.append(Paragraph('Appendix B', ParagraphStyle('num', parent=H2, textColor=BRAND, fontSize=10, spaceAfter=0)))
    story.append(Paragraph('Company profile used in the demo', ParagraphStyle('h1b', parent=H1, fontSize=21, leading=25)))
    m = data['metrics']
    rows = [
        ('Projects', '%d total · %d live · %d completed' % (m['totalProjects'], m['live'], m['completed'])),
        ('Contract value', '₹{:,.0f} Cr'.format(m['cv'] / 1e7)),
        ('Billed / collected', '₹{:,.0f} Cr / ₹{:,.0f} Cr'.format(m['billed'] / 1e7, m['received'] / 1e7)),
        ('Gross margin', '%.1f%% (actual %.1f%%)' % (m['grossMargin'], m['actualMargin'])),
        ('Headcount', '%d employees · %d on notice' % (m['headcount'], m['onNotice'])),
        ('Snags', '%d open · %d critical' % (m['openSnags'], m['criticalSnags'])),
        ('Pipeline', '₹{:,.2f} Cr · won ₹{:,.2f} Cr'.format(m['pipeline'] / 1e7, m['wonValue'] / 1e7)),
    ]
    t = Table([[Paragraph('<b>%s</b>' % a, SM), Paragraph(inline(b), SM)] for a, b in rows],
              colWidths=[46 * mm, 114 * mm], hAlign='LEFT')
    t.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE),
                           ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0)]))
    story.append(t)
    story.append(Spacer(1, 14))
    story.append(Paragraph('Support', H3))
    story.append(Paragraph('Email <b>help@managekaro.com</b> · phone <b>+91 124 480 9100</b> · four working hours response. '
                           'Enterprise customers get a named CSM and a shared support channel inside the workspace.', P))

    doc = BaseDocTemplate(OUT, pagesize=A4, title='Managekaro — User Book', author='Managekaro',
                          subject='User manual and feature book', leftMargin=20 * mm, rightMargin=20 * mm,
                          topMargin=20 * mm, bottomMargin=18 * mm)

    def deco(canv, doc_):
        canv.saveState()
        if doc_.page > 1:
            canv.setFillColor(INK)
            canv.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, stroke=0, fill=1)
            canv.setFillColor(colors.white)
            canv.setFont('DKB', 7.6)
            canv.drawString(20 * mm, A4[1] - 8 * mm, 'MANAGEKARO  ·  USER BOOK')
            canv.setFillColor(colors.HexColor('#9AA5BC'))
            canv.setFont('DK', 7.6)
            canv.drawRightString(A4[0] - 20 * mm, A4[1] - 8 * mm, 'Version 1.0')
            canv.setStrokeColor(LINE)
            canv.line(20 * mm, 13 * mm, A4[0] - 20 * mm, 13 * mm)
            canv.setFillColor(TX3)
            canv.setFont('DK', 7.6)
            canv.drawString(20 * mm, 9 * mm, 'managekaro.com  ·  ERP · HRM · PROJECTS')
            canv.drawRightString(A4[0] - 20 * mm, 9 * mm, 'Page %d' % doc_.page)
        canv.restoreState()

    frame = Frame(20 * mm, 16 * mm, A4[0] - 40 * mm, A4[1] - 40 * mm, id='main',
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='main', frames=[frame], onPage=deco)])
    doc.build(story)
    print('wrote', os.path.relpath(OUT, ROOT), '%.0f KB' % (os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    build()
