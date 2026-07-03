// ============================================================================
// crateGeometry.ts — Geometría de una caja a partir del JSON del constructor
// ============================================================================
// Port de `computePieces` del constructor + la derivación `estado crudo → config`
// que el componente hace en su cuerpo. El envoltorio guarda el estado CRUDO
// (serializeState), no el config derivado; por eso hace falta `buildConfig`.
//
// Uso: computePiecesFromState(crateJson) → Piece[]
// Ejes: X = largo, Y = alto (suelo en y=0), Z = ancho. Centrado en X/Z.
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Cfg = Record<string, any>;
export type Piece = Record<string, any>;

// ─── Helpers de distribución (idénticos al constructor) ─────────────────────
function calcCount(dim: number, claroMax: number, margin: number, pieceWidth: number): number {
  const pw = pieceWidth || 0;
  const firstCenter = margin + pw / 2;
  const lastCenter = dim - margin - pw / 2;
  const span = lastCenter - firstCenter;
  if (span <= 0) return 2;
  const maxCenterSpacing = claroMax + pw;
  if (span <= maxCenterSpacing) return 2;
  return Math.ceil(span / maxCenterSpacing) + 1;
}

function calcPositions(dim: number, count: number, margin: number, pieceWidth: number): number[] {
  const pw = pieceWidth || 0;
  const firstCenter = margin + pw / 2;
  const lastCenter = dim - margin - pw / 2;
  if (count <= 1) return [firstCenter];
  if (count === 2) return [firstCenter, lastCenter];
  const pos = [firstCenter];
  const span = lastCenter - firstCenter;
  const sp = span / (count - 1);
  for (let i = 1; i < count - 1; i++) pos.push(firstCenter + sp * i);
  pos.push(lastCenter);
  return pos;
}

const flip = (o: string) => (o === "largo" ? "ancho" : "largo");

const solveInclinada = (G: number, H: number, W: number): { L: number; a: number } => {
  if (G <= 0 || H <= 0 || W <= 0) return { L: 0, a: 0 };
  let lo = 0.001, hi = Math.PI / 2 - 0.001;
  let a = 0, L = 0;
  for (let i = 0; i < 60; i++) {
    a = (lo + hi) / 2;
    L = (G - W * Math.cos(a)) / Math.sin(a);
    const Hc = L * Math.cos(a) + W * Math.sin(a);
    if (Hc > H) lo = a; else hi = a;
  }
  return { L: Math.max(0, L), a };
};

// ─── Derivación estado crudo → config (réplica del cuerpo del componente) ───
// El componente calcula un objeto `config` a partir de los estados. computePieces
// consume ESE objeto. Aquí lo reproducimos desde el JSON crudo del envoltorio.
export function buildConfig(s: Cfg): Cfg {
  const g = <T,>(v: T | undefined, def: T): T => (v === undefined ? def : v);

  // Estados con defaults (por si un JSON viejo no trae algún campo).
  const largo = g(s.largo, 200), ancho = g(s.ancho, 120), alto = g(s.alto, 50);
  const dimMode = g(s.dimMode, "interior");
  const apoyoType = g(s.apoyoType, "dobleBase");
  const dbOrient = g(s.dbOrient, "ancho");
  const tablonOrientUser = g(s.tablonOrientUser, "largo");
  const rastrelOrient = g(s.rastrelOrient, "largo");
  const recuadroMode = g(s.recuadroMode, "none");

  const useTablones = g(s.useTablones, true);
  const useRastreles = g(s.useRastreles, false);
  const useIntermedias = g(s.useIntermedias, false);
  const useOrillas = g(s.useOrillas, false);
  const orillaOrient = g(s.orillaOrient, "ancho");
  const orillaAncho = g(s.orillaAncho, 10);

  const useLados = g(s.useLados, false);
  const useTesteros = g(s.useTesteros, false);
  const useTapa = g(s.useTapa, false);
  const ladoCubrirType = g(s.ladoCubrirType, "contrachapado");
  const testeroCubrirType = g(s.testeroCubrirType, "contrachapado");
  const ladoGrosor = g(s.ladoGrosor, 0.9), testeroGrosor = g(s.testeroGrosor, 0.9);

  const useLlapasasLado = g(s.useLlapasasLado, false);
  const llapLadoOrient = g(s.llapLadoOrient, "largo");
  const llapLadoGrosor = g(s.llapLadoGrosor, 1.8);
  const llapLadoPosicion = g(s.llapLadoPosicion, "exterior");
  const useLlapInclinadaLado = g(s.useLlapInclinadaLado, false);
  const useRecuadrosLado = g(s.useRecuadrosLado, false);

  const useLlapasasTestero = g(s.useLlapasasTestero, false);
  const llapTesteroOrient = g(s.llapTesteroOrient, "largo");
  const llapTesteroGrosor = g(s.llapTesteroGrosor, 1.8);
  const llapTesteroPosicion = g(s.llapTesteroPosicion, "exterior");
  const useLlapInclinadaTestero = g(s.useLlapInclinadaTestero, false);
  const useRecuadrosTestero = g(s.useRecuadrosTestero, false);

  const useLlapasasTapa = g(s.useLlapasasTapa, false);
  const llapTapaPosicion = g(s.llapTapaPosicion, "exterior");
  const llapTapaGrosor = g(s.llapTapaGrosor, 1.8);
  const useRecuadrosTapa = g(s.useRecuadrosTapa, false);

  const splitApoyoLado = g(s.splitApoyoLado, false);
  const splitApoyoTestero = g(s.splitApoyoTestero, false);
  const apoyoLado = g(s.apoyoLado, "cubrir");
  const apoyoTestero = g(s.apoyoTestero, "cubrir");
  const apoyoLadoLlap = g(s.apoyoLadoLlap, "cubrir");
  const apoyoTesteroLlap = g(s.apoyoTesteroLlap, "cubrir");

  const useTacosArrastre = g(s.useTacosArrastre, false);
  const useTapabocaFrontal = g(s.useTapabocaFrontal, false);
  const useTapabocaTrasero = g(s.useTapabocaTrasero, false);
  const useTapabocaIzquierda = g(s.useTapabocaIzquierda, false);
  const useTapabocaDerecha = g(s.useTapabocaDerecha, false);
  const tapabocaGrosor = g(s.tapabocaGrosor, 1.8);

  const usePuntales = g(s.usePuntales, false);
  const useBarrotesRef = g(s.useBarrotesRef, false);
  const useCuadradillos = g(s.useCuadradillos, false);

  // ── Orientaciones derivadas ──
  const tablonOrient = apoyoType === "dobleBase" ? flip(dbOrient) : tablonOrientUser;
  const apoyoOrient = apoyoType === "dobleBase" ? dbOrient : null;
  const cubrirOrient = useTablones ? flip(tablonOrient) : (apoyoOrient ? flip(apoyoOrient) : "largo");
  const effectiveRecuadroMode = useTablones ? recuadroMode : "none";
  const effectiveUseIntermedias = apoyoType === "tacos" && useTablones && useIntermedias;
  const effectiveRastrelOrient = apoyoType === "dobleBase" ? flip(dbOrient) : rastrelOrient;

  const llapLadoExt = (useLados && useLlapasasLado && llapLadoPosicion === "exterior") ? llapLadoGrosor : 0;
  const llapTesteroExt = (useTesteros && useLlapasasTestero && llapTesteroPosicion === "exterior") ? llapTesteroGrosor : 0;

  // ── Apoyos validados ──
  const validApoyoLado = (() => {
    if (useOrillas && useTablones && apoyoLado === "cubrir") return "tablon";
    if (apoyoLado === "tablon" && !useTablones) return "cubrir";
    if (apoyoLado === "intermedia" && !effectiveUseIntermedias) return "cubrir";
    if (apoyoLado === "rastrel" && !useRastreles) return "cubrir";
    return apoyoLado;
  })();
  const validApoyoTestero = (() => {
    if (useOrillas && useTablones && apoyoTestero === "cubrir") return "tablon";
    if (apoyoTestero === "tablon" && !useTablones) return "cubrir";
    if (apoyoTestero === "intermedia" && !effectiveUseIntermedias) return "cubrir";
    if (apoyoTestero === "rastrel" && !useRastreles) return "cubrir";
    return apoyoTestero;
  })();
  const canSplitLado = useLados && useLlapasasLado && llapLadoOrient === "alto" && ladoCubrirType !== "contrachapado";
  const canSplitTestero = useTesteros && useLlapasasTestero && llapTesteroOrient === "alto" && testeroCubrirType !== "contrachapado";
  const validApoyoLadoLlap = canSplitLado && splitApoyoLado ? (() => {
    if (apoyoLadoLlap === "tablon" && !useTablones) return "cubrir";
    if (apoyoLadoLlap === "intermedia" && !effectiveUseIntermedias) return "cubrir";
    if (apoyoLadoLlap === "rastrel" && !useRastreles) return "cubrir";
    return apoyoLadoLlap;
  })() : validApoyoLado;
  const validApoyoTesteroLlap = canSplitTestero && splitApoyoTestero ? (() => {
    if (apoyoTesteroLlap === "tablon" && !useTablones) return "cubrir";
    if (apoyoTesteroLlap === "intermedia" && !effectiveUseIntermedias) return "cubrir";
    if (apoyoTesteroLlap === "rastrel" && !useRastreles) return "cubrir";
    return apoyoTesteroLlap;
  })() : validApoyoTestero;

  // ── Conversión interior/exterior (para obtener el interior real) ──
  const wallDeltaAncho = useLados ? 2 * (ladoGrosor + llapLadoExt) : 0;
  const wallDeltaLargo = useTesteros ? 2 * (testeroGrosor + llapTesteroExt) : 0;
  const llapIntAncho = (useLados && useLlapasasLado && llapLadoPosicion === "interior") ? 2 * llapLadoGrosor : 0;
  const llapIntLargo = (useTesteros && useLlapasasTestero && llapTesteroPosicion === "interior") ? 2 * llapTesteroGrosor : 0;
  const llapIntAlto = (useTapa && useLlapasasTapa && llapTapaPosicion === "interior") ? llapTapaGrosor : 0;
  const orillaDeltaLargo = useOrillas && orillaOrient === "ancho" ? 2 * orillaAncho : 0;
  const orillaDeltaAncho = useOrillas && orillaOrient === "largo" ? 2 * orillaAncho : 0;
  const tapabocaActivos = apoyoType === "tacos" && useRastreles;
  const tapabocaDeltaLargo = tapabocaActivos
    ? ((useTapabocaIzquierda ? tapabocaGrosor : 0) + (useTapabocaDerecha ? tapabocaGrosor : 0)) : 0;
  const tapabocaDeltaAncho = tapabocaActivos
    ? ((useTapabocaFrontal ? tapabocaGrosor : 0) + (useTapabocaTrasero ? tapabocaGrosor : 0)) : 0;
  const totalDeltaLargo = wallDeltaLargo + orillaDeltaLargo + tapabocaDeltaLargo;
  const totalDeltaAncho = wallDeltaAncho + orillaDeltaAncho + tapabocaDeltaAncho;

  let interiorLargo: number, interiorAncho: number;
  if (dimMode === "interior") {
    interiorLargo = largo; interiorAncho = ancho;
  } else {
    interiorLargo = largo - llapIntLargo - totalDeltaLargo;
    interiorAncho = ancho - llapIntAncho - totalDeltaAncho;
  }

  // ── Objeto config final (exactamente el que consume computePieces) ──
  return {
    largo: interiorLargo + llapIntLargo, ancho: interiorAncho + llapIntAncho, alto: alto + llapIntAlto,
    apoyoType, cubrirType: g(s.cubrirType, "caja"), cubrirGrosor: g(s.cubrirGrosor, 2),
    tablaAnchoCubrir: g(s.tablaAnchoCubrir, 10), separacionTablas: g(s.separacionTablas, 15),
    dobleBaseAncho: g(s.dobleBaseAncho, 10), dobleBaseAlto: g(s.dobleBaseAlto, 7),
    distOrillas: g(s.distOrillas, 40), dbOrient, claroMax: g(s.claroMax, 125),
    tacoLargo: g(s.tacoLargo, 10), tacoAncho: g(s.tacoAncho, 10), tacoAlto: g(s.tacoAlto, 10),
    tacoClaroMaxLargo: g(s.tacoClaroMaxLargo, 65), tacoArrastreAncho: g(s.tacoArrastreAncho, 0),
    useTablones, tablonAncho: g(s.tablonAncho, 10), tablonAlto: g(s.tablonAlto, 4.5),
    tablonOrient, tablonClaroMax: g(s.tablonClaroMax, 60), cubrirOrient,
    useIntermedias: effectiveUseIntermedias, intermediaAncho: g(s.intermediaAncho, 10), intermediaAlto: g(s.intermediaAlto, 2),
    useRastreles, rastrelAncho: g(s.rastrelAncho, 10), rastrelAlto: g(s.rastrelAlto, 2), rastrelOrient: effectiveRastrelOrient,
    useOrillas, orillaAncho, orillaAlto: g(s.orillaAlto, 10), orillaOrient,
    useTapabocaFrontal, useTapabocaTrasero, useTapabocaIzquierda, useTapabocaDerecha,
    tapabocaGrosor, tapabocaMargen: g(s.tapabocaMargen, 2),
    recuadroMode: effectiveRecuadroMode,
    useTacosArrastre: useTablones && useTacosArrastre, tacoArrastreLargo: g(s.tacoArrastreLargo, 40), tacoArrastreChaflan: g(s.tacoArrastreChaflan, 5),
    useLados, ladoCubrirType, ladoGrosor, ladoTablaAncho: g(s.ladoTablaAncho, 10), ladoSeparacion: g(s.ladoSeparacion, 15),
    useTesteros, testeroCubrirType, testeroGrosor, testeroTablaAncho: g(s.testeroTablaAncho, 10), testeroSeparacion: g(s.testeroSeparacion, 15),
    useTapa, tapaCubrirType: g(s.tapaCubrirType, "contrachapado"), tapaGrosor: g(s.tapaGrosor, 0.9),
    tapaTablaAncho: g(s.tapaTablaAncho, 10), tapaSeparacion: g(s.tapaSeparacion, 15), tapaCubrirOrient: g(s.tapaCubrirOrient, "largo"),
    caraDominante: g(s.caraDominante, "lado"), cargamento: g(s.cargamento, "none"),
    apoyoLado: validApoyoLado, apoyoTestero: validApoyoTestero,
    apoyoLadoLlap: validApoyoLadoLlap, apoyoTesteroLlap: validApoyoTesteroLlap,
    useLlapasasLado: useLados && useLlapasasLado, llapLadoOrient, llapLadoAncho: g(s.llapLadoAncho, 8), llapLadoGrosor,
    llapLadoClaro: g(s.llapLadoClaro, 65), llapLadoPosicion,
    useLlapInclinadaLado: useLados && useLlapasasLado && useLlapInclinadaLado && !useRecuadrosLado,
    useRecuadrosLado: useLados && useLlapasasLado && useRecuadrosLado && !useLlapInclinadaLado, recuadroLadoClaro: g(s.recuadroLadoClaro, 65),
    useLlapasasTestero: useTesteros && useLlapasasTestero, llapTesteroOrient, llapTesteroAncho: g(s.llapTesteroAncho, 8), llapTesteroGrosor,
    llapTesteroClaro: g(s.llapTesteroClaro, 65), llapTesteroPosicion,
    useLlapInclinadaTestero: useTesteros && useLlapasasTestero && useLlapInclinadaTestero && !useRecuadrosTestero,
    useRecuadrosTestero: useTesteros && useLlapasasTestero && useRecuadrosTestero && !useLlapInclinadaTestero, recuadroTesteroClaro: g(s.recuadroTesteroClaro, 65),
    useLlapasasTapa: useTapa && useLlapasasTapa,
    useRecuadrosTapa: useTapa && useLlapasasTapa && useRecuadrosTapa, recuadroTapaClaro: g(s.recuadroTapaClaro, 65),
    llapTapaOrient: g(s.llapTapaOrient, "largo"), llapTapaAncho: g(s.llapTapaAncho, 8), llapTapaGrosor, llapTapaPosicion,
    llapIntLargo, llapIntAncho, llapIntAlto,
    llapInclinadaLadoCount: g(s.llapInclinadaLadoCount, 2), llapInclinadaTesteroCount: g(s.llapInclinadaTesteroCount, 2),
    llapLadoAltura: g(s.llapLadoAltura, "estandar"), llapTesteroAltura: g(s.llapTesteroAltura, "estandar"),
    overrides: g(s.overrides, {}),
    useCuadradillos, cuadradilloAncho: g(s.cuadradilloAncho, 10), cuadradilloGrosor: g(s.cuadradilloGrosor, 10), cuadradilloClaro: g(s.cuadradilloClaro, 65),
    usePuntales: usePuntales && useLados && apoyoType === "dobleBase" && dbOrient === "ancho", puntalAncho: g(s.puntalAncho, 10), puntalGrosor: g(s.puntalGrosor, 4.5),
    useBarrotesRef: useBarrotesRef && useTesteros && useLlapasasLado && llapLadoOrient === "largo", barroteRefAncho: g(s.barroteRefAncho, 10), barroteRefGrosor: g(s.barroteRefGrosor, 4.5),
  };
}

// ─── computePieces (port verbatim del constructor) ──────────────────────────
export function computePieces(cfg: Cfg): Piece[] {
  const {
    largo, ancho, alto, apoyoType, cubrirType, cubrirGrosor, tablaAnchoCubrir, separacionTablas,
    dobleBaseAncho, dobleBaseAlto, distOrillas, dbOrient, claroMax,
    tacoLargo, tacoAncho, tacoAlto, tacoClaroMaxLargo,
    useTablones, tablonAncho, tablonAlto, tablonOrient, tablonClaroMax, cubrirOrient,
    useIntermedias, intermediaAncho, intermediaAlto,
    useRastreles, rastrelAncho, rastrelAlto, rastrelOrient,
    useOrillas, orillaAncho, orillaAlto, orillaOrient,
    recuadroMode,
    useLados, ladoCubrirType, ladoGrosor, ladoTablaAncho, ladoSeparacion,
    useTesteros, testeroCubrirType, testeroGrosor, testeroTablaAncho, testeroSeparacion,
    useTapa, tapaCubrirType, tapaGrosor, tapaTablaAncho, tapaSeparacion, tapaCubrirOrient,
    caraDominante, cargamento, apoyoLado, apoyoTestero,
    apoyoLadoLlap, apoyoTesteroLlap,
    useLlapasasLado, llapLadoOrient, llapLadoAncho, llapLadoGrosor, llapLadoClaro, llapLadoPosicion, useLlapInclinadaLado, useRecuadrosLado, recuadroLadoClaro,
    useLlapasasTestero, llapTesteroOrient, llapTesteroAncho, llapTesteroGrosor, llapTesteroClaro, llapTesteroPosicion, useLlapInclinadaTestero, useRecuadrosTestero, recuadroTesteroClaro,
    useLlapasasTapa, llapTapaOrient, llapTapaAncho, llapTapaGrosor, llapTapaClaro, llapTapaPosicion, useRecuadrosTapa, recuadroTapaClaro,
    llapIntLargo = 0, llapIntAncho = 0, llapIntAlto = 0, llapInclinadaLadoCount = 2, llapInclinadaTesteroCount = 2, llapLadoAltura = "estandar", llapTesteroAltura = "estandar",
    overrides = {}, useTacosArrastre = false, tacoArrastreLargo = 40, tacoArrastreChaflan = 5, tacoArrastreAncho = 0,
    useCuadradillos = false, cuadradilloAncho = 10, cuadradilloGrosor = 10, cuadradilloClaro = 65, useTapabocaFrontal = false, useTapabocaTrasero = false,
    useTapabocaIzquierda = false, useTapabocaDerecha = false,
    tapabocaGrosor = 1.8, tapabocaMargen = 2,
    usePuntales = false, puntalAncho = 10, puntalGrosor = 4.5,
    useBarrotesRef = false, barroteRefAncho = 10, barroteRefGrosor = 4.5,
  } = cfg;

  const pieces: Piece[] = [];
  let currentY = 0;

  const apoyoThreshold = (apoyo: string) => {
    if (apoyo === "cubrir") return 4;
    if (apoyo === "tablon") return 3;
    if (apoyo === "intermedia") return 2;
    if (apoyo === "apoyo") return 1;
    if (apoyo === "rastrel") return 0;
    if (apoyo === "suelo") return -1;
    return 4;
  };

  const ladoThreshold = useLados ? apoyoThreshold(apoyoLado) : -1;
  const testeroThreshold = useTesteros ? apoyoThreshold(apoyoTestero) : -1;
  const ladoLlapThreshold = useLados ? apoyoThreshold(apoyoLadoLlap || apoyoLado) : -1;
  const testeroLlapThreshold = useTesteros ? apoyoThreshold(apoyoTesteroLlap || apoyoTestero) : -1;

  const llapLadoExt = (useLlapasasLado && llapLadoPosicion === "exterior") ? llapLadoGrosor : 0;
  const llapTesteroExt = (useLlapasasTestero && llapTesteroPosicion === "exterior") ? llapTesteroGrosor : 0;
  const llapLadoSplitExt = useLlapasasLado ? llapLadoGrosor : 0;
  const llapTesteroSplitExt = useLlapasasTestero ? llapTesteroGrosor : 0;

  const orillaExtLargo = useOrillas && orillaOrient === "ancho" ? 2 * orillaAncho : 0;
  const orillaExtAncho = useOrillas && orillaOrient === "largo" ? 2 * orillaAncho : 0;
  const orillaSupportIdx = useTablones ? 3 : 4;

  const baseLargo = largo + orillaExtLargo;
  const baseAncho = ancho + orillaExtAncho;

  const layerAncho = (layerIdx: number) => {
    const cubrirReaches = ladoThreshold >= 0 && layerIdx <= ladoThreshold;
    const llapReaches = ladoLlapThreshold >= 0 && layerIdx <= ladoLlapThreshold;
    let ext = 0;
    if (cubrirReaches && llapReaches) ext = 2 * (ladoGrosor + llapLadoExt);
    else if (cubrirReaches) ext = 2 * ladoGrosor;
    else if (llapReaches) ext = 2 * llapLadoSplitExt;
    if (useOrillas && useTablones && layerIdx === 4) ext = 0;
    return ancho + (layerIdx <= orillaSupportIdx ? orillaExtAncho : 0) + ext;
  };
  const layerLargo = (layerIdx: number) => {
    const cubrirReaches = testeroThreshold >= 0 && layerIdx <= testeroThreshold;
    const llapReaches = testeroLlapThreshold >= 0 && layerIdx <= testeroLlapThreshold;
    let ext = 0;
    if (cubrirReaches && llapReaches) ext = 2 * (testeroGrosor + llapTesteroExt);
    else if (cubrirReaches) ext = 2 * testeroGrosor;
    else if (llapReaches) ext = 2 * llapTesteroSplitExt;
    if (useOrillas && useTablones && layerIdx === 4) ext = 0;
    return largo + (layerIdx <= orillaSupportIdx ? orillaExtLargo : 0) + ext;
  };

  // ── Layer 0: Rastreles ──
  if (useRastreles) {
    const rLargo0 = layerLargo(0);
    const rAncho0 = layerAncho(0);
    const rDistDim = rastrelOrient === "largo" ? rAncho0 : rLargo0;

    let rRunDim: number, rRunStart: number;
    if (apoyoType === "dobleBase") {
      const dbLargoForRastrel = layerLargo(1);
      const dbAnchoForRastrel = layerAncho(1);
      const dbDistDim = dbOrient === "ancho" ? dbLargoForRastrel : dbAnchoForRastrel;
      rRunDim = dbDistDim - 2 * distOrillas;
      rRunStart = distOrillas;
    } else {
      rRunDim = rastrelOrient === "largo" ? rLargo0 : rAncho0;
      rRunStart = 0;
    }

    let rClaroMax: number;
    if (apoyoType === "dobleBase") {
      rClaroMax = rastrelOrient === "largo" ? tablonClaroMax : (dbOrient === "ancho" ? claroMax : tablonClaroMax);
    } else {
      if (rastrelOrient === "largo") rClaroMax = tablonOrient === "ancho" ? tacoClaroMaxLargo : tablonClaroMax;
      else rClaroMax = tablonOrient === "ancho" ? tablonClaroMax : tacoClaroMaxLargo;
    }

    const rCount = calcCount(rDistDim, rClaroMax, 0, rastrelAncho);
    const rPositions = calcPositions(rDistDim, rCount, 0, rastrelAncho);

    for (let i = 0; i < rPositions.length; i++) {
      const id = `rastrel-${i}`;
      const ov = overrides[id] || {};
      pieces.push({
        id, layer: "rastrel", index: i,
        center: ov.center ?? rPositions[i],
        ancho: ov.ancho ?? rastrelAncho,
        alto: ov.alto ?? rastrelAlto,
        largoPieza: ov.largo ?? rRunDim,
        runStart: ov.runStart ?? rRunStart,
        orient: rastrelOrient, distDim: rDistDim,
        layerLargo: rLargo0, layerAncho: rAncho0,
        y: currentY, total: rPositions.length,
      });
    }
    currentY += Math.max(...pieces.filter(p => p.layer === "rastrel").map(p => p.alto));
  }
  const rastrelTopY = currentY;

  // ── Layer 1: Apoyo ──
  const L1_largo = layerLargo(1);
  const L1_ancho = layerAncho(1);
  if (apoyoType === "dobleBase") {
    const dbRunDim = dbOrient === "ancho" ? L1_ancho : L1_largo;
    const dbDistDim = dbOrient === "ancho" ? L1_largo : L1_ancho;
    const count = calcCount(dbDistDim, claroMax, distOrillas, dobleBaseAncho);
    const positions = calcPositions(dbDistDim, count, distOrillas, dobleBaseAncho);
    for (let i = 0; i < positions.length; i++) {
      const id = `db-${i}`;
      const ov = overrides[id] || {};
      const center = ov.center ?? positions[i];
      const w = ov.ancho ?? dobleBaseAncho;
      const h = ov.alto ?? dobleBaseAlto;
      const l = ov.largo ?? dbRunDim;
      pieces.push({ id, layer: "db", index: i, center, ancho: w, alto: h, largoPieza: l,
        orient: dbOrient, distDim: dbDistDim, layerLargo: L1_largo, layerAncho: L1_ancho,
        y: currentY, total: positions.length });
    }
    currentY += Math.max(...pieces.filter(p => p.layer === "db").map(p => p.alto));
  } else {
    const tacoLargoClaroMax = tablonOrient === "ancho" ? tablonClaroMax : tacoClaroMaxLargo;
    const tacoAnchoClaroMax = tablonOrient === "ancho" ? tacoClaroMaxLargo : tablonClaroMax;
    const countLargo = calcCount(L1_largo, tacoLargoClaroMax, 0, tacoLargo);
    const countAncho = calcCount(L1_ancho, tacoAnchoClaroMax, 0, tacoAncho);
    const posLargo = calcPositions(L1_largo, countLargo, 0, tacoLargo);
    const posAncho = calcPositions(L1_ancho, countAncho, 0, tacoAncho);

    for (let i = 0; i < posLargo.length; i++) {
      for (let j = 0; j < posAncho.length; j++) {
        const id = `taco-${i}-${j}`;
        const ov = overrides[id] || {};
        pieces.push({
          id, layer: "taco", i, j,
          centerX: ov.centerX ?? posLargo[i],
          centerZ: ov.centerZ ?? posAncho[j],
          largoPieza: ov.largo ?? tacoLargo,
          ancho: ov.ancho ?? tacoAncho,
          alto: ov.alto ?? tacoAlto,
          layerLargo: L1_largo, layerAncho: L1_ancho,
          y: currentY,
        });
      }
    }
    currentY += Math.max(...pieces.filter(p => p.layer === "taco").map(p => p.alto));
  }
  const apoyoTopY = currentY;

  // ── Tapabocas ──
  if (useRastreles && apoyoType === "tacos" &&
      (useTapabocaFrontal || useTapabocaTrasero || useTapabocaIzquierda || useTapabocaDerecha)) {
    const tacosTB = pieces.filter(p => p.layer === "taco");
    if (tacosTB.length) {
      const minCX = Math.min(...tacosTB.map(t => t.centerX));
      const maxCX = Math.max(...tacosTB.map(t => t.centerX));
      const minCZ = Math.min(...tacosTB.map(t => t.centerZ));
      const maxCZ = Math.max(...tacosTB.map(t => t.centerZ));
      const tLargoX = tacoLargo;
      const tAnchoZ = tacoAncho;
      const M = tapabocaMargen;
      const G = tapabocaGrosor;
      const tbY = rastrelTopY;
      const tbAlto = tacoAlto;

      const outMinX = minCX - tLargoX / 2;
      const outMaxX = maxCX + tLargoX / 2;
      const outMinZ = minCZ - tAnchoZ / 2;
      const outMaxZ = maxCZ + tAnchoZ / 2;

      const runX = (outMaxX - outMinX) - 2 * M;
      const runZ = (outMaxZ - outMinZ) - 2 * M;
      const midX = (outMinX + outMaxX) / 2;
      const midZ = (outMinZ + outMaxZ) / 2;

      if (useTapabocaFrontal && runX > 0.5) {
        const id = "tapaboca-frontal"; const ov = overrides[id] || {};
        pieces.push({ id, layer: "tapaboca", cara: "frontal", center: ov.center ?? midX, largoPieza: ov.largo ?? runX, ancho: ov.ancho ?? G, alto: ov.alto ?? tbAlto, orient: "largo", edgePos: outMaxZ, layerLargo: tacosTB[0].layerLargo, layerAncho: tacosTB[0].layerAncho, y: tbY });
      }
      if (useTapabocaTrasero && runX > 0.5) {
        const id = "tapaboca-trasero"; const ov = overrides[id] || {};
        pieces.push({ id, layer: "tapaboca", cara: "trasero", center: ov.center ?? midX, largoPieza: ov.largo ?? runX, ancho: ov.ancho ?? G, alto: ov.alto ?? tbAlto, orient: "largo", edgePos: outMinZ - G, layerLargo: tacosTB[0].layerLargo, layerAncho: tacosTB[0].layerAncho, y: tbY });
      }
      if (useTapabocaIzquierda && runZ > 0.5) {
        const id = "tapaboca-izquierda"; const ov = overrides[id] || {};
        pieces.push({ id, layer: "tapaboca", cara: "izquierda", center: ov.center ?? midZ, largoPieza: ov.largo ?? runZ, ancho: ov.ancho ?? G, alto: ov.alto ?? tbAlto, orient: "ancho", edgePos: outMinX - G, layerLargo: tacosTB[0].layerLargo, layerAncho: tacosTB[0].layerAncho, y: tbY });
      }
      if (useTapabocaDerecha && runZ > 0.5) {
        const id = "tapaboca-derecha"; const ov = overrides[id] || {};
        pieces.push({ id, layer: "tapaboca", cara: "derecha", center: ov.center ?? midZ, largoPieza: ov.largo ?? runZ, ancho: ov.ancho ?? G, alto: ov.alto ?? tbAlto, orient: "ancho", edgePos: outMaxX, layerLargo: tacosTB[0].layerLargo, layerAncho: tacosTB[0].layerAncho, y: tbY });
      }
    }
  }

  // ── Layer 1.5: Intermedias ──
  if (apoyoType === "tacos" && useTablones && useIntermedias) {
    const L2_largo = layerLargo(2);
    const L2_ancho = layerAncho(2);
    const intermediaOrient = flip(tablonOrient);
    const interDistDim = intermediaOrient === "ancho" ? L2_largo : L2_ancho;
    const interRunDim = intermediaOrient === "ancho" ? L2_ancho : L2_largo;
    const interClaroMax = intermediaOrient === "ancho" ? tacoClaroMaxLargo : tablonClaroMax;

    const iCount = calcCount(interDistDim, interClaroMax, 0, intermediaAncho);
    const iPositions = calcPositions(interDistDim, iCount, 0, intermediaAncho);

    for (let i = 0; i < iPositions.length; i++) {
      const id = `intermedia-${i}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "intermedia", index: i, center: ov.center ?? iPositions[i], ancho: ov.ancho ?? intermediaAncho, alto: ov.alto ?? intermediaAlto, largoPieza: ov.largo ?? interRunDim, orient: intermediaOrient, distDim: interDistDim, layerLargo: L2_largo, layerAncho: L2_ancho, y: currentY, total: iPositions.length });
    }
    currentY += Math.max(...pieces.filter(p => p.layer === "intermedia").map(p => p.alto));
  }
  const intermediaTopY = currentY;

  // ── Layer 2: Tablones ──
  if (useTablones) {
    const L3_largo = layerLargo(3);
    const L3_ancho = layerAncho(3);
    const tRunDim = tablonOrient === "largo" ? L3_largo : L3_ancho;
    const tDistDim = tablonOrient === "largo" ? L3_ancho : L3_largo;
    const tCount = calcCount(tDistDim, tablonClaroMax, 0, tablonAncho);
    const tPositions = calcPositions(tDistDim, tCount, 0, tablonAncho);
    for (let i = 0; i < tPositions.length; i++) {
      const id = `tablon-${i}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "tablon", index: i, center: ov.center ?? tPositions[i], ancho: ov.ancho ?? tablonAncho, alto: ov.alto ?? tablonAlto, largoPieza: ov.largo ?? tRunDim, orient: tablonOrient, distDim: tDistDim, layerLargo: L3_largo, layerAncho: L3_ancho, y: currentY, total: tPositions.length });
    }
    const tablonY = currentY;
    currentY += Math.max(...pieces.filter(p => p.layer === "tablon").map(p => p.alto));

    if (recuadroMode && recuadroMode !== "none") {
      const tPiecesForRecuadros = pieces.filter(p => p.layer === "tablon");
      const tSorted = [...tPiecesForRecuadros].sort((a, b) => a.center - b.center);
      const recuadroOrient = flip(tablonOrient);
      const recuadroDistDim = recuadroOrient === "ancho" ? L3_largo : L3_ancho;

      let anchorPositions: number[] = [];
      const dbPiecesAll = pieces.filter(p => p.layer === "db");
      if (dbPiecesAll.length) {
        const dbDist = dbPiecesAll[0].distDim;
        const off = (recuadroDistDim - dbDist) / 2;
        const half = (tablonAncho) / 2;
        anchorPositions = [...dbPiecesAll].sort((a, b) => a.center - b.center).map(p => p.center + off).filter(c => c >= half - 0.5 && c <= recuadroDistDim - half + 0.5);
      } else {
        const tacoPieces = pieces.filter(p => p.layer === "taco");
        if (recuadroOrient === "ancho") {
          const set = new Set<number>();
          for (const t of tacoPieces) set.add(t.centerX);
          anchorPositions = [...set].sort((a, b) => a - b);
        } else {
          const set = new Set<number>();
          for (const t of tacoPieces) set.add(t.centerZ);
          anchorPositions = [...set].sort((a, b) => a - b);
        }
      }

      let selectedAnchors: number[] = [];
      const recuadroWidth = tablonAncho;
      if (recuadroMode === "extremos" || recuadroMode === "all") {
        selectedAnchors = [...selectedAnchors, recuadroWidth / 2, recuadroDistDim - recuadroWidth / 2];
      }
      if (recuadroMode === "centrales" || recuadroMode === "all") {
        if (apoyoType === "dobleBase") selectedAnchors = [...selectedAnchors, ...anchorPositions];
        else if (anchorPositions.length > 2) selectedAnchors = [...selectedAnchors, ...anchorPositions.slice(1, -1)];
      }
      selectedAnchors = [...new Set(selectedAnchors)];

      for (let a = 0; a < selectedAnchors.length; a++) {
        const anchor = selectedAnchors[a];
        const defaultCenterDist = anchor;
        for (let gg = 0; gg < tSorted.length - 1; gg++) {
          const t1 = tSorted[gg];
          const t2 = tSorted[gg + 1];
          const innerEdge1 = t1.center + t1.ancho / 2;
          const innerEdge2 = t2.center - t2.ancho / 2;
          const gapLength = innerEdge2 - innerEdge1;
          const gapCenter = (innerEdge1 + innerEdge2) / 2;
          if (gapLength <= 0.5) continue;
          const id = `recuadro-${a}-${gg}`; const ov = overrides[id] || {};
          pieces.push({ id, layer: "recuadro", anchorIdx: a, gapIdx: gg, centerDist: ov.centerDist ?? defaultCenterDist, centerRun: ov.centerRun ?? gapCenter, ancho: ov.ancho ?? tablonAncho, alto: ov.alto ?? tablonAlto, largoPieza: ov.largo ?? gapLength, orient: recuadroOrient, distDim: recuadroDistDim, runDim: tablonOrient === "largo" ? L3_ancho : L3_largo, layerLargo: L3_largo, layerAncho: L3_ancho, y: tablonY });
        }
      }
    }
  }

  // ── Tacos de arrastre ──
  if (useTacosArrastre && useTablones) {
    const tabPieces = pieces.filter(p => p.layer === "tablon");
    if (tabPieces.length) {
      const L3l = tabPieces[0].layerLargo;
      const L3a = tabPieces[0].layerAncho;
      const runAlongX = tablonOrient === "largo";
      const runDim = runAlongX ? L3l : L3a;
      let taIdx = 0;
      for (const t of tabPieces) {
        for (let e = 0; e < 2; e++) {
          const id = `taco-arrastre-${taIdx++}`; const ov = overrides[id] || {};
          const len = ov.largo ?? Math.min(tacoArrastreLargo, runDim / 2);
          const wCross = ov.ancho ?? (tacoArrastreAncho > 0 ? tacoArrastreAncho : t.ancho);
          const runStart = e === 0 ? 0 : runDim - len;
          const distStart = t.center - wCross / 2;
          pieces.push({ id, layer: "taco-arrastre", index: taIdx - 1, runAlongX, x: runAlongX ? runStart : distStart, z: runAlongX ? distStart : runStart, largoPieza: len, ancho: wCross, alto: ov.alto ?? dobleBaseAlto, chaflan: ov.chaflan ?? Math.min(tacoArrastreChaflan, len), edge: e, layerLargo: L3l, layerAncho: L3a, y: ov.y ?? 0 });
        }
      }
    }
  }

  // ── Layer 4: Cubrir ──
  const L4_largo = layerLargo(4);
  const L4_ancho = layerAncho(4);
  const cRunAlongX = cubrirOrient === "largo";
  const cDistDim = cRunAlongX ? L4_ancho : L4_largo;
  const cubrirY = currentY;

  if (cubrirType === "contrachapado") {
    const id = "cubrir"; const ov = overrides[id] || {};
    pieces.push({ id, layer: "cubrir-plancha", largoPieza: ov.largoPieza ?? L4_largo, anchoPieza: ov.anchoPieza ?? L4_ancho, alto: ov.alto ?? cubrirGrosor, layerLargo: L4_largo, layerAncho: L4_ancho, y: cubrirY });
  } else if (cubrirType === "jaula") {
    const count = calcCount(cDistDim, separacionTablas, 0, tablaAnchoCubrir);
    const positions = calcPositions(cDistDim, count, 0, tablaAnchoCubrir);
    for (let i = 0; i < positions.length; i++) {
      const id = `cubrir-${i}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "cubrir-tabla", index: i, layerLargo: L4_largo, layerAncho: L4_ancho, center: ov.center ?? positions[i], ancho: ov.ancho ?? tablaAnchoCubrir, alto: ov.alto ?? cubrirGrosor, largoPieza: ov.largo ?? (cRunAlongX ? L4_largo : L4_ancho), orient: cubrirOrient, distDim: cDistDim, y: cubrirY });
    }
  } else {
    const n = Math.max(1, Math.floor(cDistDim / tablaAnchoCubrir));
    const rem = cDistDim - n * tablaAnchoCubrir;
    const MIN_TABLA = Math.max(2, tablaAnchoCubrir * 0.5);
    const gap = (rem >= MIN_TABLA) ? 0 : (n > 1 ? rem / (n - 1) : 0);
    const useExtraTabla = rem >= MIN_TABLA;
    const step = tablaAnchoCubrir + gap;

    for (let idx = 0; idx < n; idx++) {
      const id = `cubrir-${idx}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "cubrir-tabla", index: idx, layerLargo: L4_largo, layerAncho: L4_ancho, center: ov.center ?? (idx * step + tablaAnchoCubrir / 2), ancho: ov.ancho ?? tablaAnchoCubrir, alto: ov.alto ?? cubrirGrosor, largoPieza: ov.largo ?? (cRunAlongX ? L4_largo : L4_ancho), orient: cubrirOrient, distDim: cDistDim, y: cubrirY });
    }
    if (useExtraTabla) {
      const id = `cubrir-${n}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "cubrir-tabla", index: n, layerLargo: L4_largo, layerAncho: L4_ancho, center: ov.center ?? (n * tablaAnchoCubrir + rem / 2), ancho: ov.ancho ?? rem, alto: ov.alto ?? cubrirGrosor, largoPieza: ov.largo ?? (cRunAlongX ? L4_largo : L4_ancho), orient: cubrirOrient, distDim: cDistDim, y: cubrirY });
    }
  }

  // ── Orillas ──
  if (useOrillas) {
    const orillaY = useTablones ? cubrirY : (cubrirY + cubrirGrosor);
    const orillaRunDim = orillaOrient === "ancho" ? (baseAncho - llapIntAncho) : (baseLargo - llapIntLargo);
    const orillaDistDim = orillaOrient === "ancho" ? baseLargo : baseAncho;
    const positions = [orillaAncho / 2, orillaDistDim - orillaAncho / 2];
    for (let i = 0; i < 2; i++) {
      const id = `orilla-${i}`; const ov = overrides[id] || {};
      pieces.push({ id, layer: "orilla", index: i, center: ov.center ?? positions[i], ancho: ov.ancho ?? orillaAncho, alto: ov.alto ?? orillaAlto, largoPieza: ov.largo ?? orillaRunDim, orient: orillaOrient, distDim: orillaDistDim, layerLargo: baseLargo, layerAncho: baseAncho, y: orillaY, total: 2 });
    }
  }

  // ── Paredes y tapa ──
  const getLayerY = (level: string) => {
    if (level === "suelo") return 0.5;
    if (level === "rastrel") return rastrelTopY;
    if (level === "apoyo") return apoyoTopY;
    if (level === "intermedia") return intermediaTopY;
    if (level === "tablon") return cubrirY;
    return cubrirY + cubrirGrosor;
  };

  const ladoY = useLados ? getLayerY(apoyoLado) : 0;
  const testeroY = useTesteros ? getLayerY(apoyoTestero) : 0;
  const ladoLlapY = useLados ? getLayerY(apoyoLadoLlap || apoyoLado) : 0;
  const testeroLlapY = useTesteros ? getLayerY(apoyoTesteroLlap || apoyoTestero) : 0;

  const fullExtTestero = useTesteros ? (testeroGrosor + llapTesteroExt) : 0;
  const fullExtLado = useLados ? (ladoGrosor + llapLadoExt) : 0;

  let ladoCubrirLongX: number, ladoLlapLongX: number, ladoStartX: number;
  let testeroCubrirLongZ: number, testeroLlapLongZ: number, testeroStartZ: number;
  let testeroLargoBonus = 0;
  let ladoLargoBonus = 0;

  const fullLadoMax = baseLargo + 2 * fullExtTestero;
  const fullTesteroMax = baseAncho + 2 * fullExtLado;

  if (caraDominante === "lado") {
    if (cargamento === "none") { ladoCubrirLongX = fullLadoMax; ladoLlapLongX = fullLadoMax; }
    else if (cargamento === "espiga") { ladoCubrirLongX = baseLargo + 2 * (useTesteros ? testeroGrosor : 0); ladoLlapLongX = fullLadoMax; testeroLargoBonus = 2 * ladoGrosor; }
    else if (cargamento === "cargamento") { ladoCubrirLongX = baseLargo; ladoLlapLongX = fullLadoMax; testeroLargoBonus = 2 * ladoGrosor; }
    else if (cargamento === "llap-espiga") { ladoCubrirLongX = fullLadoMax; ladoLlapLongX = baseLargo + 2 * (useTesteros ? testeroGrosor : 0); }
    else { ladoCubrirLongX = fullLadoMax; ladoLlapLongX = baseLargo; }
    ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
    testeroCubrirLongZ = baseAncho + (cargamento === "cargamento" ? testeroLargoBonus : 0);
    testeroLlapLongZ = baseAncho;
    testeroStartZ = -(testeroCubrirLongZ - baseAncho) / 2;
  } else {
    if (cargamento === "none") { testeroCubrirLongZ = fullTesteroMax; testeroLlapLongZ = fullTesteroMax; }
    else if (cargamento === "espiga") { testeroCubrirLongZ = baseAncho + 2 * (useLados ? ladoGrosor : 0); testeroLlapLongZ = fullTesteroMax; ladoLargoBonus = 2 * testeroGrosor; }
    else if (cargamento === "cargamento") { testeroCubrirLongZ = baseAncho; testeroLlapLongZ = fullTesteroMax; ladoLargoBonus = 2 * testeroGrosor; }
    else if (cargamento === "llap-espiga") { testeroCubrirLongZ = fullTesteroMax; testeroLlapLongZ = baseAncho + 2 * (useLados ? ladoGrosor : 0); }
    else { testeroCubrirLongZ = fullTesteroMax; testeroLlapLongZ = baseAncho; }
    testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
    ladoCubrirLongX = baseLargo + (cargamento === "cargamento" ? ladoLargoBonus : 0);
    ladoLlapLongX = baseLargo;
    ladoStartX = -(ladoCubrirLongX - baseLargo) / 2;
  }

  let ladoLongitudX = Math.max(ladoCubrirLongX, ladoLlapLongX);
  let testeroLongitudZ = Math.max(testeroCubrirLongZ, testeroLlapLongZ);

  if (caraDominante === "lado") {
    if (useLados && useLlapasasLado && llapLadoPosicion === "interior") {
      const tmp = ladoCubrirLongX; ladoCubrirLongX = ladoLlapLongX; ladoLlapLongX = tmp - (cargamento === "espiga" ? llapIntLargo : 0);
      ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
    }
    if (useTesteros && useLlapasasTestero && llapTesteroPosicion === "interior") {
      testeroCubrirLongZ -= llapIntAncho; testeroLlapLongZ -= llapIntAncho;
      testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
    }
  } else {
    if (useTesteros && useLlapasasTestero && llapTesteroPosicion === "interior") {
      const tmp = testeroCubrirLongZ; testeroCubrirLongZ = testeroLlapLongZ; testeroLlapLongZ = tmp - (cargamento === "espiga" ? llapIntAncho : 0);
      testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
    }
    if (useLados && useLlapasasLado && llapLadoPosicion === "interior") {
      ladoCubrirLongX -= llapIntLargo; ladoLlapLongX -= llapIntLargo;
      ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
    }
  }
  ladoLongitudX = Math.max(ladoCubrirLongX, ladoLlapLongX);
  testeroLongitudZ = Math.max(testeroCubrirLongZ, testeroLlapLongZ);

  if (caraDominante === "lado" && useTesteros && useLlapasasTestero && llapTesteroPosicion === "interior" && cargamento === "espiga") {
    testeroCubrirLongZ += testeroLargoBonus; testeroLargoBonus = 0;
    testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
    testeroLongitudZ = Math.max(testeroCubrirLongZ, testeroLlapLongZ);
  }
  if (caraDominante === "testero" && useLados && useLlapasasLado && llapLadoPosicion === "interior" && cargamento === "espiga") {
    ladoCubrirLongX += ladoLargoBonus; ladoLargoBonus = 0;
    ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
    ladoLongitudX = Math.max(ladoCubrirLongX, ladoLlapLongX);
  }

  if (cargamento === "cargamento") {
    if (caraDominante === "lado" && useLlapasasLado && llapLadoPosicion === "interior" && useLlapasasTestero && llapTesteroPosicion === "interior") {
      ladoLlapLongX -= 2 * llapTesteroGrosor; testeroLlapLongZ += 2 * llapLadoGrosor; testeroLargoBonus = 0;
      ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
      testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
      ladoLongitudX = Math.max(ladoCubrirLongX, ladoLlapLongX);
      testeroLongitudZ = Math.max(testeroCubrirLongZ, testeroLlapLongZ);
    }
    if (caraDominante === "testero" && useLlapasasTestero && llapTesteroPosicion === "interior" && useLlapasasLado && llapLadoPosicion === "interior") {
      testeroLlapLongZ -= 2 * llapLadoGrosor; ladoLlapLongX += 2 * llapTesteroGrosor; ladoLargoBonus = 0;
      testeroStartZ = -(Math.max(testeroCubrirLongZ, testeroLlapLongZ) - baseAncho) / 2;
      ladoStartX = -(Math.max(ladoCubrirLongX, ladoLlapLongX) - baseLargo) / 2;
      testeroLongitudZ = Math.max(testeroCubrirLongZ, testeroLlapLongZ);
      ladoLongitudX = Math.max(ladoCubrirLongX, ladoLlapLongX);
    }
  }

  const ladoZ0 = -ladoGrosor;
  const ladoZ1 = baseAncho;
  const cubrirTopY = cubrirY + cubrirGrosor;
  const ladoTotalHeight = (cubrirTopY + alto) - ladoY;
  const tapaLlapG = (useTapa && useLlapasasTapa) ? llapTapaGrosor : 0;
  const ladoVertical = useLlapasasLado && llapLadoOrient !== "largo";
  const testeroVertical = useLlapasasTestero && llapTesteroOrient !== "largo";
  const ladoCrece = (useTapa && ladoVertical && llapLadoPosicion === "exterior")
    ? (llapLadoAltura === "cubrir" ? tapaGrosor : llapLadoAltura === "llapasa" ? tapaGrosor + tapaLlapG : 0) : 0;
  const testeroCrece = (useTapa && testeroVertical && llapTesteroPosicion === "exterior")
    ? (llapTesteroAltura === "cubrir" ? tapaGrosor : llapTesteroAltura === "llapasa" ? tapaGrosor + tapaLlapG : 0) : 0;

  if (useLados) {
    for (let i = 0; i < 2; i++) {
      const isFar = i === 1;
      const id = `lado-${i}`; const ov = overrides[id] || {};
      const thisZ = isFar ? ladoZ1 : ladoZ0;
      const cubrirLadoStartX = ladoStartX + (ladoLongitudX - ladoCubrirLongX) / 2;
      if (ladoCubrirType === "contrachapado") {
        pieces.push({ id, layer: "lado-plancha", index: i, largoPieza: ov.largoPieza ?? ladoCubrirLongX, anchoPieza: ov.anchoPieza ?? ladoGrosor, alto: ov.alto ?? ladoTotalHeight, x: cubrirLadoStartX, z: thisZ, y: ladoY });
      } else {
        const boardsAlongAlto = !useLlapasasLado || llapLadoOrient === "largo";
        const distDim = boardsAlongAlto ? ladoCubrirLongX : ladoTotalHeight;
        const runDim = boardsAlongAlto ? ladoTotalHeight : ladoCubrirLongX;
        const boards: { center: number; w: number }[] = [];
        if (ladoCubrirType === "jaula") {
          const cnt = calcCount(distDim, ladoSeparacion, 0, ladoTablaAncho);
          const pos = calcPositions(distDim, cnt, 0, ladoTablaAncho);
          for (const c of pos) boards.push({ center: c, w: ladoTablaAncho });
        } else {
          let bp = 0;
          while (bp + ladoTablaAncho <= distDim) { boards.push({ center: bp + ladoTablaAncho / 2, w: ladoTablaAncho }); bp += ladoTablaAncho; }
          const rem = distDim - bp;
          if (rem > 0.5) boards.push({ center: bp + rem / 2, w: rem });
        }
        for (let j = 0; j < boards.length; j++) {
          const bid = `lado-${i}-tabla-${j}`; const bov = overrides[bid] || {};
          const pieceY = boardsAlongAlto ? ladoY : (ladoY + (bov.center ?? boards[j].center) - (bov.ancho ?? boards[j].w) / 2);
          const pieceX = boardsAlongAlto ? (cubrirLadoStartX + (bov.center ?? boards[j].center) - (bov.ancho ?? boards[j].w) / 2) : cubrirLadoStartX;
          pieces.push({ id: bid, layer: "lado-tabla", parentIndex: i, index: j, center: bov.center ?? boards[j].center, ancho: bov.ancho ?? boards[j].w, alto: bov.alto ?? runDim, largoPieza: bov.largo ?? ladoGrosor, x: pieceX, z: thisZ, y: pieceY, faceType: "lado", boardsAlongAlto });
        }
      }
    }
  }

  const testeroX0 = -testeroGrosor;
  const testeroX1 = baseLargo;
  const testeroTotalHeight = (cubrirTopY + alto) - testeroY;

  if (useTesteros) {
    for (let i = 0; i < 2; i++) {
      const isFar = i === 1;
      const id = `testero-${i}`; const ov = overrides[id] || {};
      const thisX = isFar ? testeroX1 : testeroX0;
      const cubrirTesteroStartZ = testeroStartZ + (testeroLongitudZ - testeroCubrirLongZ) / 2;
      if (testeroCubrirType === "contrachapado") {
        pieces.push({ id, layer: "testero-plancha", index: i, largoPieza: ov.largoPieza ?? testeroGrosor, anchoPieza: ov.anchoPieza ?? testeroCubrirLongZ, alto: ov.alto ?? testeroTotalHeight, x: thisX, z: cubrirTesteroStartZ, y: testeroY });
      } else {
        const boardsAlongAlto = !useLlapasasTestero || llapTesteroOrient === "largo";
        const distDim = boardsAlongAlto ? testeroCubrirLongZ : testeroTotalHeight;
        const runDim = boardsAlongAlto ? testeroTotalHeight : testeroCubrirLongZ;
        const boards: { center: number; w: number }[] = [];
        if (testeroCubrirType === "jaula") {
          const cnt = calcCount(distDim, testeroSeparacion, 0, testeroTablaAncho);
          const pos = calcPositions(distDim, cnt, 0, testeroTablaAncho);
          for (const c of pos) boards.push({ center: c, w: testeroTablaAncho });
        } else {
          let bp = 0;
          while (bp + testeroTablaAncho <= distDim) { boards.push({ center: bp + testeroTablaAncho / 2, w: testeroTablaAncho }); bp += testeroTablaAncho; }
          const rem = distDim - bp;
          if (rem > 0.5) boards.push({ center: bp + rem / 2, w: rem });
        }
        for (let j = 0; j < boards.length; j++) {
          const bid = `testero-${i}-tabla-${j}`; const bov = overrides[bid] || {};
          const pieceY = boardsAlongAlto ? testeroY : (testeroY + (bov.center ?? boards[j].center) - (bov.ancho ?? boards[j].w) / 2);
          const pieceZ = boardsAlongAlto ? (cubrirTesteroStartZ + (bov.center ?? boards[j].center) - (bov.ancho ?? boards[j].w) / 2) : cubrirTesteroStartZ;
          pieces.push({ id: bid, layer: "testero-tabla", parentIndex: i, index: j, center: bov.center ?? boards[j].center, ancho: bov.ancho ?? boards[j].w, alto: bov.alto ?? runDim, largoPieza: bov.largo ?? testeroGrosor, x: thisX, z: pieceZ, y: pieceY, faceType: "testero", boardsAlongAlto });
        }
      }
    }
  }

  const fullStartX = -(useTesteros ? (testeroGrosor + llapTesteroExt) : 0);
  const fullStartZ = -(useLados ? (ladoGrosor + llapLadoExt) : 0);
  const fullLargo = baseLargo + 2 * (useTesteros ? (testeroGrosor + llapTesteroExt) : 0);
  const fullAncho = baseAncho + 2 * (useLados ? (ladoGrosor + llapLadoExt) : 0);
  const tapaCutZ = ladoCrece > 0 ? llapLadoGrosor : 0;
  const tapaCutX = testeroCrece > 0 ? llapTesteroGrosor : 0;
  const cutLlapZ = (llapLadoAltura === "llapasa" && ladoCrece > 0) ? llapLadoGrosor : 0;
  const cutLlapX = (llapTesteroAltura === "llapasa" && testeroCrece > 0) ? llapTesteroGrosor : 0;

  if (useTapa) {
    const tapaY = cubrirTopY + alto;
    const tStartX = fullStartX + tapaCutX;
    const tStartZ = fullStartZ + tapaCutZ;
    const tLargo = fullLargo - 2 * tapaCutX;
    const tAncho = fullAncho - 2 * tapaCutZ;

    if (tapaCubrirType === "contrachapado") {
      const id = "tapa"; const ov = overrides[id] || {};
      pieces.push({ id, layer: "tapa-plancha", largoPieza: ov.largoPieza ?? tLargo, anchoPieza: ov.anchoPieza ?? tAncho, alto: ov.alto ?? tapaGrosor, x: tStartX, z: tStartZ, y: tapaY });
    } else {
      const boardsAlongLargo = useLlapasasTapa ? (llapTapaOrient === "ancho") : (tapaCubrirOrient === "largo");
      const cRunDim = boardsAlongLargo ? tLargo : tAncho;
      const cDistDim2 = boardsAlongLargo ? tAncho : tLargo;
      const startRun = boardsAlongLargo ? tStartX : tStartZ;
      const startDist = boardsAlongLargo ? tStartZ : tStartX;
      const boards: { center: number; w: number }[] = [];
      if (tapaCubrirType === "jaula") {
        const cnt = calcCount(cDistDim2, tapaSeparacion, 0, tapaTablaAncho);
        const pos = calcPositions(cDistDim2, cnt, 0, tapaTablaAncho);
        for (const c of pos) boards.push({ center: c, w: tapaTablaAncho });
      } else {
        let bp = 0;
        while (bp + tapaTablaAncho <= cDistDim2) { boards.push({ center: bp + tapaTablaAncho / 2, w: tapaTablaAncho }); bp += tapaTablaAncho; }
        const rem = cDistDim2 - bp;
        if (rem > 0.5) boards.push({ center: bp + rem / 2, w: rem });
      }
      for (let j = 0; j < boards.length; j++) {
        const id = `tapa-tabla-${j}`; const ov = overrides[id] || {};
        pieces.push({ id, layer: "tapa-tabla", index: j, center: ov.center ?? boards[j].center, ancho: ov.ancho ?? boards[j].w, alto: ov.alto ?? tapaGrosor, largoPieza: ov.largo ?? cRunDim, x: boardsAlongLargo ? startRun : (startDist + (ov.center ?? boards[j].center) - (ov.ancho ?? boards[j].w) / 2), z: boardsAlongLargo ? (startDist + (ov.center ?? boards[j].center) - (ov.ancho ?? boards[j].w) / 2) : startRun, y: tapaY, boardsAlongLargo });
      }
    }
  }

  // ── Llapasas de lado ──
  if (useLlapasasLado && useLados) {
    const isHorizontal = llapLadoOrient === "largo";
    const llapLadoRunX = ladoLlapLongX + ladoLargoBonus;
    const ladoLlapBaseY = llapLadoPosicion === "interior" ? cubrirTopY : ladoLlapY;
    const ladoOrillaLift = (llapLadoPosicion === "interior" && useOrillas && orillaOrient === "largo") ? orillaAlto : 0;
    const ladoLlapHeight = (cubrirTopY + alto - (llapLadoPosicion === "interior" ? llapIntAlto : 0)) - ladoLlapBaseY - ladoOrillaLift + ladoCrece;
    const llapRunDim = isHorizontal ? llapLadoRunX : ladoLlapHeight;
    const llapDistDim = isHorizontal ? ladoLlapHeight : llapLadoRunX;
    const llapCount = calcCount(llapDistDim, llapLadoClaro, 0, llapLadoAncho);
    const llapPos = calcPositions(llapDistDim, llapCount, 0, llapLadoAncho);

    for (let i = 0; i < 2; i++) {
      const isFar = i === 1;
      const ladoOuterZ = isFar ? (baseAncho + ladoGrosor) : (-ladoGrosor - llapLadoGrosor);
      const ladoInnerZ = isFar ? (baseAncho - llapLadoGrosor) : 0;
      const baseZ = llapLadoPosicion === "exterior" ? ladoOuterZ : ladoInnerZ;
      const llapLadoStartX = (baseLargo - llapLadoRunX) / 2;
      for (let j = 0; j < llapPos.length; j++) {
        const id = `llap-lado-${i}-${j}`; const ov = overrides[id] || {};
        if (isHorizontal) {
          pieces.push({ id, layer: "llap-lado", parentIndex: i, index: j, x: llapLadoStartX, z: baseZ, y: ladoLlapBaseY + ladoOrillaLift + llapPos[j] - llapLadoAncho / 2, w: ov.largo ?? llapRunDim, h: ov.ancho ?? llapLadoAncho, d: ov.grosor ?? llapLadoGrosor });
        } else {
          pieces.push({ id, layer: "llap-lado", parentIndex: i, index: j, x: llapLadoStartX + llapPos[j] - llapLadoAncho / 2, z: baseZ, y: ladoLlapBaseY, w: ov.ancho ?? llapLadoAncho, h: ov.largo ?? llapRunDim, d: ov.grosor ?? llapLadoGrosor });
        }
      }
    }
  }

  // ── Inclinadas de lado ──
  if (useLlapInclinadaLado && useLlapasasLado && useLados) {
    const isHoriz = llapLadoOrient === "largo";
    const incRunX = ladoLlapLongX + ladoLargoBonus;
    const incLadoBaseY = llapLadoPosicion === "interior" ? cubrirTopY : ladoY;
    const incOrillaLift = (llapLadoPosicion === "interior" && useOrillas && orillaOrient === "largo") ? orillaAlto : 0;
    const incLadoHeight = (cubrirTopY + alto - (llapLadoPosicion === "interior" ? llapIntAlto : 0)) - incLadoBaseY - incOrillaLift;
    const llapDist = isHoriz ? incLadoHeight : incRunX;
    const incCountI = calcCount(llapDist, llapLadoClaro, 0, llapLadoAncho);
    const incPosI = calcPositions(llapDist, incCountI, 0, llapLadoAncho);

    if (incPosI.length >= 2) {
      const gap1 = (incPosI[1] - llapLadoAncho / 2) - (incPosI[0] + llapLadoAncho / 2);
      const gapLast = (incPosI[incPosI.length - 1] - llapLadoAncho / 2) - (incPosI[incPosI.length - 2] + llapLadoAncho / 2);
      const faceH = isHoriz ? incRunX : incLadoHeight;
      for (let si = 0; si < 2; si++) {
        const isFar = si === 1;
        const zOut = isFar ? (baseAncho + ladoGrosor) : (-ladoGrosor - llapLadoGrosor);
        const zIn = isFar ? (baseAncho - llapLadoGrosor) : 0;
        const incZ = llapLadoPosicion === "exterior" ? zOut : zIn;
        const sX = -(incRunX - baseLargo) / 2;
        const useHalfGap = incPosI.length === 2 && llapInclinadaLadoCount !== 1;
        const g1 = useHalfGap ? gap1 / 2 : gap1;
        const gL = useHalfGap ? gapLast / 2 : gapLast;
        const allGaps = [
          { g: g1, dStart: incPosI[0] + llapLadoAncho / 2, sign: 1 },
          { g: gL, dStart: incPosI[incPosI.length - 1] - llapLadoAncho / 2 - gL, sign: -1 },
        ];
        const gaps = llapInclinadaLadoCount === 1 ? [allGaps[0]] : allGaps;
        for (let p = 0; p < gaps.length; p++) {
          const { g, dStart, sign } = gaps[p];
          if (g <= 0) continue;
          const { L, a } = solveInclinada(g, faceH, llapLadoAncho);
          if (L <= 0) continue;
          const cDist = dStart + g / 2;
          const cRun = faceH / 2;
          const rotAngle = a * sign;
          const id = `llap-incl-lado-${si}-${p}`;
          if (isHoriz) {
            pieces.push({ id, layer: "llap-incl-lado", parentIndex: si, diagIndex: p, cx: sX + cRun, cy: incLadoBaseY + incOrillaLift + cDist, cz: incZ + llapLadoGrosor / 2, w: L, h: llapLadoAncho, d: llapLadoGrosor, rotZ: rotAngle });
          } else {
            pieces.push({ id, layer: "llap-incl-lado", parentIndex: si, diagIndex: p, cx: sX + cDist, cy: incLadoBaseY + cRun, cz: incZ + llapLadoGrosor / 2, w: llapLadoAncho, h: L, d: llapLadoGrosor, rotZ: -rotAngle });
          }
        }
      }
    }
  }

  // ── Llapasas de testero ──
  if (useLlapasasTestero && useTesteros) {
    const isHorizontal = llapTesteroOrient === "largo";
    const llapTesteroRunZ = testeroLlapLongZ + testeroLargoBonus;
    const testeroLlapBaseY = llapTesteroPosicion === "interior" ? cubrirTopY : testeroLlapY;
    const testeroOrillaLift = (llapTesteroPosicion === "interior" && useOrillas && orillaOrient === "ancho") ? orillaAlto : 0;
    const testeroLlapHeight = (cubrirTopY + alto - (llapTesteroPosicion === "interior" ? llapIntAlto : 0)) - testeroLlapBaseY - testeroOrillaLift + testeroCrece;
    const llapRunDim = isHorizontal ? llapTesteroRunZ : testeroLlapHeight;
    const llapDistDim = isHorizontal ? testeroLlapHeight : llapTesteroRunZ;
    const llapCount = calcCount(llapDistDim, llapTesteroClaro, 0, llapTesteroAncho);
    const llapPos = calcPositions(llapDistDim, llapCount, 0, llapTesteroAncho);

    for (let i = 0; i < 2; i++) {
      const isFar = i === 1;
      const testOuterX = isFar ? (baseLargo + testeroGrosor) : (-testeroGrosor - llapTesteroGrosor);
      const testInnerX = isFar ? (baseLargo - llapTesteroGrosor) : 0;
      const baseX = llapTesteroPosicion === "exterior" ? testOuterX : testInnerX;
      const llapTesteroStartZ = (baseAncho - llapTesteroRunZ) / 2;
      for (let j = 0; j < llapPos.length; j++) {
        const id = `llap-testero-${i}-${j}`; const ov = overrides[id] || {};
        if (isHorizontal) {
          pieces.push({ id, layer: "llap-testero", parentIndex: i, index: j, x: baseX, z: llapTesteroStartZ, y: testeroLlapBaseY + testeroOrillaLift + llapPos[j] - llapTesteroAncho / 2, w: ov.grosor ?? llapTesteroGrosor, h: ov.ancho ?? llapTesteroAncho, d: ov.largo ?? llapRunDim });
        } else {
          pieces.push({ id, layer: "llap-testero", parentIndex: i, index: j, x: baseX, z: llapTesteroStartZ + llapPos[j] - llapTesteroAncho / 2, y: testeroLlapBaseY, w: ov.grosor ?? llapTesteroGrosor, h: ov.largo ?? llapRunDim, d: ov.ancho ?? llapTesteroAncho });
        }
      }
    }
  }

  // ── Inclinadas de testero ──
  if (useLlapInclinadaTestero && useLlapasasTestero && useTesteros) {
    const isHorizT = llapTesteroOrient === "largo";
    const incRunZT = testeroLlapLongZ + testeroLargoBonus;
    const incTesteroBaseY = llapTesteroPosicion === "interior" ? cubrirTopY : testeroY;
    const incOrillaLiftT = (llapTesteroPosicion === "interior" && useOrillas && orillaOrient === "ancho") ? orillaAlto : 0;
    const incTesteroHeight = (cubrirTopY + alto - (llapTesteroPosicion === "interior" ? llapIntAlto : 0)) - incTesteroBaseY - incOrillaLiftT;
    const llapDistT = isHorizT ? incTesteroHeight : incRunZT;
    const incCountT = calcCount(llapDistT, llapTesteroClaro, 0, llapTesteroAncho);
    const incPosT = calcPositions(llapDistT, incCountT, 0, llapTesteroAncho);

    if (incPosT.length >= 2) {
      const gap1 = (incPosT[1] - llapTesteroAncho / 2) - (incPosT[0] + llapTesteroAncho / 2);
      const gapLast = (incPosT[incPosT.length - 1] - llapTesteroAncho / 2) - (incPosT[incPosT.length - 2] + llapTesteroAncho / 2);
      const faceH = isHorizT ? incRunZT : incTesteroHeight;
      for (let si = 0; si < 2; si++) {
        const isFar = si === 1;
        const xOut = isFar ? (baseLargo + testeroGrosor) : (-testeroGrosor - llapTesteroGrosor);
        const xIn = isFar ? (baseLargo - llapTesteroGrosor) : 0;
        const incX = llapTesteroPosicion === "exterior" ? xOut : xIn;
        const sZ = -(incRunZT - baseAncho) / 2;
        const useHalfGapT = incPosT.length === 2 && llapInclinadaTesteroCount !== 1;
        const g1t = useHalfGapT ? gap1 / 2 : gap1;
        const gLt = useHalfGapT ? gapLast / 2 : gapLast;
        const allGapsT = [
          { g: g1t, dStart: incPosT[0] + llapTesteroAncho / 2, sign: 1 },
          { g: gLt, dStart: incPosT[incPosT.length - 1] - llapTesteroAncho / 2 - gLt, sign: -1 },
        ];
        const gaps = llapInclinadaTesteroCount === 1 ? [allGapsT[0]] : allGapsT;
        for (let p = 0; p < gaps.length; p++) {
          const { g, dStart, sign } = gaps[p];
          if (g <= 0) continue;
          const { L, a } = solveInclinada(g, faceH, llapTesteroAncho);
          if (L <= 0) continue;
          const cDist = dStart + g / 2;
          const cRun = faceH / 2;
          const rotAngle = a * sign;
          const id = `llap-incl-testero-${si}-${p}`;
          if (isHorizT) {
            pieces.push({ id, layer: "llap-incl-testero", parentIndex: si, diagIndex: p, cx: incX + llapTesteroGrosor / 2, cy: incTesteroBaseY + incOrillaLiftT + cDist, cz: sZ + cRun, w: llapTesteroGrosor, h: llapTesteroAncho, d: L, rotX: -rotAngle });
          } else {
            pieces.push({ id, layer: "llap-incl-testero", parentIndex: si, diagIndex: p, cx: incX + llapTesteroGrosor / 2, cy: incTesteroBaseY + cRun, cz: sZ + cDist, w: llapTesteroGrosor, h: L, d: llapTesteroAncho, rotX: rotAngle });
          }
        }
      }
    }
  }

  // ── Recuadros de lado ──
  if (useRecuadrosLado && useLlapasasLado && useLados) {
    const isHoriz = llapLadoOrient === "largo";
    const recRunX = ladoLlapLongX + ladoLargoBonus;
    const recLadoBaseY = llapLadoPosicion === "interior" ? cubrirTopY : ladoLlapY;
    const recOrillaLift = (llapLadoPosicion === "interior" && useOrillas && orillaOrient === "largo") ? orillaAlto : 0;
    const recLadoHeight = (cubrirTopY + alto - (llapLadoPosicion === "interior" ? llapIntAlto : 0)) - recLadoBaseY - recOrillaLift;
    const recDistDim = isHoriz ? recLadoHeight : recRunX;
    const recRunDim = isHoriz ? recRunX : recLadoHeight;
    const recCountL = calcCount(recDistDim, llapLadoClaro, 0, llapLadoAncho);
    const recPosL = calcPositions(recDistDim, recCountL, 0, llapLadoAncho);
    for (let si = 0; si < 2; si++) {
      const isFar = si === 1;
      const zOut = isFar ? (baseAncho + ladoGrosor) : (-ladoGrosor - llapLadoGrosor);
      const zIn = isFar ? (baseAncho - llapLadoGrosor) : 0;
      const recZ = llapLadoPosicion === "exterior" ? zOut : zIn;
      const sX = (baseLargo - recRunX) / 2;
      for (let gg = 0; gg < recPosL.length - 1; gg++) {
        const gapStart = recPosL[gg] + llapLadoAncho / 2;
        const gapEnd = recPosL[gg + 1] - llapLadoAncho / 2;
        const gapLen = gapEnd - gapStart;
        if (gapLen <= 0) continue;
        const rCount = calcCount(recRunDim, recuadroLadoClaro, 0, llapLadoAncho);
        const rPos = calcPositions(recRunDim, rCount, 0, llapLadoAncho);
        for (let r = 0; r < rPos.length; r++) {
          const id = `rec-lado-${si}-${gg}-${r}`; const ov = overrides[id] || {};
          if (isHoriz) {
            pieces.push({ id, layer: "rec-lado", parentIndex: si, x: sX + rPos[r] - llapLadoAncho / 2, z: recZ, y: recLadoBaseY + recOrillaLift + gapStart, w: ov.ancho ?? llapLadoAncho, h: ov.largo ?? gapLen, d: llapLadoGrosor });
          } else {
            pieces.push({ id, layer: "rec-lado", parentIndex: si, x: sX + gapStart, z: recZ, y: recLadoBaseY + rPos[r] - llapLadoAncho / 2, w: ov.largo ?? gapLen, h: ov.ancho ?? llapLadoAncho, d: llapLadoGrosor });
          }
        }
      }
    }
  }

  // ── Recuadros de testero ──
  if (useRecuadrosTestero && useLlapasasTestero && useTesteros) {
    const isHorizT = llapTesteroOrient === "largo";
    const recRunZT = testeroLlapLongZ + testeroLargoBonus;
    const recTesteroBaseY = llapTesteroPosicion === "interior" ? cubrirTopY : testeroLlapY;
    const recOrillaLiftT = (llapTesteroPosicion === "interior" && useOrillas && orillaOrient === "ancho") ? orillaAlto : 0;
    const recTesteroHeight = (cubrirTopY + alto - (llapTesteroPosicion === "interior" ? llapIntAlto : 0)) - recTesteroBaseY - recOrillaLiftT;
    const recDistDimT = isHorizT ? recTesteroHeight : recRunZT;
    const recRunDimT = isHorizT ? recRunZT : recTesteroHeight;
    const recCountT = calcCount(recDistDimT, llapTesteroClaro, 0, llapTesteroAncho);
    const recPosT = calcPositions(recDistDimT, recCountT, 0, llapTesteroAncho);
    for (let si = 0; si < 2; si++) {
      const isFar = si === 1;
      const xOut = isFar ? (baseLargo + testeroGrosor) : (-testeroGrosor - llapTesteroGrosor);
      const xIn = isFar ? (baseLargo - llapTesteroGrosor) : 0;
      const recX = llapTesteroPosicion === "exterior" ? xOut : xIn;
      const sZ = (baseAncho - recRunZT) / 2;
      for (let gg = 0; gg < recPosT.length - 1; gg++) {
        const gapStart = recPosT[gg] + llapTesteroAncho / 2;
        const gapEnd = recPosT[gg + 1] - llapTesteroAncho / 2;
        const gapLen = gapEnd - gapStart;
        if (gapLen <= 0) continue;
        const rCount = calcCount(recRunDimT, recuadroTesteroClaro, 0, llapTesteroAncho);
        const rPos = calcPositions(recRunDimT, rCount, 0, llapTesteroAncho);
        for (let r = 0; r < rPos.length; r++) {
          const id = `rec-testero-${si}-${gg}-${r}`; const ov = overrides[id] || {};
          if (isHorizT) {
            pieces.push({ id, layer: "rec-testero", parentIndex: si, x: recX, z: sZ + rPos[r] - llapTesteroAncho / 2, y: recTesteroBaseY + recOrillaLiftT + gapStart, w: llapTesteroGrosor, h: ov.largo ?? gapLen, d: ov.ancho ?? llapTesteroAncho });
          } else {
            pieces.push({ id, layer: "rec-testero", parentIndex: si, x: recX, z: sZ + gapStart, y: recTesteroBaseY + rPos[r] - llapTesteroAncho / 2, w: llapTesteroGrosor, h: ov.ancho ?? llapTesteroAncho, d: ov.largo ?? gapLen });
          }
        }
      }
    }
  }

  // ── Recuadros de tapa ──
  if (useRecuadrosTapa && useLlapasasTapa && useTapa) {
    const isAlongLargoT = llapTapaOrient === "largo";
    const tapaY3 = cubrirTopY + alto;
    let recDistDimTp: number, recRunDimTp: number, recStartX: number, recStartZ: number;
    if (llapTapaPosicion === "interior") {
      recDistDimTp = isAlongLargoT ? baseAncho : baseLargo;
      recRunDimTp = isAlongLargoT ? baseLargo : baseAncho;
      recStartX = 0; recStartZ = 0;
    } else {
      recDistDimTp = isAlongLargoT ? fullAncho : fullLargo;
      recRunDimTp = isAlongLargoT ? fullLargo : fullAncho;
      recStartX = fullStartX; recStartZ = fullStartZ;
    }
    const recCountTp = calcCount(recDistDimTp, llapTapaClaro, 0, llapTapaAncho);
    const recPosTp = calcPositions(recDistDimTp, recCountTp, 0, llapTapaAncho);
    const recYBase = llapTapaPosicion === "exterior" ? tapaY3 + tapaGrosor : tapaY3 - llapTapaGrosor;
    for (let gg = 0; gg < recPosTp.length - 1; gg++) {
      const gapStart = recPosTp[gg] + llapTapaAncho / 2;
      const gapEnd = recPosTp[gg + 1] - llapTapaAncho / 2;
      const gapLen = gapEnd - gapStart;
      if (gapLen <= 0) continue;
      const rCount = calcCount(recRunDimTp, recuadroTapaClaro, 0, llapTapaAncho);
      const rPos = calcPositions(recRunDimTp, rCount, 0, llapTapaAncho);
      for (let r = 0; r < rPos.length; r++) {
        const id = `rec-tapa-${gg}-${r}`; const ov = overrides[id] || {};
        if (isAlongLargoT) {
          pieces.push({ id, layer: "rec-tapa", x: recStartX + rPos[r] - llapTapaAncho / 2, z: recStartZ + gapStart, y: recYBase, w: ov.ancho ?? llapTapaAncho, h: llapTapaGrosor, d: ov.largo ?? gapLen });
        } else {
          pieces.push({ id, layer: "rec-tapa", x: recStartX + gapStart, z: recStartZ + rPos[r] - llapTapaAncho / 2, y: recYBase, w: ov.largo ?? gapLen, h: llapTapaGrosor, d: ov.ancho ?? llapTapaAncho });
        }
      }
    }
  }

  // ── Llapasas de tapa ──
  if (useLlapasasTapa && useTapa) {
    const tapaY2 = cubrirTopY + alto;
    const isAlongLargo = llapTapaOrient === "largo";
    let tapaLlapRunDim: number, tapaLlapDistDim: number, tapaLlapStartX: number, tapaLlapStartZ: number;
    if (llapTapaPosicion === "interior") {
      tapaLlapRunDim = isAlongLargo ? baseLargo : baseAncho;
      tapaLlapDistDim = isAlongLargo ? baseAncho : baseLargo;
      tapaLlapStartX = 0; tapaLlapStartZ = 0;
    } else {
      tapaLlapRunDim = isAlongLargo ? (fullLargo - 2 * cutLlapX) : (fullAncho - 2 * cutLlapZ);
      tapaLlapDistDim = isAlongLargo ? (fullAncho - 2 * cutLlapZ) : (fullLargo - 2 * cutLlapX);
      tapaLlapStartX = fullStartX + cutLlapX; tapaLlapStartZ = fullStartZ + cutLlapZ;
    }
    const llapCount = calcCount(tapaLlapDistDim, llapTapaClaro, 0, llapTapaAncho);
    const llapPos = calcPositions(tapaLlapDistDim, llapCount, 0, llapTapaAncho);
    const llapYBase = llapTapaPosicion === "exterior" ? tapaY2 + tapaGrosor : tapaY2 - llapTapaGrosor;
    for (let j = 0; j < llapPos.length; j++) {
      const id = `llap-tapa-${j}`; const ov = overrides[id] || {};
      if (isAlongLargo) {
        pieces.push({ id, layer: "llap-tapa", index: j, x: tapaLlapStartX, z: tapaLlapStartZ + llapPos[j] - llapTapaAncho / 2, y: llapYBase, w: ov.largo ?? tapaLlapRunDim, h: ov.grosor ?? llapTapaGrosor, d: ov.ancho ?? llapTapaAncho });
      } else {
        pieces.push({ id, layer: "llap-tapa", index: j, x: tapaLlapStartX + llapPos[j] - llapTapaAncho / 2, z: tapaLlapStartZ, y: llapYBase, w: ov.ancho ?? llapTapaAncho, h: ov.grosor ?? llapTapaGrosor, d: ov.largo ?? tapaLlapRunDim });
      }
    }
  }

  // ── Cuadradillos ──
  if (useTapa && useCuadradillos) {
    const cuadTapaY = cubrirTopY + alto;
    const cuadYBase = cuadTapaY - cuadradilloGrosor;
    const cuadH = cuadradilloGrosor;
    const longSpecs = [
      { id: "cuad-long-0", z: 0 },
      { id: "cuad-long-1", z: baseAncho - cuadradilloAncho },
    ];
    for (const ls of longSpecs) {
      const ov = overrides[ls.id] || {};
      pieces.push({ id: ls.id, layer: "cuadradillo", kind: "long", x: 0, z: ov.z ?? ls.z, y: cuadYBase, w: ov.largo ?? baseLargo, h: cuadH, d: ov.ancho ?? cuadradilloAncho });
    }
    const cuadDistDim = baseLargo;
    let cuadCount = calcCount(cuadDistDim, cuadradilloClaro, 0, cuadradilloAncho);
    if (cuadCount < 2) cuadCount = 2;
    const cuadPos = calcPositions(cuadDistDim, cuadCount, 0, cuadradilloAncho);
    const transLen = baseAncho - 2 * cuadradilloAncho;
    if (transLen > 0.5) {
      for (let i = 0; i < cuadPos.length; i++) {
        const id = `cuad-trans-${i}`; const ov = overrides[id] || {};
        pieces.push({ id, layer: "cuadradillo", kind: "trans", index: i, x: (ov.center ?? cuadPos[i]) - (ov.ancho ?? cuadradilloAncho) / 2, z: cuadradilloAncho, y: cuadYBase, w: ov.ancho ?? cuadradilloAncho, h: cuadH, d: ov.largo ?? transLen });
      }
    }
  }

  // ── Puntales ──
  if (usePuntales && useLados && apoyoType === "dobleBase" && dbOrient === "ancho") {
    const dbsP = pieces.filter(p => p.layer === "db");
    if (dbsP.length) {
      const puntalTopCut = (useTapa && useCuadradillos) ? cuadradilloGrosor : 0;
      const puntalY = cubrirTopY;
      const puntalH = alto - puntalTopCut;
      let pIdx = 0;
      for (const db of dbsP) {
        const offX = (baseLargo - db.layerLargo) / 2;
        const cx = db.center + offX;
        for (let si = 0; si < 2; si++) {
          const id = `puntal-${pIdx++}`; const ov = overrides[id] || {};
          const w = ov.ancho ?? puntalAncho;
          const d = ov.grosor ?? puntalGrosor;
          const teG = useTesteros ? testeroGrosor : 0;
          const orG_X = (useOrillas && orillaOrient === "ancho") ? orillaAncho : 0;
          const orG_Z = (useOrillas && orillaOrient === "largo") ? orillaAncho : 0;
          const minX = teG + orG_X;
          const maxX = baseLargo - teG - orG_X - w;
          let px = cx - w / 2;
          px = Math.min(Math.max(px, minX), maxX);
          const baseZ = si === 1 ? (baseAncho - d) : 0;
          const pz = si === 1 ? (baseZ - orG_Z) : (baseZ + orG_Z);
          pieces.push({ id, layer: "puntal", parentIndex: si, x: ov.x ?? px, z: ov.z ?? pz, y: ov.y ?? puntalY, w, h: ov.alto ?? puntalH, d, layerLargo: baseLargo, layerAncho: baseAncho });
        }
      }
    }
  }

  // ── Barrotes de refuerzo ──
  if (useBarrotesRef && useTesteros && useLlapasasLado && llapLadoOrient === "largo") {
    const llapsH = pieces.filter(p => p.layer === "llap-lado" && p.parentIndex === 0);
    const centers = llapsH.map(p => ({ y: p.y, h: p.h })).sort((a, b) => a.y - b.y);
    const inner = centers.slice(1, -1);
    let bIdx = 0;
    for (const c of inner) {
      const cY = c.y + c.h / 2;
      for (let si = 0; si < 2; si++) {
        const id = `bref-${bIdx++}`; const ov = overrides[id] || {};
        const w = ov.grosor ?? barroteRefGrosor;
        const hY = ov.ancho ?? barroteRefAncho;
        const len = ov.largo ?? baseAncho;
        pieces.push({ id, layer: "barrote-ref", parentIndex: si, x: si === 1 ? (baseLargo - w) : 0, z: 0, y: ov.y ?? (cY - hY / 2), w, h: hY, d: len, layerLargo: baseLargo, layerAncho: baseAncho });
      }
    }
  }

  return pieces;
}

// ─── Atajo: desde el estado crudo del envoltorio ────────────────────────────
export function computePiecesFromState(crateJson: Cfg): Piece[] {
  return computePieces(buildConfig(crateJson));
}
