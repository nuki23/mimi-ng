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
  id: 'pnpm' | 'ng';
  label: string;
  command: string;
}

/** Comandos para instalar un componente (spec, sección 5), en pestañas pnpm / Angular CLI. */
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
    { id: 'pnpm', label: 'pnpm', command: `pnpm mimi add ${this.name()}` },
    { id: 'ng', label: 'Angular CLI', command: `ng g @mimi-ng/cli:ui ${this.name()}` },
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
