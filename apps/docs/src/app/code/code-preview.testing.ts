import type { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CodePreview } from './code-preview';

/** Lo mínimo de un ComponentFixture que usan estas ayudas (sin importar @angular/core/testing). */
interface Fixture {
  debugElement: DebugElement;
  whenStable(): Promise<unknown>;
}

/**
 * Tiempo máximo de la prueba «cada ejemplo corre en Preview…» de cada página (y solo de esa
 * familia; el resto sigue con los 5 s de Vitest). Esa prueba es la primera de su archivo y
 * renderiza la página entera con todos sus ejemplos: paga la primera creación de cada componente
 * en modo dev sobre jsdom. Medido el 05/11/2026 (M.12), con Node 24 en un equipo de 12 núcleos:
 * aislada tarda 1–2 s (perfil de Tabs: unos 0,3 s de Angular, 0,2 s de jsdom y 0,04 s de
 * tailwind-merge, sin un calentamiento que valga la pena compartir; el resaltador ya va
 * simulado), pero con `pnpm test` completo, con los 12 workers ocupados, la misma prueba tardó
 * hasta 8,6 s. 20 s deja más del doble de margen sobre lo peor medido sin tapar un cuelgue real.
 */
export const PAGE_EXAMPLES_TIMEOUT = 20_000;

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
