import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MimiProgress,
  type MimiProgressShape,
  type MimiProgressSize,
  type MimiProgressTone,
} from './progress';

@Component({
  imports: [MimiProgress],
  template: `
    <mimi-progress
      aria-label="Subiendo informe.pdf"
      [value]="value()"
      [max]="max()"
      [tone]="tone()"
      [shape]="shape()"
      [size]="size()"
      [class]="extra()"
    />
  `,
})
class Host {
  readonly value = signal<number | null>(64);
  readonly max = signal(100);
  readonly tone = signal<MimiProgressTone>('primary');
  readonly shape = signal<MimiProgressShape>('bar');
  readonly size = signal<MimiProgressSize>('default');
  readonly extra = signal('');
}

describe('MimiProgress', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = () =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('mimi-progress')!;
    const fill = () => el().querySelector<HTMLElement | SVGElement>('[data-slot="fill"]')!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { fixture, host, el, fill, update };
  }

  it('barra determinada: progressbar con valuemin, valuemax, valuenow y el ancho', async () => {
    const { el, fill } = await setup();
    expect(el().getAttribute('role')).toBe('progressbar');
    expect(el().getAttribute('aria-label')).toBe('Subiendo informe.pdf');
    expect(el().getAttribute('aria-valuemin')).toBe('0');
    expect(el().getAttribute('aria-valuemax')).toBe('100');
    expect(el().getAttribute('aria-valuenow')).toBe('64');
    expect(el().getAttribute('aria-busy')).toBeNull();
    expect(el().getAttribute('data-state')).toBe('determinate');
    expect((fill() as HTMLElement).style.width).toBe('64%');
    expect(el().hasAttribute('tabindex')).toBe(false);
  });

  it('indeterminado (null): sin valuenow, con aria-busy y el tramo que cruza', async () => {
    const { el, fill, host, update } = await setup();
    await update(() => host.value.set(null));
    expect(el().getAttribute('aria-valuenow')).toBeNull();
    expect(el().getAttribute('aria-busy')).toBe('true');
    expect(el().getAttribute('data-state')).toBe('indeterminate');
    expect(fill().getAttribute('class')).toContain(
      'animate-[mimi-indet_1.4s_cubic-bezier(.4,0,.2,1)_infinite]',
    );
    expect(fill().getAttribute('class')).toContain('w-2/5');
  });

  it('acota el valor entre 0 y max, y max distinto de 100 funciona', async () => {
    const { el, fill, host, update } = await setup();
    await update(() => host.value.set(150));
    expect(el().getAttribute('aria-valuenow')).toBe('100');
    expect((fill() as HTMLElement).style.width).toBe('100%');
    await update(() => host.value.set(-5));
    expect(el().getAttribute('aria-valuenow')).toBe('0');
    await update(() => {
      host.max.set(8);
      host.value.set(2);
    });
    expect(el().getAttribute('aria-valuemax')).toBe('8');
    expect(el().getAttribute('aria-valuenow')).toBe('2');
    expect((fill() as HTMLElement).style.width).toBe('25%');
    // Un max inválido vuelve a 100.
    await update(() => host.max.set(0));
    expect(el().getAttribute('aria-valuemax')).toBe('100');
  });

  it('tonos: la parte llena con su color; primary con el token del componente', async () => {
    const { el, fill, host, update } = await setup();
    expect(fill().getAttribute('class')).toContain(
      'bg-[color:var(--mimi-progress-fill,var(--mimi-primary))]',
    );
    for (const [tone, cls] of [
      ['success', 'bg-success'],
      ['warning', 'bg-warning'],
      ['info', 'bg-info'],
      ['danger', 'bg-destructive'],
    ] as const) {
      await update(() => host.tone.set(tone));
      expect(el().getAttribute('data-tone')).toBe(tone);
      expect(fill().getAttribute('class')).toContain(cls);
    }
  });

  it('círculo: el arco con su dasharray, el valor dentro y los dos tamaños', async () => {
    const { el, fill, host, update } = await setup();
    await update(() => host.shape.set('circle'));
    expect(el().getAttribute('data-shape')).toBe('circle');
    expect(el().getAttribute('data-size')).toBe('default');
    expect(el().getAttribute('role')).toBe('progressbar');
    expect(fill().getAttribute('stroke-dasharray')).toBe('64 100');
    expect(el().querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(el().textContent!.trim()).toBe('64%');
    expect(el().className).toContain('size-[var(--mimi-progress-circle-size,76px)]');
    await update(() => host.size.set('sm'));
    expect(el().className).toContain('size-11');
    expect(el().textContent!.trim()).toBe('64');
    expect(fill().getAttribute('class')).toContain('[stroke-width:4]');
  });

  it('círculo indeterminado: arco de 28 que gira, sin texto', async () => {
    const { el, fill, host, update } = await setup();
    await update(() => {
      host.shape.set('circle');
      host.value.set(null);
    });
    expect(fill().getAttribute('stroke-dasharray')).toBe('28 100');
    expect(el().querySelector('svg')!.getAttribute('class')).toContain(
      'animate-[mimi-spin_1s_linear_infinite]',
    );
    expect(el().textContent!.trim()).toBe('');
  });

  it('movimiento reducido: la barra y el círculo indeterminados laten', async () => {
    const { el, fill, host, update } = await setup();
    await update(() => host.value.set(null));
    expect(fill().getAttribute('class')).toContain('motion-reduce:animate-mimi-pulse');
    expect(fill().getAttribute('class')).toContain('motion-reduce:w-full');
    await update(() => host.shape.set('circle'));
    expect(el().querySelector('svg')!.getAttribute('class')).toContain(
      'motion-reduce:animate-mimi-pulse',
    );
    // El determinado no anima su avance.
    await update(() => host.value.set(30));
    expect(fill().getAttribute('class')).toContain('motion-reduce:transition-none');
  });

  it('con un tema sin --mimi-track (anterior a la 0.3.0), la pista tiene un respaldo visible', async () => {
    const { el, host, update } = await setup();
    const fallback = 'var(--mimi-track,var(--mimi-input))';
    expect(el().className).toContain(fallback);
    await update(() => host.shape.set('circle'));
    expect(el().querySelector('circle')!.getAttribute('class')).toContain(fallback);
  });

  it('class del usuario gana (alto, fondo y tamaño del círculo)', async () => {
    const { el, host, update } = await setup();
    await update(() => host.extra.set('h-1.5 bg-muted rounded-sm'));
    expect(el().className).toContain('h-1.5');
    expect(el().className).not.toContain('h-[var(--mimi-progress-height');
    expect(el().className).not.toContain('bg-[color:var(--mimi-progress-track');
    expect(el().className).not.toContain('rounded-full');
    await update(() => {
      host.shape.set('circle');
      host.extra.set('size-24');
    });
    expect(el().className).toContain('size-24');
    expect(el().className).not.toContain('size-[var(--mimi-progress-circle-size');
  });

  it('no anuncia: sin aria-live ni LiveAnnouncer al cambiar el valor', async () => {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
    const { el, host, update } = await setup();
    await update(() => host.value.set(80));
    await update(() => host.value.set(100));
    expect(el().querySelector('[aria-live]')).toBeNull();
    expect(el().hasAttribute('aria-live')).toBe(false);
    expect(announce).not.toHaveBeenCalled();
  });

  it('avisa en desarrollo sin nombre accesible', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    @Component({ imports: [MimiProgress], template: '<mimi-progress [value]="10" />' })
    class NoName {}
    const fixture = TestBed.createComponent(NoName);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledWith(
      '[Mimi] Progress: no tiene aria-label ni aria-labelledby (su nombre accesible).',
    );
    warn.mockRestore();
  });

  it('sin aviso con aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await setup();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
