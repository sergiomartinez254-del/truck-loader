// ============================================================================
// crateMeshes.ts — Geometría real de una caja como THREE.Group para el camión
// ============================================================================
// No importa THREE: se lo pasa la escena (misma instancia ESM del planificador).
// Dado el JSON crudo de una caja, construye un grupo de cajas (una por pieza),
// escalado para ocupar EXACTAMENTE la celda destino [0,largo]×[0,alto]×[0,ancho]
// en unidades de escena, con origen en la esquina (igual convención que la
// escena actual). Cachea el cálculo de piezas por JSON (lo caro).
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

import { computePiecesFromState, buildConfig, computePieces, type Cfg } from "./crateGeometry";
import { piezasABoxes, bboxDeBoxes, desmontarBoxes, type CajaAABB, type BBox } from "./crateNormalize";

interface CacheEntry { boxes: CajaAABB[]; bbox: BBox; }
// Cachés separadas: la geometría montada y la desmontada son formas distintas
// del mismo crateJson, así que no pueden compartir entrada de caché.
const cache = new WeakMap<object, CacheEntry>();
const cacheDesmontado = new WeakMap<object, CacheEntry>();

function geomDeCrate(crateJson: Cfg, desmontado = false): CacheEntry {
  const store = desmontado ? cacheDesmontado : cache;
  if (crateJson && typeof crateJson === "object") {
    const hit = store.get(crateJson as object);
    if (hit) return hit;
  }
  const cfg = buildConfig(crateJson);
  const pieces = computePieces(cfg);
  let boxes = piezasABoxes(pieces, cfg);
  if (desmontado) boxes = desmontarBoxes(boxes);
  const bbox = bboxDeBoxes(boxes);
  const entry: CacheEntry = { boxes, bbox };
  if (crateJson && typeof crateJson === "object") store.set(crateJson as object, entry);
  return entry;
}

// Tinte por capa: mantiene el color de la referencia pero distingue estructura.
function factorLuz(layer: string): number {
  if (layer.startsWith("cubrir") || layer.startsWith("tapa")) return 1.15;
  if (layer.startsWith("lado") || layer.startsWith("testero")) return 1.0;
  if (layer.startsWith("llap") || layer.startsWith("rec")) return 0.9;
  if (layer === "db" || layer === "taco" || layer === "rastrel" ||
      layer === "tablon" || layer === "intermedia" || layer === "orilla") return 0.72;
  return 0.85;
}

export interface OpcionesMeshCrate {
  colorBase?: string;
  rotar90?: boolean;
  conAristas?: boolean;
  opacidad?: number;
  /** Escala cm→escena (la ESCALA global de scene3d). */
  escala: number;
  /** Carga encima: N láminas con su huella y alto reales (cm). */
  cargaEncima?: { unidades: number; laminaLargoCm: number; laminaAnchoCm: number; laminaAltoCm: number };
  /**
   * Si es true, dibuja lado/testero/tapa tumbados y apilados sobre la base
   * (bulto tal y como se transporta desmontado) en vez de la caja montada.
   */
  desmontado?: boolean;
}

/** Geometrías y materiales creados en una llamada a construirMeshCrate, para
 * poder liberarlos explícitamente cuando el Group deja de usarse (ver
 * `group.userData.recursos3d` en el valor devuelto). */
export interface Recursos3D {
  geoms: any[];
  mats: any[];
}

export function construirMeshCrate(
  THREE: any,
  crateJson: Cfg,
  opts: OpcionesMeshCrate
): any {
  const { boxes, bbox } = geomDeCrate(crateJson, opts.desmontado ?? false);
  const group = new THREE.Group();
  const geomsCreadas: any[] = [];
  const matsCreadas: any[] = [];
  group.userData.recursos3d = { geoms: geomsCreadas, mats: matsCreadas } as Recursos3D;
  if (!boxes.length) return group;

  const E = opts.escala * 10;   // geometría en cm → mm → escena
  const colorBase = new THREE.Color(opts.colorBase ?? "#c8a05a");
  const conAristas = opts.conAristas ?? true;
  const opac = opts.opacidad ?? 1;

  const matPorFactor = new Map<number, any>();
  const material = (layer: string) => {
    const f = factorLuz(layer);
    let m = matPorFactor.get(f);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: colorBase.clone().multiplyScalar(f),
        roughness: 0.6, metalness: 0.04, transparent: opac < 1, opacity: opac,
      });
      matPorFactor.set(f, m);
      matsCreadas.push(m);
    }
    return m;
  };
  const matBorde = conAristas
    ? new THREE.LineBasicMaterial({ color: 0x2a1c0a, transparent: true, opacity: 0.35 })
    : null;
  if (matBorde) matsCreadas.push(matBorde);

  // inner: geometría del palet a tamaño real (cm), centrada en X/Z, suelo en y=0
  const inner = new THREE.Group();
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cz = (bbox.minZ + bbox.maxZ) / 2;
  for (const b of boxes) {
    const w = (b.x1 - b.x0) * E, h = (b.y1 - b.y0) * E, d = (b.z1 - b.z0) * E;
    if (w <= 0 || h <= 0 || d <= 0) continue;
    const geo = new THREE.BoxGeometry(w, h, d);
    geomsCreadas.push(geo);
    const mesh = new THREE.Mesh(geo, material(b.layer));
    mesh.position.set(((b.x0 + b.x1) / 2 - cx) * E, (b.y0 + b.y1) / 2 * E, ((b.z0 + b.z1) / 2 - cz) * E);
    inner.add(mesh);
    if (matBorde) {
      const edges = new THREE.EdgesGeometry(geo);
      geomsCreadas.push(edges);
      const ls = new THREE.LineSegments(edges, matBorde);
      ls.position.copy(mesh.position);
      inner.add(ls);
    }
  }

  // Láminas encima, a tamaño real, centradas, apiladas sobre el techo del palet
  if (opts.cargaEncima && opts.cargaEncima.unidades > 0) {
    const c = opts.cargaEncima;
    const lw = c.laminaLargoCm * E, ld = c.laminaAnchoCm * E, lh = c.laminaAltoCm * E;
    const matLam = new THREE.MeshStandardMaterial({
      color: colorBase.clone().multiplyScalar(1.25),
      roughness: 0.5, metalness: 0.04, transparent: opac < 1, opacity: opac,
    });
    matsCreadas.push(matLam);
    const topPalet = bbox.maxY * E;
    for (let k = 0; k < c.unidades; k++) {
      const geo = new THREE.BoxGeometry(lw, lh, ld);
      geomsCreadas.push(geo);
      const m = new THREE.Mesh(geo, matLam);
      m.position.set(0, topPalet + lh * (k + 0.5), 0);
      inner.add(m);

      const edges = new THREE.EdgesGeometry(geo);
      geomsCreadas.push(edges);
      const borde = new THREE.LineSegments(edges, matBorde);
      borde.position.copy(m.position);
      borde.renderOrder = 1;
      inner.add(borde);
    }
  }

  // Rotación 90° opcional (huella girada por el packer / rotación manual)
  if (opts.rotar90) inner.rotation.y = Math.PI / 2;

  group.add(inner);
  return group;
}

// Reexport por comodidad
export { computePiecesFromState };
/** Dimensiones nativas de la caja (cm) a partir de su JSON, sin escalar.
 * Con `desmontado=true`, devuelve las del bulto tumbado y apilado en vez de
 * las de la caja montada (mismo cálculo que usa "Detalle 3D" para dibujarlo,
 * así que nunca puede desincronizarse de lo que de verdad se ve). */
export function bboxNativoCrate(crateJson: Cfg, desmontado = false): { largo: number; ancho: number; alto: number } {
  const { bbox } = geomDeCrate(crateJson, desmontado);
  return { largo: bbox.largo, ancho: bbox.ancho, alto: bbox.alto };
}