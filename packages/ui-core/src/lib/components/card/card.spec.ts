import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MimiCardVariant, MimiCardImports } from './card';

const SURFACE = [
  'bg-[color:var(--mimi-card-bg,var(--mimi-card))]',
  'text-[color:var(--mimi-card-fg,var(--mimi-card-foreground))]',
  'rounded-[var(--mimi-card-radius,var(--mimi-radius-card))]',
  'border-[length:var(--mimi-card-border-width,1px)]',
  'border-[color:var(--mimi-card-border,var(--mimi-border))]',
  'shadow-[shadow:var(--mimi-card-shadow,var(--mimi-shadow-card))]',
];
const PADDING = [
  'px-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))]',
  'pt-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))]',
  'pb-[var(--mimi-card-p,var(--mimi-card-padding,1.5rem))]',
  '[[data-card-part]+&]:pt-[var(--mimi-card-gap-s,var(--mimi-card-gap,1rem))]',
  'has-[+[data-card-part]]:pb-0',
];

@Component({
  imports: [MimiCardImports],
  template: `
    <section id="full" mimiCard [class]="extra()" [variant]="variant()" [size]="size()">
      <header mimiCardHeader>
        <h3 mimiCardTitle>Plan Equipo</h3>
        <p mimiCardDescription>Para equipos de hasta 10 personas.</p>
      </header>
      <div mimiCardContent>$12</div>
      <footer mimiCardFooter><button>Elegir plan</button></footer>
    </section>
    <div id="div" mimiCard>Un div</div>
    <a id="link" mimiCard interactive href="#plan">Ver el plan</a>
    <button id="button" type="button" mimiCard interactive (click)="clicks.set(clicks() + 1)">
      Elegir
    </button>
  `,
})
class Host {
  readonly extra = signal('');
  readonly variant = signal<MimiCardVariant>('outline');
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly clicks = signal(0);
}

describe('MimiCard (R.19: superficie y piezas opcionales)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const q = (selector: string) => root.querySelector<HTMLElement>(selector)!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, q, update };
  }

  it('la superficie va en cualquier elemento: section, div, a y button', async () => {
    const { q } = await setup();
    for (const id of ['#full', '#div', '#link', '#button']) {
      for (const cls of SURFACE) expect(q(id).classList, `${id} ${cls}`).toContain(cls);
      expect(q(id).dataset['variant']).toBe('outline');
      // Solo la superficie: no impone una columna flexible ni un relleno.
      expect(q(id).classList).not.toContain('flex');
    }
    expect(q('#link').tagName).toBe('A');
    expect(q('#button').tagName).toBe('BUTTON');
  });

  it('variant: elevated sin borde visible y con la sombra de los paneles; flat y ghost sin sombra', async () => {
    const { host, q, update } = await setup();
    const card = q('#full');
    await update(() => host.variant.set('elevated'));
    expect(card.dataset['variant']).toBe('elevated');
    expect(card.classList).toContain('border-transparent');
    expect(card.classList).toContain(
      'shadow-[shadow:var(--mimi-card-shadow-elevated,var(--mimi-shadow-popover))]',
    );
    await update(() => host.variant.set('flat'));
    expect(card.classList).toContain('bg-[color:var(--mimi-card-flat-bg,var(--mimi-muted))]');
    expect(card.classList).not.toContain('bg-[color:var(--mimi-card-bg,var(--mimi-card))]');
    expect(card.classList).toContain('shadow-none');
    await update(() => host.variant.set('ghost'));
    expect(card.classList).toContain('bg-transparent');
    expect(card.classList).toContain('shadow-none');
  });

  it('interactive: hover, foco visible y clic; el botón sigue siendo un botón', async () => {
    const { host, q } = await setup();
    for (const id of ['#link', '#button']) {
      const el = q(id);
      expect(el.hasAttribute('data-interactive')).toBe(true);
      for (const cls of [
        'cursor-pointer',
        'focus-visible:outline-2',
        'focus-visible:outline-ring',
        'hover:shadow-[shadow:var(--mimi-card-shadow-hover,var(--mimi-shadow-neutral-hover))]',
        'active:scale-(--mimi-press-scale-sm)',
      ]) {
        expect(el.classList, `${id} ${cls}`).toContain(cls);
      }
    }
    expect(q('#div').hasAttribute('data-interactive')).toBe(false);
    expect(q('#div').classList).not.toContain('cursor-pointer');
    // Enter y Espacio son los del <button> nativo (se comprueban en el navegador); el clic llega.
    q('#button').click();
    expect(host.clicks()).toBe(1);
  });

  it('size: data-size en la superficie; las piezas leen el relleno de la escala', async () => {
    const { host, q, update } = await setup();
    expect(q('#full').hasAttribute('data-size')).toBe(false);
    await update(() => host.size.set('sm'));
    expect(q('#full').dataset['size']).toBe('sm');
    for (const part of ['[mimiCardHeader]', '[mimiCardContent]', '[mimiCardFooter]']) {
      const el = q(`#full ${part}`);
      for (const cls of PADDING) expect(el.classList, `${part} ${cls}`).toContain(cls);
      expect(el.hasAttribute('data-card-part')).toBe(true);
    }
  });

  it('un solo relleno: entre dos piezas seguidas, el hueco (no el doble)', async () => {
    const { q } = await setup();
    const header = q('#full [mimiCardHeader]');
    const content = q('#full [mimiCardContent]');
    const footer = q('#full [mimiCardFooter]');
    // La regla del hueco se aplica a la pieza que va después de otra, y la del pie a la que tiene otra detrás.
    expect(header.matches('[data-card-part] + *')).toBe(false);
    expect(content.matches('[data-card-part] + *')).toBe(true);
    expect(footer.matches('[data-card-part] + *')).toBe(true);
    expect(footer.nextElementSibling).toBeNull();
  });

  it('las piezas tienen su tipografía; el título es tu encabezado (sin role propio)', async () => {
    const { q } = await setup();
    expect(q('#full [mimiCardHeader]').classList).toContain('gap-1.5');
    const title = q('#full [mimiCardTitle]');
    expect(title.tagName).toBe('H3');
    expect(title.hasAttribute('role')).toBe(false);
    expect(title.classList).toContain('text-lg');
    expect(title.classList).toContain('font-semibold');
    expect(q('#full [mimiCardDescription]').classList).toContain('text-muted-foreground');
    expect(q('#full [mimiCardFooter]').classList).toContain('justify-end');
  });

  it('sin los elementos de la 0.6.0 (política de rupturas, 16/11/2026): solo las directivas', () => {
    // Antes de la 1.0 no se mantienen alias: `<mimi-card>`, `<mimi-card-title>`… se quitaron.
    const def = (d: unknown) =>
      (d as { ɵdir: { selectors: unknown; inputs: Record<string, unknown> } }).ɵdir;
    for (const d of MimiCardImports)
      expect(JSON.stringify(def(d).selectors)).not.toContain('mimi-card');
    // `level` era solo para `<mimi-card-title>`.
    expect(Object.keys(def(MimiCardImports[2]).inputs)).not.toContain('level');
  });

  it('la clase del usuario gana', async () => {
    const { host, q, update } = await setup();
    await update(() => host.extra.set('shadow-none rounded-none bg-muted border-2'));
    const card = q('#full');
    expect(card.classList).toContain('shadow-none');
    expect(card.classList).toContain('rounded-none');
    expect(card.classList).toContain('bg-muted');
    expect(card.classList).not.toContain(
      'shadow-[shadow:var(--mimi-card-shadow,var(--mimi-shadow-card))]',
    );
    expect(card.classList).not.toContain('bg-[color:var(--mimi-card-bg,var(--mimi-card))]');
    expect(card.classList).toContain('border-2');
    expect(card.classList).not.toContain('border-[length:var(--mimi-card-border-width,1px)]');
    expect(card.classList).toContain('border-[color:var(--mimi-card-border,var(--mimi-border))]');
  });

  it('MimiCardImports trae las seis piezas', () => {
    expect(MimiCardImports.length).toBe(6);
  });
});
