// ============================================================================
// crateNormalize.ts — Piezas de computePieces → cajas AABB (para meshes/bbox)
// ============================================================================
// Port adaptado de `normalizePieces` (exportPDF). Convierte cada pieza al
// rectángulo 3D { layer, x0,y0,z0, x1,y1,z1 } en el espacio de la caja
// (X=largo, Y=alto con suelo en 0, Z=ancho; centrado en X/Z).
// Las piezas inclinadas (llap-incl-*) se convierten a su caja envolvente ya
// rotada (rotZ/rotX incluida) — no una aproximación sin rotar.
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Cfg, Piece } from "./crateGeometry";

export interface CajaAABB {
  layer: string;
  id: string;
  x0: number; y0: number; z0: number;
  x1: number; y1: number; z1: number;
  /**
   * Presente SOLO en piezas inclinadas (llap-incl-*): su forma real (centro
   * + dimensiones LOCALES sin rotar + eje/ángulo de giro), para que el
   * render de "Detalle 3D" (caja MONTADA) pueda dibujar el tablero
   * realmente inclinado en vez de un bloque recto del tamaño de su caja
   * envolvente. x0..z1 siguen siendo la caja envolvente ya rotada (para
   * bbox/huecos/desmontado, que si necesitan un AABB de verdad).
   * `desmontarBoxes` retira este campo al tumbar la pieza (deja de ser
   * válido una vez reposicionada como panel plano).
   */
  rot?: { axis: "x" | "z"; angle: number; cx: number; cy: number; cz: number; w: number; h: number; d: number };
  /** Presente SOLO en barrotes sueltos: a qué cara estaba asociado en el
   * constructor (o null si es libre) — puramente informativo aquí, ya no
   * se usa para decidir nada en el desmontado (ver esInmovilizado: todo
   * barrote/barrote-ref/puntal va a su propia fila, sin mirar esto). */
  attachedTo?: string | null;
}

function isWall(l: string): boolean {
  return l.startsWith("lado") || l.startsWith("testero") || l.startsWith("tapa") ||
         l.startsWith("llap-") || l.startsWith("rec-");
}

export function piezasABoxes(pieces: Piece[], cfg: Cfg): CajaAABB[] {
  const largo = cfg.largo, ancho = cfg.ancho;
  const bLargo = cfg.baseLargo || largo, bAncho = cfg.baseAncho || ancho;
  const out: CajaAABB[] = [];

  const push = (
    layer: string, id: string, X0: number, Y0: number, Z0: number, X1: number, Y1: number, Z1: number,
    rot?: CajaAABB["rot"], attachedTo?: string | null,
  ) => {
    out.push({
      layer, id,
      x0: Math.min(X0, X1), y0: Math.min(Y0, Y1), z0: Math.min(Z0, Z1),
      x1: Math.max(X0, X1), y1: Math.max(Y0, Y1), z1: Math.max(Z0, Z1),
      ...(rot ? { rot } : {}),
      ...(attachedTo !== undefined ? { attachedTo } : {}),
    });
  };

  const hiddenPieces = (cfg.hiddenPieces ?? {}) as Record<string, boolean>;

  for (const p of pieces) {
    // Igual que el propio visor del constructor: una pieza ocultada ahí
    // (para inspeccionar el interior) no debe aparecer tampoco aquí.
    if (hiddenPieces[p.id as string]) continue;
    const l = p.layer as string;
    const pLargo = p.layerLargo != null ? p.layerLargo : (isWall(l) ? bLargo : largo);
    const pAncho = p.layerAncho != null ? p.layerAncho : (isWall(l) ? bAncho : ancho);
    const ox = -pLargo / 2, oz = -pAncho / 2;
    let X0: number, Y0: number, Z0: number, X1: number, Y1: number, Z1: number, t: number;

    // Piezas con w/h/d explícitos (llapasas, rec, inclinadas)
    if (p.w != null) {
      if (p.cx != null) {
        // Inclinada: caja rotada de verdad (rotZ en lado mezcla w/h en el
        // plano X-Y; rotX en testero mezcla h/d en el plano Y-Z), no una
        // aproximación sin rotar — si no, la altura/huella salían por
        // debajo de lo real en cuanto la pieza tenía inclinación.
        const esTestero = l === "llap-incl-testero";
        const theta = esTestero ? (p.rotX || 0) : (p.rotZ || 0);
        const cosT = Math.abs(Math.cos(theta)), sinT = Math.abs(Math.sin(theta));
        const hw = esTestero ? p.w / 2 : (p.w * cosT + p.h * sinT) / 2;
        const hh = esTestero ? (p.h * cosT + p.d * sinT) / 2 : (p.w * sinT + p.h * cosT) / 2;
        const hd = esTestero ? (p.h * sinT + p.d * cosT) / 2 : p.d / 2;
        push(l, p.id, ox + p.cx - hw, p.cy - hh, oz + p.cz - hd, ox + p.cx + hw, p.cy + hh, oz + p.cz + hd, {
          axis: esTestero ? "x" : "z", angle: theta,
          cx: ox + p.cx, cy: p.cy, cz: oz + p.cz,
          w: p.w, h: p.h, d: p.d,
        });
        continue;
      }
      // Cuadradillos: marco base (bLargo/bAncho); resto usa pLargo/pAncho
      const oxC = (l === "cuadradillo") ? -bLargo / 2 : ox;
      const ozC = (l === "cuadradillo") ? -bAncho / 2 : oz;
      X0 = oxC + p.x; X1 = X0 + p.w;
      Y0 = p.y; Y1 = Y0 + p.h;
      Z0 = ozC + p.z; Z1 = Z0 + p.d;
      push(l, p.id, X0, Y0, Z0, X1, Y1, Z1);
      continue;
    }

    let w: number | undefined, h: number | undefined, d: number | undefined, x = 0, z = 0;
    const y = p.y || 0;

    if (l === "db") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      if (p.orient === "ancho") { x = ox + p.center - (w as number) / 2; z = oz + (pAncho - (d as number)) / 2; }
      else { t = w as number; w = d; d = t; x = ox + (pLargo - (w as number)) / 2; z = oz + p.center - (d as number) / 2; }
    } else if (l === "rastrel") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      const rs = p.runStart || 0;
      if (p.orient === "largo") { t = w as number; w = d; d = t; x = ox + rs; z = oz + p.center - (d as number) / 2; }
      else { x = ox + p.center - (w as number) / 2; z = oz + rs; }
    } else if (l === "tablon" || l === "intermedia") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      if (p.orient === "largo") { t = w as number; w = d; d = t; x = ox + (pLargo - (w as number)) / 2; z = oz + p.center - (d as number) / 2; }
      else { x = ox + p.center - (w as number) / 2; z = oz + (pAncho - (d as number)) / 2; }
    } else if (l === "taco") {
      w = p.largoPieza; h = p.alto; d = p.ancho;
      x = ox + p.centerX - (w as number) / 2; z = oz + p.centerZ - (d as number) / 2;
    } else if (l === "taco-arrastre") {
      if (p.runAlongX) { w = p.largoPieza; d = p.ancho; } else { w = p.ancho; d = p.largoPieza; }
      h = p.alto; x = ox + p.x; z = oz + p.z;
    } else if (l === "recuadro") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      if (p.orient === "ancho") { x = ox + p.centerDist - (w as number) / 2; z = oz + p.centerRun - (d as number) / 2; }
      else { t = w as number; w = d; d = t; x = ox + p.centerRun - (w as number) / 2; z = oz + p.centerDist - (d as number) / 2; }
    } else if (l === "cubrir-plancha") {
      w = p.largoPieza; h = p.alto; d = p.anchoPieza; x = ox; z = oz;
    } else if (l === "cubrir-tabla") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      if (p.orient === "largo") { t = w as number; w = d; d = t; x = ox; z = oz + p.center - (d as number) / 2; }
      else { x = ox + p.center - (w as number) / 2; z = oz; }
    } else if (l === "orilla") {
      w = p.ancho; h = p.alto; d = p.largoPieza;
      if (p.orient === "largo") { t = w as number; w = d; d = t; x = ox + (pLargo - (w as number)) / 2; z = oz + p.center - (d as number) / 2; }
      else { x = ox + p.center - (w as number) / 2; z = oz + (pAncho - (d as number)) / 2; }
    } else if (l === "tapaboca") {
      w = (p.orient === "largo") ? p.largoPieza : p.ancho;
      h = p.alto;
      d = (p.orient === "largo") ? p.ancho : p.largoPieza;
      if (p.orient === "largo") { x = ox + p.center - (w as number) / 2; z = oz + p.edgePos; }
      else { x = ox + p.edgePos; z = oz + p.center - (d as number) / 2; }
    } else if (l === "barrote") {
      // Suelto: x/z ya vienen en coordenadas de mundo (sin el offset ox/oz
      // del resto de piezas) y representan el CENTRO, no una esquina —
      // igual que en el constructor.
      if (p.orient === "largo") { w = p.largo; h = p.alto; d = p.ancho; }
      else if (p.orient === "ancho") { w = p.ancho; h = p.alto; d = p.largo; }
      else { w = p.ancho; h = p.largo; d = p.alto; } // vertical
      x = (p.x as number) - (w as number) / 2; z = (p.z as number) - (d as number) / 2;
    } else if (l === "lado-plancha" || l === "testero-plancha" || l === "tapa-plancha") {
      w = p.largoPieza; h = p.alto; d = p.anchoPieza; x = ox + p.x; z = oz + p.z;
    } else if (l === "lado-tabla") {
      w = p.boardsAlongAlto !== false ? p.ancho : p.alto;
      h = p.boardsAlongAlto !== false ? p.alto : p.ancho;
      d = p.largoPieza; x = ox + p.x; z = oz + p.z;
    } else if (l === "testero-tabla") {
      w = p.largoPieza;
      h = p.boardsAlongAlto !== false ? p.alto : p.ancho;
      d = p.boardsAlongAlto !== false ? p.ancho : p.alto;
      x = ox + p.x; z = oz + p.z;
    } else if (l === "tapa-tabla") {
      w = p.boardsAlongLargo !== false ? p.largoPieza : p.ancho;
      h = p.alto;
      d = p.boardsAlongLargo !== false ? p.ancho : p.largoPieza;
      x = ox + p.x; z = oz + p.z;
    } else {
      continue;
    }

    if (w == null || h == null || d == null) continue;
    push(l, p.id, x, y, z, x + w, y + h, z + d, undefined, l === "barrote" ? (p.attachedTo ?? null) : undefined);
  }

  return out;
}

export interface BBox {
  minX: number; minY: number; minZ: number;
  maxX: number; maxY: number; maxZ: number;
  largo: number; alto: number; ancho: number;
}

export function bboxDeBoxes(boxes: CajaAABB[]): BBox {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const b of boxes) {
    if (b.x0 < minX) minX = b.x0; if (b.y0 < minY) minY = b.y0; if (b.z0 < minZ) minZ = b.z0;
    if (b.x1 > maxX) maxX = b.x1; if (b.y1 > maxY) maxY = b.y1; if (b.z1 > maxZ) maxZ = b.z1;
  }
  return {
    minX, minY, minZ, maxX, maxY, maxZ,
    largo: maxX - minX, alto: maxY - minY, ancho: maxZ - minZ,
  };
}

// ============================================================================
// Desmontado: tumba lado(s)/testero(s)/tapa y los apila planos sobre la base
// ============================================================================
// Mismo criterio geométrico que `aplicarVistaDesmontada` en el constructor:
// la base (rastrel/db/taco/intermedia/tablon/cubrir/orilla/tapaboca/taco
// arrastre/recuadro) se queda montada tal cual. El lado gira sobre el eje
// largo (su alto pasa a ser huella en el eje ancho; su grosor pasa a ser la
// altura que aporta al apilado). El testero gira sobre el eje ancho (su alto
// pasa a ser huella en el eje largo; su grosor aporta altura). La tapa ya
// está tumbada, solo baja a su sitio en el apilado.
//
// LIMITACIÓN: igual que el resto del visor de detalle del planificador, esto
// no incluye llapasas/recuadros/refuerzos — `piezasABoxes` ya no los genera
// (ver `isWall`/el switch de arriba), solo los paneles estructurales
// (paredes, tapa, base). Es la misma limitación que ya tenía la caja montada
// aquí, no una nueva.
// ----------------------------------------------------------------------------

const LADO_LAYERS = new Set(["lado-plancha", "lado-tabla", "llap-lado", "llap-incl-lado", "rec-lado"]);
const TESTERO_LAYERS = new Set(["testero-plancha", "testero-tabla", "llap-testero", "llap-incl-testero", "rec-testero"]);
const TAPA_LAYERS = new Set(["tapa-plancha", "tapa-tabla", "llap-tapa", "rec-tapa", "cuadradillo"]);

/**
 * Barrotes sueltos, barrotes de refuerzo y puntales son calzos para
 * inmovilizar la mercancía dentro de la caja — no son parte estructural de
 * ningún lado/testero/tapa (aunque un barrote suelto pueda llevar un
 * `attachedTo` informativo). En modo desmontado no tiene sentido pegarlos
 * a ningún panel en concreto: van todos juntos en su propia fila compacta,
 * tumbados sobre su cara más ancha (ver dimensionesTumbadas más abajo).
 * Mismo criterio que `esPiezaInmovilizado`/`caraDePieza` en el constructor
 * (App.jsx) — antes se excluían del todo (ver el histórico de este
 * fichero), ahora se colocan de verdad.
 */
function esInmovilizado(b: CajaAABB): boolean {
  return b.layer === "puntal" || b.layer === "barrote-ref" || b.layer === "barrote";
}

/** El id de cada pieza lleva el índice de cara justo detrás ("lado-0",
 * "testero-1-tabla-3"...). Hace falta para tumbar cada lado/testero POR
 * SEPARADO: si se tratan juntos, la unión de sus dos cajas mide el hueco
 * ENTERO entre ambos (el ancho de la caja), no el grosor de un panel. */
function parteLadoTestero(id: string): number | null {
  const m = /(?:lado|testero)-(\d)/.exec(id);
  return m ? Number(m[1]) : null;
}

/**
 * Dimensiones (w horizontal, h vertical, d horizontal) de una pieza suelta
 * (barrote, puntal) tumbada sobre su cara MÁS ANCHA — la dimensión MENOR
 * de las tres pasa a ser el alto (h), no da igual cuál de las otras dos
 * quede de canto. Mismo criterio, mismos tres casos, que `tumbarSiHaceFalta`
 * en el constructor (App.jsx) — aquí no hay malla que rotar de verdad, solo
 * hace falta la caja ya reorientada, así que basta con reasignar qué
 * dimensión original va a cada eje de salida.
 */
function dimensionesTumbadas(b: CajaAABB): { w: number; h: number; d: number } {
  const w0 = b.x1 - b.x0, h0 = b.y1 - b.y0, d0 = b.z1 - b.z0;
  if (w0 <= h0 && w0 <= d0) return { w: h0, h: w0, d: d0 };
  if (d0 <= h0 && d0 <= w0) return { w: w0, h: d0, d: h0 };
  return { w: w0, h: h0, d: d0 };
}

interface RangoBox {
  minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number;
}

function rangoDe(boxes: CajaAABB[]): RangoBox | null {
  if (!boxes.length) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const b of boxes) {
    if (b.x0 < minX) minX = b.x0; if (b.x1 > maxX) maxX = b.x1;
    if (b.y0 < minY) minY = b.y0; if (b.y1 > maxY) maxY = b.y1;
    if (b.z0 < minZ) minZ = b.z0; if (b.z1 > maxZ) maxZ = b.z1;
  }
  return { minX, maxX, minY, maxY, minZ, maxZ };
}

// Los barrotes sueltos, barrotes de refuerzo y puntales no van pegados a
// ningún lado/testero (son calzos para inmovilizar la mercancía, no parte
// de la caja): se agrupan todos juntos en su propia fila compacta,
// tumbados sobre su cara más ancha, encima de todo lo demás (ver
// esInmovilizado/dimensionesTumbadas más arriba).
//
// OPTIMIZACIÓN DE ALTURA: los 2 lados SIEMPRE se apilan uno encima del otro
// (misma huella, son el mismo panel por duplicado) — igual los 2 testeros
// entre sí. Es ese conjunto ya apilado ("bloque lado", "bloque testero"), no
// cada panel suelto, el que luego se intenta colocar uno al lado del otro en
// la misma capa (girando en planta el que haga falta) cuando la pared (alto)
// es pequeña frente al largo/ancho de la base y caben sin pisarse — y solo si
// eso NO hace crecer la huella que ya establece la base/tapa. Si no caben
// juntos, cada bloque va en su propia capa.
export function desmontarBoxes(boxesOriginales: CajaAABB[]): CajaAABB[] {
  const boxes = boxesOriginales.filter(b => !esInmovilizado(b));
  const esLado = (b: CajaAABB) => LADO_LAYERS.has(b.layer);
  const esTestero = (b: CajaAABB) => TESTERO_LAYERS.has(b.layer);
  const esTapa = (b: CajaAABB) => TAPA_LAYERS.has(b.layer);
  const esBase = (b: CajaAABB) => !esLado(b) && !esTestero(b) && !esTapa(b);

  const baseBoxes = boxes.filter(esBase);
  const rangoBase = rangoDe(baseBoxes);
  if (!rangoBase) return boxes; // sin base (no debería pasar), se deja tal cual

  const resultado: CajaAABB[] = [...baseBoxes];
  let stackY = rangoBase.maxY;
  const largoBase = rangoBase.maxX - rangoBase.minX;
  const anchoBase = rangoBase.maxZ - rangoBase.minZ;

  interface Preparado {
    cajas: CajaAABB[];   // ya tumbadas, con Y normalizado a partir de 0
    grosor: number;      // extensión en Y (lo que aporta al apilado)
    footprintX: number;
    footprintZ: number;
  }

  // Tumba un grupo (ya filtrado a un único lado/testero, o la tapa entera):
  // gira las cajas (lado sobre el eje largo, testero sobre el eje ancho,
  // tapa sin girar) y normaliza los TRES ejes a partir de 0 — la posición
  // final (anclada a la esquina real de la base, más la capa y el posible
  // desplazamiento por compartir capa) se decide después, en `colocar`.
  const prepararGrupo = (grupo: CajaAABB[], eje: "x" | "z" | null): Preparado | null => {
    if (!grupo.length) return null;
    const r = rangoDe(grupo)!;
    const cajas = grupo.map((b): CajaAABB => {
      // rot describe la pieza en su posición ORIGINAL (montada) — tras
      // tumbarla/reposicionarla aquí deja de ser válida, se retira.
      const { rot: _rot, ...sinRot } = b;
      if (eje === "x") {
        // Lado: alto (Y) → huella en Z; grosor (Z) → altura de apilado.
        return { ...sinRot, x0: b.x0 - r.minX, x1: b.x1 - r.minX, y0: b.z0 - r.minZ, y1: b.z1 - r.minZ, z0: b.y0 - r.minY, z1: b.y1 - r.minY };
      } else if (eje === "z") {
        // Testero: alto (Y) → huella en X; grosor (X) → altura de apilado.
        return { ...sinRot, x0: b.y0 - r.minY, x1: b.y1 - r.minY, y0: b.x0 - r.minX, y1: b.x1 - r.minX, z0: b.z0 - r.minZ, z1: b.z1 - r.minZ };
      }
      // Tapa: ya tumbada, solo se normalizan sus tres ejes a partir de 0.
      return { ...sinRot, x0: b.x0 - r.minX, x1: b.x1 - r.minX, y0: b.y0 - r.minY, y1: b.y1 - r.minY, z0: b.z0 - r.minZ, z1: b.z1 - r.minZ };
    });
    const rt = rangoDe(cajas)!;
    return { cajas, grosor: rt.maxY - rt.minY, footprintX: rt.maxX - rt.minX, footprintZ: rt.maxZ - rt.minZ };
  };

  /** Apila B directamente encima de A: misma huella X/Z (ambos ya
   * normalizados a partir de 0,0), solo cambia Y. Así se combinan siempre
   * los dos lados entre sí, y los dos testeros entre sí. */
  const apilarPareja = (a: Preparado | null, b: Preparado | null): Preparado | null => {
    if (!a) return b;
    if (!b) return a;
    return {
      cajas: [...a.cajas, ...b.cajas.map(c => ({ ...c, y0: c.y0 + a.grosor, y1: c.y1 + a.grosor }))],
      grosor: a.grosor + b.grosor,
      footprintX: Math.max(a.footprintX, b.footprintX),
      footprintZ: Math.max(a.footprintZ, b.footprintZ),
    };
  };

  /** Gira un bloque ya tumbado 90° EN PLANTA (sobre el eje vertical): cambia
   * cuál de sus dos dimensiones horizontales queda a lo largo o a lo ancho.
   * Necesario para alinear el bloque testero con el bloque lado cuando se
   * colocan juntos en la misma capa. */
  const girarEnPlanta = (p: Preparado): Preparado => ({
    grosor: p.grosor, footprintX: p.footprintZ, footprintZ: p.footprintX,
    cajas: p.cajas.map(b => ({ ...b, x0: b.z0, x1: b.z1, z0: b.x0, z1: b.x1 })),
  });

  /** Añade un bloque ya preparado al resultado, en la capa `y`, anclado a la
   * esquina real de la base (para que no quede flotando en su propio marco
   * normalizado a partir de 0), con un desplazamiento opcional en X/Z para
   * convivir con otro bloque en la misma capa sin pisarse. */
  const colocar = (p: Preparado, y: number, offsetX = 0, offsetZ = 0) => {
    for (const b of p.cajas) {
      resultado.push({
        ...b,
        x0: b.x0 + offsetX + rangoBase.minX, x1: b.x1 + offsetX + rangoBase.minX,
        y0: b.y0 + y,                        y1: b.y1 + y,
        z0: b.z0 + offsetZ + rangoBase.minZ, z1: b.z1 + offsetZ + rangoBase.minZ,
      });
    }
  };

  const tapaPrep = prepararGrupo(boxes.filter(esTapa), null);
  const lado0Prep = prepararGrupo(boxes.filter(b => esLado(b) && parteLadoTestero(b.id) === 0), "x");
  const lado1Prep = prepararGrupo(boxes.filter(b => esLado(b) && parteLadoTestero(b.id) === 1), "x");
  const testero0Prep = prepararGrupo(boxes.filter(b => esTestero(b) && parteLadoTestero(b.id) === 0), "z");
  const testero1Prep = prepararGrupo(boxes.filter(b => esTestero(b) && parteLadoTestero(b.id) === 1), "z");

  if (tapaPrep) { colocar(tapaPrep, stackY); stackY += tapaPrep.grosor; }

  // Los 2 lados siempre juntos, uno encima del otro; igual los 2 testeros.
  const bloqueLado = apilarPareja(lado0Prep, lado1Prep);
  const bloqueTestero = apilarPareja(testero0Prep, testero1Prep);

  if (bloqueLado && bloqueTestero) {
    // El alto de pared debería coincidir en ambos bloques; se coge el mayor
    // para el chequeo de encaje, por seguridad ante cualquier asimetría.
    const alto = Math.max(bloqueLado.footprintZ, bloqueTestero.footprintX);
    const combinaCabe = alto > 0 && 2 * alto <= Math.min(largoBase, anchoBase);
    if (combinaCabe) {
      if (anchoBase <= largoBase) {
        colocar(bloqueLado, stackY, 0, 0);
        const testeroGirado = girarEnPlanta(bloqueTestero);
        colocar(testeroGirado, stackY, 0, bloqueLado.footprintZ);
      } else {
        const ladoGirado = girarEnPlanta(bloqueLado);
        colocar(ladoGirado, stackY, 0, 0);
        colocar(bloqueTestero, stackY, ladoGirado.footprintX, 0);
      }
      stackY += Math.max(bloqueLado.grosor, bloqueTestero.grosor);
    } else {
      colocar(bloqueLado, stackY); stackY += bloqueLado.grosor;
      colocar(bloqueTestero, stackY); stackY += bloqueTestero.grosor;
    }
  } else if (bloqueLado) {
    colocar(bloqueLado, stackY); stackY += bloqueLado.grosor;
  } else if (bloqueTestero) {
    colocar(bloqueTestero, stackY); stackY += bloqueTestero.grosor;
  }

  // Barrotes sueltos, barrotes de refuerzo y puntales: van todos juntos en
  // una única fila compacta encima de todo lo demás — se tumban sobre su
  // cara más ancha (dimensionesTumbadas) y se reparten en planta uno junto
  // a otro (estantería simple: de izquierda a derecha, saltando de fila
  // dentro de la misma capa cuando no cabe más a lo largo) para no sumar
  // más altura de la que hace falta. Mismo criterio que
  // aplicarVistaDesmontada en el constructor (App.jsx).
  const piezasInmovilizado = boxesOriginales.filter(esInmovilizado);
  if (piezasInmovilizado.length) {
    let curX = 0, curZ = 0, filaProfundidad = 0, capaGrosor = 0;
    for (const b of piezasInmovilizado) {
      const { w, h, d } = dimensionesTumbadas(b);
      if (curX > 0 && curX + w > largoBase) { curX = 0; curZ += filaProfundidad; filaProfundidad = 0; }
      resultado.push({
        layer: b.layer, id: b.id,
        x0: rangoBase.minX + curX, x1: rangoBase.minX + curX + w,
        y0: stackY, y1: stackY + h,
        z0: rangoBase.minZ + curZ, z1: rangoBase.minZ + curZ + d,
      });
      curX += w;
      filaProfundidad = Math.max(filaProfundidad, d);
      capaGrosor = Math.max(capaGrosor, h);
    }
    stackY += capaGrosor;
  }

  return resultado;
}