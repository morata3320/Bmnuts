# Reporte de precios y presentaciones públicas

Fecha de conciliación: 2026-10-23.

## Resultado

- Fichas públicas finales: 345.
- Fichas con al menos un precio publicado: 341.
- Entradas de precio publicadas: 350.
- Fichas con precio pendiente por discrepancia: 4.
- Entradas a granel o por libra: 251.
- Entradas de presentación fija, unidad o envase: 99.
- Excepciones de ajonjolí (solo ½ y 1 libra): 3.
- Registros rojos excluidos: 115.
- Candidatos privados que continúan pendientes: 72.

## Modalidades implementadas

- Granel fraccionable: Desde $1, ¼ libra, ½ libra y 1 libra; se ocultan las fracciones cuyo importe no llega a $1.
- Ajonjolí restringido: únicamente ½ libra y 1 libra, sujetas al mínimo de $1.
- Solo producto: precio fijo, sin conversión ni fraccionamiento.
- Unidad, frasco y envase: precio de la presentación comercial, sin selector por peso.
- Pendiente: se muestra “Precio por confirmar” y no se calcula ningún importe.

## Discrepancias pendientes

- `BMN-048` — Mix amarillo: correspondencia ambigua.
- `BMN-052` — Comino: correspondencia ambigua.
- `BMN26-50c820b09056` — Canela Rama: modalidad de pesaje no verificable para publicación automática.
- `BMN26-3ac075161e2c` — Sal Marina: una misma presentación aparece con precios incompatibles.

## Familias agrupadas con precios distintos

- Aceite de Coco de Lu.
- Consul Aceite de Oliva.
- Levadura Nutricional.
- Manteq. Clarificada Ghee.
- Mate Taragui.

Cada una conserva el precio de cada variante por separado. No se promedian ni se combinan importes incompatibles.

## Privacidad y trazabilidad

La salida pública de precios contiene únicamente identificadores públicos, centavos enteros, base de cobro y etiqueta de presentación. No contiene filas del Excel, colores, notas internas, nombres de campos privados ni el libro fuente. La conciliación completa permanece fuera de `bmnuts-web`.
