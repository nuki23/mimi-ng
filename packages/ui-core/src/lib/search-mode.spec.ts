import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import type { MimiSearchMode } from '@/components/ui/option-list';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * `searchMode` (12/11/2026): la misma entrada en Select y Combobox. Con `'server'` la lista muestra
 * lo que llega en las opciones, sin volver a filtrar (antes había que pasar
 * `[filterWith]="() => true"`); con `'client'` (por defecto) filtra `filterWith` o el filtro sin
 * tildes. `(searchChange)` avisa de lo escrito en los dos modos.
 */
@Component({
  imports: [MimiSelectImports, MimiComboboxImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select
      data-test="select"
      aria-label="Persona"
      search
      [searchMode]="mode()"
      [filterWith]="filter()"
      (searchChange)="queries.push($event)"
    >
      @for (name of names(); track name) {
        <mimi-option [value]="name">{{ name }}</mimi-option>
      }
    </mimi-select>

    <mimi-combobox
      data-test="combobox"
      aria-label="Ciudad"
      [searchMode]="mode()"
      [filterWith]="filter()"
      (searchChange)="queries.push($event)"
    >
      @for (name of names(); track name) {
        <mimi-option [value]="name">{{ name }}</mimi-option>
      }
    </mimi-combobox>
  `,
})
class Host {
  readonly mode = signal<MimiSearchMode>('client');
  readonly filter = signal<((o: { label: string }, q: string) => boolean) | undefined>(undefined);
  readonly names = signal(['Ana', 'Bruno', 'Camila']);
  readonly queries: string[] = [];
}

describe('searchMode: buscar en el cliente o en el servidor (Select y Combobox)', () => {
  const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

  async function setup(mode: MimiSearchMode | null) {
    const fixture = TestBed.createComponent(Host);
    if (mode) fixture.componentInstance.mode.set(mode);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      await fixture.whenStable();
      await tick();
      await fixture.whenStable();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const options = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).map((o) =>
        o.textContent!.replace(/\s+/g, ' ').trim(),
      );
    /** Abre el componente y escribe `text` en su buscador o en su campo. */
    const type = async (which: 'select' | 'combobox', text: string) => {
      let input: HTMLInputElement;
      if (which === 'select') {
        el.querySelector<HTMLElement>('[data-test="select"] [role="combobox"]')!.click();
        await settle();
        input = document.querySelector<HTMLInputElement>('[role="dialog"] input')!;
      } else {
        input = el.querySelector<HTMLInputElement>('[data-test="combobox"] input')!;
        input.focus();
      }
      input.value = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      await settle();
    };
    return { fixture, host: fixture.componentInstance, options, type, settle };
  }

  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')),
  );

  for (const which of ['select', 'combobox'] as const) {
    it(`${which}: por defecto ('client') filtra lo escrito, sin tildes`, async () => {
      const { options, type, host } = await setup(null);
      await type(which, 'cami');
      expect(options()).toEqual(['Camila']);
      expect(host.queries).toContain('cami');
    });

    it(`${which}: con 'server' muestra todo lo que llega y avisa de lo escrito`, async () => {
      const { options, type, host, settle } = await setup('server');
      await type(which, 'zzz');
      // Nada coincide con «zzz», pero el servidor manda lo que quiere: se muestra tal cual.
      expect(options()).toEqual(['Ana', 'Bruno', 'Camila']);
      expect(host.queries).toContain('zzz');
      // Cuando llega la respuesta, la lista es la nueva.
      host.names.set(['Zoe']);
      await settle();
      expect(options()).toEqual(['Zoe']);
    });

    it(`${which}: filterWith solo cuenta en 'client'`, async () => {
      const client = await setup('client');
      client.host.filter.set((o) => o.label.startsWith('B'));
      await client.settle();
      await client.type(which, 'a');
      expect(client.options()).toEqual(['Bruno']);
      client.fixture.destroy();
      document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));

      const server = await setup('server');
      server.host.filter.set((o) => o.label.startsWith('B'));
      await server.settle();
      await server.type(which, 'a');
      expect(server.options()).toEqual(['Ana', 'Bruno', 'Camila']);
    });
  }
});
