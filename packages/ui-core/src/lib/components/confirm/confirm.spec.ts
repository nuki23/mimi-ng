import { Component, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiDialogService, MimiDialogTitle } from '@/components/ui/dialog';
import { type MimiConfirmOptions, injectMimiConfirm } from './confirm';
import { MIMI_CONFIRM_TEXT_ES, provideMimiConfirmText } from './confirm-texts';

@Component({
  selector: 'test-host',
  template: `
    <button data-test="opener">Abrir</button>
    <ng-template #icon><svg data-test="svg"></svg></ng-template>
  `,
})
class Host {
  readonly confirm = injectMimiConfirm();
  readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
}

/** Los textos en español vienen de los providers del componente, no de la raíz. */
@Component({
  selector: 'test-spanish-host',
  template: '<button data-test="opener">Abrir</button>',
  providers: [provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)],
})
class SpanishHost {
  readonly confirm = injectMimiConfirm();
}

/** Contenido de un Dialog que pregunta antes de cerrar. */
@Component({
  selector: 'test-dialog-content',
  imports: [MimiDialogTitle],
  template: '<h2 mimiDialogTitle>Editar</h2><button data-test="inside">Dentro</button>',
})
class DialogContent {
  static last: DialogContent | null = null;
  readonly confirm = injectMimiConfirm();

  constructor() {
    DialogContent.last = this;
  }
}

/** El cierre espera la animación (en jsdom no hay) en una microtarea después del render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('injectMimiConfirm', () => {
  async function setup<T extends Host | SpanishHost = Host>(
    component: new () => T = Host as never,
  ) {
    const fixture = TestBed.createComponent(component);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const opener = root.querySelector<HTMLElement>('[data-test="opener"]')!;
    const containers = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.cdk-dialog-container'));
    const container = () => containers().at(-1) ?? null;
    const panel = () =>
      container()?.querySelector<HTMLElement>('[data-mimi-overlay-panel]') ?? null;
    const button = (slot: 'cancel' | 'confirm') =>
      container()!.querySelector<HTMLButtonElement>(`[data-slot="${slot}"]`)!;
    const escape = async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      (document.activeElement ?? document.body).dispatchEvent(event);
      await settle(fixture);
    };
    /** Abre un confirm y guarda su respuesta cuando llega. */
    const ask = async (options: MimiConfirmOptions) => {
      opener.focus();
      const answers: boolean[] = [];
      void fixture.componentInstance.confirm(options).then((answer) => answers.push(answer));
      await settle(fixture);
      return answers;
    };
    return { fixture, opener, containers, container, panel, button, escape, ask };
  }

  afterEach(async () => {
    TestBed.inject(MimiDialogService).closeAll();
    await new Promise((r) => setTimeout(r));
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('abre un alertdialog sin X, nombrado por el título y descrito por la descripción', async () => {
    const { ask, container, panel } = await setup();
    await ask({ title: '¿Publicar los cambios?', description: 'Quedarán visibles para todos.' });
    const dialog = container()!;
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = dialog.querySelector('h2')!;
    const description = dialog.querySelector('p')!;
    expect(title.textContent!.trim()).toBe('¿Publicar los cambios?');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
    expect(dialog.querySelector('[data-slot="close"]')).toBeNull();
    expect(panel()!.hasAttribute('data-close-button')).toBe(false);
  });

  it('las medidas del diseño: panel, título, descripción y botones de 36px', async () => {
    const { ask, panel, button, container } = await setup();
    await ask({ title: 'Título', description: 'Descripción' });
    for (const cls of ['w-[var(--mimi-confirm-width,380px)]', 'p-5', 'gap-3.5', 'flex-col']) {
      expect(panel()!.classList).toContain(cls);
    }
    expect(panel()!.classList).not.toContain('w-[var(--mimi-dialog-width,420px)]');
    const title = container()!.querySelector('h2')!;
    for (const cls of ['text-base', 'leading-[1.3]', 'tracking-normal', 'font-bold']) {
      expect(title.classList).toContain(cls);
    }
    expect(title.classList).not.toContain('text-[18px]');
    expect(title.classList).not.toContain('leading-tight');
    const description = container()!.querySelector('p')!;
    for (const cls of ['text-[13px]', 'leading-normal', 'text-pretty', 'text-muted-foreground']) {
      expect(description.classList).toContain(cls);
    }
    expect(description.classList).not.toContain('text-sm');
    for (const slot of ['cancel', 'confirm'] as const) {
      expect(button(slot).classList).toContain('h-9');
      expect(button(slot).classList).toContain('px-3.5');
      expect(button(slot).classList).not.toContain(
        'h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]',
      );
    }
  });

  it('sin descripción no hay aria-describedby; sin ícono no hay círculo', async () => {
    const { ask, container } = await setup();
    await ask({ title: 'Solo el título' });
    expect(container()!.hasAttribute('aria-describedby')).toBe(false);
    expect(container()!.querySelector('p')).toBeNull();
    expect(container()!.querySelector('[data-slot="icon"]')).toBeNull();
  });

  it('Confirmar resuelve true y Cancelar, false; el foco vuelve al botón que abrió', async () => {
    const { fixture, ask, button, container, opener } = await setup();
    const first = await ask({ title: '¿Seguro?' });
    button('confirm').click();
    await settle(fixture);
    expect(first).toEqual([true]);
    expect(container()).toBeNull();
    expect(document.activeElement).toBe(opener);

    const second = await ask({ title: '¿Seguro?' });
    button('cancel').click();
    await settle(fixture);
    expect(second).toEqual([false]);
    expect(container()).toBeNull();
  });

  it('Escape resuelve false; el clic en el fondo no cierra', async () => {
    const { fixture, ask, escape, container } = await setup();
    const answers = await ask({ title: '¿Seguro?' });
    Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-backdrop')).at(-1)!.click();
    await settle(fixture);
    expect(container()).not.toBeNull();
    expect(answers).toEqual([]);
    await escape();
    expect(container()).toBeNull();
    expect(answers).toEqual([false]);
  });

  it('tono primary: Confirmar en primary con el foco; círculo info-soft', async () => {
    const { fixture, ask, button, container } = await setup();
    await ask({ title: '¿Publicar?', icon: fixture.componentInstance.icon() });
    expect(container()!.querySelector('mimi-confirm')!.getAttribute('data-tone')).toBe('primary');
    expect(document.activeElement).toBe(button('confirm'));
    expect(button('confirm').dataset['variant']).toBe('solid');
    expect(button('confirm').dataset['tone']).toBe('primary');
    expect(button('cancel').dataset['variant']).toBe('outline');
    const icon = container()!.querySelector('[data-slot="icon"]')!;
    expect(icon.classList).toContain('bg-info-soft');
    expect(icon.classList).toContain('text-info-soft-foreground');
  });

  it('tono danger: Confirmar en danger, el foco en Cancelar y el círculo con sus tokens', async () => {
    const { fixture, ask, button, container } = await setup();
    await ask({ title: '¿Eliminar?', tone: 'danger', icon: fixture.componentInstance.icon() });
    expect(container()!.querySelector('mimi-confirm')!.getAttribute('data-tone')).toBe('danger');
    expect(document.activeElement).toBe(button('cancel'));
    expect(button('confirm').dataset['tone']).toBe('danger');
    expect(button('cancel').dataset['tone']).toBe('secondary');
    const icon = container()!.querySelector('[data-slot="icon"]')!;
    expect(icon.classList).toContain(
      'bg-[color:var(--mimi-confirm-icon-bg,var(--mimi-destructive-soft-bg))]',
    );
    expect(icon.classList).toContain(
      'text-[color:var(--mimi-confirm-icon-fg,var(--mimi-destructive-soft-foreground))]',
    );
  });

  it('ícono: la plantilla va en el círculo de 40px, oculto a los lectores', async () => {
    const { fixture, ask, container } = await setup();
    await ask({ title: '¿Publicar?', icon: fixture.componentInstance.icon() });
    const icon = container()!.querySelector<HTMLElement>('[data-slot="icon"]')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('[data-test="svg"]')).not.toBeNull();
    for (const cls of ['size-10', 'rounded-full', '[&_svg]:size-5']) {
      expect(icon.classList).toContain(cls);
    }
  });

  it('textos: inglés por defecto; los de la página o el componente; los de la llamada ganan', async () => {
    const english = await setup();
    await english.ask({ title: 'Default' });
    expect(english.button('cancel').textContent!.trim()).toBe('Cancel');
    expect(english.button('confirm').textContent!.trim()).toBe('Confirm');
    TestBed.inject(MimiDialogService).closeAll();
    await settle(english.fixture);

    const spanish = await setup(SpanishHost);
    await spanish.ask({ title: 'Español' });
    expect(spanish.button('cancel').textContent!.trim()).toBe('Cancelar');
    expect(spanish.button('confirm').textContent!.trim()).toBe('Confirmar');
    TestBed.inject(MimiDialogService).closeAll();
    await settle(spanish.fixture);

    await spanish.ask({ title: 'Propios', confirmText: 'Eliminar', cancelText: 'Volver' });
    expect(spanish.button('cancel').textContent!.trim()).toBe('Volver');
    expect(spanish.button('confirm').textContent!.trim()).toBe('Eliminar');
  });

  it('class va al panel y gana, también al ancho', async () => {
    const { ask, panel } = await setup();
    await ask({ title: 'Ancho', class: 'w-[440px] rounded-none' });
    expect(panel()!.classList).toContain('w-[440px]');
    expect(panel()!.classList).toContain('rounded-none');
    expect(panel()!.classList).not.toContain('w-[var(--mimi-confirm-width,380px)]');
    expect(panel()!.style.width).toBe('');
  });

  it('closeAll y dos confirm seguidos: cada uno resuelve una vez', async () => {
    const { fixture, ask, button, containers } = await setup();
    const first = await ask({ title: 'Uno' });
    TestBed.inject(MimiDialogService).closeAll();
    await settle(fixture);
    expect(first).toEqual([false]);
    expect(containers().length).toBe(0);

    const second = await ask({ title: 'Dos' });
    button('confirm').click();
    await settle(fixture);
    const third = await ask({ title: 'Tres' });
    expect(containers().length).toBe(1);
    expect(document.activeElement).toBe(button('confirm'));
    button('cancel').click();
    await settle(fixture);
    expect(second).toEqual([true]);
    expect(third).toEqual([false]);
  });

  it('sobre un Dialog abierto: Escape cierra solo el confirm y el foco vuelve al Dialog', async () => {
    const { fixture, containers, escape } = await setup();
    const dialogAnswers: unknown[] = [];
    TestBed.inject(MimiDialogService)
      .open(DialogContent, { autoFocus: '[data-test="inside"]' })
      .afterClosed()
      .subscribe((result) => dialogAnswers.push(result));
    await settle(fixture);
    const inside = containers()[0].querySelector<HTMLElement>('[data-test="inside"]')!;
    expect(document.activeElement).toBe(inside);

    const answers: boolean[] = [];
    void DialogContent.last!.confirm({ title: '¿Descartar?' }).then((a) => answers.push(a));
    await settle(fixture);
    expect(containers().length).toBe(2);
    await escape();
    expect(answers).toEqual([false]);
    expect(containers().length).toBe(1);
    expect(dialogAnswers).toEqual([]);
    expect(document.activeElement).toBe(inside);
  });

  it('se abre después del render en curso; si el componente se destruye, cierra con false', async () => {
    const { fixture, container } = await setup();
    const answers: boolean[] = [];
    void fixture.componentInstance.confirm({ title: 'Uno' }).then((a) => answers.push(a));
    expect(container()).toBeNull();
    await settle(fixture);
    expect(container()).not.toBeNull();
    fixture.destroy();
    await settle(fixture);
    expect(answers).toEqual([false]);
    expect(container()).toBeNull();
  });

  it('fuera del contexto de inyección falla con NG0203', () => {
    // El mensaje que muestra la documentación.
    expect(() => injectMimiConfirm()).toThrowError(
      /NG0203: injectMimiConfirm\(\) can only be used within an injection context/,
    );
  });
});
