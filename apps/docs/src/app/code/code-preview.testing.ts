import type { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CodePreview } from './code-preview';

/** Lo mínimo de un ComponentFixture que usan estas ayudas (sin importar @angular/core/testing). */
interface Fixture {
  debugElement: DebugElement;
  whenStable(): Promise<unknown>;
}

/**
 * Espera a que Tabs cree los paneles: aria los crea en un afterRenderEffect y Mimi pinta su
 * contenido en otro efecto, así que un solo whenStable no alcanza.
 */
export async function settle(fixture: Fixture): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }
}

/**
 * Los ejemplos de una página: el lienzo de Preview (sin las pestañas ni el botón Copiar) y el
 * archivo que muestra su pestaña Código (`code`; que el panel lo muestre lo prueba CodePreview).
 */
export function examples(fixture: Fixture): { example: HTMLElement | null; code: string }[] {
  return fixture.debugElement.queryAll(By.directive(CodePreview)).map((preview) => ({
    example: (preview.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-slot="example"]',
    ),
    code: (preview.componentInstance as CodePreview).code(),
  }));
}
