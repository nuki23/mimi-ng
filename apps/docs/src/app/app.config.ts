import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  MIMI_ERROR_MESSAGES_ES,
  provideMimiErrorMessages,
} from '@/components/ui/form-field/error-messages';
import { routes } from './app.routes';

/** Alto del header fijo (60px) más 16px, para que los anclas no queden debajo del header. */
const ANCHOR_OFFSET = 76;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideAppInitializer(() => inject(ViewportScroller).setOffset([0, ANCHOR_OFFSET])),
    // El showcase muestra los mensajes de error en español (los predeterminados son en inglés).
    // Se importa el archivo concreto para no traer form-field (ni @angular/forms) al bundle inicial.
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
};
