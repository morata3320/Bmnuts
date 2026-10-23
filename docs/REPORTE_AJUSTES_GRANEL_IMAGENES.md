# Reporte de ajustes finales: granel, filtros e imágenes

Fecha de cierre: 21 de octubre de 2026.

## Alcance preservado

Se trabajó sobre `bmnuts-web` sin rediseñar navegación, tarjetas 3D, favoritos, búsqueda, colecciones, yogur griego, información nutricional, contacto, animaciones ni configuración de Render. No se añadieron carrito, checkout, pagos, Google Maps nuevo ni funciones de pedido. No se hizo push ni despliegue.

El árbol ya estaba modificado al iniciar. No se mezcló ese trabajo en un commit de seguridad; se guardó una copia previa fuera del repositorio en `../tmp/final-corrections-backup-20261020/`.

## Catálogo e inventario

| Concepto | Cantidad verificada |
| --- | ---: |
| Registros fuente | 545 |
| Rojos excluidos | 115 |
| Candidatos no rojos | 430 |
| Fichas públicas | 345 |
| Fichas históricas públicas | 82 |
| Grupos nuevos | 263 |
| Variantes nuevas representadas | 274 |
| Candidatos privados pendientes | 72 |
| Precios publicados | 0 |

La salida pública incorpora únicamente `saleMode`: `bulk`, `fixed_product`, `unit`, `jar`, `restricted` o `unknown`. No contiene notas, filas, colores, medida original, modalidad sugerida privada ni precios del Excel. En las 274 variantes nuevas hay 199 `bulk`, 28 `fixed_product`, 34 `unit`, 9 `jar`, 3 `restricted` y 1 `unknown`; las 82 fichas históricas quedan en 79 `bulk` y 3 `fixed_product` según su conciliación segura.

## Venta a granel en fichas

Se añadió `ProductPresentations` a la ficha individual:

- `bulk`: muestra “Venta a granel · desde $1” y explica que el peso depende del producto, sin derivar libras ni importes mientras el precio no sea público.
- `fixed_product`: muestra presentación fija y no fracciona aunque la fuente diga libra.
- `unit` y `jar`: informan presentación fija por unidad o frasco.
- `restricted`: ajonjolí muestra únicamente la regla de ½ y 1 libra; no muestra cuarto ni el peso libre “desde $1”.
- `unknown`: solicita confirmar presentación y no calcula.

El dominio conserva pruebas con importes simulados para $1,50, $2, $3, $4 y $6 por libra. Los precios cero, negativos, nulos, `NaN` e infinitos no generan opciones. Una futura publicación requiere un dataset separado con precio aprobado por variante; un precio presente en el Excel privado no activa la UI.

## Harinas y filtros

`Harinas y derivados` contiene 20 fichas públicas. La categoría se habilita a partir de la existencia real de productos, no del indicador histórico `isComingSoon`. Se ocultó la única “subcategoría” redundante porque repetía exactamente el nombre de la familia.

Categoría y subcategoría funcionan como toggle: un segundo clic las apaga. Cambiar de familia limpia la subcategoría anterior. El chip de colección conserva su cierre y ahora declara `aria-pressed`. Búsqueda, favoritos, colección y contador siguen combinándose sobre el mismo conjunto.

## Fotografías

Se añadió metadata por asset (`scale`, `objectPosition`, `framePadding`) para compensar lienzos transparentes desiguales sin zoom global ni doble escalado móvil. Se ajustaron macadamia, ambos pistachos, cashews, maní con miel, Manícris japonés, Sacha inchi, habas, garbanzos y chulpi.

La revisión encontró que `datil-sin-pepa.webp` y `garbanzo-de-sal.webp` tenían el mismo SHA-256. La ficha de dátil conserva ruta y texto, pero usa el placeholder editorial hasta recibir una fotografía auténtica. No se generó ni sustituyó ninguna foto de producto con IA.

## Colecciones y stand

Se copiaron, sin sobrescribir archivos históricos, cinco assets aprobables a `public/images/editorial/`:

- cuatro collages sin texto para desayunos, proteína vegetal, snacks y recetas;
- el afiche original de colada morada.

Las colecciones mantienen nombre, descripción, flip de ingredientes y enlace. Sus imágenes usan `object-fit: contain`, dimensiones declaradas y carga diferida. El stand pasó de seis a siete diapositivas: colada morada usa el afiche original, texto HTML neutro, `alt` específico y no incluye CTA, precio, temporada ni descuento.

Los cuatro afiches IA se inspeccionaron pero no se copiaron al sitio: todos contienen el reclamo incrustado “100 % orgánico”, aún sin aprobación. La alternativa IA de colada también afirma disponibilidad. Quedan pendientes de revisión comercial; no reemplazan el original.

## Verificación visual

Chrome real automatizado pasó en 1440×1000, 1024×900, 768×900, 390×844 y 360×800:

- cuatro imágenes editoriales cargadas a 1448 px y `object-fit: contain`;
- stand con siete indicadores, afiche original completo y cero acciones comerciales en colada;
- Harinas con 20 resultados, sin “Próximamente”, botón habilitado y toggle a 345 resultados;
- ficha de Almendra natural con granel desde $1 y ningún importe decimal;
- pistacho con cáscara y pelado con `contain`, escala por asset y sin overflow horizontal;
- ancho de GradualBlur: 104, 76,8, 58, 39 y 36 px respectivamente.

GradualBlur se verificó al inicio, mitad y final. La comparación `blur-off`/`blur-on` produjo cambios solo en los bordes y cero píxeles distintos en el centro: 101148, 66360, 53487, 33073 y 31499 píxeles de borde. Los overlays mantienen `pointer-events: none`; el filtro computado contiene `blur(...)` también con `prefers-reduced-motion: reduce`.

Firefox instalado renderizó correctamente la portada en capturas directas de 1440×1000 y 390×844. Su canal Playwright no pudo iniciar por un fallo local de `RenderCompositorSWGL`, por lo que no se afirma medición interactiva de GradualBlur en Firefox; el fallback CSS se conserva.

Evidencias fuera del repositorio: `../tmp/final-visual-qa/chromium/`, `../tmp/final-visual-qa/firefox-1440-home.png` y `../tmp/final-visual-qa/firefox-390-home.png`.

## Pruebas técnicas

- `npm run typecheck`: aprobado.
- `npm run lint`: aprobado tras excluir los scripts locales de captura del análisis de código de aplicación.
- `npm run test`: 7 archivos, 69 pruebas aprobadas.
- `npm run audit:inventory`: 545/115/430/345 y 72 pendientes, aprobado.
- `npm run build`: aprobado; advertencia no bloqueante por chunk JS mayor a 500 kB.
- Rutas directas, referencias editoriales, filtros, excepciones de granel, hashes rojos y ausencia de campos/precios privados se cubren en pruebas o auditoría.

## Pendientes de aprobación

1. Dataset público de precios por variante, con unidad, vigencia y autorización expresa.
2. Resolución de los 72 candidatos sensibles o ambiguos que siguen fuera del bundle.
3. Fotografía auténtica de Dátil sin pepa.
4. Certificación y texto de los cuatro afiches IA antes de copiarlos al sitio.
5. Presentación, etiqueta comercial e información formal del yogur griego.

No se hizo push a GitHub ni publicación en Render.
