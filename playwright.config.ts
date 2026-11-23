import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de extremo a extremo del showcase (M.18 y 1.0-5): Playwright contra el sitio compilado
 * (`dist/docs/browser`, de `pnpm build:docs`), servido por `apps/docs/e2e/serve.mjs`.
 *
 * Proyectos: los tres motores de escritorio y dos teléfonos emulados (decidido por el usuario el
 * 23/11/2026): un Android en Chromium y un iPhone en WebKit, los dos a 360 px de ancho (el ancho
 * de referencia de la revisión móvil; el punto de corte de los paneles es 640 px).
 *
 * Sin recursos externos: `fixtures.ts` corta toda petición que no vaya al sitio (las fuentes de
 * Google, por ejemplo), y las pruebas no esperan tiempos fijos, sino condiciones.
 *
 * `pnpm e2e` (todo), `pnpm e2e --project=chromium`, `pnpm e2e:report` (el informe HTML).
 */
const PORT = Number(process.env['MIMI_E2E_PORT'] ?? 4310);
const CI = !!process.env['CI'];

const phone = { width: 360, height: 780 };

export default defineConfig({
  testDir: 'apps/docs/e2e',
  outputDir: 'tmp/e2e/results',
  fullyParallel: true,
  forbidOnly: CI,
  // Sin reintentos, tampoco en la CI: una prueba inestable tiene que verse, no pasar al segundo
  // intento (1.0-5: «pruebas fiables»).
  retries: 0,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: CI
    ? [['list'], ['html', { outputFolder: 'tmp/e2e/report', open: 'never' }], ['github']]
    : [['list'], ['html', { outputFolder: 'tmp/e2e/report', open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    locale: 'es-ES',
    timezoneId: 'America/Bogota',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 900 } },
    },
    { name: 'android', use: { ...devices['Pixel 7'], viewport: phone, screen: phone } },
    { name: 'iphone', use: { ...devices['iPhone 13'], viewport: phone, screen: phone } },
  ],
  webServer: {
    command: `node apps/docs/e2e/serve.mjs dist/docs/browser ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !CI,
    timeout: 30_000,
  },
});
