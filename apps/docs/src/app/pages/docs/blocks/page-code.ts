// La misma conversión que hace la CLI (B.11): el sitio muestra el código de una página tal como
// lo genera `ng g mimi` en un proyecto nuevo, sin copiarla aquí. Son funciones de texto, sin
// dependencias (packages/cli/src/utils/pages.ts).
import {
  type PageTarget,
  defaultPageName,
  pageClassName,
  pageSelector,
  renderPageFile,
  routeLine,
  routesFile,
} from '../../../../../../../packages/cli/src/utils/pages';
import type { BlockFile } from './block-doc';

/** Nombres de la página que genera un Block (`login-01` → `login`, `LoginPage`…). */
export function pageInfo(item: string) {
  const name = defaultPageName(item);
  const target: PageTarget = { item, dir: `src/app/pages/${name}`, name, prefix: 'app' };
  return {
    target,
    name,
    dir: `${target.dir}/`,
    className: pageClassName(name),
    selector: pageSelector('app', name),
    routeLine: routeLine(target, `./pages/${name}/${name}.routes`),
  };
}

/** Los archivos de la página como los escribe `ng g mimi <item>` (sin `--name`). */
export function pageFiles(item: string, ts: string, html: string): BlockFile[] {
  const { target, name } = pageInfo(item);
  return [
    { name: `${name}/${name}.ts`, code: renderPageFile(ts, target), lang: 'angular-ts' },
    { name: `${name}/${name}.html`, code: renderPageFile(html, target), lang: 'angular-html' },
    { name: `${name}/${name}.routes.ts`, code: routesFile(target), lang: 'typescript' },
  ];
}
