// Genera apps/docs/public/og-image.png (1200×630), la imagen que se ve al compartir el sitio
// (og:image en apps/docs/src/index.html). La pinta un navegador desde una página HTML con la
// fuente del sitio (Outfit): fondo #17161D, el logo horizontal oscuro de docs/brand/ a la
// izquierda y, debajo, el lema en #FAF9FF.
//
// Playwright no es dependencia del repo. Uso (con playwright-core instalado fuera, y Chrome):
//   PLAYWRIGHT_CORE=file:///ruta/node_modules/playwright-core/index.mjs \
//   CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
//   node apps/docs/scripts/og-image.mjs
// Necesita red: Outfit se carga de Google Fonts, como en el sitio.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const out = join(here, '..', 'public', 'og-image.png');
const logo = readFileSync(join(root, 'docs', 'brand', 'mimi-logo-horizontal-dark.svg'), 'utf8');

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=block" />
    <style>
      html, body { margin: 0; width: 1200px; height: 630px; background: #17161D; }
      body {
        box-sizing: border-box; padding: 0 96px;
        display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
        gap: 56px; font-family: 'Outfit', sans-serif;
      }
      .logo svg { display: block; width: auto; height: 150px; }
      p {
        margin: 0; max-width: 960px; color: #FAF9FF;
        font-size: 60px; font-weight: 700; line-height: 1.1; letter-spacing: -0.03em;
      }
    </style>
  </head>
  <body>
    <div class="logo">${logo}</div>
    <p>Los componentes son tuyos.<br />Las actualizaciones también.</p>
  </body>
</html>`;

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? 'playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 60_000 });
  const outfit = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check("700 60px 'Outfit'");
  });
  if (!outfit) throw new Error('No cargó Outfit: la imagen saldría con otra fuente.');
  await page.screenshot({ path: out, type: 'png' });
  console.log(`og-image.png: ${out}`);
} finally {
  await browser.close();
}
