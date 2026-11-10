/**
 * R.24, «uso corto por defecto»: el bloque «Uso» de cada página de componente (lo primero que ve
 * quien llega) tiene una plantilla de pocas líneas. Si una página crece, o se rediseña el uso o se
 * anota aquí por qué. Las pruebas corren en Node: se leen los archivos con fs (ver commands.spec.ts).
 */
const usageNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const usageFs = usageNode.getBuiltinModule('node:fs') as {
  readdirSync(p: string): string[];
  existsSync(p: string): boolean;
  readFileSync(p: string, e: 'utf8'): string;
};
const ROOT = `${usageNode.cwd()}/apps/docs/src/app/pages/docs/components/`;

/** Páginas que se usan con un servicio (`toast.success('…')`, `confirm.open(…)`): sin plantilla. */
const SERVICE_ONLY = new Set(['toast', 'confirm']);
/** Tope de líneas de la plantilla del bloque «Uso». */
const MAX_LINES = 12;
/** Con su razón, las que lo pasan: Dialog en plantilla (un formulario completo; con el servicio son 1). */
const EXCEPTIONS: Record<string, number> = { dialog: 14 };

function templateLines(page: string): number | null {
  const src = usageFs.readFileSync(page, 'utf8');
  const m = /usage(?:Template)?\s*=\s*\[([\s\S]*?)\]\.join/.exec(src);
  if (!m) return null;
  const lines = [...m[1].matchAll(/^\s*(['"`])([\s\S]*?)\1,?\s*$/gm)].map((x) => x[2]);
  if (lines.some((l) => /template:\s*`[^`]+`/.test(l))) return 1;
  const start = lines.findIndex((l) => /template:\s*`\s*$/.test(l));
  const end = lines.findIndex((l, i) => i > start && /^\s*`,?\s*$/.test(l));
  return start >= 0 && end > start ? end - start - 1 : null;
}

describe('Uso corto en las páginas de componentes (R.24)', () => {
  const pages = usageFs
    .readdirSync(ROOT)
    .filter((dir) => usageFs.existsSync(`${ROOT}${dir}/${dir}-page.ts`));

  it('hay páginas que medir', () => {
    expect(pages.length).toBeGreaterThan(30);
  });

  for (const dir of pages) {
    if (SERVICE_ONLY.has(dir)) continue;
    it(`${dir}: la plantilla del bloque «Uso» cabe en ${EXCEPTIONS[dir] ?? MAX_LINES} líneas`, () => {
      const lines = templateLines(`${ROOT}${dir}/${dir}-page.ts`);
      expect(lines, 'no se encontró la plantilla del bloque «Uso»').not.toBeNull();
      expect(lines!).toBeLessThanOrEqual(EXCEPTIONS[dir] ?? MAX_LINES);
    });
  }
});
