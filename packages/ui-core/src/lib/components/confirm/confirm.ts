import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  assertInInjectionContext,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import {
  MIMI_DIALOG_DATA,
  MimiDialogDescription,
  MimiDialogRef,
  MimiDialogService,
  MimiDialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_CONFIRM_TEXT } from './confirm-texts';

/*
 * Confirm (docs/design/Mimi F2 Overlays.dc.html, «2 · Confirm»; prefijo de tokens `confirm`,
 * spec 13): un alertdialog de 380px, sin X, con un círculo de 40px para el ícono, el título, la
 * descripción y dos botones de 36px a la derecha.
 *
 * Por dentro abre un Dialog (MimiDialogService): el foco, el fondo, Escape, el bloqueo del scroll
 * y la animación son suyos. Confirm solo pone el contenido y traduce el cierre a true o false.
 */

/** Opciones de `confirm()`. */
export interface MimiConfirmOptions {
  /** La pregunta. Es el nombre accesible del diálogo. */
  title: string;
  /** Qué pasa si se confirma. Recomendada: un alertdialog la anuncia junto al título. */
  description?: string;
  /** Texto del botón que confirma. Por defecto, el de `MIMI_CONFIRM_TEXT`. */
  confirmText?: string;
  /** Texto del botón que cancela. Por defecto, el de `MIMI_CONFIRM_TEXT`. */
  cancelText?: string;
  /**
   * `danger` para una acción destructiva: el botón de confirmar va en rojo y el foco inicial, en
   * Cancelar. Por defecto, `primary` (el foco inicial va en Confirmar).
   */
  tone?: 'primary' | 'danger';
  /** Ícono dentro del círculo de color: una plantilla con un `<svg>`. Sin él, no hay círculo. */
  icon?: TemplateRef<unknown>;
  /** Clases del panel, mezcladas con `cn()` (gana la del usuario). */
  class?: string;
}

/** La función que devuelve `injectMimiConfirm()`. */
export type MimiConfirmFn = (options: MimiConfirmOptions) => Promise<boolean>;

const ICON_CLASSES = {
  primary: 'bg-info-soft text-info-soft-foreground',
  danger:
    'bg-[color:var(--mimi-confirm-icon-bg,var(--mimi-destructive-soft-bg))] text-[color:var(--mimi-confirm-icon-fg,var(--mimi-destructive-soft-foreground))]',
} as const;

/** Crea la plantilla del ícono. Hace lo mismo que NgTemplateOutlet, sin @angular/common. */
@Directive({ selector: '[mimiConfirmIcon]' })
class MimiConfirmIcon {
  readonly template = input.required<TemplateRef<unknown>>({ alias: 'mimiConfirmIcon' });
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly render = effect(() => {
    const template = this.template();
    untracked(() => {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(template);
    });
  });
}

/** El contenido del diálogo: ícono, título, descripción y los dos botones. */
@Component({
  selector: 'mimi-confirm',
  imports: [MimiButton, MimiDialogTitle, MimiDialogDescription, MimiConfirmIcon],
  template: `
    <div class="flex items-start gap-3.5">
      @if (options.icon) {
        <span aria-hidden="true" data-slot="icon" [class]="iconClasses">
          <ng-container [mimiConfirmIcon]="options.icon" />
        </span>
      }
      <div class="flex min-w-0 flex-col gap-1">
        <h2 mimiDialogTitle class="text-base leading-[1.3] tracking-normal">
          {{ options.title }}
        </h2>
        @if (options.description) {
          <p mimiDialogDescription class="text-[13px] leading-normal text-pretty">
            {{ options.description }}
          </p>
        }
      </div>
    </div>
    <!-- Los botones miden 36px de alto con 14px a los lados, como en el diseño. -->
    <div class="flex justify-end gap-2">
      <button
        mimiBtn
        type="button"
        variant="outline"
        data-slot="cancel"
        class="h-9 px-3.5"
        (click)="ref.close(false)"
      >
        {{ options.cancelText ?? text.cancel }}
      </button>
      <button
        mimiBtn
        type="button"
        [tone]="tone"
        data-slot="confirm"
        class="h-9 px-3.5"
        (click)="ref.close(true)"
      >
        {{ options.confirmText ?? text.confirm }}
      </button>
    </div>
  `,
  host: { '[attr.data-tone]': 'tone' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MimiConfirmContent {
  protected readonly options = inject<MimiConfirmOptions>(MIMI_DIALOG_DATA);
  protected readonly ref = inject<MimiDialogRef<boolean>>(MimiDialogRef);
  protected readonly text = inject(MIMI_CONFIRM_TEXT);

  protected readonly tone = this.options.tone ?? 'primary';
  protected readonly iconClasses = cn(
    'inline-flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5 [&_svg]:shrink-0',
    ICON_CLASSES[this.tone],
  );
}

/**
 * Prepara `confirm()`, que pregunta y espera la respuesta:
 *
 * ```ts
 * private readonly confirm = injectMimiConfirm();
 *
 * async remove() {
 *   if (await this.confirm({ title: '¿Eliminar este proyecto?', tone: 'danger' })) { … }
 * }
 * ```
 *
 * Se llama al declarar la propiedad (o en el constructor): necesita el contexto de inyección.
 * Así toma el injector del componente y los textos de `provideMimiConfirmText` de su ruta o del
 * propio componente. Dentro de un método falla con NG0203.
 *
 * `confirm()` resuelve `true` si se confirmó y `false` en cualquier otro caso (Cancelar, Escape,
 * una navegación, `closeAll()` o el componente que se destruye), después de la animación de
 * salida y con el foco ya devuelto. Solo rechaza si el diálogo no se pudo abrir. El clic en el
 * fondo no cierra.
 */
export function injectMimiConfirm(): MimiConfirmFn {
  assertInInjectionContext(injectMimiConfirm);
  const dialog = inject(MimiDialogService);
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);

  return (options) =>
    new Promise<boolean>((resolve, reject) => {
      let ref: MimiDialogRef<boolean> | null = null;

      const open = () => {
        try {
          ref = dialog.open<boolean, MimiConfirmOptions>(MimiConfirmContent, {
            data: options,
            role: 'alertdialog',
            closeButton: false,
            closeOnBackdropClick: false,
            // Lo más seguro primero: en una acción destructiva, Enter no confirma por accidente.
            autoFocus: options.tone === 'danger' ? '[data-slot="cancel"]' : '[data-slot="confirm"]',
            // Por clase y no con `width`: así la clase del usuario puede cambiar el ancho.
            class: cn('w-[var(--mimi-confirm-width,380px)] gap-3.5 p-5', options.class),
            injector,
          });
        } catch (error) {
          stop();
          reject(error);
          return;
        }
        ref.afterClosed().subscribe((result) => {
          stop();
          resolve(result === true);
        });
      };

      // Se abre después del render en curso: si lo pide un ítem de menú, el menú ya se cerró y
      // devolvió el foco a su botón, y el diálogo lo devuelve ahí al cerrar (no al ítem, que ya
      // no existe).
      const hook = afterNextRender({ write: open }, { injector });
      // Si el componente que pregunta se destruye antes de la respuesta, se cierra con false.
      const stop = destroyRef.onDestroy(() => {
        hook.destroy();
        ref?.close(false);
        resolve(false);
      });
    });
}
