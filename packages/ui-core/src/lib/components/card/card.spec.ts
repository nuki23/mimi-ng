import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCardImports } from './card';

@Component({
  imports: [MimiCardImports],
  template: `
    <mimi-card id="full" [class]="extra()">
      <mimi-card-header>
        <mimi-card-title [level]="level()">Plan Equipo</mimi-card-title>
        <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>
      </mimi-card-header>
      <mimi-card-content>$12</mimi-card-content>
      <mimi-card-footer><button>Elegir plan</button></mimi-card-footer>
    </mimi-card>
    <mimi-card id="content-only">
      <mimi-card-content>Solo contenido</mimi-card-content>
    </mimi-card>
  `,
})
class Host {
  readonly extra = signal('');
  readonly level = signal(3);
}

describe('MimiCard', () => {
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

  it('la tarjeta tiene el fondo, el borde, el radio y la sombra del diseño', async () => {
    const { q } = await setup();
    const card = q('#full');
    for (const cls of [
      'flex',
      'flex-col',
      'bg-[color:var(--mimi-card-bg,var(--mimi-card))]',
      'text-[color:var(--mimi-card-fg,var(--mimi-card-foreground))]',
      'border-[color:var(--mimi-card-border,var(--mimi-border))]',
      'rounded-[var(--mimi-card-radius,var(--mimi-radius-card))]',
      'border-[length:var(--mimi-card-border-width,1px)]',
      'shadow-[shadow:var(--mimi-card-shadow,var(--mimi-shadow-card))]',
    ]) {
      expect(card.classList).toContain(cls);
    }
  });

  it('cada parte tiene su padding y su tipografía', async () => {
    const { q } = await setup();
    expect(q('#full mimi-card-header').classList).toContain(
      'p-[var(--mimi-card-padding-header,var(--mimi-card-padding,1.5rem)_var(--mimi-card-padding,1.5rem)_1rem)]',
    );
    expect(q('#full mimi-card-header').classList).toContain('gap-1.5');
    expect(q('#full mimi-card-title').classList).toContain('text-lg');
    expect(q('#full mimi-card-title').classList).toContain('font-semibold');
    expect(q('#full mimi-card-description').classList).toContain('text-muted-foreground');
    expect(q('#full mimi-card-content').classList).toContain(
      'p-[var(--mimi-card-padding-content,0_var(--mimi-card-padding,1.5rem)_1.25rem)]',
    );
    const footer = q('#full mimi-card-footer');
    expect(footer.classList).toContain(
      'p-[var(--mimi-card-padding-footer,0_var(--mimi-card-padding,1.5rem)_var(--mimi-card-padding,1.5rem))]',
    );
    expect(footer.classList).toContain('justify-end');
    expect(footer.classList).toContain('gap-2');
  });

  it('el contenido suma padding arriba solo si es el primer hijo (sin encabezado)', async () => {
    const { q } = await setup();
    // La regla es la misma clase; se aplica según :first-child.
    expect(q('#content-only mimi-card-content').classList).toContain(
      'first:pt-[var(--mimi-card-padding,1.5rem)]',
    );
    expect(q('#content-only mimi-card-content').matches(':first-child')).toBe(true);
    expect(q('#full mimi-card-content').matches(':first-child')).toBe(false);
  });

  it('el título es un encabezado para lectores de pantalla, con nivel configurable', async () => {
    const { host, q, update } = await setup();
    const title = q('#full mimi-card-title');
    expect(title.getAttribute('role')).toBe('heading');
    expect(title.getAttribute('aria-level')).toBe('3');
    await update(() => host.level.set(2));
    expect(title.getAttribute('aria-level')).toBe('2');
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
    // El color del borde es otra propiedad: se mantiene.
    expect(card.classList).toContain('border-[color:var(--mimi-card-border,var(--mimi-border))]');
  });

  it('MimiCardImports trae las seis piezas', () => {
    expect(MimiCardImports.length).toBe(6);
  });
});
