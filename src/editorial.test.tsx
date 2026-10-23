// @vitest-environment jsdom
import React, { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data } from './catalog';
import { CombinationDetail, FeaturedStandCarousel, ThemedCollections, getStandSlides } from './components/editorial';
import { editorialCollections } from './data/collections';
import { preparationIdeas } from './data/recipes';
import { standItems } from './data/stand';

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

afterEach(() => {
  roots.forEach((root) => act(() => root.unmount()));
  roots = [];
  document.body.innerHTML = '';
});

describe('colecciones y stand editorial', () => {
  it('mantiene intactas las 92 entradas, seis familias e IDs únicos', () => {
    expect(data.products).toHaveLength(92);
    expect(data.categories).toHaveLength(6);
    expect(new Set(data.products.map((product) => product.id)).size).toBe(92);
  });

  it('resuelve todos los IDs de colecciones, stand y preparaciones contra el catálogo', () => {
    const ids = new Set(data.products.map((product) => product.id));
    const referenced = [
      ...editorialCollections.flatMap((collection) => collection.productIds),
      ...standItems.flatMap((item) => item.productIds),
      ...preparationIdeas.flatMap((idea) => idea.productIds),
    ];
    expect(referenced.every((id) => ids.has(id))).toBe(true);
  });

  it('presenta el yogur como novedad sin precio ni categoría falsa', () => {
    const yogurt = standItems.find((item) => item.id === 'yogur-griego')!;
    expect(yogurt.tipo).toBe('novedad');
    expect(yogurt.price).toBeUndefined();
    expect(yogurt.includesEditorialYogurt).toBe(true);
    expect(data.products.some((product) => /yogur/i.test(product.name))).toBe(false);
    expect(data.categories.some((category) => /lácteo|yogur/i.test(category.name))).toBe(false);
  });

  it('muestra las cuatro colecciones y navega al catálogo con un único filtro editorial', () => {
    const container = render(<MemoryRouter><ThemedCollections /></MemoryRouter>);
    expect(container.querySelectorAll('.collection-card')).toHaveLength(4);
    expect(container.querySelectorAll<HTMLImageElement>('.collection-card__editorial-image img')).toHaveLength(4);
    expect([...container.querySelectorAll<HTMLImageElement>('.collection-card__editorial-image img')]
      .every((image) => image.getAttribute('src')?.startsWith('/images/editorial/coleccion-'))).toBe(true);
    const links = [...container.querySelectorAll<HTMLAnchorElement>('.collection-card a')];
    expect(links.every((link) => link.getAttribute('href')?.startsWith('/catalogo?coleccion='))).toBe(true);
  });

  it('limita el flip accesible al mosaico y muestra productos reales', () => {
    const container = render(<MemoryRouter><ThemedCollections /></MemoryRouter>);
    const card = container.querySelector('.collection-card')!;
    const media = card.querySelector('.collection-media')!;
    const copy = card.querySelector('.collection-card__copy')!;
    const button = card.querySelector<HTMLButtonElement>('.collection-media')!;
    expect(card.querySelector('.collection-flip-button')).toBeNull();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    act(() => button.click());
    expect(media.getAttribute('data-flipped')).toBe('true');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(media.textContent).toContain('Avena');
    expect(media.querySelectorAll('.collection-media__face--back small').length).toBeGreaterThanOrEqual(3);
    expect(media.querySelectorAll('.collection-media__face--back small').length).toBeLessThanOrEqual(5);
    expect(copy.textContent).toContain('Para tus desayunos');
    expect(copy.querySelector('a')?.getAttribute('href')).toBe('/catalogo?coleccion=desayunos');
  });

  it('recorre las siete diapositivas por teclado y muestra el afiche original con consulta', () => {
    const container = render(<MemoryRouter><FeaturedStandCarousel onContact={vi.fn()} /></MemoryRouter>);
    const carousel = container.querySelector<HTMLElement>('.stand-section')!;
    expect(container.querySelectorAll('.stand-dots button')).toHaveLength(7);
    expect(container.textContent).toContain('¡Nuevo! Yogur griego en BM Nuts');
    act(() => carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(container.textContent).toContain('Colada morada');
    expect(container.textContent).toContain('Tradición de temporada');
    expect(container.querySelector<HTMLImageElement>('.stand-slide__media img')?.getAttribute('src')).toBe('/images/editorial/stand-colada-morada-original.webp');
    expect(container.querySelector('.stand-actions a')).toBeNull();
    expect(container.querySelector('.stand-actions button')?.textContent).toContain('Consultar en BM Nuts');
    const next = container.querySelector<HTMLButtonElement>('[aria-label="Ver diapositiva siguiente"]')!;
    act(() => next.click());
    expect(container.textContent).toContain('Desayuno cremoso');
    expect(container.textContent).not.toMatch(/comprar|añadir al carrito|checkout/i);
    expect(getStandSlides()).toHaveLength(7);
  });

  it('abre una vista informativa con fichas reales y preparación', () => {
    const container = render(<MemoryRouter><CombinationDetail itemId="pausa-dulce-crujiente" onContact={vi.fn()} /></MemoryRouter>);
    const links = [...container.querySelectorAll<HTMLAnchorElement>('.combination-product')];
    expect(links).toHaveLength(4);
    expect(links.every((link) => link.getAttribute('href')?.startsWith('/producto/'))).toBe(true);
    expect(container.textContent).toContain('Idea de preparación');
    expect(container.textContent).toContain('Los productos se muestran como sugerencia');
  });

  it('referencia el afiche oficial desde la ruta pública del build', () => {
    expect(standItems.find((item) => item.id === 'yogur-griego')?.image).toBe('/images/novedades/yogur-griego-promocion.png');
  });
});
