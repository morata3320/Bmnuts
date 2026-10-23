import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Leaf, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedProducts, type Product } from '../catalog';
import { visibleCollections } from '../data/collections';
import { preparationIdeas, relatedProductIds } from '../data/recipes';
import { isStandItemActive, standItems, type StandItem } from '../data/stand';

const products = getPublishedProducts();
const productById = new Map(products.map((product) => [product.id, product]));

function ProductThumb({ product }: { product: Product }) {
  return product.images[0] ? (
    <img src={product.images[0]} alt={product.imageAlt || product.name} loading="lazy" />
  ) : (
    <span className="editorial-placeholder" aria-label={`Fotografía pendiente de ${product.name}`}>
      <Leaf aria-hidden="true" />
    </span>
  );
}

export function CollectionMedia({ title, products, image, imageAlt }: { title: string; products: Product[]; image: string; imageAlt: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      className="collection-media"
      type="button"
      data-flipped={flipped}
      aria-label={flipped ? `Volver a la fotografía de ${title}` : `Ver productos para ${title}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((current) => !current)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className="collection-media__flip">
        <div className="collection-media__face collection-media__face--front collection-card__editorial-image">
          <img src={image} alt={imageAlt} loading="lazy" width="1448" height="1086" />
        </div>
        <div className="collection-media__face collection-media__face--back">
          <span>Puedes combinar</span>
          <div aria-label={`Productos de ${title}`}>
            {products.slice(0, 5).map((product) => <small key={product.id}>{product.name}</small>)}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ThemedCollections() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.85, behavior: 'smooth' });
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); scroll(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); scroll(1); }
  };

  return (
    <section className="collections-section section-shell" aria-labelledby="collections-title">
      <div className="editorial-heading">
        <div>
          <span className="eyebrow">Colecciones temáticas</span>
          <h2 id="collections-title">Descubre BM Nuts a tu manera</h2>
        </div>
      </div>
      <div className="collections-track" ref={track} tabIndex={0} aria-label="Colecciones de productos" onKeyDown={onKeyDown}>
        {visibleCollections.map((collection) => {
          const collectionProducts = collection.productIds.map((id) => productById.get(id)).filter(Boolean) as Product[];
          return (
            <article className="collection-card" key={collection.id}>
              <CollectionMedia
                title={collection.titulo}
                products={collectionProducts}
                image={collection.image}
                imageAlt={collection.imageAlt}
              />
              <div className="collection-card__copy">
                <h3>{collection.titulo}</h3>
                <p>{collection.descripcion}</p>
                {collection.id === 'desayunos' && <small>El yogur griego puede ser un complemento para esta idea.</small>}
                <Link to={`/catalogo?coleccion=${collection.id}`}>Explorar productos <ArrowRight aria-hidden="true" /></Link>
              </div>
            </article>
          );
        })}
      </div>
      <Link className="catalog-complete-link" to="/catalogo">Ver catálogo completo <ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}

export function FeaturedStandCarousel({ onContact }: { onContact: (product?: string) => void }) {
  const slides = standItems.filter((item) => isStandItemActive(item));
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const goTo = (index: number) => setActive((index + slides.length) % slides.length);
  const move = (direction: number) => goTo(active + direction);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  };
  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
    touchStart.current = null;
  };

  if (slides.length === 0) return null;
  const item = slides[active];
  const itemProducts = item.productIds.map((id) => productById.get(id)).filter(Boolean) as Product[];
  const displayImage = item.image || itemProducts.find((product) => product.images[0])?.images[0];
  const hasInformationalRoute = Boolean(item.recipeId || itemProducts.length > 0);
  const standTag = item.id === 'colada-morada'
    ? 'Tradición de temporada'
    : item.tipo === 'novedad'
      ? 'Novedad'
      : item.tipo === 'promocion'
        ? 'Afiche del negocio'
        : 'Combinación sugerida';

  return (
    <section
      className="stand-section"
      aria-labelledby="stand-title"
      aria-roledescription="carrusel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={onTouchEnd}
    >
      <div className="section-shell">
        <div className="editorial-heading stand-heading">
          <div>
            <span className="eyebrow eyebrow--light">Ideas para descubrir</span>
            <h2 id="stand-title">El stand de BM Nuts</h2>
            <p>Novedades, combinaciones e ideas para disfrutar nuestros productos</p>
          </div>
          <div className="carousel-arrows carousel-arrows--light">
            <button type="button" onClick={() => move(-1)} aria-label="Ver diapositiva anterior"><ChevronLeft /></button>
            <button type="button" onClick={() => move(1)} aria-label="Ver diapositiva siguiente"><ChevronRight /></button>
          </div>
        </div>
        <article className={`stand-slide stand-slide--${item.tipo}`} aria-live="polite" aria-label={`${active + 1} de ${slides.length}: ${item.titulo}`}>
          <div className="stand-slide__media">
            {displayImage ? (
              <img
                src={displayImage}
                alt={item.imageAlt || (item.image ? `Afiche de ${item.titulo} en BM Nuts` : `Producto destacado en ${item.titulo}`)}
                loading={active === 0 ? 'eager' : 'lazy'}
              />
            ) : <span className="editorial-placeholder"><Leaf aria-hidden="true" /></span>}
          </div>
          <div className="stand-slide__copy">
            <span className="stand-tag"><Sparkles aria-hidden="true" />{standTag}</span>
            <h3>{item.titulo}</h3>
            <p>{item.descripcion}</p>
            {item.includesEditorialYogurt && item.id !== 'yogur-griego' && <p className="stand-yogurt-note">Incluye yogur griego como referencia editorial, no como parte de un paquete.</p>}
            {item.note && <small>{item.note}</small>}
            <div className="stand-product-list" aria-label="Productos relacionados">
              {itemProducts.map((product) => <span key={product.id}>{product.name}</span>)}
            </div>
            <div className="stand-actions">
              {hasInformationalRoute && <Link className="primary-button" to={`/combinacion/${item.id}`}>
                {item.tipo === 'novedad' ? 'Descubre cómo combinarlo' : 'Conocer combinación'}
              </Link>}
              {item.id === 'yogur-griego' && <button className="stand-contact" type="button" onClick={() => onContact('Yogur griego')}>Consultar en BM Nuts</button>}
              {item.id === 'colada-morada' && <button className="stand-contact" type="button" onClick={() => onContact('Colada morada')}>Consultar en BM Nuts</button>}
            </div>
          </div>
        </article>
        <div className="stand-dots" aria-label="Elegir diapositiva">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? 'is-active' : ''}
              aria-label={`Ir a diapositiva ${index + 1}: ${slide.titulo}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CombinationDetail({ itemId, onContact }: { itemId: string; onContact: (product?: string) => void }) {
  const item = standItems.find((candidate) => candidate.id === itemId && isStandItemActive(candidate));
  if (!item) return <main className="section-shell not-found"><h1>Combinación no encontrada</h1><Link to="/">Volver al inicio</Link></main>;
  const itemProducts = item.productIds.map((id) => productById.get(id)).filter(Boolean) as Product[];
  const idea = preparationIdeas.find((candidate) => candidate.id === item.recipeId);
  const others = standItems.filter((candidate) => candidate.visible && candidate.id !== item.id && candidate.tipo === 'combinacion').slice(0, 3);

  return (
    <main className="combination-page section-shell">
      <Link className="back-link" to="/"><ArrowLeft aria-hidden="true" /> Volver al stand</Link>
      <header className="combination-hero">
        <div>
          <span className="eyebrow">{item.tipo === 'novedad' ? 'Novedad BM Nuts' : 'Idea para combinar'}</span>
          <h1>{item.titulo}</h1>
          <p>{item.descripcion}</p>
          {item.note && <small>{item.note}</small>}
        </div>
        {item.image && <img src={item.image} alt={item.imageAlt || `Afiche de ${item.titulo} en BM Nuts`} />}
      </header>
      <section className="combination-products" aria-labelledby="combination-products-title">
        <h2 id="combination-products-title">Productos para esta idea</h2>
        {item.includesEditorialYogurt && <p className="editorial-yogurt">Yogur griego <small>Novedad editorial; ficha comercial pendiente.</small></p>}
        <div className="combination-product-grid">
          {itemProducts.map((product) => (
            <Link to={`/producto/${product.slug}`} key={product.id} className="combination-product">
              <ProductThumb product={product} />
              <span>{product.name}</span>
              <small>Ver ficha real</small>
            </Link>
          ))}
        </div>
      </section>
      {idea && (
        <section className="preparation-panel" aria-labelledby="preparation-title">
          <span className="eyebrow">Idea de preparación</span>
          <h2 id="preparation-title">{idea.titulo}</h2>
          <p>{idea.descripcion}</p>
          <ol>{idea.pasos.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
      {item.tipo === 'combinacion' && <p className="combination-disclaimer">Los productos se muestran como sugerencia; consulta disponibilidad y presentaciones en el local.</p>}
      {item.tipo === 'novedad' && <button className="contact-open-button" type="button" onClick={() => onContact('Yogur griego')}>Consultar en BM Nuts</button>}
      <nav className="other-combinations" aria-label="Otras combinaciones">
        <h2>Otras combinaciones</h2>
        <div>{others.map((other) => <Link key={other.id} to={`/combinacion/${other.id}`}>{other.titulo}<ArrowRight aria-hidden="true" /></Link>)}</div>
      </nav>
    </main>
  );
}

export function RelatedProducts({ productId }: { productId: string }) {
  const related = (relatedProductIds[productId] || []).map((id) => productById.get(id)).filter(Boolean) as Product[];
  if (related.length === 0) return null;
  return (
    <aside className="related-products" aria-labelledby="related-title">
      <h2 id="related-title">Combina bien con</h2>
      <div>{related.map((product) => <Link key={product.id} to={`/producto/${product.slug}`}>{product.name}<ArrowRight aria-hidden="true" /></Link>)}</div>
    </aside>
  );
}

export const getCollectionProducts = (collectionId: string | null) => {
  const collection = visibleCollections.find((candidate) => candidate.id === collectionId);
  return collection ? { collection, ids: new Set(collection.productIds) } : null;
};

export const getStandSlides = () => standItems.filter((item: StandItem) => isStandItemActive(item));
