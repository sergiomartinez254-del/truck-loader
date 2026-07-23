import type { CrateReference } from "./crateTypes";
import type { Reference } from "./types";
import { SIN_LIMITE_PESO_KG } from "./types";
import { bboxNativoCrate } from "./crateMeshes";
import { buildConfig, computePieces, type Cfg } from "./crateGeometry";
import { piezasABoxes } from "./crateNormalize";

/**
 * Una base de dobles bases (rastreles cruzados) solo se puede levantar con
 * la carretilla por el lado por donde entran las palas — girar la
 * construcción 90° la dejaría inaccesible, así que el packer no debe
 * probar la orientación girada. Con tacos, la carretilla puede levantarla
 * desde cualquier lado, así que se puede rotar libremente (comportamiento
 * de siempre). Se queda como "rotable" (true) si no hay información del
 * apoyo (referencia sin crateJson, o campo ausente).
 *
 * Excepción: con tacos de arrastre, la caja se puede empujar y arrastrar
 * por el suelo del camión — no hace falta levantarla con las palas, así
 * que tampoco hace falta que entren por un lado concreto, y es rotable
 * (cargable por la puerta trasera en cualquier orientación) aunque sea de
 * dobles bases. Los tiradores de hierro no son necesarios para esto (son
 * para tirar de la caja a mano, un caso de uso distinto).
 */
export function esRotable(crateJson: unknown): boolean {
  if (crateJson == null || typeof crateJson !== "object") return true;
  const cfg = crateJson as { apoyoType?: unknown; useTacosArrastre?: unknown };
  if (cfg.useTacosArrastre === true) return true;
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
function calcularGananciaCapiculado(crateJson: unknown, desmontado: boolean): { gananciaMm: number; desplazamientoMm: number; desplazamientoEjeAncho: boolean; cabeUnionAlterna: boolean } | undefined {
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
  //
  // El EJE del desplazamiento no es siempre el largo: cada tabla del
  // cubrir ocupa TODO un eje (su "orient") y se reparte a lo largo del
  // otro — si orient="largo" (la tabla es tan larga como la pieza), el
  // reparto (y por tanto el desplazamiento) va por el ANCHO; si
  // orient="ancho", va por el LARGO. Sin esto, un cubrir repartido a lo
  // ancho intentaba desplazarse en largo, que no tiene nada que ver con
  // dónde están de verdad los huecos entre tablas — el entrelazado no
  // llegaba a darse nunca.
  //
  // Antes de dar por buena la GANANCIA (no el desplazamiento — ver abajo),
  // hay que comprobar que el cubrir del palet invertido REALMENTE quepa
  // entrelazado: su primera tabla necesita un hueco libre, entre la 1ª y la
  // 2ª tabla del palet de abajo, de al menos su propio ancho — si no
  // (tablas muy juntas, o con posición manual que cierra ese hueco), la
  // tabla del invertido no puede colarse ahí y acaba apoyando PLANA encima
  // del cubrir de abajo: se pierde el grosor del cubrir como ganancia de
  // altura para ESTA unión. El desplazamiento en cambio SIGUE haciendo
  // falta aunque esta unión no gane nada: es lo que deja sitio para que la
  // unión siguiente (taco-rastrel, con el próximo palet) pueda colar sus
  // tacos sin chocar con los del palet invertido — sin ese hueco lateral,
  // el palet de abajo queda alineado con el de dos niveles más abajo y la
  // unión siguiente tampoco puede ganar nada.
  let desplazamientoMm = 0;
  let cabeElEntrelazado = true;
  let cabeUnionAlterna = true;
  let ejeAncho = false;
  try {
    const cfgCompleto = buildConfig(crateJson as Cfg);
    const piezas = computePieces(cfgCompleto);
    const tablasCubrir = piezas.filter((p) => p.layer === "cubrir-tabla" && (p as { center?: unknown }).center != null) as { center: number; ancho: number; orient?: string }[];
    // orient="largo" -> la tabla ocupa el largo entero -> se reparte a lo
    // ancho -> el desplazamiento va por el ancho. orient="ancho" (o
    // ausente) -> se reparte a lo largo, como el caso "de siempre".
    ejeAncho = tablasCubrir[0]?.orient === "largo";
    const centros = tablasCubrir.map((p) => p.center).sort((a, b) => a - b);
    if (centros.length >= 2) {
      const anchoTablaCm = tablasCubrir[0]?.ancho ?? 0;
      const claroPrimeroCm = (centros[1] - centros[0]) - anchoTablaCm;
      cabeElEntrelazado = claroPrimeroCm >= anchoTablaCm;

      const pasos = [];
      for (let i = 1; i < centros.length; i++) pasos.push(centros[i] - centros[i - 1]);
      const pasoMedioCm = pasos.reduce((s, p) => s + p, 0) / pasos.length;
      desplazamientoMm = Math.round((pasoMedioCm / 2) * 10);
    }

    const tacoPiezas = piezas.filter((p) => p.layer === "taco" && (p as { centerX?: unknown }).centerX != null) as { centerX: number; centerZ: number; largoPieza: number }[];
    const rastrelPiezas = piezas.filter((p) => p.layer === "rastrel" && (p as { center?: unknown }).center != null) as { center: number; ancho: number; orient?: string }[];
    const rastrelDistribuyeEnEjeAncho = rastrelPiezas[0]?.orient === "largo";

    const minShiftSinSolape = (
      fijas: { center: number; ancho: number }[],
      movidas: { center: number; ancho: number }[]
    ): number => {
      const n = Math.min(fijas.length, movidas.length);
      if (n === 0) return 0;
      let maxShiftCm = 0;
      for (let i = 0; i < n; i++) {
        const necesarioCm = (fijas[i].center - movidas[i].center) + (fijas[i].ancho + movidas[i].ancho) / 2;
        maxShiftCm = Math.max(maxShiftCm, necesarioCm);
      }
      return maxShiftCm;
    };
    const solapaSinRemedio = (a: { center: number; ancho: number }[], b: { center: number; ancho: number }[]): boolean => {
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) {
        const distancia = Math.abs(a[i].center - b[i].center);
        if (distancia < (a[i].ancho + b[i].ancho) / 2) return true;
      }
      return false;
    };
    const unaFilaPorEje = (piezas2D: { centerX: number; centerZ: number; largoPieza: number }[], porAncho: boolean) => {
      const proyectadas = piezas2D
        .map((p) => ({ center: porAncho ? p.centerZ : p.centerX, ancho: p.largoPieza }))
        .sort((a, b) => a.center - b.center);
      return proyectadas.filter((t, i) => proyectadas.findIndex((t2) => t2.center === t.center) === i);
    };

    // Comprueba taco-rastrel para UN eje dado (true=ancho, false=largo) —
    // se reutiliza para el eje del cubrir Y, si hace falta, para el otro.
    const comprobarEje = (porAncho: boolean): { shiftCm: number; seguro: boolean } => {
      const tacosEnEje = unaFilaPorEje(tacoPiezas, porAncho);
      const rastreles = rastrelPiezas.map((p) => ({ center: p.center, ancho: p.ancho })).sort((a, b) => a.center - b.center);
      if (rastreles.length === 0) {
        return { shiftCm: minShiftSinSolape(tacosEnEje, tacosEnEje), seguro: true };
      }
      if (rastrelDistribuyeEnEjeAncho === porAncho) {
        // Rastrel reparte por ESTE mismo eje: comparación directa válida.
        const shiftCm = Math.max(
          minShiftSinSolape(tacosEnEje, tacosEnEje),
          minShiftSinSolape(tacosEnEje, rastreles),
          minShiftSinSolape(rastreles, tacosEnEje)
        );
        return { shiftCm, seguro: true };
      }
      // Rastrel reparte por el OTRO eje: en este eje su .center no es
      // comparable (coordenadas de ejes distintos). Solo vale taco-taco
      // aquí; y hay que comprobar, en el eje perpendicular (el que este
      // desplazamiento NUNCA toca), si taco y rastrel chocan sin remedio.
      const tacosOtroEje = unaFilaPorEje(tacoPiezas, !porAncho);
      const seguro = !solapaSinRemedio(tacosOtroEje, rastreles);
      return { shiftCm: minShiftSinSolape(tacosEnEje, tacosEnEje), seguro };
    };

    const enEjeDelCubrir = comprobarEje(ejeAncho);
    cabeUnionAlterna = enEjeDelCubrir.seguro;
    if (enEjeDelCubrir.shiftCm > 0) {
      desplazamientoMm = Math.max(desplazamientoMm, Math.round(enEjeDelCubrir.shiftCm * 10));
    }

    // Si la unión de cubrir YA fracasó (claro insuficiente, cabeElEntrelazado
    // =false) y ADEMÁS el eje del cubrir no sirve para la unión alterna, el
    // eje ya no está "reservado" para el cubrir — no gana nada ahí de todas
    // formas. Probar el otro eje específicamente para taco-rastrel: si ahí
    // SÍ hay hueco, usarlo (mejor una unión funcionando que ninguna).
    if (!cabeElEntrelazado && !cabeUnionAlterna) {
      const enOtroEje = comprobarEje(!ejeAncho);
      if (enOtroEje.seguro) {
        ejeAncho = !ejeAncho;
        desplazamientoMm = Math.round(enOtroEje.shiftCm * 10);
        cabeUnionAlterna = true;
      }
    }
  } catch {
    // Si algo falla calculando la geometría, mejor sin desplazamiento (0)
    // que con uno mal aproximado — el capiculado seguiría dando la ganancia
    // de altura, solo sin desplazar.
  }

  if (!cabeElEntrelazado) return { gananciaMm: 0, desplazamientoMm, desplazamientoEjeAncho: ejeAncho, cabeUnionAlterna };
  return { gananciaMm: Math.round(cubrirGrosorCm * 10), desplazamientoMm, desplazamientoEjeAncho: ejeAncho, cabeUnionAlterna };
}

/**
 * Ganancia (mm) de la unión ALTERNA en un apilado capiculado de 3+ palets —
 * la que conecta el nivel invertido con el siguiente nivel normal (2ª-3ª,
 * 4ª-5ª...). Se calcula "dejando caer" la geometría nativa del palet (sin
 * voltear) sobre la del palet invertido — ya volteado y desplazado con el
 * eje/cantidad que decidió calcularGananciaCapiculado — y viendo en qué Z
 * topa de verdad con algo sólido (el máximo, entre todas las parejas de
 * piezas que se solapan en planta, de "techo de la pieza de abajo").
 *
 * Antes se aproximaba con "taco + rastrel" a secas, y esa suma es correcta
 * SOLO cuando el tablón no deja hueco en el eje del desplazamiento — pero
 * si el tablón también reparte por ese eje (puede pasar sobre todo con el
 * eje alterno, ver calcularGananciaCapiculado), el taco sigue bajando más
 * allá del rastrel y la aproximación se queda corta: el palet de arriba
 * quedaba "volando" un par de centímetros por encima de donde realmente
 * apoya. La simulación de caída no asume qué capa es la que sujeta, así
 * que vale igual haya o no hueco extra en el tablón (o en cualquier otra
 * capa).
 *
 * Mismas condiciones de entrada que la unión de cubrir (apoyoType "tacos",
 * useCapiculado activo, no desmontada), más useRastreles activo — sin
 * rastrel no hay capa pensada para apoyar esta unión.
 */
function calcularGananciaCapiculadoAlt(
  crateJson: unknown,
  desmontado: boolean,
  desplazamientoMm: number,
  desplazamientoEjeAncho: boolean
): number | undefined {
  if (desmontado || crateJson == null || typeof crateJson !== "object") return undefined;
  const cfg = crateJson as { apoyoType?: unknown; useCapiculado?: unknown; useRastreles?: unknown };
  if (cfg.apoyoType !== "tacos" || cfg.useCapiculado !== true || cfg.useRastreles !== true) return undefined;

  try {
    const cfgCompleto = buildConfig(crateJson as Cfg);
    const boxes = piezasABoxes(computePieces(cfgCompleto), cfgCompleto);
    if (boxes.length === 0) return undefined;
    const alturaCm = Math.max(...boxes.map((b) => b.y1));
    if (!(alturaCm > 0)) return undefined;

    const desplazamientoCm = desplazamientoMm / 10;
    const dx = desplazamientoEjeAncho ? 0 : desplazamientoCm;
    const dz = desplazamientoEjeAncho ? desplazamientoCm : 0;

    // Nivel invertido: volteado en Y (respecto a su propio techo) y
    // desplazado en el eje que haya tocado — mismo criterio que aplica
    // scene3d.ts al dibujar un nivel capiculado.
    const invertido = boxes.map((b) => ({
      x0: b.x0 + dx, x1: b.x1 + dx,
      y0: alturaCm - b.y1, y1: alturaCm - b.y0,
      z0: b.z0 + dz, z1: b.z1 + dz,
    }));

    // Deja caer la geometría nativa (sin voltear, sin desplazar — el nivel
    // de arriba, normal) sobre el nivel invertido: para cada pareja de
    // piezas que se solapan en planta (X,Z), la altura mínima a la que
    // puede apoyar la de arriba es el techo de la de abajo. El máximo de
    // esas alturas, en toda la pieza, es donde de verdad topa primero.
    let zApoyoCm = 0;
    for (const sup of boxes) {
      for (const inf of invertido) {
        const ox = Math.min(sup.x1, inf.x1) - Math.max(sup.x0, inf.x0);
        const oz = Math.min(sup.z1, inf.z1) - Math.max(sup.z0, inf.z0);
        if (ox > 1e-6 && oz > 1e-6) {
          const zNecesariaCm = inf.y1 - sup.y0;
          if (zNecesariaCm > zApoyoCm) zApoyoCm = zNecesariaCm;
        }
      }
    }
    // Ganancia = lo que se ahorra respecto a apilar plano (que dejaría el
    // nivel de arriba a alturaCm exactos por encima del invertido).
    const gananciaCm = alturaCm - zApoyoCm;
    if (!(gananciaCm > 0)) return undefined;
    return Math.round(gananciaCm * 10);
  } catch {
    return undefined;
  }
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
  /** Sustituye cr.unidadesPorPack para esta referencia — deja personalizar
   * cuántas unidades trae cada pack, en vez del número fijo que venía en
   * el JSON exportado. Aplica a CUALQUIER tipo (palet/caja/jaula, carga,
   * foam): el usuario tiene que poder ajustar el flejado — y, por tanto,
   * quitar/poner unidades individuales de una pila — para todas las
   * referencias, no solo las de tipo "carga". */
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
  // unidadesPorPackOverride también aplica aquí (antes solo tipo "carga" y
  // "foam" lo leían): el usuario tiene que poder ajustar cuántas unidades
  // sueltas forman un pack para CUALQUIER referencia, no solo las de carga
  // — es lo que luego deja quitar/poner unidades individuales de la pila
  // (cada pack se representa como un PalletInstance con tantas subunidades
  // como unidadesPorPack, ver lotCalculator.ts y agruparEnPilas en
  // packer.ts). Sin esto, cambiar el override no tenía ningún efecto en
  // estas referencias: el pack se seguía formando con el número fijo del
  // JSON, aunque el propio input de la UI mostrara otro valor.
  const unidadesPorPack = unidadesPorPackOverride ?? cr.unidadesPorPack;
  const packAltoMm = Math.round(altoUnidadMm * unidadesPorPack);
  const intercambiado = debeIntercambiarParaCamion(cr.crateJson);
  if (intercambiado) [largoMm, anchoMm] = [anchoMm, largoMm];
  const capiculado = calcularGananciaCapiculado(cr.crateJson, !!cr.desmontado);
  // Si el rastrel reparte en un eje distinto al del cubrir Y además choca
  // sin remedio con el taco en ESE eje (que nunca se desplaza, ver
  // calcularGananciaCapiculado), la unión taco-rastrel no es segura para
  // esta referencia — se desactiva del todo en vez de arriesgar una
  // colisión real que no se ve reflejada en el hueco reservado. Se le pasa
  // el eje/desplazamiento YA RESUELTOS (en el marco nativo, antes del
  // intercambio por dobles bases de aquí abajo) para que la simulación de
  // caída use exactamente el mismo desplazamiento que de verdad se aplica.
  const capiculadoAlt = capiculado?.cabeUnionAlterna === false
    ? undefined
    : calcularGananciaCapiculadoAlt(cr.crateJson, !!cr.desmontado, capiculado?.desplazamientoMm ?? 0, capiculado?.desplazamientoEjeAncho ?? false);
  // desplazamientoCapiculadoEjeAncho viene calculado en el marco NATIVO de
  // la geometría (largo/ancho tal como se diseñó) — si además hubo que
  // intercambiar largo/ancho para el camión (dobles bases), ese mismo
  // intercambio invierte qué eje es cuál también para el desplazamiento,
  // o quedaría desincronizado con palletType.largoMm/anchoMm de aquí abajo.
  const desplazamientoEjeAncho = capiculado
    ? (intercambiado ? !capiculado.desplazamientoEjeAncho : capiculado.desplazamientoEjeAncho)
    : false;
  return {
    id: cr.id, sku: cr.sku, nombre: cr.nombre,
    unidadesPorPalet: unidadesPorPack, loteMinimo: 1,
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
    desplazamientoCapiculadoEjeAncho: desplazamientoEjeAncho,
    alturaGanadaCapiculadoAltMm: capiculadoAlt,
    altoUnidadMm,
  };
}