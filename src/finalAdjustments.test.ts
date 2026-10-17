import { describe, expect, it } from 'vitest';
import { data, pickNextTagline } from './catalog';
import { contactConfig, mapsSearchUrl } from './contactConfig';
import { productFacts } from './productFacts';

describe('ajustes finales BM Nuts', () => {
  it('mantiene seis slogans comerciales y evita la repetición inmediata', () => {
    expect(data.brand.taglines).toHaveLength(6);
    expect(data.brand.taglines.every((tagline) => /atención|favorito|sabores|especial/i.test(tagline))).toBe(true);
    const previous = data.brand.taglines[2];
    expect(pickNextTagline(data.brand.taglines, previous, () => 0)).not.toBe(previous);
  });

  it('limita ¿Sabías que? a los cuatro productos aprobados', () => {
    expect(Object.keys(productFacts).sort()).toEqual(['BMN-001', 'BMN-007', 'BMN-011', 'BMN-059']);
    expect(Object.values(productFacts).every((fact) => !/cura|previene|trata|garantiza/i.test(fact))).toBe(true);
  });

  it('mantiene exactamente dos sedes y marca la sucursal pendiente', () => {
    expect(contactConfig.locations).toHaveLength(2);
    expect(contactConfig.locations.map((location) => location.id)).toEqual(['matriz', 'sucursal']);
    expect(contactConfig.locations.find((location) => location.id === 'sucursal')?.pendingVerification).toBe(true);
  });

  it('genera búsquedas de Maps con dirección codificada y sin coordenadas inventadas', () => {
    const address = contactConfig.locations[0].address;
    const url = mapsSearchUrl(address);
    expect(url).toBe(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    expect(url).not.toMatch(/destination=|@[0-9.-]+,[0-9.-]+/);
  });

  it('no crea enlaces para WhatsApp o Instagram sin URL confirmada', () => {
    expect(contactConfig.socials).toHaveLength(3);
    expect(contactConfig.socials.find((social) => social.id === 'whatsapp')?.url).toBeNull();
    expect(contactConfig.socials.find((social) => social.id === 'instagram')?.url).toBeNull();
  });
});
