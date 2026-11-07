import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Pricing01, type Pricing01Period, type Pricing01Selection } from './pricing-01';

@Component({
  imports: [Pricing01],
  template: `<mimi-pricing-01
    class="bg-muted"
    [(period)]="period"
    [currency]="currency()"
    [locale]="locale()"
    (planSelected)="selected.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly period = signal<Pricing01Period>('monthly');
  readonly currency = signal('USD');
  readonly locale = signal<string | undefined>('en-US');
  readonly selected: Pricing01Selection[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

/** pricing-01 (B.7). */
describe('Pricing01', () => {
  afterEach(() => document.querySelectorAll('ng-component').forEach((n) => n.remove()));

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const prices = () =>
      [...el.querySelectorAll('[data-slot="price"]')].map((p) => p.textContent?.trim());
    const notes = () =>
      [...el.querySelectorAll('[data-slot="note"]')].map((p) => p.textContent?.trim());
    const toggle = (text: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('mimi-toggle-group button')].find((b) =>
        b.textContent?.includes(text),
      )!;
    return { fixture, el, prices, notes, toggle, host: fixture.componentInstance };
  }

  it('cambiar de periodo cambia los precios y la nota anual', async () => {
    const { prices, notes, toggle, fixture, host } = await setup();
    expect(prices()).toEqual(['$12', '$24', 'Custom']);
    expect(notes()).toEqual(['', '', '']);
    toggle('Yearly').click();
    await settle(fixture);
    expect(host.period()).toBe('yearly');
    expect(prices()).toEqual(['$10', '$20', 'Custom']);
    expect(notes()).toEqual(['Billed yearly: $120 per seat', 'Billed yearly: $240 per seat', '']);
  });

  it('planSelected con el plan y el periodo', async () => {
    const { el, host, fixture } = await setup();
    host.period.set('yearly');
    await settle(fixture);
    [...el.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.trim() === 'Try it for 14 days')!
      .click();
    expect(host.selected.map((s) => [s.plan.id, s.period])).toEqual([['team', 'yearly']]);
  });

  it('«Custom» sin precio ni unidad', async () => {
    const { el } = await setup();
    const enterprise = el.querySelectorAll('section')[2];
    expect(enterprise.querySelector('[data-slot="price"]')?.textContent?.trim()).toBe('Custom');
    expect(enterprise.textContent).not.toContain('per seat / month');
  });

  it('formato con otro locale y otra moneda', async () => {
    const { prices, host, fixture } = await setup();
    host.locale.set('de-DE');
    host.currency.set('EUR');
    await settle(fixture);
    // Intl separa con un espacio duro (U+00A0).
    expect(
      prices()
        .slice(0, 2)
        .map((p) => p?.replace(/\s/g, ' ')),
    ).toEqual(['12 €', '24 €']);
    expect(fixture.nativeElement.textContent).toContain('Prices in EUR');
  });

  it('el destacado: insignia, borde estático (sin animación) y región con nombre', async () => {
    const { el } = await setup();
    const featured = el.querySelector<HTMLElement>('section[data-featured]')!;
    expect(featured.textContent).toContain('Most popular');
    expect(featured.className).not.toMatch(/animate-/);
    expect(featured.className).toContain('conic-gradient');
    const sections = [...el.querySelectorAll('section')];
    expect(
      sections.map((s) => document.getElementById(s.getAttribute('aria-labelledby')!)?.textContent),
    ).toEqual(['Starter', 'Team', 'Enterprise']);
  });

  it('características: «incluido» o «no incluido» en texto para lectores', async () => {
    const { el } = await setup();
    const items = [...el.querySelectorAll('section')[0].querySelectorAll('li')];
    expect(items[0].textContent?.replace(/\s+/g, ' ').trim()).toBe('Included: Up to 5 people');
    expect(items[3].textContent?.replace(/\s+/g, ' ').trim()).toBe('Not included: Integrations');
    expect(items[0].querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('el «−17%» sale de los precios; con otros planes cambia, y sin ahorro no aparece', async () => {
    const fixture = TestBed.createComponent(Pricing01);
    fixture.detectChanges();
    const badge = () =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('mimi-toggle-group')
        ?.textContent?.match(/−\d+%/)?.[0] ?? null;
    expect(badge()).toBe('−17%');
    const plan = (monthly: number | null, yearly: number | null) => ({
      id: `p${monthly}`,
      name: 'Plan',
      description: '',
      monthly,
      yearly,
      cta: 'Go',
      features: [],
    });
    fixture.componentRef.setInput('plans', [plan(10, 8), plan(20, 15), plan(null, null)]);
    fixture.detectChanges();
    expect(badge()).toBe('−25%');
    fixture.componentRef.setInput('plans', [plan(10, 10)]);
    fixture.detectChanges();
    expect(badge()).toBeNull();
  });

  it('la insignia del destacado se centra con start-1/2 y el translate invertido en RTL', async () => {
    const { el } = await setup();
    const badge = el.querySelector('section[data-featured] > span')!;
    expect(badge.classList).toContain('start-1/2');
    expect(badge.classList).toContain('-translate-x-1/2');
    expect(badge.classList).toContain('rtl:translate-x-1/2');
  });

  it('el interruptor tiene nombre; un h1; class del usuario', async () => {
    const { el } = await setup();
    expect(
      el.querySelector(
        'mimi-toggle-group [aria-label="Billing period"], mimi-toggle-group[aria-label="Billing period"]',
      ),
    ).not.toBeNull();
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    const host = el.querySelector('mimi-pricing-01')!;
    expect(host.classList).toContain('bg-muted');
    expect(host.classList).not.toContain('bg-background');
  });
});
