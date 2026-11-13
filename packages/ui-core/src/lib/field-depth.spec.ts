/**
 * Profundidad A al hacer clic (decidida por el usuario el 12/11/2026): a todos les crece el halo,
 * como a Button; se hunden solo los controles que funcionan como botón; los de escribir no. Con
 * «reducir movimiento», nada se hunde: el tema pone `--mimi-press-scale` y `-sm` a 1, así que
 * ningún hundimiento puede usar una escala fija. Lee los archivos con fs, como imports.spec.ts.
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

describe('Profundidad A al hacer clic', () => {
  it('los campos de escribir no se hunden; les crece el halo', () => {
    for (const name of ['fieldBoxStyles', 'fieldNativeStyles']) {
      const classes = depthConstant(name);
      expect(classes, name).not.toMatch(/active:scale/);
      expect(classes, name).toMatch(DEPTH_HALO);
    }
  });

  it('los que funcionan como botón se hunden y les crece el halo', () => {
    for (const name of ['fieldTriggerStyles', 'fieldTriggerBoxStyles', 'choicePressStyles']) {
      const classes = depthConstant(name);
      expect(classes, name).toMatch(DEPTH_SINK);
      expect(classes, name).toMatch(DEPTH_HALO);
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

  it('en solo lectura y deshabilitado no hay clic', () => {
    expect(depthConstant('fieldTriggerStyles')).toContain('not-disabled:not-aria-readonly:active:');
    expect(depthConstant('fieldBoxStyles')).toContain(
      'not-data-[disabled]:not-data-[readonly]:active:',
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
    ]) {
      expect(depthRead(file), file).not.toMatch(/active:scale-\[\d|active:scale-\d/);
    }
  });
});
