import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  LOCALE_ID,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { MimiButton } from '@/components/ui/button';
import { MimiProgress } from '@/components/ui/progress';
import { cn } from '@/components/ui/utils/cn';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import { MIMI_FILE_UPLOAD_TEXT } from './file-upload-texts';

/*
 * File Upload (docs/design/Mimi F3 Archivos Tags Toggle Color.dc.html, «9 · File Upload»;
 * prefijo de tokens `upload`, spec 13). Dos piezas (decidido por defecto en la G2.11, opción
 * (b)): `mimi-file-upload`, la zona de soltar, que es el control de formulario (`File[]`), y
 * `mimi-file-list` con `mimi-file-item`, de presentación, que la app arma con el estado de su
 * subida. Mimi no sube nada.
 */

/** Por qué no se agregó un archivo. */
export interface MimiFileRejection {
  file: File;
  reason: 'type' | 'size' | 'count';
  message: string;
}

/** Estado de un archivo de la lista, que da la app. */
export type MimiFileStatus = 'idle' | 'uploading' | 'done' | 'error';

/**
 * `true` si el archivo cumple `accept` (como el del `<input type="file">`: extensiones,
 * `image/*` o tipos exactos). Sin tipo del navegador, se mira la extensión.
 */
export function mimiFileMatchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}

/** Tamaño legible con el idioma: «2,4 MB». */
export function mimiFormatFileSize(bytes: number, locale: string): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let size = bytes;
  let unit = 0;
  while (size >= 1000 && unit < units.length - 1) {
    size /= 1000;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(size);
}

/**
 * La zona es un campo que funciona como botón (utils/field-styles, 12/11/2026): foco de campo (borde
 * del anillo y halo, solo con el teclado), al hacer clic se hunde y le crece el halo, deshabilitado
 * con el token y solo lectura (`aria-disabled`: un botón no admite `aria-readonly`) con el fondo
 * de solo lectura, sin hover ni clic. Su borde punteado de 2px es el del diseño.
 */
const ZONE_BASE = cn(
  'flex w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center font-sans text-foreground',
  'min-h-[var(--mimi-upload-height,176px)] rounded-[var(--mimi-upload-radius,var(--mimi-radius-card,1rem))] border-2',
  'mimi-transition outline-none',
  'focus-visible:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))] focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)] focus-visible:ring-ring-soft',
  'not-disabled:not-aria-disabled:active:scale-(--mimi-press-scale) not-disabled:not-aria-disabled:active:ring-[length:var(--mimi-input-focus-ring-width,3px)] not-disabled:not-aria-disabled:active:ring-ring-soft',
  'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]',
  'aria-disabled:cursor-default aria-disabled:bg-[color:var(--mimi-input-readonly)]',
);
const ZONE = {
  idle: cn(
    ZONE_BASE,
    'border-dashed border-[color:var(--mimi-upload-border,var(--mimi-input-border,var(--mimi-input)))] bg-[color:var(--mimi-upload-bg,var(--mimi-dropzone,var(--mimi-muted)))] not-disabled:not-aria-disabled:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))]',
  ),
  over: cn(
    ZONE_BASE,
    'scale-[1.01] border-solid border-[color:var(--mimi-upload-active-border,var(--mimi-dropzone-active-border,var(--mimi-info)))] bg-[color:var(--mimi-upload-active-bg,var(--mimi-dropzone-active,var(--mimi-accent)))] shadow-[shadow:var(--mimi-glow-info)] motion-reduce:scale-100',
  ),
  invalid: cn(
    ZONE_BASE,
    'border-dashed border-[color:var(--mimi-input-error,var(--mimi-destructive))] bg-[color:var(--mimi-upload-bg,var(--mimi-dropzone,var(--mimi-muted)))] focus-visible:border-[color:var(--mimi-input-error,var(--mimi-destructive))] focus-visible:ring-destructive-ring',
  ),
} as const;
const ICON_BASE =
  'inline-flex size-[var(--mimi-upload-icon-size,44px)] items-center justify-center rounded-full [&_svg]:size-[22px]';
const ICON = {
  idle: cn(ICON_BASE, 'bg-muted text-foreground'),
  over: cn(
    ICON_BASE,
    'bg-info text-info-foreground animate-[mimi-bob_1s_ease-in-out_infinite] motion-reduce:animate-none',
  ),
} as const;

let nextId = 0;

/**
 * La zona de soltar: abre el selector con clic, Enter o Espacio, y recibe archivos soltados.
 *
 * ```html
 * <mimi-file-upload accept="image/*,.pdf" multiple [maxSize]="10_000_000" [(value)]="files"
 *   hint="PNG, JPG o PDF · hasta 10 MB" (rejected)="onRejected($event)" />
 * ```
 *
 * Implementa `FormValueControl<File[]>`. Un archivo rechazado (tipo, tamaño o cantidad) no entra
 * en el valor: sale por `(rejected)` y se anuncia.
 */
@Component({
  selector: 'mimi-file-upload',
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiFileUpload }],
  template: `
    <button
      #zone
      type="button"
      [id]="controlId()"
      [class]="zoneClasses()"
      [disabled]="disabled()"
      [attr.aria-disabled]="readonly() ? 'true' : null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="hint() ? hintId : null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-required]="required() || null"
      [attr.data-state]="over() ? 'over' : 'idle'"
      (click)="openPicker()"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
    >
      <span aria-hidden="true" [class]="over() ? iconOver : iconIdle">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Lucide cloud-upload (ISC) -->
          <path d="M12 13v8" />
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="m8 17 4-4 4 4" />
        </svg>
      </span>
      <span [id]="headingId" data-slot="title" class="text-sm font-semibold">{{
        over() ? texts.drop(dragCount()) : heading() || (readonly() ? readonlyTitle : texts.title)
      }}</span>
      @if (hint()) {
        <span [id]="hintId" data-slot="hint" class="text-[12.5px] text-muted-foreground">{{
          hint()
        }}</span>
      }
    </button>
    @if (ariaLabel()) {
      <span [id]="labelId" hidden>{{ ariaLabel() }}</span>
    }
    <input
      #picker
      type="file"
      hidden
      tabindex="-1"
      aria-hidden="true"
      [accept]="accept()"
      [multiple]="multiple()"
      (change)="onPicked($event)"
    />
  `,
  host: {
    class: 'block w-full',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiFileUpload implements FormValueControl<File[]>, MimiFieldControl {
  private readonly announcer = inject(LiveAnnouncer);
  private readonly locale = inject(LOCALE_ID);
  protected readonly texts = inject(MIMI_FILE_UPLOAD_TEXT);

  /** Los archivos elegidos. Con `[(value)]` o un formulario. */
  readonly value = model<File[]>([]);
  /** Tipos aceptados, como en `<input type="file">` (`image/*,.pdf`). Vale también al soltar. */
  readonly accept = input('');
  /** Varios archivos. Sin `multiple`, uno nuevo reemplaza al anterior. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Tamaño máximo de cada archivo, en bytes. */
  readonly maxSize = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
  /** Cantidad máxima de archivos (contando los que ya están). */
  readonly maxFiles = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
  /**
   * Título visible de la zona. Por defecto, «Arrastra archivos o haz clic». Es también su nombre
   * accesible (WCAG 2.5.3): `aria-label` y `aria-labelledby` se anteponen, no lo reemplazan. No se
   * llama `title` para no tapar el atributo nativo (el globo del navegador).
   */
  readonly heading = input('');
  /** Qué se acepta («PNG, JPG o PDF · hasta 10 MB»): describe la zona. */
  readonly hint = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Solo lectura (R.12): no abre el selector ni acepta archivos soltados. El botón es un `button`
   * (no admite `aria-readonly`): queda con `aria-disabled` y se puede enfocar.
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  /** Va delante del título en el nombre accesible («Avatar, Arrastra archivos o haz clic»). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Ids de etiquetas propias; van delante del título en el nombre accesible. */
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });

  /** Archivos que no se agregaron, con el motivo. */
  readonly rejected = output<MimiFileRejection[]>();
  /** Se cerró el selector o se soltó: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly zone = viewChild.required<ElementRef<HTMLButtonElement>>('zone');
  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.zone().nativeElement;
  }

  private readonly baseId = `mimi-file-upload-${nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  protected readonly hintId = `${this.baseId}-hint`;
  protected readonly headingId = `${this.baseId}-heading`;
  protected readonly labelId = `${this.baseId}-label`;
  /** El nombre accesible contiene siempre el texto visible del título (WCAG 2.5.3). */
  protected readonly labelledBy = computed(() =>
    [this.ariaLabelledby(), this.ariaLabel() ? this.labelId : null, this.headingId]
      .filter(Boolean)
      .join(' '),
  );
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly over = signal(false);
  protected readonly dragCount = signal(0);
  /** Profundidad de `dragenter`: `dragleave` salta también al pasar sobre un hijo. */
  private depth = 0;

  /**
   * Título en solo lectura: «Arrastra archivos o haz clic» invitaría a algo que no se puede hacer.
   * Texto opcional (`readonly`): si un proveedor de textos propio no lo trae, el inglés.
   */
  protected readonly readonlyTitle = this.texts.readonly ?? 'Files (read-only)';
  protected readonly iconIdle = ICON.idle;
  protected readonly iconOver = ICON.over;
  protected readonly zoneClasses = computed(() =>
    cn(this.over() ? ZONE.over : this.showInvalid() ? ZONE.invalid : ZONE.idle, this.userClass()),
  );

  /** Enfoca la zona (Signal Forms la usa para llevar el foco al campo con error). */
  focus(options?: FocusOptions): void {
    this.zone().nativeElement.focus(options);
  }

  /** Abre el selector de archivos del sistema. */
  openPicker(): void {
    if (this.disabled() || this.readonly()) return;
    this.picker().nativeElement.click();
  }

  protected onPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    // Vacío: elegir el mismo archivo otra vez vuelve a disparar `change`.
    input.value = '';
    this.touch.emit();
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.disabled() || this.readonly()) return;
    event.preventDefault();
    // Al entrar en la zona (no al pasar a un hijo) se cuentan los archivos que llegan.
    if (this.depth === 0) this.dragCount.set(event.dataTransfer?.items?.length ?? 0);
    this.depth++;
    this.over.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled() || this.readonly()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected onDragLeave(): void {
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth === 0) this.over.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.depth = 0;
    this.over.set(false);
    if (this.disabled() || this.readonly()) return;
    this.add(Array.from(event.dataTransfer?.files ?? []));
    this.touch.emit();
  }

  /** Valida y agrega archivos (también se puede llamar desde la app). */
  add(files: File[]): void {
    if (!files.length) return;
    const accept = this.accept();
    const maxSize = this.maxSize();
    const multiple = this.multiple();
    const current = multiple ? (this.value() ?? []) : [];
    const limit = multiple ? (this.maxFiles() ?? Infinity) : 1;
    const accepted: File[] = [];
    const rejected: MimiFileRejection[] = [];
    for (const file of multiple ? files : files.slice(0, 1)) {
      if (!mimiFileMatchesAccept(file, accept)) {
        rejected.push({ file, reason: 'type', message: this.texts.wrongType });
      } else if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({
          file,
          reason: 'size',
          message: this.texts.tooLarge(mimiFormatFileSize(maxSize, this.locale)),
        });
      } else if (current.length + accepted.length >= limit) {
        rejected.push({ file, reason: 'count', message: this.texts.tooMany(limit) });
      } else {
        accepted.push(file);
      }
    }
    if (!multiple && files.length > 1) {
      for (const file of files.slice(1)) {
        rejected.push({ file, reason: 'count', message: this.texts.tooMany(1) });
      }
    }
    if (accepted.length) {
      this.value.set([...current, ...accepted]);
      void this.announcer.announce(this.texts.added(accepted.length), 'polite');
    }
    if (rejected.length) {
      this.rejected.emit(rejected);
      void this.announcer.announce(
        rejected.map((r) => this.texts.rejected(r.file.name, r.message)).join(' '),
        'polite',
      );
    }
  }
}

/**
 * Ícono propio de una fila: `<svg mimiFileIcon lucideFileSpreadsheet />` dentro de
 * `mimi-file-item`. Sin él, el de su tipo (imagen, PDF, video u otro).
 */
@Directive({ selector: '[mimiFileIcon]', host: { 'aria-hidden': 'true' } })
export class MimiFileIcon {}

/**
 * La lista de archivos (`<ul>`): `<mimi-file-list [emptyFocus]="zona">`. Si se quita el último
 * archivo con el foco en su botón, el foco va a `emptyFocus` (la zona de soltar).
 */
@Component({
  selector: 'mimi-file-list',
  template: `<ng-content />`,
  host: {
    role: 'list',
    '[attr.aria-label]': 'ariaLabel() || texts.list',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiFileList {
  protected readonly texts = inject(MIMI_FILE_UPLOAD_TEXT);
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Adónde va el foco si se quita el último archivo (algo con `focus()`). */
  readonly emptyFocus = input<{ focus(): void } | null>(null);
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() => cn('flex flex-col gap-2', this.userClass()));
}

const TYPE_ICON = {
  image: {
    tone: 'bg-info-soft text-info-soft-foreground',
    paths: [
      'M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21',
      'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    ],
  },
  pdf: {
    tone: 'bg-destructive-soft-bg text-destructive-soft-foreground',
    paths: [
      'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      'M14 2v4a2 2 0 0 0 2 2h4',
      'M10 9H8',
      'M16 13H8',
      'M16 17H8',
    ],
  },
  video: {
    tone: 'bg-warning-soft text-warning-soft-foreground',
    paths: [
      'm16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5',
      'M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
    ],
  },
  other: {
    tone: 'bg-muted text-muted-foreground',
    paths: [
      'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      'M14 2v4a2 2 0 0 0 2 2h4',
    ],
  },
} as const;

const ITEM_BASE = cn(
  'flex items-center gap-3 border bg-card p-2.5 text-card-foreground shadow-[shadow:var(--mimi-shadow-neutral)]',
  'rounded-[var(--mimi-upload-item-radius,var(--mimi-radius,0.75rem))]',
);
const ITEM = {
  default: cn(ITEM_BASE, 'border-border'),
  error: cn(
    ITEM_BASE,
    'border-[color:color-mix(in_oklab,var(--mimi-destructive)_45%,var(--mimi-border))]',
  ),
} as const;

/**
 * Una fila de la lista, con el estado que da la app:
 *
 * ```html
 * <mimi-file-item [file]="file" [status]="estado" [progress]="64" (remove)="quitar(file)" />
 * <mimi-file-item name="contrato.pdf" [size]="182000" status="done" (remove)="…" />
 * ```
 */
@Component({
  selector: 'mimi-file-item',
  imports: [MimiButton, MimiProgress],
  template: `
    @if (thumbnail(); as url) {
      <img
        alt=""
        data-slot="thumbnail"
        class="size-[var(--mimi-upload-thumb-size,44px)] shrink-0 rounded-[var(--mimi-radius-sm)] object-cover"
        [src]="url"
      />
    } @else {
      <span
        aria-hidden="true"
        data-slot="icon"
        class="inline-flex size-[var(--mimi-upload-thumb-size,44px)] shrink-0 items-center justify-center rounded-[var(--mimi-radius-sm)] [&_svg]:size-5"
        [class]="typeIcon().tone"
      >
        @if (customIcon()) {
          <ng-content select="[mimiFileIcon]" />
        } @else {
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            @for (d of typeIcon().paths; track $index) {
              <path [attr.d]="d" />
            }
          </svg>
        }
      </span>
    }
    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex items-baseline gap-2">
        <span data-slot="name" class="min-w-0 flex-1 truncate text-sm font-medium">{{
          fileName()
        }}</span>
        <span data-slot="size" class="shrink-0 text-xs text-muted-foreground tabular-nums">{{
          sizeText()
        }}</span>
      </span>
      @switch (status()) {
        @case ('uploading') {
          <span class="flex items-center gap-2">
            <mimi-progress
              class="flex-1 [--mimi-progress-height:5px]"
              [value]="progress()"
              aria-label="{{ texts.uploading(fileName()) }}"
            />
            <span class="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums"
              >{{ progress() ?? 0 }}%</span
            >
          </span>
        }
        @case ('done') {
          <span
            data-slot="done"
            class="flex items-center gap-1 text-xs text-success-soft-foreground"
          >
            <svg
              aria-hidden="true"
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            {{ texts.uploaded }}
          </span>
        }
        @case ('error') {
          <span data-slot="error" class="text-xs text-destructive-soft-foreground">{{
            error()
          }}</span>
        }
      }
    </span>
    @if (status() === 'error' && retryable()) {
      <button
        mimiBtn
        type="button"
        variant="outline"
        size="sm"
        class="h-[30px]"
        (click)="retry.emit()"
      >
        {{ texts.retry }}
      </button>
    }
    <button
      #removeButton
      mimiBtn
      type="button"
      variant="ghost"
      size="icon"
      data-slot="remove"
      class="size-[30px] text-muted-foreground hover:bg-destructive-soft-bg hover:text-destructive-soft-foreground [&_svg]:size-4"
      [attr.aria-label]="texts.remove(fileName())"
      (click)="onRemove()"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Lucide trash-2 (ISC) -->
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  `,
  host: {
    role: 'listitem',
    '[class]': 'classes()',
    '[attr.data-status]': 'status()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiFileItem {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly list = inject(MimiFileList, { optional: true });
  private readonly announcer = inject(LiveAnnouncer);
  private readonly locale = inject(LOCALE_ID);
  protected readonly texts = inject(MIMI_FILE_UPLOAD_TEXT);

  /** El archivo (da el nombre, el tamaño, el tipo y la miniatura de las imágenes). */
  readonly file = input<File | null>(null);
  /** Nombre, tamaño (bytes) y tipo MIME, para archivos que no son un `File` (ya subidos). */
  readonly name = input('');
  readonly size = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
  readonly type = input('');
  /** URL de una miniatura propia (por ejemplo, la del servidor). */
  readonly thumbnailUrl = input('');
  readonly status = input<MimiFileStatus>('idle');
  /** Porcentaje (0–100) con `status="uploading"`; sin él, la barra es indeterminada. */
  readonly progress = input<number | null>(null);
  /** Mensaje con `status="error"`. */
  readonly error = input('');
  /** Muestra «Reintentar» con `status="error"`. */
  readonly retryable = input(true, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  readonly remove = output<void>();
  readonly retry = output<void>();

  protected readonly customIcon = contentChild(MimiFileIcon);
  // `read: ElementRef`: en un botón con `mimiBtn` (un componente), la referencia sería el componente.
  private readonly removeButton = viewChild.required('removeButton', {
    read: ElementRef<HTMLButtonElement>,
  });

  protected readonly fileName = computed(() => this.name() || this.file()?.name || '');
  private readonly fileType = computed(() => this.type() || this.file()?.type || '');
  protected readonly sizeText = computed(() => {
    const size = this.size() ?? this.file()?.size;
    return size === undefined ? '' : mimiFormatFileSize(size, this.locale);
  });
  protected readonly typeIcon = computed(() => {
    const type = this.fileType();
    const name = this.fileName().toLowerCase();
    if (type.startsWith('image/')) return TYPE_ICON.image;
    if (type === 'application/pdf' || name.endsWith('.pdf')) return TYPE_ICON.pdf;
    if (type.startsWith('video/')) return TYPE_ICON.video;
    return TYPE_ICON.other;
  });
  protected readonly classes = computed(() =>
    cn(this.status() === 'error' ? ITEM.error : ITEM.default, this.userClass()),
  );

  /** URL de la miniatura de una imagen (`URL.createObjectURL`), liberada al cambiar o destruir. */
  private objectUrl: string | null = null;
  protected readonly thumbnail = computed(() => {
    if (this.thumbnailUrl()) return this.thumbnailUrl();
    const file = this.file();
    untracked(() => this.revoke());
    if (!file || !file.type.startsWith('image/')) return null;
    this.objectUrl = URL.createObjectURL(file);
    return this.objectUrl;
  });

  /** Anuncia «subido» y «con error» cuando el estado cambia (no el estado inicial). */
  private previous: MimiFileStatus | null = null;
  private readonly announceStatus = effect(() => {
    const status = this.status();
    const previous = this.previous;
    this.previous = status;
    if (previous === null || previous === status) return;
    const name = untracked(this.fileName);
    if (status === 'done') void this.announcer.announce(this.texts.done(name), 'polite');
    if (status === 'error') {
      void this.announcer.announce(this.texts.failed(name, untracked(this.error)), 'polite');
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revoke());
  }

  private revoke(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }

  /**
   * Quitar: si el foco está en este botón, pasa al botón de quitar del siguiente, del anterior o
   * a `emptyFocus` de la lista, antes de que la fila desaparezca (nunca a `body`).
   */
  protected onRemove(): void {
    if (document.activeElement === this.removeButton().nativeElement) {
      const sibling = (element: Element | null) =>
        element?.querySelector<HTMLElement>('[data-slot="remove"]') ?? null;
      const next =
        sibling(this.host.nextElementSibling) ?? sibling(this.host.previousElementSibling);
      if (next) next.focus();
      else this.list?.emptyFocus()?.focus();
    }
    this.remove.emit();
  }
}

/** Todas las piezas de File Upload, para importarlas juntas. */
export const MimiFileUploadImports = [
  MimiFileUpload,
  MimiFileList,
  MimiFileItem,
  MimiFileIcon,
] as const;
