// 零依赖静态服务器：node server.mjs [--open] [--port 4173]
// 项目使用原生 ES Module，必须通过 http 打开（file:// 会被浏览器的模块跨域策略拦住）。
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { exec } from 'node:child_process';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const portArg = argv.indexOf('--port');
const PORT = Number(portArg >= 0 ? argv[portArg + 1] : process.env.PORT || 4173);
const OPEN = argv.includes('--open');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const p = normalize(join(ROOT, decoded)).replace(/[\\/]+$/, '');
  if (p !== ROOT && !p.startsWith(ROOT + sep)) return null;
  return p;
}

const server = createServer(async (req, res) => {
  let filePath = safePath(req.url === '/' ? '/index.html' : req.url);
  if (!filePath) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath);
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(body);
  } catch {
    // 无扩展名的路径回退到入口页（方便以后接路由）
    if (!extname(filePath)) {
      try {
        const body = await readFile(join(ROOT, 'index.html'));
        res.writeHead(200, { 'Content-Type': MIME['.html'] }).end(body);
        return;
      } catch { /* ignore */ }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，试试： node server.mjs --port ${PORT + 1}`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`\n  残响学园 · DEMO 已启动\n  ${url}\n  按 Ctrl+C 停止\n`);
  if (OPEN && process.platform === 'win32') exec(`start "" "${url}"`);
});
