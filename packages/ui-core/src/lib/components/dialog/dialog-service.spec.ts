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
