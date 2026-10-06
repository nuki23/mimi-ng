import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { type AvatarSize, type AvatarStatus, avatarVariants } from './avatar.variants';

/**
 * Contenedor del avatar. Guarda el estado de la imagen para que la imagen y el fallback sepan
 * cuál se ve:
 *
 * ```html
 * <mimi-avatar>
 *   <img mimiAvatarImage src="/ana.png" alt="Ana Torres" />
 *   <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>
 * </mimi-avatar>
 * ```
 */
@Component({
  selector: 'mimi-avatar',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
    '[attr.data-state]': 'status()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiAvatar {
  readonly size = input<AvatarSize>('default');
  readonly userClass = input('', { alias: 'class' });

  /** Estado de la imagen. Lo escribe `img[mimiAvatarImage]`; sin imagen queda en `idle`. */
  readonly status = signal<AvatarStatus>('idle');

  protected readonly classes = computed(() =>
    cn(avatarVariants({ size: this.size() }), this.userClass()),
  );
}

/**
 * Foto del avatar sobre el `<img>` nativo, así `alt`, `srcset`, `loading`… funcionan tal cual.
 * Queda invisible hasta que carga (sin salir del flujo, para que `loading="lazy"` funcione);
 * si falla, sigue invisible y se ve el fallback. `ngSrc` (NgOptimizedImage) no está soportado.
 */
@Directive({
  selector: 'img[mimiAvatarImage]',
  host: {
    // Al declarar `src` como entrada, Angular ya no lo escribe en el elemento: se hace aquí.
    '[attr.src]': 'src() || null',
    '[class]': 'classes()',
    '(load)': 'avatar.status.set("loaded")',
    '(error)': 'avatar.status.set("error")',
  },
})
export class MimiAvatarImage {
  readonly src = input<string | null | undefined>();
  readonly userClass = input('', { alias: 'class' });

  protected readonly avatar = inject(MimiAvatar);
  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(() =>
    cn(
      'absolute inset-0 aspect-square size-full object-cover',
      this.avatar.status() !== 'loaded' && 'invisible',
      this.userClass(),
    ),
  );

  constructor() {
    // Cada `src` nuevo vuelve a cargar; sin `src`, se ve el fallback.
    effect(() => {
      const src = this.src();
      untracked(() => this.avatar.status.set(src ? 'loading' : 'error'));
    });
    // Si la imagen ya estaba en caché, puede estar completa antes de escuchar `load`.
    afterRenderEffect(() => {
      if (!this.src()) return;
      if (this.img.complete && this.img.naturalWidth > 0) {
        untracked(() => this.avatar.status.set('loaded'));
      }
    });
  }
}

/**
 * Iniciales o ícono que se ven mientras la imagen carga, si falla o si no hay imagen. Con
 * `label`, los lectores de pantalla anuncian el nombre (`role="img"` + `aria-label`) en lugar
 * de leer las letras sueltas.
 */
@Component({
  selector: 'mimi-avatar-fallback',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiAvatarFallback {
  /** Nombre completo para lectores de pantalla. */
  readonly label = input<string>();
  readonly userClass = input('', { alias: 'class' });

  private readonly avatar = inject(MimiAvatar);

  protected readonly classes = computed(() =>
    cn(
      'flex size-full items-center justify-center rounded-[var(--mimi-avatar-radius,calc(infinity*1px))] bg-[color:var(--mimi-avatar-bg,var(--mimi-secondary))] font-semibold text-[color:var(--mimi-avatar-fg,var(--mimi-secondary-foreground))]',
      this.userClass(),
      // Al final: con la imagen cargada se oculta aunque el usuario pase `flex`.
      this.avatar.status() === 'loaded' && 'hidden',
    ),
  );
}

/** Todas las piezas de Avatar, para importarlas juntas. */
export const MimiAvatarImports = [MimiAvatar, MimiAvatarImage, MimiAvatarFallback] as const;
