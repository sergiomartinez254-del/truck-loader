import type { CrateReference } from "./crateTypes";
import type { Reference } from "./types";
import { SIN_LIMITE_PESO_KG } from "./types";
import { bboxNativoCrate } from "./crateMeshes";

/**
 * Una base de dobles bases (rastreles cruzados) solo se puede levantar con
 * la carretilla por el lado por donde entran las palas — girar la
 * construcción 90° la dejaría inaccesible, así que el packer no debe
 * probar la orientación girada. Con tacos, la carretilla puede levantarla
 * desde cualquier lado, así que se puede rotar libremente (comportamiento
 * de siempre). Se queda como "rotable" (true) si no hay información del
 * apoyo (referencia sin crateJson, o campo ausente).
 */
export function esRotable(crateJson: unknown): boolean {
  if (crateJson == null || typeof crateJson !== "object") return true;
  return (crateJson as { apoyoType?: unknown }).apoyoType !== "dobleBase";
}

/**
 * Con dobles bases, las palas de la carretilla entran en la MISMA dirección
 * en la que corren los rastreles (dbOrient) — y esa dirección tiene que
 * casar con el LARGO del camión (por donde entra la carretilla, puerta
 * trasera). Si dbOrient="ancho" (rastreles al ancho de la construcción →
 * las palas entran por el ancho), el ancho de la construcción es el que
 * tiene que mapear al largo del camión: hay que intercambiar largo/ancho al
 * construir el palletType. Si dbOrient="largo", ya casa tal cual.
 */
export function debeIntercambiarParaCamion(crateJson: unknown): boolean {
  if (crateJson == null || typeof crateJson !== "object") return false;
  const cfg = crateJson as { apoyoType?: unknown; dbOrient?: unknown };
  return cfg.apoyoType === "dobleBase" && cfg.dbOrient === "ancho";
}

export function crateReferenceAReference(
  cr: CrateReference,
  refs: Map<string, CrateReference>,
  geom: Map<string, unknown>,
  /** Sustituye cr.unidadesPorPack para esta referencia (solo tiene efecto
   * en tipo "carga") — deja personalizar cuántas unidades trae cada pack,
   * en vez del número fijo que venía en el JSON exportado. */
  unidadesPorPackOverride?: number
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
    const unidadesPorPack = unidadesPorPackOverride ?? cr.unidadesPorPack;

    // Exterior = max por eje (palet vs lámina); alto = palet + N×lámina
    let largoMm = Math.max(basePaletLargoMm, cr.largoMm);
    let anchoMm = Math.max(basePaletAnchoMm, cr.anchoMm);
    const packAltoMm = Math.round(basePaletAltoMm + cr.altoUnidadMm * unidadesPorPack);

    // La rotación y la orientación de carga las restringe el PALET BASE (es
    // lo que la carretilla agarra), no la lámina/carga que va encima.
    if (debeIntercambiarParaCamion(base.crateJson)) [largoMm, anchoMm] = [anchoMm, largoMm];

    return {
      id: cr.id, sku: cr.sku, nombre: cr.nombre,
      unidadesPorPalet: unidadesPorPack, loteMinimo: 1,
      apilable: cr.apilable,
      palletType: {
        id: `pt-${cr.id}`, nombre: `Bulto ${cr.sku}`,
        largoMm, anchoMm, alturaBaseMm: 0,
        pesoMaxKg: SIN_LIMITE_PESO_KG, pesoTaraKg: 0,
      },
      pesoUnitarioKg: cr.pesoUnidadKg,
      alturaPaletCompletoMm: packAltoMm,
      rotable: esRotable(base.crateJson),
    };
  }

  // Caso normal (palet/caja/jaula): si se transporta desmontada, sus medidas
  // (huella + alto del apilado de paneles planos) mandan sobre las de la caja
  // ya montada — es lo que de verdad ocupa en el camión. La base se queda
  // montada tal cual incluso desmontando el resto, así que la restricción de
  // apoyo (rotación y orientación de carga) aplica igual en ambos casos.
  let largoMm = cr.desmontado?.largoMm ?? cr.largoMm;
  let anchoMm = cr.desmontado?.anchoMm ?? cr.anchoMm;
  const altoUnidadMm = cr.desmontado?.altoMm ?? cr.altoUnidadMm;
  const packAltoMm = Math.round(altoUnidadMm * cr.unidadesPorPack);
  if (debeIntercambiarParaCamion(cr.crateJson)) [largoMm, anchoMm] = [anchoMm, largoMm];
  return {
    id: cr.id, sku: cr.sku, nombre: cr.nombre,
    unidadesPorPalet: cr.unidadesPorPack, loteMinimo: 1,
    apilable: cr.apilable,
    palletType: {
      id: `pt-${cr.id}`, nombre: `Bulto ${cr.sku}`,
      largoMm, anchoMm, alturaBaseMm: 0,
      pesoMaxKg: cr.pesoMaxApilableKg ?? SIN_LIMITE_PESO_KG, pesoTaraKg: 0,
    },
    pesoUnitarioKg: cr.pesoUnidadKg,
    alturaPaletCompletoMm: packAltoMm,
    rotable: esRotable(cr.crateJson),
  };
}