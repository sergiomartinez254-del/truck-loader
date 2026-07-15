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
  /**
   * Alto (mm) de UNA unidad física individual, cuando `unidadesPorPalet`
   * representa piezas realmente apilables sueltas (p.ej. un fleje de N
   * palets, cada uno con su propia estructura) en vez de "cajas sobre un
   * palet" u otra unidad de conteo que no se apile pieza a pieza.
   * undefined = no aplica (comportamiento de siempre: el pack completo se
   * trata como UN bloque atómico con `alturaPaletCompletoMm`). Cuando está
   * presente, el packer puede aplicar capiculado DENTRO del propio fleje,
   * alternando unión a unión igual que entre palets sueltos — ver
   * agruparEnPilas en packer.ts.
   */
  altoUnidadMm?: number;
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
   * Ganancia (mm) de la unión "alterna", la que se da en las uniones PARES
   * empezando a contar desde la segunda (2ª-3ª, 4ª-5ª...) cuando se apilan
   * 3 o más palets en capiculado. La 1ª-2ª (y 3ª-4ª, 5ª-6ª...) usa
   * `alturaGanadaCapiculadoMm` (cubrir contra cubrir, ambos a la misma
   * altura). La alterna es un mecanismo distinto: el palet de arriba (en
   * su orientación normal, sin volteo) apoya sus tacos sobre la capa de
   * apoyo del palet invertido de abajo (p.ej. su rastrel), colándose entre
   * los tacos de ese palet invertido gracias al desplazamiento en X que ya
   * trae de su propia unión con capiculado normal — por eso esta unión NO
   * lleva desplazamiento propio (queda alineada con el nivel de dos más
   * abajo). La ganancia es el grosor de las capas que el taco de arriba
   * atraviesa hasta topar con la capa de apoyo elegida (p.ej. solo el
   * grosor del taco si apoya en el rastrel, que va justo debajo). Depende
   * de qué capas tenga cada construcción entre el taco y la capa de apoyo;
   * 0/undefined si no aplica (p.ej. sin rastreles).
   */
  alturaGanadaCapiculadoAltMm?: number;
  /**
   * Cuánto se desplaza (mm) el nivel invertido de una unión capiculada,
   * para que sus tacos caigan en el hueco entre los tacos de abajo en vez
   * de encima — sin este desplazamiento, dos piezas de madera sólidas (los
   * tacos) ocupan literalmente el mismo sitio, y por más que se reduzca la
   * altura, se ven solapadas. Se calcula de la geometría real (huecos
   * entre tablas del cubrir, y escuadrías de taco/rastrel — ver
   * crateToReference.ts). Hace falta en TODAS las uniones impares (no solo
   * las de cubrir): aunque la propia unión de cubrir no gane altura (ver
   * alturaGanadaCapiculadoMm=0), el desplazamiento sigue siendo necesario
   * para que la unión SIGUIENTE (taco-rastrel) tenga sitio.
   */
  desplazamientoCapiculadoMm?: number;
  /**
   * Por qué eje va el desplazamiento de arriba: false = por el largo (el
   * de siempre), true = por el ancho. Depende de cómo esté orientado el
   * cubrir — sus tablas ocupan un eje entero y se reparten por el otro, y
   * el desplazamiento va por el eje de reparto, no siempre el largo.
   */
  desplazamientoCapiculadoEjeAncho?: boolean;
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
  /** Copiado de Reference.altoUnidadMm (solo en packs completos — ver
   * lotCalculator.ts). Presente = `unidades` son piezas apilables sueltas
   * dentro de este mismo bulto, sobre las que el packer puede aplicar
   * capiculado interno (ver agruparEnPilas en packer.ts). */
  altoUnidadMm?: number;
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
  /**
   * Solo cuando `altoUnidadMm` está presente: índice global (0-based) de la
   * PRIMERA subunidad de este bulto dentro de la secuencia PLANA de toda la
   * pila — es decir, sin distinguir de qué fleje viene cada subunidad (ver
   * conversación: la alternancia capiculado es continua entre flejes). Su
   * paridad (par/impar) determina si la primera subunidad de este bulto
   * arranca "normal" o "invertida"; scene3d.ts sigue alternando desde ahí
   * para las siguientes `unidades - 1` subunidades del propio bulto.
   */
  subunidadGlobalInicial?: number;
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