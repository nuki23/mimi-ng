// Solo la API pública (api-1.0, C8). Las clases de las celdas (MIMI_TABLE_CELL, MIMI_TABLE_HEAD,
// MIMI_TABLE_STACK…), MimiThOutlet, mimiLabelCells, mimiClearStackRoles y MIMI_DEFAULT_ROW_ID
// son internos: Data Table los importa de './table' y './table-state'.
export {
  MimiCaption,
  MimiRowToggle,
  MimiTable,
  MimiTableImports,
  MimiTbody,
  MimiTd,
  MimiTh,
  MimiThead,
  MimiTr,
} from './table';
export * from './table-config';
export {
  type MimiRowColumn,
  type MimiTableFilters,
  type MimiTableRow,
  type MimiTableSort,
  type MimiTableSortHandle,
  type MimiTableState,
  type MimiTableStateColumn,
  type MimiTableStateOptions,
  mimiCompareValues,
  mimiFilterSortRows,
  mimiNextSort,
  mimiTableState,
} from './table-state';
