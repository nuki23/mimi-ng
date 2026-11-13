# Cómo quedarían Button y Select con cada variante

[← Plan](plan.md) · PD-4, **PENDIENTE DE DECIDIR (usuario)**

Esqueletos: las secciones en orden, con su contenido y de dónde sale (**hoy**: el ejemplo que ya existe; **nuevo**: hay que escribirlo; **fuera**: se quita o pasa a otro sitio). Las frases son las que llevaría la página.

## Button

Hoy: 8 ejemplos, unas 240 palabras, sin sección de accesibilidad, una nota de atajos que se quitan y una matriz que repite Tonos y Variantes.

### Variante A (completa)

```text
# Button
  «Botón para las acciones de una página, en seis tonos, tres variantes y tres tamaños.»
  [demo] Guardar · Cancelar (outline) · Eliminar (destructive) · Guardar con spinner   ← nuevo, 25 líneas

## Instalación        comando · ▸ Qué instala (nada más: solo Tailwind)
## Uso                <button mimiBtn>Guardar</button>  (3 líneas) + 1 frase
## Ejemplos
  ### Tamaños         sm, md y lg                                        ← hoy «Tamaños»
  ### Variantes       «Seis tonos en tres variantes.» Fila por variante  ← hoy «Tonos» + «Variantes»
                      ▸ Ver la matriz variante × tono                    ← hoy «Matriz», en el desplegable
  ### Estados         deshabilitado y cargando                           ← hoy
  ### Con ícono       ícono al inicio, al final y solo ícono             ← hoy
  ### Como enlace     <a mimiBtn routerLink>                             ← hoy (caso avanzado)
  ### Personalizar con class                                             ← hoy
## Accesibilidad y teclado
  · Enter y Espacio activan; con `loading`, `aria-busy` y sigue enfocable.
  · Deshabilitado sigue enfocable (`aria-disabled`) para que se lea por qué.   ← hoy, el párrafo de 70 palabras en 1 viñeta
  · Un botón de solo ícono necesita `aria-label`.
## API
  ### Entradas        variant, tone, size, loading, disabled, class (sin los atajos que se quitan)
                      data-variant, data-tone, data-size, data-loading
  ### Variables CSS
fuera: la nota de los atajos que se quitan (→ CHANGELOG, con enlace)
```

6 ejemplos vivos (hoy, 8) y unas 160 palabras visibles.

### Variante B (corta)

```text
# Button
  «Botón para las acciones de una página.»
  [demo] la misma
## Instalación        comando
## Uso                3 líneas, sin prosa
## Ejemplos
  ### Variantes y tamaños   variantes en filas, con sm/md/lg en la última   ← hoy Tonos + Variantes + Tamaños
  ### Estados               deshabilitado, cargando, con ícono               ← hoy Estados + Con ícono
  ### Como enlace
## Accesibilidad y teclado   3 viñetas (las de A)
## API                       una tabla · ▸ Variables CSS
fuera: la matriz, «Personalizar con class» (→ una línea en la API: «class se mezcla con cn()»)
```

3 ejemplos vivos y unas 90 palabras visibles.

## Select

Hoy: 11 ejemplos, unas 970 palabras con la API, tres ejemplos vivos de formularios **más** las pestañas, y Textos y Outputs con su propia forma.

### Variante A (completa)

```text
# Select
  «Lista desplegable para elegir una opción, con buscador, grupos y estado de carga.»
  [demo] «País de envío»: <mimi-option> en <mimi-optgroup> con @for, search y clearable   ← hoy «Con <mimi-option>» + «Con búsqueda»

## Instalación        comando · ▸ Qué instala (option-list, @angular/aria, @angular/cdk y su CSS)   ← hoy, 56 palabras en la página
## Uso                <mimi-select [(value)]> con dos <mimi-option> (8 líneas)
                      «El texto de cada opción es lo que se ve; value, lo que recibe tu signal o tu formulario.»
## Ejemplos
  ### Tamaños         sm, md y lg                                                   ← nuevo
  ### Estados         limpiar, deshabilitado, solo lectura, cargando y con error    ← hoy «Estados» + solo lectura (nuevo)
  ### Formularios     pestañas Signal Forms / Reactive / plantilla                  ← hoy F; fuera los 3 ejemplos vivos
  ### Búsqueda en el servidor   searchMode="server", loading y compareWith="id"     ← hoy (la frase baja de 67 a 25 palabras)
  ### Contenido propio de la opción   ng-template mimiSelectOption                  ← sale de hoy «Con búsqueda»
  ### Personalizar con class   class al disparador y panelClass al panel           ← hoy «Personalizado»
  ### Alternativa: [options] para listas generadas por código                     ← hoy
## Accesibilidad y teclado
  · Enter, Espacio, ↓ o ↑ abren en la opción elegida; una letra salta a la que empieza por ella.
  · Enter elige y Escape cierra; el foco vuelve al disparador.
  · Con clearable, Supr o Retroceso quitan el valor.
  · Con buscador, el foco queda en el campo y la opción activa se anuncia.
  ▸ Más detalles (popover nativo, movimiento reducido, Tab)
## API
  ### Entradas        (sin cambios de contenido; descripciones de 20 palabras como máximo)
  ### Salidas         valueChange, searchChange, touch                              ← hoy «Outputs»
  ### Piezas          mimi-option, mimi-optgroup, ng-template mimiSelectOption, mimi-select-highlight
  ### Textos          MIMI_SELECT_TEXT_ES                                            ← hoy bajo API, igual
  ### Variables CSS
fuera: «Con etiqueta» (casi igual que la demo); «Grupos y opciones deshabilitadas» (en la demo);
       Reactive Forms, Signal Forms y ngModel vivos (las pestañas los cubren)
```

7 ejemplos vivos (hoy, 11) y unas 420 palabras con la API (hoy, unas 970).

### Variante B (corta)

```text
# Select
  «Lista desplegable para elegir una opción.»
  [demo] la misma
## Instalación        comando · ▸ Qué instala
## Uso                8 líneas, sin prosa
## Ejemplos
  ### Tamaños y estados          sm/md/lg + limpiar, deshabilitado, solo lectura, cargando y error
  ### Formularios                pestañas
  ### Búsqueda en el servidor
  ### Alternativa: [options]
## Accesibilidad y teclado   3 viñetas · ▸ el resto
## API                       una tabla (salidas como filas `(searchChange)`) · ▸ Piezas · ▸ Textos · ▸ Variables CSS
fuera: «Contenido propio de la opción» y «Personalizar con class» (→ página «Recetas»)
```

4 ejemplos vivos y unas 220 palabras con la API.
