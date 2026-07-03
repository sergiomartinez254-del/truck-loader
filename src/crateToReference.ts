import type { CrateReference } from "./crateTypes";
import type { Reference } from "./types";
import { bboxNativoCrate } from "./crateMeshes";

const SIN_LIMITE_PESO = Number.MAX_SAFE_INTEGER;

export function crateReferenceAReference(
  cr: CrateReference,
  refs: Map<string, CrateReference>,
  geom: Map<string, unknown>
): Reference {
  // Caso CARGA: palet base (geometría real) + torre de N láminas encima
  if (cr.tipo === "carga" && cr.paletBase) {
    const base = refs.get(cr.paletBase);
    const baseGeom = geom.get(cr.paletBase);
    if (!base || !baseGeom) {
      throw new Error(`La carga ${cr.sku} necesita el palet base ${cr.paletBase} cargado.`);
    }
    const bb = bboxNativoCrate(baseGeom);              // cm
    const basePaletAltoMm = Math.round(bb.alto * 10);
    const basePaletLargoMm = Math.round(bb.largo * 10);
    const basePaletAnchoMm = Math.round(bb.ancho * 10);

    // Exterior = max por eje (palet vs lámina); alto = palet + N×lámina
    const largoMm = Math.max(basePaletLargoMm, cr.largoMm);
    const anchoMm = Math.max(basePaletAnchoMm, cr.anchoMm);
    const packAltoMm = Math.round(basePaletAltoMm + cr.altoUnidadMm * cr.unidadesPorPack);

    return {
      id: cr.id, sku: cr.sku, nombre: cr.nombre,
      unidadesPorPalet: cr.unidadesPorPack, loteMinimo: 1,
      apilable: false,
      palletType: {
        id: `pt-${cr.id}`, nombre: `Bulto ${cr.sku}`,
        largoMm, anchoMm, alturaBaseMm: 0,
        pesoMaxKg: SIN_LIMITE_PESO, pesoTaraKg: 0,
      },
      pesoUnitarioKg: cr.pesoUnidadKg,
      alturaPaletCompletoMm: packAltoMm,
    };
  }

  // Caso normal (palet/caja/jaula)
  const largoMm = cr.largoMm, anchoMm = cr.anchoMm;
  const packAltoMm = Math.round(cr.altoUnidadMm * cr.unidadesPorPack);
  return {
    id: cr.id, sku: cr.sku, nombre: cr.nombre,
    unidadesPorPalet: cr.unidadesPorPack, loteMinimo: 1,
    apilable: cr.apilable,
    palletType: {
      id: `pt-${cr.id}`, nombre: `Bulto ${cr.sku}`,
      largoMm, anchoMm, alturaBaseMm: 0,
      pesoMaxKg: cr.pesoMaxApilableKg ?? SIN_LIMITE_PESO, pesoTaraKg: 0,
    },
    pesoUnitarioKg: cr.pesoUnidadKg,
    alturaPaletCompletoMm: packAltoMm,
  };
}