import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { LucideCode, LucideEye } from '@lucide/angular';
import { CodeBlock } from './code-block';
import { CopyButton } from './copy-button';
import type { CodeLang } from './highlighter.service';
import { nextTabIndex, uniqueTabsId } from './tab-keys';

type PreviewTab = 'preview' | 'code';

/**
 * Ejemplo en vivo con pestañas Preview/Código. El ejemplo va por ng-content y `code` es el
 * archivo del mismo ejemplo importado como texto (`with { loader: 'text' }`): el código que
 * se ve es el que corre, nunca una copia escrita a mano.
 */
@Component({
  selector: 'app-code-preview',
  imports: [CodeBlock, CopyButton, LucideCode, LucideEye],
  templateUrl: './code-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePreview {
  readonly code = input.required<string>();
  readonly lang = input<CodeLang>('angular-ts');

  protected readonly tabs: { id: PreviewTab; label: string }[] = [
    { id: 'preview', label: 'Preview' },
    { id: 'code', label: 'Código' },
  ];
  protected readonly selected = signal<PreviewTab>('preview');
  protected readonly idPrefix = uniqueTabsId('preview');

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected select(tab: PreviewTab): void {
    this.selected.set(tab);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const current = this.tabs.findIndex((t) => t.id === this.selected());
    const next = nextTabIndex(event.key, current, this.tabs.length);
    if (next === null) return;
    event.preventDefault();
    this.selected.set(this.tabs[next].id);
    this.tabButtons()[next]?.nativeElement.focus();
  }
}
