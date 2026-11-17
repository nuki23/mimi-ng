/**
 * Política de rupturas (spec 12, «Rupturas y obsoletos»; M.28): antes de la 1.0.0 no se mantienen
 * obsoletos. Esta prueba falla si en el código de ui-core, de la CLI o del sitio queda algo
 * marcado como obsoleto («@deprecated», «hasta la 1.0», «se quita en la 1.0»…) o alguno de los
 * nombres que la 0.8.0 quitó (los de la 0.1.0). Así la puerta del grupo no depende de un grep a
 * mano. Desde la 1.0.0, `@deprecated` vuelve a estar permitido: esta prueba se cambia entonces.
 *
 * Las pruebas corren en Node (Vitest): se lee con fs sin importarlo (ver imports.spec.ts). Todo va
 * dentro del `describe`: las pruebas sin `import` comparten el ámbito global y los nombres
 * chocarían con los de imports.spec.ts o focus-styles.spec.ts.
 */
describe('sin obsoletos antes de la 1.0 (M.28)', () => {
  interface Node {
    cwd(): string;
    getBuiltinModule(id: string): unknown;
  }
  interface Fs {
    readdirSync(
      path: string,
      options: { withFileTypes: true },
    ): { name: string; isDirectory(): boolean }[];
    readFileSync(path: string, encoding: 'utf8'): string;
  }
  interface Path {
    join(...parts: string[]): string;
    relative(from: string, to: string): string;
  }

  const node = (globalThis as unknown as { process: Node }).process;
  const fs = node.getBuiltinModule('node:fs') as Fs;
  const path = node.getBuiltinModule('node:path') as Path;

  const cwd = node.cwd();
  const roots = [
    path.join(cwd, 'packages', 'ui-core', 'src'),
    path.join(cwd, 'packages', 'cli', 'src'),
    path.join(cwd, 'apps', 'docs', 'src'),
  ];
  const extensions = ['.ts', '.html', '.css', '.json'];
  const self = 'packages/ui-core/src/lib/no-deprecated.spec.ts';

  // Las expresiones se arman por partes; este archivo, además, no se revisa (nombra lo que busca).
  const one = String.raw`1\.0`;
  const markers: [string, RegExp][] = [
    ['@deprecated', new RegExp('@' + 'deprecated')],
    ['«hasta la 1.0»', new RegExp(String.raw`hasta\s+la\s+` + one, 'i')],
    ['«se quita(n) en la 1.0»', new RegExp(String.raw`se\s+quitan?\s+en\s+la\s+` + one, 'i')],
    ['«en la 1.0 pasa»', new RegExp(String.raw`en\s+la\s+` + one + String.raw`\s+pasa`, 'i')],
  ];

  /** Nombres que quitó la M.28 (0.8.0): no deben volver. */
  const removed: [string, RegExp][] = [
    ['destructive-soft-bg', new RegExp('destructive-soft' + '-bg')],
    ['--mimi-btn-padding-x', new RegExp('mimi-btn-padding' + '-x')],
    ['--mimi-input-padding-x', new RegExp('mimi-input-padding' + '-x')],
    ['--mimi-input-placeholder-color', new RegExp('mimi-input-placeholder' + '-color')],
    ['paddingX', new RegExp(String.raw`\bpadding` + String.raw`X\b`)],
    ['placeholderColor', new RegExp(String.raw`\bplaceholder` + String.raw`Color\b`)],
    ['ButtonVariantShortcut / BadgeVariantShortcut', new RegExp('VariantShort' + 'cut')],
    ['ButtonStyleVariant / BadgeStyleVariant', new RegExp('(Button|Badge)Style' + 'Variant')],
    ['"vivid"', new RegExp('viv' + 'id', 'i')],
  ];

  /** Excepciones, con su motivo: ruta relativa a la raíz del repo (con «/») → nombres permitidos. */
  const exceptions: Record<string, { names: string[]; reason: string }> = {
    'packages/ui-core/src/lib/theme/provider.spec.ts': {
      names: ['paddingX', 'placeholderColor'],
      reason: 'prueba con @ts-expect-error que el tipo del preset ya no los acepta',
    },
    'packages/cli/src/ui.spec.ts': {
      names: ['"vivid"'],
      reason: 'prueba que `ng g mimi` corrige el "vivid" de un mimi.json de la 0.1.0',
    },
    'packages/cli/src/ui/index.ts': {
      names: ['"vivid"'],
      reason: 'la corrección de "vivid" → "mimi" al reescribir mimi.json',
    },
  };

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
      return extensions.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
    });

  const all = roots
    .flatMap(walk)
    .map((full) => ({
      rel: path.relative(cwd, full).replaceAll('\\', '/'),
      text: fs.readFileSync(full, 'utf8'),
    }))
    .filter((f) => f.rel !== self);

  it('encuentra los archivos de ui-core, de la CLI y del sitio', () => {
    const rels = all.map((f) => f.rel);
    expect(rels).toContain('packages/ui-core/src/lib/components/button/button.ts');
    expect(rels).toContain('packages/ui-core/src/lib/theme/theme-base.css');
    expect(rels).toContain('packages/cli/src/ui/index.ts');
    expect(rels).toContain('apps/docs/src/app/pages/docs/foundations-page.html');
  });

  it('nada marcado como obsoleto ni como «hasta la 1.0»', () => {
    const found = all.flatMap(({ rel, text }) =>
      markers.filter(([, re]) => re.test(text)).map(([name]) => `${rel}: ${name}`),
    );
    expect(found).toEqual([]);
  });

  it('no vuelven los nombres de la 0.1.0 que quitó la 0.8.0', () => {
    const found = all.flatMap(({ rel, text }) =>
      removed
        .filter(([name, re]) => re.test(text) && !exceptions[rel]?.names.includes(name))
        .map(([name]) => `${rel}: ${name}`),
    );
    expect(found).toEqual([]);
  });

  it('cada excepción tiene motivo y todavía hace falta', () => {
    for (const [rel, { names, reason }] of Object.entries(exceptions)) {
      expect(reason.length, rel).toBeGreaterThan(10);
      const text = all.find((f) => f.rel === rel)?.text ?? '';
      for (const name of names) {
        const re = removed.find(([n]) => n === name)![1];
        expect(re.test(text), `${rel}: ${name}`).toBe(true);
      }
    }
  });
});
