/**
 * Última barrera antes de publicar: apps/docs/public solo puede tener los tipos de archivo
 * esperados (ver apps/docs/scripts/check-public.mjs). El mismo script corre dentro de
 * `pnpm build:docs`, que es el build de Cloudflare: si falla, no se despliega.
 *
 * Las pruebas corren en Node (Vitest): se usan los módulos de Node sin importarlos, como en
 * commands.spec.ts. Sin imports, TypeScript trata ambos archivos como scripts del mismo ámbito,
 * así que aquí no se declaran `process`, `fs` ni `path` (ya los declara commands.spec.ts).
 */

interface PublicNodeFs {
  mkdtempSync(prefix: string): string;
  mkdirSync(path: string, options: { recursive: true }): void;
  writeFileSync(path: string, data: string): void;
  rmSync(path: string, options: { recursive: true; force: true }): void;
}
interface PublicNodePath {
  join(...parts: string[]): string;
}
interface SpawnResult {
  status: number | null;
  stderr: string;
}
interface NodeChildProcess {
  spawnSync(command: string, args: string[], options: { encoding: 'utf8' }): SpawnResult;
}
interface NodeProcess {
  cwd(): string;
  execPath: string;
  getBuiltinModule(id: string): unknown;
}

const node = (globalThis as unknown as { process: NodeProcess }).process;
const nodeFs = node.getBuiltinModule('node:fs') as PublicNodeFs;
const nodePath = node.getBuiltinModule('node:path') as PublicNodePath;
const os = node.getBuiltinModule('node:os') as { tmpdir(): string };
const childProcess = node.getBuiltinModule('node:child_process') as NodeChildProcess;

const SCRIPT = nodePath.join(node.cwd(), 'apps', 'docs', 'scripts', 'check-public.mjs');
const check = (dir?: string) =>
  childProcess.spawnSync(node.execPath, dir ? [SCRIPT, dir] : [SCRIPT], { encoding: 'utf8' });

describe('archivos de apps/docs/public', () => {
  it('solo hay tipos permitidos (svg, png, ico, webp y _headers)', () => {
    const result = check();
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  describe('el script', () => {
    let dir = '';
    beforeEach(() => {
      dir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), 'mimi-public-'));
      nodeFs.mkdirSync(nodePath.join(dir, 'avatars'), { recursive: true });
      nodeFs.writeFileSync(nodePath.join(dir, '_headers'), '');
      nodeFs.writeFileSync(nodePath.join(dir, 'favicon.ico'), '');
      nodeFs.writeFileSync(nodePath.join(dir, 'avatars', 'a.svg'), '');
      nodeFs.writeFileSync(nodePath.join(dir, 'avatars', 'b.PNG'), '');
      nodeFs.writeFileSync(nodePath.join(dir, 'avatars', 'c.webp'), '');
    });
    afterEach(() => nodeFs.rmSync(dir, { recursive: true, force: true }));

    it('acepta los tipos permitidos', () => {
      expect(check(dir).status).toBe(0);
    });

    it('rechaza un documento en una subcarpeta y lo nombra', () => {
      nodeFs.writeFileSync(nodePath.join(dir, 'avatars', 'contrato.pdf'), '');
      const result = check(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('avatars/contrato.pdf');
    });

    it('rechaza archivos ocultos, sin extensión y dobles extensiones engañosas', () => {
      for (const name of ['.DS_Store', 'LEEME', 'notas.svg.txt', '_redirects']) {
        nodeFs.writeFileSync(nodePath.join(dir, name), '');
      }
      const result = check(dir);
      expect(result.status).toBe(1);
      for (const name of ['.DS_Store', 'LEEME', 'notas.svg.txt', '_redirects']) {
        expect(result.stderr).toContain(name);
      }
    });
  });
});
