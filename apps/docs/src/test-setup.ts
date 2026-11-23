/**
 * Preparación común de las pruebas de docs (M.17).
 *
 * Desde Node 25, `localStorage` y `sessionStorage` son globales de Node: sin
 * `--localstorage-file` valen `undefined` y tapan a los de jsdom, así que `localStorage.clear()`
 * falla con Node 26 y pasa con Node 24. Para que las pruebas no dependan de la versión de Node
 * ni de opciones como `--no-experimental-webstorage`, el global apunta siempre al almacenamiento
 * de jsdom (el de la instancia que Vitest expone como `jsdom`; un `Storage` de verdad, así que
 * `Storage.prototype` se puede espiar). `window` no sirve: en el entorno de Vitest es el mismo
 * `globalThis`, con el global de Node encima.
 */
const jsdomWindow = (globalThis as unknown as { jsdom?: { window: Record<string, unknown> } }).jsdom
  ?.window;
for (const name of ['localStorage', 'sessionStorage'] as const) {
  const fromJsdom = jsdomWindow?.[name] as Storage | undefined;
  let current: Storage | undefined;
  try {
    current = (globalThis as unknown as Record<string, Storage | undefined>)[name];
  } catch {
    current = undefined;
  }
  if (fromJsdom && current !== fromJsdom) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      enumerable: true,
      get: () => fromJsdom,
    });
  }
}
