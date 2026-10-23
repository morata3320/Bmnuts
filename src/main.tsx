import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Leaf,
  Menu,
  Search,
  Star,
  X,
  ZoomIn,
} from 'lucide-react';
import './style.css';
import {
  data,
  filterCatalogProducts,
  formatPriceCents,
  getCatalogCategories,
  getCategorySubcategories,
  getPublishedProducts,
  normalizeSearch,
  pickNextTagline,
  searchProducts,
  type Product,
} from './catalog';
import { contactConfig, mapsSearchUrl, type SocialChannel } from './contactConfig';
import { productFacts } from './productFacts';
import { productEducation } from './productEducation';
import {
  CombinationDetail,
  FeaturedStandCarousel,
  getCollectionProducts,
  RelatedProducts,
  ThemedCollections,
} from './components/editorial';
import { ProductPresentations } from './components/ProductPresentations';
import { getProductImagePresentation } from './data/productImagePresentation';

const categories = getCatalogCategories();
const products = getPublishedProducts();

type Favorites = ReturnType<typeof useFavorites>;

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bm-favs') || '[]') as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('bm-favs', JSON.stringify(favorites)), [favorites]);

  return {
    favorites,
    toggle: (id: string) =>
      setFavorites((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      ),
  };
}

function SocialIcon({ id }: { id: SocialChannel['id'] }) {
  if (id === 'whatsapp') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35M12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.45 9.45 0 1 1 8.03 4.43m8.04-17.48A11.29 11.29 0 0 0 12.05.7C5.8.7.71 5.78.71 12.04c0 2 .52 3.95 1.51 5.67L.61 23.59l6.02-1.58a11.34 11.34 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.31-8.03" /></svg>;
  }
  if (id === 'facebook') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.63 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.3.27 16.95.07 15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84m0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88" /></svg>;
}

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`bmnuts-social-list${compact ? ' bmnuts-social-list--compact' : ''}`} aria-label="Redes sociales de BM Nuts">
      {contactConfig.socials.map((channel) => {
        const content = <><span className="filled" /><SocialIcon id={channel.id} /></>;
        const style = { '--social-fill': channel.fill } as React.CSSProperties;
        return (
          <li className="bmnuts-social-item" key={channel.id}>
            <span className="bmnuts-social-tooltip" role="tooltip">{channel.tooltip}</span>
            {channel.url ? (
              <a className="bmnuts-social-link" href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`${channel.label}: enlace pendiente de confirmación`} style={style}>{content}</a>
            ) : (
              <button className="bmnuts-social-link" type="button" disabled aria-label={channel.tooltip} style={style}>{content}</button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function DownloadButton() {
  return (
    <a className="download-button" href="/downloads/frutos-secos-bmnuts.pdf" download>
      <span className="download-button__icon" aria-hidden="true">
        <Download />
      </span>
      <span>Descargar catálogo PDF</span>
    </a>
  );
}

export function FavoriteButton({ product, state }: { product: Product; state: Favorites }) {
  const selected = state.favorites.includes(product.id);
  return (
    <button
      className={`favorite-button${selected ? ' is-selected' : ''}`}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        state.toggle(product.id);
      }}
      aria-pressed={selected}
      aria-label={selected ? `Quitar ${product.name} de favoritos` : `Añadir ${product.name} a favoritos`}
      title={selected ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <Heart className="favorite-button__outline" aria-hidden="true" />
      <Heart className="favorite-button__fill" fill="currentColor" aria-hidden="true" />
      <span className="favorite-particle particle-1" />
      <span className="favorite-particle particle-2" />
      <span className="favorite-particle particle-3" />
      <span className="favorite-particle particle-4" />
    </button>
  );
}

export function HamsterLoader() {
  return (
    <div className="wheel-and-hamster" role="status" aria-label="Cargando fotografía">
      <div className="wheel" />
      <div className="hamster">
        <div className="hamster__body">
          <div className="hamster__head">
            <div className="hamster__ear" />
            <div className="hamster__eye" />
            <div className="hamster__nose" />
          </div>
          <div className="hamster__limb hamster__limb--fr" />
          <div className="hamster__limb hamster__limb--fl" />
          <div className="hamster__limb hamster__limb--br" />
          <div className="hamster__limb hamster__limb--bl" />
          <div className="hamster__tail" />
        </div>
      </div>
      <div className="spoke" />
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="photo-placeholder">
      <Leaf aria-hidden="true" />
      <span>Fotografía próximamente</span>
    </div>
  );
}

export function ProductMedia({ product }: { product: Product }) {
  const [flipped, setFlipped] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const image = product.images[0];
  const hasImage = Boolean(image && !failed);
  const presentation = getProductImagePresentation(product.slug);

  return (
    <button
      className="product-media"
      type="button"
      data-flipped={flipped}
      onClick={() => setFlipped((current) => !current)}
      onMouseLeave={() => setFlipped(false)}
      aria-label={flipped ? `Volver a la fotografía de ${product.name}` : `Ver descripción de ${product.name}`}
      aria-pressed={flipped}
    >
      <div className="product-flip">
        <div className="product-face product-face--front">
          {hasImage ? (
            <>
              {!loaded && <HamsterLoader />}
              <img
                src={image}
                alt={product.imageAlt || `Fotografía de ${product.name}`}
                style={{
                  objectPosition: presentation.objectPosition,
                  padding: presentation.framePadding,
                  transform: `scale(${presentation.scale})`,
                }}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
              />
            </>
          ) : (
            <PhotoPlaceholder />
          )}
        </div>
        <div className="product-face product-face--back">
          <span className="product-back-label">Conoce el producto</span>
          <h4>{product.name}</h4>
          <p>{product.shortDescription}</p>
        </div>
      </div>
    </button>
  );
}

export function ProductCard({
  product,
  favorites,
}: {
  product: Product;
  favorites: Favorites;
}) {
  const variantPrices = (product.variants ?? [])
    .map((variant) => variant.approvedPriceCents)
    .filter((price): price is number => typeof price === 'number');
  const prices = product.approvedPriceCents === null || product.approvedPriceCents === undefined
    ? variantPrices
    : [product.approvedPriceCents];
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  const isSingleBulk = product.saleMode === 'bulk' && product.approvedPriceCents !== null && product.approvedPriceCents !== undefined;
  const isRestricted = product.saleMode === 'restricted' && product.approvedPriceCents !== null && product.approvedPriceCents !== undefined;
  const restrictedStartingPrice = isRestricted && lowestPrice !== null && lowestPrice / 2 >= 100
    ? Math.round(lowestPrice / 2)
    : lowestPrice;
  return (
    <article className="product-card">
      <div className="product-card__media-shell">
        <ProductMedia product={product} />
        <FavoriteButton product={product} state={favorites} />
      </div>
      <div className="product-card__content">
        <small>{product.subcategory}</small>
        <h3>{product.name}</h3>
        <p className="product-summary">{product.shortDescription}</p>
        {product.variants && product.variants.length > 1 && (
          <small className="product-variant-count">{product.variants.length} presentaciones</small>
        )}
        <div className="product-actions">
          <div className="product-card-price">
            {lowestPrice === null ? (
              <strong>Precio por confirmar</strong>
            ) : isSingleBulk ? (
              <><strong>{formatPriceCents(lowestPrice)} / libra</strong><small>Venta a granel desde $1</small></>
            ) : isRestricted ? (
              <><strong>Desde {formatPriceCents(restrictedStartingPrice ?? lowestPrice)}</strong><small>Precio por libra: {formatPriceCents(lowestPrice)}</small></>
            ) : (
              <><strong>{prices.length > 1 ? `Desde ${formatPriceCents(lowestPrice)}` : formatPriceCents(lowestPrice)}</strong><small>{prices.length > 1 ? 'Precios según presentación' : product.pricePresentationLabel || product.unit || 'Presentación fija'}</small></>
            )}
          </div>
          <Link className="more-link" to={`/producto/${product.slug}`}>
            Ver más <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  items,
  favorites,
}: {
  items: Product[];
  favorites: Favorites;
}) {
  if (items.length === 0) {
    return <p className="empty-state">No encontramos productos con esos criterios.</p>;
  }
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} favorites={favorites} />
      ))}
    </div>
  );
}

export function ContactModal({
  open,
  close,
  product,
}: {
  open: boolean;
  close: () => void;
  product?: string;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={close}>
      <section
        className="contact-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <button ref={closeButton} className="modal-close" type="button" onClick={close} aria-label="Cerrar">
          <X />
        </button>
        <span className="eyebrow">Canales de contacto</span>
        <h2 id="contact-title">{product ? `Consulta sobre ${product}` : 'Contáctanos'}</h2>
        <p>Estos son los canales compartidos por BM Nuts. Los que aún no tienen un vínculo confirmado se muestran deshabilitados.</p>
        <SocialLinks />
        <Link className="contact-locations-link" to="/contacto" onClick={close}>Ver direcciones de matriz y sucursal</Link>
      </section>
    </div>
  );
}

export function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => searchProducts(products, query).slice(0, 6), [query]);
  const [tagline] = useState(() => {
    const previous = sessionStorage.getItem('bm-last-tagline');
    const next = pickNextTagline(data.brand.taglines, previous);
    sessionStorage.setItem('bm-last-tagline', next);
    return next;
  });

  const submitSearch = () => {
    const value = query.trim();
    navigate(value ? `/catalogo?q=${encodeURIComponent(value)}` : '/catalogo');
    setSearchOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-brand-row">
        <Link className="brand-mark" to="/" aria-label="BM Nuts - Inicio">
          <img src={data.brand.logo} alt="Logo de BM Nuts" />
        </Link>
        <div className="brand-copy">
          <Link to="/">BM Nuts</Link>
          <p>{tagline}</p>
        </div>
        <div className="header-socials"><SocialLinks compact /></div>
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <div className="header-nav-row">
        <nav className={menuOpen ? 'is-open' : ''} aria-label="Navegación principal">
          {[
            ['/', 'Inicio'],
            ['/catalogo', 'Catálogo'],
            ['/nosotros', 'Quiénes somos'],
            ['/contacto', 'Contacto'],
          ].map(([href, label]) => (
            <NavLink key={href} to={href} onClick={() => setMenuOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <form
          className={`site-search${searchOpen || query ? ' is-open' : ''}`}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <Search className="search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setQuery('');
                setSearchOpen(false);
                inputRef.current?.blur();
              }
            }}
            aria-label="Buscar productos"
            placeholder="Buscar productos"
          />
          {query && (
            <button className="search-clear" type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
              <X />
            </button>
          )}
          {searchOpen && query && (
            <div className="search-results" aria-live="polite">
              {results.length ? (
                results.map((product) => (
                  <Link key={product.id} to={`/producto/${product.slug}`} onClick={() => setSearchOpen(false)}>
                    <span>{product.name}</span>
                    <small>{product.subcategory}</small>
                  </Link>
                ))
              ) : (
                <p>No encontramos productos para “{query}”.</p>
              )}
              <button type="submit">Ver resultados en el catálogo</button>
            </div>
          )}
        </form>
      </div>
    </header>
  );
}

const GRADUAL_BLUR_LAYERS = [2, 5, 9, 14, 20];

export const getCarouselEdgeState = (scrollLeft: number, scrollWidth: number, clientWidth: number, tolerance = 4) => {
  const maxScroll = Math.max(0, scrollWidth - clientWidth);
  if (maxScroll <= tolerance) return { left: false, right: false };
  return {
    left: scrollLeft > tolerance,
    right: maxScroll - scrollLeft > tolerance,
  };
};

function GradualBlur({ side, visible }: { side: 'left' | 'right'; visible: boolean }) {
  return (
    <div className={`gradual-blur gradual-blur--${side}${visible ? ' is-visible' : ''}`} aria-hidden="true">
      {GRADUAL_BLUR_LAYERS.map((radius) => (
        <span
          key={radius}
          style={{ backdropFilter: `blur(${radius}px)`, WebkitBackdropFilter: `blur(${radius}px)` }}
        />
      ))}
    </div>
  );
}

function FeaturedProductsCarousel({ favorites, onContact }: { favorites: Favorites; onContact: (product?: string) => void }) {
  void onContact;
  const track = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const featured = products.filter((product) => product.featured).slice(0, 6);

  const updateEdges = () => {
    const element = track.current;
    if (!element) return;
    const next = getCarouselEdgeState(element.scrollLeft, element.scrollWidth, element.clientWidth);
    setEdges((current) => current.left === next.left && current.right === next.right ? current : next);
  };

  const scheduleEdgeUpdate = () => {
    if (animationFrame.current !== null) return;
    animationFrame.current = window.requestAnimationFrame(() => {
      animationFrame.current = null;
      updateEdges();
    });
  };

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    updateEdges();
    const observer = new ResizeObserver(scheduleEdgeUpdate);
    observer.observe(element);
    element.addEventListener('scroll', scheduleEdgeUpdate, { passive: true });
    window.addEventListener('resize', scheduleEdgeUpdate, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', scheduleEdgeUpdate);
      window.removeEventListener('resize', scheduleEdgeUpdate);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  const scroll = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.82, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="featured-carousel">
      <div className="featured-carousel__controls" aria-label="Controles de selección editorial">
        <button type="button" onClick={() => scroll(-1)} disabled={!edges.left} aria-label="Ver productos anteriores"><ChevronLeft /></button>
        <button type="button" onClick={() => scroll(1)} disabled={!edges.right} aria-label="Ver productos siguientes"><ChevronRight /></button>
      </div>
      <div className="featured-carousel__shell">
        <div className="featured-carousel__track" ref={track} tabIndex={0} aria-label="Selección editorial de productos">
          {featured.map((product) => <ProductCard key={product.id} product={product} favorites={favorites} />)}
        </div>
        <GradualBlur side="left" visible={edges.left} />
        <GradualBlur side="right" visible={edges.right} />
      </div>
    </div>
  );
}

function Home({ favorites, onContact }: { favorites: Favorites; onContact: (product?: string) => void }) {
  const heroProducts = products.filter((product) => product.images[0]).slice(0, 3);
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Catálogo informativo</span>
          <h1>Sabores naturales para cada momento</h1>
          <p>Frutos secos, frutas deshidratadas, especias, semillas y más.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/catalogo">Explorar catálogo</Link>
            <DownloadButton />
          </div>
        </div>
        <div className="hero-gallery" aria-label="Selección de productos BM Nuts">
          {heroProducts.map((product) => (
            <figure key={product.id}>
              <img src={product.images[0]} alt={product.imageAlt || product.name} />
              <figcaption>{product.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <ThemedCollections />

      <FeaturedStandCarousel onContact={onContact} />

      <section className="featured-section">
        <div className="section-shell">
          <span className="eyebrow eyebrow--light">Una selección para empezar</span>
          <h2>Selección editorial</h2>
          <FeaturedProductsCarousel favorites={favorites} onContact={onContact} />
        </div>
      </section>
    </main>
  );
}

export function CatalogPage({ favorites, onContact }: { favorites: Favorites; onContact: (product?: string) => void }) {
  void onContact;
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const selectedCollection = getCollectionProducts(searchParams.get('coleccion'));
  const currentCategory = categories.find((category) => category.id === categoria);
  const selectedSubcategory = currentCategory ? searchParams.get('subcategoria') : null;
  const categorySubcategories = currentCategory ? getCategorySubcategories(products, currentCategory.id) : [];
  const subcategories = currentCategory && categorySubcategories.length === 1 && normalizeSearch(categorySubcategories[0]) === normalizeSearch(currentCategory.name)
    ? []
    : categorySubcategories;

  useEffect(() => setQuery(searchParams.get('q') || ''), [searchParams]);

  const visibleProducts = useMemo(
    () =>
      filterCatalogProducts(products, {
        query,
        categoryId: currentCategory?.id,
        subcategory: selectedSubcategory,
        onlyFavorites,
        favoriteIds: favorites.favorites,
        collectionIds: selectedCollection?.ids,
      }),
    [query, currentCategory?.id, selectedSubcategory, onlyFavorites, favorites.favorites, selectedCollection],
  );

  const selectCategory = (categoryId: string | null) => {
    const next = new URLSearchParams(searchParams);
    next.delete('subcategoria');
    const nextCategoryId = categoryId && currentCategory?.id === categoryId ? null : categoryId;
    navigate({ pathname: nextCategoryId ? `/catalogo/${nextCategoryId}` : '/catalogo', search: next.toString() });
  };

  const selectSubcategory = (subcategory: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (subcategory && selectedSubcategory !== subcategory) next.set('subcategoria', subcategory);
    else next.delete('subcategoria');
    setSearchParams(next);
  };

  const hasActiveFilters = Boolean(currentCategory || selectedSubcategory || selectedCollection || query || onlyFavorites);

  return (
    <main className="catalog-page section-shell">
      <span className="eyebrow">Catálogo BM Nuts</span>
      <h1>{selectedCollection?.collection.titulo || currentCategory?.name || 'Todos los productos'}</h1>
      <p className="page-intro">Explora el catálogo informativo y conoce cada producto antes de contactarnos.</p>
      <section className="catalog-filters" aria-label="Filtros del catálogo">
        <span className="catalog-filters__label">Familias principales</span>
        <div className="filter-chip-row">
          <button type="button" className={!currentCategory ? 'is-active' : ''} aria-pressed={!currentCategory} onClick={() => selectCategory(null)}>Todos</button>
          {categories.filter((category) => !category.isComplementary).map((category) => (
            <button
              key={category.id}
              type="button"
              disabled={category.isComingSoon}
              className={currentCategory?.id === category.id ? 'is-active' : ''}
              aria-pressed={currentCategory?.id === category.id}
              title={category.isComingSoon ? 'Sin productos disponibles todavía' : undefined}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}{category.isComingSoon && <small>Próximamente</small>}
            </button>
          ))}
        </div>
        <span className="catalog-filters__label">Más productos</span>
        <div className="filter-chip-row filter-chip-row--secondary">
          {categories.filter((category) => category.isComplementary).map((category) => (
            <button
              key={category.id}
              type="button"
              className={currentCategory?.id === category.id ? 'is-active' : ''}
              aria-pressed={currentCategory?.id === category.id}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {currentCategory && subcategories.length > 0 && (
          <>
            <span className="catalog-filters__label">Subcategorías de {currentCategory.name}</span>
            <div className="filter-chip-row filter-chip-row--secondary">
              <button type="button" className={!selectedSubcategory ? 'is-active' : ''} aria-pressed={!selectedSubcategory} onClick={() => selectSubcategory(null)}>Todos</button>
              {subcategories.map((subcategory) => (
                <button key={subcategory} type="button" className={selectedSubcategory === subcategory ? 'is-active' : ''} aria-pressed={selectedSubcategory === subcategory} onClick={() => selectSubcategory(subcategory)}>{subcategory}</button>
              ))}
            </div>
          </>
        )}
      </section>
      {selectedCollection && (
        <button
          className="collection-filter-chip"
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('coleccion');
            setSearchParams(next);
          }}
          aria-label={`Quitar colección ${selectedCollection.collection.titulo}`}
          aria-pressed="true"
        >
          {selectedCollection.collection.titulo} <X aria-hidden="true" />
        </button>
      )}
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar en el catálogo</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en el catálogo" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X /></button>}
        </label>
        <label className="favorite-filter">
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(event) => setOnlyFavorites(event.target.checked)}
          />
          <Heart aria-hidden="true" /> Solo favoritos
        </label>
        <span className="result-count" aria-live="polite">{visibleProducts.length} resultados</span>
        {hasActiveFilters && (
          <button className="clear-filters" type="button" onClick={() => {
            setQuery('');
            setOnlyFavorites(false);
            navigate('/catalogo');
          }}>Limpiar filtros</button>
        )}
      </div>
      <ProductGrid items={visibleProducts} favorites={favorites} />
    </main>
  );
}

function Rating({ slug }: { slug: string }) {
  const storageKey = `bm-rate-${slug}`;
  const [value, setValue] = useState(() => Number(localStorage.getItem(storageKey) || 0));
  return (
    <div className="product-rating">
      <h3>Tu interés en este producto</h3>
      <p>Esta puntuación es privada y se guarda solo en este dispositivo.</p>
      <div role="radiogroup" aria-label="Tu interés en este producto">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            role="radio"
            aria-checked={value === number}
            aria-label={`${number} de 5`}
            onClick={() => {
              const next = value === number ? 0 : number;
              setValue(next);
              localStorage.setItem(storageKey, String(next));
            }}
          >
            <Star fill={number <= value ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductPage({ favorites, onContact }: { favorites: Favorites; onContact: (product?: string) => void }) {
  const { slug = '' } = useParams();
  const product = products.find((item) => item.slug === slug);
  const [zoomed, setZoomed] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const fact = product ? productFacts[product.id] : undefined;
  const education = product ? productEducation[product.id] : undefined;
  const imagePresentation = product ? getProductImagePresentation(product.slug) : null;

  if (!product) return <main className="section-shell not-found"><h1>Producto no encontrado</h1></main>;

  return (
    <main className="product-page section-shell">
      <div className="product-detail-visual">
        <div className="product-detail-media">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.imageAlt || product.name}
              style={{
                objectPosition: imagePresentation?.objectPosition,
                padding: imagePresentation?.framePadding,
                transform: `scale(${imagePresentation?.scale ?? 1})`,
              }}
            />
          ) : (
            <PhotoPlaceholder />
          )}
          {product.images[0] && (
            <button type="button" onClick={() => setZoomed(true)}><ZoomIn /> Ampliar</button>
          )}
        </div>
        <ProductPresentations product={product} />
      </div>
      <article className="product-detail-copy">
        <span className="eyebrow">{product.subcategory}</span>
        <h1>{product.name}</h1>
        <p className="detail-description">{product.shortDescription}</p>
        {product.longDescription && <p>{product.longDescription}</p>}
        {product.variants && product.variants.length > 1 && (
          <section className="product-variants" aria-labelledby={`variants-${product.id}`}>
            <h2 id={`variants-${product.id}`}>Presentaciones de esta familia</h2>
            <ul>
              {product.variants.map((variant) => (
                <li key={variant.id}>
                  <span>{variant.name}</span>
                  {variant.presentation && <small>{variant.presentation}</small>}
                </li>
              ))}
            </ul>
            <p>Consulta la presentación vigente en el local. Este catálogo no confirma stock en tiempo real.</p>
          </section>
        )}
        {education?.propiedades.length ? (
          <section className="nutrition-block" aria-labelledby={`nutrition-${product.id}`}>
            <h2 id={`nutrition-${product.id}`}>Propiedades nutricionales</h2>
            <ul>{education.propiedades.map((property) => <li key={property}>{property}</li>)}</ul>
          </section>
        ) : null}
        {education?.beneficiosDeNutrientes.length ? (
          <section className="nutrition-block nutrition-block--benefits" aria-labelledby={`benefits-${product.id}`}>
            <h2 id={`benefits-${product.id}`}>Beneficios de sus nutrientes</h2>
            <ul>{education.beneficiosDeNutrientes.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
            {education.advertencias?.map((warning) => <p className="nutrition-warning" key={warning}>{warning}</p>)}
            <details className="nutrition-sources">
              <summary>Fuentes de información</summary>
              <ul>{education.fuentes.map((source, index) => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">Fuente {index + 1}</a></li>)}</ul>
            </details>
          </section>
        ) : null}
        {fact && (
          <aside className="product-fact">
            <span aria-hidden="true">?</span>
            <div><h2>¿Sabías que?</h2><p>{fact}</p></div>
          </aside>
        )}
        <div className="detail-actions">
          <FavoriteButton product={product} state={favorites} />
          <button className="contact-open-button" type="button" onClick={() => onContact(product.name)}>Contáctanos</button>
        </div>
        {product.traditionalUses.length > 0 && (
          <div className="ideas-panel">
            <button type="button" className={showIdeas ? 'is-on' : ''} onClick={() => setShowIdeas((current) => !current)}>
              <Bell aria-hidden="true" /> {showIdeas ? 'Ocultar ideas de uso' : 'Ver ideas de uso'}
            </button>
            {showIdeas && <ul>{product.traditionalUses.map((idea) => <li key={idea}>{idea}</li>)}</ul>}
          </div>
        )}
        <RelatedProducts productId={product.id} />
        <Rating slug={slug} />
      </article>
      {zoomed && product.images[0] && (
        <div className="modal-overlay image-zoom" onClick={() => setZoomed(false)}>
          <button type="button" onClick={() => setZoomed(false)} aria-label="Cerrar imagen"><X /></button>
          <img src={product.images[0]} alt={product.imageAlt || product.name} />
        </div>
      )}
    </main>
  );
}

function AboutPage() {
  return (
    <main className="about-page section-shell">
      <div className="about-copy">
        <span className="eyebrow">Quiénes somos</span>
        <h1>BM Nuts</h1>
        <p>En BM Nuts nos gusta atender de cerca. Reunimos frutos secos, frutas deshidratadas, especias, semillas, cereales y hierbas para acompañarte en tus recetas y en tu día a día. Queremos que encuentres lo que buscas, conozcas nuestros productos y recibas una atención amable y clara.</p>
        <p>Visítanos en nuestra matriz al norte de Quito o en la sucursal de Conocoto. Estaremos encantados de ayudarte a descubrir nuevos sabores.</p>
        <strong>Variedad de productos · Atención cercana · Compra a granel</strong>
      </div>
      <figure className="about-photo">
        <img src="/images/local-bmnuts.webp" alt="Fachada y entrada del local BM Nuts" />
      </figure>
    </main>
  );
}

function CombinationPage({ onContact }: { onContact: (product?: string) => void }) {
  const { id = '' } = useParams();
  return <CombinationDetail itemId={id} onContact={onContact} />;
}

export function ContactPage() {
  return (
    <main className="contact-page section-shell">
      <div className="contact-page__intro">
        <span className="eyebrow">Hablemos</span>
        <h1>Contacto</h1>
        <p>Encuentra la sede que te resulte más cercana o consulta los canales sociales disponibles.</p>
        <SocialLinks />
      </div>
      <div className="location-grid">
        {contactConfig.locations.map((location) => (
          <article className="location-card" key={location.id}>
            <span>{location.title}</span>
            <h2>{location.area}</h2>
            <address>{location.address}</address>
            <p>{location.description}</p>
            <a href={mapsSearchUrl(location.address)} target="_blank" rel="noopener noreferrer">Buscar en Google Maps <ArrowRight aria-hidden="true" /></a>
          </article>
        ))}
      </div>
    </main>
  );
}

export function Footer({ reopenNotice }: { reopenNotice: () => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section className="footer-brand">
          <img src={data.brand.logo} alt="Logo de BM Nuts" />
          <div><h2>BM Nuts</h2><p>Productos que te encantan, atención que te hace volver.</p></div>
        </section>
        <section>
          <h3>Navegación</h3>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/nosotros">Quiénes somos</Link>
          <Link to="/contacto">Contacto</Link>
        </section>
        <section>
          <h3>Categorías</h3>
          {categories.map((category) =>
            category.isComingSoon ? <span key={category.id}>{category.name} · Próximamente</span> :
              <Link key={category.id} to={`/catalogo/${category.id}`}>{category.name}</Link>,
          )}
        </section>
        <section className="footer-contact">
          <h3>Contacto y catálogo</h3>
          <Link to="/contacto">WhatsApp, Facebook e Instagram</Link>
          <a className="footer-pdf-link" href="/downloads/frutos-secos-bmnuts.pdf" download>Descargar catálogo PDF</a>
          <button type="button" className="text-button" onClick={reopenNotice}>Preferencias locales</button>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© 2026 BM Nuts</span>
        <span>Información de contacto y precios pendiente de confirmación.</span>
      </div>
    </footer>
  );
}

function LocalNotice({ close }: { close: () => void }) {
  return (
    <aside className="local-notice" role="dialog" aria-label="Preferencias locales">
      <button type="button" className="notice-close" onClick={close} aria-label="Cerrar"><X /></button>
      <Leaf aria-hidden="true" />
      <h3>Preferencias en este dispositivo</h3>
      <p>Los favoritos y tu interés en productos se guardan localmente. No usamos este aviso para afirmar analítica o seguimiento.</p>
      <button type="button" className="primary-button" onClick={close}>Entendido</button>
    </aside>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 350);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      type="button"
      aria-label="Volver arriba"
      title="Volver arriba"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
    >
      <ArrowUp aria-hidden="true" />
      <span>Volver arriba</span>
    </button>
  );
}

function App() {
  const favorites = useFavorites();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [noticeOpen, setNoticeOpen] = useState(() => localStorage.getItem('bm-notice') !== '1');
  const openContact = (product?: string) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };
  const closeNotice = () => {
    localStorage.setItem('bm-notice', '1');
    setNoticeOpen(false);
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home favorites={favorites} onContact={openContact} />} />
        <Route path="/catalogo" element={<CatalogPage favorites={favorites} onContact={openContact} />} />
        <Route path="/catalogo/:categoria" element={<CatalogPage favorites={favorites} onContact={openContact} />} />
        <Route path="/producto/:slug" element={<ProductPage favorites={favorites} onContact={openContact} />} />
        <Route path="/combinacion/:id" element={<CombinationPage onContact={openContact} />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<main className="section-shell not-found"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></main>} />
      </Routes>
      <Footer reopenNotice={() => setNoticeOpen(true)} />
      <BackToTop />
      <ContactModal open={modalOpen} close={() => setModalOpen(false)} product={selectedProduct} />
      {noticeOpen && <LocalNotice close={closeNotice} />}
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
