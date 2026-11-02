# Managekaro — documentation assets

| File | What it is |
|---|---|
| `shots/*.png` | The product figures used by the printable user book (`downloads/Managekaro-User-Book-1.0.pdf`) and the in-app manual at `#/docs`. |
| `../assets/img/shots/*.png` | The same figures, served by the app itself. |
| `../downloads/Managekaro-User-Book-1.0.pdf` | The full user book: 36 pages, 14 chapters, 71 topics, 16 figures. |
| `../tools/manual/` | The pipeline that produces them: `extract.js` (live seeded data → `data.json`), `render.py` (figures), `book.py` (PDF). |

Regenerate after changing the app:

```bash
node tools/manual/extract.js     # pull live data out of the app
python3 tools/manual/render.py   # redraw the figures
python3 tools/manual/book.py     # rebuild the PDF
```

The in-app manual lives in `assets/js/modules/help.js` (chapters) and
`assets/js/modules/manual.js` (long-form sections).
