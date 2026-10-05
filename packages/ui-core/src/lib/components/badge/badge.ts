import { Directive, computed, input, isDevMode } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import {
  type BadgeTone,
  type BadgeVariant,
  type BadgeVariantShortcut,
  badgeVariants,
  resolveBadgeStyle,
} from './badge.variants';

/** El aviso de atajo + tone sale una sola vez por página. */
let warnedShortcutWithTone = false;

/**
 * Etiqueta estática de Mimi sobre el `<span>` nativo: `<span mimiBadge>Nuevo</span>`.
 *
 * - `variant` (solid, soft, outline) y `tone` (primary, secondary, success, warning, info,
 *   danger). Sin `tone`, cada variante usa su tono natural: outline es neutro (secondary); las
 *   demás, primary. `data-variant` y `data-tone` muestran los valores resueltos.
 * - Los atajos de la 0.1.0 (`default`, `secondary`, `destructive`) siguen funcionando y ganan
 *   sobre `tone` (en modo desarrollo, avisa una vez).
 */
@Directive({
  selector: 'span[mimiBadge]',
  exportAs: 'mimiBadge',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'resolved().variant',
    '[attr.data-tone]': 'resolved().tone',
  },
})
export class MimiBadge {
  readonly variant = input<BadgeVariant | BadgeVariantShortcut>('solid');
  readonly tone = input<BadgeTone>();
  readonly userClass = input('', { alias: 'class' });

  protected readonly resolved = computed(() => {
    const style = resolveBadgeStyle(this.variant(), this.tone());
    if (style.ignoredTone && isDevMode() && !warnedShortcutWithTone) {
      warnedShortcutWithTone = true;
      console.warn(
        `[mimi] mimiBadge: variant="${this.variant()}" ya define el color; se ignora ` +
          `tone="${this.tone()}". Usa variant="${style.variant}" con tone (los atajos se ` +
          `quitan en la 1.0).`,
      );
    }
    return style;
  });

  protected readonly classes = computed(() =>
    cn(
      badgeVariants({ variant: this.resolved().variant, tone: this.resolved().tone }),
      this.userClass(),
    ),
  );
}
