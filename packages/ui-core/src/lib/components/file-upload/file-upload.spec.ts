import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import {
  MimiFileUpload,
  MimiFileUploadImports,
  type MimiFileRejection,
  type MimiFileStatus,
  mimiFileMatchesAccept,
  mimiFormatFileSize,
} from './file-upload';
import { MIMI_FILE_UPLOAD_TEXT_ES, provideMimiFileUploadText } from './file-upload-texts';

const MB = 1_000_000;
const file = (name: string, type: string, size = 1000) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

@Component({
  imports: [MimiFileUploadImports, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <mimi-file-upload
      #zone
      data-test="plain"
      accept="image/*,.pdf"
      multiple
      hint="PNG, JPG o PDF · hasta 10 MB"
      [maxSize]="10 * mb"
      [maxFiles]="maxFiles()"
      [disabled]="off()"
      [class]="extra()"
      [(value)]="files"
      (rejected)="rejected.push($event)"
    />
    <mimi-file-list [emptyFocus]="zone">
      @for (f of files(); track f) {
        <mimi-file-item
          [file]="f"
          [status]="statusOf(f)"
          [progress]="40"
          error="Falló la red."
          (remove)="removeFile(f)"
          (retry)="retries = retries + 1"
        />
      }
    </mimi-file-list>
    <mimi-file-upload data-test="single" aria-label="Avatar" accept="image/*" [(value)]="single" />
    <span id="fu-ext-label">Etiqueta</span>
    <mimi-file-upload
      data-test="titled"
      aria-labelledby="fu-ext-label"
      heading="Sube tu CV"
      title="Globo"
    />
    <mimi-file-upload data-test="reactive" aria-label="R" multiple [formControl]="control" />
    <mimi-file-upload data-test="signal" aria-label="S" multiple [formField]="signalForm.files" />
    <mimi-file-upload data-test="ng-model" aria-label="M" multiple name="f" [(ngModel)]="model" />
  `,
})
class Host {
  readonly mb = MB;
  readonly files = signal<File[]>([]);
  readonly single = signal<File[]>([]);
  readonly maxFiles = signal<number | undefined>(undefined);
  readonly off = signal(false);
  readonly extra = signal('');
  readonly status = signal(new Map<File, MimiFileStatus>());
  readonly rejected: MimiFileRejection[][] = [];
  retries = 0;
  statusOf(f: File): MimiFileStatus {
    return this.status().get(f) ?? 'uploading';
  }
  removeFile(f: File): void {
    this.files.update((list) => list.filter((x) => x !== f));
  }
  readonly control = new FormControl<File[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly data = signal<{ files: File[] }>({ files: [] });
  readonly signalForm = form(this.data, (p) => required(p.files));
  readonly model = signal<File[]>([]);
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('utilidades de File Upload', () => {
  it('accept: tipos, comodines y extensiones (también sin el tipo del navegador)', () => {
    expect(mimiFileMatchesAccept(file('a.png', 'image/png'), 'image/*,.pdf')).toBe(true);
    expect(mimiFileMatchesAccept(file('a.PDF', ''), 'image/*,.pdf')).toBe(true);
    expect(mimiFileMatchesAccept(file('a.mp4', 'video/mp4'), 'image/*,.pdf')).toBe(false);
    expect(mimiFileMatchesAccept(file('a.mp4', 'video/mp4'), '')).toBe(true);
  });

  it('tamaño con el idioma', () => {
    expect(mimiFormatFileSize(2_400_000, 'es')).toBe('2,4 MB');
    expect(mimiFormatFileSize(2_400_000, 'en-US')).toBe('2.4 MB');
    expect(mimiFormatFileSize(900, 'en-US')).toBe('900 byte');
  });
});

describe('MimiFileUpload', () => {
  let announced: string[];

  async function setup() {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        provideMimiFileUploadText(MIMI_FILE_UPLOAD_TEXT_ES),
        {
          provide: LiveAnnouncer,
          useValue: { announce: (m: string) => (announced.push(m), Promise.resolve()) },
        },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) =>
      root.querySelector<HTMLElement>(`mimi-file-upload[data-test="${id}"]`)!;
    const zone = (id: string) => host(id).querySelector<HTMLButtonElement>('button')!;
    const picker = (id: string) => host(id).querySelector<HTMLInputElement>('input[type="file"]')!;
    const pick = async (id: string, files: File[]) => {
      const input = picker(id);
      Object.defineProperty(input, 'files', { configurable: true, value: files });
      input.dispatchEvent(new Event('change'));
      await settle(fixture);
    };
    const drag = (id: string, type: string, files: File[] = []) => {
      const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', {
        value: { files, items: files.map(() => ({ kind: 'file' })), dropEffect: 'none' },
      });
      zone(id).dispatchEvent(event);
      return event;
    };
    const items = () => Array.from(root.querySelectorAll<HTMLElement>('mimi-file-item'));
    return { fixture, h: fixture.componentInstance, root, host, zone, picker, pick, drag, items };
  }

  it('la zona es un <button> con su nombre, la descripción de lo que acepta y el input oculto', async () => {
    const { zone, picker, host } = await setup();
    const z = zone('plain');
    expect(z.getAttribute('type')).toBe('button');
    expect(z.hasAttribute('aria-label')).toBe(false);
    expect(document.getElementById(z.getAttribute('aria-describedby')!)?.textContent).toBe(
      'PNG, JPG o PDF · hasta 10 MB',
    );
    expect(z.textContent).toContain('Arrastra archivos o haz clic');
    expect(z.className).toContain('border-dashed');
    expect(z.className).toContain('min-h-[var(--mimi-upload-height,176px)]');
    expect(picker('plain').hidden).toBe(true);
    expect(picker('plain').getAttribute('accept')).toBe('image/*,.pdf');
    expect(picker('plain').multiple).toBe(true);
    expect(host('single').querySelector('input')!.multiple).toBe(false);
  });

  it('el nombre accesible contiene el título visible (WCAG 2.5.3), también con aria-label', async () => {
    const { fixture, zone, host, drag } = await setup();
    const name = (id: string) =>
      zone(id)
        .getAttribute('aria-labelledby')!
        .split(' ')
        .map((ref) => document.getElementById(ref)!.textContent!.trim())
        .join(', ');
    const visible = (id: string) =>
      zone(id).querySelector('[data-slot="title"]')!.textContent!.trim();
    expect(name('plain')).toBe('Arrastra archivos o haz clic');
    expect(name('plain')).toContain(visible('plain'));
    // aria-label va delante del título, no lo reemplaza; ni el host ni la zona lo llevan.
    expect(name('single')).toBe('Avatar, Arrastra archivos o haz clic');
    expect(zone('single').hasAttribute('aria-label')).toBe(false);
    expect(host('single').hasAttribute('aria-label')).toBe(false);
    // Un título propio en `heading`; `title` queda libre como atributo nativo.
    expect(name('titled')).toBe('Etiqueta, Sube tu CV');
    expect(host('titled').getAttribute('title')).toBe('Globo');
    // Al arrastrar cambia el texto visible, y el nombre con él.
    drag('plain', 'dragenter', [new File(['x'], 'a.pdf')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(name('plain')).toBe(visible('plain'));
    expect(name('plain')).toBe('Suelta para subir 1 archivo');
  });

  it('clic (y Enter o Espacio, que dan clic en un <button>) abre el selector', async () => {
    const { zone, picker } = await setup();
    const click = vi.fn();
    picker('plain').addEventListener('click', click);
    zone('plain').click();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('elegir agrega al valor, anuncia y vacía el input; los rechazados no entran', async () => {
    const { h, pick, picker } = await setup();
    await pick('plain', [
      file('portada.jpg', 'image/jpeg', 2 * MB),
      file('video.mp4', 'video/mp4', MB),
      file('enorme.pdf', 'application/pdf', 48 * MB),
    ]);
    expect(h.files().map((f) => f.name)).toEqual(['portada.jpg']);
    expect(picker('plain').value).toBe('');
    expect(h.rejected[0].map((r) => [r.file.name, r.reason, r.message])).toEqual([
      ['video.mp4', 'type', 'Tipo de archivo no permitido.'],
      ['enorme.pdf', 'size', 'Supera el máximo de 10 MB.'],
    ]);
    expect(announced).toContain('1 archivo agregado');
    expect(announced.at(-1)).toContain('enorme.pdf no se agregó: Supera el máximo de 10 MB.');
  });

  it('maxFiles cuenta los que ya están; sin multiple, uno nuevo reemplaza', async () => {
    const { h, fixture, pick } = await setup();
    h.maxFiles.set(2);
    await settle(fixture);
    await pick('plain', [file('a.png', 'image/png')]);
    await pick('plain', [file('b.png', 'image/png'), file('c.png', 'image/png')]);
    expect(h.files().map((f) => f.name)).toEqual(['a.png', 'b.png']);
    expect(h.rejected.at(-1)![0].reason).toBe('count');
    await pick('single', [file('uno.png', 'image/png')]);
    await pick('single', [file('dos.png', 'image/png')]);
    expect(h.single().map((f) => f.name)).toEqual(['dos.png']);
  });

  it('arrastrar: «encima» sin parpadeo con los hijos, cuenta los archivos y valida lo soltado', async () => {
    const { h, fixture, zone, drag } = await setup();
    expect(
      drag('plain', 'dragenter', [file('a.png', 'image/png'), file('b.png', 'image/png')])
        .defaultPrevented,
    ).toBe(true);
    drag('plain', 'dragenter');
    drag('plain', 'dragleave');
    await settle(fixture);
    expect(zone('plain').dataset['state']).toBe('over');
    expect(zone('plain').textContent).toContain('Suelta para subir 2 archivos');
    expect(zone('plain').className).toContain('scale-[1.01]');
    expect(zone('plain').className).toContain('motion-reduce:scale-100');
    expect(zone('plain').querySelector('[aria-hidden]')!.className).toContain(
      'motion-reduce:animate-none',
    );
    drag('plain', 'drop', [file('foto.png', 'image/png'), file('nota.txt', 'text/plain')]);
    await settle(fixture);
    expect(zone('plain').dataset['state']).toBe('idle');
    expect(h.files().map((f) => f.name)).toEqual(['foto.png']);
    expect(h.rejected.at(-1)![0].file.name).toBe('nota.txt');
  });

  it('deshabilitado: no abre ni acepta lo soltado', async () => {
    const { h, fixture, zone, drag } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(zone('plain').disabled).toBe(true);
    drag('plain', 'drop', [file('a.png', 'image/png')]);
    await settle(fixture);
    expect(h.files()).toEqual([]);
  });

  it('la lista: miniatura de imágenes, ícono de PDF, tamaño, progreso con nombre, subido y error', async () => {
    const { h, fixture, pick, items, root } = await setup();
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    await pick('plain', [
      file('foto.png', 'image/png', 2_400_000),
      file('contrato.pdf', 'application/pdf'),
    ]);
    expect(root.querySelector('mimi-file-list')!.getAttribute('role')).toBe('list');
    expect(root.querySelector('mimi-file-list')!.getAttribute('aria-label')).toBe('Archivos');
    const [photo, pdf] = items();
    expect(photo.querySelector('img')!.getAttribute('src')).toBe('blob:x');
    expect(pdf.querySelector('[data-slot="icon"]')!.className).toContain('bg-destructive-soft-bg');
    expect(photo.querySelector('[data-slot="size"]')!.textContent?.trim()).toBe('2.4 MB');
    expect(photo.querySelector('mimi-progress')!.getAttribute('aria-label')).toBe(
      'Subiendo foto.png',
    );
    const [f1, f2] = h.files();
    h.status.set(
      new Map<File, MimiFileStatus>([
        [f1, 'done'],
        [f2, 'error'],
      ]),
    );
    await settle(fixture);
    expect(photo.querySelector('[data-slot="done"]')!.textContent?.trim()).toBe('Subido');
    expect(pdf.querySelector('[data-slot="error"]')!.textContent?.trim()).toBe('Falló la red.');
    expect(pdf.dataset['status']).toBe('error');
    expect(announced).toContain('foto.png subido');
    expect(announced).toContain('contrato.pdf con error: Falló la red.');
    Array.from(pdf.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Reintentar'))!
      .click();
    expect(h.retries).toBe(1);
    // Quitar libera la miniatura.
    photo.querySelector<HTMLButtonElement>('[data-slot="remove"]')!.click();
    await settle(fixture);
    expect(revoke).toHaveBeenCalledWith('blob:x');
    create.mockRestore();
    revoke.mockRestore();
  });

  it('quitar con el foco en el botón lo deja en el siguiente, el anterior o la zona', async () => {
    const { h, pick, items, zone, fixture } = await setup();
    await pick('plain', [file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf')]);
    const removeOf = (i: number) =>
      items()[i].querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
    expect(removeOf(0).getAttribute('aria-label')).toBe('Quitar a.pdf');
    removeOf(0).focus();
    expect(document.activeElement, 'foco inicial').toBe(removeOf(0));
    const second = removeOf(1);
    removeOf(0).click();
    expect(document.activeElement, 'justo después del clic').toBe(second);
    await settle(fixture);
    expect(h.files().map((f) => f.name)).toEqual(['b.pdf']);
    expect(removeOf(0), 'la misma fila').toBe(second);
    expect(document.activeElement, 'al siguiente').toBe(removeOf(0));
    removeOf(0).click();
    await settle(fixture);
    expect(document.activeElement).toBe(zone('plain'));
  });

  it('destruir libera las miniaturas', async () => {
    const { fixture, pick } = await setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:y');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    await pick('plain', [file('a.png', 'image/png')]);
    fixture.destroy();
    expect(revoke).toHaveBeenCalledWith('blob:y');
    vi.restoreAllMocks();
  });

  it('formularios: Reactive (requerido), Signal Forms y ngModel', async () => {
    const { h, fixture, pick, zone, host } = await setup();
    await pick('reactive', [file('a.txt', 'text/plain')]);
    expect(h.control.value.map((f) => f.name)).toEqual(['a.txt']);
    expect(h.control.touched).toBe(true);
    h.control.setValue([]);
    await settle(fixture);
    expect(zone('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(host('reactive').hasAttribute('data-invalid')).toBe(true);
    expect(zone('reactive').className).toContain(
      'border-[color:var(--mimi-input-error,var(--mimi-destructive))]',
    );
    expect(zone('signal').getAttribute('aria-required')).toBe('true');
    await pick('signal', [file('b.txt', 'text/plain')]);
    expect(h.data().files.map((f) => f.name)).toEqual(['b.txt']);
    await pick('ng-model', [file('c.txt', 'text/plain')]);
    expect(h.model().map((f) => f.name)).toEqual(['c.txt']);
    h.control.disable();
    await settle(fixture);
    expect(zone('reactive').disabled).toBe(true);
  });

  it('class va a la zona; Mimi no hace peticiones (sin HttpClient)', async () => {
    const { h, fixture, zone } = await setup();
    h.extra.set('min-h-24');
    await settle(fixture);
    expect(zone('plain').classList).toContain('min-h-24');
    expect(zone('plain').className).not.toContain('min-h-[var(--mimi-upload-height');
    const instance = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MimiFileUpload,
    ).componentInstance as unknown as Record<string, unknown>;
    expect(Object.values(instance).some((v) => v?.constructor?.name === 'HttpClient')).toBe(false);
  });
});
