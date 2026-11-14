import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, afterNextRender, inject, input, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { restoreFocusAfterBusy } from './busy';

/** Un anfitrión como los Blocks: `inert` mientras `busy`, y el foco vuelve al terminar. */
@Component({
  selector: 'test-busy',
  template: `
    <button data-test="launcher">Enviar</button>
    <button data-test="other">Otro</button>
  `,
  host: { '[attr.inert]': 'busy() ? "" : null' },
})
class BusyHost {
  readonly busy = input(false);
  protected readonly back = restoreFocusAfterBusy(this.busy, {
    start: 'Loading…',
    end: 'Done.',
  });
  readonly el = inject(ElementRef).nativeElement as HTMLElement;
  readonly injector = inject(Injector);
  readonly after = afterNextRender;
}

describe('restoreFocusAfterBusy (revisión de la 0.6.0, sospecha 3)', () => {
  async function setup() {
    const announcer = TestBed.inject(LiveAnnouncer);
    const announce = vi.spyOn(announcer, 'announce').mockResolvedValue();
    const fixture = TestBed.createComponent(BusyHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const q = (t: string) =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        `[data-test="${t}"]`,
      )!;
    return { fixture, announce, q };
  }

  it('al terminar, el foco vuelve al control que lanzó la acción y se anuncia el resultado', async () => {
    const { fixture, announce, q } = await setup();
    q('launcher').focus();
    fixture.componentRef.setInput('busy', true);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).hasAttribute('inert')).toBe(true);
    // Un navegador saca el foco de lo inerte; jsdom no: se simula.
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).not.toBe(q('launcher'));
    expect(announce).toHaveBeenCalledWith('Loading…', 'polite');

    fixture.componentRef.setInput('busy', false);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    expect((fixture.nativeElement as HTMLElement).hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(q('launcher'));
    expect(announce).toHaveBeenCalledWith('Done.', 'polite');
  });

  it('si el foco no estaba dentro, no lo roba', async () => {
    const { fixture, q } = await setup();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    fixture.componentRef.setInput('busy', true);
    await fixture.whenStable();
    fixture.componentRef.setInput('busy', false);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    expect(document.activeElement).toBe(outside);
    expect(document.activeElement).not.toBe(q('launcher'));
    outside.remove();
  });
});
