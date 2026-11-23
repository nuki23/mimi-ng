import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import type { MimiSize } from '@/components/ui/utils/size';
import { MimiStepperImports, type MimiStepperOrientation } from './stepper';
import { MIMI_STEPPER_TEXT_ES, provideMimiStepperText } from './stepper-texts';

@Component({
  imports: [MimiStepperImports],
  template: `
    <mimi-stepper
      #pasos="mimiStepper"
      aria-label="Alta de cliente"
      [linear]="linear()"
      [orientation]="orientation()"
      [size]="size()"
      [class]="extra()"
      [(value)]="step"
      (finish)="finished = finished + 1"
    >
      <mimi-step title="Datos" [form]="reactive">
        <input data-test="name" />
      </mimi-step>
      <mimi-step title="Envío" [form]="signalForm">Dirección</mimi-step>
      <mimi-step title="Regalo" optional [form]="optionalForm">Mensaje</mimi-step>
      <mimi-step title="Confirmar" description="Revisa y envía" [error]="forcedError()"
        >Fin</mimi-step
      >
      <mimi-step title="Bloqueado" disabled>Nada</mimi-step>
    </mimi-stepper>
    <button data-test="prev" [mimiStepperPrev]="pasos">Atrás</button>
    <button data-test="next" [mimiStepperNext]="pasos">Siguiente</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly linear = signal(true);
  readonly orientation = signal<MimiStepperOrientation>('horizontal');
  readonly size = signal<MimiSize | undefined>(undefined);
  readonly extra = signal('');
  readonly forcedError = signal(false);
  readonly step = signal(0);
  finished = 0;
  readonly reactive = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = signal({ street: '' });
  readonly signalForm = form(this.address, (p) => required(p.street));
  readonly optionalForm = new FormGroup({ note: new FormControl('', Validators.required) });
}

async function setup(providers: unknown[] = []) {
  TestBed.configureTestingModule({ providers: providers as never[] });
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const triggers = () =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="step-trigger"]'));
  const steps = () => Array.from(el.querySelectorAll<HTMLElement>('mimi-step'));
  const states = () => triggers().map((t) => t.dataset['state']);
  const stable = () => fixture.whenStable();
  const click = async (selector: string) => {
    el.querySelector<HTMLElement>(selector)!.click();
    await stable();
  };
  return { fixture, el, host, triggers, steps, states, stable, click };
}

describe('MimiStepper', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('lista ordenada con nombre; el actual con aria-current="step"; cada paso con su panel', async () => {
    const { el, triggers, steps } = await setup();
    const list = el.querySelector('ol')!;
    expect(list.getAttribute('aria-label')).toBe('Alta de cliente');
    // El nombre va a la lista, no al anfitrión (un elemento sin rol).
    expect(el.querySelector('mimi-stepper')!.hasAttribute('aria-label')).toBe(false);
    expect(list.querySelectorAll(':scope > li').length).toBe(5);
    expect(triggers()[0].getAttribute('aria-current')).toBe('step');
    expect(triggers()[1].hasAttribute('aria-current')).toBe(false);
    // Nombre para los lectores: «Step 1 of 5: Datos, Current».
    expect(triggers()[0].textContent!.replace(/\s+/g, ' ')).toContain(
      'Step 1 of 5: Datos, Current',
    );
    // El panel del actual, visible; los demás, ocultos. Panel y botón se enlazan.
    expect(steps()[0].hidden).toBe(false);
    expect(steps()[1].hidden).toBe(true);
    expect(triggers()[0].getAttribute('aria-controls')).toBe(steps()[0].id);
    expect(steps()[0].getAttribute('aria-labelledby')).toBe(triggers()[0].id);
    expect(steps()[0].getAttribute('role')).toBe('group');
    // `title` no queda como atributo (sin el tooltip del navegador sobre el contenido).
    for (const step of steps()) expect(step.hasAttribute('title')).toBe(false);
    // Descripción propia y marca de opcional.
    expect(triggers()[3].textContent).toContain('Revisa y envía');
    expect(triggers()[2].textContent).toContain('Optional');
  });

  it('lineal con Reactive Forms: no avanza con el paso inválido, lo marca tocado y en error', async () => {
    const { host, states, click, triggers, stable } = await setup();
    await click('[data-test="next"]');
    expect(host.step()).toBe(0);
    expect(host.reactive.touched).toBe(true);
    expect(states()[0]).toBe('error');
    // Saltar desde la lista tampoco: el futuro no es alcanzable.
    expect(triggers()[2].getAttribute('aria-disabled')).toBe('true');
    triggers()[2].click();
    await stable();
    expect(host.step()).toBe(0);
    host.reactive.setValue({ name: 'Ana' });
    await click('[data-test="next"]');
    expect(host.step()).toBe(1);
    expect(states().slice(0, 2)).toEqual(['completed', 'current']);
  });

  // Revisión de accesibilidad de la tanda 2 (S2): un lector de pantalla no sabía por qué no
  // avanzaba; (S3): la coma del nombre va dentro del título (título y texto son bloques).
  it('si no se puede dejar el paso: lo anuncia y el foco va al campo; la coma, en el título', async () => {
    const { el, triggers, click, stable } = await setup();
    await click('[data-test="next"]');
    await stable();
    await new Promise((r) => setTimeout(r));
    expect(el.querySelector('[role="status"]')!.textContent!.trim()).toBe(
      'Step 1 of 5: Datos has errors',
    );
    expect(document.activeElement).toBe(el.querySelector('[data-test="name"]'));
    const title = triggers()[0].querySelector('[data-slot="step-title"]')!;
    expect(title.querySelector('.sr-only')!.textContent).toBe(',');
    const hint = triggers()[0].querySelector('[data-slot="step-hint"]')!;
    expect(hint.textContent!.trim().startsWith(',')).toBe(false);
  });

  it('lineal con Signal Forms: lo mismo con un campo de form()', async () => {
    const { host, states, click, stable } = await setup();
    host.reactive.setValue({ name: 'Ana' });
    host.step.set(1);
    await stable();
    await click('[data-test="next"]');
    expect(host.step()).toBe(1);
    expect(host.signalForm.street().touched()).toBe(true);
    expect(states()[1]).toBe('error');
    host.address.set({ street: 'Mayor 1' });
    await stable();
    expect(states()[1]).toBe('current');
    await click('[data-test="next"]');
    expect(host.step()).toBe(2);
  });

  it('opcional no frena; deshabilitado no se alcanza; desde el último, finish; Atrás vuelve', async () => {
    const { host, triggers, click, stable } = await setup();
    host.reactive.setValue({ name: 'Ana' });
    host.address.set({ street: 'Mayor 1' });
    host.step.set(2);
    await stable();
    // El opcional tiene su formulario inválido y deja pasar.
    await click('[data-test="next"]');
    expect(host.step()).toBe(3);
    // El deshabilitado: aria-disabled y no se va.
    expect(triggers()[4].getAttribute('aria-disabled')).toBe('true');
    triggers()[4].click();
    await stable();
    expect(host.step()).toBe(3);
    // Atrás y adelante desde la lista (los anteriores siempre se alcanzan).
    await click('[data-test="prev"]');
    expect(host.step()).toBe(2);
    triggers()[0].click();
    await stable();
    expect(host.step()).toBe(0);
    // finish desde el último paso.
    host.step.set(4);
    await stable();
    await click('[data-test="next"]');
    expect(host.finished).toBe(1);
  });

  it('libre (sin linear): cualquier paso desde la lista, aunque el actual sea inválido', async () => {
    const { host, triggers, stable } = await setup();
    host.linear.set(false);
    await stable();
    triggers()[3].click();
    await stable();
    expect(host.step()).toBe(3);
    // Los anteriores inválidos quedan pendientes (no completados).
    expect(triggers()[0].dataset['state']).toBe('pending');
  });

  it('error propio (`error`) y anuncio del cambio de paso en role="status"', async () => {
    const { host, el, triggers, stable } = await setup([
      provideMimiStepperText(MIMI_STEPPER_TEXT_ES),
    ]);
    const status = el.querySelector('[role="status"]')!;
    expect(status.textContent!.trim()).toBe('');
    host.forcedError.set(true);
    host.linear.set(false);
    await stable();
    expect(triggers()[3].dataset['state']).toBe('error');
    expect(triggers()[3].textContent).toContain('Con error');
    triggers()[1].click();
    await stable();
    expect(status.textContent!.trim()).toBe('Paso 2 de 5: Envío');
    expect(triggers()[1].textContent!.replace(/\s+/g, ' ')).toContain('Paso 2 de 5: Envío, Actual');
  });

  // 23/11/2026, error del usuario: las líneas salían desplazadas y cortadas. jsdom no maqueta: se
  // miran las posiciones (la medida, ±2 px, la hace Playwright).
  it('línea del borde de un círculo al del siguiente: el botón centrado en su columna', async () => {
    const { host, el, stable } = await setup();
    const item = () => el.querySelector<HTMLElement>('ol > li')!.className.split(/\s+/);
    const line = () =>
      el.querySelector<HTMLElement>('[data-slot="step-line"]')!.className.split(/\s+/);
    expect(item()).toContain('sm:justify-center');
    for (const cls of [
      'top-[var(--mimi-stepper-s,32px)]',
      'bottom-0',
      'sm:start-[calc(50%_+_var(--mimi-stepper-s,32px)/2)]',
      'sm:end-[calc(-50%_+_var(--mimi-stepper-s,32px)/2)]',
    ]) {
      expect(line(), cls).toContain(cls);
    }
    host.orientation.set('vertical');
    await stable();
    expect(line()).toContain('top-[var(--mimi-stepper-s,32px)]');
    expect(line()).toContain('bottom-0');
  });

  it('orientación: horizontal es vertical en el teléfono (sm:); vertical, siempre', async () => {
    const { host, el, stable } = await setup();
    const list = () => el.querySelector('ol')!.className;
    expect(list()).toContain('flex-col');
    expect(list()).toContain('sm:grid');
    expect(el.querySelector('mimi-stepper')!.getAttribute('data-orientation')).toBe('horizontal');
    host.orientation.set('vertical');
    await stable();
    expect(list()).not.toContain('sm:grid');
    expect(el.querySelector('mimi-stepper')!.getAttribute('data-orientation')).toBe('vertical');
  });

  it('size, class del usuario y línea entre pasos (hecha tras un completado)', async () => {
    const { host, el, stable } = await setup();
    const root = el.querySelector<HTMLElement>('mimi-stepper')!;
    host.size.set('lg');
    host.extra.set('max-w-xl');
    host.reactive.setValue({ name: 'Ana' });
    host.step.set(1);
    await stable();
    expect(root.dataset['size']).toBe('lg');
    expect(root.className.split(/\s+/)).toContain('max-w-xl');
    const lines = el.querySelectorAll<HTMLElement>('[data-slot="step-line"]');
    expect(lines.length).toBe(4);
    expect(lines[0].hasAttribute('data-done')).toBe(true);
    expect(lines[1].hasAttribute('data-done')).toBe(false);
    const indicator = el.querySelector('[data-slot="indicator"]')!;
    expect(indicator.className).toContain('size-[var(--mimi-stepper-s,32px)]');
    expect(indicator.className).toContain('shadow-[shadow:0_0_0_4px_var(--mimi-ring-soft)]');
    expect(lines[0].className).toContain('bg-[color:var(--mimi-stepper-line,var(--mimi-border))]');
  });
});
