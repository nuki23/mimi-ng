import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import registry from '@mimi-ng/cli/registry.json';
import { More } from './more';

interface RegistryItem {
  type: string;
  files: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  registryDependencies?: string[];
  cssImports?: string[];
}

const ITEMS = (registry as unknown as { items: Record<string, RegistryItem> }).items;

/** Lo que ya trae `ng add @mimi-ng/cli` (spec 5, «Qué hace init»): no se repite aquí. */
const FROM_INIT_ITEMS = new Set(['theme', 'utils/cn', 'utils/control-styles']);
const FROM_INIT_PACKAGES = new Set(['clsx', 'tailwind-merge', 'class-variance-authority']);

export interface InstallExtras {
  /** Otros ítems del registro que se copian con él (`option-list`, `utils/overlay`…). */
  items: string[];
  /** Paquetes de npm que agrega si el proyecto no los tiene (sin versión: van en Fundamentos). */
  packages: string[];
  /** Lo que agrega al CSS global. */
  css: string[];
}

/** «Qué instala» un ítem, desde `packages/cli/src/registry.json` (con sus dependencias). */
export function installExtras(name: string): InstallExtras {
  if (!ITEMS[name]) throw new Error(`[Mimi docs] «${name}» no está en el registro de la CLI.`);
  const seen = new Set<string>();
  const visit = (item: string) => {
    if (seen.has(item)) return;
    seen.add(item);
    for (const dep of ITEMS[item]?.registryDependencies ?? []) visit(dep);
  };
  visit(name);
  const closure = [...seen].map((item) => ITEMS[item]).filter(Boolean);
  const packages = new Set(
    closure.flatMap((item) => [
      ...Object.keys(item.dependencies ?? {}),
      ...Object.keys(item.peerDependencies ?? {}),
    ]),
  );
  return {
    items: [...seen].filter((item) => item !== name && !FROM_INIT_ITEMS.has(item)).sort(),
    packages: [...packages].filter((p) => !FROM_INIT_PACKAGES.has(p)).sort(),
    css: [...new Set(closure.flatMap((item) => item.cssImports ?? []))].sort(),
  };
}

/** El desplegable «Qué instala» de la sección Instalación. */
@Component({
  selector: 'app-install-extras',
  imports: [More],
  template: `
    <app-more summary="Qué instala">
      @let x = extras();
      @if (!x.items.length && !x.packages.length && !x.css.length) {
        <p>Solo sus archivos: lo demás ya lo trajo <code [class]="code">ng add</code>.</p>
      } @else {
        <p>Además de sus archivos, si tu proyecto no los tiene:</p>
        <ul class="flex list-disc flex-col gap-1.5 ps-5">
          @if (x.items.length) {
            <li data-slot="install-items">
              Copia
              @for (item of x.items; track item; let last = $last) {
                <code [class]="code">{{ item }}</code
                >{{ last ? '.' : ', ' }}
              }
            </li>
          }
          @if (x.packages.length) {
            <li data-slot="install-packages">
              Instala
              @for (pkg of x.packages; track pkg; let last = $last) {
                <code [class]="code">{{ pkg }}</code
                >{{ last ? '.' : ', ' }}
              }
              Las versiones, en Fundamentos.
            </li>
          }
          @if (x.css.length) {
            <li data-slot="install-css">
              Agrega a tu CSS global, después del tema:
              @for (css of x.css; track css; let last = $last) {
                <code [class]="code">&#64;import "{{ css }}";</code>{{ last ? '' : ', ' }}
              }
            </li>
          }
        </ul>
      }
    </app-more>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallExtrasView {
  /** El nombre en el registro. */
  readonly name = input.required<string>();
  protected readonly extras = computed(() => installExtras(this.name()));
  protected readonly code = 'rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]';
}
