import type { Type } from '@angular/core';

/**
 * Los Blocks que se pueden ver en `/preview/blocks/<nombre>` (B.1). Cada Block se carga diferido
 * (no suma a main ni al chunk de la vista previa). `states`: entradas con las que se muestra un
 * estado (`?state=loading`), que la página del Block elige con su selector.
 */
export interface BlockPreview {
  load: () => Promise<Type<unknown>>;
  states?: Record<string, Record<string, unknown>>;
}

export const BLOCK_PREVIEWS: Record<string, BlockPreview> = {
  'login-01': {
    load: () => import('@/blocks/login-01').then((m) => m.Login01),
    states: {
      loading: { loading: true },
      error: { error: 'Wrong email or password. Try again or reset your password.' },
    },
  },
  'otp-01': {
    // Con una verificación de mentira (246810), para ver el error y el éxito (otp-01-demo.ts).
    load: () => import('./otp-01-demo').then((m) => m.Otp01Demo),
    states: { resend: { resendSeconds: 0 } },
  },
  'signup-01': {
    load: () => import('@/blocks/signup-01').then((m) => m.Signup01),
    states: {
      loading: { loading: true },
      error: { error: 'This email is already registered. Sign in or use another one.' },
    },
  },
  'login-02': {
    load: () => import('@/blocks/login-02').then((m) => m.Login02),
    states: {
      // Una ilustración del sitio (original de Mimi): el Block no trae imágenes.
      image: { imageSrc: '/avatars/avatar-2.svg' },
      loading: { loading: true },
      error: { error: 'Wrong email or password. Try again or reset your password.' },
    },
  },
};
