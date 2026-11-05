import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Tags Input, en archivo propio (como Select, G1.5). Los del chip (quitar y los
 * anuncios) están en `chip-texts.ts`.
 */

export interface MimiTagsInputText {
  /** Ayuda debajo del campo. */
  help: string;
  /** La etiqueta ya está en la lista. */
  duplicate: (tag: string) => string;
  /** Se llegó al máximo. */
  full: (max: number) => string;
  /** Placeholder con el máximo alcanzado. */
  fullPlaceholder: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_TAGS_INPUT_TEXT_EN: MimiTagsInputText = {
  help: 'Enter or comma to add · Backspace removes the last one',
  duplicate: (tag) => `“${tag}” is already in the list.`,
  full: (max) => `You reached the limit of ${max}. Remove one to add another.`,
  fullPlaceholder: 'Limit reached',
};

/** Textos en español: `provideMimiTagsInputText(MIMI_TAGS_INPUT_TEXT_ES)`. */
export const MIMI_TAGS_INPUT_TEXT_ES: MimiTagsInputText = {
  help: 'Enter o coma para agregar · Backspace quita la última',
  duplicate: (tag) => `«${tag}» ya está en la lista.`,
  full: (max) => `Llegaste al límite de ${max} etiquetas. Quita una para agregar otra.`,
  fullPlaceholder: 'Límite alcanzado',
};

/** Textos activos. Sin `provideMimiTagsInputText`, los predeterminados en inglés. */
export const MIMI_TAGS_INPUT_TEXT = new InjectionToken<MimiTagsInputText>('MIMI_TAGS_INPUT_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_TAGS_INPUT_TEXT_EN,
});

/** Cambia los textos de Tags Input. Lo que no definas sigue en inglés. */
export function provideMimiTagsInputText(text: Partial<MimiTagsInputText>): Provider {
  return { provide: MIMI_TAGS_INPUT_TEXT, useValue: { ...MIMI_TAGS_INPUT_TEXT_EN, ...text } };
}
