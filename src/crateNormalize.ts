// ============================================================================
// crateNormalize.ts — Piezas de computePieces → cajas AABB (para meshes/bbox)
// ============================================================================
// Port adaptado de `normalizePieces` (exportPDF). Convierte cada pieza al
// rectángulo 3D { layer, x0,y0,z0, x1,y1,z1 } en el espacio de la caja
// (X=largo, Y=alto con suelo en 0, Z=ancho; centrado en X/Z).
// Las piezas inclinadas (llap-incl-*) se aproximan por su AABB: para carga en
// camión el bulto se ve completo igualmente y evita rotaciones complejas.
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Cfg, Piece } from "./crateGeometry";

export interface CajaAABB {
  layer: string;
  id: string;
  x0: number; y0: number; z0: number;
  x1: number; y1: number; z1: number;
}

function isWall(l: string): boolean {
  return l.startsWith("lado") || l.startsWith("testero") || l.startsWith("tapa") ||
         l.startsWith("llap-") || l.startsWith("rec-");
}

export function piezasABoxes(pieces: Piece[], cfg: Cfg): CajaAABB[] {
  const largo = cfg.largo, ancho = cfg.ancho;
  const bLargo = cfg.baseLargo || largo, bAncho = cfg.baseAncho || ancho;
  const out: CajaAABB[] = [];

  const push = (layer: string, id: string, X0: number, Y0: number, Z0: number, X1: number, Y1: number, Z1: number) => {
    out.push({
      layer, id,
      x0: Math.min(X0, X1), y0: Math.min(Y0, Y1), z0: Math.min(Z0, Z1),
      x1: Math.max(X0, X1), y1: Math.max(Y0, Y1), z1: Math.max(Z0, Z1),
    });
  };

  for (const p of pieces) {
    const l = p.layer as string;
    const pLargo = p.layerLargo != null ? p.layerLargo : (isWall(l) ? bLargo : largo);
    const pAncho = p.layerAncho != null ? p.layerAncho : (isWall(l) ? bAncho : ancho);
    const ox = -pLargo / 2, oz = -pAncho / 2;
    let X0: number, Y0: number, Z0: number, X1: number, Y1: number, Z1: number, t: number;

    // Piezas con w/h/d explícitos (llapasas, rec, inclinadas)
    if (p.w != null) {
      if (p.cx != null) {
        // Inclinada → AABB alrededor del centro (aprox. por w/h/d sin rotar)
        const hw = p.w / 2, hh = p.h / 2, hd = p.d / 2;
        push(l, p.id, ox + p.cx - hw, p.cy - hh, oz + p.cz - hd, ox + p.cx + hw, p.cy + hh, oz + p.cz + hd);
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
    push(l, p.id, x, y, z, x + w, y + h, z + d);
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
