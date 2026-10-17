import { describe, expect, it } from 'vitest';
import {
  data,
  formatProductPrice,
  getPublishedProducts,
  normalizeSearch,
  pickNextTagline,
  searchProducts,
} from './catalog';

describe('catálogo BM Nuts', () => {
  it('normaliza tildes', () => expect(normalizeSearch('Maní')).toBe('mani'));

  it.each([
    ['mani', 'Maní'],
    ['maní', 'Maní'],
    ['almendra pelada', 'Almendra pelada'],
    ['aji', 'Ají'],
  ])('encuentra %s sin depender de tildes', (query, expectedName) => {
    expect(searchProducts(getPublishedProducts(), query).some((product) => product.name.includes(expectedName))).toBe(true);
  });

  it('devuelve una lista vacía para una búsqueda inexistente', () => {
    expect(searchProducts(getPublishedProducts(), 'producto-que-no-existe-xyz')).toHaveLength(0);
  });

  it('no inventa un precio nulo', () => expect(formatProductPrice(null)).toBe('Consultar precio'));

  it('excluye pendientes de verificación', () => {
    expect(getPublishedProducts().every((product) => !product.needsVerification && product.published)).toBe(true);
  });

  it('incluye 92 descripciones reales, únicas y sin plantillas genéricas', () => {
    expect(data.products).toHaveLength(92);
    expect(new Set(data.products.map((product) => product.shortDescription)).size).toBe(92);
    expect(
      data.products.every(
        (product) =>
          !/Conoce las características|consulta sus presentaciones|consulta.*disponibilidad/i.test(
            product.shortDescription,
          ),
      ),
    ).toBe(true);
  });

  it('elige una frase diferente de la anterior', () => {
    const previous = data.brand.taglines[0];
    expect(pickNextTagline(data.brand.taglines, previous, () => 0)).not.toBe(previous);
  });

  it('mantiene seis categorías con nombres protagonistas', () => {
    expect(data.categories.map((category) => category.name)).toEqual([
      'Frutos secos y snacks',
      'Frutas deshidratadas',
      'Especias y condimentos',
      'Semillas y cereales',
      'Hierbas e infusiones',
      'Harinas',
    ]);
  });
});
