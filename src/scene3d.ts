import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { PlacedPallet, TruckLoadPlan } from "./types";
import { construirMeshCrate, bboxNativoCrate, type Recursos3D } from "./crateMeshes";

const ESCALA = 1 / 100;           // 1 Three.js unit = 100 mm
const SNAP_MM = 10;                // rejilla de snap durante drag
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
  /**
   * Sincroniza la escena YA EXISTENTE con datos nuevos (nuevas posiciones,
   * pilas añadidas/quitadas, bloqueos, flags...) sin destruir el renderer, la
   * cámara ni los controles — solo se reconstruyen las pilas cuyo aspecto
   * realmente cambió. `container` se reengancha si el contenedor del DOM se
   * recreó entre medias (el HTML del panel se re-renderiza en cada replan).
   */
  actualizar: (
    container: HTMLElement,
    camion: TruckLoadPlan,
    staged: StagedStackInfo[],
    lockedKeys: Set<string>,
    opciones?: EscenaOpciones
  ) => void;
}

export interface EscenaOpciones {
  onSeleccion?: (info: PaletSeleccionado | null) => void;
  onMoverCamion?: (paletIds: string[], nuevaX: number, nuevaY: number) => void;
  onEnviarEspera?: (paletIds: string[]) => void;
  /** Comprueba si `refArriba` se puede apilar manualmente sobre `refAbajo` (pares dirigidos, definidos por el usuario). */
  onComprobarApilableManual?: (refArriba: string, refAbajo: string) => boolean;
  /** Aterriza `paletIds` justo encima del palet `objetivoPaletId`, al nuevo z/nivel indicados. */
  onApilarManual?: (paletIds: string[], objetivoPaletId: string, nuevoZ: number, nuevoNivel: number) => void;
  crateGeomPorRef?: Map<string, unknown>;
  crateInfoPorRef?: Map<string, { tipo: string; paletBase: string | null; unidades: number; laminaAltoMm: number; laminaLargoCm: number; laminaAnchoCm: number; esDesmontado: boolean; intercambiado: boolean; disposicion: { columnas: number; colsLargo: number; colsAncho: number; girado: boolean } | null; desplazamientoCapiculadoMm: number }>;
  rotacionVisual?: Map<string, boolean>;
  detalle?: boolean;
  onRecuperarDeEspera?: (paletIds: string[], nuevaX: number, nuevaY: number) => void;
  /** Si se pasa, la cámara se restaura a esta posición en vez de la por defecto. */
  cameraState?: { px: number; py: number; pz: number; tx: number; ty: number; tz: number };
  /**
   * Si se pasa (y la pila sigue existiendo), se reselecciona automáticamente
   * tras aplicar los datos nuevos: restaura el contorno de selección y vuelve
   * a emitir `onSeleccion` con los datos YA actualizados (medidas tras rotar,
   * icono de candado tras fijar...). Sin esto, la selección se pierde en cada
   * actualización, igual que antes al reconstruir la escena entera.
   */
  reseleccionarStackKey?: string;
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

interface RecursosStack {
  geoms: THREE.BufferGeometry[];
  mats: THREE.Material[];
}

function disponerRecursos(rec: RecursosStack | undefined) {
  if (!rec) return;
  rec.geoms.forEach(g => g.dispose());
  rec.mats.forEach(m => m.dispose());
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal
// ─────────────────────────────────────────────────────────────────────────────

export function crearEscena3D(
  containerInicial: HTMLElement,
  camionInicial: TruckLoadPlan,
  colorPorReferencia: Map<string, string>,
  stagedInicial: StagedStackInfo[],
  lockedKeysInicial: Set<string>,
  opcionesIniciales?: EscenaOpciones
): EscenaHandle {
  // ── Estado mutable: se reasigna en cada llamada a `actualizar` ───────────
  // (las funciones internas cierran sobre estas variables `let`, así que
  // reasignarlas basta para que todo el código ya escrito —raycasting,
  // colisiones, drag...— vea siempre los datos más recientes sin duplicar
  // ninguna lógica entre la construcción inicial y las actualizaciones).
  let container = containerInicial;
  let camion = camionInicial;
  let paletsMutable = camion.pallets;
  let staged = stagedInicial;
  let lockedKeys = lockedKeysInicial;
  let opciones = opcionesIniciales ?? {};
  let onSeleccion = opciones.onSeleccion;
  let onMoverCamion = opciones.onMoverCamion;
  let onComprobarApilableManual = opciones.onComprobarApilableManual;
  let onApilarManual = opciones.onApilarManual;
  let onEnviarEspera = opciones.onEnviarEspera;
  let onRecuperarDeEspera = opciones.onRecuperarDeEspera;
  let crateGeomPorRef = opciones.crateGeomPorRef;
  let crateInfoPorRef = opciones.crateInfoPorRef;
  let rotacionVisual = opciones.rotacionVisual;
  let detalle = opciones.detalle ?? false;

  // ── Dimensiones (recalculables si cambia el perfil de camión) ────────────
  const W = container.clientWidth || 800;
  const H = container.clientHeight || 480;
  let largo    = camion.truckProfile.largoInteriorMm * ESCALA;
  let anchoCam = camion.truckProfile.anchoInteriorMm * ESCALA;
  let altoCam  = camion.truckProfile.altoInteriorMm  * ESCALA;
  const esperaGap = ESPERA_GAP_MM  * ESCALA;
  const esperaAncho = ESPERA_ANCHO_MM * ESCALA;
  let esperaZ0 = anchoCam + esperaGap;

  // ── Renderer & cámara (persisten toda la vida del handle) ────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1419);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
  if (opciones.cameraState) {
    const cs = opciones.cameraState;
    camera.position.set(cs.px, cs.py, cs.pz);
  } else {
    camera.position.set(largo * 0.95, altoCam * 1.8, (anchoCam + esperaGap + esperaAncho) * 1.4);
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // ── Lights (persisten) ───────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x14181f, 1.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  scene.add(dirLight);

  // ── Carcasa del camión + zona de espera ──────────────────────────────────
  // Reconstruible: solo si cambian las medidas interiores del camión (poco
  // frecuente — editar el perfil en el formulario). El resto de acciones
  // (rotar, fijar, cambiar de pestaña, replanificar con el mismo camión...)
  // nunca la tocan.
  const grupoCarcasa = new THREE.Group();
  scene.add(grupoCarcasa);
  let recursosCarcasa: RecursosStack = { geoms: [], mats: [] };

  function construirCarcasa() {
    while (grupoCarcasa.children.length) grupoCarcasa.remove(grupoCarcasa.children[0]);
    disponerRecursos(recursosCarcasa);
    const geoms: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    dirLight.position.set(largo * 0.7, altoCam * 3.2, anchoCam * 1.6);
    scene.fog = new THREE.Fog(0x0f1419, largo * 2, largo * 5);

    const truckGeo = new THREE.BoxGeometry(largo, altoCam, anchoCam);
    const truckEdges = new THREE.EdgesGeometry(truckGeo);
    const matTruck = new THREE.LineBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.55 });
    const truckLines = new THREE.LineSegments(truckEdges, matTruck);
    truckLines.position.set(largo / 2, altoCam / 2, anchoCam / 2);
    grupoCarcasa.add(truckLines);
    geoms.push(truckGeo, truckEdges); mats.push(matTruck);

    const sueloGeo = new THREE.PlaneGeometry(largo, anchoCam);
    const matSuelo = new THREE.MeshStandardMaterial({ color: 0x161d26, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    const suelo = new THREE.Mesh(sueloGeo, matSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set(largo / 2, 0, anchoCam / 2);
    grupoCarcasa.add(suelo);
    geoms.push(sueloGeo); mats.push(matSuelo);

    const totalWidth = anchoCam + esperaGap + esperaAncho;
    const grid = new THREE.GridHelper(Math.max(largo, totalWidth) * 1.4, 30, 0x2a3441, 0x1c2530);
    grid.position.set(largo / 2, -0.01, totalWidth / 2);
    grupoCarcasa.add(grid);
    geoms.push(grid.geometry as THREE.BufferGeometry);
    mats.push(grid.material as THREE.Material);

    esperaZ0 = anchoCam + esperaGap;

    const esperaGeo = new THREE.PlaneGeometry(largo, esperaAncho);
    const matEsperaSuelo = new THREE.MeshStandardMaterial({ color: 0x1c2a1c, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const esperaMesh = new THREE.Mesh(esperaGeo, matEsperaSuelo);
    esperaMesh.rotation.x = -Math.PI / 2;
    esperaMesh.position.set(largo / 2, -0.005, esperaZ0 + esperaAncho / 2);
    grupoCarcasa.add(esperaMesh);
    geoms.push(esperaGeo); mats.push(matEsperaSuelo);

    const esperaBordeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(largo, 0.01, esperaAncho));
    const matEsperaBorde = new THREE.LineBasicMaterial({ color: 0x2a5c2a, transparent: true, opacity: 0.8 });
    const esperaBorde = new THREE.LineSegments(esperaBordeGeo, matEsperaBorde);
    esperaBorde.position.set(largo / 2, 0, esperaZ0 + esperaAncho / 2);
    grupoCarcasa.add(esperaBorde);
    geoms.push(esperaBordeGeo); mats.push(matEsperaBorde);

    // Etiqueta de la zona de espera (canvas 2D convertido en sprite)
    {
      const canvasEtq = document.createElement("canvas");
      canvasEtq.width = 512; canvasEtq.height = 64;
      const ctx = canvasEtq.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 64);
      ctx.font = "bold 28px JetBrains Mono, monospace";
      ctx.fillStyle = "#2a8c2a";
      ctx.textAlign = "center";
      ctx.fillText("ZONA DE ESPERA", 256, 40);
      const tex = new THREE.CanvasTexture(canvasEtq);
      const matSprite = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(matSprite);
      sprite.scale.set(largo * 0.4, largo * 0.04, 1);
      sprite.position.set(largo / 2, 0.05, esperaZ0 + esperaAncho * 0.15);
      grupoCarcasa.add(sprite);
      mats.push(matSprite);
    }

    recursosCarcasa = { geoms, mats };
  }
  construirCarcasa();

  // ── Materiales compartidos para outlines (persisten toda la vida) ───────
  const matSeleccion = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
  const matBloqueado = new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 2 });
  const matEspera    = new THREE.LineBasicMaterial({ color: 0x44ff88, linewidth: 1, transparent: true, opacity: 0.7 });

  const grupoCarga = new THREE.Group();
  scene.add(grupoCarga);

  const stackGroups = new Map<string, THREE.Group>();
  const recursosPorStack = new Map<string, RecursosStack>();
  const fingerprintPorStack = new Map<string, string>();

  // ── Función auxiliar para construir un Group de pila ─────────────────────
  function construirGrupo(
    paletsPila: PlacedPallet[],
    sd: StackData,
    threeX: number,   // posición Three.js X (= truckY * ESCALA)
    threeZ: number,   // posición Three.js Z (= truckX * ESCALA o zona espera)
  ): THREE.Group {
    const geomsLocal: THREE.BufferGeometry[] = [];
    const matsLocal: THREE.Material[] = [];

    const group = new THREE.Group();
    group.position.set(threeX, 0, threeZ);
    group.userData = sd;

    const nivelesOrdenados = [...paletsPila].sort((a, b) => a.nivel - b.nivel);
    for (let idxNivel = 0; idxNivel < nivelesOrdenados.length; idxNivel++) {
      const palet = nivelesOrdenados[idxNivel];
      // La Y de cada nivel viene DIRECTAMENTE de palet.z (lo que calculó el
      // packer, ya con el capiculado aplicado si toca) — antes se
      // recalculaba aquí sumando alturaMm de cada palet en un acumulador
      // aparte, completamente ciego a la reducción del packer: por eso el
      // capiculado no se notaba en el dibujo aunque sí se calculara bien.
      const localY = palet.z * ESCALA;
      // Si el hueco con el nivel de abajo es menor que su alto completo,
      // el packer ha aplicado capiculado en esta unión — hay que desplazar
      // este nivel en X (aparte de ir ya más pegado en Y) para que las
      // tablas de su cubrir caigan en los huecos del cubrir de abajo
      // (cremallera), no encima de las mismas tablas.
      const nivelAnterior = idxNivel > 0 ? nivelesOrdenados[idxNivel - 1] : null;
      const esUnionCapiculada = nivelAnterior != null
        && palet.z < nivelAnterior.z + nivelAnterior.alturaMm
        && idxNivel % 2 === 1; // solo los niveles "del revés" (1, 3, 5…) — los pares vuelven a la orientación normal, alineados con el nivel 0
      // Cada nivel usa SU PROPIA referencia (color, geometría, medidas) — no
      // la de sd/paletsPila[0]. Antes daba igual (una pila siempre era una
      // sola referencia, apilada por el packer automático), pero con el
      // apilado manual entre referencias distintas cada nivel puede ser una
      // referencia diferente, y si no se coge aquí bien, la de arriba
      // "absorbe" el aspecto de la de abajo (o al revés).
      const colorHex = colorPorReferencia.get(palet.referenceId) ?? "#4fd1c5";
      const info = crateInfoPorRef?.get(palet.referenceId);
      const pt = palet.palletType;
      // rotHuella se deriva de anchoOcupadoMm, NUNCA de largoOcupadoMm: el
      // desplazamiento capiculado (ver agruparEnPilas en packer.ts) se suma
      // SOLO a largoOcupadoMm de la pila entera -- y ese mismo valor
      // ensanchado se copia, tal cual, a CADA nivel de la pila (no solo al
      // hueco reservado). Compararlo contra pt.largoMm/anchoMm para
      // detectar el giro (y, peor, USARLO como huella real de la pieza)
      // corrompe tanto la deteccion de giro como el tamano/posicion
      // dibujados en una pila capiculada de 2+ niveles: cada pieza salia
      // mas ancha de lo real Y centrada mas a la derecha de lo real, un
      // desplazamiento visible de la malla respecto al contorno blanco
      // (que si usa correctamente el valor ensanchado, porque el suyo es
      // el hueco reservado de la pila, no la pieza individual).
      // anchoOcupadoMm nunca se ensancha (el desplazamiento capiculado solo
      // afecta al largo), asi que es la unica huella fiable por nivel.
      const rotHuella = Math.abs(palet.anchoOcupadoMm - pt.anchoMm) > Math.abs(palet.anchoOcupadoMm - pt.largoMm);
      // Huella REAL de esta pieza (mm nativos del tipo de palet, orientados
      // segun rotHuella) -- no palet.largoOcupadoMm, que para una pila
      // capiculada de 2+ niveles es el hueco RESERVADO de toda la pila
      // (mas ancho que una pieza suelta), no el tamano de esta pieza.
      const largoEsc = (rotHuella ? pt.anchoMm : pt.largoMm) * ESCALA;
      const anchoEsc = palet.anchoOcupadoMm * ESCALA;
      const desplazEsc = esUnionCapiculada ? (info?.desplazamientoCapiculadoMm ?? 0) * ESCALA : 0;
      const xBase = largoEsc / 2 + desplazEsc;
      const esCarga = info?.tipo === "carga";
      const esFoam = info?.tipo === "foam";
      // Para "foam", palet.unidades son los foams que lleva dentro la caja
      // (p.ej. 225), no copias físicas de la caja — el alto de cada
      // "unidad" del bucle de abajo no tiene sentido dividido entre 225:
      // la caja entera mide su alto real, de un tirón.
      const altUnd = esFoam
        ? Math.max(palet.alturaMm * ESCALA, 0.01)
        : Math.max((palet.alturaMm / palet.unidades) * ESCALA, 0.01);
      const geoU = new THREE.BoxGeometry(largoEsc * 0.95, altUnd * 0.92, anchoEsc * 0.95);
      const geoB = new THREE.EdgesGeometry(geoU);
      geomsLocal.push(geoU, geoB);

      const matU = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.55, metalness: 0.05,
        transparent: sd.enEspera, opacity: sd.enEspera ? 0.75 : 1.0,
      });
      const matB = new THREE.LineBasicMaterial({ color: 0x0a1410, transparent: true, opacity: 0.4 });
      matsLocal.push(matU, matB);

      const geomPalet = detalle
        ? (esCarga && info?.paletBase ? crateGeomPorRef?.get(info.paletBase) : crateGeomPorRef?.get(palet.referenceId))
        : null;
      // El flag manual (rotacionVisual) solo aporta información EXTRA cuando
      // la huella es cuadrada: ahí largoMm/anchoMm no cambian al rotar, así
      // que rotHuella no puede decir nada y hace falta el flag explícito
      // para saber hacia qué lado está girada la pieza.
      const esCuadrada = pt.largoMm === pt.anchoMm;
      const rotManual = rotacionVisual?.get(sd.stackKey) ?? false;
      const rotado = esCarga ? rotHuella : (esCuadrada ? rotManual : rotHuella);
      // La geometría real ("Detalle 3D") se construye a partir del crateJson
      // NATIVO (largo/ancho tal como se diseñó en el constructor) — pero
      // pt.largoMm/anchoMm pueden venir YA intercambiados respecto a eso
      // (crateToReference.ts los intercambia para bases de dobles bases con
      // dbOrient="ancho", ver debeIntercambiarParaCamion). `rotado` compara
      // contra esas medidas YA intercambiadas, así que si no se corrige aquí,
      // la geometría real sale girada 90° respecto a donde está la caja
      // simple (que si usa las medidas correctas). Un intercambio de por sí
      // ya ES un giro de 90°, así que basta con un XOR.
      const rotadoGeometriaReal = rotado !== (info?.intercambiado ?? false);

      const registrarRecursosDe = (g: THREE.Group) => {
        const rec = (g.userData as { recursos3d?: Recursos3D }).recursos3d;
        if (rec) {
          geomsLocal.push(...(rec.geoms as THREE.BufferGeometry[]));
          matsLocal.push(...(rec.mats as THREE.Material[]));
        }
      };

      if (esCarga && info) {
        const laminaAltoEsc = (info.laminaAltoMm / 10) * ESCALA * 10; // cm→mm→escena
        const paletBaseGeom = info.paletBase ? crateGeomPorRef?.get(info.paletBase) : null;
        const paletAltoCm = paletBaseGeom ? bboxNativoCrate(paletBaseGeom).alto : 0;
        const paletAltoEsc = paletAltoCm * ESCALA * 10;
        // Geometría PROPIA de la carga (p.ej. un marco de tablas, no
        // necesariamente una lámina lisa) — antes se ignoraba por completo y
        // se sustituía siempre por una caja simple, aunque tuviera diseño
        // real detrás.
        const geomCarga = crateGeomPorRef?.get(palet.referenceId);

        // Rejilla de columnas sobre la superficie del palet (ver
        // calcularColumnasCarga en crateToReference.ts): piezas que caben
        // varias veces en horizontal (p.ej. un barrote estrecho) se reparten
        // en varias columnas más bajas en vez de apilarse todas en una sola
        // torre. disposicion.colsLargo/colsAncho están calculados sobre los
        // ejes NATIVOS (largo/ancho tal cual el JSON) — si el palet está
        // girado para el camión (rotadoGeometriaReal), esos ejes quedan
        // intercambiados aquí dentro, así que hay que intercambiarlos
        // también al aplicarlos; y cada pieza individual necesita su propio
        // giro si la rejilla se calculó en su orientación girada, combinado
        // con el giro general del grupo (un giro cancela al otro, de ahí el
        // "!==": si los dos giran, el neto es 0).
        const disp = info.disposicion ?? { columnas: 1, colsLargo: 1, colsAncho: 1, girado: false };
        const colsX = rotadoGeometriaReal ? disp.colsAncho : disp.colsLargo;
        const colsZ = rotadoGeometriaReal ? disp.colsLargo : disp.colsAncho;
        const rotarItem = disp.girado !== rotadoGeometriaReal;
        const cellX = largoEsc / colsX;
        const cellZ = anchoEsc / colsZ;
        const unidadesDeColumna = (colIdx: number) => {
          const base = Math.floor(palet.unidades / disp.columnas);
          const resto = palet.unidades % disp.columnas;
          return base + (colIdx < resto ? 1 : 0);
        };
        const posColumna = (colIdx: number) => {
          const fila = Math.floor(colIdx / colsZ);
          const col = colIdx % colsZ;
          return { x: cellX * (fila + 0.5), z: cellZ * (col + 0.5) };
        };

        if (geomPalet && geomCarga) {
          // detalle: palet real + rejilla de columnas con copias reales de
          // la geometría de la carga (cada columna empieza donde acaba el
          // palet, apilando solo sus propias unidades).
          const cm = construirMeshCrate(THREE, geomPalet, {
            colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotadoGeometriaReal, escala: ESCALA,
          });
          registrarRecursosDe(cm);
          cm.position.set(largoEsc / 2, localY, anchoEsc / 2);
          cm.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
          group.add(cm);

          const cargaAltoCm = bboxNativoCrate(geomCarga).alto;
          const cargaAltoEsc = cargaAltoCm * ESCALA * 10;
          for (let col = 0; col < disp.columnas; col++) {
            const { x: colX, z: colZ } = posColumna(col);
            const undCol = unidadesDeColumna(col);
            for (let k = 0; k < undCol; k++) {
              const cL = construirMeshCrate(THREE, geomCarga, {
                colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotarItem, escala: ESCALA,
              });
              registrarRecursosDe(cL);
              cL.position.set(colX, localY + paletAltoEsc + cargaAltoEsc * k, colZ);
              cL.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
              group.add(cL);
            }
          }
        } else if (geomPalet) {
          // Solo hay geometría real del palet (la carga no trae la suya, o
          // no se encontró): palet real + rejilla de láminas simples.
          const cm = construirMeshCrate(THREE, geomPalet, {
            colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotadoGeometriaReal, escala: ESCALA,
          });
          registrarRecursosDe(cm);
          cm.position.set(largoEsc / 2, localY, anchoEsc / 2);
          cm.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
          group.add(cm);

          const laminaLargoEsc = (rotarItem ? info.laminaAnchoCm : info.laminaLargoCm) / 10;
          const laminaAnchoEsc = (rotarItem ? info.laminaLargoCm : info.laminaAnchoCm) / 10;
          for (let col = 0; col < disp.columnas; col++) {
            const { x: colX, z: colZ } = posColumna(col);
            const undCol = unidadesDeColumna(col);
            for (let k = 0; k < undCol; k++) {
              const geoL = new THREE.BoxGeometry(laminaLargoEsc * 0.95, laminaAltoEsc * 0.9, laminaAnchoEsc * 0.95);
              geomsLocal.push(geoL);
              const meshL = new THREE.Mesh(geoL, matU);
              meshL.position.set(colX, localY + paletAltoEsc + laminaAltoEsc * (k + 0.5), colZ);
              meshL.userData = { stackKey: sd.stackKey, isCargo: true };
              group.add(meshL);
              const edgesL = new THREE.EdgesGeometry(geoL);
              geomsLocal.push(edgesL);
              const bordeL = new THREE.LineSegments(edgesL, matB);
              bordeL.position.copy(meshL.position);
              group.add(bordeL);
            }
          }
        } else {
          // simplificado del todo (ni palet ni carga con geometría real):
          // cubo del palet base (huella completa) + rejilla de cubos de
          // lámina a su tamaño PROPIO.
          const geoP = new THREE.BoxGeometry(largoEsc * 0.95, paletAltoEsc * 0.98, anchoEsc * 0.95);
          geomsLocal.push(geoP);
          const meshP = new THREE.Mesh(geoP, matU);
          meshP.position.set(largoEsc / 2, localY + paletAltoEsc / 2, anchoEsc / 2);
          meshP.userData = { stackKey: sd.stackKey, isCargo: true };
          group.add(meshP);
          const edgesP = new THREE.EdgesGeometry(geoP);
          geomsLocal.push(edgesP);
          const bordeP = new THREE.LineSegments(edgesP, matB);
          bordeP.position.copy(meshP.position);
          group.add(bordeP);

          const laminaLargoEsc = (rotarItem ? info.laminaAnchoCm : info.laminaLargoCm) / 10;
          const laminaAnchoEsc = (rotarItem ? info.laminaLargoCm : info.laminaAnchoCm) / 10;
          for (let col = 0; col < disp.columnas; col++) {
            const { x: colX, z: colZ } = posColumna(col);
            const undCol = unidadesDeColumna(col);
            for (let k = 0; k < undCol; k++) {
              const geoL = new THREE.BoxGeometry(laminaLargoEsc * 0.95, laminaAltoEsc * 0.9, laminaAnchoEsc * 0.95);
              geomsLocal.push(geoL);
              const meshL = new THREE.Mesh(geoL, matU);
              meshL.position.set(colX, localY + paletAltoEsc + laminaAltoEsc * (k + 0.5), colZ);
              meshL.userData = { stackKey: sd.stackKey, isCargo: true };
              group.add(meshL);
              const edgesL = new THREE.EdgesGeometry(geoL);
              geomsLocal.push(edgesL);
              const bordeL = new THREE.LineSegments(edgesL, matB);
              bordeL.position.copy(meshL.position);
              group.add(bordeL);
            }
          }
        }
      } else {
        // "foam": palet.unidades son los FOAMS que lleva dentro esta caja
        // (225, por ejemplo) — no hay que dibujar 225 copias de la caja,
        // solo UNA. El bucle de abajo (repetir palet.unidades veces) es
        // para flejados de verdad: varias cajas físicas idénticas
        // apiladas dentro del mismo pack.
        const repeticiones = esFoam ? 1 : palet.unidades;
        for (let i = 0; i < repeticiones; i++) {
          if (geomPalet) {
            const cm = construirMeshCrate(THREE, geomPalet, {
              colorBase: colorHex, opacidad: sd.enEspera ? 0.75 : 1.0, conAristas: true, rotar90: rotadoGeometriaReal, escala: ESCALA,
              desmontado: !!info?.esDesmontado,
            });
            registrarRecursosDe(cm);
            cm.traverse((o: any) => { if (o.isMesh || o.isLineSegments) o.userData = { stackKey: sd.stackKey, isCargo: o.isMesh }; });
            if (esUnionCapiculada) {
              // Voltear 180° de verdad: la pieza ya se posiciona centrada
              // en X/Z pero apoyada en el suelo en Y (Y=0 es su propio
              // suelo, no su centro — así es como se coloca la pieza
              // normal, aquí abajo, sin rotar). Rotando 180° sobre el
              // propio eje X de la pieza, su suelo (Y local=0) pasa a
              // quedar arriba del todo — por eso el punto de referencia en
              // Y hay que subirlo su propia altura completa, para que siga
              // ocupando el mismo hueco de siempre, solo que boca abajo.
              cm.rotation.x = Math.PI;
              cm.position.set(xBase, localY + altUnd * (i + 1), anchoEsc / 2);
            } else {
              cm.position.set(xBase, localY + altUnd * i, anchoEsc / 2);
            }
            group.add(cm);
          } else {
            const cy = localY + altUnd * (i + 0.5);
            const mesh = new THREE.Mesh(geoU, matU);
            mesh.position.set(xBase, cy, anchoEsc / 2);
            mesh.userData = { stackKey: sd.stackKey, isCargo: true };
            group.add(mesh);
            const borde = new THREE.LineSegments(geoB, matB);
            borde.position.copy(mesh.position);
            borde.userData = { stackKey: sd.stackKey };
            group.add(borde);
          }
        }
      }
    }
    recursosPorStack.set(sd.stackKey, { geoms: geomsLocal, mats: matsLocal });
    return group;
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
    geo.dispose(); // solo se usaba para derivar 'edges', no se renderiza
    const ol = new THREE.LineSegments(edges, matOutline(sd));
    ol.position.set(l / 2, h / 2, a / 2);
    ol.userData = { isOutline: true };
    g.add(ol);
  }

  function quitarOutline(g: THREE.Group) {
    g.children.filter(c => c.userData.isOutline).forEach(c => {
      g.remove(c);
      if (c instanceof THREE.LineSegments) c.geometry.dispose();
    });
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

  /** Igual que seleccionarPila, pero SIEMPRE refresca el contorno y reemite
   * la selección, incluso si `g` ya era el grupo seleccionado — necesario
   * tras fijar/desfijar una pila, donde el grupo no cambia pero sí su color
   * de contorno y los datos que debe mostrar la tarjeta de info. */
  function reseleccionarForzado(g: THREE.Group) {
    if (stackSeleccionado === g) {
      quitarOutline(g);
      añadirOutline(g);
      emitirSeleccion(g);
    } else {
      seleccionarPila(g);
    }
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

  // ── Reconciliación de pilas (construcción inicial Y cada actualización) ──
  // Recalcula qué pilas debería haber (camión + zona de espera), y decide
  // por clave (posición, o `staged-<id>`) si cada una es nueva, cambió lo
  // bastante para reconstruir su malla, o sigue igual y solo hace falta
  // refrescar metadatos/posición. Así construirGrupo se llama solo para lo
  // que realmente cambió — el resto de la escena ni se toca.
  function fingerprintDe(sd: StackData): string {
    return JSON.stringify([
      sd.refId, sd.largoMm, sd.anchoMm, sd.alturaTotal, sd.niveles, sd.unidades,
      sd.enEspera, rotacionVisual?.get(sd.stackKey) ?? false, detalle,
    ]);
  }

  function reconciliarPilas() {
    interface Datos { sd: StackData; palets: PlacedPallet[]; threeX: number; threeZ: number }
    const nuevosDatos = new Map<string, Datos>();

    // Pilas del camión, agrupadas por posición exacta.
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
        // Suelo a techo REAL (max z+altura menos min z), no la suma de
        // alturaMm de cada nivel: con capiculado, cada union hunde el
        // siguiente nivel dentro del anterior (ver packer.ts), asi que la
        // suma ciega de alturas contaba de mas el hueco ganado en cada
        // union -- z ya refleja ese hundimiento, asi que basta con leerlo.
        alturaTotal: Math.max(...paletsPila.map(p => p.z + p.alturaMm)) - Math.min(...paletsPila.map(p => p.z)),
        unidades: paletsPila.reduce((s, p) => s + p.unidades, 0),
        niveles: paletsPila.length,
        enEspera: false,
        bloqueado: lockedKeys.has(stackKey),
      };
      nuevosDatos.set(stackKey, { sd, palets: paletsPila, threeX: base.y * ESCALA, threeZ: base.x * ESCALA });
    }

    // Pilas en zona de espera: el offset de cada una depende de las que la
    // preceden en la fila, así que se recalcula entero en cada pasada.
    let esperaOffsetX = 0;
    for (const si of staged) {
      if (!si.palets.length) continue;
      const base = si.palets.find(p => p.nivel === 0) ?? si.palets[0];
      const stackKey = `staged-${si.id}`;
      const sd: StackData = {
        stackKey,
        refId: base.referenceId,
        paletIds: si.palets.map(p => p.id),
        truckX: -1, truckY: -1,
        anchoMm: base.anchoOcupadoMm,
        largoMm: base.largoOcupadoMm,
        alturaTotal: Math.max(...si.palets.map(p => p.z + p.alturaMm)) - Math.min(...si.palets.map(p => p.z)),
        unidades: si.palets.reduce((s, p) => s + p.unidades, 0),
        niveles: si.palets.length,
        enEspera: true,
        bloqueado: false,
        stagedId: si.id,
        slotIdx: si.slotIdx,
      };
      const threeX = esperaOffsetX;
      const threeZ = esperaZ0 + (base.anchoOcupadoMm * ESCALA) / 2;
      nuevosDatos.set(stackKey, { sd, palets: si.palets, threeX, threeZ });
      esperaOffsetX += base.largoOcupadoMm * ESCALA + 0.1;
    }

    // 1) Quitar pilas que ya no existen.
    for (const [key, group] of Array.from(stackGroups.entries())) {
      if (nuevosDatos.has(key)) continue;
      if (stackSeleccionado === group) stackSeleccionado = null;
      grupoCarga.remove(group);
      disponerRecursos(recursosPorStack.get(key));
      recursosPorStack.delete(key);
      fingerprintPorStack.delete(key);
      stackGroups.delete(key);
    }

    // 2) Añadir nuevas, reconstruir las que cambiaron de aspecto, reposicionar
    //    o simplemente refrescar metadatos en las que siguen igual.
    for (const [key, datos] of nuevosDatos) {
      const fp = fingerprintDe(datos.sd);
      const existente = stackGroups.get(key);

      if (!existente) {
        const g = construirGrupo(datos.palets, datos.sd, datos.threeX, datos.threeZ);
        grupoCarga.add(g);
        stackGroups.set(key, g);
        fingerprintPorStack.set(key, fp);
        continue;
      }

      if (fingerprintPorStack.get(key) !== fp) {
        if (stackSeleccionado === existente) stackSeleccionado = null;
        grupoCarga.remove(existente);
        disponerRecursos(recursosPorStack.get(key));
        const g = construirGrupo(datos.palets, datos.sd, datos.threeX, datos.threeZ);
        grupoCarga.add(g);
        stackGroups.set(key, g);
        fingerprintPorStack.set(key, fp);
      } else {
        existente.userData = datos.sd;
        if (existente.position.x !== datos.threeX || existente.position.z !== datos.threeZ) {
          existente.position.set(datos.threeX, 0, datos.threeZ);
        }
      }
    }
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
    // Sin margen de tolerancia: un solape, por pequeño que sea, se ve — y
    // eso importa más que poder devolver algo a su posición EXACTA con el
    // ratón. Para ese último ajuste fino están las flechas del teclado
    // (onKeyDown, más abajo), que mueven de milímetro en milímetro sin
    // arriesgarse nunca a un solape de verdad.
    for (const p of paletsMutable) {
      if (p.nivel !== 0 || excludeIds.has(p.id)) continue;
      const ox = newX < p.x + p.anchoOcupadoMm && newX + anchoMm > p.x;
      const oy = newY < p.y + p.largoOcupadoMm && newY + largoMm > p.y;
      if (ox && oy) return true;
    }
    return false;
  }

  /**
   * Busca si el rectángulo de destino (x,y,anchoMm,largoMm) se solapa
   * sustancialmente con una columna existente (nivel 0 y lo que tenga
   * apilado encima) — "aquí se puede aterrizar justo encima". No exige que
   * la posición coincida al milímetro (el packer automático no snapea a la
   * rejilla de 50mm del arrastre): basta con que el solape sea la mayor
   * parte de la huella que se está soltando. Devuelve la posición EXACTA
   * de la columna objetivo (no la del arrastre) para que el aterrizaje
   * quede perfectamente alineado, junto con el palet que está arriba del
   * todo ahora mismo y dónde (x/y/z/nivel) aterrizaría uno nuevo.
   */
  function buscarObjetivoApilado(excludeIds: Set<string>, x: number, y: number, anchoMm: number, largoMm: number) {
    let mejor: PlacedPallet | null = null;
    let mejorSolape = 0;
    for (const p of paletsMutable) {
      if (p.nivel !== 0 || excludeIds.has(p.id)) continue;
      const ox = Math.min(x + anchoMm, p.x + p.anchoOcupadoMm) - Math.max(x, p.x);
      const oy = Math.min(y + largoMm, p.y + p.largoOcupadoMm) - Math.max(y, p.y);
      if (ox <= 0 || oy <= 0) continue;
      const solape = ox * oy;
      if (solape > mejorSolape) { mejorSolape = solape; mejor = p; }
    }
    if (!mejor) return null;
    // Exige que el solape cubra la mayor parte de lo que se suelta —
    // si solo roza una esquina al pasar por encima, no cuenta.
    if (mejorSolape < 0.6 * anchoMm * largoMm) return null;

    const columna = paletsMutable.filter(p => p.x === mejor!.x && p.y === mejor!.y && !excludeIds.has(p.id));
    let top = columna[0];
    for (const p of columna) {
      if (p.nivel > top.nivel) top = p;
    }
    return {
      paletId: top.id, refId: top.referenceId,
      aterrizarX: mejor.x, aterrizarY: mejor.y,
      nuevoZ: top.z + top.alturaMm, nuevoNivel: top.nivel + 1,
      anchoOcupadoMm: top.anchoOcupadoMm, largoOcupadoMm: top.largoOcupadoMm,
    };
  }

  function setColorPila(g: THREE.Group, hex: number, alpha = 1) {
    g.traverse(c => {
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
    g.traverse(c => {
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
  let dragObjetivoApilado: { paletId: string; refId: string; nuevoZ: number; nuevoNivel: number } | null = null;

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
    } else if (dragObjetivoApilado) {
      // Aterrizar justo encima de la columna objetivo (referencia distinta,
      // compatible según las reglas del usuario, con hueco de peso/alto).
      const objetivo = dragObjetivoApilado;
      sd.truckX = dragCurrentTruckX;
      sd.truckY = dragCurrentTruckY;
      sd.enEspera = false;
      restaurarColorPila(potentialDrag);
      for (const p of paletsMutable) {
        if (sd.paletIds.includes(p.id)) {
          p.x = dragCurrentTruckX; p.y = dragCurrentTruckY;
          p.z = objetivo.nuevoZ; p.nivel = objetivo.nuevoNivel;
        }
      }
      onApilarManual?.(sd.paletIds, objetivo.paletId, objetivo.nuevoZ, objetivo.nuevoNivel);
      emitirSeleccion(potentialDrag);
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
      // Desactivar la órbita YA, no cuando se supere el umbral de arrastre
      // más abajo — si no, los controles de órbita alcanzan a reaccionar al
      // primer tramo de movimiento del ratón (antes de decidir si esto es
      // un arrastre de verdad), y la cámara da un pequeño salto molesto.
      controls.enabled = false;
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!modoManual || !potentialDrag) return;
    const dist = Math.hypot(e.clientX - mouseDownPx.x, e.clientY - mouseDownPx.y);
    if (!isDragging && dist > DRAG_THRESHOLD_PX) {
      isDragging = true;
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
      dragObjetivoApilado = null;

      if (dragHasCollision && !sd.bloqueado) {
        const objetivo = buscarObjetivoApilado(excluir, snX, snY, sd.anchoMm, sd.largoMm);
        if (objetivo && objetivo.refId !== sd.refId && onComprobarApilableManual?.(sd.refId, objetivo.refId)) {
          const alturaTrasApilar = objetivo.nuevoZ + sd.alturaTotal;
          // La de arriba solo puede sobresalir en UN eje (largo o ancho),
          // nunca en los dos a la vez.
          const sobresaleLargo = sd.largoMm > objetivo.largoOcupadoMm;
          const sobresaleAncho = sd.anchoMm > objetivo.anchoOcupadoMm;
          const medidasOk = !(sobresaleLargo && sobresaleAncho);
          const alturaOk = alturaTrasApilar <= camion.truckProfile.altoInteriorMm;
          if (medidasOk && alturaOk) {
            // Alinear EXACTO con la columna objetivo, no con el snap del
            // arrastre — si no, el aterrizaje queda descuadrado respecto a
            // lo que hay debajo.
            dragCurrentTruckX = objetivo.aterrizarX;
            dragCurrentTruckY = objetivo.aterrizarY;
            dragObjetivoApilado = { paletId: objetivo.paletId, refId: objetivo.refId, nuevoZ: objetivo.nuevoZ, nuevoNivel: objetivo.nuevoNivel };
          }
        }
      }

      potentialDrag.position.set(dragCurrentTruckY * ESCALA, 0, dragCurrentTruckX * ESCALA);
      const colorHex = dragObjetivoApilado
        ? 0x3388ff // azul: se puede apilar aquí encima
        : dragHasCollision
        ? 0xff3355
        : parseInt((colorPorReferencia.get(sd.refId) ?? "#4fd1c5").slice(1), 16);
      setColorPila(potentialDrag, colorHex);
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

  /**
   * Mueve la pila seleccionada con las flechas del teclado — el ratón puede
   * ser tedioso para ajustes finos. Paso normal 10mm, con Shift 50mm (salto
   * más grande). No roba las flechas si el foco está en un campo de texto
   * en cualquier otra parte de la página.
   */
  function onKeyDown(e: KeyboardEvent) {
    if (!modoManual || !stackSeleccionado) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const activo = document.activeElement;
    if (activo && (activo.tagName === "INPUT" || activo.tagName === "TEXTAREA" || (activo as HTMLElement).isContentEditable)) return;
    const sd = stackSeleccionado.userData as StackData;
    if (sd.bloqueado || sd.enEspera) return; // fijada o aparcada: no se mueve
    e.preventDefault();
    const paso = e.shiftKey ? 50 : 10;
    let dx = 0, dy = 0;
    if (e.key === "ArrowLeft") dy = -paso;
    else if (e.key === "ArrowRight") dy = paso;
    else if (e.key === "ArrowUp") dx = -paso;
    else if (e.key === "ArrowDown") dx = paso;
    const nuevaX = sd.truckX + dx;
    const nuevaY = sd.truckY + dy;
    const excluir = new Set(sd.paletIds);
    if (hayColisionCamion(excluir, nuevaX, nuevaY, sd.anchoMm, sd.largoMm)) return;
    sd.truckX = nuevaX;
    sd.truckY = nuevaY;
    stackSeleccionado.position.set(nuevaY * ESCALA, 0, nuevaX * ESCALA);
    onMoverCamion?.(sd.paletIds, nuevaX, nuevaY);
  }

  renderer.domElement.addEventListener("mousedown", onMouseDown);
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("mouseup",   onMouseUp);
  window.addEventListener("keydown", onKeyDown);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(largo / 2, altoCam / 4, anchoCam / 2);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = largo * 4;
  if (opciones.cameraState) {
    const cs = opciones.cameraState;
    controls.target.set(cs.tx, cs.ty, cs.tz);
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

  // ── Aplicar datos: usada tanto en la construcción inicial como en cada
  //    llamada a `actualizar` — así ambos caminos son literalmente el mismo
  //    código y no pueden divergir entre sí. ────────────────────────────────
  function aplicarDatos(
    nuevoContainer: HTMLElement,
    nuevoCamion: TruckLoadPlan,
    nuevoStaged: StagedStackInfo[],
    nuevosLockedKeys: Set<string>,
    nuevasOpciones?: EscenaOpciones
  ) {
    const opts = nuevasOpciones ?? {};

    // El HTML del panel se re-renderiza en cada replan, así que el div del
    // canvas puede ser un elemento del DOM distinto al de la última vez:
    // reenganchar el <canvas> (mismo contexto WebGL, sin coste) si hace falta.
    if (nuevoContainer !== container || renderer.domElement.parentElement !== nuevoContainer) {
      container = nuevoContainer;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
      resizeObs.disconnect();
      resizeObs.observe(container);
      const w = container.clientWidth || W;
      const h = container.clientHeight || H;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    camion = nuevoCamion;
    paletsMutable = camion.pallets;
    staged = nuevoStaged;
    lockedKeys = nuevosLockedKeys;
    opciones = opts;
    onSeleccion = opts.onSeleccion;
    onMoverCamion = opts.onMoverCamion;
    onComprobarApilableManual = opts.onComprobarApilableManual;
    onApilarManual = opts.onApilarManual;
    onEnviarEspera = opts.onEnviarEspera;
    onRecuperarDeEspera = opts.onRecuperarDeEspera;
    crateGeomPorRef = opts.crateGeomPorRef;
    crateInfoPorRef = opts.crateInfoPorRef;
    rotacionVisual = opts.rotacionVisual;
    detalle = opts.detalle ?? false;

    const nuevoLargo = camion.truckProfile.largoInteriorMm * ESCALA;
    const nuevoAncho = camion.truckProfile.anchoInteriorMm * ESCALA;
    const nuevoAlto  = camion.truckProfile.altoInteriorMm  * ESCALA;
    if (nuevoLargo !== largo || nuevoAncho !== anchoCam || nuevoAlto !== altoCam) {
      largo = nuevoLargo; anchoCam = nuevoAncho; altoCam = nuevoAlto;
      construirCarcasa();
    }

    reconciliarPilas();

    const key = opts.reseleccionarStackKey;
    const g = key ? stackGroups.get(key) : undefined;
    if (g) reseleccionarForzado(g);
    else deseleccionarPila();
  }

  // Aplicar los datos iniciales por el mismo camino que las actualizaciones.
  aplicarDatos(container, camionInicial, stagedInicial, lockedKeysInicial, opcionesIniciales);

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
      window.removeEventListener("keydown", onKeyDown);
      controls.dispose();
      disponerRecursos(recursosCarcasa);
      for (const rec of recursosPorStack.values()) disponerRecursos(rec);
      matSeleccion.dispose(); matBloqueado.dispose(); matEspera.dispose();
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
    actualizar: aplicarDatos,
  };
}