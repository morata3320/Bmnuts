# Reporte de implementación de la actualización mayor

Fecha: 20 de octubre de 2026.

## Resultado

Se integró el inventario reciente sin rediseñar la aplicación y sin publicar precios privados. La web continúa siendo un catálogo informativo.

| Concepto | Cantidad |
| --- | ---: |
| Registros no vacíos en Excel | 545 |
| Rojos excluidos definitivamente | 115 |
| Candidatos no rojos | 430 |
| Registros representados por las 82 fichas históricas públicas | 84 |
| Registros nuevos publicados como variantes | 274 |
| Grupos/fichas nuevas resultantes | 263 |
| Candidatos pendientes de revisión | 72 |
| Fichas públicas finales | 345 |

La reconciliación es disjunta: `84 + 274 + 72 = 430`. Las 345 fichas finales son `82 históricas + 263 nuevas`.

## Inventario y agrupación

- Las seis familias principales se mantienen.
- Las familias complementarias aparecen bajo el encabezado discreto `Más productos`: chocolates/cacao/repostería; aceites/aderezos/conservas/vinagres; bebidas/leches/yogures/despensa; endulzantes/mieles.
- Las presentaciones equivalentes se agrupan sin borrar su identidad. Por ejemplo, aceite de coco De Lu conserva 130, 250 y 500 ml; Consul conserva sus volúmenes; ghee, mate, levadura nutricional y otras presentaciones mantienen variantes separadas.
- Los productos nuevos sin fotografía usan el placeholder existente.
- Las fichas antiguas válidas mantienen fotografía, texto, favoritos, rutas y relaciones editoriales.
- No se añadieron etiquetas visuales de stock. El estado intermitente existe en los datos públicos depurados, pero la interfaz no promete disponibilidad actual.

Los 72 pendientes corresponden a artículos sensibles, accesorios/servicios o identificaciones comerciales ambiguas. No están en el bundle público. La cadena dañada de las paletas de Halloween tampoco se publica.

## Exclusión de rojos y filtros

- El generador valida 545/430/115 antes de producir salida.
- Se guardan solo hashes normalizados de exclusión para las pruebas; los nombres rojos y sus precios no se copian.
- Búsqueda, categoría, subcategoría, favoritos y colección trabajan sobre el mismo conjunto público de 345 fichas.
- Colecciones, stand, preparaciones y `Combina bien con` se comprobaron contra IDs públicos.
- Una ruta que no pertenezca al conjunto público conserva la vista segura `Producto no encontrado`.
- El PDF de 12 páginas arrojó cero coincidencias contra los 115 nombres rojos normalizados.

## Venta a granel

Se añadió un dominio puro sin interfaz de compra y sin valores comerciales reales. Implementa:

- Compra mínima de $1 por producto para granel, con peso aproximado `100 / precioPorLibraEnCentavos`.
- Cuarto, media y libra solo cuando el valor exacto alcanza $1 antes de redondear.
- $3,99 por libra no habilita cuarto, porque 399/4 es menor de 100 centavos.
- `solo producto` y `solo producto de dólar` como presentación fija.
- Ajonjolí únicamente en media y libra.
- Frasco, botella, paquete, unidad, gramos y mililitros como presentación no fraccionable.
- Canela en rama como peso variable a consultar.
- Precio cero, ausente o inválido sin opciones y sin `NaN`/`Infinity`.

La lógica está lista para una fase posterior, pero ninguna opción de precio ni selector se muestra ahora.

## GradualBlur

El efecto se aplica al carrusel existente `Selección editorial`. No se creó otro carrusel.

- Se mantienen seis capas, ahora ancladas al borde correspondiente, con anchos decrecientes y blur incremental real mediante `backdrop-filter` y `-webkit-backdrop-filter`.
- La máscara hace progresivo el efecto hacia la periferia; el centro no recibe overlay.
- Los overlays usan `pointer-events: none` y `aria-hidden`.
- El estado se actualiza con listener pasivo, `requestAnimationFrame` y `ResizeObserver`, con limpieza completa.
- Inicio: izquierda oculta y derecha visible.
- Mitad: ambos lados visibles.
- Final: izquierda visible y derecha oculta.
- El fallback sin `backdrop-filter` es un degradado suave, sin bloquear interacción.
- Se corrigió el `scrollLeft` inicial móvil provocado por margen/padding negativos.

Verificación real en Chrome local:

| Viewport | Ancho del overlay | Inicio / mitad / final | Píxeles distintos en bordes | Píxeles distintos en centro | Overflow horizontal |
| --- | ---: | --- | ---: | ---: | ---: |
| 1440 | 104 px | correcto | 100984 | 0 | 0 |
| 1024 | 76,8 px | correcto | 66255 | 0 | 0 |
| 768 | 58 px | correcto | 53483 | 0 | 0 |
| 390 | 39 px | correcto | 33057 | 0 | 0 |
| 360 | 36 px | correcto | 31440 | 0 | 0 |

En los cinco tamaños también se comprobó que la flecha desplaza el carrusel, el filtro computado contiene `blur(...)`, no hay scroll horizontal de página y los overlays no interceptan eventos. Las capturas `blur-off`/`blur-on` y las mediciones están en `../tmp/visual-qa/`, fuera del repositorio. Firefox no estaba disponible en el entorno; su fallback se verificó por CSS, no mediante captura real.

## Pruebas

La suite pasó de 34 a 56 pruebas en 6 archivos. Cubre inventario, hashes de exclusión, privacidad, conteos, categorías, búsqueda, relaciones editoriales, agrupación, reglas de centavos y excepciones de presentación.

Resultados finales:

- `npm run audit:inventory`: correcto; 545 filas, 115 rojos, 430 no rojos y conciliación completa.
- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- `npm run test`: 6 archivos y 56 pruebas aprobadas.
- `npm run build`: correcto; JS 545,46 kB (121,59 kB gzip) y CSS 45,69 kB (10,24 kB gzip).

Vite advierte que el chunk principal supera 500 kB sin comprimir. Es una advertencia de optimización, no un fallo; el aumento corresponde principalmente al catálogo público de 345 fichas. La revisión de `dist` no encontró nombres de campos privados, rutas privadas, el Excel ni el JSON interno. `git ls-files` tampoco contiene fuentes privadas.

## Pendientes comerciales

1. Aprobar fecha, unidad, vigencia y condiciones de cada precio antes de publicar cualquier importe.
2. Resolver los 72 candidatos sensibles, accesorios o ambiguos; por ahora no son públicos.
3. Confirmar presentación, unidad y etiqueta comercial del yogur griego. Continúa únicamente como novedad editorial sin precio.
4. Confirmar si los amarillos deben mostrar algún mensaje específico; hoy no prometen stock.
5. Corregir en la fuente el nombre dañado de las paletas de Halloween antes de considerarlo.
6. Revisar manualmente `Mix amarillo` duplicado y las dos formas de `Comino`; se preservaron bajo los IDs históricos sin crear rutas duplicadas.

No se hizo push a GitHub ni despliegue en Render.
