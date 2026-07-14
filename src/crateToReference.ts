import type { CrateReference } from "./crateTypes";
import type { Reference } from "./types";
import { SIN_LIMITE_PESO_KG } from "./types";
import { bboxNativoCrate } from "./crateMeshes";
import { buildConfig, computePieces, type Cfg } from "./crateGeometry";

/**
 * Una base de dobles bases (rastreles cruzados) solo se puede levantar con
 * la carretilla por el lado por donde entran las palas — girar la
 * construcción 90° la dejaría inaccesible, así que el packer no debe
 * probar la orientación girada. Con tacos, la carretilla puede levantarla
 * desde cualquier lado, así que se puede rotar libremente (comportamiento
 * de siempre). Se queda como "rotable" (true) si no hay información del
 * apoyo (referencia sin crateJson, o campo ausente).
 *
 * Excepción: si además de la base lleva tacos de arrastre Y tiradores de
 * hierro, la caja se puede meter y sacar del camión empujándola y
 * arrastrándola por el suelo — no hace falta que entren las palas por un
 * lado concreto, así que es rotable aunque sea de dobles bases.
 */
export function esRotable(crateJson: unknown): boolean {
  if (crateJson == null || typeof crateJson !== "object") return true;
  const cfg = crateJson as { apoyoType?: unknown; useTacosArrastre?: unknown; useTiradores?: unknown };
  if (cfg.useTacosArrastre === true && cfg.useTiradores === true) return true;
  return cfg.apoyoType !== "dobleBase";
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

/**
 * Cuánta altura (mm) se gana al apilar en "capiculado" — un palet del
 * derecho, el siguiente del revés y desplazado, para que el cubrir de
 * ambos (tipo jaula, con tablas separadas) se entrelace en cremallera en
 * vez de apoyar uno encima del otro. Requiere: apoyoType "tacos" (por su
 * estructura de patas discretas), cubrirType "jaula" (sin huecos entre
 * tablas no hay cremallera posible, las dos caras chocarían de lleno) Y que
 * la propia referencia lo tenga marcado como admitido (useCapiculado en el
 * constructor).
 *
 * La ganancia es el GROSOR DEL CUBRIR (no la altura del taco): al
 * entrelazarse las dos capas de cubrir en el mismo hueco de altura, ya no
 * hace falta sumar el grosor de las dos por separado, solo el de una.
 *
 * El desplazamiento es MEDIO PASO entre tablas del cubrir (ancho de tabla +
 * separación), para que las tablas de la pieza volteada caigan justo en el
 * centro de los huecos de las tablas de la pieza de abajo.
 *
 * undefined si no aplica, o si viene desmontada (la geometría desmontada es
 * un apilado de paneles planos, sin cubrir de por medio en ese sentido).
 */
function calcularGananciaCapiculado(crateJson: unknown, desmontado: boolean): { gananciaMm: number; desplazamientoMm: number } | undefined {
  if (desmontado || crateJson == null || typeof crateJson !== "object") return undefined;
  const cfg = crateJson as { apoyoType?: unknown; useCapiculado?: unknown; cubrirType?: unknown; cubrirGrosor?: unknown };
  if (cfg.apoyoType !== "tacos" || cfg.useCapiculado !== true || cfg.cubrirType !== "jaula") return undefined;
  // La ganancia es el grosor de UNA capa de cubrir, no la altura del taco:
  // las dos capas de cubrir (tipo jaula) se entrelazan en cremallera y
  // comparten el mismo hueco en altura — antes había que sumar el grosor
  // de las DOS capas por separado, ahora solo "cuesta" el de una.
  const cubrirGrosorCm = typeof cfg.cubrirGrosor === "number" ? cfg.cubrirGrosor : Number(cfg.cubrirGrosor);
  if (!Number.isFinite(cubrirGrosorCm) || cubrirGrosorCm <= 0) return undefined;

  // El desplazamiento es MEDIO PASO real entre tablas del cubrir — "real"
  // porque separacionTablas es solo un MÁXIMO (calcCount/calcPositions
  // reparten las tablas uniformemente dentro de ese máximo, así que el
  // hueco de verdad suele ser algo menor). Se calcula directamente de la
  // geometría en vez de aproximar con tablaAnchoCubrir+separacionTablas,
  // que dejaba el desplazamiento un poco largo.
  let desplazamientoMm = 0;
  try {
    const cfgCompleto = buildConfig(crateJson as Cfg);
    const piezas = computePieces(cfgCompleto);
    const centros = piezas
      .filter((p) => p.layer === "cubrir-tabla" && (p as { center?: unknown }).center != null)
      .map((p) => (p as { center: number }).center)
      .sort((a, b) => a - b);
    if (centros.length >= 2) {
      const pasos = [];
      for (let i = 1; i < centros.length; i++) pasos.push(centros[i] - centros[i - 1]);
      const pasoMedioCm = pasos.reduce((s, p) => s + p, 0) / pasos.length;
      desplazamientoMm = Math.round((pasoMedioCm / 2) * 10);
    }
  } catch {
    // Si algo falla calculando la geometría, mejor sin desplazamiento (0)
    // que con uno mal aproximado — el capiculado seguiría dando la ganancia
    // de altura, solo sin desplazar en X.
  }

  return { gananciaMm: Math.round(cubrirGrosorCm * 10), desplazamientoMm };
}

export interface DisposicionCarga {
  /** Nº de columnas realmente usadas (puede ser menos que colsLargo×colsAncho si hay pocas unidades). */
  columnas: number;
  /** Tamaño de la rejilla: columnas a lo largo del palet (eje X) y a lo ancho (eje Z). */
  colsLargo: number;
  colsAncho: number;
  /** Si la pieza va girada 90° respecto a como viene en el JSON, para encajar más columnas. */
  girado: boolean;
  /** Altura de la columna más alta, en unidades — determina el alto del pack. */
  unidadesPorColumna: number;
}

/**
 * Reparte N unidades de una pieza (itemLargoMm × itemAnchoMm) en columnas
 * sobre la superficie del palet (palletLargoMm × palletAnchoMm), en vez de
 * apilarlas todas en una sola torre — para piezas que por sus medidas caben
 * varias veces en horizontal (p.ej. un barrote de 110×15 en un palet de
 * 120×80: caben 5 en el ancho, así que 50 unidades salen en 5 columnas de
 * 10, no en una torre de 50).
 *
 * Prueba las dos orientaciones (tal cual viene en el JSON y girada 90°) y
 * se queda con la que reparte en más columnas — así la torre resultante es
 * más baja. Si se indica columnasOverride, se usa esa cifra directamente
 * (fijada a mano), sin comparar orientaciones.
 */
export function calcularColumnasCarga(
  itemLargoMm: number, itemAnchoMm: number,
  palletLargoMm: number, palletAnchoMm: number,
  totalUnidades: number,
  columnasOverride?: number
): DisposicionCarga {
  // Cada orientación es válida solo si la pieza cabe AL MENOS una vez en
  // los dos ejes a la vez — si en algún eje no cabe ni una (p.ej. el largo
  // de la pieza es mayor que el del palet), esa orientación no reparte en
  // varias columnas: no forzar un mínimo de 1 por eje, o "no cabe" acabaría
  // contando como "cabe una vez" por error.
  const sinGirarCols = Math.floor(palletLargoMm / itemLargoMm);
  const sinGirarFilas = Math.floor(palletAnchoMm / itemAnchoMm);
  const sinGirarTotal = sinGirarCols * sinGirarFilas;
  const giradaCols = Math.floor(palletLargoMm / itemAnchoMm);
  const giradaFilas = Math.floor(palletAnchoMm / itemLargoMm);
  const giradaTotal = giradaCols * giradaFilas;

  let girado: boolean, colsLargo: number, colsAncho: number;
  if (sinGirarTotal <= 0 && giradaTotal <= 0) {
    // No cabe más de una vez en ningún sentido: una sola columna con todo,
    // como se hacía siempre (puede sobresalir del palet, como ya se permitía).
    // El override no tiene ningún eje sobre el que repartir en este caso.
    girado = false; colsLargo = 1; colsAncho = 1;
  } else {
    girado = giradaTotal > sinGirarTotal;
    colsLargo = girado ? giradaCols : sinGirarCols;
    colsAncho = girado ? giradaFilas : sinGirarFilas;
  }

  if (columnasOverride && columnasOverride > 0 && (colsLargo > 1 || colsAncho > 1)) {
    // Fijado a mano: se respeta la orientación y el eje que el cálculo
    // automático ya identificó como el que admite varias columnas (el
    // barrote seguirá repartiéndose A LO ANCHO, solo que ahora en 4
    // columnas en vez de 5) — lo único que cambia es CUÁNTAS entran en
    // ese eje, no en cuál de los dos ejes se reparten.
    const columnasDeseadas = Math.max(1, Math.round(columnasOverride));
    if (colsAncho >= colsLargo) { colsAncho = columnasDeseadas; colsLargo = 1; }
    else { colsLargo = columnasDeseadas; colsAncho = 1; }
  }

  const columnas = Math.max(1, Math.min(colsLargo * colsAncho, totalUnidades));
  return { columnas, colsLargo, colsAncho, girado, unidadesPorColumna: Math.ceil(totalUnidades / columnas) };
}

export function crateReferenceAReference(
  cr: CrateReference,
  refs: Map<string, CrateReference>,
  geom: Map<string, unknown>,
  /** Sustituye cr.unidadesPorPack para esta referencia (solo tiene efecto
   * en tipo "carga") — deja personalizar cuántas unidades trae cada pack,
   * en vez del número fijo que venía en el JSON exportado. */
  unidadesPorPackOverride?: number,
  /** Fuerza el nº de columnas en las que se reparten las unidades sobre el
   * palet (solo tipo "carga") en vez del cálculo automático por medidas. */
  columnasOverride?: number
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
    const disposicion = calcularColumnasCarga(cr.largoMm, cr.anchoMm, basePaletLargoMm, basePaletAnchoMm, unidadesPorPack, columnasOverride);

    // Exterior = max por eje (palet vs lámina); alto = palet + altura de la
    // columna más alta (no de la torre completa: con varias columnas, cada
    // una lleva solo una parte de las unidades).
    let largoMm = Math.max(basePaletLargoMm, cr.largoMm);
    let anchoMm = Math.max(basePaletAnchoMm, cr.anchoMm);
    const packAltoMm = Math.round(basePaletAltoMm + cr.altoUnidadMm * disposicion.unidadesPorColumna);

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

  // Caso FOAM: la referencia es el foam en sí, pero no se dibuja ningún
  // foam — se dibuja la CAJA que lo contiene (su propia geometría, ya
  // incluida en cr.crateJson — se diseña en el constructor exactamente
  // igual que una caja normal, solo que se exporta como "foam" con el
  // número de foams que le caben dentro). unidadesPorPack aquí es "foams
  // por caja" — el reparto en packs completos + uno parcial
  // (generarPaletsDeLinea) hace el resto: N foams -> ceil(N/foamsPorCaja)
  // cajas. La caja NUNCA encoge para el pack parcial (alturaFija) — su
  // tamaño exterior es el mismo la lleves llena o a medias.
  if (cr.tipo === "foam") {
    if (!cr.crateJson) {
      throw new Error(`El foam ${cr.sku} no tiene geometría (crateJson vacío) — expórtalo diseñando la caja como siempre.`);
    }
    const bb = bboxNativoCrate(cr.crateJson as Cfg);    // cm
    let largoMm = Math.round(bb.largo * 10);
    let anchoMm = Math.round(bb.ancho * 10);
    const altoMm = Math.round(bb.alto * 10);
    const foamsPorCaja = unidadesPorPackOverride ?? cr.unidadesPorPack;

    if (debeIntercambiarParaCamion(cr.crateJson)) [largoMm, anchoMm] = [anchoMm, largoMm];

    return {
      id: cr.id, sku: cr.sku, nombre: cr.nombre,
      unidadesPorPalet: foamsPorCaja, loteMinimo: 1,
      apilable: cr.apilable,
      palletType: {
        id: `pt-${cr.id}`, nombre: `Bulto ${cr.sku}`,
        largoMm, anchoMm, alturaBaseMm: 0,
        pesoMaxKg: cr.pesoMaxApilableKg ?? SIN_LIMITE_PESO_KG, pesoTaraKg: 0,
      },
      pesoUnitarioKg: cr.pesoUnidadKg,     // peso por FOAM individual
      alturaPaletCompletoMm: altoMm,       // alto de la caja, fijo
      rotable: esRotable(cr.crateJson),
      alturaFija: true,
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
  const capiculado = calcularGananciaCapiculado(cr.crateJson, !!cr.desmontado);
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
    alturaGanadaCapiculadoMm: capiculado?.gananciaMm,
    desplazamientoCapiculadoMm: capiculado?.desplazamientoMm,
  };
}