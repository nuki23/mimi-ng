import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { MimiChip, injectMimiChipAnnouncer } from '@/components/ui/chip';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import {
  MIMI_FIELD_CONTROL,
  injectFieldState,
  type MimiFieldControl,
} from '@/components/ui/utils/field-state';
import { MIMI_TAGS_INPUT_TEXT } from './tags-input-texts';

/*
 * Tags Input (docs/design/Mimi F3 Archivos Tags Toggle Color.dc.html, «10 · Tags Input»;
 * prefijo de tokens `tags`, spec 13). Las etiquetas son chips del ítem `chip`.
 *
 * Teclado (decidido por defecto en la G2.6, como el diseño): Enter o un separador agregan;
 * Backspace con el campo vacío quita la última; Tab recorre el campo y los botones de quitar.
 */

const BOX_CLASSES = cn(
  'relative flex w-full min-w-0 cursor-text flex-wrap items-center font-sans text-foreground mimi-transition',
  'min-h-[var(--mimi-input-h,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))] rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))]',
  'gap-[var(--mimi-tags-gap,6px)] p-[var(--mimi-tags-padding,5px_10px_5px_6px)]',
  'border border-input bg-input-background',
  'not-data-[disabled]:hover:border-input-hover',
  'data-[full]:border-[color:var(--mimi-tags-full-border,color-mix(in_oklab,var(--mimi-warning)_70%,var(--mimi-input)))]',
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring-soft',
  'data-[invalid]:border-destructive data-[invalid]:focus-within:border-destructive data-[invalid]:focus-within:ring-destructive-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

const INPUT_CLASSES =
  'h-7 min-w-[var(--mimi-tags-input-min-width,120px)] flex-1 border-0 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';

/** Por defecto, solo quita los espacios de los lados (decidido por defecto en la G2.6). */
const trim = (tag: string): string => tag.trim();

/**
 * Tags Input:
 *
 * ```html
 * <mimi-tags-input aria-label="Etiquetas" [limit]="5" formControlName="tags" />
 * ```
 *
 * Implementa `FormValueControl<string[]>`. Lo escrito que no se agregó no es parte del valor.
 */
@Component({
  selector: 'mimi-tags-input',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [MimiChip],
  template: `
    <div
      data-slot="box"
      [class]="boxClasses()"
      [attr.data-invalid]="invalidShown() ? '' : null"
      [attr.data-full]="full() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      (click)="focusField($event)"
    >
      @for (tag of tags(); track $index) {
        <mimi-chip
          [label]="tag"
          [removable]="!disabled() && !readonly()"
          [invalid]="tag === conflict()"
          (remove)="removeAt($index)"
          >{{ tag }}</mimi-chip
        >
      }
      <input
        #field
        type="text"
        [class]="inputClasses"
        [id]="controlId()"
        [value]="draft()"
        [disabled]="disabled()"
        [readOnly]="readonly() || full()"
        [attr.placeholder]="full() ? text.fullPlaceholder : placeholder() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="invalidShown() || null"
        [attr.aria-required]="required() || null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
      />
    </div>
    <div class="flex items-start justify-between gap-3 text-[12.5px]">
      <span
        [id]="messageId"
        role="status"
        data-slot="message"
        class="flex-1"
        [class]="messageClass()"
        >{{ message() }}</span
      >
      @if (limit(); as max) {
        <span
          data-slot="count"
          [id]="countId"
          class="font-semibold tabular-nums"
          [class]="full() ? 'text-warning-soft-foreground' : 'text-muted-foreground'"
          >{{ tags().length }}/{{ max }}</span
        >
      }
    </div>
  `,
  host: {
    class: 'flex w-full min-w-0 flex-col gap-1.5',
    '[attr.data-state]': 'tags().length ? "filled" : "empty"',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.id]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiTagsInput }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTagsInput implements FormValueControl<string[]>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly text = inject(MIMI_TAGS_INPUT_TEXT);
  private readonly announce = injectMimiChipAnnouncer();

  /** Las etiquetas. */
  readonly value = model<string[]>([]);
  /**
   * Máximo de etiquetas (con contador). Sin él, sin límite. No se llama `max`: ese nombre lo
   * escribe Signal Forms con su validador numérico.
   */
  readonly limit = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v === null || v === undefined || v === '' ? undefined : Number(v)),
  });
  /** Caracteres que, al escribirlos, agregan la etiqueta (además de Enter). */
  readonly separators = input<readonly string[]>([',']);
  readonly allowDuplicates = input(false, { transform: booleanAttribute });
  /** Normaliza la etiqueta antes de agregarla. Por defecto, quita los espacios de los lados. */
  readonly normalize = input<(tag: string) => string>(trim);
  /** Valida una etiqueta: devuelve el mensaje de error o nada. */
  readonly validate = input<((tag: string) => string | null | undefined) | undefined>(undefined);
  /** Ayuda debajo del campo. Por defecto, la de los textos («Enter o coma…»). */
  readonly hint = input<string | undefined>(undefined);
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases de la caja, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  readonly touch = output<void>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private static nextId = 0;
  private readonly baseId = `mimi-tags-input-${MimiTagsInput.nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  protected readonly messageId = `${this.baseId}-message`;
  protected readonly countId = `${this.baseId}-count`;
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  /** Lo que se está escribiendo (no es parte del valor). */
  protected readonly draft = signal('');
  /** Error de la última etiqueta que no se pudo agregar (duplicada o inválida). */
  private readonly localError = signal<string | null>(null);
  /** La etiqueta repetida que se intentó agregar (su chip se pinta en rojo). */
  protected readonly conflict = signal<string | null>(null);

  protected readonly tags = computed(() => this.value() ?? []);
  protected readonly full = computed(() => {
    const max = this.limit();
    return max !== undefined && this.tags().length >= max;
  });
  protected readonly invalidShown = computed(() => !!this.localError() || this.showInvalid());
  protected readonly message = computed(() => {
    const error = this.localError();
    if (error) return error;
    const max = this.limit();
    if (this.full() && max !== undefined) return this.text.full(max);
    return this.hint() ?? this.text.help;
  });
  protected readonly messageClass = computed(() =>
    this.localError()
      ? 'text-destructive-soft-foreground'
      : this.full()
        ? 'text-warning-soft-foreground'
        : 'text-muted-foreground',
  );
  protected readonly describedBy = computed(() =>
    this.limit() !== undefined ? `${this.messageId} ${this.countId}` : this.messageId,
  );

  protected readonly boxClasses = computed(() => cn(BOX_CLASSES, this.userClass()));
  protected readonly inputClasses = INPUT_CLASSES;

  /** Un clic en la caja enfoca el campo (no en un botón de quitar). */
  protected focusField(event: MouseEvent): void {
    const el = this.field().nativeElement;
    if ((event.target as HTMLElement).closest('button') || el.disabled) return;
    el.focus();
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const text = el.value;
    this.localError.set(null);
    this.conflict.set(null);
    const separators = this.separators();
    const split = new RegExp(`[${separators.map((s) => s.replace(/[\\\]^-]/g, '\\$&')).join('')}]`);
    const pasted = (event as InputEvent).inputType === 'insertFromPaste';
    if (!separators.length || (!split.test(text) && !pasted)) {
      this.draft.set(text);
      return;
    }
    // Lo escrito antes de un separador se agrega; lo de después queda escrito. Al pegar
    // («angular, diseño, ventas»), se agregan todas.
    const parts = separators.length ? text.split(split) : [text];
    const rest = pasted ? '' : (parts.pop() ?? '');
    for (const part of parts) {
      if (!this.add(part)) {
        this.draft.set(part.trim());
        el.value = this.draft();
        return;
      }
    }
    this.draft.set(rest);
    el.value = rest;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.add(this.draft())) {
        this.draft.set('');
        this.field().nativeElement.value = '';
      }
      return;
    }
    if (event.key === 'Backspace' && !this.draft() && this.tags().length && !this.readonly()) {
      event.preventDefault();
      this.removeAt(this.tags().length - 1);
    }
  }

  /** Quita una etiqueta. El foco va al campo antes (si no, caería a `body` con el botón). */
  removeAt(index: number): void {
    if (this.disabled() || this.readonly()) return;
    const tag = this.tags()[index];
    if (tag === undefined) return;
    this.field().nativeElement.focus();
    this.value.set(this.tags().filter((_, i) => i !== index));
    this.localError.set(null);
    this.conflict.set(null);
    this.announce.removed(tag);
  }

  /** Agrega una etiqueta. Devuelve `false` si no se pudo (y deja el mensaje de error). */
  private add(raw: string): boolean {
    const tag = this.normalize()(raw);
    if (!tag) return true;
    if (this.full()) {
      return false;
    }
    if (!this.allowDuplicates() && this.tags().includes(tag)) {
      this.localError.set(this.text.duplicate(tag));
      this.conflict.set(tag);
      return false;
    }
    const error = this.validate()?.(tag);
    if (error) {
      this.localError.set(error);
      return false;
    }
    this.value.set([...this.tags(), tag]);
    this.announce.added(tag);
    return true;
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.contains(next)) return;
    this.touch.emit();
  }
}
