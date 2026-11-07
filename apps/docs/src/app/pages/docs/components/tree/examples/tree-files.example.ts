import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideFileCode,
  LucideFileImage,
  LucideFileJson,
  LucideFileType,
  LucideFolder,
  LucideFolderOpen,
} from '@lucide/angular';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

type Kind = 'dir' | 'ts' | 'css' | 'json' | 'img';

const FILES: MimiTreeNode<Kind>[] = [
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

@Component({
  selector: 'app-tree-files-example',
  imports: [
    MimiTreeImports,
    LucideFileCode,
    LucideFileImage,
    LucideFileJson,
    LucideFileType,
    LucideFolder,
    LucideFolderOpen,
  ],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <mimi-tree
        aria-label="Archivos del proyecto"
        [nodes]="files"
        [loadChildren]="loadAssets"
        [(value)]="selected"
        [(expanded)]="open"
      >
        <ng-template mimiTreeNode let-node let-expanded="expanded">
          <span class="inline-flex [&_svg]:size-4" [class]="color(node.data)">
            @switch (node.data) {
              @case ('dir') {
                @if (expanded) {
                  <svg lucideFolderOpen aria-hidden="true"></svg>
                } @else {
                  <svg lucideFolder aria-hidden="true"></svg>
                }
              }
              @case ('ts') {
                <svg lucideFileCode aria-hidden="true"></svg>
              }
              @case ('css') {
                <svg lucideFileType aria-hidden="true"></svg>
              }
              @case ('img') {
                <svg lucideFileImage aria-hidden="true"></svg>
              }
              @default {
                <svg lucideFileJson aria-hidden="true"></svg>
              }
            }
          </span>
          <span class="min-w-0 flex-1 truncate">{{ node.label }}</span>
          <span class="font-mono text-[11px] text-muted-foreground in-data-[selected]:text-current">
            {{ node.meta }}
          </span>
        </ng-template>
      </mimi-tree>
      <p class="text-sm text-muted-foreground">
        Elegido: <code class="font-mono">{{ selected() ?? 'ninguno' }}</code>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeFilesExample {
  protected readonly files = FILES;
  protected readonly selected = signal<string | null | string[]>('table');
  protected readonly open = signal(['src', 'app']);

  /** Simula una petición al servidor. */
  protected readonly loadAssets = (): Promise<MimiTreeNode<Kind>[]> =>
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

  /**
   * Color del ícono por tipo (en el nodo elegido, el del texto). La plantilla recibe `data` como
   * `unknown`: el tipo de los nodos no llega al `ng-template`.
   */
  protected color(data: unknown): string {
    const kind = data as Kind | undefined;
    const tone = {
      dir: 'text-warning-soft-foreground',
      ts: 'text-info-soft-foreground',
      css: 'text-success-soft-foreground',
      img: 'text-destructive-soft-foreground',
      json: 'text-muted-foreground',
    }[kind ?? 'json'];
    return `${tone} in-data-[selected]:text-current`;
  }
}
