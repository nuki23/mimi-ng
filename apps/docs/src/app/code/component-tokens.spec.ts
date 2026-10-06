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

const FOLDER: Record<TokenComponent, string> = {
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
};

/**
 * Variables que empiezan como un prefijo de componente pero no son suyas: globales del tema y
 * variables internas que el componente escribe solo (la posición de la flecha del Popover).
 */
const GLOBALS = new Set([
  '--mimi-input-background',
  '--mimi-switch-off',
  '--mimi-card-foreground',
  '--mimi-popover-foreground',
  '--mimi-popover-arrow-offset',
]);

/** Código del componente (sin pruebas). */
function source(component: TokenComponent): string {
  const dir = `${LIB}/components/${FOLDER[component]}`;
  return tokensFs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
    .map((f) => tokensFs.readFileSync(`${dir}/${f}`, 'utf8'))
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
      // Todo lo de la tabla existe (en el componente o, como --mimi-badge-radius, en el tema).
      expect(listed.filter((name) => !inCode.has(name) && !themeBase.includes(`${name}:`))).toEqual(
        [],
      );
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
