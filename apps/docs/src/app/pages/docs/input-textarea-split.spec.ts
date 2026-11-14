import { DOCS_ROUTES } from './docs.routes';
import { DOCS_NAV } from '../../layout/docs-nav';

/**
 * Input y Textarea en dos páginas (13/11/2026), como Switch y Checkbox: cada una con su ruta, su
 * entrada en el menú y los enlaces de los Blocks a la suya.
 */
const splitNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const splitFs = splitNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
  readdirSync(path: string): string[];
};
const APP = `${splitNode.cwd()}/apps/docs/src/app`;

describe('Input y Textarea, dos páginas', () => {
  it('cada una tiene su ruta y su título', () => {
    const route = (path: string) => DOCS_ROUTES.find((r) => r.path === path);
    expect(route('components/input')?.title).toBe('Input · Mimi');
    expect(route('components/textarea')?.title).toBe('Textarea · Mimi');
  });

  it('el menú tiene una entrada para cada una', () => {
    const items = DOCS_NAV.flatMap((section) => section.items);
    expect(items.find((i) => i.path === '/docs/components/input')?.title).toBe('Input');
    expect(items.find((i) => i.path === '/docs/components/textarea')?.title).toBe('Textarea');
    expect(items.some((i) => /Input y Textarea/.test(i.title))).toBe(false);
  });

  it('los Blocks enlazan textarea a su página', () => {
    const dir = `${APP}/pages/docs/blocks`;
    for (const file of splitFs.readdirSync(dir).filter((f) => f.endsWith('-page.ts'))) {
      const code = splitFs.readFileSync(`${dir}/${file}`, 'utf8');
      expect(code, file).not.toContain("{ name: 'textarea', path: '/docs/components/input' }");
    }
    expect(splitFs.readFileSync(`${dir}/settings-01-page.ts`, 'utf8')).toContain(
      "{ name: 'textarea', path: '/docs/components/textarea' }",
    );
  });
});
