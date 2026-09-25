import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { type SeparatorOrientation, separatorVariants } from './separator.variants';

/**
 * Línea divisoria: `<mimi-separator />` o `<mimi-separator orientation="vertical" />`.
 *
 * Por defecto es decorativa (`role="none"`): los lectores de pantalla no la anuncian. Con
 * `decorative="false"` pasa a `role="separator"` con `aria-orientation`, para separar grupos
 * con significado.
 */
@Component({
  selector: 'mimi-separator',
  template: '',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'decorative() ? "none" : "separator"',
    '[attr.aria-orientation]': 'decorative() ? null : orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSeparator {
  readonly orientation = input<SeparatorOrientation>('horizontal');
  /** Solo visual (por defecto). En `false`, los lectores de pantalla la anuncian. */
  readonly decorative = input(true, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(separatorVariants({ orientation: this.orientation() }), this.userClass()),
  );
}
