import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideFileCode,
  LucideFileImage,
  LucideFileJson,
  LucideFileType,
  LucideFolder,
  LucideFolderOpen,
} from '@lucide/angular';
import { MimiTreeImports } from '@/components/ui/tree';
import { FILES, kindColor, loadAssets } from './files';

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
  protected readonly loadAssets = loadAssets;
  protected readonly color = kindColor;
  protected readonly selected = signal<string | null | string[]>('table');
  protected readonly open = signal(['src', 'app']);
}
