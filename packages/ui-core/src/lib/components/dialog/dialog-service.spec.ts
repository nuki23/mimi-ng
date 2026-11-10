import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiDialogImports, MimiDialogRef, MimiDialogService } from './dialog';
import { inject } from '@angular/core';

/** Un componente propio, con entradas (no con `inject(MIMI_DIALOG_DATA)`) y su propia salida. */
@Component({
  selector: 'test-upload',
  imports: [MimiDialogImports],
  template: `
    <mimi-dialog-header
      ><h2 mimiDialogTitle>{{ title() }}</h2></mimi-dialog-header
    >
    <mimi-dialog-body
      ><p data-test="risk">{{ risk() }}</p></mimi-dialog-body
    >
    <mimi-dialog-footer>
      <button type="button" data-test="save" (click)="save()">Guardar</button>
    </mimi-dialog-footer>
  `,
})
class Upload {
  readonly title = input('Sin título');
  readonly risk = input('');
  private readonly ref = inject(MimiDialogRef<{ saved: string }>);
  save(): void {
    this.ref.close({ saved: this.risk() });
  }
}

/** R.6 y R.7: tamaños del diálogo y el servicio con `inputs`, `closed`, `result`, `padding`. */
describe('MimiDialogService: tamaños, inputs y resultado (R.6, R.7)', () => {
  const tick = () => new Promise((r) => setTimeout(r, 30));
  const panel = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel]');

  afterEach(async () => {
    TestBed.inject(MimiDialogService).closeAll();
    await tick();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('sm, md y lg: el ancho sale de --mimi-dialog-width; md no cambia nada', async () => {
    const service = TestBed.inject(MimiDialogService);
    const widths: Record<string, string | null> = {};
    for (const size of ['sm', 'md', 'lg'] as const) {
      const ref = service.open(Upload, { size, inputs: { title: size } });
      await tick();
      widths[size] = panel()!.style.getPropertyValue('--mimi-dialog-width') || null;
      ref.close();
      await tick();
      await tick();
    }
    expect(widths).toEqual({ sm: '360px', md: null, lg: '560px' });
  });

  it('padding: una variable del panel; sm baja el relleno a 16px', async () => {
    const service = TestBed.inject(MimiDialogService);
    service.open(Upload, { padding: '8px' });
    await tick();
    expect(panel()!.style.getPropertyValue('--mimi-dialog-padding')).toBe('8px');
    service.closeAll();
    await tick();
    await tick();
    service.open(Upload, { size: 'sm' });
    await tick();
    expect(panel()!.style.getPropertyValue('--mimi-dialog-padding')).toBe('16px');
  });

  it('panelClass y class se mezclan en el panel; gana class', async () => {
    const service = TestBed.inject(MimiDialogService);
    service.open(Upload, { panelClass: 'p-2 rounded-none', class: 'p-4' });
    await tick();
    expect(panel()!.classList).toContain('rounded-none');
    expect(panel()!.classList).toContain('p-4');
    expect(panel()!.classList).not.toContain('p-2');
  });

  it("chrome: 'none': sin X y sin relleno; el contenido es todo el panel (R.7)", async () => {
    const service = TestBed.inject(MimiDialogService);
    service.open(Upload, { chrome: 'none', inputs: { title: 'Libre' } });
    await tick();
    expect(panel()!.querySelector('[data-slot="close"]')).toBeNull();
    expect(panel()!.hasAttribute('data-close-button')).toBe(false);
    expect(panel()!.style.getPropertyValue('--mimi-dialog-padding')).toBe('0px');
    // El contenido sigue ahí, con su título.
    expect(panel()!.querySelector('h2')!.textContent).toBe('Libre');
    service.closeAll();
    await tick();
    await tick();
    // Con chrome por defecto, la X está; un padding explícito gana a chrome: 'none'.
    service.open(Upload, {});
    await tick();
    expect(panel()!.querySelector('[data-slot="close"]')).not.toBeNull();
    service.closeAll();
    await tick();
    await tick();
    service.open(Upload, { chrome: 'none', padding: '12px' });
    await tick();
    expect(panel()!.style.getPropertyValue('--mimi-dialog-padding')).toBe('12px');
  });

  it('inputs con una clave que el componente no tiene: error claro, antes de crear nada', async () => {
    const service = TestBed.inject(MimiDialogService);
    expect(() => service.open(Upload, { inputs: { titel: 'Typo' } })).toThrowError(
      /Dialog: «titel» no es una entrada de _?Upload.*title.*risk/s,
    );
    await tick();
    // Nada quedó a medias: ni panel, ni contenedor del CDK.
    expect(panel()).toBeNull();
    expect(document.querySelector('.cdk-dialog-container')).toBeNull();
    // Con una plantilla no hay entradas a las que asignar.
    expect(() => service.open(Upload, { inputs: { title: 'ok' } })).not.toThrow();
  });

  it('inputs: las entradas del componente llegan antes de pintarse; close(resultado) llega a closed y a result()', async () => {
    const service = TestBed.inject(MimiDialogService);
    const ref = service.open<{ saved: string }>(Upload, {
      inputs: { title: 'Actualizar riesgo', risk: 'alto' },
    });
    const results: unknown[] = [];
    ref.closed.subscribe((r) => results.push(r));
    await tick();
    expect(panel()!.querySelector('h2')!.textContent).toBe('Actualizar riesgo');
    expect(panel()!.querySelector('[data-test="risk"]')!.textContent).toBe('alto');
    expect(ref.result()).toBeUndefined();
    panel()!.querySelector<HTMLButtonElement>('[data-test="save"]')!.click();
    await tick();
    await tick();
    expect(results).toEqual([{ saved: 'alto' }]);
    expect(ref.result()).toEqual({ saved: 'alto' });
  });
});
