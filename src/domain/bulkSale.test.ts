import { describe, expect, it } from 'vitest';
import {
  calculateApproxPoundsForDollar,
  classifySaleMode,
  getPublicPresentationSummary,
  listAllowedPresentations,
  validateMinimumAmountForBulk,
} from './bulkSale';

const labels = (priceCents: number) => listAllowedPresentations('GRANEL_FRACCIONABLE', priceCents).map((option) => option.label);

describe('venta a granel desde un dólar por producto', () => {
  it.each([
    [400, 0.25, ['Desde $1', '¼ libra', '½ libra', '1 libra']],
    [150, 2 / 3, ['Desde $1', '¼ libra', '½ libra', '1 libra']],
    [200, 0.5, ['Desde $1', '¼ libra', '½ libra', '1 libra']],
    [300, 1 / 3, ['Desde $1', '¼ libra', '½ libra', '1 libra']],
    [600, 1 / 6, ['Desde $1', '¼ libra', '½ libra', '1 libra']],
  ])('calcula %i centavos sin imponer un peso mínimo fijo', (price, expectedWeight, expectedLabels) => {
    expect(calculateApproxPoundsForDollar(price)).toBeCloseTo(expectedWeight, 8);
    expect(labels(price)).toEqual(expectedLabels);
  });

  it('evalúa el mínimo antes de redondear 3,99/4', () => {
    expect(validateMinimumAmountForBulk(399, 1, 4)).toBe(false);
    const quarter = listAllowedPresentations('GRANEL_FRACCIONABLE', 399).find((option) => option.label === '¼ libra');
    expect(quarter).toMatchObject({ kind: 'fraction', disabled: true });
  });

  it('mantiene solo producto como precio fijo aunque la medida diga libra', () => {
    const mode = classifySaleMode({ sourceNotes: ['solo producto'], unit: 'Libra' });
    expect(mode).toBe('PRESENTACION_FIJA');
    expect(listAllowedPresentations(mode, 150)).toEqual([
      { kind: 'fixed', label: 'Presentación fija', amountCents: 150 },
    ]);
  });

  it('mantiene solo producto de dólar como unidad fija', () => {
    const mode = classifySaleMode({ sourceNotes: ['solo producto de dólar'], unit: 'Libra' });
    expect(listAllowedPresentations(mode, 100)).toEqual([
      { kind: 'fixed', label: 'Presentación fija', amountCents: 100 },
    ]);
  });

  it('limita el ajonjolí a media y libra, sin cuarto ni peso libre', () => {
    const mode = classifySaleMode({ sourceNotes: ['solo media y libra'], unit: 'Libra' });
    expect(mode).toBe('SOLO_MEDIA_Y_LIBRA');
    expect(listAllowedPresentations(mode, 450).map((option) => option.label)).toEqual(['½ libra', '1 libra']);
  });

  it('clasifica frascos y envases como presentación no fraccionable', () => {
    const mode = classifySaleMode({ unit: 'Unidad', packageIndicators: ['frasco 250 ml'] });
    expect(mode).toBe('UNIDAD_O_FRASCO');
    expect(listAllowedPresentations(mode, 850, 'Frasco 250 ml')).toEqual([
      { kind: 'fixed', label: 'Frasco 250 ml', amountCents: 850 },
    ]);
  });

  it('deja la canela en rama como consulta de peso variable', () => {
    const mode = classifySaleMode({ sourceNotes: ['aquí solo lo que pese la rama aveces varia'], unit: 'Libra' });
    expect(mode).toBe('PESO_VARIABLE_CONSULTA');
    expect(listAllowedPresentations(mode, 1500)).toEqual([]);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rechaza precios inválidos: %s', (price) => {
    expect(calculateApproxPoundsForDollar(price)).toBeNull();
    expect(listAllowedPresentations('GRANEL_FRACCIONABLE', price)).toEqual([]);
  });

  it('comunica granel desde $1 sin derivar pesos ni importes cuando el precio no es público', () => {
    const summary = getPublicPresentationSummary('bulk', null);
    expect(summary.heading).toBe('Venta a granel · desde $1');
    expect(summary.detail).toContain('consultar en el local');
    expect(summary.options).toEqual([]);
  });

  it('no ofrece peso libre ni cuarto de libra para ajonjolí', () => {
    const unpublished = getPublicPresentationSummary('restricted', null);
    expect(unpublished.heading).toContain('½ y 1 libra');
    expect(unpublished.heading).not.toContain('desde $1');
    expect(unpublished.options).toEqual([]);
    const options = getPublicPresentationSummary('restricted', 150).options;
    expect(options.map((option) => option.label)).toEqual(['½ libra', '1 libra']);
    expect(options[0]).toMatchObject({ kind: 'fraction', disabled: true });
    expect(options[1]).toMatchObject({ kind: 'fraction', disabled: false });
  });

  it.each(['fixed_product', 'unit', 'jar', 'unknown'] as const)('no fracciona la modalidad pública %s sin aprobación', (mode) => {
    expect(getPublicPresentationSummary(mode, null).options).toEqual([]);
    expect(getPublicPresentationSummary(mode, null).heading).not.toContain('Venta a granel');
  });
});
