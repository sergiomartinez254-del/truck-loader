// ============================================================================
// ADAPTADOR: envoltorio JSON del constructor  →  CrateReference (normalizada)
// ============================================================================
// Punto único de traducción. El planificador NO conoce el formato interno del
// constructor: solo el envoltorio { meta, crate }. Aquí se valida el `meta`, se
// convierte cm→mm y se conserva el `crate` intacto para el 3D futuro.
// ----------------------------------------------------------------------------

import type {
  CrateCargaEncima,
  CrateReference,
  CrateReferenceMeta,
  CrateWrapper,
} from "./crateTypes";

const cmAmm = (cm: number) => Math.round(cm * 10);

export interface ResultadoCargaReferencia {
  reference: CrateReference | null;
  error: string | null;
}

/** Valida que un valor sea número finito y > 0. */
function numPos(v: unknown): v is number {
  return typeof v === "number" && isFinite(v) && v > 0;
}

/** Comprueba y normaliza la carga encima (opcional). Lanza texto de error si es inválida. */
function normalizarCargaEncima(c: CrateCargaEncima | null | undefined): CrateReference["cargaEncima"] {
  if (c == null) return null;
  if (!numPos(c.largoCm) || !numPos(c.anchoCm) || !numPos(c.altoCm) || !numPos(c.pesoKg)) {
    throw new Error("cargaEncima tiene medidas o peso no válidos (deben ser números > 0).");
  }
  return {
    largoMm: cmAmm(c.largoCm),
    anchoMm: cmAmm(c.anchoCm),
    altoMm: cmAmm(c.altoCm),
    pesoKg: c.pesoKg,
  };
}

/**
 * Convierte un envoltorio ya parseado a CrateReference. Lanza Error con mensaje
 * claro si el `meta` es inválido. Usa `cargarReferenciaDeTexto` si partes del
 * string del archivo.
 */
export function crateWrapperAReferencia(wrapper: CrateWrapper): CrateReference {
  if (!wrapper || typeof wrapper !== "object") {
    throw new Error("El archivo no es un envoltorio válido (falta el objeto raíz).");
  }
  const meta = wrapper.meta as CrateReferenceMeta | undefined;
  if (!meta || typeof meta !== "object") {
    throw new Error('Falta el bloque "meta" en el archivo. ¿Exportaste desde el constructor con la ficha logística?');
  }
  if (typeof meta.sku !== "string" || !meta.sku.trim()) {
    throw new Error('El "meta" no tiene un SKU válido.');
  }
  const tipo = meta.tipo;
 if (tipo !== "palet" && tipo !== "caja" && tipo !== "jaula" && tipo !== "carga") {
    throw new Error(`Tipo de bulto no reconocido en ${meta.sku}: "${String(tipo)}".`);
  }
  if (tipo === "carga" && (typeof meta.paletBase !== "string" || !meta.paletBase.trim())) {
    throw new Error(`La referencia "carga" ${meta.sku} necesita "paletBase" (SKU del palet).`);
  }
  if (!meta.exterior || !numPos(meta.exterior.largoCm) || !numPos(meta.exterior.anchoCm) || !numPos(meta.exterior.altoCm)) {
    throw new Error(`Medidas exteriores no válidas en ${meta.sku} (largo/ancho/alto deben ser números > 0 en cm).`);
  }
  if (typeof meta.pesoUnidadKg !== "number" || !isFinite(meta.pesoUnidadKg) || meta.pesoUnidadKg < 0) {
    throw new Error(`Peso por unidad no válido en ${meta.sku} (debe ser un número ≥ 0 en kg).`);
  }
  if (!numPos(meta.unidadesPorPack) || !Number.isInteger(meta.unidadesPorPack)) {
    throw new Error(`unidadesPorPack no válido en ${meta.sku} (debe ser un entero > 0).`);
  }
  if (typeof meta.apilable !== "boolean") {
    throw new Error(`Falta el flag "apilable" (true/false) en ${meta.sku}.`);
  }

  const cargaEncima = normalizarCargaEncima(meta.cargaEncima);

  const pesoMaxApilableKg =
    meta.pesoMaxApilableKg == null
      ? null
      : numPos(meta.pesoMaxApilableKg)
      ? meta.pesoMaxApilableKg
      : (() => { throw new Error(`pesoMaxApilableKg no válido en ${meta.sku}.`); })();

  return {
    id: meta.sku,                       // el SKU actúa de id; si necesitas variantes, añádeles sufijo al exportar
    sku: meta.sku,
    nombre: meta.nombre?.trim() || meta.sku,
    tipo,
    paletBase: tipo === "carga" ? meta.paletBase!.trim() : null,
    apilable: meta.apilable,
    unidadesPorPack: meta.unidadesPorPack,
    largoMm: cmAmm(meta.exterior.largoCm),
    anchoMm: cmAmm(meta.exterior.anchoCm),
    altoUnidadMm: cmAmm(meta.exterior.altoCm),
    pesoUnidadKg: meta.pesoUnidadKg,
    pesoMaxApilableKg,
    cargaEncima,
    crateJson: wrapper.crate ?? null,
  };
}

/**
 * Carga desde el texto de un archivo .json. Devuelve la referencia o un error
 * legible (pensado para un input de tipo file en la UI, sin try/catch por fuera).
 */
export function cargarReferenciaDeTexto(texto: string): ResultadoCargaReferencia {
  let wrapper: CrateWrapper;
  try {
    wrapper = JSON.parse(texto) as CrateWrapper;
  } catch {
    return { reference: null, error: "El archivo no es un JSON válido." };
  }
  try {
    return { reference: crateWrapperAReferencia(wrapper), error: null };
  } catch (e) {
    return { reference: null, error: e instanceof Error ? e.message : String(e) };
  }
}
