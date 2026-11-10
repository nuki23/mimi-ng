import { COMPONENT_TOKENS, TOKEN_PREFIX, type TokenComponent } from './component-tokens';

/**
 * component-tokens.ts es la única fuente de las tablas «Variables CSS»: esta prueba la compara
 * con el código de ui-core, en los dos sentidos, para que no se desactualice. Las pruebas corren
 * en Node: se leen los archivos con fs, sin importarlo (ver commands.spec.ts).
 */
const tokensNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const tokensFs = tokensNode.getBuiltinModule('node:fs') as {
  readdirSync(path: string): string[];
  readFileSync(path: string, encoding: 'utf8'): string;
};
const LIB = `${tokensNode.cwd()}/packages/ui-core/src/lib`;

/** Carpeta del componente; una lista si la tabla es de varios (el calendario y sus campos). */
const FOLDER: Record<TokenComponent, string | readonly string[]> = {
  avatar: 'avatar',
  badge: 'badge',
  button: 'button',
  card: 'card',
  checkbox: 'checkbox',
  formField: 'form-field',
  input: 'input',
  separator: 'separator',
  skeleton: 'skeleton',
  switch: 'switch',
  textarea: 'textarea',
  popover: 'popover',
  tooltip: 'tooltip',
  menu: 'menu',
  select: 'select',
  dialog: 'dialog',
  confirm: 'confirm',
  toast: 'toast',
  tabs: 'tabs',
  toolbar: 'toolbar',
  pagination: 'pagination',
  toggleGroup: 'toggle-group',
  progress: 'progress',
  numberInput: 'number-input',
  password: 'password',
  inputMask: 'input-mask',
  inputOtp: 'input-otp',
  chip: 'chip',
  tagsInput: 'tags-input',
  slider: 'slider',
  combobox: 'combobox',
  date: ['calendar', 'date-picker', 'date-range'],
  fileUpload: 'file-upload',
  colorPicker: 'color-picker',
  tree: 'tree',
  sortable: 'sortable-list',
  command: 'command',
  dataTable: 'data-table',
};

/**
 * Variables que empiezan como un prefijo de componente pero no son suyas: globales del tema y
 * variables internas que el componente escribe solo (la posición de la flecha del Popover).
 */
const GLOBALS = new Set([
  '--mimi-input-background',
  '--mimi-switch-off',
  '--mimi-card-foreground',
  // Global del Grupo 2 (G2.0b) que el chip lee como respaldo.
  '--mimi-chip-foreground',
  '--mimi-popover-foreground',
  '--mimi-popover-arrow-offset',
  '--mimi-tooltip-foreground',
  '--mimi-tooltip-arrow-offset',
  // Dirección de la entrada y la salida del Toast (arriba o abajo), la escribe el componente.
  '--mimi-toast-enter',
  // Cuántas pestañas hay y cuál se pinta: las escribe Tabs para colocar el indicador.
  '--mimi-tabs-count',
  '--mimi-tabs-index',
  // Derivadas de la escala de tamaños (theme-base.css, `[data-size]`): las resuelve el tema por
  // tamaño a partir de los tokens públicos (`--mimi-btn-height`, `-sm`, `-lg`…).
  '--mimi-btn-h',
  '--mimi-btn-text',
  '--mimi-btn-gap-s',
  '--mimi-btn-px-s',
  '--mimi-input-h',
  '--mimi-input-text',
  '--mimi-avatar-s',
  '--mimi-avatar-text',
  '--mimi-switch-w',
  '--mimi-switch-h',
  '--mimi-checkbox-s',
  // Lo mismo en Toggle Group (G2.1).
  '--mimi-toggle-group-count',
  '--mimi-toggle-group-index',
]);

/** Código del componente (sin pruebas). */
function source(component: TokenComponent): string {
  const folders = FOLDER[component];
  return (typeof folders === 'string' ? [folders] : folders)
    .flatMap((folder) => {
      const dir = `${LIB}/components/${folder}`;
      return tokensFs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
        .map((f) => tokensFs.readFileSync(`${dir}/${f}`, 'utf8'));
    })
    .join('\n');
}
const themeBase = tokensFs.readFileSync(`${LIB}/theme/theme-base.css`, 'utf8');

describe('Variables CSS de cada componente (component-tokens.ts)', () => {
  for (const component of Object.keys(COMPONENT_TOKENS) as TokenComponent[]) {
    it(`${component}: la lista coincide con el código de ui-core`, () => {
      const code = source(component);
      const prefix = TOKEN_PREFIX[component];
      const inCode = new Set(
        [...code.matchAll(new RegExp(`--mimi-${prefix}-[a-z0-9-]+`, 'g'))]
          .map((m) => m[0])
          .filter((name) => !GLOBALS.has(name)),
      );
      const listed = COMPONENT_TOKENS[component].map((t) => t.name);
      // Todo lo que usa el código está en la tabla.
      expect([...inCode].filter((name) => !listed.includes(name))).toEqual([]);
      // Todo lo de la tabla existe: en el componente, declarado en el tema (--mimi-badge-radius) o
      // leído por la escala de tamaños del tema (--mimi-btn-height-sm: `var(--mimi-btn-height-sm, …)`).
      expect(
        listed.filter(
          (name) =>
            !inCode.has(name) &&
            !themeBase.includes(`${name}:`) &&
            !themeBase.includes(`var(${name},`),
        ),
      ).toEqual([]);
    });
  }

  it('cada nombre de la 0.1.0 apunta a uno que existe en la lista', () => {
    for (const tokens of Object.values(COMPONENT_TOKENS)) {
      const names = tokens.map((t) => t.name);
      for (const t of tokens.filter((t) => t.deprecated)) {
        expect(names, t.name).toContain(t.deprecated);
      }
    }
  });
});
