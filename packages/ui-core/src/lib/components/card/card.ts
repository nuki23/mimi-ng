import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';

/*
 * Card (docs/design/Mimi Componentes.dc.html, sección 4, "Plan Equipo"). Clases literales para
 * que Tailwind las detecte. Tokens de la spec 6.3 (MimiCardTokens), con la cascada de la 6.2:
 * --mimi-card-* → token global → valor del diseño.
 */

/** Contenedor de la tarjeta. */
@Component({
  selector: 'mimi-card',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCard {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex flex-col bg-[color:var(--mimi-card-bg,var(--mimi-card))] text-[color:var(--mimi-card-fg,var(--mimi-card-foreground))]',
      'rounded-[var(--mimi-card-radius,var(--mimi-radius-card))]',
      'border-[length:var(--mimi-card-border-width,1px)] border-[color:var(--mimi-card-border,var(--mimi-border))]',
      'shadow-[shadow:var(--mimi-card-shadow,var(--mimi-shadow-card))]',
      this.userClass(),
    ),
  );
}

/** Encabezado: título y descripción. */
@Component({
  selector: 'mimi-card-header',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCardHeader {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex flex-col gap-1.5 p-[var(--mimi-card-padding-header,var(--mimi-card-padding,1.5rem)_var(--mimi-card-padding,1.5rem)_1rem)]',
      this.userClass(),
    ),
  );
}

/**
 * Título. Es un encabezado para los lectores de pantalla (`role="heading"` + `aria-level`).
 * No pongas un `<h3>` dentro: quedaría duplicado. Si prefieres tu propio `<h3>`, úsalo en lugar
 * de este componente, con las mismas clases.
 */
@Component({
  selector: 'mimi-card-title',
  template: '<ng-content />',
  host: {
    role: 'heading',
    '[attr.aria-level]': 'level()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCardTitle {
  /** Nivel del encabezado (aria-level). */
  readonly level = input(3, { transform: numberAttribute });
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('block text-lg leading-tight font-semibold tracking-[-0.01em]', this.userClass()),
  );
}

/** Descripción bajo el título. */
@Component({
  selector: 'mimi-card-description',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCardDescription {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('block text-sm text-muted-foreground', this.userClass()),
  );
}

/**
 * Contenido. Sin padding arriba porque va bajo el encabezado; si es el primer hijo de la
 * tarjeta (sin encabezado), suma 24px arriba para no quedar pegado al borde.
 */
@Component({
  selector: 'mimi-card-content',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCardContent {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'block p-[var(--mimi-card-padding-content,0_var(--mimi-card-padding,1.5rem)_1.25rem)] first:pt-[var(--mimi-card-padding,1.5rem)]',
      this.userClass(),
    ),
  );
}

/** Pie con acciones, alineadas a la derecha como en el diseño. */
@Component({
  selector: 'mimi-card-footer',
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCardFooter {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex items-center justify-end gap-2 p-[var(--mimi-card-padding-footer,0_var(--mimi-card-padding,1.5rem)_var(--mimi-card-padding,1.5rem))] first:pt-[var(--mimi-card-padding,1.5rem)]',
      this.userClass(),
    ),
  );
}

/** Todas las piezas de Card, para importarlas juntas. */
export const MimiCardImports = [
  MimiCard,
  MimiCardHeader,
  MimiCardTitle,
  MimiCardDescription,
  MimiCardContent,
  MimiCardFooter,
] as const;
