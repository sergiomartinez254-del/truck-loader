// ============================================================================
// MODELO DE DATOS DEL MÓDULO DE CARGA DE CAMIONES
// ============================================================================
// Todas las medidas lineales van en milímetros (mm) y los pesos en kilos (kg)
// para evitar errores de coma flotante con decimales de metros.
// ----------------------------------------------------------------------------

/**
 * Sentinela de "sin límite práctico de peso". Antes estaba duplicada como
 * `Number.MAX_SAFE_INTEGER` en cratePacker.ts y crateToReference.ts; se
 * centraliza aquí para que ambos ficheros usen exactamente el mismo valor.
 */
export const SIN_LIMITE_PESO_KG = Number.MAX_SAFE_INTEGER;

/** Tipo de palet físico (europeo, americano, medio palet, etc.) */
export interface PalletType {
  id: string;
  nombre: string;
  /** Medida a lo largo del eje "largo" del camión cuando no está rotado */
  largoMm: number;
  /** Medida a lo largo del eje "ancho" del camión cuando no está rotado */
  anchoMm: number;
  /** Altura del palet vacío (la base de madera/plástico) */
  alturaBaseMm: number;
  /** Peso máximo que soporta el propio palet, incluida la carga */
  pesoMaxKg: number;
  /** Peso del palet vacío (tara) */
  pesoTaraKg: number;
}

/** Una referencia / SKU del catálogo */
export interface Reference {
  id: string;
  sku: string;
  nombre: string;
  /** Unidades que caben en un palet completo de esta referencia */
  unidadesPorPalet: number;
  /** Lote de entrega mínimo: cantidad mínima que se puede servir de esta referencia */
  loteMinimo: number;
  /** Si se permite apilar otro palet encima de un palet de esta referencia */
  apilable: boolean;
  /** Tipo de palet en el que se sirve esta referencia */
  palletType: PalletType;
  /** Peso de una unidad de producto (sin el palet) */
  pesoUnitarioKg: number;
  /** Altura total del palet ya cargado al 100% (base + mercancía) */
  alturaPaletCompletoMm: number;
  /**
   * Si el packer puede girar 90° la huella de este bulto al buscarle hueco.
   * `undefined`/`true` = libre (comportamiento de siempre). `false` = debe
   * respetar SIEMPRE su orientación largo/ancho tal cual viene — típicamente
   * porque una carretilla solo puede levantarlo por un lado concreto (p.ej.
   * una base de dobles bases: las palas entran perpendiculares a los
   * rastreles, girar la construcción 90° la dejaría inaccesible).
   */
  rotable?: boolean;
  /**
   * Si es true, un pack parcial (menos unidades que unidadesPorPalet) usa
   * SIEMPRE la altura completa (alturaPaletCompletoMm), sin encoger
   * proporcionalmente al llenado — para referencias tipo "foam", donde la
   * caja que las contiene tiene una medida exterior fija, da igual cuántos
   * foams lleve dentro. Por defecto (undefined/false) se mantiene el
   * comportamiento de siempre (encoger proporcionalmente, como una torre
   * de unidades apiladas que efectivamente es más baja si hay menos).
   */
  alturaFija?: boolean;
  /**
   * Cuánta altura se gana por cada unión al apilar en "capiculado" (un
   * palet del derecho, el siguiente del revés y desplazado, para que el
   * cubrir tipo jaula de ambos se entrelace en cremallera) — el grosor de
   * una capa de cubrir, calculado de la geometría, no un dato manual. Solo
   * tiene sentido con apoyoType "tacos" y cubrirType "jaula"; para el resto
   * de construcciones queda a 0/undefined.
   */
  alturaGanadaCapiculadoMm?: number;
  /**
   * Cuánto se desplaza en horizontal (mm) el nivel invertido de una unión
   * capiculada, para que sus tacos caigan en el hueco entre los tacos de
   * abajo en vez de encima — sin este desplazamiento, dos piezas de madera
   * sólidas (los tacos) ocupan literalmente el mismo sitio, y por más que
   * se reduzca la altura, se ven solapadas. Se aproxima con el ancho del
   * propio taco (no hace falta la posición exacta de cada uno para que la
   * vista 3D se vea razonable).
   */
  desplazamientoCapiculadoMm?: number;
}

/** Perfil de camión / remolque. Pensado para poder crear varios y elegir uno dinámicamente. */
export interface TruckProfile {
  id: string;
  nombre: string;
  largoInteriorMm: number;
  anchoInteriorMm: number;
  altoInteriorMm: number;
  pesoMaxKg: number;
  /**
   * Si el camión admite carga lateral (además de por la puerta trasera). Con
   * carga trasera únicamente, un bulto no rotable (p.ej. base de dobles
   * bases) debe respetar siempre su orientación de fábrica — solo puede
   * entrar la carretilla por un lado. Si también admite carga lateral, da
   * igual la orientación: se puede colocar girado, así que el packer puede
   * rotar libremente cualquier bulto sin mirar `reference.rotable`.
   */
  cargaLateral?: boolean;
  /**
   * Si se usa apilado "capiculado" cuando la geometría lo permite (bases de
   * tacos): alternar un palet del derecho y el siguiente del revés,
   * desplazado, para que sus tacos se entrelacen con los del de abajo en
   * vez de apoyar plano encima — se gana la altura de los tacos en cada
   * unión. Solo afecta al cálculo automático del packer, nunca al apilado
   * manual.
   */
  capiculado?: boolean;
}

/** Línea de pedido: cuánto se pide de cada referencia */
export interface OrderLine {
  referenceId: string;
  cantidadSolicitada: number;
}

/** Un palet ya generado a partir de una línea de pedido (completo o parcial) */
export interface PalletInstance {
  id: string;
  referenceId: string;
  unidades: number;
  esCompleto: boolean;
  pesoKg: number;
  alturaMm: number;
  apilable: boolean;
  palletType: PalletType;
}

/** Un palet ya colocado dentro de un camión, con su posición física */
export interface PlacedPallet extends PalletInstance {
  /** mm desde el lateral izquierdo del camión */
  x: number;
  /** mm desde el frontal (lado cabina) del camión */
  y: number;
  /** mm desde el suelo (altura a la que se apoya este palet) */
  z: number;
  /** Nivel de apilado: 0 = suelo, 1 = encima del primero, ... */
  nivel: number;
  /** Huella ocupada en planta tras decidir orientación */
  largoOcupadoMm: number;
  anchoOcupadoMm: number;
}

/** Resultado de cargar un único camión */
export interface TruckLoadPlan {
  numero: number;
  truckProfile: TruckProfile;
  pallets: PlacedPallet[];
  pesoTotalKg: number;
  volumenUtilizadoM3: number;
  volumenTotalM3: number;
  ocupacionVolumen: number; // 0-100
  ocupacionPeso: number; // 0-100
  ocupacionSuelo: number; // 0-100, superficie de planta ocupada por los palets de nivel 0
  posicionesSueloUsadas: number;
}

/** Resultado completo de planificar un pedido (puede repartirse en varios camiones) */
export interface LoadPlanResult {
  camiones: TruckLoadPlan[];
  referenciasNoAsignadas: { referenceId: string; unidadesPendientes: number; motivo: string }[];
  avisos: string[];
}