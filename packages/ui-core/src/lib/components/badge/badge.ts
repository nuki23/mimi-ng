import { Directive, computed, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import {
  type MimiBadgeTone,
  type MimiBadgeVariant,
  mimiBadgeVariants,
  mimiResolveBadgeTone,
} from './badge.variants';

/**
 * Etiqueta estática de Mimi sobre el `<span>` nativo: `<span mimiBadge>Nuevo</span>`.
 *
 * - `variant` (solid, soft, outline) y `tone` (primary, secondary, success, warning, info,
 *   danger). Sin `tone`, cada variante usa su tono natural: outline es neutro (secondary); las
 *   demás, primary. `data-variant` y `data-tone` muestran los valores resueltos.
 */
@Directive({
  selector: 'span[mimiBadge]',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  exportAs: 'mimiBadge',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'toneResolved()',
  },
})
export class MimiBadge {
  readonly variant = input<MimiBadgeVariant>('solid');
  readonly tone = input<MimiBadgeTone>();
  readonly userClass = input('', { alias: 'class' });

  protected readonly toneResolved = computed(() =>
    mimiResolveBadgeTone(this.variant(), this.tone()),
  );

  protected readonly classes = computed(() =>
    cn(mimiBadgeVariants({ variant: this.variant(), tone: this.toneResolved() }), this.userClass()),
  );
}
