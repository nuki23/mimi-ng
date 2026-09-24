import { Directive, computed, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { type BadgeVariant, badgeVariants } from './badge.variants';

/** Etiqueta estática de Mimi sobre el `<span>` nativo: `<span mimiBadge>Nuevo</span>`. */
@Directive({
  selector: 'span[mimiBadge]',
  exportAs: 'mimiBadge',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
  },
})
export class MimiBadge {
  readonly variant = input<BadgeVariant>('default');
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(badgeVariants({ variant: this.variant() }), this.userClass()),
  );
}
