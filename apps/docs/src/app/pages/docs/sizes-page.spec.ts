import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../code/highlighter.service';
import { SIZE_COMPONENTS, SIZE_SCALE, SizesPage } from './sizes-page';

const sizesNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const sizesFs = sizesNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const CSS = sizesFs.readFileSync(
  `${sizesNode.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
  'utf8',
);

/** El cuerpo de un bloque de la escala del tema. */
function block(selector: string): string {
  const start = CSS.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return CSS.slice(start, CSS.indexOf('\n}', start));
}

/** El valor de una variable, con el respaldo final de `var(--x, respaldo)` si lo tiene. */
function value(body: string, name: string): string {
  const raw = new RegExp(`--mimi-${name}:\\s*([^;]+);`).exec(body)?.[1].trim() ?? '';
  const fallback = /^var\([^,]+,\s*(.+)\)$/.exec(raw);
  return fallback ? fallback[1].trim() : raw;
}

describe('página de Tamaños', () => {
  it('la receta de «una zona» se apoya en el tema: cada [data-size] recalcula desde el token', () => {
    // Lo que documenta la página: con data-size en el contenedor, el token de la zona llega.
    expect(block(":root,\n[data-size='md']")).toMatch(/--mimi-btn-h:\s*var\(--mimi-btn-height,/);
    expect(block("[data-size='sm']")).toMatch(/--mimi-btn-h:\s*var\(--mimi-btn-height-sm,/);
    expect(block("[data-size='lg']")).toMatch(/--mimi-btn-h:\s*var\(--mimi-btn-height-lg,/);
  });

  it('la escala que muestra es la del tema', () => {
    const blocks = {
      sm: block("[data-size='sm']"),
      md: block(":root,\n[data-size='md']"),
      lg: block("[data-size='lg']"),
    };
    for (const row of SIZE_SCALE) {
      for (const size of ['sm', 'md', 'lg'] as const) {
        expect(value(blocks[size], row.variable), `${row.variable} ${size}`).toBe(row[size]);
      }
    }
  });

  it('pinta las dos tablas y la demostración en los tres tamaños', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SizesPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-test="scale"] tbody tr').length).toBe(SIZE_SCALE.length);
    expect(el.querySelectorAll('[data-test="components"] tbody tr').length).toBe(
      SIZE_COMPONENTS.length,
    );
    for (const size of ['sm', 'md', 'lg']) {
      const row = el.querySelector(`[data-test="demo-${size}"]`)!;
      expect(row.getAttribute('data-size')).toBe(size);
      // Los controles de dentro no escriben data-size: lo heredan del contenedor.
      expect(row.querySelector('button')!.hasAttribute('data-size')).toBe(false);
    }
  });

  it('la tabla de la spec 4 (R.26) tiene cada fila de la página, palabra por palabra', () => {
    const spec = sizesFs.readFileSync(`${sizesNode.cwd()}/docs/spec.md`, 'utf8');
    const start = spec.indexOf('### Tamaños: qué cambia en cada componente');
    expect(start).toBeGreaterThan(-1);
    const section = spec.slice(start, spec.indexOf('\n### ', start + 10));
    const rows = section
      .split('\n')
      .filter((line) => line.startsWith('| ') && !line.startsWith('| ---'))
      .slice(1)
      .map((line) => line.split('|').map((cell) => cell.trim()));
    expect(rows.map((cells) => [cells[1], cells[2]])).toEqual(
      SIZE_COMPONENTS.map((row) => [row.component, row.changes]),
    );
  });
});
