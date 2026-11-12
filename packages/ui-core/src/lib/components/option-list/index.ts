// Solo la API pública: MimiOptionList, MimiListOutlet y las funciones de secciones son internos
// (se quedan en './option-list', para los componentes de Mimi que tienen lista).
export {
  MimiHighlight,
  MimiOptgroup,
  MimiOptionItem,
  type MimiListFilter,
  type MimiListOption,
  type MimiListOptionContext,
  type MimiListOptionGroup,
  type MimiSearchMode,
  type MimiCompareWith,
  mimiCompareFn,
  mimiDefaultListFilter,
  mimiNormalizeText,
} from './option-list';
