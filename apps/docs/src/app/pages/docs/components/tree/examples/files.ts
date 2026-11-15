import type { MimiTreeNode } from '@/components/ui/tree';

/** Los datos del ejemplo de archivos: los nodos, la carga diferida y el color de cada tipo. */
export type Kind = 'dir' | 'ts' | 'css' | 'json' | 'img';

export const FILES: MimiTreeNode<Kind>[] = [
  {
    id: 'src',
    label: 'src',
    data: 'dir',
    children: [
      {
        id: 'app',
        label: 'app',
        data: 'dir',
        children: [
          { id: 'button', label: 'button.ts', meta: '2 KB', data: 'ts' },
          { id: 'input', label: 'input.ts', meta: '3 KB', data: 'ts' },
          { id: 'table', label: 'data-table.ts', meta: '18 KB', data: 'ts' },
        ],
      },
      { id: 'styles', label: 'styles.css', meta: '4 KB', data: 'css' },
    ],
  },
  // Sus hijos se piden al abrirlo (loadChildren).
  { id: 'assets', label: 'assets', data: 'dir', hasChildren: true },
  { id: 'mimi', label: 'mimi.json', meta: '412 B', data: 'json' },
  { id: 'package', label: 'package.json', meta: '2 KB', data: 'json' },
];

/** Simula una petición al servidor. */
export const loadAssets = (): Promise<MimiTreeNode<Kind>[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 'logo', label: 'logo.svg', meta: '3 KB', data: 'img' },
          { id: 'hero', label: 'hero.webp', meta: '214 KB', data: 'img' },
        ]),
      1200,
    ),
  );

const TONES: Record<Kind, string> = {
  dir: 'text-warning-soft-foreground',
  ts: 'text-info-soft-foreground',
  css: 'text-success-soft-foreground',
  img: 'text-destructive-soft-foreground',
  json: 'text-muted-foreground',
};

/**
 * Color del ícono por tipo (en el nodo elegido, el del texto). La plantilla recibe `data` como
 * `unknown`: el tipo de los nodos no llega al `ng-template`.
 */
export function kindColor(data: unknown): string {
  return `${TONES[(data as Kind | undefined) ?? 'json']} in-data-[selected]:text-current`;
}
