export type SaleMode =
  | 'GRANEL_FRACCIONABLE'
  | 'PRESENTACION_FIJA'
  | 'SOLO_MEDIA_Y_LIBRA'
  | 'UNIDAD_O_FRASCO'
  | 'PESO_VARIABLE_CONSULTA'
  | 'PENDIENTE_CONFIRMACION';

export type PublicSaleMode = 'bulk' | 'fixed_product' | 'unit' | 'jar' | 'restricted' | 'unknown';

export type PriceOption =
  | { kind: 'desde-un-dolar'; label: 'Desde $1'; amountCents: 100; approxPounds: number }
  | {
      kind: 'fraction';
      label: '¼ libra' | '½ libra' | '1 libra';
      numerator: 1;
      denominator: 4 | 2 | 1;
      amountCents: number;
      disabled: boolean;
    }
  | { kind: 'fixed'; label: string; amountCents: number };

type SaleClassificationInput = {
  sourceNotes?: string[];
  unit?: string | null;
  packageIndicators?: string[];
};

const normalizeRuleText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-EC')
    .trim();

export const classifySaleMode = ({ sourceNotes = [], unit, packageIndicators = [] }: SaleClassificationInput): SaleMode => {
  const notes = normalizeRuleText(sourceNotes.join(' '));
  const packageText = normalizeRuleText([unit ?? '', ...packageIndicators].join(' '));

  if (/solo\s+media\s+y\s+libra/.test(notes)) return 'SOLO_MEDIA_Y_LIBRA';
  if (/solo\s+producto(?:\s+de\s+dolar)?/.test(notes)) return 'PRESENTACION_FIJA';
  if (/pese\s+la\s+rama|peso\s+variable|pesaje\s+especifico/.test(notes)) return 'PESO_VARIABLE_CONSULTA';
  if (/frasco|botella|paquete|unidad|\bund\b|\bml\b|\bcc\b|\bgr\b|\bkg\b|contenido/.test(packageText)) {
    return 'UNIDAD_O_FRASCO';
  }
  if (/libra|\blb\b/.test(packageText)) return 'GRANEL_FRACCIONABLE';
  return 'PENDIENTE_CONFIRMACION';
};

export const calculateApproxPoundsForDollar = (pricePerLbCents: number) =>
  Number.isInteger(pricePerLbCents) && pricePerLbCents > 0 ? 100 / pricePerLbCents : null;

export const calculatePriceCents = (pricePerLbCents: number, numerator: number, denominator: number) => {
  if (!Number.isInteger(pricePerLbCents) || pricePerLbCents <= 0 || !Number.isInteger(numerator) || numerator <= 0 || !Number.isInteger(denominator) || denominator <= 0) {
    return null;
  }
  return Math.round((pricePerLbCents * numerator) / denominator);
};

export const validateMinimumAmountForBulk = (
  pricePerLbCents: number,
  numerator: number,
  denominator: number,
  minimumCents = 100,
) =>
  Number.isInteger(pricePerLbCents) &&
  Number.isInteger(numerator) &&
  Number.isInteger(denominator) &&
  Number.isInteger(minimumCents) &&
  pricePerLbCents > 0 &&
  numerator > 0 &&
  denominator > 0 &&
  minimumCents > 0 &&
  pricePerLbCents * numerator >= minimumCents * denominator;

const FRACTIONS: Array<Pick<Extract<PriceOption, { kind: 'fraction' }>, 'label' | 'numerator' | 'denominator'>> = [
  { label: '¼ libra', numerator: 1, denominator: 4 },
  { label: '½ libra', numerator: 1, denominator: 2 },
  { label: '1 libra', numerator: 1, denominator: 1 },
];

const fractionOption = (
  pricePerLbCents: number,
  fraction: (typeof FRACTIONS)[number],
): Extract<PriceOption, { kind: 'fraction' }> | null => {
  const amountCents = calculatePriceCents(pricePerLbCents, fraction.numerator, fraction.denominator);
  return amountCents === null ? null : {
    kind: 'fraction',
    ...fraction,
    amountCents,
    disabled: !validateMinimumAmountForBulk(pricePerLbCents, fraction.numerator, fraction.denominator),
  };
};

export const listAllowedPresentations = (
  saleMode: SaleMode,
  approvedPriceCents: number | null,
  fixedLabel = 'Presentación fija',
): PriceOption[] => {
  if (!Number.isInteger(approvedPriceCents) || (approvedPriceCents ?? 0) <= 0) return [];
  const priceCents = approvedPriceCents as number;

  if (saleMode === 'PRESENTACION_FIJA' || saleMode === 'UNIDAD_O_FRASCO') {
    return [{ kind: 'fixed', label: fixedLabel, amountCents: priceCents }];
  }
  if (saleMode === 'PESO_VARIABLE_CONSULTA' || saleMode === 'PENDIENTE_CONFIRMACION') return [];

  const fractionOptions = (saleMode === 'SOLO_MEDIA_Y_LIBRA' ? FRACTIONS.slice(1) : FRACTIONS)
    .map((fraction) => fractionOption(priceCents, fraction))
    .filter((option): option is Extract<PriceOption, { kind: 'fraction' }> => option !== null);

  if (saleMode === 'SOLO_MEDIA_Y_LIBRA') return fractionOptions;
  const approxPounds = calculateApproxPoundsForDollar(priceCents);
  return approxPounds === null
    ? fractionOptions
    : [{ kind: 'desde-un-dolar', label: 'Desde $1', amountCents: 100, approxPounds }, ...fractionOptions];
};

export type PublicPresentationSummary = {
  mode: PublicSaleMode;
  heading: string;
  detail: string;
  options: PriceOption[];
};

const domainModeForPublicMode = (mode: PublicSaleMode): SaleMode => {
  if (mode === 'bulk') return 'GRANEL_FRACCIONABLE';
  if (mode === 'restricted') return 'SOLO_MEDIA_Y_LIBRA';
  if (mode === 'fixed_product') return 'PRESENTACION_FIJA';
  if (mode === 'unit' || mode === 'jar') return 'UNIDAD_O_FRASCO';
  return 'PENDIENTE_CONFIRMACION';
};

export const getPublicPresentationSummary = (
  mode: PublicSaleMode,
  approvedPriceCents: number | null = null,
  fixedLabel = 'Presentación fija',
): PublicPresentationSummary => {
  const options = listAllowedPresentations(domainModeForPublicMode(mode), approvedPriceCents, fixedLabel);
  if (mode === 'bulk') {
    return {
      mode,
      heading: 'Venta a granel · desde $1',
      detail: approvedPriceCents === null
        ? 'El peso varía según el producto. Presentaciones sujetas al producto: consultar en el local.'
        : 'Selecciona una referencia informativa. Este catálogo no procesa pedidos.',
      options,
    };
  }
  if (mode === 'restricted') {
    return {
      mode,
      heading: 'Venta por peso · ½ y 1 libra',
      detail: approvedPriceCents === null
        ? 'Para ajonjolí, consulta disponibilidad y el mínimo aplicable en el local.'
        : 'Solo se ofrecen las opciones que cumplen el mínimo de $1 por producto.',
      options,
    };
  }
  if (mode === 'fixed_product') {
    return { mode, heading: 'Presentación fija', detail: 'Se vende como producto completo, sin fraccionamiento por libra.', options };
  }
  if (mode === 'unit') {
    return { mode, heading: 'Venta por unidad', detail: 'La presentación es fija y no se fracciona por peso.', options };
  }
  if (mode === 'jar') {
    return { mode, heading: 'Presentación en frasco', detail: 'El envase es una presentación fija, sin fraccionamiento por libra.', options };
  }
  return { mode, heading: 'Consultar presentación', detail: 'La modalidad de este producto requiere confirmación en el local.', options: [] };
};
