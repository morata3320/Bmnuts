// @vitest-environment jsdom
import React, { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ProductPresentations } from './components/ProductPresentations';
import { getPublishedProducts, type Product } from './catalog';
import { getCarouselEdgeState, ProductCard, ProductPage, useFavorites } from './main';

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

const productAt = (approvedPriceCents: number, saleMode: Product['saleMode'] = 'bulk'): Product => ({
  id: 'TEST-PRICE',
  slug: 'test-price',
  name: 'Producto de prueba',
  categoryId: 'test',
  subcategory: 'Pruebas',
  shortDescription: 'Producto para comprobar el selector.',
  longDescription: null,
  traditionalUses: [],
  nutritionFacts: [],
  price: null,
  currency: 'USD',
  unit: saleMode === 'bulk' ? 'Libra' : 'Unidad',
  images: [],
  imageAlt: null,
  source: 'test',
  needsVerification: false,
  published: true,
  featured: false,
  tags: [],
  saleMode,
  approvedPriceCents,
  pricingBasis: saleMode === 'bulk' ? 'per_lb' : 'fixed',
  pricePresentationLabel: saleMode === 'bulk' ? 'Libra' : 'Unidad',
});

afterEach(() => {
  roots.forEach((root) => act(() => root.unmount()));
  roots = [];
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('selector real de precios y presentaciones', () => {
  it('actualiza precio y peso al seleccionar otra presentación', () => {
    const container = render(<ProductPresentations product={productAt(400)} />);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Desde $1', '¼ libra', '½ libra', '1 libra']);
    expect(buttons[3].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('output')?.textContent).toContain('4,00');
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: 1 libra');

    act(() => buttons[2].click());

    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('output')?.textContent).toContain('2,00');
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: ½ libra');
  });

  it('mantiene visibles pero deshabilitadas las fracciones inferiores al mínimo', () => {
    const container = render(<ProductPresentations product={productAt(150)} />);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Desde $1', '¼ libra', '½ libra', '1 libra']);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2].disabled).toBe(true);
    expect(buttons[3].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('output')?.textContent).toContain('1,50');
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: 1 libra');
  });

  it('selecciona 1 libra para ajonjolí y conserva únicamente sus dos opciones', () => {
    const container = render(<ProductPresentations product={productAt(450, 'restricted')} />);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['½ libra', '1 libra']);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('output')?.textContent).toContain('4,50');
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: 1 libra');
  });

  it('restablece 1 libra al abrir otro producto', () => {
    function Harness() {
      const [product, setProduct] = useState(productAt(400));
      return (
        <>
          <button className="swap-product" type="button" onClick={() => setProduct({ ...productAt(650), id: 'TEST-OTHER' })}>Cambiar</button>
          <ProductPresentations product={product} />
        </>
      );
    }
    const container = render(<Harness />);
    let options = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    act(() => options[0].click());
    expect(options[0].getAttribute('aria-pressed')).toBe('true');

    act(() => container.querySelector<HTMLButtonElement>('.swap-product')!.click());

    options = [...container.querySelectorAll<HTMLButtonElement>('.product-presentations__options button')];
    expect(options[3].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('output')?.textContent).toContain('6,50');
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: 1 libra');
  });

  it('formatea el peso variable con coma y un máximo de tres decimales', () => {
    const container = render(<ProductPresentations product={productAt(650)} />);
    const fromDollar = container.querySelector<HTMLButtonElement>('.product-presentations__options button')!;
    act(() => fromDollar.click());
    expect(container.querySelector('output')?.textContent).toContain('Peso aproximado: 0,154 libra');
  });

  it('muestra el precio por libra como jerarquía principal de la tarjeta', () => {
    function Harness() {
      const favorites = useFavorites();
      return <ProductCard product={productAt(650)} favorites={favorites} />;
    }
    const container = render(<MemoryRouter><Harness /></MemoryRouter>);
    expect(container.querySelector('.product-card-price strong')?.textContent).toBe('$6,50 / libra');
    expect(container.querySelector('.product-card-price small')?.textContent).toBe('Venta a granel desde $1');
  });

  it('mantiene unidades como presentación fija, sin selector fraccionable', () => {
    const container = render(<ProductPresentations product={productAt(375, 'unit')} />);
    expect(container.querySelector('.product-presentations__options')).toBeNull();
    expect(container.querySelector('output')?.textContent).toContain('3,75');
  });

  it('ubica el selector inmediatamente debajo de la imagen en la columna izquierda', () => {
    const product = getPublishedProducts().find((item) => item.saleMode === 'bulk' && item.images.length > 0)!;
    function Harness() {
      const favorites = useFavorites();
      return <ProductPage favorites={favorites} onContact={() => undefined} />;
    }
    const container = render(
      <MemoryRouter initialEntries={[`/producto/${product.slug}`]}>
        <Harness />
      </MemoryRouter>,
    );
    const visual = container.querySelector('.product-detail-visual');
    const media = visual?.querySelector('.product-detail-media');
    const selector = visual?.querySelector('[data-testid="presentation-selector"]');
    expect(selector).not.toBeNull();
    expect(media?.nextElementSibling).toBe(selector);
  });
});

describe('estado de bordes del carrusel', () => {
  it('activa solo el borde correspondiente al inicio, medio y final', () => {
    expect(getCarouselEdgeState(0, 1800, 900)).toEqual({ left: false, right: true });
    expect(getCarouselEdgeState(450, 1800, 900)).toEqual({ left: true, right: true });
    expect(getCarouselEdgeState(900, 1800, 900)).toEqual({ left: true, right: false });
  });

  it('no muestra blur cuando el contenido no desborda', () => {
    expect(getCarouselEdgeState(0, 900, 900)).toEqual({ left: false, right: false });
  });
});
