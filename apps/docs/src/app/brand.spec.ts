/**
 * R.25: la marca del sitio. Las copias de docs/brand/ en apps/docs/public, las etiquetas de
 * index.html (iconos, theme-color, Open Graph) y el logo de la cabecera y del menú móvil, uno por
 * tema. Lee los archivos con fs, como public-files.spec.ts (sin imports: ver su comentario).
 */
const brandNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const brandFs = brandNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding?: 'utf8'): string & Uint8Array;
};
const BRAND_DOCS = `${brandNode.cwd()}/apps/docs`;
const brandText = (file: string) => brandFs.readFileSync(`${BRAND_DOCS}/${file}`, 'utf8');

describe('marca del sitio (R.25)', () => {
  it('public tiene las copias de docs/brand/ que usa el sitio, idénticas', () => {
    const copies: Record<string, string> = {
      'favicon.svg': 'mimi-symbol.svg',
      'favicon.ico': 'favicon.ico',
      'apple-touch-icon.png': 'icon-180.png',
      'mimi-logo-horizontal.svg': 'mimi-logo-horizontal.svg',
      'mimi-logo-horizontal-dark.svg': 'mimi-logo-horizontal-dark.svg',
    };
    for (const [copy, source] of Object.entries(copies)) {
      const a = brandFs.readFileSync(`${BRAND_DOCS}/public/${copy}`);
      const b = brandFs.readFileSync(`${brandNode.cwd()}/docs/brand/${source}`);
      expect(a.length, copy).toBe(b.length);
      expect(
        a.every((byte, i) => byte === b[i]),
        copy,
      ).toBe(true);
    }
  });

  it('og-image.png mide 1200×630', () => {
    const png = brandFs.readFileSync(`${BRAND_DOCS}/public/og-image.png`);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([1200, 630]);
  });

  it('index.html: iconos, theme-color por esquema y Open Graph', () => {
    const html = brandText('src/index.html');
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="favicon.svg" />');
    expect(html).toContain('<link rel="icon" href="favicon.ico"');
    expect(html).toContain('<link rel="apple-touch-icon" href="apple-touch-icon.png" />');
    expect(html).toMatch(
      /name="theme-color" content="#793EEA" media="\(prefers-color-scheme: light\)"/,
    );
    expect(html).toMatch(
      /name="theme-color" content="#17161D" media="\(prefers-color-scheme: dark\)"/,
    );
    for (const tag of ['og:image', 'og:title', 'og:description']) {
      expect(html, tag).toContain(`property="${tag}"`);
    }
    expect(html).toContain('content="https://ng.mimiworks.dev/og-image.png"');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it('cabecera y menú móvil: el logo de cada tema, con alt «Mimi»', () => {
    for (const file of ['src/app/layout/site-header.html', 'src/app/layout/mobile-nav.html']) {
      const html = brandText(file).replace(/\s+/g, ' ');
      expect(html, file).toMatch(/src="mimi-logo-horizontal\.svg" alt="Mimi"[^>]*dark:hidden/);
      expect(html, file).toMatch(
        /src="mimi-logo-horizontal-dark\.svg" alt="Mimi"[^>]*hidden h-9 w-auto dark:block/,
      );
    }
  });
});
