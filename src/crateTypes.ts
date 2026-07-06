// ============================================================================
// TIPOS DEL FLUJO "CAJAS" (referencias que nacen del constructor 3D)
// ============================================================================
// El constructor exporta un ENVOLTORIO: { meta, crate }.
//   - `meta`  → ficha logística ya resuelta (medidas exteriores, peso, flejado…)
//   - `crate` → el JSON de configuración del constructor, tal cual, guardado
//               para poder reconstruir la geometría 3D real en el futuro.
//
// El planificador consume `meta` (no ejecuta lógica del constructor). El `crate`
// viaja intacto dentro de la referencia por si más adelante se pinta el 3D.
//
// UNIDADES: en el envoltorio, las medidas van en CENTÍMETROS (lo que muestra el
// constructor y lo que un humano verifica de un vistazo). El adaptador las pasa
// a milímetros para encajar con el resto del módulo (types.ts trabaja en mm).
// ----------------------------------------------------------------------------

/** Qué es físicamente la referencia. Para el packer todas son un ortoedro. */
export type CrateBultoTipo = "palet" | "caja" | "jaula" | "carga";

/** Carga que va ENCIMA de un palet (aros de cartón, piezas raras…). Opcional. */
export interface CrateCargaEncima {
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  pesoKg: number;
}

/**
 * Medidas del bulto CUANDO SE TRANSPORTA DESMONTADO (caja/jaula plegada en
 * paneles planos apilados sobre la base, en vez de montada en su forma final).
 * El planificador las calcula él mismo a partir de la geometría real (`crate`)
 * — ver `calcularDesmontado` en crateAdapter.ts — nunca se exportan como
 * número fijo, para que no puedan desincronizarse de lo que de verdad se
 * dibuja ni de la altura que reserva el camión.
 */

/**
 * Ficha logística que el constructor escribe al exportar. Medidas en cm de UNA
 * unidad (no del pack). El flejado (unidadesPorPack) multiplica la altura y el
 * peso al construir el bulto físico.
 */
export interface CrateReferenceMeta {
  sku: string;
  nombre?: string;
  tipo: CrateBultoTipo;
  /** Solo para tipo "carga": SKU del palet sobre el que apoya. */
  paletBase?: string;
  /** ¿Se puede poner otro pack encima de este pack? */
  apilable: boolean;
  /** Flejado por defecto: cuántas unidades van atadas juntas en un pack. */
  unidadesPorPack: number;
  /** Medidas exteriores de UNA unidad, en cm (con tapabocas ya incluidos). */
  exterior: { largoCm: number; anchoCm: number; altoCm: number };
  /** Peso de UNA unidad, en kg. */
  pesoUnidadKg: number;
  /** Cuánto peso aguanta encima el pack (kg). Ausente = sin límite práctico. */
  pesoMaxApilableKg?: number;
  /** Si la referencia va sobre un palet + carga encima. */
  cargaEncima?: CrateCargaEncima | null;
  /**
   * Marca si esta referencia (caja/jaula) se transporta DESMONTADA (paneles
   * planos apilados sobre la base) en vez de montada. Solo es un sí/no: las
   * medidas del bulto desmontado las calcula el propio planificador a partir
   * de `crate` (la misma geometría que dibuja "Detalle 3D"), no se exportan
   * aquí — así nunca pueden quedarse desactualizadas si el criterio de
   * tumbado/apilado cambia más adelante.
   */
  desmontado?: boolean;
}

/** Envoltorio completo exportado por el constructor. */
export interface CrateWrapper {
  meta: CrateReferenceMeta;
  /** JSON de configuración del constructor (serializeState). Se guarda intacto. */
  crate: unknown;
}

/**
 * Referencia de cajas ya normalizada (en mm) y lista para el planificador.
 * Es el modelo de dominio que maneja la UI; internamente se traduce a la
 * `Reference`/`PalletInstance` que consume el packer.
 */
export interface CrateReference {
  id: string;
  sku: string;
  nombre: string;
  tipo: CrateBultoTipo;
  apilable: boolean;
  paletBase: string | null;
  unidadesPorPack: number;
  /** Huella y altura de UNA unidad, en mm. */
  largoMm: number;
  anchoMm: number;
  altoUnidadMm: number;
  pesoUnidadKg: number;
  /** null = sin límite práctico de peso apilado. */
  pesoMaxApilableKg: number | null;
  /** Carga encima ya normalizada a mm (null si no aplica). */
  cargaEncima: { largoMm: number; anchoMm: number; altoMm: number; pesoKg: number } | null;
  /**
   * Medidas del bulto desmontado, ya normalizadas a mm (null = se transporta
   * montada). Cuando existen, sustituyen a largoMm/anchoMm/altoUnidadMm a la
   * hora de calcular el hueco que ocupa en el camión.
   */
  desmontado: { largoMm: number; anchoMm: number; altoMm: number } | null;
  /** JSON crudo del constructor, para el visor 3D futuro. */
  crateJson: unknown;
}

/**
 * Línea de pedido del flujo de cajas: cuántos PACKS flejados cargar de una
 * referencia. El flejado se toma de la referencia salvo que la línea lo
 * sobrescriba (para packs que van atados en cantidad distinta a la habitual).
 */
export interface CrateOrderLine {
  referenceId: string;
  numeroDePacks: number;
  unidadesPorPackOverride?: number;
}