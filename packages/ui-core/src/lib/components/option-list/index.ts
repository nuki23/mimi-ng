// Solo la API pública: MimiOptionList, MimiListOutlet y las funciones de secciones son internos
// (se quedan en './option-list', para los componentes de Mimi que tienen lista).
export {
  MimiHighlight,
  type MimiListFilter,
  type MimiListOption,
  type MimiListOptionContext,
  type MimiListOptionGroup,
  mimiDefaultListFilter,
  mimiNormalizeText,
} from './option-list';
