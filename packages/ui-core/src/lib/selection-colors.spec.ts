/**
 * Colores de selección, arrastre y acento (decidido por el usuario, 12/11/2026): el azul de `info`
 * se queda solo en los avisos informativos (Alert, Toast, Badge…). Donde significa «elegido»,
 * «encima» o «cuenta», va el violeta de la marca: `ring`, `primary-subtle` y `primary`. Tree
 * elige con fondo `primary-subtle` y texto `primary`; el anillo es solo del foco de teclado. Lee
 * los archivos con fs, como imports.spec.ts.
 */
const selectionNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const selectionFs = selectionNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
const SELECTION_LIB = `${selectionNode.cwd()}/packages/ui-core/src/lib`;
const selectionSource = (file: string) =>
  selectionFs.readFileSync(`${SELECTION_LIB}/${file}`, 'utf8');

/** `info` como clase (`bg-info`, `text-info-soft-foreground`…) o como variable. */
const INFO_USE = /(?:\b(?:bg|text|border|ring|shadow|fill|stroke)-info\b|--mimi-info\b|glow-info)/;

/** Archivo → los usos de `info` que sí son un aviso o una categoría (no selección). */
const SELECTION_FILES: Record<string, RegExp[]> = {
  'components/toolbar/toolbar.ts': [],
  'components/tree/tree.ts': [],
  'components/data-table/data-table.ts': [],
  'components/tabs/tabs.ts': [],
  'components/option-list/option-list.ts': [],
  // El tono del ícono de una imagen en la lista de archivos es una categoría, no una selección.
  'components/file-upload/file-upload.ts': [/tone: 'bg-info-soft text-info-soft-foreground'/],
};

describe('Colores de selección, arrastre y acento', () => {
  for (const [file, allowed] of Object.entries(SELECTION_FILES)) {
    it(`${file}: sin info salvo avisos o categorías`, () => {
      const lines = selectionSource(file)
        .split('\n')
        .filter((line) => INFO_USE.test(line) && !line.trim().startsWith('//'))
        .filter((line) => !allowed.some((ok) => ok.test(line)));
      expect(lines).toEqual([]);
    });
  }

  it('los tokens de soltar en File Upload son de la marca, en claro y oscuro', () => {
    const css = selectionSource('theme/theme-base.css');
    expect(css.match(/--mimi-dropzone-active: var\(--mimi-primary-subtle\);/g)?.length).toBe(2);
    expect(css.match(/--mimi-dropzone-active-border: var\(--mimi-ring\);/g)?.length).toBe(2);
  });

  it('Tree: elegido con primary-subtle y texto primary; el anillo, solo con focus-visible', () => {
    const tree = selectionSource('components/tree/tree.ts');
    expect(tree).toContain(
      'data-[selected]:bg-[color:var(--mimi-tree-selected,var(--mimi-primary-subtle))]',
    );
    expect(tree).toContain(
      'data-[selected]:text-[color:var(--mimi-tree-selected-fg,var(--mimi-primary))]',
    );
    expect(tree).not.toMatch(/data-\[selected\]:(?:ring|shadow|outline)/);
    expect(tree).toContain('focus-visible:shadow-[inset_0_0_0_2px_var(--mimi-ring)]');
  });
});
