/**
 * Profundidad B al hacer clic (decidida por el usuario el 13/11/2026; sustituye a la A del
 * 12/11/2026): TODOS los controles se hunden y les crece el halo, como a Button, también los de
 * escribir. Con «reducir movimiento», nada se hunde: el tema pone `--mimi-press-scale` y `-sm` a 1,
 * así que ningún hundimiento puede usar una escala fija. Lee los archivos con fs, como
 * imports.spec.ts.
 */
const depthNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const depthFs = depthNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
const DEPTH_LIB = `${depthNode.cwd()}/packages/ui-core/src/lib`;
const depthRead = (file: string) => depthFs.readFileSync(`${DEPTH_LIB}/${file}`, 'utf8');

/** El valor de una constante exportada de field-styles.ts (un solo literal). */
function depthConstant(name: string): string {
  const match = new RegExp(`export const ${name} =\\s*'([^']*)'`).exec(
    depthRead('utils/field-styles.ts'),
  );
  if (!match) throw new Error(`${name} no está en field-styles.ts`);
  return match[1];
}

// `active:` o, en la caja del Select (el botón está dentro), `has-[[role=combobox]:active]:`.
const DEPTH_SINK = /active\]?:scale-\(--mimi-press-scale(-sm)?\)/;
const DEPTH_HALO = /active\]?:ring-(3|\[length:var\(--mimi-input-focus-ring-width,3px\)\])/;

const FIELD_PIECES = [
  'fieldBoxStyles',
  'fieldNativeStyles',
  'fieldTriggerStyles',
  'fieldTriggerBoxStyles',
  'choicePressStyles',
];

describe('Profundidad B al hacer clic', () => {
  it('todas las piezas de campo se hunden y les crece el halo, también las de escribir', () => {
    for (const name of FIELD_PIECES) {
      const classes = depthConstant(name);
      expect(classes, name).toMatch(DEPTH_SINK);
      expect(classes, name).toMatch(DEPTH_HALO);
    }
    // Las de escribir llevan la escala de Button (no la pequeña de Checkbox y Switch).
    for (const name of ['fieldBoxStyles', 'fieldNativeStyles']) {
      expect(depthConstant(name), name).toContain('active:scale-(--mimi-press-scale)');
      // La transición anima `scale` (spec 6.6): sin ella, el hundimiento sería un salto.
      expect(depthConstant(name), name).toContain('mimi-transition');
    }
    // La zona de File Upload y los ítems de Toggle Group, con sus propias clases.
    for (const file of [
      'components/file-upload/file-upload.ts',
      'components/toggle-group/toggle-group.ts',
    ]) {
      const code = depthRead(file);
      expect(code, file).toMatch(DEPTH_SINK);
      expect(code, file).toMatch(DEPTH_HALO);
    }
  });

  it('Number Input: la caja se hunde entera (número, − y +) y los botones no se hunden aparte', () => {
    const code = depthRead('components/number-input/number-input.ts');
    expect(code).toContain('fieldBoxStyles');
    expect(code).not.toMatch(/active:scale/);
  });

  it('en solo lectura y deshabilitado no hay clic', () => {
    expect(depthConstant('fieldTriggerStyles')).toContain('not-disabled:not-aria-readonly:active:');
    expect(depthConstant('fieldBoxStyles')).toContain(
      'not-data-[disabled]:not-data-[readonly]:active:scale',
    );
    expect(depthConstant('fieldNativeStyles')).toContain(
      'not-disabled:not-[[readonly]]:active:scale',
    );
    expect(depthConstant('choicePressStyles')).toContain('not-disabled:not-aria-readonly:active:');
  });

  it('«reducir movimiento»: las escalas al presionar son tokens que el tema pone a 1', () => {
    const theme = depthRead('theme/theme-base.css');
    const reduce = theme.slice(theme.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduce).toMatch(/--mimi-press-scale:\s*1;/);
    expect(reduce).toMatch(/--mimi-press-scale-sm:\s*1;/);
    // Ningún hundimiento al hacer clic con una escala fija.
    for (const file of [
      'utils/field-styles.ts',
      'utils/control-styles.ts',
      'components/file-upload/file-upload.ts',
      'components/toggle-group/toggle-group.ts',
      'components/button/button.variants.ts',
      'components/number-input/number-input.ts',
    ]) {
      expect(depthRead(file), file).not.toMatch(/active:scale-\[\d|active:scale-\d/);
    }
  });
});
