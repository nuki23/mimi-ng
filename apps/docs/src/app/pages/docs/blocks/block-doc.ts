import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../../code/code-block';
import type { CodeLang } from '../../../code/highlighter.service';
import { InstallCommand } from '../../../code/install-command';
import { BlockFrame, type BlockState } from './block-frame';

export interface BlockFile {
  /** Ruta dentro de la carpeta del Block en el proyecto, p. ej. `login-01/login-01.ts`. */
  name: string;
  code: string;
  lang: CodeLang;
}

export interface BlockComponent {
  /** Nombre en el registro, p. ej. `password`. */
  name: string;
  /** Página de la documentación. */
  path: string;
}

export interface BlockApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/**
 * Plantilla de la página de un Block (B.1). La página del sitio no tiene diseño propio: se arma
 * con lo que ya tiene el sitio (InstallCommand, la vista previa en iframe, CodeBlock y la tabla
 * de API; anotado en D6). Cada Block tiene su página, que importa sus archivos como texto y
 * proyecta lo propio (notas de uso, accesibilidad) en el hueco de «Uso».
 */
@Component({
  selector: 'app-block-doc',
  imports: [CodeBlock, InstallCommand, BlockFrame, RouterLink],
  template: `
    <article class="flex flex-col gap-5">
      <p class="text-sm font-medium text-muted-foreground">Block</p>
      <h1 class="-mt-4 text-[38px] leading-[1.15] font-extrabold tracking-[-0.03em]">
        {{ name() }}
      </h1>
      <p class="text-lg text-pretty text-muted-foreground">{{ description() }}</p>

      <h2 id="preview" class="mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]">
        Vista previa
      </h2>
      <app-block-frame [name]="name()" [states]="states()" />

      <h2 id="installation" class="mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]">
        Instalación
      </h2>
      <app-install-command [name]="name()" />
      <p class="text-pretty">
        Copia la pantalla a la carpeta de Blocks de tu proyecto (<code
          class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >aliases.blocks</code
        >
        en
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">mimi.json</code>;
        por defecto,
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >src/app/blocks</code
        >) y los componentes que usa a la de siempre. La pantalla es tuya: cámbiala como quieras. Si
        la modificas, la CLI no la vuelve a tocar al actualizar.
      </p>

      <h2 id="usage" class="mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]">Uso</h2>
      <ng-content />

      <h3 id="components" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Componentes que usa
      </h3>
      <ul class="flex flex-wrap gap-2">
        @for (component of components(); track component.name) {
          <li>
            <a
              class="inline-flex rounded-full border px-3 py-1 font-mono text-[13px] hover:bg-accent"
              [routerLink]="component.path"
              >{{ component.name }}</a
            >
          </li>
        }
      </ul>

      <h2 id="code" class="mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]">Código</h2>
      @for (file of files(); track file.name) {
        <h3 class="mt-2 font-mono text-sm font-semibold">{{ file.name }}</h3>
        <app-code-block [code]="file.code" [lang]="file.lang" [label]="file.name" />
      }

      <h2 id="api" class="mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]">API</h2>
      @for (table of tables(); track table.title) {
        @if (table.rows.length > 0) {
          <div class="overflow-x-auto rounded-card border">
            <table class="w-full text-left text-sm">
              <thead class="bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" class="px-4 py-2.5 font-medium">{{ table.title }}</th>
                  <th scope="col" class="px-4 py-2.5 font-medium">Tipo</th>
                  <th scope="col" class="px-4 py-2.5 font-medium">Por defecto</th>
                  <th scope="col" class="px-4 py-2.5 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                @for (row of table.rows; track row.name) {
                  <tr class="border-t align-top">
                    <td class="px-4 py-2.5 font-mono text-[13px]">{{ row.name }}</td>
                    <td class="px-4 py-2.5 font-mono text-[13px] text-muted-foreground">
                      {{ row.type }}
                    </td>
                    <td class="px-4 py-2.5 font-mono text-[13px]">{{ row.default }}</td>
                    <td class="px-4 py-2.5 text-pretty">{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockDoc {
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly components = input<BlockComponent[]>([]);
  readonly files = input<BlockFile[]>([]);
  readonly inputs = input<BlockApiRow[]>([]);
  readonly outputs = input<BlockApiRow[]>([]);
  readonly states = input<BlockState[]>([]);

  protected readonly tables = computed(() => [
    { title: 'Entrada', rows: this.inputs() },
    { title: 'Salida', rows: this.outputs() },
  ]);
}
