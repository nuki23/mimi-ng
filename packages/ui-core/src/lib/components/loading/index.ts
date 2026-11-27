// Solo la API pública: MimiLoadingOverlay, MimiLoadingGate y mimiMakeInert son internos.
export {
  MIMI_LOADING_CONFIG,
  MIMI_LOADING_CONFIG_DEFAULT,
  type MimiLoadingConfig,
  MimiLoadingService,
  type MimiLoadingOptions,
  type MimiLoadingRef,
  injectMimiLoading,
  provideMimiLoading,
} from './loading';
export { MimiBlock } from './block';
export * from './loading-texts';
