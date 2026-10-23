// @vitest-environment jsdom
import React, { act, type ReactNode } from 'react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CatalogPage, ProductMedia, ProductPage, useFavorites } from './main';
import { getPublishedProducts } from './catalog';
import { ProductPresentations } from './components/ProductPresentations';
import { getProductImagePresentation, productImageIncidents } from './data/productImagePresentation';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let roots: Root[] = [];

function render(node: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(node));
  return container;
}

function CatalogHarness() {
  const favorites = useFavorites();
  return <CatalogPage favorites={favorites} onContact={() => undefined} />;
}

function renderCatalog(entry = '/catalogo') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/catalogo" element={<CatalogHarness />} />
        <Route path="/catalogo/:categoria" element={<CatalogHarness />} />
      </Routes>
    </MemoryRouter>,
  );
}

const buttonWithText = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim() === label)!;

afterEach(() => {
  roots.forEach((root) => act(() => root.unmount()));
  roots = [];
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('correcciones finales de granel, filtros e imágenes', () => {
  it('permite seleccionar modalidades confirmadas sin publicar precios no aprobados', () => {
    const products = getPublishedProducts();
    const bulk = products.find((product) => product.saleMode === 'bulk')!;
    const fixed = products.find((product) => product.saleMode === 'fixed_product')!;
    const restricted = products.find((product) => product.saleMode === 'restricted')!;

    const bulkView = render(<ProductPresentations product={bulk} />);
    expect(bulkView.textContent).toContain('Venta a granel · desde $1');
    expect(bulkView.textContent).toContain('Precio referencial');
    const fromDollar = buttonWithText(bulkView, 'Desde $1');
    expect(fromDollar.getAttribute('aria-pressed')).toBe('false');
    expect(buttonWithText(bulkView, '1 libra').getAttribute('aria-pressed')).toBe('true');
    act(() => fromDollar.click());
    expect(fromDollar.getAttribute('aria-pressed')).toBe('true');
    expect(bulkView.textContent).toContain('Peso aproximado');

    const fixedView = render(<ProductPresentations product={fixed} />);
    expect(fixedView.textContent).toContain('Presentación fija');
    expect(fixedView.textContent).not.toContain('Venta a granel');
    expect(fixedView.querySelector('.product-presentations__options')).toBeNull();
    expect(fixedView.textContent).toContain('Precio referencial');
    expect(fixedView.textContent).not.toContain('¼ libra');

    const restrictedView = render(<ProductPresentations product={restricted} />);
    expect(restrictedView.textContent).toContain('½ y 1 libra');
    expect(restrictedView.textContent).not.toContain('desde $1');
    expect(buttonWithText(restrictedView, '½ libra')).toBeTruthy();
    expect(buttonWithText(restrictedView, '1 libra').getAttribute('aria-pressed')).toBe('true');
    expect(restrictedView.textContent).not.toContain('¼ libra');
    expect(document.body.textContent).toMatch(/\$\s*\d+[.,]\d{2}/);
  });

  it('aplica el mínimo de $1 a un precio expresamente aprobado y mantiene el selector funcional', () => {
    const source = getPublishedProducts().find((product) => product.saleMode === 'bulk')!;
    const approved = { ...source, variants: undefined, approvedPriceCents: 400 };
    const container = render(<ProductPresentations product={approved} />);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    const labels = buttons
      .map((button) => button.textContent?.trim());
    expect(labels).toHaveLength(4);
    expect(labels[0]).toBe('Desde $1');
    expect(labels[1]).toContain('¼ libra');
    expect(labels[2]).toContain('½ libra');
    expect(labels[3]).toContain('1 libra');
    act(() => buttons[2].click());
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.product-presentations__price-value')?.textContent).toBe('$2,00');
    expect(container.textContent).toContain('Peso aproximado: ½ libra');
  });

  it('ubica Presentaciones disponibles debajo de la fotografía principal', () => {
    const product = getPublishedProducts().find((item) => item.saleMode === 'bulk')!;
    function Harness() {
      const favorites = useFavorites();
      return <ProductPage favorites={favorites} onContact={() => undefined} />;
    }
    const container = render(
      <MemoryRouter initialEntries={[`/producto/${product.slug}`]}>
        <Routes><Route path="/producto/:slug" element={<Harness />} /></Routes>
      </MemoryRouter>,
    );
    const visualColumn = container.querySelector('.product-detail-visual')!;
    expect(visualColumn.children[0]).toHaveProperty('className', 'product-detail-media');
    expect(visualColumn.children[1]).toHaveProperty('className', 'product-presentations');
    expect(container.querySelector('.product-detail-copy .product-presentations')).toBeNull();
  });

  it('activa Harinas con sus 20 fichas y permite apagar la categoría pulsándola otra vez', () => {
    const container = renderCatalog();
    act(() => buttonWithText(container, 'Harinas y derivados').click());
    expect(container.querySelector('h1')?.textContent).toBe('Harinas y derivados');
    expect(container.textContent).toContain('20 resultados');
    expect(container.textContent).not.toContain('Subcategorías de Harinas y derivados');
    expect(buttonWithText(container, 'Harinas y derivados').getAttribute('aria-pressed')).toBe('true');

    act(() => buttonWithText(container, 'Harinas y derivados').click());
    expect(container.querySelector('h1')?.textContent).toBe('Todos los productos');
    expect(container.textContent).toContain('345 resultados');
  });

  it('apaga una subcategoría activa y limpia la incompatible al cambiar de familia', () => {
    const container = renderCatalog();
    act(() => buttonWithText(container, 'Frutos secos y snacks').click());
    act(() => buttonWithText(container, 'Almendras').click());
    expect(buttonWithText(container, 'Almendras').getAttribute('aria-pressed')).toBe('true');
    act(() => buttonWithText(container, 'Almendras').click());
    expect(buttonWithText(container, 'Almendras').getAttribute('aria-pressed')).toBe('false');
    act(() => buttonWithText(container, 'Almendras').click());
    act(() => buttonWithText(container, 'Especias y condimentos').click());
    expect(container.textContent).not.toContain('Subcategorías de Frutos secos');
    expect(container.querySelector('h1')?.textContent).toBe('Especias y condimentos');
  });

  it('el chip de colección se deselecciona y conserva el resto del catálogo', () => {
    const container = renderCatalog('/catalogo?coleccion=desayunos');
    const chip = container.querySelector<HTMLButtonElement>('.collection-filter-chip')!;
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    act(() => chip.click());
    expect(container.querySelector('.collection-filter-chip')).toBeNull();
    expect(container.textContent).toContain('345 resultados');
  });

  it('usa metadata por asset y reemplaza la foto incorrecta de dátil por el placeholder', () => {
    expect(getProductImagePresentation('pistacho-con-cascara').scale).toBeGreaterThan(1);
    expect(getProductImagePresentation('nuez-macadamia').scale).toBeLessThan(1);
    expect(productImageIncidents).toEqual([
      expect.objectContaining({ slug: 'datil-sin-pepa' }),
    ]);
    const date = getPublishedProducts().find((product) => product.slug === 'datil-sin-pepa')!;
    expect(date.images).toEqual([]);
    const container = render(<ProductMedia product={date} />);
    expect(container.querySelector('.photo-placeholder')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('incluye los cinco assets editoriales seleccionados sin copiar afiches IA no aprobados', () => {
    const editorialDir = resolve(process.cwd(), 'public', 'images', 'editorial');
    const selected = [
      'coleccion-desayunos.webp',
      'coleccion-proteina-vegetal.webp',
      'coleccion-snacks.webp',
      'coleccion-recetas.webp',
      'stand-colada-morada-original.webp',
    ];
    expect(selected.every((file) => existsSync(resolve(editorialDir, file)))).toBe(true);
    expect(existsSync(resolve(editorialDir, 'stand-promo-desayunos.webp'))).toBe(false);
  });
});
