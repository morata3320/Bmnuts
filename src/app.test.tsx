// @vitest-environment jsdom
import React, { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactModal, ContactPage, FavoriteButton, Footer, ProductMedia, SocialLinks, useFavorites } from './main';
import { getPublishedProducts } from './catalog';

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
  localStorage.clear();
});

describe('componentes reparados', () => {
  it('voltea únicamente el área multimedia y muestra nombre y descripción', () => {
    const product = getPublishedProducts().find((item) => item.name === 'Almendra natural')!;
    const container = render(<ProductMedia product={product} />);
    const media = container.querySelector('.product-media')!;
    const button = container.querySelector<HTMLButtonElement>('[aria-label="Ver descripción"]')!;

    act(() => button.click());

    expect(media.getAttribute('data-flipped')).toBe('true');
    expect(container.querySelector('.product-face--back')?.textContent).toContain('Almendra natural');
    expect(container.querySelector('.product-face--back')?.textContent).toContain(product.shortDescription);
  });

  it('usa un placeholder sobrio para Sen, que no tiene fotografía', () => {
    const product = getPublishedProducts().find((item) => item.name === 'Sen')!;
    const container = render(<ProductMedia product={product} />);
    expect(container.querySelector('.photo-placeholder')?.textContent).toContain('Fotografía próximamente');
    expect(container.querySelector('.product-face--front img')).toBeNull();
  });

  it('persiste favoritos localmente y expone aria-pressed', () => {
    const product = getPublishedProducts()[0];
    function Harness() {
      const state = useFavorites();
      return <FavoriteButton product={product} state={state} />;
    }
    const container = render(<Harness />);
    const button = container.querySelector<HTMLButtonElement>('.favorite-button')!;
    act(() => button.click());
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(JSON.parse(localStorage.getItem('bm-favs') || '[]')).toContain(product.id);
  });

  it('cierra el contacto con Escape', () => {
    const close = vi.fn();
    render(<MemoryRouter><ContactModal open close={close} /></MemoryRouter>);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(close).toHaveBeenCalledOnce();
  });

  it('mantiene enlaces reales en el footer y la descarga del PDF', () => {
    const container = render(
      <MemoryRouter>
        <Footer reopenNotice={() => undefined} />
      </MemoryRouter>,
    );
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a')];
    expect(links.length).toBeGreaterThan(8);
    expect(links.every((link) => Boolean(link.getAttribute('href')))).toBe(true);
    expect(links.some((link) => link.hasAttribute('download') && link.href.endsWith('.pdf'))).toBe(true);
    expect(container.textContent).not.toMatch(/comprar|carrito|checkout/i);
  });

  it('muestra solamente las tres redes solicitadas y no inventa enlaces faltantes', () => {
    const container = render(<SocialLinks />);
    const items = container.querySelectorAll('.bmnuts-social-item');
    const links = container.querySelectorAll<HTMLAnchorElement>('a.bmnuts-social-link');
    const disabled = container.querySelectorAll<HTMLButtonElement>('button.bmnuts-social-link:disabled');
    expect(items).toHaveLength(3);
    expect(links).toHaveLength(1);
    expect(links[0].href).toContain('facebook.com/profile.php?id=100063731943605');
    expect(disabled).toHaveLength(2);
    expect(container.textContent).not.toMatch(/linkedin|github|youtube/i);
  });

  it('presenta matriz y sucursal con búsquedas textuales de Google Maps', () => {
    const container = render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );
    const cards = container.querySelectorAll('.location-card');
    const mapLinks = container.querySelectorAll<HTMLAnchorElement>('.location-card a');
    expect(cards).toHaveLength(2);
    expect(container.textContent).toContain('Matriz');
    expect(container.textContent).toContain('Sucursal');
    expect(mapLinks).toHaveLength(2);
    expect([...mapLinks].every((link) => link.href.startsWith('https://www.google.com/maps/search/'))).toBe(true);
  });
});
