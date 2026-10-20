import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';
import { CodeBlock } from './code-block';

interface InstallTab {
  id: 'short' | 'long';
  label: string;
  command: string;
}

/**
 * Comandos para agregar un componente (spec, sección 5): `ng g mimi` (tras init, por
 * schematicCollections) y la forma larga, en `<mimi-tabs>` subrayadas. La pestaña de pnpm vuelve
 * cuando exista el comando de Mimi (tarea 5.3).
 */
@Component({
  selector: 'app-install-command',
  imports: [CodeBlock, MimiTabsImports],
  templateUrl: './install-command.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallCommand {
  /** Nombre del componente, p. ej. `button`. */
  readonly name = input.required<string>();

  protected readonly tabs = computed<InstallTab[]>(() => [
    { id: 'short', label: 'Angular CLI', command: `ng g mimi ${this.name()}` },
    { id: 'long', label: 'Forma larga', command: `ng g @mimi-ng/cli:ui ${this.name()}` },
  ]);

  /** La línea de la barra es el borde superior del panel (a todo el ancho de la tarjeta). */
  protected readonly panelClass = 'border-t p-0 focus-visible:-outline-offset-2';
}
