import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideFolderKanban, LucideKeyRound, LucideReceipt } from '@lucide/angular';
import { MimiTreeImports, type MimiTreeNode } from '@/components/ui/tree';

const PERMISSIONS: MimiTreeNode[] = [
  {
    id: 'projects',
    label: 'Proyectos',
    children: [
      { id: 'projects.view', label: 'Ver' },
      { id: 'projects.create', label: 'Crear' },
      { id: 'projects.edit', label: 'Editar' },
      { id: 'projects.delete', label: 'Eliminar' },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    children: [
      { id: 'billing.view', label: 'Ver facturas' },
      { id: 'billing.pay', label: 'Pagar' },
      { id: 'billing.refund', label: 'Reembolsar', disabled: true },
    ],
  },
];

@Component({
  selector: 'app-tree-permissions-example',
  imports: [MimiTreeImports, LucideFolderKanban, LucideKeyRound, LucideReceipt],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <mimi-tree
        aria-label="Permisos"
        multiple
        [nodes]="permissions"
        [(value)]="granted"
        [(expanded)]="open"
      >
        <ng-template mimiTreeNode let-node let-level="level">
          <span class="inline-flex text-muted-foreground [&_svg]:size-[15px]">
            @if (level > 1) {
              <svg lucideKeyRound aria-hidden="true"></svg>
            } @else if (node.id === 'billing') {
              <svg lucideReceipt aria-hidden="true"></svg>
            } @else {
              <svg lucideFolderKanban aria-hidden="true"></svg>
            }
          </span>
          <span class="min-w-0 flex-1 truncate" [class.font-semibold]="level === 1">
            {{ node.label }}
          </span>
          @if (node.children) {
            <span class="text-[11.5px] text-muted-foreground tabular-nums">
              {{ count(node) }}/{{ node.children.length }}
            </span>
          }
        </ng-template>
      </mimi-tree>
      <p class="text-sm text-pretty text-muted-foreground">
        Permisos: <code class="font-mono">{{ list() }}</code>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePermissionsExample {
  protected readonly permissions = PERMISSIONS;
  protected readonly granted = signal<string | null | string[]>([
    'projects.view',
    'projects.create',
    'billing.view',
    'billing.pay',
  ]);
  protected readonly open = signal(['projects', 'billing']);

  protected count(node: MimiTreeNode): number {
    const granted = this.granted();
    const ids = Array.isArray(granted) ? granted : [];
    return (node.children ?? []).filter((child) => ids.includes(child.id)).length;
  }

  protected list(): string {
    const granted = this.granted();
    return Array.isArray(granted) && granted.length > 0 ? granted.join(', ') : 'ninguno';
  }
}
