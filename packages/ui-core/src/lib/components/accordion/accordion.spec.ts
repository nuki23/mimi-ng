import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { MimiSize } from '@/components/ui/utils/size';
import { MimiAccordionImports, type MimiAccordionIndicator } from './accordion';

@Component({
  imports: [MimiAccordionImports],
  template: `
    <mimi-accordion
      data-test="faq"
      [multiple]="multiple()"
      [disabled]="allDisabled()"
      [indicator]="indicator()"
      [size]="size()"
      [level]="level()"
      [class]="extra()"
      [(value)]="value"
    >
      <mimi-accordion-item value="envio" title="¿Cuánto tarda el envío?">
        De 2 a 4 días. <a href="#">Seguimiento</a>
      </mimi-accordion-item>
      <mimi-accordion-item value="pago" title="¿Cómo pago?" [class]="itemExtra()">
        Con tarjeta.
      </mimi-accordion-item>
      <mimi-accordion-item value="bloqueado" title="Solo para socios" disabled>
        Oculto.
      </mimi-accordion-item>
      <mimi-accordion-item value="propia">
        <svg mimiAccordionStart data-test="start"></svg>
        <span mimiAccordionTitle>Devoluciones <b>gratis</b></span>
        <span mimiAccordionEnd data-test="end">3</span>
        30 días.
      </mimi-accordion-item>
    </mimi-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly multiple = signal(false);
  readonly allDisabled = signal(false);
  readonly indicator = signal<MimiAccordionIndicator>('chevron');
  readonly size = signal<MimiSize | undefined>(undefined);
  readonly level = signal(3);
  readonly extra = signal('');
  readonly itemExtra = signal('');
  readonly value = signal<string | readonly string[] | null>(null);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const triggers = () =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'));
  const panels = () =>
    Array.from(el.querySelectorAll<HTMLElement>('[data-slot="accordion-panel"]'));
  const items = () => Array.from(el.querySelectorAll<HTMLElement>('mimi-accordion-item'));
  const root = () => el.querySelector<HTMLElement>('mimi-accordion')!;
  const stable = () => fixture.whenStable();
  return { fixture, el, host, triggers, panels, items, root, stable };
}

const key = (target: Element, k: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('MimiAccordion', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('patrón APG: botón en un encabezado, aria-expanded, aria-controls y región con aria-labelledby', async () => {
    const { triggers, panels } = await setup();
    const [trigger] = triggers();
    const [panel] = panels();
    const heading = trigger.parentElement!;
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('3');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.textContent).toContain('¿Cuánto tarda el envío?');
    // Cerrado: inert (ni el foco ni los lectores entran) y sin filas.
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(panel.dataset['state']).toBe('closed');
    // Ids únicos.
    const ids = [...triggers(), ...panels()].map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uno a la vez: abrir uno cierra el otro, y el abierto se puede cerrar; value de dos vías', async () => {
    const { host, triggers, panels, items, stable } = await setup();
    triggers()[0].click();
    await stable();
    expect(host.value()).toBe('envio');
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(panels()[0].hasAttribute('inert')).toBe(false);
    expect(items()[0].dataset['state']).toBe('open');
    triggers()[1].click();
    await stable();
    expect(host.value()).toBe('pago');
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    triggers()[1].click();
    await stable();
    expect(host.value()).toBeNull();
    // Desde fuera.
    host.value.set('propia');
    await stable();
    expect(triggers()[3].getAttribute('aria-expanded')).toBe('true');
  });

  it('multiple: varios abiertos a la vez, value es la lista', async () => {
    const { host, triggers, root, stable } = await setup();
    host.multiple.set(true);
    await stable();
    expect(root().hasAttribute('data-multiple')).toBe(true);
    triggers()[0].click();
    await stable();
    triggers()[1].click();
    await stable();
    expect(host.value()).toEqual(['envio', 'pago']);
    expect(triggers().filter((t) => t.getAttribute('aria-expanded') === 'true').length).toBe(2);
    triggers()[0].click();
    await stable();
    expect(host.value()).toEqual(['pago']);
  });

  it('deshabilitado: el ítem (y todo el acordeón) sigue enfocable con aria-disabled y no abre', async () => {
    const { host, triggers, items, root, stable } = await setup();
    const blocked = triggers()[2];
    expect(blocked.getAttribute('aria-disabled')).toBe('true');
    expect(blocked.disabled).toBe(false);
    expect(items()[2].hasAttribute('data-disabled')).toBe(true);
    blocked.click();
    await stable();
    expect(host.value()).toBeNull();
    host.allDisabled.set(true);
    await stable();
    expect(root().hasAttribute('data-disabled')).toBe(true);
    for (const t of triggers()) expect(t.getAttribute('aria-disabled')).toBe('true');
    triggers()[0].click();
    await stable();
    expect(host.value()).toBeNull();
  });

  it('teclado: ↓/↑ con vuelta, Inicio y Fin entre cabeceras (también las deshabilitadas)', async () => {
    const { triggers } = await setup();
    const [first, second, third, fourth] = triggers();
    first.focus();
    key(first, 'ArrowDown');
    expect(document.activeElement).toBe(second);
    key(second, 'ArrowDown');
    expect(document.activeElement).toBe(third);
    key(third, 'End');
    expect(document.activeElement).toBe(fourth);
    key(fourth, 'ArrowDown');
    expect(document.activeElement).toBe(first);
    key(first, 'ArrowUp');
    expect(document.activeElement).toBe(fourth);
    key(fourth, 'Home');
    expect(document.activeElement).toBe(first);
    // Todas en el orden de Tab (la APG): ninguna con tabindex -1.
    for (const t of triggers()) expect(t.getAttribute('tabindex')).toBeNull();
    // Una tecla que no es suya no se cancela.
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    first.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
  });

  it('piezas de la cabecera: título rico, inicio y final dentro del botón', async () => {
    const { triggers } = await setup();
    const custom = triggers()[3];
    expect(custom.querySelector('[mimiAccordionTitle]')!.textContent).toBe('Devoluciones gratis');
    expect(custom.querySelector('[data-test="start"]')!.getAttribute('aria-hidden')).toBe('true');
    expect(custom.querySelector('[data-test="end"]')).not.toBeNull();
    // El contenido va al panel, no al botón.
    expect(custom.textContent).not.toContain('30 días');
  });

  it('ícono: chevrón que gira 180° o más que gira 45°; sin animación con movimiento reducido', async () => {
    const { host, triggers, panels, root, stable } = await setup();
    const icon = () => triggers()[0].querySelector('[data-slot="indicator"]')!;
    expect(icon().getAttribute('class')).toContain('[[data-state=open]>&]:rotate-180');
    expect(icon().querySelectorAll('path').length).toBe(1);
    host.indicator.set('plus');
    await stable();
    expect(root().dataset['indicator']).toBe('plus');
    expect(icon().getAttribute('class')).toContain('[[data-state=open]>&]:rotate-45');
    expect(icon().querySelectorAll('path').length).toBe(2);
    for (const node of [icon(), panels()[0]]) {
      expect(node.getAttribute('class')).toContain('motion-reduce:transition-none');
    }
    expect(panels()[0].className).toContain('transition-[grid-template-rows]');
  });

  it('size: data-size en el acordeón (la escala del tema) y level cambia aria-level', async () => {
    const { host, root, triggers, stable } = await setup();
    expect(root().hasAttribute('data-size')).toBe(false);
    host.size.set('sm');
    host.level.set(2);
    await stable();
    expect(root().dataset['size']).toBe('sm');
    expect(triggers()[0].parentElement!.getAttribute('aria-level')).toBe('2');
    expect(triggers()[0].className).toContain('min-h-[var(--mimi-accordion-h,52px)]');
    expect(triggers()[0].className).toContain(
      'text-[length:var(--mimi-accordion-text,0.90625rem)]',
    );
  });

  it('class del usuario con cn() en el acordeón y en el ítem; tokens con tipo', async () => {
    const { host, root, items, stable } = await setup();
    expect(root().className).toContain(
      'rounded-[var(--mimi-accordion-radius,var(--mimi-radius-card))]',
    );
    expect(root().className).toContain('bg-[color:var(--mimi-accordion-bg,var(--mimi-card))]');
    host.extra.set('rounded-none border-0 bg-transparent');
    host.itemExtra.set('border-t-2');
    await stable();
    const classes = root().className.split(/\s+/);
    expect(classes).toContain('rounded-none');
    expect(classes).toContain('bg-transparent');
    expect(classes).not.toContain('rounded-[var(--mimi-accordion-radius,var(--mimi-radius-card))]');
    expect(classes).not.toContain('bg-[color:var(--mimi-accordion-bg,var(--mimi-card))]');
    const item = items()[1].className.split(/\s+/);
    expect(item).toContain('border-t-2');
    expect(item).not.toContain('border-t');
  });
});
