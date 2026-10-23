import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import excludedProductHashes from './test-fixtures/excluded-product-hashes.json';
import publicInventory from './data/catalogo-publico-2026.json';
import publicPricing from './data/precios-publicos-2026.json';
import {
  getCatalogCategories,
  getPublishedProducts,
  majorUpdateMetadata,
  normalizeSearch,
  searchProducts,
} from './catalog';
import { editorialCollections } from './data/collections';
import { preparationIdeas, relatedProductIds } from './data/recipes';
import { standItems } from './data/stand';

const normalizeSourceName = (value: string) =>
  normalizeSearch(value)
    .replace(/\b(?:lb|libra|und|unidad|frasco|paq)\.?\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const hashName = (value: string) => createHash('sha256').update(normalizeSourceName(value)).digest('hex').slice(0, 12);

describe('actualización mayor de inventario', () => {
  it('conserva los invariantes verificados de la fuente privada', () => {
    expect(majorUpdateMetadata).toMatchObject({
      sourceRecords: 545,
      excludedDefinitively: 115,
      nonRedCandidates: 430,
      legacyRowsRepresented: 84,
      publicGroupsAdded: 263,
      publicVariantsAdded: 274,
      publicCardsFinal: 345,
      pendingReview: 72,
      pricesPublished: 341,
      priceEntriesPublished: 350,
      pricesPending: 4,
    });
    expect(84 + 274 + 72).toBe(430);
  });

  it('publica 345 fichas con IDs y rutas estables sin duplicados', () => {
    const products = getPublishedProducts();
    expect(products).toHaveLength(345);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
  });

  it('no incluye ninguno de los nombres rojos normalizados', () => {
    const excluded = new Set(excludedProductHashes);
    const publicNames = getPublishedProducts().flatMap((product) => [
      product.name,
      ...(product.variants ?? []).map((variant) => variant.name),
    ]);
    expect(excludedProductHashes).toHaveLength(113);
    expect(publicNames.filter((name) => excluded.has(hashName(name)))).toEqual([]);
  });

  it('no lleva campos privados ni precios internos al catálogo público', () => {
    const serialized = JSON.stringify({ publicInventory, publicPricing });
    expect(serialized).not.toMatch(/precio1_interno|fila_excel|color_original|nota_original|rawHighlight/i);
    expect(publicInventory.products.every((product) => product.price === null && product.pricePublishedUsd === null)).toBe(true);
    expect(publicPricing.metadata).toMatchObject({
      productsWithPublishedPrices: 341,
      publishedPriceEntries: 350,
      productsPendingPrice: 4,
    });
    expect(publicPricing.prices.every((entry) => Number.isInteger(entry.amountCents) && entry.amountCents > 0)).toBe(true);
  });

  it('mantiene seis familias principales y agrupa cuatro complementarias', () => {
    const categories = getCatalogCategories();
    expect(categories.filter((category) => !category.isComplementary)).toHaveLength(6);
    expect(categories.filter((category) => category.isComplementary)).toHaveLength(4);
    expect(categories.find((category) => category.id === 'harinas')?.isComingSoon).toBe(false);
    expect(getPublishedProducts().filter((product) => product.categoryId === 'harinas')).toHaveLength(20);
  });

  it('publica solo la modalidad segura de venta y la conserva por variante', () => {
    const allowed = new Set(['bulk', 'fixed_product', 'unit', 'jar', 'restricted', 'unknown']);
    const allProducts = getPublishedProducts();
    expect(allProducts.every((product) => allowed.has(product.saleMode ?? 'unknown'))).toBe(true);
    expect(allProducts.flatMap((product) => product.variants ?? []).every((variant) => allowed.has(variant.saleMode))).toBe(true);
    expect(allProducts.flatMap((product) => product.variants ?? []).filter((variant) => variant.saleMode === 'restricted')).toHaveLength(3);
    expect(JSON.stringify(publicInventory)).not.toMatch(/precio_aprobado_para_web|modalidad_venta_sugerida|medida_original/i);
  });

  it('busca sin tildes también en los productos integrados', () => {
    const products = getPublishedProducts();
    expect(searchProducts(products, 'aceite de coco').some((product) => product.name === 'Aceite de Coco de Lu')).toBe(true);
    expect(searchProducts(products, 'te verde').some((product) => normalizeSearch(product.name).includes('te verde'))).toBe(true);
  });

  it('mantiene referencias editoriales limitadas a fichas públicas', () => {
    const ids = new Set(getPublishedProducts().map((product) => product.id));
    const references = [
      ...editorialCollections.flatMap((collection) => collection.productIds),
      ...standItems.flatMap((item) => item.productIds),
      ...preparationIdeas.flatMap((idea) => idea.productIds),
      ...Object.entries(relatedProductIds).flatMap(([source, targets]) => [source, ...targets]),
    ];
    expect(references.every((id) => ids.has(id))).toBe(true);
  });
});
