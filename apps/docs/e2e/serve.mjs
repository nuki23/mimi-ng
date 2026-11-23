// Servidor estático del sitio compilado, para las pruebas de Playwright (sin dependencias).
// Devuelve index.html para las rutas de la SPA, como Cloudflare con `not_found_handling`.
// Uso: node apps/docs/e2e/serve.mjs [carpeta] [puerto]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist/docs/browser');
const port = Number(process.argv[3] ?? 4310);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`No hay ${path.join(root, 'index.html')}: compila antes con «pnpm build:docs».`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) file = path.join(root, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const index = path.join(file, 'index.html');
      file = fs.existsSync(index) ? index : path.join(root, 'index.html');
    }
    res.writeHead(200, {
      'content-type': types[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => console.log(`Sitio en http://127.0.0.1:${port}`));
