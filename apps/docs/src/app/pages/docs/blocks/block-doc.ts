import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../../code/code-block';
import type { CodeLang } from '../../../code/highlighter.service';
import { InstallCommand } from '../../../code/install-command';
import { BlockFrame, type BlockState } from './block-frame';
import { pageInfo } from './page-code';

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
      @if (page(); as page) {
        <p data-slot="block-install" class="text-pretty">
          <strong>Genera una página tuya</strong> en la carpeta de páginas (<code
            class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
            >aliases.pages</code
          >
          en
          <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">mimi.json</code>;
          por defecto,
          <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">{{
            page.dir
          }}</code
          >): <code class="font-mono text-[13px]">{{ page.name }}.ts</code>,
          <code class="font-mono text-[13px]">{{ page.name }}.html</code> y
          <code class="font-mono text-[13px]">{{ page.name }}.routes.ts</code>, con la clase
          <code class="font-mono text-[13px]">{{ page.className }}</code> (selector
          <code class="font-mono text-[13px]">{{ page.selector }}</code
          >, con el prefijo de tu proyecto). Los componentes que usa van a la carpeta de siempre. Al
          terminar, <code class="font-mono text-[13px]">ng g mimi</code> te da la línea para las
          rutas de
          <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
            >app.routes.ts</code
          >, con la página en carga diferida:
        </p>
        <app-code-block [code]="page.routeLine" lang="typescript" label="app.routes.ts" />
      } @else {
        <p data-slot="block-install" class="text-pretty">
          Es una <strong>sección</strong>: una parte de una página (no tiene ruta propia). Copia el
          Block a la carpeta de Blocks de tu proyecto (<code
            class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
            >aliases.blocks</code
          >
          en
          <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">mimi.json</code>;
          por defecto,
          <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
            >src/app/blocks</code
          >) y los componentes que usa a la de siempre; ponlo dentro de una de tus páginas.
        </p>
      }
      <ul data-slot="block-notes" class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          <strong>Un Block es un componente Angular tuyo desde que se copia.</strong> Los
          componentes de Mimi (Button, Input…) tienen una API estable que se cuida entre versiones;
          un Block no: es un punto de partida. Sus entradas y salidas pueden cambiar de una versión
          a otra, y lo normal es que lo edites. Si lo modificas, la CLI no lo vuelve a tocar al
          actualizar (te avisa, y <code class="font-mono text-[13px]">--overwrite</code> lo
          reemplaza entero).
        </li>
        @if (page(); as page) {
          <li>
            <strong>El nombre y la carpeta los eliges tú:</strong>
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >ng g mimi {{ name() }} --name admin-{{ page.name }}</code
            >
            genera
            <code class="font-mono text-[13px]">admin-{{ page.name }}/</code> con la clase
            <code class="font-mono text-[13px]">Admin{{ page.className }}</code
            >, y
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >aliases.pages</code
            >
            en <code class="font-mono text-[13px]">mimi.json</code> cambia la carpeta de todas (una
            ruta relativa a la raíz de tu proyecto). Si la carpeta ya existe, la CLI no la toca y te
            pide otro nombre. Mimi sigue la página por su nombre ({{ name() }}), así que la
            actualiza aunque la llames de otra forma.
          </li>
          <li>
            <strong>La CLI no toca tus rutas:</strong> pega tú la línea en
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >app.routes.ts</code
            >.
          </li>
          <li>
            <strong>¿La instalaste con la 0.4.0?</strong> Sigue en
            <code class="font-mono text-[13px]">src/app/blocks/{{ name() }}/</code> y se actualiza
            ahí, como antes. Para pasarla a página, guarda tus cambios, borra esa carpeta y vuelve a
            ejecutar el comando.
          </li>
        } @else {
          <li>
            <strong>La carpeta la eliges tú:</strong> cambia
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >aliases.blocks</code
            >
            en
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >mimi.json</code
            >
            (por ejemplo, a
            <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              >src/app/sections</code
            >) antes de agregar el Block. Tiene que ser una ruta relativa a la raíz de tu proyecto.
          </li>
        }
      </ul>
      <p data-slot="landmarks" class="text-pretty">
        Ningún Block pone
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">&lt;main&gt;</code
        >: va en tu layout, alrededor del
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >&lt;router-outlet&gt;</code
        >. Si un Block tiene un
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >&lt;header&gt;</code
        >
        (settings-01) y tu app no envuelve la ruta en
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">&lt;main&gt;</code
        >, ese <code class="font-mono text-[13px]">&lt;header&gt;</code> pasa a ser el «banner» de
        la página para los lectores de pantalla.
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
  /** `page`: la CLI genera una página del usuario (B.11); `section`: lo copia tal cual. */
  readonly kind = input.required<'page' | 'section'>();
  readonly description = input.required<string>();
  readonly components = input<BlockComponent[]>([]);
  readonly files = input<BlockFile[]>([]);
  readonly inputs = input<BlockApiRow[]>([]);
  readonly outputs = input<BlockApiRow[]>([]);
  readonly states = input<BlockState[]>([]);

  protected readonly page = computed(() => (this.kind() === 'page' ? pageInfo(this.name()) : null));

  protected readonly tables = computed(() => [
    { title: 'Entrada', rows: this.inputs() },
    { title: 'Salida', rows: this.outputs() },
  ]);
}
