# Estado anterior a los ajustes de granel e imágenes

Fecha: 20 de octubre de 2026.

- El árbol de trabajo ya contenía cambios locales de la actualización mayor; se preservaron sin commit, `reset`, `checkout`, `stash`, push ni despliegue.
- La conciliación anterior publicaba 345 fichas, excluía 115 registros rojos y mantenía 72 candidatos fuera del bundle.
- `src/domain/bulkSale.ts` calculaba el mínimo de USD 1 y sus excepciones, pero ninguna ficha consumía esa lógica ni mostraba la modalidad de venta.
- La categoría histórica `harinas` conservaba `isComingSoon: true`, aunque el catálogo público nuevo ya contenía 20 fichas válidas.
- Categorías y subcategorías no se apagaban al pulsar de nuevo su píldora activa; el chip de colección sí se podía quitar.
- Las fotografías usaban un único encuadre CSS. El tamaño perceptual variaba entre assets y `datil-sin-pepa.webp` era un duplicado exacto de `garbanzo-de-sal.webp`.
- Las colecciones aún componían miniaturas de productos; las cuatro imágenes editoriales nuevas no estaban integradas.
- El stand tenía seis diapositivas y no incluía el afiche original de colada morada.
- GradualBlur estaba implementado en la selección editorial y había sido validado en Chrome en cinco anchos; debía preservarse y reprobarse tras estos cambios.

Respaldo previo local: `../tmp/final-corrections-backup-20261020/` (fuera del repositorio).
