import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de File Upload, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar
 * el componente al chunk inicial. Los tamaños se escriben con `Intl.NumberFormat` y el idioma.
 */

export interface MimiFileUploadText {
  /** Título de la zona en reposo (también su nombre accesible). */
  title: string;
  /** Título con archivos encima. */
  drop: (count: number) => string;
  /** Título en solo lectura (opcional: sin él, el inglés). */
  readonly?: string;
  /** Nombre de la lista. */
  list: string;
  /** Nombre de la barra de un archivo. */
  uploading: (name: string) => string;
  uploaded: string;
  retry: string;
  remove: (name: string) => string;
  /** Motivos de rechazo. */
  tooLarge: (max: string) => string;
  wrongType: string;
  tooMany: (max: number) => string;
  /** Anuncios. */
  added: (count: number) => string;
  rejected: (name: string, reason: string) => string;
  done: (name: string) => string;
  failed: (name: string, error: string) => string;
}

export const MIMI_FILE_UPLOAD_TEXT_EN: MimiFileUploadText = {
  title: 'Drag files here or click',
  drop: (count) =>
    count > 0 ? `Drop to upload ${count} ${count === 1 ? 'file' : 'files'}` : 'Drop to upload',
  readonly: 'Files (read-only)',
  list: 'Files',
  uploading: (name) => `Uploading ${name}`,
  uploaded: 'Uploaded',
  retry: 'Retry',
  remove: (name) => `Remove ${name}`,
  tooLarge: (max) => `Exceeds the ${max} limit.`,
  wrongType: 'File type not allowed.',
  tooMany: (max) => `Up to ${max} ${max === 1 ? 'file' : 'files'}.`,
  added: (count) => `${count} ${count === 1 ? 'file' : 'files'} added`,
  rejected: (name, reason) => `${name} not added: ${reason}`,
  done: (name) => `${name} uploaded`,
  failed: (name, error) => `${name} failed: ${error}`,
};

export const MIMI_FILE_UPLOAD_TEXT_ES: MimiFileUploadText = {
  title: 'Arrastra archivos o haz clic',
  drop: (count) =>
    count > 0
      ? `Suelta para subir ${count} ${count === 1 ? 'archivo' : 'archivos'}`
      : 'Suelta para subir',
  readonly: 'Archivos (solo lectura)',
  list: 'Archivos',
  uploading: (name) => `Subiendo ${name}`,
  uploaded: 'Subido',
  retry: 'Reintentar',
  remove: (name) => `Quitar ${name}`,
  tooLarge: (max) => `Supera el máximo de ${max}.`,
  wrongType: 'Tipo de archivo no permitido.',
  tooMany: (max) => `Hasta ${max} ${max === 1 ? 'archivo' : 'archivos'}.`,
  added: (count) => `${count} ${count === 1 ? 'archivo agregado' : 'archivos agregados'}`,
  rejected: (name, reason) => `${name} no se agregó: ${reason}`,
  done: (name) => `${name} subido`,
  failed: (name, error) => `${name} con error: ${error}`,
};

export const MIMI_FILE_UPLOAD_TEXT = new InjectionToken<MimiFileUploadText>(
  'MIMI_FILE_UPLOAD_TEXT',
  { providedIn: 'root', factory: () => MIMI_FILE_UPLOAD_TEXT_EN },
);

/** Cambia los textos de File Upload. Lo que no definas sigue en inglés. */
export function provideMimiFileUploadText(text: Partial<MimiFileUploadText>): Provider {
  return { provide: MIMI_FILE_UPLOAD_TEXT, useValue: { ...MIMI_FILE_UPLOAD_TEXT_EN, ...text } };
}
