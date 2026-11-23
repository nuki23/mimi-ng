import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  isDevMode,
  model,
  signal,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { MimiSheetOutlet, MimiSheetOverlay } from '@/components/ui/utils/sheet';

/*
 * Sheet / Drawer (G4.2; diseño de referencia: docs/design/Mimi F5 Estructura.dc.html, «1 · Sheet /
 * Drawer»): un panel modal pegado a un lado de la pantalla, flotante (separado de los bordes, con
 * el radio de las tarjetas) y, abajo, con una barra de agarre. Se construye sobre la hoja común
 * (`utils/sheet.ts`, R.34), la misma que usan los paneles de Select, Combobox o los menús en el
 * teléfono: foco atrapado y devuelto, Escape, el fondo y arrastrar hacia el borde para cerrar, y
 * el alto que sigue al teclado del móvil.
 */

export type MimiSheetSide = 'bottom' | 'left' | 'right';

let nextId = 0;

/**
 * La hoja: un trigger (`[mimiSheetTrigger]`) y el contenido en un `<ng-template mimiSheetContent>`.
 * No dibuja nada propio (`display: contents`): su `class` y su `aria-label` van a la hoja.
 *
 * ```html
 * <mimi-sheet side="right">
 *   <button mimiBtn mimiSheetTrigger>Editar</button>
 *   <ng-template mimiSheetContent>
 *     <header mimiSheetHeader>
 *       <h2 mimiSheetTitle>Editar cliente</h2>
 *       <p mimiSheetDescription>Café Altura</p>
 *     </header>
 *     <div mimiSheetBody>…</div>
 *     <footer mimiSheetFooter><button mimiBtn mimiSheetClose>Guardar</button></footer>
 *   </ng-template>
 * </mimi-sheet>
 * ```
 */
@Component({
  selector: 'mimi-sheet',
  exportAs: 'mimiSheet',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [MimiSheetOverlay, MimiSheetOutlet],
  template: `
    <ng-content />
    <ng-template
      mimiSheet
      [mimiSheetOpen]="open()"
      [mimiSheetSide]="side()"
      [mimiSheetHeader]="false"
      [mimiSheetCloseButton]="closeButton()"
      [mimiSheetLabelledby]="!ariaLabel() && hasTitle() ? titleId : null"
      [mimiSheetDescribedby]="descriptionId()"
      [mimiSheetAriaLabel]="ariaLabel()"
      [mimiSheetClass]="userClass()"
      [mimiSheetSize]="sized.effective()"
      [mimiSheetDismissable]="!disableClose()"
      (mimiSheetClose)="close()"
      (mimiSheetAttach)="warnMissingLabel()"
    >
      @if (content(); as content) {
        <ng-container [mimiSheetOutlet]="content.templateRef" />
      }
    </ng-template>
  `,
  host: {
    style: 'display: contents',
    '[attr.class]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-side]': 'side()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSheet {
  /** Abierta o cerrada. Admite `[(open)]`. */
  readonly open = model(false);
  /** Lado de la pantalla: `right` (por defecto), `left` o `bottom` (con barra de agarre). */
  readonly side = input<MimiSheetSide>('right');
  /** La X arriba a la derecha (por defecto). */
  readonly closeButton = input(true, { transform: booleanAttribute });
  /** Ni Escape, ni el fondo, ni arrastrar la cierran (solo `mimiSheetClose` o `open`). */
  readonly disableClose = input(false, { transform: booleanAttribute });
  /** Nombre accesible si no hay `mimiSheetTitle`. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Clases de la hoja, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  protected readonly content = contentChild(MimiSheetContent);
  protected readonly sized = inject(MimiSized);

  /** id del título (`mimiSheetTitle` lo usa): el nombre accesible de la hoja. */
  readonly titleId = `mimi-sheet-title-${nextId++}`;
  readonly hasTitle = signal(false);
  readonly descriptionId = signal<string | null>(null);

  private warnedLabel = false;

  /** Abre o cierra (lo usa el trigger). */
  toggle(): void {
    this.open.update((open) => !open);
  }

  /** Cierra. El foco vuelve a donde estaba al abrir (el trigger). */
  close(): void {
    this.open.set(false);
  }

  protected warnMissingLabel(): void {
    if (!isDevMode() || this.warnedLabel || this.ariaLabel() || this.hasTitle()) return;
    this.warnedLabel = true;
    console.warn(
      '[Mimi] Sheet: la hoja no tiene nombre accesible. Agrega un título con mimiSheetTitle o ' +
        'aria-label="…" en <mimi-sheet>.',
    );
  }
}

/** Botón que abre y cierra la hoja: `<button mimiBtn mimiSheetTrigger>`. */
@Directive({
  selector: '[mimiSheetTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'sheet.open()',
    '[attr.data-state]': 'sheet.open() ? "open" : "closed"',
    '(click)': 'sheet.toggle()',
  },
})
export class MimiSheetTrigger {
  protected readonly sheet = inject(MimiSheet);
}

/** Contenido de la hoja: `<ng-template mimiSheetContent>`. Se crea al abrir y se destruye al cerrar. */
@Directive({ selector: 'ng-template[mimiSheetContent]' })
export class MimiSheetContent {
  readonly templateRef = inject(TemplateRef);
}

/** Cabecera: título y descripción, con el hueco de la X a la derecha. */
@Directive({ selector: '[mimiSheetHeader]', host: { '[class]': 'classes()' } })
export class MimiSheetHeader {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('flex shrink-0 flex-col gap-0.5 pt-[18px] pr-12 pb-3 pl-[18px]', this.userClass()),
  );
}

/** Título: le da su nombre accesible a la hoja (aria-labelledby). */
@Directive({
  selector: '[mimiSheetTitle]',
  host: { '[id]': 'sheet.titleId', '[class]': 'classes()' },
})
export class MimiSheetTitle {
  protected readonly sheet = inject(MimiSheet);
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-base leading-tight font-bold', this.userClass()),
  );

  constructor() {
    this.sheet.hasTitle.set(true);
    inject(DestroyRef).onDestroy(() => this.sheet.hasTitle.set(false));
  }
}

/** Descripción (aria-describedby). */
@Directive({
  selector: '[mimiSheetDescription]',
  host: { '[id]': 'id', '[class]': 'classes()' },
})
export class MimiSheetDescription {
  private readonly sheet = inject(MimiSheet);
  readonly id = `mimi-sheet-description-${nextId++}`;
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-[0.8125rem] text-muted-foreground', this.userClass()),
  );

  constructor() {
    this.sheet.descriptionId.set(this.id);
    inject(DestroyRef).onDestroy(() => {
      if (this.sheet.descriptionId() === this.id) this.sheet.descriptionId.set(null);
    });
  }
}

/** El cuerpo: ocupa el espacio que queda, con el relleno del diseño. */
@Directive({ selector: '[mimiSheetBody]', host: { '[class]': 'classes()' } })
export class MimiSheetBody {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('flex flex-1 flex-col gap-3 px-[18px] py-1', this.userClass()),
  );
}

/** Pie: botones a la derecha, con una línea arriba. */
@Directive({ selector: '[mimiSheetFooter]', host: { '[class]': 'classes()' } })
export class MimiSheetFooter {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'mt-auto flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-[18px] py-3.5',
      this.userClass(),
    ),
  );
}

/** Cierra la hoja al hacer clic (p. ej. «Cancelar» o «Guardar»). */
@Directive({ selector: '[mimiSheetClose]', host: { '(click)': 'sheet.close()' } })
export class MimiSheetClose {
  protected readonly sheet = inject(MimiSheet);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

export const MimiSheetImports = [
  MimiSheet,
  MimiSheetTrigger,
  MimiSheetContent,
  MimiSheetHeader,
  MimiSheetTitle,
  MimiSheetDescription,
  MimiSheetBody,
  MimiSheetFooter,
  MimiSheetClose,
] as const;
