import { useEffect, useState } from 'react';
import { Check, PackageOpen, Scale } from 'lucide-react';
import { formatPriceCents, type Product, type PublicSaleMode } from '../catalog';
import { getPublicPresentationSummary, type PriceOption } from '../domain/bulkSale';

type PresentationEntry = {
  id: string;
  label: string;
  presentation: string | null;
  saleMode: PublicSaleMode;
  approvedPriceCents: number | null;
  fixedLabel: string;
};

const optionId = (option: PriceOption) => `${option.kind}-${option.label}`;

const optionWeightLabel = (option: PriceOption) => {
  if (option.kind === 'desde-un-dolar') return `${formatWeight(option.approxPounds)} libra`;
  if (option.kind === 'fraction') return option.label;
  return null;
};

const formatWeight = (pounds: number) =>
  new Intl.NumberFormat('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(pounds);

const isDisabled = (option: PriceOption) => option.kind === 'fraction' && option.disabled;

const getInitialOption = (options: PriceOption[]) =>
  options.find((option) => option.kind === 'fraction' && option.denominator === 1 && !option.disabled)
  ?? options.find((option) => !isDisabled(option))
  ?? null;

export function ProductPresentations({ product }: { product: Product }) {
  const [selectedByEntry, setSelectedByEntry] = useState<Record<string, string>>({});
  useEffect(() => setSelectedByEntry({}), [product.id]);
  const entries: PresentationEntry[] = product.variants?.length
    ? product.variants.map((variant) => ({
        id: variant.id,
        label: variant.name,
        presentation: variant.presentation,
        saleMode: variant.saleMode,
        approvedPriceCents: variant.approvedPriceCents ?? null,
        fixedLabel: variant.pricePresentationLabel || variant.presentation || variant.name,
      }))
    : [{
        id: product.id,
        label: product.name,
        presentation: product.unit,
        saleMode: product.saleMode ?? 'unknown',
        approvedPriceCents: product.approvedPriceCents ?? null,
        fixedLabel: product.pricePresentationLabel || product.unit || 'Producto completo',
      }];

  return (
    <section className="product-presentations" aria-labelledby={`presentations-${product.id}`} data-testid="presentation-selector">
      <div className="product-presentations__heading">
        <PackageOpen aria-hidden="true" />
        <div>
          <span className="eyebrow">Modalidad de venta</span>
          <h2 id={`presentations-${product.id}`}>Presentaciones disponibles</h2>
        </div>
      </div>
      <ul>
        {entries.map((entry) => {
          const summary = getPublicPresentationSummary(entry.saleMode, entry.approvedPriceCents, entry.fixedLabel);
          const initialOption = getInitialOption(summary.options);
          const selectedId = selectedByEntry[entry.id] ?? (initialOption ? optionId(initialOption) : null);
          const selected = summary.options.find((option) => optionId(option) === selectedId) ?? null;
          const weightLabel = selected ? optionWeightLabel(selected) : null;
          const isFractional = entry.saleMode === 'bulk' || entry.saleMode === 'restricted';
          return (
            <li key={entry.id} data-sale-mode={entry.saleMode}>
              {entries.length > 1 && <strong>{entry.label}</strong>}
              {entry.presentation && entries.length > 1 && <small>{entry.presentation}</small>}
              <span>{summary.heading}</span>
              <p>{summary.detail}</p>
              {isFractional && summary.options.length > 0 && (
                <div className="product-presentations__options" aria-label={`Seleccionar presentación de ${entry.label}`}>
                  {summary.options.map((option) => {
                    const id = optionId(option);
                    const isSelected = selectedId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={isSelected ? 'is-selected' : ''}
                        aria-pressed={isSelected}
                        disabled={isDisabled(option)}
                        onClick={() => setSelectedByEntry((current) => ({ ...current, [entry.id]: id }))}
                      >
                        {isSelected && <Check aria-hidden="true" />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {selected && (
                <output className="product-presentations__selection" aria-live="polite">
                  <span className="product-presentations__price-label">Precio referencial</span>
                  <strong className="product-presentations__price-value">{formatPriceCents(selected.amountCents)}</strong>
                  {weightLabel && (
                    <span className="product-presentations__weight"><Scale aria-hidden="true" /> Peso aproximado: {weightLabel}</span>
                  )}
                </output>
              )}
              {entry.approvedPriceCents === null && (
                <small className="product-presentations__review">Precio por confirmar</small>
              )}
            </li>
          );
        })}
      </ul>
      <p className="product-presentations__notice">
        Precios referenciales sujetos a cambios. El valor puede subir o bajar; confirma el precio vigente en BM Nuts. El peso final depende del pesaje en el local.
      </p>
    </section>
  );
}
