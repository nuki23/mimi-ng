import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MimiHighlight,
  mimiDefaultListFilter,
  mimiFilterSections,
  mimiListSections,
  mimiNormalizeText,
} from './option-list';

@Component({
  imports: [MimiHighlight],
  template: `<mimi-highlight [text]="text()" [query]="query()" [class]="extra()" />`,
})
class Host {
  readonly text = signal('Medellín');
  readonly query = signal('');
  readonly extra = signal('');
}

describe('option-list (utilidades de lista)', () => {
  it('mimiNormalizeText quita tildes y mayúsculas', () => {
    expect(mimiNormalizeText('Ciudad de MÉXICO, Ñandú')).toBe('ciudad de mexico, nandu');
  });

  it('el filtro predeterminado busca dentro de la etiqueta, sin tildes ni mayúsculas', () => {
    expect(mimiDefaultListFilter({ label: 'Bogotá', value: 1 }, 'GOTA')).toBe(true);
    expect(mimiDefaultListFilter({ label: 'Bogotá', value: 1 }, 'lima')).toBe(false);
  });

  it('las secciones dan una clave estable por posición, con grupos y sueltas', () => {
    const sections = mimiListSections(
      [
        { label: 'Uno', value: 1 },
        { label: 'Grupo', options: [{ label: 'Dos', value: 2 }] },
        { label: 'Tres', value: 3 },
      ],
      'l',
    );
    expect(sections.map((s) => [s.id, s.label, s.rows.map((r) => r.key)])).toEqual([
      ['l-group-0', null, ['0']],
      ['l-group-1', 'Grupo', ['1']],
      ['l-group-2', null, ['2']],
    ]);
    const filtered = mimiFilterSections(sections, 'tr');
    expect(filtered.length).toBe(1);
    expect(filtered[0].rows[0].key).toBe('2');
    expect(mimiFilterSections(sections, '')).toBe(sections);
    // Filtro propio.
    expect(mimiFilterSections(sections, 'x', (o) => o.value === 1)[0].rows[0].key).toBe('0');
  });

  it('mimi-highlight marca la coincidencia con <mark>, sin tildes, y acepta class', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = (fixture.nativeElement as HTMLElement).querySelector('mimi-highlight')!;
    expect(el.querySelector('mark')!.textContent).toBe('');
    expect(el.textContent).toBe('Medellín');
    fixture.componentInstance.query.set('LLIN');
    fixture.componentInstance.extra.set('font-mono');
    await fixture.whenStable();
    expect(el.querySelector('mark')!.textContent).toBe('llín');
    expect(el.textContent).toBe('Medellín');
    expect(el.classList).toContain('truncate');
    expect(el.classList).toContain('font-mono');
  });
});
