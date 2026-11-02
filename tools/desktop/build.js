/* Managekaro — Windows desktop build.
 *
 * 1. compiles tools/desktop/launcher.c with Zig (mingw target, x86_64 Windows)
 * 2. appends every web asset as a tiny archive so the EXE runs fully offline
 * 3. writes downloads/Managekaro-Setup-1.0.0.exe + .sha256
 *
 * Usage: node tools/desktop/build.js [--no-compile]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'downloads');
const EXE = path.join(OUT_DIR, 'Managekaro-Setup-1.0.0.exe');
const EXE32 = path.join(OUT_DIR, 'Managekaro-Setup-1.0.0-x86.exe');
const ZIG = process.env.ZIG || '/tmp/zigpkg/ziglang/zig';

const INCLUDE = ['index.html', '404.html', 'manifest.webmanifest', 'assets', 'brand',
                 'downloads/Managekaro-User-Book-1.0.pdf'];
const SKIP = new Set(['.DS_Store', 'Thumbs.db']);

function walk(rel, acc) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const st = fs.statSync(abs);
  if (st.isDirectory()) {
    // skip heavy download artefacts and the archive itself
    for (const name of fs.readdirSync(abs)) {
      if (SKIP.has(name)) continue;
      // never embed the installers themselves
      if (rel === 'downloads' && name.endsWith('.exe')) continue;
      walk(path.join(rel, name), acc);
    }
  } else if (st.isFile()) {
    acc.push(rel.split(path.sep).join('/'));
  }
}

function buildArchive() {
  const files = [];
  INCLUDE.forEach(p => walk(p, files));
  const parts = [];
  let total = 0;
  for (const rel of files.sort()) {
    const name = Buffer.from(rel, 'utf8');
    const data = fs.readFileSync(path.join(ROOT, rel));
    const head = Buffer.alloc(8);
    head.writeUInt32LE(name.length, 0);
    head.writeUInt32LE(data.length, 4);
    parts.push(head, name, data);
    total += 8 + name.length + data.length;
  }
  const trailer = Buffer.alloc(8);
  trailer.write('MKAP', 0, 'ascii');
  trailer.writeUInt32LE(total, 4);
  parts.push(trailer);
  console.log(`archive: ${files.length} files, ${(total / 1024).toFixed(0)} KB`);
  return Buffer.concat(parts);
}

function compileLauncher(target, tmpExe) {
  const c = path.join(__dirname, 'launcher.c');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  execFileSync(ZIG, [
    'cc', '-target', target, '-O2', '-s',
    '-o', tmpExe, c,
    '-lws2_32', '-lshell32'
  ], { stdio: 'inherit' });
  console.log(`compiled launcher (${target}):`, (fs.statSync(tmpExe).size / 1024).toFixed(0), 'KB');
  return fs.readFileSync(tmpExe);
}

function writeExe(exePath, stub, archive) {
  const exe = Buffer.concat([stub, archive]);
  fs.writeFileSync(exePath, exe);
  const sha = crypto.createHash('sha256').update(exe).digest('hex');
  fs.writeFileSync(exePath + '.sha256', `${sha}  ${path.basename(exePath)}\n`);
  console.log(`built ${path.basename(exePath)} — ${(exe.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('  sha256', sha);
  return sha;
}

function main() {
  const skipCompile = process.argv.includes('--no-compile');
  const archive = buildArchive();
  const tmp64 = path.join(OUT_DIR, '.launcher.x64.tmp.exe');
  const tmp32 = path.join(OUT_DIR, '.launcher.x86.tmp.exe');

  let stub = skipCompile && fs.existsSync(tmp64) ? fs.readFileSync(tmp64) : compileLauncher('x86_64-windows-gnu', tmp64);
  writeExe(EXE, stub, archive);

  if (!process.argv.includes('--64-only')) {
    const stub32 = skipCompile && fs.existsSync(tmp32) ? fs.readFileSync(tmp32) : compileLauncher('x86-windows-gnu', tmp32);
    writeExe(EXE32, stub32, archive);
  }
  try { fs.unlinkSync(tmp64); } catch (e) {}
  try { fs.unlinkSync(tmp32); } catch (e) {}
  console.log('done.');
}

main();
