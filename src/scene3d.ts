import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { PlacedPallet, TruckLoadPlan } from "./types";
import { construirMeshCrate, bboxNativoCrate } from "./crateMeshes";

const ESCALA = 1 / 100;           // 1 Three.js unit = 100 mm
const SNAP_MM = 50;                // rejilla de snap durante drag
const DRAG_THRESHOLD_PX = 4;      // píxeles para distinguir click de drag
/** Brecha entre el camión y la zona de espera (mm). */
const ESPERA_GAP_MM = 400;
/** Ancho de la zona de espera (mm), igual que el camión para simetría. */
const ESPERA_ANCHO_MM = 2400;

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados
// ─────────────────────────────────────────────────────────────────────────────

export interface PaletSeleccionado {
  refId: string;
  paletIds: string[];
  /** Clave exacta del grupo (truckX-truckY en mm exactos), usada para localizar el bloqueo. */
  stackKey: string;
  largoMm: number;
  anchoMm: number;
  alturaApilaMm: number;
  unidades: number;
  niveles: number;
  posXcm: number;
  posYcm: number;
  enEspera: boolean;
  bloqueado: boolean;
}

export interface EscenaHandle {
  destruir: () => void;
  setModoManual: (activo: boolean) => void;
  getCameraState: () => { px: number; py: number; pz: number; tx: number; ty: number; tz: number } | null;
}

export interface EscenaOpciones {
  onSeleccion?: (info: PaletSeleccionado | null) => void;
  onMoverCamion?: (paletIds: string[], nuevaX: number, nuevaY: number) => void;
  onEnviarEspera?: (paletIds: string[]) => void;
  crateGeomPorRef?: Map<string, unknown>;
  crateInfoPorRef?: Map<string, { tipo: string; paletBase: string | null; unidades: number; laminaAltoMm: number; laminaLargoCm: number; laminaAnchoCm: number }>;
  rotacionVisual?: Map<string, boolean>;
  detalle?: boolean;
  onRecuperarDeEspera?: (paletIds: string[], nuevaX: number, nuevaY: number) => void;
  /** Si se pasa, la cámara se restaura a esta posición en vez de la por defecto. */
  cameraState?: { px: number; py: number; pz: number; tx: number; ty: number; tz: number };
}

/** Info de una pila en zona de espera, para que scene3d la renderice. */
export interface StagedStackInfo {
  id: string;
  palets: PlacedPallet[];
  slotIdx: number;  // posición en la fila de la zona de espera
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos internos de cada Group
// ─────────────────────────────────────────────────────────────────────────────

interface StackData {
  stackKey: string;
  refId: string;
  paletIds: string[];
  truckX: number;
  truckY: number;
  anchoMm: number;
  largoMm: number;
  alturaTotal: number;
  unidades: number;
  niveles: number;
  enEspera: boolean;
  bloqueado: boolean;
  stagedId?: string;
  slotIdx?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal
// ─────────────────────────────────────────────────────────────────────────────

export function crearEscena3D(
  container: HTMLElement,
  camion: TruckLoadPlan,
  colorPorReferencia: Map<string, string>,
  staged: StagedStackInfo[],
  lockedKeys: Set<string>,
  opciones?: EscenaOpciones
): EscenaHandle {
  const { onSeleccion, onMoverCamion, onEnviarEspera, onRecuperarDeEspera } = opciones ?? {};
  const crateGeomPorRef = opciones?.crateGeomPorRef;
  const detalle = opciones?.detalle ?? false;
  const paletsMutable = camion.pallets;
  const rotacionVisual = opciones?.rotacionVisual;
  const crateInfoPorRef = opciones?.crateInfoPorRef;
    // ── Dimensiones ───────────────────────────────────────────────────────────
  const W = container.clientWidth || 800;
  const H = container.clientHeight || 480;
  const largo     = camion.truckProfile.largoInteriorMm * ESCALA;
  const anchoCam  = camion.truckProfile.anchoInteriorMm * ESCALA;
  const altoCam   = camion.truckProfile.altoInteriorMm  * ESCALA;
  const esperaGap = ESPERA_GAP_MM  * ESCALA;
  const esperaAncho = ESPERA_ANCHO_MM * ESCALA;

  // ── Renderer & camera ────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1419);
  scene.fog = new THREE.Fog(0x0f1419, largo * 2, largo * 5);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
  camera.position.set(largo * 0.95, altoCam * 1.8, (anchoCam + esperaGap + esperaAncho) * 1.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // ── Lights ───────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x14181f, 1.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(largo * 0.7, altoCam * 3.2, anchoCam * 1.6);
  scene.add(dirLight);

  // ── Truck + floor ─────────────────────────────────────────────────────────
  const truckGeo   = new THREE.BoxGeometry(largo, altoCam, anchoCam);
  const truckEdges = new THREE.EdgesGeometry(truckGeo);
  const truckLines = new THREE.LineSegments(truckEdges,
    new THREE.LineBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.55 }));
  truckLines.position.set(largo / 2, altoCam / 2, anchoCam / 2);
  scene.add(truckLines);

  const sueloGeo = new THREE.PlaneGeometry(largo, anchoCam);
  const suelo = new THREE.Mesh(sueloGeo,
    new THREE.MeshStandardMaterial({ color: 0x161d26, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.set(largo / 2, 0, anchoCam / 2);
  scene.add(suelo);

  const totalWidth = anchoCam + esperaGap + esperaAncho;
  const grid = new THREE.GridHelper(Math.max(largo, totalWidth) * 1.4, 30, 0x2a3441, 0x1c2530);
  grid.position.set(largo / 2, -0.01, totalWidth / 2);
  scene.add(grid);

  // ── Zona de espera ────────────────────────────────────────────────────────
  const esperaZ0 = anchoCam + esperaGap;

  const esperaGeo = new THREE.PlaneGeometry(largo, esperaAncho);
  const esperaMesh = new THREE.Mesh(esperaGeo,
    new THREE.MeshStandardMaterial({ color: 0x1c2a1c, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  esperaMesh.rotation.x = -Math.PI / 2;
  esperaMesh.position.set(largo / 2, -0.005, esperaZ0 + esperaAncho / 2);
  scene.add(esperaMesh);

  // Borde de la zona de espera
  const esperaBordeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(largo, 0.01, esperaAncho));
  const esperaBorde = new THREE.LineSegments(esperaBordeGeo,
    new THREE.LineBasicMaterial({ color: 0x2a5c2a, transparent: true, opacity: 0.8 }));
  esperaBorde.position.set(largo / 2, 0, esperaZ0 + esperaAncho / 2);
  scene.add(esperaBorde);

  // Etiqueta (usando una línea de texto plana con sprite)
  // Usamos un simple helper que crea un canvas 2D con texto y lo convierte en sprite
  {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, 512, 64);
    ctx.font = "bold 28px JetBrains Mono, monospace";
    ctx.fillStyle = "#2a8c2a";
    ctx.textAlign = "center";
    ctx.fillText("ZONA DE ESPERA", 256, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(largo * 0.4, largo * 0.04, 1);
    sprite.position.set(largo / 2, 0.05, esperaZ0 + esperaAncho * 0.15);
    scene.add(sprite);
  }

  // ── Materiales compartidos para outlines ──────────────────────────────────
  const matSeleccion = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
  const matBloqueado = new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 2 });
  const matEspera    = new THREE.LineBasicMaterial({ color: 0x44ff88, linewidth: 1, transparent: true, opacity: 0.7 });

  // ── Grupos y geometrías para disposición posterior ────────────────────────
  const geometrías: THREE.BufferGeometry[] = [truckGeo, truckEdges, sueloGeo, esperaGeo, esperaBordeGeo];
  const materiales: THREE.Material[] = [matSeleccion, matBloqueado, matEspera];

  const grupoCarga = new THREE.Group();
  scene.add(grupoCarga);

  const stackGroups = new Map<string, THREE.Group>();

  // ── Función auxiliar para construir un Group de pila ─────────────────────
  function construirGrupo(
    paletsPila: PlacedPallet[],
    sd: StackData,
    threeX: number,   // posición Three.js X (= truckY * ESCALA)
    threeZ: number,   // posición Three.js Z (= truckX * ESCALA o zona espera)
  ): THREE.Group {
    const colorHex = colorPorReferencia.get(sd.refId) ?? "#4fd1c5";
    const largoEsc = sd.largoMm * ESCALA;
    const anchoEsc = sd.anchoMm * ESCALA;

    const group = new THREE.Group();
    group.position.set(threeX, 0, threeZ);
    group.userData = sd;

    let localY = 0;
    for (const palet of [...paletsPila].sort((a, b) => a.nivel - b.nivel)) {
      const altUnd = Math.max((palet.alturaMm / palet.unidades) * ESCALA, 0.01);
      const geoU = new THREE.BoxGeometry(largoEsc * 0.95, altUnd * 0.92, anchoEsc * 0.95);
      const geoB = new THREE.EdgesGeometry(geoU);
      geometrías.push(geoU, geoB);

      const matU = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.55, metalness: 0.05,
        transparent: sd.enEspera, opacity: sd.enEspera ? 0.75 : 1.0,
      });
      const matB = new THREE.LineBasicMaterial({ color: 0x0a1410, transparent: true, opacity: 0.4 });
      materiales.push(matU, matB);

      const info = crateInfoPorRef?.get(sd.refId);
      const esCarga = info?.tipo === "carga";
       const geomPalet = detalle
        ? (esCarga && info?.paletBase ? crateGeomPorRef?.get(info.paletBase) : crateGeomPorRef?.get(sd.refId))
        : null;
      const pt = paletsPila[0].palletType;
      const rotHuella = Math.abs(sd.largoMm - pt.largoMm) > Math.abs(sd.largoMm - pt.anchoMm);
      const rotManual = rotacionVisual?.get(sd.stackKey) ?? false;
      const rotado = esCarga ? rotHuella : (rotHuella !== rotManual);

      if (esCarga && info) {
        const laminaAltoEsc = (info.laminaAltoMm / 10) * ESCALA * 10; // cm→mm→escena
        const paletBaseGeom = info.paletBase ? crateGeomPorRef?.get(info.paletBase) : null;
        const paletAltoCm = paletBaseGeom ? bboxNativoCrate(paletBaseGeom).alto : 0;
        const paletAltoEsc = paletAltoCm * ESCALA * 10;

        if (geomPalet) {
          // detalle: palet real + láminas
          const cm = construirMeshCrate(THREE, geomPalet, {
            colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotado, escala: ESCALA,
            cargaEncima: { unidades: info.unidades, laminaLargoCm: info.laminaLargoCm, laminaAnchoCm: info.laminaAnchoCm, laminaAltoCm: info.laminaAltoMm / 10 },
          });
          cm.position.set(largoEsc / 2, localY, anchoEsc / 2);
          cm.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
          group.add(cm);
        } else {
          // simplificado: cubo del palet base + 50 cubos de lámina encima
          const geoP = new THREE.BoxGeometry(largoEsc * 0.95, paletAltoEsc * 0.98, anchoEsc * 0.95);
          const meshP = new THREE.Mesh(geoP, matU);
          meshP.position.set(largoEsc / 2, localY + paletAltoEsc / 2, anchoEsc / 2);
          meshP.userData = { stackKey: sd.stackKey, isCargo: true };
          group.add(meshP);
          const bordeP = new THREE.LineSegments(new THREE.EdgesGeometry(geoP), matB);
          bordeP.position.copy(meshP.position);
          group.add(bordeP);
          console.log("[simpl carga]", sd.refId,
            "unidades:", info.unidades,
            "paletAltoEsc:", paletAltoEsc.toFixed(3),
            "laminaAltoEsc:", laminaAltoEsc.toFixed(3),
            "largoEsc:", largoEsc.toFixed(2), "anchoEsc:", anchoEsc.toFixed(2));
          for (let i = 0; i < info.unidades; i++) {
            const geoL = new THREE.BoxGeometry(largoEsc * 0.95, laminaAltoEsc * 0.9, anchoEsc * 0.95);
            const meshL = new THREE.Mesh(geoL, matU);
            meshL.position.set(largoEsc / 2, localY + paletAltoEsc + laminaAltoEsc * (i + 0.5), anchoEsc / 2);
            meshL.userData = { stackKey: sd.stackKey, isCargo: true };
            group.add(meshL);
            const bordeL = new THREE.LineSegments(new THREE.EdgesGeometry(geoL), matB);
            bordeL.position.copy(meshL.position);
            group.add(bordeL);
          }
        }
      } else {
        for (let i = 0; i < palet.unidades; i++) {
          if (geomPalet) {
            const cm = construirMeshCrate(THREE, geomPalet, {
              colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotado, escala: ESCALA,
            });
            cm.position.set(largoEsc / 2, localY + altUnd * i, anchoEsc / 2);
            cm.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
            group.add(cm);
          } else {
            const cy = localY + altUnd * (i + 0.5);
            const mesh = new THREE.Mesh(geoU, matU);
            mesh.position.set(largoEsc / 2, cy, anchoEsc / 2);
            mesh.userData = { stackKey: sd.stackKey, isCargo: true };
            group.add(mesh);
            const borde = new THREE.LineSegments(geoB, matB);
            borde.position.copy(mesh.position);
            borde.userData = { stackKey: sd.stackKey };
            group.add(borde);
          }
        }
      }
      if (esCarga) console.log("[rot carga]", "ocup:", sd.largoMm, sd.anchoMm, "pt:", pt.largoMm, pt.anchoMm, "rotHuella:", rotHuella, "rotManual:", rotManual);
      localY += palet.alturaMm * ESCALA;
    }
    console.log("detalle:", detalle, "→", detalle ? "geometría real" : "cubo");
    return group;
  }

  // ── Colocar palets del camión ─────────────────────────────────────────────
  const paletsPorPos = new Map<string, PlacedPallet[]>();
  for (const p of paletsMutable) {
    const k = `${p.x}-${p.y}`;
    paletsPorPos.set(k, [...(paletsPorPos.get(k) ?? []), p]);
  }

  for (const [stackKey, paletsPila] of paletsPorPos) {
    const base = paletsPila.find(p => p.nivel === 0) ?? paletsPila[0];
    const sd: StackData = {
      stackKey,
      refId: base.referenceId,
      paletIds: paletsPila.map(p => p.id),
      truckX: base.x,
      truckY: base.y,
      anchoMm: base.anchoOcupadoMm,
      largoMm: base.largoOcupadoMm,
      alturaTotal: paletsPila.reduce((s, p) => s + p.alturaMm, 0),
      unidades: paletsPila.reduce((s, p) => s + p.unidades, 0),
      niveles: paletsPila.length,
      enEspera: false,
      bloqueado: lockedKeys.has(stackKey),
    };
    const g = construirGrupo(paletsPila, sd, base.y * ESCALA, base.x * ESCALA);
    grupoCarga.add(g);
    stackGroups.set(stackKey, g);
  }

  // ── Colocar palets en zona de espera ──────────────────────────────────────
  let esperaOffsetX = 0;
  for (const si of staged) {
    if (!si.palets.length) continue;
    const base = si.palets.find(p => p.nivel === 0) ?? si.palets[0];
    const sd: StackData = {
      stackKey: `staged-${si.id}`,
      refId: base.referenceId,
      paletIds: si.palets.map(p => p.id),
      truckX: -1, truckY: -1,
      anchoMm: base.anchoOcupadoMm,
      largoMm: base.largoOcupadoMm,
      alturaTotal: si.palets.reduce((s, p) => s + p.alturaMm, 0),
      unidades: si.palets.reduce((s, p) => s + p.unidades, 0),
      niveles: si.palets.length,
      enEspera: true,
      bloqueado: false,
      stagedId: si.id,
      slotIdx: si.slotIdx,
    };
    const slotX = esperaOffsetX;
    const g = construirGrupo(si.palets, sd, slotX, esperaZ0 + (base.anchoOcupadoMm * ESCALA) / 2);
    grupoCarga.add(g);
    stackGroups.set(sd.stackKey, g);
    esperaOffsetX += base.largoOcupadoMm * ESCALA + 0.1;
  }

  // ── Selección ─────────────────────────────────────────────────────────────
  let stackSeleccionado: THREE.Group | null = null;

  function matOutline(sd: StackData): THREE.LineBasicMaterial {
    if (sd.bloqueado) return matBloqueado;
    if (sd.enEspera)  return matEspera;
    return matSeleccion;
  }

  function añadirOutline(g: THREE.Group) {
    const sd = g.userData as StackData;
    const l = sd.largoMm * ESCALA + 0.06;
    const a = sd.anchoMm * ESCALA + 0.06;
    const h = sd.alturaTotal * ESCALA + 0.06;
    const geo = new THREE.BoxGeometry(l, h, a);
    const edges = new THREE.EdgesGeometry(geo);
    geometrías.push(geo, edges);
    const ol = new THREE.LineSegments(edges, matOutline(sd));
    ol.position.set(l / 2, h / 2, a / 2);
    ol.userData = { isOutline: true };
    g.add(ol);
  }

  function quitarOutline(g: THREE.Group) {
    g.children.filter(c => c.userData.isOutline).forEach(c => g.remove(c));
  }

  function seleccionarPila(g: THREE.Group) {
    if (stackSeleccionado === g) return;
    if (stackSeleccionado) quitarOutline(stackSeleccionado);
    stackSeleccionado = g;
    añadirOutline(g);
    emitirSeleccion(g);
  }

  function deseleccionarPila() {
    if (stackSeleccionado) { quitarOutline(stackSeleccionado); stackSeleccionado = null; }
    onSeleccion?.(null);
  }

  function emitirSeleccion(g: THREE.Group) {
    const sd = g.userData as StackData;
    onSeleccion?.({
      refId: sd.refId,
      paletIds: sd.paletIds,
      stackKey: sd.stackKey,
      largoMm: sd.largoMm,
      anchoMm: sd.anchoMm,
      alturaApilaMm: sd.alturaTotal,
      unidades: sd.unidades,
      niveles: sd.niveles,
      posXcm: Math.round(sd.truckX / 10),
      posYcm: Math.round(sd.truckY / 10),
      enEspera: sd.enEspera,
      bloqueado: sd.bloqueado,
    });
  }

  // ── Raycasting ────────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();

  function getMouse2D(e: MouseEvent): THREE.Vector2 {
    const rect = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  function raycastStack(e: MouseEvent): THREE.Group | null {
    raycaster.setFromCamera(getMouse2D(e), camera);
    const meshes: THREE.Mesh[] = [];
    grupoCarga.traverse(o => { if (o instanceof THREE.Mesh && o.userData.isCargo) meshes.push(o); });
    const hits = raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    const key = hits[0].object.userData.stackKey as string;
    return stackGroups.get(key) ?? null;
  }

  // ── Drag helpers ──────────────────────────────────────────────────────────
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  function getFloorIntersect(e: MouseEvent): THREE.Vector3 | null {
    raycaster.setFromCamera(getMouse2D(e), camera);
    const pt = new THREE.Vector3();
    return raycaster.ray.intersectPlane(dragPlane, pt) ? pt : null;
  }

  function hayColisionCamion(excludeIds: Set<string>, newX: number, newY: number, anchoMm: number, largoMm: number): boolean {
    const { anchoInteriorMm, largoInteriorMm } = camion.truckProfile;
    if (newX < 0 || newX + anchoMm > anchoInteriorMm) return true;
    if (newY < 0 || newY + largoMm > largoInteriorMm) return true;
    for (const p of paletsMutable) {
      if (p.nivel !== 0 || excludeIds.has(p.id)) continue;
      const ox = newX < p.x + p.anchoOcupadoMm && newX + anchoMm > p.x;
      const oy = newY < p.y + p.largoOcupadoMm && newY + largoMm > p.y;
      if (ox && oy) return true;
    }
    return false;
  }

  function setColorPila(g: THREE.Group, hex: number, alpha = 1) {
    g.children.forEach(c => {
      if (c instanceof THREE.Mesh && c.userData.isCargo) {
        const m = c.material as THREE.MeshStandardMaterial;
        m.color.setHex(hex);
        m.emissive.setHex(hex === 0xff3355 ? 0x440011 : 0x000000);
        m.transparent = alpha < 1;
        m.opacity = alpha;
      }
    });
  }

  function restaurarColorPila(g: THREE.Group) {
    const sd = g.userData as StackData;
    const colorHex = colorPorReferencia.get(sd.refId) ?? "#4fd1c5";
    g.children.forEach(c => {
      if (c instanceof THREE.Mesh && c.userData.isCargo) {
        const m = c.material as THREE.MeshStandardMaterial;
        m.color.set(colorHex);
        m.emissive.setHex(0x000000);
        m.transparent = sd.enEspera;
        m.opacity = sd.enEspera ? 0.75 : 1.0;
      }
    });
  }

  // ── Estado del drag ───────────────────────────────────────────────────────
  let modoManual = false;
  let mouseDownPx = { x: 0, y: 0 };
  let potentialDrag: THREE.Group | null = null;
  let isDragging = false;
  let dragCurrentTruckX = 0;
  let dragCurrentTruckY = 0;
  let dragTargetEspera = false;
  let dragHasCollision = false;

  const dragStartIntersect = new THREE.Vector3();
  const dragOriginalPos    = new THREE.Vector3();

  function commitDrag() {
    if (!potentialDrag) return;
    const sd = potentialDrag.userData as StackData;

    if (dragTargetEspera) {
      // Enviar a zona de espera
      restaurarColorPila(potentialDrag);
      if (sd.enEspera) {
        // ya estaba en espera, mantener donde está
      } else {
        sd.enEspera = true;
        sd.truckX = -1; sd.truckY = -1;
        onEnviarEspera?.(sd.paletIds);
        // Actualizar outline si está seleccionado
        if (stackSeleccionado === potentialDrag) {
          quitarOutline(potentialDrag); añadirOutline(potentialDrag);
        }
      }
    } else if (!dragHasCollision) {
      // Mover dentro o desde espera hacia camión
      const wasStagged = sd.enEspera;
      sd.truckX = dragCurrentTruckX;
      sd.truckY = dragCurrentTruckY;
      sd.enEspera = false;
      restaurarColorPila(potentialDrag);
      for (const p of paletsMutable) {
        if (sd.paletIds.includes(p.id)) { p.x = dragCurrentTruckX; p.y = dragCurrentTruckY; }
      }
      if (wasStagged) {
        onRecuperarDeEspera?.(sd.paletIds, dragCurrentTruckX, dragCurrentTruckY);
      } else {
        onMoverCamion?.(sd.paletIds, dragCurrentTruckX, dragCurrentTruckY);
      }
      emitirSeleccion(potentialDrag);
    } else {
      // Revertir
      potentialDrag.position.copy(dragOriginalPos);
      restaurarColorPila(potentialDrag);
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    mouseDownPx = { x: e.clientX, y: e.clientY };
    isDragging = false;
    if (!modoManual) return;
    const g = raycastStack(e);
    if (!g) return;
    e.stopImmediatePropagation();
    seleccionarPila(g);
    const sd = g.userData as StackData;
    // Las pilas bloqueadas solo permiten selección, nunca arrastre
    if (!sd.bloqueado) {
      potentialDrag = g;
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!modoManual || !potentialDrag) return;
    const dist = Math.hypot(e.clientX - mouseDownPx.x, e.clientY - mouseDownPx.y);
    if (!isDragging && dist > DRAG_THRESHOLD_PX) {
      isDragging = true;
      controls.enabled = false;
      const intersect = getFloorIntersect(e);
      if (intersect) dragStartIntersect.copy(intersect);
      dragOriginalPos.copy(potentialDrag.position);
    }
    if (!isDragging) return;

    const intersect = getFloorIntersect(e);
    if (!intersect) return;

    const dX = intersect.x - dragStartIntersect.x;
    const dZ = intersect.z - dragStartIntersect.z;
    const newZ = dragOriginalPos.z + dZ;
    const newX = dragOriginalPos.x + dX;

    const sd = potentialDrag.userData as StackData;

    // ¿Está en la zona de espera?
    dragTargetEspera = newZ > anchoCam + esperaGap / 2;

    if (dragTargetEspera) {
      // Zona de espera: mover libremente, sin colisión
      potentialDrag.position.set(newX, 0, newZ);
      dragHasCollision = false;
      setColorPila(potentialDrag, 0x44aa66, 0.75); // verde espera
    } else {
      // Dentro del camión: snap + colisión
      const rawTruckY = newX / ESCALA;
      const rawTruckX = newZ / ESCALA;
      const snX = Math.round(rawTruckX / SNAP_MM) * SNAP_MM;
      const snY = Math.round(rawTruckY / SNAP_MM) * SNAP_MM;
      dragCurrentTruckX = snX;
      dragCurrentTruckY = snY;

      const excluir = new Set(sd.paletIds);
      dragHasCollision = hayColisionCamion(excluir, snX, snY, sd.anchoMm, sd.largoMm);
      potentialDrag.position.set(snY * ESCALA, 0, snX * ESCALA);
      setColorPila(potentialDrag, dragHasCollision ? 0xff3355 : parseInt((colorPorReferencia.get(sd.refId) ?? "#4fd1c5").slice(1), 16));
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (e.button !== 0) return;
    controls.enabled = true;
    const dist = Math.hypot(e.clientX - mouseDownPx.x, e.clientY - mouseDownPx.y);
    if (isDragging) {
      commitDrag();
      isDragging = false;
      potentialDrag = null;
      return;
    }
    const g = raycastStack(e);
    if (g) {
      seleccionarPila(g);
    } else if (dist < DRAG_THRESHOLD_PX) {
      deseleccionarPila();
    }
    potentialDrag = null;
  }

  renderer.domElement.addEventListener("mousedown", onMouseDown);
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("mouseup",   onMouseUp);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(largo / 2, altoCam / 4, anchoCam / 2);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = largo * 4;

  if (opciones?.cameraState) {
    const cs = opciones.cameraState;
    camera.position.set(cs.px, cs.py, cs.pz);
    controls.target.set(cs.tx, cs.ty, cs.tz);
  } else {
    camera.position.set(largo * 0.95, altoCam * 1.8, (anchoCam + esperaGap + esperaAncho) * 1.4);
  }
  controls.update();

  const resizeObs = new ResizeObserver(() => {
    const w = container.clientWidth || W;
    const h = container.clientHeight || H;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObs.observe(container);

  let activo = true;
  let frameId = 0;
  function animar() {
    if (!activo) return;
    frameId = requestAnimationFrame(animar);
    controls.update();
    renderer.render(scene, camera);
  }
  animar();

  return {
    destruir() {
      activo = false;
      cancelAnimationFrame(frameId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup",   onMouseUp);
      controls.dispose();
      geometrías.forEach(g => g.dispose());
      materiales.forEach(m => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      container.innerHTML = "";
    },
    setModoManual(actv: boolean) {
      modoManual = actv;
      controls.enabled = true;
      if (!actv) deseleccionarPila();
    },
    getCameraState() {
      return {
        px: camera.position.x, py: camera.position.y, pz: camera.position.z,
        tx: controls.target.x, ty: controls.target.y, tz: controls.target.z,
      };
    },
  };
}