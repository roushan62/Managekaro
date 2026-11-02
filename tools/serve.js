/* Managekaro — zero-dependency static dev server (mirrors the Vercel config). */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.csv': 'text/csv; charset=utf-8',
  '.sha256': 'text/plain; charset=utf-8',
  '.zip': 'application/zip'
};

function fileFor(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const abs = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!abs.startsWith(ROOT)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  if (fs.existsSync(abs + '.html')) return abs + '.html';
  if (fs.existsSync(path.join(abs, 'index.html'))) return path.join(abs, 'index.html');
  return null;
}

const server = http.createServer((req, res) => {
  // Clean-URL routes served by the single-page app.
  const clean = ['/download', '/app', '/login', '/docs', '/pricing', '/product', '/solutions', '/brand'];
  const base = req.url.split('?')[0];
  let file = fileFor(req.url) || (clean.includes(base) ? path.join(ROOT, 'index.html') : null);

  if (!file) {
    // SPA fallback
    const notFound = path.join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : '<h1>404 — Not found</h1>');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  if (ext === '.exe' || ext === '.zip' || ext === '.pdf') {
    headers['Content-Disposition'] = 'attachment; filename="' + path.basename(file) + '"';
  }
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Managekaro running →  http://localhost:${PORT}`);
  console.log(`Serving ${ROOT} (host ${HOST})`);
});
