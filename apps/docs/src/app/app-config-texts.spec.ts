import { MIMI_OVERLAY_TEXT } from '@/components/ui/utils/overlay-config';
import { appConfig } from './app.config';

// El sitio está en español (`<html lang="es">`): la X y «Atrás» de la hoja (R.34) también
// (revisión de accesibilidad de la tanda 1 de la 0.8.0, H4; WCAG 3.1.2).
describe('Textos del sitio en app.config', () => {
  it('la hoja usa MIMI_OVERLAY_TEXT_ES', () => {
    const provider = (appConfig.providers as unknown[]).find(
      (p): p is { provide: unknown; useValue: { close: string; back: string } } =>
        typeof p === 'object' &&
        p !== null &&
        (p as { provide?: unknown }).provide === MIMI_OVERLAY_TEXT,
    );
    expect(provider?.useValue).toEqual({ close: 'Cerrar', back: 'Atrás' });
  });
});
