import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { CodeBlock } from './code-block';
import { nextTabIndex, uniqueTabsId } from './tab-keys';

interface InstallTab {
  id: 'short' | 'long';
  label: string;
  command: string;
}

/**
 * Comandos para agregar un componente (spec, sección 5): `ng g ui` (tras init, por
 * schematicCollections) y la forma larga. La pestaña de pnpm vuelve cuando exista el comando
 * de Mimi (tarea 5.3).
 */
@Component({
  selector: 'app-install-command',
  imports: [CodeBlock],
  templateUrl: './install-command.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallCommand {
  /** Nombre del componente, p. ej. `button`. */
  readonly name = input.required<string>();

  protected readonly tabs = computed<InstallTab[]>(() => [
    { id: 'short', label: 'Angular CLI', command: `ng g ui ${this.name()}` },
    { id: 'long', label: 'Forma larga', command: `ng g @mimi-ng/cli:ui ${this.name()}` },
  ]);
  protected readonly selected = signal(0);
  protected readonly idPrefix = uniqueTabsId('install');

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected select(index: number): void {
    this.selected.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const next = nextTabIndex(event.key, this.selected(), this.tabs().length);
    if (next === null) return;
    event.preventDefault();
    this.selected.set(next);
    this.tabButtons()[next]?.nativeElement.focus();
  }
}
