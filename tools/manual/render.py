#!/usr/bin/env python3
"""
Managekaro — manual screenshot renderer.

The build environment has no browser (Chromium unavailable, Playwright CDN blocked),
so product screenshots are rendered pixel-accurately with Pillow from live seeded
data extracted out of the running app (tools/manual/data.json). Output:

    assets/img/shots/*.png      in-app manual figures
    docs/shots/*.png            user-book figures
"""
import json, math, os, shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = json.load(open(os.path.join(ROOT, 'tools', 'manual', 'data.json'), encoding='utf-8'))
SHOTS = os.path.join(ROOT, 'assets', 'img', 'shots')
DOCSHOTS = os.path.join(ROOT, 'docs', 'shots')
os.makedirs(SHOTS, exist_ok=True)
os.makedirs(DOCSHOTS, exist_ok=True)

F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FM = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
_fc = {}


def font(size, bold=False, mono=False):
    key = (size, bold, mono)
    if key not in _fc:
        _fc[key] = ImageFont.truetype(FM if mono else (FB if bold else F), size)
    return _fc[key]


INK = '#0B1220'
BRAND = '#F2540B'
BRAND2 = '#FF8A3D'
C = dict(
    bg='#F5F6FA', card='#FFFFFF', line='#E5E8F0', line2='#EEF0F6',
    tx='#0B1220', tx2='#59647A', tx3='#8B94A7', side='#0B1220', side2='#151E33',
    ok='#0E9F6E', okbg='#E7F7F0', warn='#D97706', warnbg='#FEF3E2',
    bad='#DC2626', badbg='#FDECEC', blue='#2563EB', bluebg='#EAF0FE',
    purple='#7C3AED', purplebg='#F1EBFE', teal='#0D9488', grey='#6B7280',
)
PALETTE = ['#F2540B', '#2563EB', '#0E9F6E', '#7C3AED', '#0D9488', '#D97706', '#DB2777', '#4B5563']

NAV = [
    ('Overview', [('grid', 'Command Centre'), ('check', 'My Work'), ('inbox', 'Approvals')]),
    ('Delivery', [('layers', 'Projects'), ('calendar', 'Schedule & Gantt'), ('clip', 'Daily Progress'),
                  ('alert', 'Snags'), ('help', 'RFIs'), ('folder', 'Documents')]),
    ('Supply', [('cart', 'Procurement'), ('box', 'Stores & Inventory')]),
    ('Money', [('card', 'Finance & Billing'), ('chart', 'Costing & Budget')]),
    ('Growth', [('users', 'CRM & Leads'), ('doc', 'Quotations')]),
    ('People', [('user', 'HRM'), ('clock', 'Attendance'), ('calendar', 'Leave'),
                ('wallet', 'Payroll'), ('target', 'Recruitment'), ('star', 'Performance')]),
    ('Intelligence', [('spark', 'Analytics'), ('bot', 'AI Copilot'), ('plug', 'Agents')]),
    ('Admin', [('package', 'Assets'), ('shield', 'Compliance'), ('list', 'Masters'),
               ('lock', 'Users & Roles'), ('plug', 'Integrations'), ('settings', 'Settings'),
               ('card', 'Plan & Billing'), ('book', 'Help & Manual')]),
]

M = DATA['metrics']


# ---------------------------------------------------------------- numbers ----
def inr(n, compact=True):
    n = float(n or 0)
    if not compact:
        return '₹' + f'{n:,.0f}'
    a = abs(n)
    if a >= 1e7:
        return f'₹{n / 1e7:,.2f} Cr'
    if a >= 1e5:
        return f'₹{n / 1e5:,.2f} L'
    return '₹' + f'{n:,.0f}'


def inr_full(n):
    return ('-' if n < 0 else '') + '₹' + f'{abs(n):,.0f}'


# ---------------------------------------------------------------- drawing ----
def rr(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def text(d, xy, s, size=12, color=C['tx'], bold=False, anchor='la', mono=False):
    d.text(xy, s, font=font(size, bold, mono), fill=color, anchor=anchor)
    return d.textlength(s, font=font(size, bold, mono))


def wrap(d, s, size, width, bold=False):
    words, lines, cur = s.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font(size, bold)) <= width:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def trunc(d, s, size, width, bold=False):
    f = font(size, bold)
    if d.textlength(s, font=f) <= width:
        return s
    while s and d.textlength(s + '…', font=f) > width:
        s = s[:-1]
    return s + '…'


def chip(d, x, y, label, tone='grey', size=10):
    pad, h = 8, 21
    w = d.textlength(label, font=font(size, True)) + pad * 2
    fills = {'ok': (C['okbg'], C['ok']), 'warn': (C['warnbg'], C['warn']), 'bad': (C['badbg'], C['bad']),
             'blue': (C['bluebg'], C['blue']), 'grey': ('#F1F3F8', C['grey']), 'brand': ('#FFF0E8', BRAND),
             'purple': (C['purplebg'], C['purple'])}
    bg, fg = fills.get(tone, fills['grey'])
    rr(d, (x, y, x + w, y + h), 11, fill=bg)
    text(d, (x + pad, y + h / 2 + 1), label, size, fg, True, 'lm')
    return w


def tone_for(v):
    v = (v or '').lower()
    if v in ('on track', 'active', 'approved', 'paid', 'closed', 'done', 'won', 'completed'):
        return 'ok'
    if v in ('at risk', 'pending', 'in review', 'planning', 'on hold', 'to do', 'draft'):
        return 'warn'
    if v in ('critical', 'overdue', 'rejected', 'lost', 'delayed', 'expired'):
        return 'bad'
    if v in ('in progress', 'live', 'sent'):
        return 'blue'
    return 'grey'


# ---------------------------------------------------------------- chrome -----
def chrome(title, crumb, active, w=1440, h=900):
    img = Image.new('RGB', (w, h), C['bg'])
    d = ImageDraw.Draw(img)
    SB = 232
    d.rectangle((0, 0, SB, h), fill=C['side'])
    # brand
    d.rounded_rectangle((16, 18, 42, 44), 7, fill=BRAND)
    text(d, (29, 31), 'M', 16, '#fff', True, 'mm')
    text(d, (52, 24), 'managekaro', 15, '#fff', True)
    text(d, (52, 42), 'ERP · HRM · PROJECTS', 7.5, '#7C86A0', True)
    # org switcher
    rr(d, (12, 62, SB - 12, 100), 10, fill=C['side2'])
    rr(d, (22, 71, 44, 93), 11, fill='#2A3550')
    text(d, (33, 82), 'MS', 10, '#fff', True, 'mm')
    text(d, (52, 72), 'Managekaro Spaces', 11, '#fff', True)
    text(d, (52, 87), 'Enterprise · 4 units', 9, '#7C86A0')
    # nav — the sidebar scrolls; offset it so the active module is always in view
    items = []
    for group, its in NAV:
        items.append(('group', group))
        for icon, label in its:
            items.append(('item', label))
    ROW, GH, PAD = 25, 19, 4
    avail_top, avail_bot = 112, h - 80
    total = sum(GH + PAD if k == 'group' else ROW for k, _ in items)
    active_i = [i for i, (k, v) in enumerate(items) if k == 'item' and v == active]
    off = 0
    if total > avail_bot - avail_top and active_i:
        acc = 0
        for i, (k, _) in enumerate(items):
            if i == active_i[0]:
                break
            acc += GH + PAD if k == 'group' else ROW
        off = max(0, min(acc - (avail_bot - avail_top) * 0.55, total - (avail_bot - avail_top)))
    y = avail_top - off
    for kind, val in items:
        if kind == 'group':
            if avail_top - GH < y < avail_bot:
                text(d, (22, y + 6), val.upper(), 8.5, '#5D6884', True)
            y += GH + PAD
            continue
        ison = val == active
        if y >= avail_top - ROW and y <= avail_bot:
            if ison:
                rr(d, (10, y - 3, SB - 10, y + 21), 8, fill='#2A1A12')
            col = '#FFB68C' if ison else '#AEB7CB'
            d.rounded_rectangle((22, y + 3, 30, y + 11), 2, fill=col)
            text(d, (40, y + 7), trunc(d, val, 11, SB - 76), 11, col, ison, 'lm')
            if ison:
                d.rectangle((10, y - 1, 12, y + 19), fill=BRAND)
        y += ROW
    # sidebar footer
    d.rectangle((0, h - 74, SB, h), fill=C['side'])
    d.line((12, h - 66, SB - 12, h - 66), fill='#1C2540')
    rr(d, (20, h - 56, 42, h - 34), 11, fill=BRAND)
    text(d, (31, h - 45), 'AK', 9.5, '#fff', True, 'mm')
    text(d, (50, h - 56), DATA['org']['user'], 11, '#fff', True)
    text(d, (50, h - 40), DATA['org']['role'], 9, '#7C86A0')
    # topbar
    TB = 58
    d.rectangle((SB, 0, w, TB), fill='#fff')
    d.line((SB, TB, w, TB), fill=C['line'])
    text(d, (SB + 20, TB / 2), 'Managekaro', 10.5, C['tx3'], False, 'lm')
    cx = SB + 20 + d.textlength('Managekaro', font=font(10.5)) + 10
    for part in crumb:
        text(d, (cx, TB / 2), '›', 12, C['tx3'], False, 'lm')
        cx += 14
        text(d, (cx, TB / 2), part, 10.5, C['tx'], True, 'lm')
        cx += d.textlength(part, font=font(10.5, True)) + 8
    # search pill
    sw = 240
    sx = w - 20 - sw - 118
    rr(d, (sx, 14, sx + sw, TB - 14), 9, fill='#F4F5F9', outline=C['line'])
    d.ellipse((sx + 11, 22, sx + 20, 31), outline=C['tx3'], width=1)
    text(d, (sx + 28, TB / 2), 'Search anything…', 10.5, C['tx3'], False, 'lm')
    rr(d, (sx + sw - 34, 22, sx + sw - 10, TB - 22), 5, fill='#fff', outline=C['line'])
    text(d, (sx + sw - 22, TB / 2), '⌘K', 8.5, C['tx3'], False, 'mm')
    # action icons
    ix = sx + sw + 16
    for _ in range(2):
        rr(d, (ix, 14, ix + 30, TB - 14), 9, fill='#fff', outline=C['line'])
        d.ellipse((ix + 11, 26, ix + 19, 34), outline=C['tx2'], width=1)
        ix += 38
    d.ellipse((ix, 14, ix + 30, TB - 14), fill=BRAND)
    text(d, (ix + 15, TB / 2), 'AK', 10, '#fff', True, 'mm')
    return img, d, SB, TB


def page_head(d, x, y, title, sub, actions=('Export', 'New')):
    limit = 1400 - x - 40 - sum(d.textlength(a, font=font(11, True)) + 46 for a in actions)
    text(d, (x, y), trunc(d, title, 22, limit), 22, C['tx'], True)
    text(d, (x, y + 28), trunc(d, sub, 11.5, limit + 160), 11.5, C['tx2'])
    ax = 1400
    for i, a in enumerate(reversed(actions)):
        w = d.textlength(a, font=font(11, True)) + 30
        ax -= w
        if a.startswith('+') or a in ('New', 'New project', 'Create', 'Run payroll', 'New lead', 'New PO'):
            rr(d, (ax, y + 2, ax + w, y + 34), 8, fill=BRAND)
            text(d, (ax + w / 2, y + 18), a, 11, '#fff', True, 'mm')
        else:
            rr(d, (ax, y + 2, ax + w, y + 34), 8, fill='#fff', outline=C['line'])
            text(d, (ax + w / 2, y + 18), a, 11, C['tx2'], True, 'mm')
        ax -= 8


def card(d, x, y, w, h, title=None, sub=None, actions=None):
    rr(d, (x, y, x + w, y + h), 12, fill=C['card'], outline=C['line'])
    cy = y
    if title:
        text(d, (x + 18, y + 18), title, 12.5, C['tx'], True)
        if sub:
            text(d, (x + 18, y + 37), sub, 10, C['tx3'])
        if actions:
            ax = x + w - 18
            for a in reversed(actions):
                tw = d.textlength(a, font=font(10.5, True)) + 22
                ax -= tw
                rr(d, (ax, y + 12, ax + tw, y + 36), 7, fill='#fff', outline=C['line'])
                text(d, (ax + tw / 2, y + 24), a, 10.5, C['tx2'], True, 'mm')
                ax -= 6
        cy = y + 50
        d.line((x, cy, x + w, cy), fill=C['line2'])
    return cy


def kpi(d, x, y, w, h, label, value, delta, tone='ok', spark=None):
    rr(d, (x, y, x + w, y + h), 12, fill=C['card'], outline=C['line'])
    text(d, (x + 16, y + 14), label.upper(), 8.8, C['tx3'], True)
    big = h >= 92
    text(d, (x + 16, y + (36 if big else 28)), value, 21 if big else 19, C['tx'], True)
    if delta:
        chip(d, x + 16, y + h - (30 if big else 27), delta, tone, 9.5)
    if spark:
        pw, ph = w - 100, 34
        px, py = x + w - pw - 14, y + h - ph - 20
        mx, mn = max(spark), min(spark)
        pts = [(px + i * pw / (len(spark) - 1), py + ph - ((v - mn) / ((mx - mn) or 1)) * ph) for i, v in enumerate(spark)]
        for i in range(len(pts) - 1):
            d.line((pts[i], pts[i + 1]), fill=BRAND, width=2)


def table(d, x, y, w, cols, rows, rowh=40, head=True, zebra=True, hover=None):
    """cols: list of (label, frac, align)"""
    if head:
        d.rectangle((x, y, x + w, y + 34), fill='#FAFBFD')
        d.line((x, y + 34, x + w, y + 34), fill=C['line'])
        cx = x
        for label, frac, align in cols:
            tw = w * frac
            tx = cx + 14 if align == 'l' else (cx + tw - 14)
            text(d, (tx, y + 17), label.upper(), 8.6, C['tx3'], True, 'lm' if align == 'l' else 'rm')
            cx += tw
        y += 34
    for i, row in enumerate(rows):
        if zebra and i % 2:
            d.rectangle((x, y, x + w, y + rowh), fill='#FCFCFE')
        if hover == i:
            d.rectangle((x, y, x + w, y + rowh), fill='#FFF7F2')
        cx = x
        for j, (label, frac, align) in enumerate(cols):
            tw = w * frac
            cell = row[j] if j < len(row) else ''
            # rows may pass ('chip', v) or (('chip', v), (start, frac, align)) — unwrap
            if isinstance(cell, tuple) and len(cell) == 2 and isinstance(cell[0], tuple):
                cell = cell[0]
            if isinstance(cell, tuple):
                kind, val = cell
                if kind == 'chip':
                    cw = d.textlength(val, font=font(9.6, True)) + 16
                    bx = cx + 14 if align == 'l' else cx + tw - 14 - cw
                    chip(d, bx, y + (rowh - 21) / 2, val, tone_for(val), 9.6)
                elif kind == 'prog':
                    pw = min(120, tw - 60)
                    bx = cx + 14
                    rr(d, (bx, y + rowh / 2 - 3, bx + pw, y + rowh / 2 + 3), 3, fill='#EEF0F6')
                    rr(d, (bx, y + rowh / 2 - 3, bx + max(4, pw * val / 100), y + rowh / 2 + 3), 3,
                       fill=C['ok'] if val >= 70 else (BRAND if val >= 40 else C['bad']))
                    text(d, (bx + pw + 8, y + rowh / 2), f'{val}%', 9.5, C['tx2'], True, 'lm')
                elif kind == 'money':
                    text(d, (cx + tw - 14, y + rowh / 2), val, 10.5, C['tx'], True, 'rm')
                elif kind == 'mono':
                    text(d, (cx + 14, y + rowh / 2), val, 9.5, C['tx2'], True, 'lm', mono=True)
                elif kind == 'av':
                    d.ellipse((cx + 14, y + rowh / 2 - 10, cx + 34, y + rowh / 2 + 10), fill='#EAF0FE')
                    text(d, (cx + 24, y + rowh / 2), val[:2].upper(), 8, C['blue'], True, 'mm')
                    text(d, (cx + 42, y + rowh / 2), '', 10, C['tx'], False, 'lm')
                elif kind == '2line':
                    text(d, (cx + 14, y + rowh / 2 - 8), trunc(d, val[0], 10.5, tw - 30), 10.5, C['tx'], True, 'lm')
                    text(d, (cx + 14, y + rowh / 2 + 7), trunc(d, val[1], 9, tw - 30), 9, C['tx3'], False, 'lm')
            else:
                f = font(10.5)
                s = trunc(d, str(cell), 10.5, tw - 28)
                if align == 'l':
                    text(d, (cx + 14, y + rowh / 2), s, 10.5, C['tx'], False, 'lm')
                elif align == 'r':
                    text(d, (cx + tw - 14, y + rowh / 2), s, 10.5, C['tx'], False, 'rm')
                else:
                    text(d, (cx + tw / 2, y + rowh / 2), s, 10.5, C['tx'], False, 'mm')
            cx += tw
        d.line((x, y + rowh, x + w, y + rowh), fill=C['line2'])
        y += rowh
    return y


def bars(d, x, y, w, h, values, labels, color=BRAND, secondary=None):
    n = len(values)
    mx = max(values + (secondary or [])) or 1
    slot = w / n
    bw = min(34, slot * 0.44)
    for i, v in enumerate(values):
        cx = x + slot * i + slot / 2
        bh = (v / mx) * h
        rr(d, (cx - bw / 2, y + h - bh, cx + bw / 2, y + h), 4, fill=color)
        if secondary:
            v2 = secondary[i]
            bh2 = (v2 / mx) * h
            rr(d, (cx - bw / 2 - bw - 3, y + h - bh2, cx - bw / 2 - 3, y + h), 4, fill='#C7D2E5')
        text(d, (cx, y + h + 16), labels[i], 9.5, C['tx3'], False, 'mm')


def donut(d, cx, cy, r, parts):
    """parts: list of (label, value, color)"""
    total = sum(p[1] for p in parts) or 1
    box = (cx - r, cy - r, cx + r, cy + r)
    a = -90
    for label, v, col in parts:
        ext = 360 * v / total
        d.arc(box, a, a + ext, fill=col, width=int(r * 0.34))
        a += ext
    return total


def gantt(d, x, y, w, rows, days=90, cols_labels=('Task',)):
    lw = 190
    d.rectangle((x, y, x + w, y + 30), fill='#FAFBFD')
    d.line((x, y + 30, x + w, y + 30), fill=C['line'])
    gw = w - lw
    for i in range(0, days + 1, 15):
        gx = x + lw + gw * i / days
        d.line((gx, y + 30, gx, y + 30 + 30 * len(rows) + 14), fill=C['line2'])
        if i < days:
            text(d, (gx + 6, y + 15), f'W{i // 7 + 1}', 8.5, C['tx3'], False, 'lm')
    # today line
    tx = x + lw + gw * 0.52
    d.line((tx, y + 30, tx, y + 30 + 30 * len(rows) + 14), fill=BRAND, width=2)
    text(d, (tx + 6, y + 22), 'today', 8, BRAND, True, 'lm')
    yy = y + 30
    for i, (name, start, dur, prog, col) in enumerate(rows):
        if i % 2:
            d.rectangle((x, yy, x + w, yy + 30), fill='#FCFCFE')
        text(d, (x + 14, yy + 15), trunc(d, name, 10, lw - 24), 10, C['tx2'], False, 'lm')
        bx = x + lw + gw * start / days
        bw = max(8, gw * dur / days)
        rr(d, (bx, yy + 8, bx + bw, yy + 22), 4, fill='#F0F2F7')
        rr(d, (bx, yy + 8, bx + max(5, bw * prog / 100), yy + 22), 4, fill=col)
        text(d, (bx + bw + 6, yy + 15), f'{prog}%', 8.5, C['tx3'], False, 'lm')
        d.line((x, yy + 30, x + w, yy + 30), fill=C['line2'])
        yy += 30
    return yy


def save(img, name, w, h):
    img = img.crop((0, 0, w, h))
    p1 = os.path.join(SHOTS, name)
    img.save(p1, optimize=True)
    shutil.copyfile(p1, os.path.join(DOCSHOTS, name))
    print('  wrote', name, img.size)


P = DATA['projects']


# ================================================================= shots =====
def shot_dashboard():
    img, d, SB, TB = chrome('Command Centre', ['Command Centre'], 'Command Centre', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Command Centre', 'Monday, 2 November 2026 · All 4 business units · FY 26-27')
    y += 62
    cw, ch, gap = (1400 - x - 3 * 14) / 4, 96, 14
    kpis = [
        ('Contract value', inr(M['cv']), '+12.4% vs LY', 'ok', [12, 18, 15, 22, 26, 31]),
        ('Billed to date', inr(M['billed']), f"{M['collectionPct']}% collected", 'blue', [20, 22, 19, 28, 30, 34]),
        ('Receivables', inr(M['receivable']), inr(M['overdueRec']) + ' overdue', 'warn', [30, 34, 30, 36, 33, 38]),
        ('Gross margin', f"{M['grossMargin']}%", f"actual {M['actualMargin']}%", 'bad', [24, 23, 22, 20, 19, 17]),
    ]
    for i, (l, v, dlt, tn, sp) in enumerate(kpis):
        kpi(d, x + i * (cw + gap), y, cw, ch, l, v, dlt, tn, sp)
    y += ch + 16
    # revenue chart card
    cwid = 700
    cy = card(d, x, y, cwid, 268, 'Revenue, billing & collections', 'Last 6 months · ₹ in lakhs', ['6M', '1Y'])
    months = DATA['months']
    vals = [v / 1e5 for v in DATA['revenue']] or [1]
    bars(d, x + 40, cy + 20, cwid - 80, 138, vals, months, BRAND,
         [v * 0.72 for v in vals])
    ly = cy + 204
    for i, lab in enumerate(['Billed', 'Collected']):
        d.rounded_rectangle((x + 40 + i * 110, ly, x + 50 + i * 110, ly + 10), 3,
                            fill=BRAND if i == 0 else '#C7D2E5')
        text(d, (x + 58 + i * 110, ly + 5), lab, 10, C['tx2'], False, 'lm')
    # project health card
    px = x + cwid + 16
    pw = 1400 - px
    cy2 = card(d, px, y, pw, 268, 'Portfolio health', f"{M['live']} live · {M['atRisk']} at risk · {M['criticalSnags']} critical snags")
    rows = []
    for p in P[:4]:
        rows.append([(('2line', (p['name'][:34], f"{p['id']} · {p['city']}")), (0, .52, 'l')),
                     (('chip', p['health']), (0, .18, 'l')),
                     (('prog', p['progress']), (0, .30, 'l'))])
    rr_y = cy2 + 8
    for p in P[:4]:
        text(d, (px + 18, rr_y + 12), trunc(d, p['name'], 11, pw - 250), 11, C['tx'], True, 'lm')
        text(d, (px + 18, rr_y + 29), f"{p['type']} · {p['city']} · {inr(p['budget'])}", 9, C['tx3'], False, 'lm')
        chip(d, px + pw - 106, rr_y + 11, p['health'], tone_for(p['health']), 9.5)
        bw, bx = 96, px + pw - 106 - 16 - 96 - 42
        rr(d, (bx, rr_y + 22, bx + bw, rr_y + 28), 3, fill='#EEF0F6')
        rr(d, (bx, rr_y + 22, bx + max(4, bw * p['progress'] / 100), rr_y + 28), 3,
           fill=C['ok'] if p['health'] == 'On Track' else BRAND)
        text(d, (bx + bw + 6, rr_y + 24), f"{p['progress']}%", 9, C['tx2'], True, 'lm')
        d.line((px + 18, rr_y + 44, px + pw - 18, rr_y + 44), fill=C['line2'])
        rr_y += 52
    y += 268 + 16
    # my work + approvals
    w1 = 690
    cy3 = card(d, x, y, w1, 190, 'My work today', '8 open · 2 overdue', ['All tasks'])
    yy = cy3 + 6
    for i, t in enumerate(DATA['tasks'][:4]):
        d.ellipse((x + 20, yy + 12, x + 32, yy + 24), outline=C['tx3'] if i else BRAND, width=2)
        text(d, (x + 42, yy + 18), trunc(d, t['title'], 10.5, w1 - 240), 10.5, C['tx'], False, 'lm')
        chip(d, x + w1 - 150, yy + 7, t['pri'], tone_for(t['title']) if False else
             ('bad' if t['pri'] == 'Critical' else 'warn' if t['pri'] == 'High' else 'grey'), 9.2)
        text(d, (x + w1 - 20, yy + 18), t['due'][5:], 9.5, C['tx3'], False, 'rm')
        d.line((x + 20, yy + 36, x + w1 - 20, yy + 36), fill=C['line2'])
        yy += 34
    px2 = x + w1 + 16
    pw2 = 1400 - px2
    cy4 = card(d, px2, y, pw2, 190, 'Approvals waiting on you', f"{M['pendingApprovals']} pending · SLA 48h")
    appr = [('PO', 'PO-2026-0418 · ₹18.4 L · Meridian Interiors', 'Purchase order'),
            ('CO', 'CO-112 · ₹6.2 L · Concentrix F7', 'Change order'),
            ('EXP', 'EXP-0912 · ₹1.9 L · Site petty cash', 'Expense'),
            ('INV', 'INV-2201 · ₹42.0 L · Amazon BLR8', 'Client invoice')]
    yy = cy4 + 6
    for tag, ttl, sub in appr:
        rr(d, (px2 + 18, yy + 6, px2 + 56, yy + 30), 7, fill='#FFF0E8')
        text(d, ((px2 + 37), yy + 18), tag, 8.6, BRAND, True, 'mm')
        text(d, (px2 + 66, yy + 11), trunc(d, ttl, 10.5, pw2 - 200), 10.5, C['tx'], True, 'lm')
        text(d, (px2 + 66, yy + 26), sub, 9, C['tx3'], False, 'lm')
        rr(d, (px2 + pw2 - 108, yy + 8, px2 + pw2 - 62, yy + 30), 6, fill=C['okbg'])
        text(d, (px2 + pw2 - 85, yy + 19), 'Approve', 8.8, C['ok'], True, 'mm')
        rr(d, (px2 + pw2 - 56, yy + 8, px2 + pw2 - 18, yy + 30), 6, fill='#F4F5F9')
        text(d, (px2 + pw2 - 37, yy + 19), 'Hold', 8.8, C['tx2'], True, 'mm')
        d.line((px2 + 18, yy + 40, px2 + pw2 - 18, yy + 40), fill=C['line2'])
        yy += 44
    save(img, '01-command-centre.png', 1440, 900)


def shot_projects():
    img, d, SB, TB = chrome('Projects', ['Delivery', 'Projects'], 'Projects', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Projects', f"{M['totalProjects']} projects · {M['live']} live · {inr(M['cv'])} contract value",
              ['Export CSV', 'New project'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([
        ('Live projects', str(M['live']), '2 starting this month', 'blue'),
        ('On schedule', '6 of 10', '2 slipping', 'warn'),
        ('Open snags', str(M['openSnags']), f"{M['criticalSnags']} critical", 'bad'),
        ('Avg. progress', f"{M['progress']}%", '+4.2 pts this month', 'ok')]):
        kpi(d, x + i * (cw + gap), y, cw, 88, l, v, dlt, tn)
    y += 104
    TW = 1400 - x - 16
    card(d, x, y, TW, 470, None)
    # filter row
    fy = y + 14
    for i, lab in enumerate(['All projects', 'In Progress', 'Planning', 'Snagging', 'On Hold', 'Completed']):
        tw = d.textlength(lab, font=font(10.5, True)) + 26
        fill = BRAND if i == 0 else '#fff'
        rr(d, (x + 18 + sum(d.textlength(l2, font=font(10.5, True)) + 34 for l2 in
                            ['All projects', 'In Progress', 'Planning', 'Snagging', 'On Hold', 'Completed'][:i]),
               fy, x + 18 + sum(d.textlength(l2, font=font(10.5, True)) + 34 for l2 in
                                ['All projects', 'In Progress', 'Planning', 'Snagging', 'On Hold', 'Completed'][:i]) + tw,
               fy + 30), 8, fill=fill, outline=None if i == 0 else C['line'])
    # simpler: redraw pills cleanly
    d.rectangle((x + 1, y + 1, x + TW - 1, fy + 44), fill='#fff')
    px = x + 18
    for i, lab in enumerate(['All projects', 'In Progress', 'Planning', 'Snagging', 'On Hold', 'Completed']):
        tw = d.textlength(lab, font=font(10.5, True)) + 26
        rr(d, (px, fy, px + tw, fy + 30), 8, fill=BRAND if i == 0 else '#fff',
           outline=None if i == 0 else C['line'])
        text(d, (px + tw / 2, fy + 15), lab, 10.5, '#fff' if i == 0 else C['tx2'], True, 'mm')
        px += tw + 8
    sx = x + TW - 242
    rr(d, (sx, fy, x + TW - 18, fy + 30), 8, fill='#F7F8FB', outline=C['line'])
    text(d, (sx + 12, fy + 15), 'Search projects, clients, PM…', 10, C['tx3'], False, 'lm')
    d.line((x, fy + 44, x + TW, fy + 44), fill=C['line'])
    cols = [('Project', .29, 'l'), ('Client / City', .17, 'l'), ('Type', .12, 'l'),
            ('Value', .12, 'r'), ('Progress', .14, 'l'), ('Health', .09, 'l'), ('Status', .11, 'l')]
    rows = []
    for p in P[:8]:
        rows.append([(('2line', (p['name'][:40], p['id'] + ' · PM ' + p['pm'])), (0, .30, 'l')),
                     (('2line', (p['client'][:22], p['city'])), (0, .17, 'l')),
                     p['type'][:16], (('money', inr(p['budget'])), (0, .12, 'r')),
                     (('prog', p['progress']), (0, .14, 'l')),
                     (('chip', p['health']), (0, .09, 'l')),
                     (('chip', p['status']), (0, .11, 'l'))])
    table(d, x, fy + 44, TW, cols, rows, rowh=46)
    save(img, '02-projects.png', 1440, 900)


def shot_project_detail():
    img, d, SB, TB = chrome('Projects', ['Delivery', 'Projects', 'Amazon BLR8'], 'Projects', h=900)
    x, y = SB + 26, TB + 22
    d.ellipse((x, y, x + 46, y + 46), fill='#FFF0E8')
    text(d, (x + 23, y + 23), 'A', 20, BRAND, True, 'mm')
    text(d, (x + 58, y + 6), 'Amazon Development Centre — BLR8 Fitout', 19, C['tx'], True)
    text(d, (x + 58, y + 34), 'PRJ-0001 · Corporate Fitout · Bengaluru · Client: Amazon Development Centre', 10.5, C['tx2'])
    chip(d, 1190, y + 6, 'In Progress', 'blue', 10)
    chip(d, 1190, y + 32, 'On Track', 'ok', 10)
    y += 66
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([
        ('Contract value', inr(P[0]['budget']), '4 COs approved', 'brand'),
        ('Certified', inr(P[0]['spent']), '56% of contract', 'blue'),
        ('Progress', f"{P[0]['progress']}%", '3 days ahead', 'ok'),
        ('Open snags', '14', '4 critical', 'bad')]):
        kpi(d, x + i * (cw + gap), y, cw, 92, l, v, dlt, tn)
    y += 108
    # tabs
    tabs = ['Overview', 'BOQ & Scope', 'Schedule', 'Design & Drawings', 'Procurement', 'DPR', 'Snags', 'Billing', 'Documents']
    tx = x
    for i, t in enumerate(tabs):
        tw = d.textlength(t, font=font(11, True)) + 24
        if i == 1:
            rr(d, (tx, y, tx + tw, y + 30), 7, fill='#fff', outline=C['line'])
        text(d, (tx + 12, y + 15), t, 11, BRAND if i == 1 else C['tx2'], i == 1, 'lm')
        if i == 1:
            d.rectangle((tx + 12, y + 28, tx + tw - 12, y + 30), fill=BRAND)
        tx += tw + 4
    d.line((x, y + 30, 1400, y + 30), fill=C['line'])
    y += 44
    # BOQ table
    card(d, x, y, 900, 372, 'Bill of Quantities — Level 3 to 8', 'Certified 56% · 4 change orders · ₹18.4 L variation',
         ['Import BOQ', 'Add item'])
    cols = [('Item', .33, 'l'), ('Trade', .15, 'l'), ('Qty', .11, 'r'), ('Rate', .13, 'r'),
            ('Amount', .14, 'r'), ('Executed', .14, 'l')]
    items = [('False ceiling — grid + gypsum 600x600', 'Ceiling', '4,200 sqft', 285, 4200, 'Executed'),
             ('Vitrified flooring 600x600, premium', 'Flooring', '18,400 sqft', 142, 18400, 'Executed'),
             ('Gypsum partition 100mm double skin', 'Partitions', '6,800 sqft', 312, 5100, 'In Progress'),
             ('HVAC ducting + FCU installation', 'HVAC', '22 nos', 68500, 22, 'In Progress'),
             ('Electrical — LT cabling & DBs', 'Electrical', '1 LS', 2450000, 1, 'In Progress'),
             ('Firefighting sprinkler + detection', 'Fire', '1 LS', 1820000, 1, 'Pending'),
             ('Modular workstation, 1200mm', 'Furniture', '240 nos', 18500, 240, 'Pending')]
    rows = []
    for it, tr, qty, rate, q, st in items:
        rows.append([it[:44], tr, qty,
                     (('money', '₹' + f'{rate:,}'), (0, .13, 'r')),
                     (('money', inr(rate * q)), (0, .13, 'r')),
                     (('chip', st), (0, .14, 'l'))])
    table(d, x, y + 50, 900, cols, rows, rowh=41)
    # right column
    rx = x + 916
    rw = 1400 - rx
    cy = card(d, rx, y, rw, 176, 'Commercials', None)
    lines = [('Contract value', inr(P[0]['budget'])), ('Certified to date', inr(P[0]['spent'])),
             ('Retention @ 5%', inr(P[0]['budget'] * .05)), ('Balance to bill', inr(P[0]['budget'] * .44))]
    yy = cy + 12
    for l, v in lines:
        text(d, (rx + 18, yy), l, 10.5, C['tx3'], False, 'lm')
        text(d, (rx + rw - 18, yy), v, 11, C['tx'], True, 'rm')
        yy += 30
    cy2 = card(d, rx, y + 192, rw, 180, 'Project team', None)
    team = [('Arjun Kapoor', 'Project Manager', '#2563EB'), ('Sneha Rao', 'Design Lead', '#7C3AED'),
            ('Imtiaz Ansari', 'Site Engineer', '#0E9F6E'), ('Rohan Bhatia', 'QS / Billing', '#D97706')]
    yy = cy2 + 14
    for n, r, col in team:
        d.ellipse((rx + 18, yy - 11, rx + 40, yy + 11), fill=col)
        text(d, (rx + 29, yy), n[0], 10, '#fff', True, 'mm')
        text(d, (rx + 50, yy - 6), n, 10.5, C['tx'], True, 'lm')
        text(d, (rx + 50, yy + 9), r, 9, C['tx3'], False, 'lm')
        yy += 38
    cy3 = card(d, x, y + 392, 1400 - x - 16, 176, 'Change orders & variations', '4 approved · 1 pending · ₹18.4 L impact')
    cols = [('CO', .12, 'l'), ('Description', .42, 'l'), ('Raised by', .16, 'l'),
            ('Value', .14, 'r'), ('Status', .16, 'l')]
    cos = [('CO-108', 'Additional cabins on L6 — client request', 'Arjun Kapoor', '₹6,20,000', 'Approved'),
           ('CO-109', 'Marble upgraded to Statuario in lobby', 'Sneha Rao', '₹8,40,000', 'Approved'),
           ('CO-110', 'Extra power points — 68 nos', 'Imtiaz Ansari', '₹2,10,000', 'Approved'),
           ('CO-111', 'Provision for UPS room civil work', 'Rohan Bhatia', '₹1,70,000', 'Pending')]
    rows = [[a, b, c, (('money', vv), (0, .14, 'r')), (('chip', st), (0, .16, 'l'))] for a, b, c, vv, st in cos]
    table(d, x, cy3 + 4, 1400 - x - 16, cols, rows, rowh=30)
    save(img, '03-project-boq.png', 1440, 900)


def shot_schedule():
    img, d, SB, TB = chrome('Schedule', ['Delivery', 'Schedule & Gantt'], 'Schedule & Gantt', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Schedule & Gantt', 'Amazon BLR8 · Baseline vs actual · 90-day window', ['Baseline', 'New activity'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Planned progress', '58%', 'baseline', 'grey'),
                                        ('Actual progress', f"{M['progress']}%", '-10.5 pts', 'bad'),
                                        ('Critical activities', '6', '2 slipping', 'warn'),
                                        ('Float remaining', '4 days', 'on critical path', 'bad')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    card(d, x, y, 1400 - x - 16, 352, 'Master schedule — Level 3 to 8', 'Critical path in orange · drag bars to reschedule',
         ['Day', 'Week', 'Month'])
    rows = [('Mobilisation & site setup', 2, 8, 100, C['ok']),
            ('Demolition & debris removal', 8, 10, 100, C['ok']),
            ('Gypsum partitions L3-L5', 16, 18, 92, BRAND),
            ('Electrical rough-in', 24, 20, 78, BRAND),
            ('HVAC ducting & FCU', 30, 22, 64, '#2563EB'),
            ('False ceiling grid', 40, 16, 52, '#7C3AED'),
            ('Flooring & skirting', 50, 18, 28, '#0D9488'),
            ('Modular furniture install', 62, 16, 8, C['bad']),
            ('Snagging & handover', 76, 10, 0, C['grey'])]
    gantt(d, x, y + 50, 1400 - x - 16, rows, days=90)
    y += 368
    cy = card(d, x, y, 700, 226, 'Planned vs actual — S-curve', 'Cumulative progress, %')
    plan = [4, 12, 24, 38, 52, 62, 74, 86, 96, 100]
    act = [4, 11, 22, 33, 44, 53, 61, 68, 71, 72]
    for ser, col in ((plan, '#C7D2E5'), (act, BRAND)):
        pts = [(x + 40 + i * 620 / 9, y + 190 - v * 1.25) for i, v in enumerate(ser)]
        d.line(pts, fill=col, width=3, joint='curve')
        for pt in pts:
            d.ellipse((pt[0] - 3, pt[1] - 3, pt[0] + 3, pt[1] + 3), fill=col)
    for i, lab in enumerate(['W1', 'W3', 'W5', 'W7', 'W9']):
        text(d, (x + 40 + i * 155, y + 210), lab, 9, C['tx3'], False, 'mm')
    for i, (l, cl) in enumerate([('Planned', '#C7D2E5'), ('Actual', BRAND)]):
        d.rectangle((x + 40 + i * 90, y + 58, x + 52 + i * 90, y + 62), fill=cl)
        text(d, (x + 58 + i * 90, y + 60), l, 9, C['tx3'], False, 'lm')
    cy2 = card(d, x + 716, y, 1400 - x - 732, 226, 'Milestones & dependencies', 'Next 30 days')
    ms = [('Design freeze — L6 to L8', '04 Nov', 'ok'), ('HVAC first fix complete', '09 Nov', 'warn'),
          ('Billing milestone 4', '14 Nov', 'ok'), ('Client walkthrough L4', '21 Nov', 'warn'),
          ('Handover — Phase 1', '28 Nov', 'bad')]
    yy = y + 60
    for n, dt, tn in ms:
        d.ellipse((x + 736, yy - 4, x + 744, yy + 4), fill={'ok': C['ok'], 'warn': C['warn'], 'bad': C['bad']}[tn])
        text(d, (x + 758, yy), n, 10.5, C['tx2'], False, 'lm')
        text(d, (1400 - 36, yy), dt, 10, C['tx3'], True, 'rm')
        yy += 32
    save(img, '04-gantt.png', 1440, 900)


def shot_procurement():
    img, d, SB, TB = chrome('Procurement', ['Supply', 'Procurement'], 'Procurement', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Procurement', 'Indents → RFQ → Purchase orders → GRN → Vendor bills', ['Export', 'New purchase order'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Open POs', '38', '₹4.2 Cr committed', 'blue'),
                                        ('Pending GRN', '11', '3 overdue deliveries', 'warn'),
                                        ('Vendor payables', inr(M['payable']), '68% due this month', 'grey'),
                                        ('3-way match', '96%', '2 mismatches', 'ok')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    tabs = ['Purchase orders', 'Indents', 'RFQs', 'GRN', 'Vendors', 'Rate comparison']
    tx = x
    for i, t in enumerate(tabs):
        tw = d.textlength(t, font=font(11, True)) + 24
        text(d, (tx + 12, y + 15), t, 11, BRAND if i == 0 else C['tx2'], i == 0, 'lm')
        if i == 0:
            d.rectangle((tx + 12, y + 28, tx + tw - 12, y + 30), fill=BRAND)
        tx += tw + 4
    d.line((x, y + 30, 1400, y + 30), fill=C['line'])
    y += 44
    card(d, x, y, 1400 - x, 400, None)
    cols = [('PO / Vendor', .30, 'l'), ('Project', .20, 'l'), ('Value', .12, 'r'),
            ('Delivery', .12, 'l'), ('GRN', .14, 'l'), ('Status', .12, 'l')]
    po = [('PO-2026-0418 · Meridian Interiors', 'Amazon BLR8', 1840000, '04 Nov 26', 'Partial', 'Approved'),
          ('PO-2026-0417 · Bluewave HVAC', 'Concentrix F7', 3260000, '02 Nov 26', 'Received', 'Paid'),
          ('PO-2026-0416 · Shri Ram Electricals', 'TEC Golf Course', 2140000, '08 Nov 26', '—', 'Pending'),
          ('PO-2026-0415 · Decor Ceilings Pvt Ltd', 'Amazon BLR8', 960000, '31 Oct 26', 'Received', 'Paid'),
          ('PO-2026-0414 · NCR Fire Systems', 'DLF Cyber Hub', 1480000, '12 Nov 26', '—', 'Approved'),
          ('PO-2026-0413 · Space Furniture Co.', 'Concentrix F7', 4440000, '20 Nov 26', '—', 'Draft'),
          ('PO-2026-0412 · Apex Flooring', 'Wework Vaishnavi', 1120000, '28 Oct 26', 'Received', 'Paid')]
    rows = [[(('2line', (a[:36], '3-way matched' if st == 'Paid' else 'awaiting invoice')), (0, .30, 'l')),
             b, (('money', inr_full(v)), (0, .12, 'r')), c,
             (('chip', dg), (0, .14, 'l')), (('chip', st), (0, .12, 'l'))]
            for a, b, v, c, dg, st in po]
    table(d, x, y + 4, 1400 - x - 16, cols, rows, rowh=44)
    y += 366
    cy = card(d, x, y, 690, 226, 'Vendor scorecard', 'Delivery, quality and rate competitiveness')
    cols = [('Vendor', .40, 'l'), ('Delivery', .20, 'r'), ('Quality', .20, 'r'), ('Rate', .20, 'r')]
    vs = [('Meridian Interiors', '96%', '4.6', 'Best'), ('Bluewave HVAC', '88%', '4.2', 'Fair'),
          ('Shri Ram Electricals', '72%', '3.9', 'High'), ('Decor Ceilings Pvt Ltd', '94%', '4.5', 'Best'),
          ('Apex Flooring', '91%', '4.1', 'Fair')]
    rows = [[v, (('money', a), (0, .20, 'r')), (('money', b_), (0, .20, 'r')), c] for v, a, b_, c in vs]
    table(d, x, cy + 6, 690, cols, rows, rowh=28)
    cwid2 = 1400 - 16 - (x + 706)
    cy2 = card(d, x + 706, y, cwid2, 226, 'Commitment vs budget', 'Live · ₹ crore')
    heads = ['Mat.', 'Lab.', 'Sub', 'Eqp.']
    bars(d, x + 736, y + 74, cwid2 - 60, 96, [14.2, 6.4, 8.8, 1.9], heads, BRAND, [16.0, 7.1, 8.1, 2.2])
    for i, (l, cl) in enumerate([('Committed', BRAND), ('Budget', '#C7D2E5')]):
        d.rectangle((x + 736 + i * 100, y + 198, x + 748 + i * 100, y + 208), fill=cl)
        text(d, (x + 756 + i * 100, y + 203), l, 9.5, C['tx3'], False, 'lm')
    save(img, '05-procurement.png', 1440, 900)


def shot_finance():
    img, d, SB, TB = chrome('Finance', ['Money', 'Finance & Billing'], 'Finance & Billing', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Finance & Billing', 'Client invoices, vendor bills, retention, TDS & collections', ['Export', 'New invoice'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Billed', inr(M['billed']), 'this FY', 'blue'),
                                        ('Collected', inr(M['received']), f"{M['collectionPct']}%", 'ok'),
                                        ('Receivable', inr(M['receivable']), inr(M['overdueRec']) + ' > 90d', 'warn'),
                                        ('Gross margin', f"{M['grossMargin']}%", 'target 22%', 'bad')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    RIGHT = 1400 - 16
    w1, w2 = 402, 348
    w3 = RIGHT - x - w1 - w2 - 32
    cy = card(d, x, y, w1, 300, 'Ageing of receivables', '₹ in crore')
    parts = [('0-30', 42, C['ok']), ('31-60', 24, C['blue']), ('61-90', 18, BRAND), ('>90', 16, C['bad'])]
    donut(d, x + 104, cy + 108, 66, parts)
    text(d, (x + 104, cy + 98), inr(M['receivable']), 14, C['tx'], True, 'mm')
    text(d, (x + 104, cy + 116), 'outstanding', 8.5, C['tx3'], False, 'mm')
    yy = cy + 46
    for l, v, col in parts:
        d.rounded_rectangle((x + 208, yy, x + 220, yy + 10), 3, fill=col)
        text(d, (x + 228, yy + 5), l + ' days', 10, C['tx2'], False, 'lm')
        text(d, (x + w1 - 20, yy + 5), f'{v}%', 10, C['tx'], True, 'rm')
        yy += 32
    text(d, (x + 20, cy + 208), 'Weighted collection days', 9.5, C['tx3'])
    text(d, (x + 20, cy + 228), '54 days', 16, C['tx'], True)
    text(d, (x + 20, cy + 246), 'Target 45 · DSO trending down 3 days QoQ', 8.8, C['tx3'])

    cx2 = x + w1 + 16
    card(d, cx2, y, w2, 300, 'Cost vs budget', 'Live · ₹ crore')
    heads = ['Mat', 'Lab', 'Sub', 'Ovh']
    bars(d, cx2 + 26, y + 72, w2 - 52, 150, [16.1, 7.9, 6.9, 2.1], heads, BRAND, [18.4, 8.2, 6.6, 2.4])
    for i, (l, cl) in enumerate([('Actual', BRAND), ('Budget', '#C7D2E5')]):
        d.rectangle((cx2 + 26 + i * 92, y + 262, cx2 + 38 + i * 92, y + 272), fill=cl)
        text(d, (cx2 + 46 + i * 92, y + 267), l, 9.5, C['tx3'], False, 'lm')

    rx = cx2 + w2 + 16
    card(d, rx, y, w3, 300, 'This month', 'Cash position')
    items = [('Invoiced', inr(M['billed'] / 12)), ('Collected', inr(M['received'] / 12)),
             ('Vendor bills due', inr(M['payable'])), ('Net cash', inr(M['received'] / 12 - M['payable']))]
    yy = y + 78
    for i, (l, v) in enumerate(items):
        text(d, (rx + 20, yy), l, 10.5, C['tx2'], False, 'lm')
        text(d, (rx + w3 - 20, yy), v, 12.5, C['tx'], True, 'rm')
        if i == 2:
            d.line((rx + 20, yy + 22, rx + w3 - 20, yy + 22), fill=C['line'])
        yy += 46
    rr(d, (rx + 16, y + 246, rx + w3 - 16, y + 286), 8, fill='#E8F8F1')
    text(d, (rx + 30, y + 266), 'Healthy — 48 days of runway', 10, C['ok'], True, 'lm')

    y += 316
    card(d, x, y, 1400 - x - 16, 240, 'Recent invoices', 'GST-compliant · e-invoice ready')
    cols = [('Invoice', .16, 'l'), ('Client', .24, 'l'), ('Project', .20, 'l'), ('Date', .12, 'l'),
            ('Amount', .14, 'r'), ('Status', .14, 'l')]
    inv = [('INV-2201', 'Amazon Development Centre', 'Amazon BLR8', '28 Oct 26', 42000000, 'Paid'),
           ('INV-2202', 'Concentrix Corporation', 'Concentrix F7', '30 Oct 26', 28500000, 'Sent'),
           ('INV-2203', 'The Executive Centre', 'TEC Golf Course', '31 Oct 26', 12400000, 'Overdue'),
           ('INV-2204', 'WeWork India', 'WeWork Vaishnavi', '01 Nov 26', 9600000, 'Paid')]
    rows = [[a, b, c, dt, (('money', inr_full(v)), (0, .14, 'r')), (('chip', st), (0, .14, 'l'))]
            for a, b, c, dt, v, st in inv]
    table(d, x, y + 50, 1400 - x - 16, cols, rows, rowh=42)
    save(img, '06-finance.png', 1440, 900)


def shot_crm():
    img, d, SB, TB = chrome('CRM', ['Growth', 'CRM & Leads'], 'CRM & Leads', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'CRM & Sales pipeline', f"{inr(M['pipeline'])} weighted pipeline · {M['avgDaysToClose']} day avg. close",
              ['Import leads', 'New lead'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Pipeline', inr(M['pipeline']), '38 open deals', 'blue'),
                                        ('Won this quarter', inr(M['wonValue']), '+18% QoQ', 'ok'),
                                        ('Win rate', '34%', 'target 40%', 'warn'),
                                        ('Avg. deal size', inr(M['pipeline'] / 38), 'fit-out + civil', 'grey')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    stages = [('Qualified', 12, C['blue']), ('Site survey', 9, C['purple']), ('Proposal', 7, '#0D9488'),
              ('Negotiation', 5, BRAND), ('Won', 3, C['ok'])]
    colw = (1400 - x - 4 * 12) / 5
    for i, (st, n, col) in enumerate(stages):
        cx = x + i * (colw + 12)
        card(d, cx, y, colw, 420, None)
        d.rectangle((cx, y, cx + 4, y + 420), fill=col)
        text(d, (cx + 18, y + 22), st.upper(), 9, C['tx3'], True)
        text(d, (cx + colw - 18, y + 22), str(n), 9.5, C['tx2'], True, 'rm')
        cyy = y + 44
        for j in range(min(3, n)):
            leads = ['DLF Cyber Hub L9', 'Wework Vaishnavi', 'Prestige Tech Park', 'Godrej BKC',
                     'Embassy Golf Links', 'Smartworks Noida', 'Microsoft IDC', 'JLL Hyderabad',
                     'Capgemini Pune', 'Infosys Phase 2', 'TATA 1MG HQ', 'Bharti Realty']
            nm = leads[(i * 3 + j) % len(leads)]
            rr(d, (cx + 12, cyy, cx + colw - 12, cyy + 86), 9, fill='#FBFBFD', outline=C['line'])
            text(d, (cx + 24, cyy + 16), trunc(d, nm, 10.5, colw - 50), 10.5, C['tx'], True)
            text(d, (cx + 24, cyy + 34), ['Corporate fitout', 'Coworking', 'Civil + interiors'][j % 3], 9, C['tx3'])
            text(d, (cx + 24, cyy + 60), inr((j + 1) * 6200000 + i * 2100000), 11, BRAND, True)
            chip(d, cx + colw - 74, cyy + 52, ['Hot', 'Warm', 'Cold'][j % 3],
                 ['bad', 'warn', 'blue'][j % 3], 8.6)
            cyy += 96
    y += 436
    vx = x
    card(d, vx, y, 690, 190, 'Quotation QT-2026-0142', 'Amazon BLR8 · Rev 3 · sent 2 days ago')
    qlines = [('Design & build — 3 floors', inr_full(21400000), .0), ('HVAC & electrical', inr_full(8600000), .0),
              ('Furniture & loose seating', inr_full(4200000), .0)]
    yy = y + 66
    for l, v, _ in qlines:
        text(d, (vx + 20, yy), l, 10.5, C['tx2'])
        text(d, (vx + 670, yy), v, 11, C['tx'], True, 'ra')
        yy += 24
    d.line((vx + 20, yy - 8, vx + 670, yy - 8), fill=C['line'])
    text(d, (vx + 20, yy + 6), 'Total (incl. GST)', 11, C['tx'], True)
    text(d, (vx + 670, yy + 6), inr_full(34200000 * 1.18), 13, BRAND, True, 'ra')
    card(d, x + 706, y, 1400 - x - 722, 190, 'Conversion funnel', 'Last 90 days')
    fun = [('Enquiries', 96), ('Site surveys', 61), ('Proposals', 38), ('Won', 13)]
    yy = y + 70
    for l, v in fun:
        text(d, (x + 726, yy), l, 10, C['tx2'], False, 'lm')
        bw = 230 * v / 96
        rr(d, (x + 830, yy - 8, x + 830 + bw, yy + 8), 4, fill=BRAND)
        text(d, (x + 830 + bw + 10, yy), str(v), 10, C['tx2'], True, 'lm')
        yy += 26
    save(img, '07-crm.png', 1440, 900)


def shot_hrm():
    img, d, SB, TB = chrome('HRM', ['People', 'HRM'], 'HRM', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Human Resources', f"{M['headcount']} employees · {M['onNotice']} on notice · {M['openLeaves']} leave requests",
              ['Export', 'Add employee'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Headcount', str(M['headcount']), '+6 this quarter', 'ok'),
                                        ('Attendance', '94.2%', 'today', 'ok'),
                                        ('Payroll cost', inr(M['payrollCost']), 'monthly', 'blue'),
                                        ('Attrition', '8.4%', 'annualised', 'warn')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    emp = DATA['employees']
    depts = [('Projects', 18), ('Design', 9), ('Procurement', 7), ('Finance', 6), ('Sales', 8), ('HR & Admin', 4), ('Site', 5)]
    cy = card(d, x, y, 420, 320, 'Headcount by department', '57 employees')
    donut(d, x + 108, cy + 100, 68, [(n, v, PALETTE[i]) for i, (n, v) in enumerate(depts)])
    text(d, (x + 108, cy + 92), '57', 20, C['tx'], True, 'mm')
    text(d, (x + 108, cy + 112), 'people', 9, C['tx3'], False, 'mm')
    yy = cy + 34
    for i, (n, v) in enumerate(depts):
        d.rounded_rectangle((x + 208, yy, x + 220, yy + 10), 3, fill=PALETTE[i])
        text(d, (x + 230, yy + 5), n, 10, C['tx2'], False, 'lm')
        text(d, (x + 396, yy + 5), str(v), 10, C['tx'], True, 'rm')
        yy += 26
    cy2 = card(d, x + 436, y, 1400 - x - 452, 320, 'Employee directory', 'Search by name, department, designation',
               ['All departments'])
    cols = [('Employee', .34, 'l'), ('Department', .20, 'l'), ('Designation', .24, 'l'),
            ('CTC', .12, 'r'), ('Status', .10, 'l')]
    rows = []
    for e in emp[:5]:
        rows.append([(('2line', (e['name'], e['id'])), (0, .34, 'l')),
                     e.get('department', e.get('dept', 'Projects')), e.get('designation', e.get('desig', 'Engineer')),
                     (('money', inr_full(e['ctc'])), (0, .12, 'r')), (('chip', e['status']), (0, .10, 'l'))])
    table(d, x + 436, cy2 + 4, 1400 - x - 452, cols, rows, rowh=40)
    y += 336
    # attendance heatmap
    card(d, x, y, 690, 210, 'Attendance — October', '94.2% present · 12 late · 3 absent')
    present = [[1, 1, 1, 1, 0, 1, 1], [1, 1, .5, 1, 1, 1, 0], [1, 1, 1, 1, 1, .5, 1], [1, 0, 1, 1, 1, 1, 1]]
    for r in range(4):
        for c in range(7):
            v = present[r][c]
            col = C['ok'] if v == 1 else (C['warn'] if v == .5 else '#E8EAF1')
            rr(d, (x + 24 + c * 38, y + 72 + r * 30, x + 54 + c * 38, y + 96 + r * 30), 5, fill=col)
    for i, dname in enumerate(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']):
        text(d, (x + 39 + i * 38, y + 60), dname, 8.5, C['tx3'], False, 'mm')
    # leave requests
    card(d, x + 706, y, 1400 - x - 706, 210, 'Leave requests', f"{M['openLeaves']} pending")
    lv = [('Sneha Rao', 'Casual leave · 2 days', 'Pending'), ('Imtiaz Ansari', 'Sick leave · 1 day', 'Approved'),
          ('Rohan Bhatia', 'Earned leave · 5 days', 'Pending'), ('Meera Iyer', 'Comp-off · 1 day', 'Approved')]
    yy = y + 62
    for n, l, st in lv:
        d.ellipse((x + 726, yy - 10, x + 746, yy + 10), fill='#EAF0FE')
        text(d, (x + 736, yy), n[0], 9, C['blue'], True, 'mm')
        text(d, (x + 754, yy - 7), n, 10, C['tx'], True, 'lm')
        text(d, (x + 754, yy + 8), l, 9, C['tx3'], False, 'lm')
        chip(d, 1400 - 130, yy - 4, st, tone_for(st), 9)
        yy += 36
    save(img, '08-hrm.png', 1440, 900)


def shot_payroll():
    img, d, SB, TB = chrome('Payroll', ['People', 'Payroll'], 'Payroll', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Payroll', 'October 2026 · 57 employees · statutory compliant', ['Bank file', 'Run payroll'])
    y += 62
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Gross payroll', inr(M['payrollCost']), 'Oct 2026', 'blue'),
                                        ('Statutory', inr(M['payrollCost'] * .18), 'PF + ESI + PT', 'grey'),
                                        ('TDS', inr(M['payrollCost'] * .11), 'projected', 'warn'),
                                        ('Net payable', inr(M['payrollCost'] * .71), '30 Nov 26', 'ok')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    card(d, x, y, 480, 470, 'Payslip — EMP-0004 · Aarav Sharma', 'Project Engineer · Projects · Oct 2026',
         ['Download PDF'])
    yy = y + 62
    text(d, (x + 20, yy), 'EARNINGS', 9, C['tx3'], True)
    text(d, (x + 440, yy), 'AMOUNT', 9, C['tx3'], True, 'ra')
    yy += 18
    earn = [('Basic', 42000), ('HRA', 16800), ('Conveyance', 2400), ('Special allowance', 12400), ('Site allowance', 3000)]
    for l, v in earn:
        text(d, (x + 20, yy), l, 10.5, C['tx2'])
        text(d, (x + 440, yy), inr_full(v), 10.5, C['tx'], False, 'ra')
        yy += 24
    d.line((x + 20, yy, x + 440, yy), fill=C['line'])
    yy += 12
    text(d, (x + 20, yy), 'Gross', 11, C['tx'], True)
    text(d, (x + 440, yy), inr_full(76600), 11, C['tx'], True, 'ra')
    yy += 34
    text(d, (x + 20, yy), 'Deductions', 9.5, C['tx3'], True)
    yy += 20
    for l, v in [('PF (12%)', 5040), ('ESI (0.75%)', 575), ('Professional tax', 200), ('TDS', 4200)]:
        text(d, (x + 20, yy), l, 10.5, C['tx2'])
        text(d, (x + 440, yy), '-' + inr_full(v), 10.5, C['bad'], False, 'ra')
        yy += 24
    d.line((x + 20, yy, x + 440, yy), fill=C['line'])
    yy += 14
    rr(d, (x + 20, yy, x + 460, yy + 54), 9, fill='#FFF7F2')
    text(d, (x + 36, yy + 18), 'Net pay', 10.5, C['tx2'], False, 'lm')
    text(d, (x + 444, yy + 18), inr_full(66585), 16, BRAND, True, 'rm')
    text(d, (x + 36, yy + 38), 'Credited to HDFC ****4412 on 31 Oct 2026', 9, C['tx3'], False, 'lm')
    # attendance summary
    cy = card(d, x + 496, y, 380, 226, 'Attendance input', 'October 2026')
    stats = [('Working days', '26'), ('Present', '25'), ('Paid leave', '1'), ('LOP days', '0'), ('Overtime hrs', '6')]
    yy = cy + 16
    for l, v in stats:
        text(d, (x + 516, yy), l, 10.5, C['tx2'])
        text(d, (x + 856, yy), v, 10.5, C['tx'], True, 'ra')
        yy += 30
    cy2 = card(d, x + 496, y + 242, 380, 228, 'Statutory compliance', 'Auto-computed')
    yy = cy2 + 10
    for l, v, tn in [('PF challan', 'Generated', 'ok'), ('ESI challan', 'Generated', 'ok'),
                     ('PT return', 'Due 20 Nov', 'warn'), ('TDS 24Q', 'Filed Q2', 'ok')]:
        text(d, (x + 516, yy + 10), l, 10.5, C['tx2'], False, 'lm')
        chip(d, x + 746, yy, v, tn, 9)
        yy += 32
    # payroll register
    card(d, x + 892, y, 1400 - x - 908, 470, 'Payroll register', '57 employees · October 2026')
    cols = [('Employee', .44, 'l'), ('Gross', .28, 'r'), ('Net', .28, 'r')]
    names = ['Aarav Sharma', 'Vivaan Mehta', 'Aditya Nair', 'Diya Patel', 'Ishaan Gupta', 'Ananya Reddy', 'Kabir Singh', 'Riya Joshi']
    rows = [[n, (('money', inr_full(48000 + i * 4200)), (0, .28, 'r')),
             (('money', inr_full(41500 + i * 3600)), (0, .28, 'r'))] for i, n in enumerate(names)]
    table(d, x + 892, y + 54, 1400 - x - 908, cols, rows, rowh=40)
    # footer note
    rr(d, (x, 790, 1400 - 16, 870), 12, fill='#FFF7F2', outline='#FFD9C4')
    text(d, (x + 22, 812), 'One click, fully compliant', 12, C['tx'], True)
    text(d, (x + 22, 834), 'Payroll locks attendance, computes PF / ESI / PT / TDS, generates payslips, statutory challans and the bank transfer file in NEFT format.', 10, C['tx2'])
    save(img, '09-payroll.png', 1440, 900)


def shot_copilot():
    img, d, SB, TB = chrome('AI Copilot', ['Intelligence', 'AI Copilot'], 'AI Copilot', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'AI Copilot', 'Ask about your own data — projects, money, people, schedule', ['New chat'])
    y += 62
    card(d, x, y, 1400 - x, 560, None)
    yy = y + 24
    # user bubble
    q = 'Which projects are bleeding margin, and what should I do first?'
    qw = d.textlength(q, font=font(12)) + 36
    rr(d, (1400 - 40 - qw, yy, 1400 - 40, yy + 44), 12, fill=BRAND)
    text(d, (1400 - 40 - qw / 2 - 0, yy + 22), q, 12, '#fff', False, 'mm')
    yy += 64
    # assistant
    d.ellipse((x + 24, yy, x + 56, yy + 32), fill=C['side'])
    text(d, (x + 40, yy + 16), 'AI', 10, BRAND, True, 'mm')
    text(d, (x + 68, yy + 4), 'Managekaro Copilot', 11, C['tx'], True)
    text(d, (x + 68, yy + 21), 'answered from 16 projects · 1,204 cost lines · 63 DPRs', 9, C['tx3'])
    yy += 44
    body = ('Three projects are below the 12% gross-margin floor. Combined exposure is ₹1.94 Cr of un-recovered cost, '
            'mostly subcontractor variations not yet billed to the client.')
    for line in wrap(d, body, 11.5, 760):
        text(d, (x + 68, yy), line, 11.5, C['tx2'])
        yy += 20
    yy += 12
    # mini table in answer
    cols = [('Project', .34, 'l'), ('Margin', .16, 'r'), ('Driver', .34, 'l'), ('Action', .16, 'l')]
    rows = [[('The Executive Centre — Golf Course Rd', (('2line', ('The Executive Centre', 'TEC · Gurugram')), (0, .34, 'l'))[0]), ''],
            ]
    rows = [[(('2line', ('The Executive Centre — Golf Rd', 'PRJ-0003 · Coworking')), (0, .34, 'l')),
             (('money', '-8.4%'), (0, .16, 'r')), 'Unbilled HVAC variation', (('chip', 'Bill now'), (0, .16, 'l'))],
            [(('2line', ('Amazon BLR8 Fitout', 'PRJ-0001 · Corporate')), (0, .34, 'l')),
             (('money', '6.1%'), (0, .16, 'r')), 'Marble wastage 14%', (('chip', 'Review'), (0, .16, 'l'))],
            [(('2line', ('Concentrix Floor 7 & 8', 'PRJ-0002 · Corporate')), (0, .34, 'l')),
             (('money', '9.8%'), (0, .16, 'r')), 'Overtime on night shift', (('chip', 'Freeze OT'), (0, .16, 'l'))]]
    table(d, x + 68, yy, 1000, cols, rows, rowh=44)
    yy += 44 * 3 + 34
    text(d, (x + 68, yy), 'Recommended sequence', 11, C['tx'], True)
    yy += 22
    for i, s in enumerate(['Raise CO for the HVAC variation on PRJ-0003 today — ₹42 L of recoverable cost.',
                           'Switch PRJ-0001 marble vendor to rate-contract panel; saves ₹8.4 L / month.',
                           'Cap night-shift overtime on PRJ-0002 at 40 hrs; protects 1.8 pts of margin.']):
        d.ellipse((x + 68, yy, x + 86, yy + 18), fill='#FFF0E8')
        text(d, (x + 77, yy + 9), str(i + 1), 9, BRAND, True, 'mm')
        text(d, (x + 96, yy + 9), s, 11, C['tx2'], False, 'lm')
        yy += 26
    # composer
    rr(d, (x + 20, y + 490, 1400 - 20, y + 540), 12, fill='#F7F8FB', outline=C['line'])
    text(d, (x + 38, y + 515), 'Ask a follow-up — “draft the change order”', 11, C['tx3'], False, 'lm')
    rr(d, (1400 - 96, y + 500, 1400 - 34, y + 530), 8, fill=BRAND)
    text(d, (1400 - 65, y + 515), 'Send', 10, '#fff', True, 'mm')
    y += 576
    card(d, x, y, 1400 - x - 16, 176, 'Suggested questions', 'Grounded in your workspace')
    qs = ['Which vendors have the worst delivery slippage?', 'Show me DPR gaps for last week',
          'What is my cash position next 30 days?', 'Draft a snag closure mail to Amazon',
          'Compare labour productivity across sites', 'Who is on leave tomorrow?']
    for i, qsx in enumerate(qs):
        qw3 = (1400 - 16 - x - 40 - 24) / 3
        cx = x + 20 + (i % 3) * (qw3 + 12)
        cyy = y + 58 + (i // 3) * 44
        rr(d, (cx, cyy, cx + qw3, cyy + 34), 8, fill='#FBFBFD', outline=C['line'])
        text(d, (cx + 14, cyy + 17), trunc(d, qsx, 10.5, qw3 - 46), 10.5, C['tx2'], False, 'lm')
        text(d, (cx + qw3 - 14, cyy + 17), '→', 11, BRAND, True, 'rm')
    save(img, '10-copilot.png', 1440, 900)


def shot_analytics():
    img, d, SB, TB = chrome('Analytics', ['Intelligence', 'Analytics'], 'Analytics', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Analytics & intelligence', 'Cross-module reporting · FY 26-27 · live', ['Export', 'Schedule report'])
    y += 62
    tabs = ['Executive', 'Delivery', 'Commercial', 'People', 'Supply chain', 'Client']
    tx = x
    for i, t in enumerate(tabs):
        tw = d.textlength(t, font=font(11, True)) + 24
        text(d, (tx + 12, y + 15), t, 11, BRAND if i == 0 else C['tx2'], i == 0, 'lm')
        if i == 0:
            d.rectangle((tx + 12, y + 28, tx + tw - 12, y + 30), fill=BRAND)
        tx += tw + 4
    d.line((x, y + 30, 1400, y + 30), fill=C['line'])
    y += 44
    cw, gap = (1400 - x - 3 * 14) / 4, 14
    for i, (l, v, dlt, tn) in enumerate([('Revenue recognised', inr(M['billed']), '+14.2% YoY', 'ok'),
                                        ('Gross margin', f"{M['grossMargin']}%", 'floor 12%', 'warn'),
                                        ('Schedule adherence', '72%', '-6 pts', 'bad'),
                                        ('Client NPS', '62', '+8', 'ok')]):
        kpi(d, x + i * (cw + gap), y, cw, 84, l, v, dlt, tn)
    y += 100
    c1 = 760
    cy = card(d, x, y, c1, 300, 'Billed vs collected vs cost', 'Rolling 6 months · ₹ in lakhs')
    vals = [v / 1e5 for v in DATA['revenue']]
    bars(d, x + 40, cy + 24, c1 - 80, 160, vals, DATA['months'],
         BRAND, [v * .74 for v in vals])
    for i, lab in enumerate(['Billed', 'Collected']):
        d.rounded_rectangle((x + 40 + i * 110, cy + 212, x + 52 + i * 110, cy + 224), 3,
                            fill=BRAND if i == 0 else '#C7D2E5')
        text(d, (x + 60 + i * 110, cy + 218), lab, 10, C['tx2'], False, 'lm')
    cy2 = card(d, x + c1 + 16, y, 1400 - 16 - (x + c1 + 16), 300, 'Schedule adherence by project', 'Slippage in days')
    projs = [(p['id'].replace('PRJ-', 'P'), max(0, 70 - int(p['progress']))) for p in P[:6]]
    aw = 1400 - 16 - (x + c1 + 16)
    bars(d, x + c1 + 56, cy2 + 36, aw - 80, 150, [v for _, v in projs],
         [n for n, _ in projs], '#2563EB')
    y += 316
    card(d, x, y, 1400 - x - 16, 210, 'Exceptions needing attention', 'Auto-detected from live transactions',
         ['Assign all'])
    exc = [('Cost overrun', 'PRJ-0003 · HVAC subcon 38% over budget', 'bad', '₹42.6 L'),
           ('Billing lag', 'PRJ-0001 · 3 milestones certified, not invoiced', 'warn', '₹18.4 L'),
           ('Snag ageing', 'PRJ-0006 · 12 snags older than 30 days', 'warn', '12 nos'),
           ('Low stock', 'Vitrified tiles 600x600 below reorder level', 'bad', '820 sqft')]
    yy = y + 60
    for kind, desc, tn, amt in exc:
        chip(d, x + 20, yy - 10, kind, tn, 9)
        text(d, (x + 140, yy), desc, 10.5, C['tx2'], False, 'lm')
        text(d, (1400 - 30, yy), amt, 11, C['tx'], True, 'rm')
        yy += 36
    save(img, '11-analytics.png', 1440, 900)


def shot_admin():
    img, d, SB, TB = chrome('Settings', ['Admin', 'Settings'], 'Settings', h=900)
    x, y = SB + 26, TB + 22
    page_head(d, x, y, 'Settings', 'Workspace, approvals, notifications and data controls', ['Audit log'])
    y += 62
    card(d, x, y, 250, 470, None)
    items = ['Company profile', 'Projects & WBS', 'Approvals matrix', 'Notifications',
             'Tax & statutory', 'Data & backup']
    yy = y + 20
    for i, it in enumerate(items):
        if i == 2:
            rr(d, (x + 10, yy - 12, x + 240, yy + 18), 8, fill='#FFF0E8')
        text(d, (x + 24, yy + 3), it, 10.5, BRAND if i == 2 else C['tx2'], i == 2, 'lm')
        yy += 42
    yy += 20
    text(d, (x + 24, yy + 10), 'Workspace plan', 9, C['tx3'], True)
    text(d, (x + 24, yy + 32), 'Enterprise', 13, C['tx'], True)
    text(d, (x + 24, yy + 52), '57 / 100 seats used', 9.5, C['tx3'])
    # approval matrix
    cx = x + 266
    cw = 1400 - cx - 460
    cy = card(d, cx, y, cw, 470, 'Approvals matrix', 'Who signs what, above which value')
    d.line((rx, y, rx, 0), fill=C['line']) if False else None
    cols = [('Document', .30, 'l'), ('Value band', .24, 'l'), ('Approver', .30, 'l'), ('SLA', .16, 'l')]
    appr = [('Purchase order', '₹0 – ₹5 L', 'Project Manager', '24 h'),
            ('Purchase order', '₹5 L – ₹25 L', 'Head of Procurement', '48 h'),
            ('Purchase order', '> ₹25 L', 'Founder / CFO', '72 h'),
            ('Change order', 'Any value', 'Project Director + QS', '48 h'),
            ('Client invoice', '> ₹10 L', 'Finance Controller', '24 h'),
            ('Vendor bill', '> ₹2 L', 'Finance Controller', '24 h'),
            ('Expense claim', '> ₹25,000', 'Reporting Manager', '24 h'),
            ('New vendor', 'Any value', 'Procurement + Compliance', '48 h')]
    rows = [[a, b, c, d_] for a, b, c, d_ in appr]
    table(d, cx, cy + 4, cw, cols, rows, rowh=46, head=True)
    # right rail
    rx = 1400 - 444
    card(d, rx, y, 428, 226, 'Integrations', '12 connected')
    ints = ['Tally Prime', 'Zoho Books', 'WhatsApp Business', 'Google Workspace', 'AutoCAD / Revit',
            'Razorpay', 'DigiLocker / eSign', 'Power BI']
    for i, n in enumerate(ints):
        cx2 = rx + 18 + (i % 2) * 200
        cy2 = y + 62 + (i // 2) * 40
        rr(d, (cx2, cy2, cx2 + 190, cy2 + 32), 8, fill='#FBFBFD', outline=C['line'])
        text(d, (cx2 + 12, cy2 + 16), trunc(d, n, 9.5, 150), 9.5, C['tx2'], False, 'lm')
        d.ellipse((cx2 + 170, cy2 + 13, cx2 + 180, cy2 + 23), fill=C['ok'])
    card(d, rx, y + 242, 428, 228, 'Data & backup', 'Local-first workspace')
    yy = y + 322
    for l, v in [('Last backup', 'Today, 06:30'), ('Storage used', '38.4 MB / 5 GB'),
                 ('Retention', '7 years'), ('Export formats', 'CSV, XLSX, PDF')]:
        text(d, (rx + 18, yy), l, 10, C['tx3'], False, 'lm')
        text(d, (rx + 410, yy), v, 10.5, C['tx'], True, 'rm')
        yy += 34
    save(img, '12-settings.png', 1440, 900)


def shot_docs():
    img, d, SB, TB = chrome('Docs', [], 'Help & Manual', h=900)
    # marketing-ish doc page (single column, no sidebar)
    img = Image.new('RGB', (1440, 900), '#FAF7F3')
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 1440, 74), fill=INK)
    d.rounded_rectangle((40, 22, 62, 44), 6, fill=BRAND)
    text(d, (51, 33), 'M', 13, '#fff', True, 'mm')
    text(d, (72, 30), 'managekaro', 14, '#fff', True)
    for i, (l, x2) in enumerate([('Product', 700), ('Solutions', 790), ('Pricing', 900), ('Docs', 980), ('Download', 1040)]):
        text(d, (x2, 32), l, 11.5, '#FFB68C' if l == 'Docs' else '#C3CAD9', l == 'Docs', 'lm')
    rr(d, (1290, 20, 1400, 48), 8, fill=BRAND)
    text(d, (1345, 34), 'Open app', 11, '#fff', True, 'mm')
    text(d, (80, 120), 'MANAGEKARO USER MANUAL', 10, BRAND, True)
    text(d, (80, 144), 'Everything your company runs on', 30, INK, True)
    text(d, (80, 188), 'A practical, screenshot-led handbook for every department — from site engineers to the founder.', 12, '#59647A')
    # toc
    card(d, 80, 230, 300, 620, 'Contents', '14 chapters')
    toc = ['1. Getting started', '2. Command Centre', '3. Projects & BOQ', '4. Schedule & Gantt',
           '5. Documents', '6. Procurement & stores', '7. Finance & billing', '8. CRM & quotations',
           '9. HRM & payroll', '10. Analytics & Copilot', '11. Admin & masters', '12. Roles',
           '13. Desktop & deployment', '14. Glossary']
    yy = 292
    for i, t in enumerate(toc):
        if i == 2:
            rr(d, (88, yy - 12, 372, yy + 14), 7, fill='#FFF0E8')
            text(d, (100, yy + 1), t, 10.5, BRAND, True, 'lm')
        else:
            text(d, (100, yy + 1), t, 10.5, '#3A4256' if i else '#59647A', False, 'lm')
        yy += 38
    # figure card
    fx, fy = 400, 230
    rr(d, (fx, fy, 1360, fy + 620), 14, fill='#fff', outline='#E7E1D8')
    text(d, (fx + 24, fy + 22), '3. Projects & BOQ', 16, INK, True)
    text(d, (fx + 24, fy + 46), 'Chapter 3 · 6 topics · 4 minutes read', 10, '#8B94A7')
    d.line((fx + 24, fy + 66, 1336, fy + 66), fill='#EEF0F6')
    body = ('Every project is a workspace. Open Projects, then click any row to see its nine tabs: '
            'overview, BOQ and scope, schedule, design, procurement, DPR, snags, billing and documents.')
    yy = fy + 84
    for line in wrap(d, body, 11.5, 880):
        text(d, (fx + 24, yy), line, 11.5, '#3A4256')
        yy += 20
    # embedded figure
    fig = Image.open(os.path.join(SHOTS, '02-projects.png'))
    fig.thumbnail((912, 380))
    img.paste(fig, (fx + 24, yy + 16))
    d.rectangle((fx + 24, yy + 16, fx + 24 + fig.width, yy + 16 + fig.height), outline='#E7E1D8')
    text(d, (fx + 24, yy + 16 + fig.height + 12), 'Figure 3.1 — Projects list with health, progress and value at a glance.', 9, '#8B94A7')
    save(img, '13-user-manual.png', 1440, 900)


def shot_download():
    img = Image.new('RGB', (1440, 900), INK)
    d = ImageDraw.Draw(img)
    for i in range(0, 1440, 4):
        a = int(255 * (1 - i / 1440) * .06)
        d.rectangle((i, 0, i + 4, 900), fill=(242, 84, 11, a) if False else '#0B1220')
    d.ellipse((980, -300, 1660, 380), fill='#141D33')
    d.ellipse((-300, 620, 280, 1200), fill='#131C31')
    d.rounded_rectangle((48, 26, 70, 48), 6, fill=BRAND)
    text(d, (59, 37), 'M', 13, '#fff', True, 'mm')
    text(d, (80, 37), 'managekaro', 14, '#fff', True, 'lm')
    for l, x2 in [('Product', 940), ('Solutions', 1030), ('Pricing', 1140), ('Docs', 1210), ('Download', 1270)]:
        text(d, (x2, 37), l, 11.5, '#fff' if l == 'Download' else '#C3CAD9', l == 'Download', 'lm')
    rr(d, (48, 120, 190, 148), 14, fill='#1D273F')
    text(d, (119, 134), 'DESKTOP APP', 9, '#FFB68C', True, 'mm')
    text(d, (48, 176), 'Download Managekaro', 42, '#fff', True)
    text(d, (48, 232), 'for Windows', 42, '#FF8A3D', True)
    for i, line in enumerate(['One file. Any Windows system — 64-bit and 32-bit, Windows 10, 11',
                              'and Server 2016+. Runs fully offline with your local workspace.',
                              'No installation of runtimes required.']):
        text(d, (48, 300 + i * 24), line, 12, '#9AA5BC')
    # download card
    cx, cy, cw, ch = 48, 400, 700, 300
    rr(d, (cx, cy, cx + cw, cy + ch), 16, fill='#111A2E', outline='#243050')
    for i, lab in enumerate(['Windows 10 / 11', 'Windows 8.1', 'Server 2016+']):
        bw = d.textlength(lab, font=font(10, True)) + 26
        rr(d, (cx + 28 + i * 128, cy + 26, cx + 28 + i * 128 + bw, cy + 54), 13, fill='#1B2540')
        text(d, (cx + 41 + i * 128, cy + 40), lab, 10, '#C0C9DA', True, 'lm')
    text(d, (cx + 28, cy + 84), 'Managekaro Desktop', 16, '#fff', True)
    text(d, (cx + 28, cy + 108), 'Version 1.0.0 · Enterprise build · 0.73 MB', 11, '#8D98AE')
    rr(d, (cx + 28, cy + 140, cx + 280, cy + 186), 10, fill=BRAND)
    text(d, (cx + 154, cy + 163), 'Download .exe', 13, '#fff', True, 'mm')
    rr(d, (cx + 296, cy + 140, cx + 470, cy + 186), 10, fill='#1B2540', outline='#2C3A5C')
    text(d, (cx + 383, cy + 163), 'User manual', 12, '#C7D0E0', True, 'mm')
    for i, (l, v) in enumerate([('FILE', 'Managekaro-Setup-1.0.0.exe'), ('ARCHITECTURE', 'x86 / x64'),
                                ('REQUIREMENTS', '4 GB RAM · 250 MB disk')]):
        bx = cx + 28 + i * 226
        text(d, (bx, cy + 216), l, 8.5, '#6D7893', True)
        text(d, (bx, cy + 234), v, 10.5, '#E6EAF2', True)
    text(d, (cx + 28, cy + 266), 'SHA-256  697b1ca156ca3b2f22cc7989f1c8190289a0d169798c0e659dd2e818852eec14', 9, '#7C86A0', False, 'lm', mono=True)
    # steps
    sx = 800
    text(d, (sx, 400), 'HOW IT WORKS', 9, '#FFB68C', True)
    steps = [('1', 'Download the file', 'Save Managekaro-Setup-1.0.0.exe anywhere.'),
             ('2', 'Run it', 'If SmartScreen appears choose More info → Run anyway.'),
             ('3', 'Browser workspace opens', 'Embedded local server, same ERP, offline.'),
             ('4', 'Your data stays local', 'No cloud dependency, no account required.')]
    yy = 432
    for n, t, s in steps:
        d.ellipse((sx, yy, sx + 30, yy + 30), fill='#1D273F')
        text(d, (sx + 15, yy + 15), n, 11, '#FF8A3D', True, 'mm')
        text(d, (sx + 44, yy + 2), t, 12, '#fff', True)
        text(d, (sx + 44, yy + 20), s, 10.5, '#8D98AE')
        yy += 60
    save(img, '14-download.png', 1440, 900)


def shot_mobile():
    W, H = 420, 900
    img = Image.new('RGB', (W, H), '#F5F6FA')
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 96), fill=INK)
    d.rounded_rectangle((16, 28, 34, 46), 5, fill=BRAND)
    text(d, (25, 37), 'M', 10, '#fff', True, 'mm')
    text(d, (44, 37), 'DPR · Site', 13, '#fff', True, 'lm')
    text(d, (16, 66), 'Amazon BLR8 · Level 4', 10, '#9AA5BC')
    text(d, (W - 16, 66), '02 Nov', 10, '#FFB68C', True, 'rm')
    kpi(d, 16, 112, (W - 44) / 2, 86, 'Progress', '62%', '+3% today', 'ok')
    kpi(d, 16 + (W - 44) / 2 + 12, 112, (W - 44) / 2, 86, 'Manpower', '48', '4 trades', 'blue')
    cy = 206
    card(d, 16, cy, W - 32, 210, 'Today’s work', 'Auto-saved 11:42')
    works = [('Gypsum partition L4 — 1,200 sqft', 'Done'), ('Electrical conduit — 42 pts', 'Done'),
             ('HVAC duct insulation', 'In Progress'), ('False ceiling grid — east wing', 'Pending')]
    yy = cy + 54
    for t, st in works:
        d.ellipse((30, yy + 6, 48, yy + 24), outline=C['tx3'], width=2)
        if st == 'Done':
            d.ellipse((34, yy + 10, 44, yy + 20), fill=C['ok'])
        text(d, (58, yy + 10), trunc(d, t, 9.5, 250), 9.5, C['tx'], False, 'lm')
        chip(d, W - 110, yy + 2, st, tone_for(st), 8.6)
        yy += 36
    cy2 = 432
    card(d, 16, cy2, W - 32, 190, 'Snags raised today', '6 open · 2 critical')
    sn = [('Paint patch — cabin 4', 'Critical'), ('Skirting gap — reception', 'High'),
          ('FCU noise — 4B', 'Medium')]
    yy = cy2 + 66
    for t, pr in sn:
        text(d, (30, yy), trunc(d, t, 9.5, 240), 9.5, C['tx'], False, 'lm')
        chip(d, W - 110, yy - 10, pr, 'bad' if pr == 'Critical' else 'warn', 8.6)
        yy += 42
    cy3 = 638
    card(d, 16, cy3, W - 32, 150, 'Geo-tagged attendance', 'Checked in 09:12 · Site geofence')
    rr(d, (30, cy3 + 58, W - 46, cy3 + 108), 9, fill='#E8F8F1')
    text(d, (W / 2 - 8, cy3 + 83), '✓  Present · 09:12 at BLR8', 10, C['ok'], True, 'mm')
    rr(d, (16, H - 64, W / 2 - 8, H - 20), 9, fill=BRAND)
    text(d, (W / 4 - 10, H - 42), 'Submit DPR', 11, '#fff', True, 'mm')
    rr(d, (W / 2 + 8, H - 64, W - 16, H - 20), 9, fill='#fff', outline=C['line'])
    text(d, (3 * W / 4 - 4, H - 42), 'Raise snag', 11, C['tx2'], True, 'mm')
    save(img, '15-mobile-dpr.png', W, H)


if __name__ == '__main__':
    print('rendering screenshots →', SHOTS)
    for fn in [shot_dashboard, shot_projects, shot_project_detail, shot_schedule, shot_procurement,
               shot_finance, shot_crm, shot_hrm, shot_payroll, shot_copilot, shot_analytics,
               shot_admin, shot_docs, shot_download, shot_mobile]:
        fn()
    print('done.')
