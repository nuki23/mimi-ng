import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import installMap from './install-map.json';
import { More } from './more';

export interface InstallExtras {
  /** Otros ítems del registro que se copian con él (`option-list`, `utils/overlay`…). */
  items: string[];
  /** Paquetes de npm que agrega si el proyecto no los tiene (sin versión: van en Fundamentos). */
  packages: string[];
  /** Lo que agrega al CSS global. */
  css: string[];
}

/**
 * El mapa reducido del registro de la CLI: por componente, lo que copia y agrega con él (con sus
 * dependencias), sin lo que ya trae `ng add`. Lo genera `apps/docs/scripts/install-map.mjs` en
 * `pnpm build:docs`; doc-page.spec.ts lo compara con `packages/cli/src/registry.json`.
 */
export const INSTALL_MAP: Readonly<Record<string, InstallExtras>> = installMap;

/** «Qué instala» un componente del registro. */
export function installExtras(name: string): InstallExtras {
  const extras = INSTALL_MAP[name];
  if (!extras) throw new Error(`[Mimi docs] «${name}» no está en el registro de la CLI.`);
  return extras;
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
