import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSelectImports } from '@/components/ui/select';
import { mimiFollowScroll, mimiInView } from './overlay';

/**
 * Paneles dentro de un contenedor con scroll propio (13/11/2026): el panel sigue a su campo con el
 * scroll de cualquier contenedor antepasado y se cierra si el campo sale de la vista. jsdom no
 * mide nada: las cajas se fijan a mano. La posición real la comprueba Playwright.
 */
type Box = { top: number; left: number; width: number; height: number };
function place(el: Element, box: Box): void {
  el.getBoundingClientRect = () =>
    ({
      ...box,
      right: box.left + box.width,
      bottom: box.top + box.height,
      x: box.left,
      y: box.top,
      toJSON: () => box,
    }) as DOMRect;
}

function scroller(): { outer: HTMLElement; inner: HTMLElement; field: HTMLElement } {
  const outer = document.createElement('div');
  outer.style.overflow = 'auto';
  const inner = document.createElement('div');
  const field = document.createElement('button');
  inner.appendChild(field);
  outer.appendChild(inner);
  document.body.appendChild(outer);
  place(outer, { top: 100, left: 0, width: 300, height: 200 });
  return { outer, inner, field };
}

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

describe('utils/overlay: seguir el scroll de los contenedores', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('mimiInView: dentro del contenedor, sí; recortado del todo por él, no', () => {
    const { field } = scroller();
    place(field, { top: 150, left: 10, width: 100, height: 40 });
    expect(mimiInView(field)).toBe(true);
    // Medio visible todavía cuenta.
    place(field, { top: 280, left: 10, width: 100, height: 40 });
    expect(mimiInView(field)).toBe(true);
    // Por debajo del borde del contenedor: fuera de la vista aunque esté en la pantalla.
    place(field, { top: 320, left: 10, width: 100, height: 40 });
    expect(mimiInView(field)).toBe(false);
    // Por encima.
    place(field, { top: 40, left: 10, width: 100, height: 40 });
    expect(mimiInView(field)).toBe(false);
    // Sin caja (sin maquetar) no se sabe: no cuenta como fuera.
    place(field, { top: 0, left: 0, width: 0, height: 0 });
    expect(mimiInView(field)).toBe(true);
  });

  it('mimiFollowScroll: con el scroll de un antepasado recoloca; si el campo sale, cierra', async () => {
    const { outer, field } = scroller();
    place(field, { top: 150, left: 10, width: 100, height: 40 });
    const update = vi.fn();
    const close = vi.fn();
    const stop = mimiFollowScroll(field, update, close);
    outer.dispatchEvent(new Event('scroll'));
    await frame();
    expect(update).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
    // Un scroll que no mueve al campo (otro contenedor) no hace nada.
    const other = document.createElement('div');
    document.body.appendChild(other);
    other.dispatchEvent(new Event('scroll'));
    await frame();
    expect(update).toHaveBeenCalledTimes(1);
    // El campo sale de la vista del contenedor: cierra.
    place(field, { top: 400, left: 10, width: 100, height: 40 });
    outer.dispatchEvent(new Event('scroll'));
    await frame();
    expect(close).toHaveBeenCalledTimes(1);
    // Después de parar, ya no escucha.
    stop();
    outer.dispatchEvent(new Event('scroll'));
    await frame();
    expect(close).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

@Component({
  imports: [MimiSelectImports],
  template: `
    <div data-test="scroller" style="overflow: auto; height: 120px">
      <mimi-select aria-label="Talla">
        <mimi-option value="m">M</mimi-option>
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ScrollHost {}

describe('Select dentro de un contenedor con scroll', () => {
  it('se cierra cuando el campo sale de la vista del contenedor', async () => {
    const fixture = TestBed.createComponent(ScrollHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const scrollerEl = el.querySelector<HTMLElement>('[data-test="scroller"]')!;
    const box = el.querySelector<HTMLElement>('mimi-select > div')!;
    place(scrollerEl, { top: 0, left: 0, width: 300, height: 120 });
    place(box, { top: 10, left: 0, width: 200, height: 40 });
    el.querySelector<HTMLButtonElement>('mimi-select button[role="combobox"]')!.click();
    await fixture.whenStable();
    await frame();
    expect(box.getAttribute('data-state')).toBe('open');
    // Sigue abierto con un scroll que lo deja a la vista.
    scrollerEl.dispatchEvent(new Event('scroll'));
    await frame();
    await fixture.whenStable();
    expect(box.getAttribute('data-state')).toBe('open');
    // El campo sale por arriba del contenedor.
    place(box, { top: -80, left: 0, width: 200, height: 40 });
    scrollerEl.dispatchEvent(new Event('scroll'));
    await frame();
    await fixture.whenStable();
    expect(box.getAttribute('data-state')).toBe('closed');
    fixture.destroy();
  });
});
