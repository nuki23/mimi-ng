# Decisiones del usuario (de gusto): PD-1, PD-2 y PD-3

[← Plan de refinamiento](plan.md)

Tres decisiones son de **gusto del usuario** y **no se adoptan por defecto**, ni siquiera en modo autónomo (`CLAUDE.md`, «Modo autónomo», A3, y `docs/plan.md`, «Decidido por defecto»: aquí no aplica). Las tareas que dependen de ellas (R.14, R.19, R.20) no empiezan hasta que el usuario conteste. Cada decisión trae 2 o 3 opciones con **código de uso real** (como lo escribiría quien usa Mimi) y mi recomendación; el usuario puede elegir otra o una mezcla.

---

## PD-1 Diseño de Card — **PENDIENTE DE DECIDIR (usuario)**

Afecta a: R.19 (y la parte de Card de R.8). Hoy: seis componentes (`mimi-card`, `-header`, `-title`, `-description`, `-content`, `-footer`) con tres tokens de padding combinados (`c/card/card.ts`). Lo que molesta, visto en el código: mucho anidado para una tarjeta simple, el padding de cada pieza depende de las demás y la «superficie» solo existe como un `<div>` (no se puede poner en un `<a>`, un `<button>` ni un `<section>`).

Código de hoy, para una tarjeta simple:

```html
<mimi-card>
  <mimi-card-header>
    <mimi-card-title>Plan Equipo</mimi-card-title>
    <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>
  </mimi-card-header>
  <mimi-card-content>$29 al mes</mimi-card-content>
  <mimi-card-footer><button mimiButton>Elegir</button></mimi-card-footer>
</mimi-card>
```

### Opción A: solo superficie (`mimiCard`), sin piezas

Una directiva de atributo que da fondo, borde, radio y sombra a **cualquier elemento**; el interior lo escribe el usuario con sus propias clases. Es lo que hacen Tailwind UI y «cards» sin componentes (Mantine `Paper`, HeroUI sin cabecera).

```html
<section mimiCard class="flex flex-col gap-4 p-6">
  <div>
    <h3 class="text-lg font-semibold">Plan Equipo</h3>
    <p class="text-sm text-muted-foreground">Para equipos de hasta 10 personas.</p>
  </div>
  <p>$29 al mes</p>
  <button mimiButton>Elegir</button>
</section>

<a mimiCard interactive href="/planes/equipo" class="p-6">Ver el plan</a>
```

- A favor: la más corta y libre; «Mimi no te amarra a un diseño»; sirve para `<a>`/`<button>`.
- En contra: cada usuario repite el mismo interior; sin padding ni tipografía consistentes entre tarjetas.

### Opción B: superficie + piezas opcionales como directivas (recomendada)

La superficie de la A, más **directivas** opcionales (`mimiCardHeader`, `mimiCardTitle`, `mimiCardDescription`, `mimiCardContent`, `mimiCardFooter`) que se ponen en **tus propios elementos** (no son elementos de Mimi), con **un solo padding** (`--mimi-card-padding`, que sigue al `size` de R.1) y sin reglas «primer hijo»: cada pieza lleva el mismo padding lateral y las piezas contiguas no se duplican.

```html
<section mimiCard>
  <header mimiCardHeader>
    <h3 mimiCardTitle>Plan Equipo</h3>
    <p mimiCardDescription>Para equipos de hasta 10 personas.</p>
  </header>
  <div mimiCardContent>$29 al mes</div>
  <footer mimiCardFooter><button mimiButton>Elegir</button></footer>
</section>

<!-- Sin piezas: lo mismo que la opción A -->
<section mimiCard size="sm" class="p-4">Cualquier cosa</section>
```

- A favor: el título es **tu** `<h3>` (hoy `mimi-card-title` es un `role="heading"` para evitar duplicados); cada pieza es opcional; el padding es uno; se mezcla con la A sin cambiar de API; los Blocks migran casi línea a línea.
- En contra: los nombres de las directivas se parecen a los componentes actuales (la migración es mecánica pero hay que hacerla); un poco más de escritura que la A.

### Opción C: un solo componente con entradas y espacios (`mimi-card`)

El atajo más corto para el caso común, con `title`, `description` y espacios de contenido (`footer`) por `ng-content select`.

```html
<mimi-card title="Plan Equipo" description="Para equipos de hasta 10 personas.">
  $29 al mes
  <button footer mimiButton>Elegir</button>
</mimi-card>
```

- A favor: la forma más corta de todas para el caso común (principio de uso corto).
- En contra: **amarra** a un diseño (cabecera, descripción y pie fijos), justo lo que el usuario no quiere; el título no es tu elemento (nivel de encabezado por `level`); cualquier variación obliga a abandonarlo.

### Recomendación

**Opción B**, con la A como caso límite (una `mimiCard` sin piezas es la A). Cumple «Card como superficie `mimiCard`» del reparto del usuario, no amarra a un diseño y mantiene un solo padding. La C se puede agregar **encima** de la B más adelante como atajo si hace falta (principio: corto por defecto, compuesto si lo necesitas), pero no sola.

**Qué decide el usuario:** A, B o C (o la mezcla); y si los componentes actuales `mimi-card-*` se **quitan** (ruptura, hasta la 1.0 permitida) o se conservan como alias durante una versión.

---

## PD-2 API de Table y Data Table — **PENDIENTE DE DECIDIR (usuario)**

Afecta a: R.20 (y la parte de Data Table de R.8). Lo que pide el usuario: «más fácil de llenar con `@for` e `@if`, y más fácil de expandir las filas». Hoy (`c/data-table/data-table.ts`): `[data]` + `[columns]` (objetos con `id`, `header`, `sortable`, `filterOptions`…), una plantilla por columna (`ng-template mimiTableCell="columna"`), el detalle con `mimiTableDetail` y `expanded` como lista de ids.

Código de hoy, con una celda personalizada y el detalle:

```html
<mimi-data-table [data]="clientes" [columns]="columnas" selectable [(expanded)]="abiertas">
  <ng-template mimiTableCell="estado" let-row>
    @if (row.moroso) { <span class="text-warning">Moroso</span> } @else { Activo }
  </ng-template>
  <ng-template mimiTableDetail let-row>Contacto: {{ row.email }}</ng-template>
</mimi-data-table>
```

```ts
columnas: MimiTableColumn<Cliente>[] = [
  { id: 'empresa', header: 'Empresa', sortable: true },
  { id: 'estado', header: 'Estado', filterOptions: [{ label: 'Activo', value: 'Activo' }] },
];
```

### Opción A: dos capas separadas (estilos de tabla + Data Table como hoy)

`mimiTable` y sus directivas de estilo (`mimiThead`, `mimiTr`, `mimiTh`, `mimiTd`…) sobre `<table>` nativa, **sin lógica**, para escribir tu HTML con `@for`/`@if`; y la Data Table sigue **por datos** como hoy (con las mejoras pequeñas: `row.toggle()` en la plantilla).

```html
<table mimiTable size="sm">
  <thead mimiThead>
    <tr>
      <th mimiTh>Empresa</th>
      <th mimiTh>Estado</th>
    </tr>
  </thead>
  <tbody>
    @for (c of clientes(); track c.id) {
    <tr mimiTr>
      <td mimiTd>{{ c.empresa }}</td>
      <td mimiTd>@if (c.moroso) { Moroso } @else { Activo }</td>
    </tr>
    }
  </tbody>
</table>
```

- A favor: la más barata; el aspecto de Mimi sin ningún comportamiento escondido.
- En contra: si quieres **orden, filtros, paginación o selección**, o usas la Data Table por datos, o los escribes tú: el problema «más fácil de llenar con `@for`» no se resuelve **con** las funciones de la Data Table.

### Opción B: columnas como directivas dentro de la Data Table

La Data Table sigue dibujando las filas, pero las **columnas** se declaran en la plantilla, con su celda dentro (con `@if`/`@for` libres), en vez de un arreglo de objetos más una plantilla aparte.

```html
<mimi-data-table [data]="clientes()" selectable expandable>
  <mimi-column field="empresa" header="Empresa" sortable />
  <mimi-column field="estado" header="Estado" [filter]="estados">
    <ng-template let-row>
      @if (row.moroso) { <span class="text-warning">Moroso</span> } @else { Activo }
    </ng-template>
  </mimi-column>
  <ng-template mimiRowDetail let-row let-toggle="toggle">Contacto: {{ row.email }}</ng-template>
</mimi-data-table>
```

- A favor: conserva todas las funciones; una columna es un elemento (mejor que arreglo + plantilla por `id`); sale de la edición de dos sitios.
- En contra: las **filas** siguen siendo del componente: no puedes meter una fila de totales, de grupo o un `@for` propio sobre filas; es una mejora de comodidad, no de libertad.

### Opción C: estado «headless» + directivas de estilo (recomendada)

La lógica (orden, filtros, búsqueda, paginación, selección, filas expandidas, columnas fijas) vive en una función que devuelve **señales** (`mimiTableState`); el HTML es **tuyo** (con `mimiTable`, de la A) y haces `@for` sobre `table.rows()`. La `mimi-data-table` actual pasa a ser **un atajo hecho con esas dos piezas** (se conserva por datos: `[data]` + `[columns]`).

```ts
tabla = mimiTableState(this.clientes, {
  columns: ['empresa', 'estado'],
  sort: { empresa: (a, b) => a.empresa.localeCompare(b.empresa) },
  pageSize: 10,
});
```

```html
<input mimiInput placeholder="Buscar" [(ngModel)]="tabla.query" />
<table mimiTable>
  <thead mimiThead>
    <tr>
      <th mimiTh [sort]="tabla.sort('empresa')">Empresa</th>
      <th mimiTh>Estado</th>
    </tr>
  </thead>
  <tbody>
    @for (fila of tabla.rows(); track fila.id) {
    <tr mimiTr [selected]="fila.selected()">
      <td mimiTd>{{ fila.data.empresa }}</td>
      <td mimiTd>@if (fila.data.moroso) { Moroso } @else { Activo }</td>
      <td mimiTd><button mimiButton variant="ghost" (click)="fila.toggle()">Detalle</button></td>
    </tr>
    @if (fila.expanded()) {
    <tr mimiTr>
      <td mimiTd colspan="3">Contacto: {{ fila.data.email }}</td>
    </tr>
    } }
  </tbody>
</table>
<mimi-pagination [(page)]="tabla.page" [total]="tabla.pageCount()" />
```

- A favor: resuelve **las dos** peticiones del usuario (`@for`/`@if` libres, incluso filas de otro tipo; expandir con `fila.toggle()` en cualquier botón); el mismo estado sirve para tablas, listas o tarjetas; la Data Table por datos queda como el atajo (principio de uso corto).
- En contra: la más grande (tamaño L, la API de estado se diseña con cuidado: orden, filtros y servidor `total`); más escritura que la B para quien quiere solo una tabla (por eso se conserva el atajo).

### Recomendación

**Opción C**, conservando la Data Table por datos como atajo (no se rompe `table-01` ni lo publicado). La A es su primera mitad (se hace igual) y la B es una mejora menor que la C ya cubre (una columna con `@if` es solo una celda del `@for`). Si el usuario prefiere gastar menos, **A + la `row.toggle()`** es el mínimo que cumple «expandir fácil».

**Qué decide el usuario:** A, B o C; y si `[columns]` + `mimiTableCell` se mantienen para siempre (recomendado: son el atajo) o se retiran en la 1.0.

---

## PD-3 API de los mensajes de error de Form Field — **PENDIENTE DE DECIDIR (usuario)**

Afecta a: R.14. Lo que pide el usuario: que el mensaje personalizado se ponga **donde se ponen los validadores**, o **en el propio `mimi-form-field`**; «una forma más fácil de usarlo y dar recomendaciones; o, si el actual cumple al 100 %, explicarlo de una forma más fácil».

**Cómo es hoy (comprobado en el código, 09/11/2026).** El mensaje sale así: el primer error del control → `error.message` si lo trae → texto por clave de `MIMI_ERROR_MESSAGES` (`provideMimiErrorMessages`) → `default` (`error-messages.ts`, `mimiErrorText`). Para un texto distinto **en un campo** hay que escribir `<mimi-form-error>Texto fijo</mimi-form-error>` dentro del campo (un solo texto para cualquier error). Dos hallazgos del código que cambian la conversación:

1. **En Signal Forms ya funciona «el mensaje donde va el validador»:** `required(path.user, { message: 'Elige un nombre de usuario.' })` (hay un ejemplo en `form-field-signal-forms.example.ts:26`) y `mimi-form-field` muestra ese `message` sin `mimi-form-error`. Casi nadie lo sabe: la página no lo dice.
2. **En Reactive Forms no:** un validador que devuelve `{ taken: { message: 'Ese usuario ya existe.' } }` **pierde el texto** (`fromValidationErrors` solo copia el resto del objeto como `params`, `field-state.ts:157-163`); y `Validators.required` devuelve `{ required: true }`, sin sitio para un texto. En formularios por plantilla (`ngModel` con `required`, `minlength` como atributos) tampoco hay dónde.

Código de hoy (Reactive, mensaje distinto solo para un campo):

```html
<mimi-form-field label="Usuario">
  <input mimiInput formControlName="user" />
  <mimi-form-error>Elige un nombre de usuario.</mimi-form-error>
</mimi-form-field>
```

### Opción A: un mapa en el propio `mimi-form-field`

`errors` con un texto (o función) por clave, solo para ese campo; lo que no esté sigue en `MIMI_ERROR_MESSAGES`.

```html
<mimi-form-field
  label="Usuario"
  [errors]="{ required: 'Elige un nombre de usuario.', minlength: 'Mínimo 3 letras.' }"
>
  <input mimiInput formControlName="user" />
</mimi-form-field>
```

- A favor: sirve para **los tres sistemas** (Signal, Reactive, plantilla); una línea; todos los textos del campo en un sitio; sin `mimi-form-error`.
- En contra: el texto queda **lejos del validador** (dos sitios a mantener); un objeto en la plantilla.

### Opción B: el mensaje viaja con el validador

Signal Forms ya lo hace (solo hay que **documentarlo**). Para Reactive, Mimi lee `message` del valor del error (un arreglo de dos líneas en `field-state.ts`) y ofrece `withMessage(validador, texto)` para envolver los de Angular.

```ts
// Signal Forms: ya funciona
required(path.user, { message: 'Elige un nombre de usuario.' });

// Reactive Forms: nuevo
user = new FormControl('', [
  withMessage(Validators.required, 'Elige un nombre de usuario.'),
  withMessage(Validators.minLength(3), (e) => `Mínimo ${e.requiredLength} letras.`),
]);
```

```html
<mimi-form-field label="Usuario"><input mimiInput formControlName="user" /></mimi-form-field>
```

- A favor: **es lo que el usuario describió** («donde se ponen los validadores»): el texto vive con la regla; la plantilla queda mínima; el mismo texto se reutiliza donde se use ese control.
- En contra: no cubre los formularios por plantilla (`required` como atributo); `withMessage` es API nueva de Mimi para Reactive; cambia el lugar de los textos respecto de `provideMimiErrorMessages` (los dos siguen: el del validador gana).

### Opción C: varios `mimi-form-error` por clave (extender lo actual)

Mantiene `<mimi-form-error>` pero permite uno por clave.

```html
<mimi-form-field label="Usuario">
  <input mimiInput formControlName="user" />
  <mimi-form-error key="required">Elige un nombre de usuario.</mimi-form-error>
  <mimi-form-error key="minlength">Mínimo 3 letras.</mimi-form-error>
</mimi-form-field>
```

- A favor: la menor ruptura; se parece a la forma actual y a los `<mat-error *ngIf>` de Angular Material.
- En contra: el más largo (una línea por error por campo, repetida en cada formulario); no es la forma corta.

### Recomendación

**A y B juntas, en capas** (la C no): **B** como camino principal («el mensaje donde va el validador»: ya funciona en Signal Forms y se agrega para Reactive) y **A** como respaldo universal (el único que sirve a `ngModel`/plantilla y para cambiar un texto sin tocar el validador). Orden de prioridad, que se documenta con una tabla: `<mimi-form-error>` explícito > `message` del validador (B) > `[errors]` del campo (A) > `provideMimiErrorMessages` > predeterminado. Y en cualquier caso, **mejorar la documentación del caso actual** (diagrama «control → primer error → texto» y la tabla de qué clave produce cada validador), que es lo que el usuario pidió si el actual cumple.

**Qué decide el usuario:** A, B, C o una mezcla (la recomendada es A + B); y si `<mimi-form-error>` se conserva tal cual (recomendado: sí, es el último recurso de posición y texto libre).

---

## Cómo se registran las decisiones

Cuando el usuario conteste, la respuesta se anota **en la tarea** (R.14, R.19 o R.20) como «Decidido por el usuario (fecha)», se quita la línea de `docs/plan/decisiones.md`, y las que cambien una regla pasan a la spec (4 o 8). No entran en `docs/auto/decisiones-por-defecto.md`: no se decidieron por defecto.
