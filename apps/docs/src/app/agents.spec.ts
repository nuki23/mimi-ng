/**
 * Los subagentes del repo (`.claude/agents/`, tanda 2 de la 0.7.0): `revisor` y `accesibilidad`.
 * Los dos solo informan (no cambian código): no pueden tener `Edit` ni `NotebookEdit`, y su
 * texto dice que no tocan el repo. `CLAUDE.md` dice cuándo usarlos.
 *
 * Se leen con fs sin importarlo, como en commands.spec.ts.
 */
interface NodeFs {
  readFileSync(path: string, encoding: 'utf8'): string;
}
interface NodePath {
  join(...parts: string[]): string;
}
declare const process: { cwd(): string; getBuiltinModule(id: string): unknown };

const fs = process.getBuiltinModule('node:fs') as NodeFs;
const path = process.getBuiltinModule('node:path') as NodePath;

const AGENTS = path.join(process.cwd(), '.claude', 'agents');

function frontmatter(text: string): Record<string, string> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!block) return {};
  return Object.fromEntries(
    block[1]
      .split(/\r?\n/)
      .map((line) => /^(\w+):\s*(.*)$/.exec(line))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => [m[1], m[2].trim()]),
  );
}

describe('subagentes del repo', () => {
  for (const [name, musts] of [
    [
      'revisor',
      ['cerrar-grupo.md', 'Playwright', 'A1–A10', 'privacidad', 'plantilla', 'presupuestos'],
    ],
    ['accesibilidad', ['APG', 'Playwright', 'teclado', 'foco', 'contraste', 'anuncios']],
  ] as const) {
    describe(name, () => {
      const text = fs.readFileSync(path.join(AGENTS, `${name}.md`), 'utf8');
      const meta = frontmatter(text);

      it('tiene nombre, descripción y herramientas', () => {
        expect(meta['name']).toBe(name);
        expect(meta['description']?.length).toBeGreaterThan(40);
        expect(meta['tools']).toBeTruthy();
      });

      it('solo informa: sin Edit y con la regla escrita', () => {
        const tools = meta['tools'].split(',').map((t) => t.trim());
        expect(tools).not.toContain('Edit');
        expect(tools).not.toContain('NotebookEdit');
        expect(text).toContain('No cambias nada del repo');
        expect(text).toContain('fuera del repo');
      });

      it('cubre su lista y pone límites de tiempo', () => {
        for (const must of musts) expect(text.toLowerCase()).toContain(must.toLowerCase());
        expect(text).toContain('A9');
        expect(text).toContain('netstat');
        expect(text).toContain('NO COMPROBADO');
      });
    });
  }

  it('CLAUDE.md dice cuándo usar subagentes', () => {
    const claude = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf8');
    const section = claude.slice(claude.indexOf('**Cuándo usar subagentes**'));
    expect(section.length).toBeGreaterThan(100);
    for (const must of [
      '.claude/agents/',
      '`revisor`',
      '`accesibilidad`',
      'revisión independiente',
      'repetitivo e independiente',
      'decisiones de diseño o de arquitectura',
      'tareas encadenadas',
    ]) {
      expect(section).toContain(must);
    }
  });
});
