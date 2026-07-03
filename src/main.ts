import "./style.css";
import {
  planificarCargaCamion,
  DEFAULT_TRUCK_PROFILE,
  type ObstaculoPlanta,
  type Reference,
  type OrderLine,
  type TruckProfile,
  type TruckLoadPlan,
  type LoadPlanResult,
  type PlacedPallet,
} from "./index";
import { crearEscena3D, type EscenaHandle, type EscenaOpciones, type PaletSeleccionado, type StagedStackInfo } from "./scene3d";
import { cargarReferenciaDeTexto } from "./crateAdapter";
import { crateReferenceAReference } from "./crateToReference";
import type { CrateReference } from "./crateTypes";

// ============================================================================
// CATÁLOGO
// Las referencias se cargan desde public/JsonRefs (envoltorios del constructor).
// ============================================================================
const CATALOGO_BASE: Reference[] = [];

const CANTIDADES_INICIALES: Record<string, number> = {};
// JSON del constructor por referencia cargada (para el visor 3D real futuro).
const crateGeomPorRef = new Map<string, unknown>();
const crateInfoPorRef = new Map<string, { tipo: string; paletBase: string | null; unidades: number; laminaAltoMm: number; laminaLargoCm: number; laminaAnchoCm: number }>();
const crateRefsCrudas = new Map<string, CrateReference>();

let customRefs: Reference[] = [];

function catalogoCompleto(): Reference[] { return [...CATALOGO_BASE, ...customRefs]; }

// ============================================================================
// COLORES
// ============================================================================
const PALETA = ["#4fd1c5","#ff8a3d","#9b8cff","#f2d544","#5aa9ff","#ff6fa8","#f87171","#34d399","#fb923c","#a78bfa"];
const colorPorRef = new Map(CATALOGO_BASE.map((r, i) => [r.id, PALETA[i % PALETA.length]]));
function colorDe(id: string): string {
  if (!colorPorRef.has(id)) colorPorRef.set(id, PALETA[colorPorRef.size % PALETA.length]);
  return colorPorRef.get(id)!;
}

// ============================================================================
// ESTADO
// ============================================================================
let truckProfile: TruckProfile = {
  ...DEFAULT_TRUCK_PROFILE,
  nombre: "Camión estándar",
  largoInteriorMm: 12000, anchoInteriorMm: 2400, altoInteriorMm: 2400,
};
let permitirVarios = false;
let resultado: LoadPlanResult | null = null;
let truckIdx = 0;
let escena: EscenaHandle | null = null;
let modoManual = false;
let detalle3D = false;
let pilaSeleccionada: PaletSeleccionado | null = null;

// ── Estado de posiciones bloqueadas ──────────────────────────────────────────
interface StackBloqueado {
  stackKey: string;
  refId: string;
  truckX: number;
  truckY: number;
  anchoMm: number;
  largoMm: number;
  unidades: number;
  palets: PlacedPallet[];
}
const stacksBloqueados = new Map<string, StackBloqueado>(); // key = stackKey
const rotacionVisual = new Map<string, boolean>(); // stackKey → girada 90° (para geometría cuadrada)

// ── Estado de la zona de espera ───────────────────────────────────────────────
interface StagedStack {
  id: string;
  refId: string;
  paletIds: string[];
  palets: PlacedPallet[];
  anchoMm: number;
  largoMm: number;
  unidades: number;
  slotIdx: number;
}
let stagedStacks: StagedStack[] = [];
let nextStagedSlot = 0;

// ============================================================================
// DOM
// ============================================================================
document.getElementById("app")!.innerHTML = `
  <!-- Cabecera compacta -->
  <header class="app-header">
    <div class="app-header__left">
      <span class="app-header__eyebrow">Logística</span>
      <h1>Planificador de carga de camiones</h1>
    </div>
    <div class="app-header__meta" id="meta"></div>
  </header>

  <!-- Layout principal -->
  <div class="main-layout">

    <!-- ── Sidebar ───────────────────────────────────── -->
    <aside class="sidebar">

      <!-- Pedido -->
      <div class="panel" id="panel-pedido">
        <h2>Pedido</h2>
        <div id="order-rows"></div>
        <p class="auto-hint">Cada salto equivale a un palet completo. El plano se recalcula automáticamente.</p>
      </div>
      <!-- Cargar referencias desde JSON del constructor -->
      <div class="panel">
        <h2>Cargar referencias (JSON)</h2>
        <label for="crate-files" class="btn-add-ref" style="display:inline-block;text-align:center;">
          📂 Añadir archivos .json
        </label>
        <input type="file" id="crate-files" accept=".json" multiple style="display:none"/>
        <p class="auto-hint">Envoltorios exportados desde el constructor. Cada uno añade una referencia al pedido.</p>
        <p class="custom-ref-error" id="crate-error"></p>
      </div>

      <!-- Avisos lote mínimo -->
      <div class="avisos" id="avisos-lote"></div>


      <!-- Perfil camión -->
      <div class="panel">
        <h2>Perfil de camión</h2>
        <div class="truck-fields">
          <label class="field"><span>Largo interior (cm)</span><input type="number" id="truck-largo" value="${truckProfile.largoInteriorMm/10}"/></label>
          <label class="field"><span>Ancho interior (cm)</span><input type="number" id="truck-ancho" value="${truckProfile.anchoInteriorMm/10}"/></label>
          <label class="field"><span>Alto interior (cm)</span><input type="number" id="truck-alto" value="${truckProfile.altoInteriorMm/10}"/></label>
          <label class="field"><span>Peso máx. (kg)</span><input type="number" id="truck-peso" value="${truckProfile.pesoMaxKg}"/></label>
        </div>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-varios"/>
          <span>Permitir repartir en varios camiones</span>
        </label>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-detalle"/>
          <span>Detalle 3D (geometría real)</span>
        </label>
      </div>

    </aside>

    <!-- ── Área de resultados ─────────────────────────── -->
    <div class="results-area" id="results-area">
      <div class="empty-state" id="empty-state">
        Configura el pedido y espera el recálculo automático para ver el plano de carga.
      </div>
    </div>

  </div>
`;

// ── Refs a nodos clave ───────────────────────────────────────────
const orderRowsEl = document.getElementById("order-rows")!;
const avisosLoteEl = document.getElementById("avisos-lote")!;
const resultsAreaEl = document.getElementById("results-area")!;
const metaEl = document.getElementById("meta")!;

// ============================================================================
// UTILIDADES
// ============================================================================
function actualizarMeta() {
  const t = truckProfile;
  metaEl.innerHTML = `<b>${t.nombre}</b> &nbsp;${t.largoInteriorMm/10}×${t.anchoInteriorMm/10}×${t.altoInteriorMm/10} cm · ${t.pesoMaxKg} kg`;
}
actualizarMeta();

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let id: ReturnType<typeof setTimeout> | undefined;
  return ((...a: never[]) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }) as T;
}
const planAuto = debounce(planificar, 250);

// ============================================================================
// RENDER DE FILAS DEL PEDIDO
// ============================================================================
function getCantidades(): Record<string, number> {
  const out: Record<string, number> = {};
  orderRowsEl.querySelectorAll<HTMLInputElement>("input[data-ref]").forEach(inp => {
    out[inp.dataset.ref!] = Number(inp.value);
  });
  return out;
}

function renderOrderRows() {
  const cant = getCantidades();

  // Unidades bloqueadas por referencia (no se puede pedir menos de esto)
  const lockedByRef = new Map<string, number>();
  for (const sb of stacksBloqueados.values()) {
    lockedByRef.set(sb.refId, (lockedByRef.get(sb.refId) ?? 0) + sb.unidades);
  }

  orderRowsEl.innerHTML = catalogoCompleto().map(ref => {
    const locked = lockedByRef.get(ref.id) ?? 0;
    const minVal  = locked > 0 ? locked : 0;
    // Si el valor actual es inferior al mínimo bloqueado, clampear hacia arriba
    const raw = cant[ref.id] ?? CANTIDADES_INICIALES[ref.id] ?? 0;
    const v   = locked > 0 ? Math.max(raw, locked) : raw;
    const esCustom = customRefs.some(r => r.id === ref.id);
    return `
      <div class="order-row" data-refid="${ref.id}">
        <div class="order-row__color" style="background:${colorDe(ref.id)}"></div>
        <div class="order-row__info">
          <span class="order-row__sku">${ref.sku}${locked > 0 ? ` <span class="lock-badge" title="${locked} ud fijadas">🔒</span>` : ""}</span>
          <span class="order-row__nombre">${ref.nombre}</span>
          <span class="order-row__detalle">${ref.unidadesPorPalet}ud/pal · lote≥${ref.loteMinimo} · ${ref.palletType.largoMm/10}×${ref.palletType.anchoMm/10}×${ref.alturaPaletCompletoMm/10}cm${ref.apilable?"":" · NO apilable"}</span>
        </div>
        <input type="number" min="${minVal}" step="${ref.unidadesPorPalet}" data-ref="${ref.id}" value="${v}"/>
        ${esCustom ? `<button class="btn-remove-ref" data-remove="${ref.id}" title="Eliminar">×</button>` : "<span></span>"}
      </div>`;
  }).join("");

  orderRowsEl.querySelectorAll<HTMLInputElement>("input[data-ref]").forEach(inp => {
    inp.addEventListener("input", () => {
      // Clampear en tiempo real si el usuario teclea un valor inferior al mínimo bloqueado
      const minV = Number(inp.min);
      if (minV > 0 && Number(inp.value) < minV) inp.value = String(minV);
      planAuto();
    });
  });
  orderRowsEl.querySelectorAll<HTMLButtonElement>(".btn-remove-ref").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.remove!;
      colorPorRef.delete(id);
      crateRefsCrudas.delete(id);
      crateGeomPorRef.delete(id);
      recomponerRefs();
    });
  });
}
renderOrderRows();

// ============================================================================
// CARGA DE REFERENCIAS DESDE JSON DEL CONSTRUCTOR
// ============================================================================
const crateFilesEl = document.getElementById("crate-files") as HTMLInputElement;
const crateErrorEl = document.getElementById("crate-error")!;

crateFilesEl.addEventListener("change", async () => {
  const files = Array.from(crateFilesEl.files ?? []);
  crateFilesEl.value = "";
  if (!files.length) return;

  const errores: string[] = [];
  let anadidas = 0;

  for (const file of files) {
    let texto: string;
    try {
      texto = await file.text();
    } catch {
      errores.push(`${file.name}: no se pudo leer.`);
      continue;
    }
    const { reference: cr, error } = cargarReferenciaDeTexto(texto);
    if (!cr) { errores.push(`${file.name}: ${error}`); continue; }
    crateRefsCrudas.set(cr.id, cr);
    crateGeomPorRef.set(cr.id, cr.crateJson);
    colorDe(cr.id);
    anadidas++;
  }

  crateErrorEl.textContent = errores.length
    ? `${anadidas} anadida(s). Errores:\n` + errores.join("\n")
    : "";
  crateErrorEl.style.display = errores.length ? "block" : "none";

  if (anadidas > 0) recomponerRefs();
});
function recomponerRefs() {
  customRefs = [];
  crateInfoPorRef.clear();
  for (const cr of crateRefsCrudas.values()) {
    try {
      customRefs.push(crateReferenceAReference(cr, crateRefsCrudas, crateGeomPorRef));
      crateInfoPorRef.set(cr.id, {
        tipo: cr.tipo, paletBase: cr.paletBase, unidades: cr.unidadesPorPack,
        laminaAltoMm: cr.altoUnidadMm, laminaLargoCm: cr.largoMm / 10, laminaAnchoCm: cr.anchoMm / 10,
      });
    } catch (e) {
      console.warn(e);
    }
  }
  renderOrderRows();
  planAuto();
}
async function cargarRefsIniciales() {
  let nombres: string[] = [];
  try {
    nombres = await (await fetch("/JsonRefs/index.json")).json();
  } catch {
    console.warn("No se encontro /JsonRefs/index.json");
  }
  for (const nombre of nombres) {
    try {
      const txt = await (await fetch(`/JsonRefs/${nombre}`)).text();
      const { reference: cr } = cargarReferenciaDeTexto(txt);
      if (!cr) continue;
      crateRefsCrudas.set(cr.id, cr);
      crateGeomPorRef.set(cr.id, cr.crateJson);
      colorDe(cr.id);
    } catch { /* ignore */ }
  }
  recomponerRefs();
}
cargarRefsIniciales();
// ============================================================================
// PERFIL CAMIÓN
// ============================================================================
["truck-largo","truck-ancho","truck-alto","truck-peso"].forEach(id => {
  document.getElementById(id)!.addEventListener("input", () => {
    truckProfile = {
      ...truckProfile,
      largoInteriorMm: Number((document.getElementById("truck-largo") as HTMLInputElement).value) * 10,
      anchoInteriorMm: Number((document.getElementById("truck-ancho") as HTMLInputElement).value) * 10,
      altoInteriorMm:  Number((document.getElementById("truck-alto")  as HTMLInputElement).value) * 10,
      pesoMaxKg:       Number((document.getElementById("truck-peso")  as HTMLInputElement).value),
    };
    actualizarMeta();
    planAuto();
  });
});

(document.getElementById("cb-varios") as HTMLInputElement).addEventListener("change", e => {
  permitirVarios = (e.target as HTMLInputElement).checked;
  planAuto();
});
(document.getElementById("cb-detalle") as HTMLInputElement).addEventListener("change", e => {
  detalle3D = (e.target as HTMLInputElement).checked;
  actualizarCamionActivo();
});

// ============================================================================
// PLANIFICACIÓN
// ============================================================================
function leerLineas(): OrderLine[] {
  const lineas: OrderLine[] = [];
  orderRowsEl.querySelectorAll<HTMLInputElement>("input[data-ref]").forEach(inp => {
    const n = Number(inp.value);
    if (n > 0) lineas.push({ referenceId: inp.dataset.ref!, cantidadSolicitada: n });
  });
  return lineas;
}

function planificar() {
  const lineas = leerLineas();
  avisosLoteEl.innerHTML = "";

  if (lineas.length === 0 && stacksBloqueados.size === 0) {
    if (escena) { escena.destruir(); escena = null; }
    resultado = null;
    resultsAreaEl.innerHTML = `<div class="empty-state">Indica al menos una cantidad mayor que 0.</div>`;
    return;
  }

  // ── Deducir unidades ya bloqueadas (posición fijada) del pedido ──────────
  const unidadesBloqPorRef = new Map<string, number>();
  const obstaculos: ObstaculoPlanta[] = [];
  for (const sb of stacksBloqueados.values()) {
    unidadesBloqPorRef.set(sb.refId, (unidadesBloqPorRef.get(sb.refId) ?? 0) + sb.unidades);
    obstaculos.push({ x: sb.truckX, y: sb.truckY, anchoMm: sb.anchoMm, largoMm: sb.largoMm });
  }
  // ── Deducir unidades en zona de espera ────────────────────────────────────
  const unidadesEsperaPorRef = new Map<string, number>();
  for (const ss of stagedStacks) {
    unidadesEsperaPorRef.set(ss.refId, (unidadesEsperaPorRef.get(ss.refId) ?? 0) + ss.unidades);
  }

  const lineasLibres = lineas
    .map(l => ({
      ...l,
      cantidadSolicitada: Math.max(0,
        l.cantidadSolicitada
        - (unidadesBloqPorRef.get(l.referenceId) ?? 0)
        - (unidadesEsperaPorRef.get(l.referenceId) ?? 0)
      ),
    }))
    .filter(l => l.cantidadSolicitada > 0);

  // ── Planificar los palets no bloqueados ───────────────────────────────────
  const planLibre = lineasLibres.length > 0
    ? planificarCargaCamion(lineasLibres, catalogoCompleto(), truckProfile, {
        permitirVariosCamiones: permitirVarios,
        posicionesBloqueadas: obstaculos,
      })
    : { camiones: [], referenciasNoAsignadas: [], avisos: [] };

  // ── Combinar con palets bloqueados (siempre en camion[0]) ─────────────────
  const paletsBloq = Array.from(stacksBloqueados.values()).flatMap(sb => sb.palets);

  if (paletsBloq.length > 0 && planLibre.camiones.length === 0) {
    // Solo hay palets bloqueados, sin resultado libre → crear un camión vacío
    planLibre.camiones.push({
      numero: 1, truckProfile,
      pallets: [], pesoTotalKg: 0, volumenUtilizadoM3: 0,
      volumenTotalM3: (truckProfile.largoInteriorMm / 1000) * (truckProfile.anchoInteriorMm / 1000) * (truckProfile.altoInteriorMm / 1000),
      ocupacionVolumen: 0, ocupacionPeso: 0, ocupacionSuelo: 0, posicionesSueloUsadas: 0,
    });
  }

  if (planLibre.camiones.length > 0 && paletsBloq.length > 0) {
    const c0 = planLibre.camiones[0];
    const todosLosP = [...paletsBloq, ...c0.pallets];
    const sueloT = (c0.truckProfile.largoInteriorMm / 1000) * (c0.truckProfile.anchoInteriorMm / 1000);
    const sueloU = todosLosP.filter(p => p.nivel === 0).reduce((s, p) => s + (p.largoOcupadoMm / 1000) * (p.anchoOcupadoMm / 1000), 0);
    planLibre.camiones[0] = {
      ...c0,
      pallets: todosLosP,
      pesoTotalKg: todosLosP.reduce((s, p) => s + p.pesoKg, 0),
      posicionesSueloUsadas: todosLosP.filter(p => p.nivel === 0).length,
      ocupacionSuelo: Math.round((sueloU / sueloT) * 1000) / 10,
    };
  }

  resultado = planLibre;
  truckIdx = 0;

  const avisosLote = resultado.avisos.filter(a => a.includes("lote mínimo"));
  avisosLoteEl.innerHTML = avisosLote.map(a => `<div class="aviso aviso--warn">⚠ ${a}</div>`).join("");

  if (resultado.camiones.length === 0) {
    if (escena) { escena.destruir(); escena = null; }
    resultsAreaEl.innerHTML = `<div class="empty-state">No se ha podido cargar ningún camión con este pedido.</div>`;
    return;
  }

  renderResultados();
}

// ============================================================================
// RENDER DE RESULTADOS
// ============================================================================
function renderResultados() {
  if (!resultado) return;
  const camiones = resultado.camiones;
  const noAsig = resultado.referenciasNoAsignadas;
  const hayDesb = noAsig.length > 0;

  // Banner de desbordamiento
  let bannerHtml = "";
  if (hayDesb && !permitirVarios) {
    const lineas = noAsig.map(na => {
      const ref = catalogoCompleto().find(r => r.id === na.referenceId);
      return `<b>${ref?.sku ?? na.referenceId}</b> — ${na.unidadesPendientes} unidades`;
    }).join(" · ");
    bannerHtml = `
      <div class="overflow-banner">
        <div class="overflow-banner__icon">⚠️</div>
        <div class="overflow-banner__body">
          <div class="overflow-banner__title">Camión completo — parte del pedido no cabe</div>
          <div class="overflow-banner__desc">${lineas}</div>
        </div>
        <label class="overflow-banner__cta" id="banner-cta">
          <input type="checkbox" id="banner-varios" ${permitirVarios ? "checked" : ""}/>
          Repartir en varios camiones
        </label>
      </div>`;
  }

  // Summary bar compacta
  const mediaSuelo = Math.round(camiones.reduce((s, c) => s + c.ocupacionSuelo, 0) / camiones.length);
  const pesoTotal  = Math.round(camiones.reduce((s, c) => s + c.pesoTotalKg, 0));
  const summaryHtml = `
    <div class="summary-bar">
      ${card(camiones.length.toString(), "Camiones")}
      ${card(mediaSuelo + "%", "Suelo medio")}
      ${card(pesoTotal + " kg", "Peso total")}
    </div>`;

  // Viewer 3D con pestañas
  const tabsHtml = camiones.map((c, i) =>
    `<button class="viewer3d-tab${i === truckIdx ? " viewer3d-tab--active":""}" data-idx="${i}">CAMIÓN ${c.numero}</button>`
  ).join("");

  resultsAreaEl.innerHTML = `
    ${bannerHtml}
    ${summaryHtml}
    <div class="viewer3d-panel">
      <div class="viewer3d-top">
        <div class="viewer3d-tabs" id="tabs">${tabsHtml}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn-modo-manual${modoManual ? " btn-modo-manual--activo" : ""}" id="btn-modo-manual">
            ${modoManual ? "⬡ Manual" : "⬡ Manual"}
          </button>
          <span class="viewer3d-hint">${modoManual ? "clic = seleccionar · arrastrar = mover · colisiones en rojo" : "arrastra · zoom"}</span>
        </div>
      </div>
      <div class="viewer3d-row2">
        <div class="viewer3d-stats" id="v3d-stats"></div>
        <div class="viewer3d-legend" id="v3d-legend"></div>
      </div>
      <div class="palet-info" id="palet-info" style="display:none"></div>
      <div class="viewer3d-canvas" id="v3d-canvas"></div>
    </div>
    <div class="plan-2d" id="plan-2d">
      <div class="plan-2d__header">
        <span class="plan-2d__title">Plano en planta (2D)</span>
        <div class="plan-2d__stats" id="plan-stats"></div>
      </div>
      <div class="truck-floor" id="plan-floor"></div>
    </div>
  `;

  // Conectar pestañas
  document.querySelectorAll<HTMLButtonElement>("#tabs .viewer3d-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      truckIdx = Number(btn.dataset.idx);
      document.querySelectorAll(".viewer3d-tab").forEach(b => b.classList.remove("viewer3d-tab--active"));
      btn.classList.add("viewer3d-tab--active");
      actualizarCamionActivo();
    });
  });

  // Conectar checkbox del banner
  const bannerCb = document.getElementById("banner-varios") as HTMLInputElement | null;
  if (bannerCb) {
    bannerCb.addEventListener("change", () => {
      permitirVarios = bannerCb.checked;
      (document.getElementById("cb-varios") as HTMLInputElement).checked = permitirVarios;
      planAuto();
    });
  }

  // Conectar botón de modo manual
  document.getElementById("btn-modo-manual")?.addEventListener("click", () => {
    modoManual = !modoManual;
    escena?.setModoManual(modoManual);
    // Re-render solo la cabecera del viewer para actualizar el estado del botón sin perder el canvas
    const btn = document.getElementById("btn-modo-manual");
    const hint = btn?.nextElementSibling;
    if (btn) btn.className = `btn-modo-manual${modoManual ? " btn-modo-manual--activo" : ""}`;
    if (hint) hint.textContent = modoManual
      ? "clic = seleccionar · arrastrar = mover · colisiones en rojo"
      : "arrastra · zoom";
    if (!modoManual) {
      pilaSeleccionada = null;
      const infoEl = document.getElementById("palet-info");
      if (infoEl) infoEl.style.display = "none";
    }
  });

  actualizarCamionActivo();
}

function card(valor: string, label: string): string {
  return `<div class="summary-card"><div class="summary-card__valor">${valor}</div><div class="summary-card__label">${label}</div></div>`;
}

// ============================================================================
// ACTUALIZAR CAMIÓN ACTIVO (3D + 2D)
// ============================================================================
function actualizarCamionActivo() {
  if (!resultado) return;
  const camion = resultado.camiones[truckIdx];
  if (!camion) return;

  // Claves de pilas bloqueadas para el camión activo
  const lockedKeys = new Set(
    Array.from(stacksBloqueados.values())
      .filter(sb => camion.pallets.some(p => p.nivel === 0 && p.x === sb.truckX && p.y === sb.truckY))
      .map(sb => `${sb.truckX}-${sb.truckY}`)
  );

  // Staged stacks info para la escena
  const stagedInfo: StagedStackInfo[] = stagedStacks.map(ss => ({
    id: ss.id,
    palets: ss.palets,
    slotIdx: ss.slotIdx,
  }));

  // Callbacks
  const opciones: EscenaOpciones = {
    onSeleccion(info) {
      pilaSeleccionada = info;
      const infoEl = document.getElementById("palet-info");
      if (!infoEl) return;
      if (!info) { infoEl.style.display = "none"; return; }
      const ref = catalogoCompleto().find(r => r.id === info.refId);
      const esBloqueado = info.bloqueado;
      const enEspera   = info.enEspera;
      infoEl.style.display = "flex";
      infoEl.innerHTML = `
        <div class="palet-info__color" style="background:${colorDe(info.refId)}"></div>
        <div class="palet-info__body">
          <span class="palet-info__sku">${ref?.sku ?? info.refId} ${esBloqueado ? "🔒" : ""} ${enEspera ? "⏳" : ""}</span>
          <span class="palet-info__dims">${info.largoMm/10}×${info.anchoMm/10}×${info.alturaApilaMm/10} cm</span>
          <span class="palet-info__meta">${info.unidades} ud · ${info.niveles} nivel${info.niveles>1?"es":""} · pos. ${info.posYcm}cm, ${info.posXcm}cm</span>
          <span class="palet-info__roterror" id="palet-rot-error"></span>
        </div>
        ${modoManual ? `
          <div class="palet-info__actions">
            ${!enEspera && !esBloqueado ? `
              <button class="palet-info__btn" id="btn-rotar-pila" title="Rotar la pila 90°">⟳ Rotar</button>
            ` : ""}
            <button class="palet-info__btn ${esBloqueado ? "palet-info__btn--activo" : ""}" id="btn-lock-pila">
              ${esBloqueado ? "🔒 Desfijar" : "🔓 Fijar posición"}
            </button>
            <span class="palet-info__hint">
              ${esBloqueado ? "Posición fija — no se puede mover ni rotar" : enEspera ? "" : "Arrastra al área verde para aparcar"}
            </span>
          </div>
        ` : ""}
      `;
      document.getElementById("btn-rotar-pila")?.addEventListener("click", () => rotarPila(info));
      document.getElementById("btn-lock-pila")?.addEventListener("click", () => toggleBloqueoPila(info));
    },

    onMoverCamion(paletIds, nuevaX, nuevaY) {
      for (const p of camion.pallets) {
        if (paletIds.includes(p.id)) { p.x = nuevaX; p.y = nuevaY; }
      }
      actualizarPlano2D(camion);
    },

    onEnviarEspera(paletIds) {
      // Eliminar del camión mutando el array en sitio — paletsMutable en scene3d
      // apunta al MISMO array, así que la colisión deja de verlos inmediatamente
      const afectados = camion.pallets.filter(p => paletIds.includes(p.id));
      if (!afectados.length) return;
      const base = afectados.find(p => p.nivel === 0) ?? afectados[0];
      const id = `staged-${Date.now()}-${base.referenceId}`;
      const ss: StagedStack = {
        id,
        refId: base.referenceId,
        paletIds,
        palets: afectados,
        anchoMm: base.anchoOcupadoMm,
        largoMm: base.largoOcupadoMm,
        unidades: afectados.reduce((s, p) => s + p.unidades, 0),
        slotIdx: nextStagedSlot++,
      };
      stagedStacks.push(ss);

      const idSet = new Set(paletIds);
      for (let i = camion.pallets.length - 1; i >= 0; i--) {
        if (idSet.has(camion.pallets[i].id)) camion.pallets.splice(i, 1);
      }
      actualizarPlano2D(camion);
    },

    onRecuperarDeEspera(paletIds, nuevaX, nuevaY) {
      // Añadir al camión mutando el array en sitio — misma razón
      const ss = stagedStacks.find(s => s.paletIds.some(id => paletIds.includes(id)));
      if (!ss) return;
      const paletsActualizados = ss.palets.map(p => ({ ...p, x: nuevaX, y: nuevaY }));
      paletsActualizados.forEach(p => camion.pallets.push(p));
      stagedStacks = stagedStacks.filter(s => s.id !== ss.id);
      actualizarPlano2D(camion);
    },
  };

  // Guardar posición de cámara antes de destruir la escena anterior
  const cameraState = escena?.getCameraState() ?? undefined;

  if (escena) { escena.destruir(); escena = null; }
  const canvas = document.getElementById("v3d-canvas");
  if (canvas) {
   escena = crearEscena3D(canvas, camion, colorPorRef, stagedInfo, lockedKeys,
      { ...opciones, cameraState, crateGeomPorRef, crateInfoPorRef, detalle: detalle3D, rotacionVisual });
    if (modoManual) escena.setModoManual(true);
  }

  const statsEl = document.getElementById("v3d-stats");
  if (statsEl) statsEl.innerHTML = `
    <span>SUELO <b>${camion.ocupacionSuelo}%</b></span>
    <span>VOL <b>${camion.ocupacionVolumen}%</b></span>
    <span>PESO <b>${camion.pesoTotalKg}/${camion.truckProfile.pesoMaxKg} kg</b></span>
    <span>PALETS <b>${camion.posicionesSueloUsadas}</b> en suelo</span>
    ${stagedStacks.length ? `<span>ESPERA <b>${stagedStacks.length}</b></span>` : ""}
    ${stacksBloqueados.size ? `<span>🔒 <b>${stacksBloqueados.size}</b> fijadas</span>` : ""}`;

  const legendEl = document.getElementById("v3d-legend");
  if (legendEl) {
    const refs = Array.from(new Set(camion.pallets.map(p => p.referenceId)));
    legendEl.innerHTML = refs.map(id => {
      const ref = catalogoCompleto().find(r => r.id === id);
      return `<div class="legend__item"><span class="legend__swatch" style="background:${colorDe(id)}"></span>${ref?.sku ?? id}</div>`;
    }).join("");
  }

  actualizarPlano2D(camion);
}

function rotarPila(info: PaletSeleccionado) {
  if (!resultado || info.enEspera || info.bloqueado) return;
  const camion = resultado.camiones[truckIdx];

  const pilaCompleta = camion.pallets.filter(p => info.paletIds.includes(p.id));
  if (!pilaCompleta.length) return;
  const base = pilaCompleta.find(p => p.nivel === 0) ?? pilaCompleta[0];

  // Tras rotar 90°: ancho↔largo
  const newAncho = base.largoOcupadoMm;
  const newLargo = base.anchoOcupadoMm;

  const { anchoInteriorMm, largoInteriorMm } = camion.truckProfile;

  const mostrarError = (msg: string) => {
    const el = document.getElementById("palet-rot-error");
    if (!el) return;
    el.textContent = `⚠ ${msg}`;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 3000);
  };

  // Validar límites del camión
  if (base.x + newAncho > anchoInteriorMm) {
    mostrarError(`Rotada necesita ${newAncho/10} cm de ancho, pero solo quedan ${(anchoInteriorMm - base.x)/10} cm.`);
    return;
  }
  if (base.y + newLargo > largoInteriorMm) {
    mostrarError(`Rotada no cabe en el largo del camión en esta posición.`);
    return;
  }

  // Validar colisión con otras pilas
  const excluir = new Set(info.paletIds);
  const colisiona = camion.pallets.some(p => {
    if (p.nivel !== 0 || excluir.has(p.id)) return false;
    const ox = base.x < p.x + p.anchoOcupadoMm && base.x + newAncho > p.x;
    const oy = base.y < p.y + p.largoOcupadoMm && base.y + newLargo > p.y;
    return ox && oy;
  });
  if (colisiona) {
    mostrarError("La pila rotada colisiona con otra en esta posición. Muévela primero.");
    return;
  }

  // Aplicar rotación mutando en sitio (paletsMutable se actualiza automáticamente)
  for (const p of pilaCompleta) {
    const oldAncho = p.anchoOcupadoMm;
    p.anchoOcupadoMm = p.largoOcupadoMm;
    p.largoOcupadoMm = oldAncho;
  }
  const stackKey = `${base.x}-${base.y}`;
  rotacionVisual.set(stackKey, !rotacionVisual.get(stackKey));
  // Recrear escena (la cámara se conserva) y actualizar plano 2D
  actualizarCamionActivo();
  actualizarPlano2D(camion);
}

function toggleBloqueoPila(info: PaletSeleccionado) {
  if (!resultado || info.enEspera) return;
  const camion = resultado.camiones[truckIdx];

  // Buscar los palets por sus IDs exactos para obtener la posición ACTUAL
  // (info.stackKey puede estar obsoleto si el usuario movió la pila antes de fijarla)
  const pilaCompleta = camion.pallets.filter(p => info.paletIds.includes(p.id));
  if (!pilaCompleta.length) return;
  const base = pilaCompleta.find(p => p.nivel === 0) ?? pilaCompleta[0];

  // Clave siempre derivada de la posición real actual, no del stackKey del renderizado previo
  const currentKey = `${base.x}-${base.y}`;

  if (stacksBloqueados.has(currentKey)) {
    stacksBloqueados.delete(currentKey);
  } else {
    stacksBloqueados.set(currentKey, {
      stackKey: currentKey,
      refId: base.referenceId,
      truckX: base.x,
      truckY: base.y,
      anchoMm: base.anchoOcupadoMm,
      largoMm: base.largoOcupadoMm,
      unidades: pilaCompleta.reduce((s, p) => s + p.unidades, 0),
      palets: pilaCompleta.map(p => ({ ...p })),   // deep-copy
    });
  }

  actualizarCamionActivo();
  renderOrderRows();
}

function actualizarPlano2D(camion: TruckLoadPlan) {
  const planStats = document.getElementById("plan-stats");
  if (planStats) planStats.innerHTML = `
    <span>SUELO <b>${camion.ocupacionSuelo}%</b></span>
    <span>VOLUMEN <b>${camion.ocupacionVolumen}%</b></span>
    <span>PESO <b>${camion.pesoTotalKg} kg</b></span>`;

  const floor = document.getElementById("plan-floor");
  if (floor) floor.innerHTML = dibujarPlano(camion);
}

function dibujarPlano(camion: TruckLoadPlan): string {
  const { largoInteriorMm, anchoInteriorMm } = camion.truckProfile;
  const disponible = (document.getElementById("plan-floor")?.parentElement?.clientWidth ?? 700) - 24;
  const escala = Math.min(disponible / largoInteriorMm, 140 / anchoInteriorMm);
  const w = Math.round(largoInteriorMm * escala);
  const h = Math.round(anchoInteriorMm * escala);

  const pilasPorPos = new Map<string, typeof camion.pallets>();
  camion.pallets.forEach(p => {
    const k = `${p.x}-${p.y}`;
    pilasPorPos.set(k, [...(pilasPorPos.get(k) ?? []), p]);
  });

  const grid = [];
  for (let mm = 1000; mm < largoInteriorMm; mm += 1000) {
    const x = Math.round(mm * escala);
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#1f2833" stroke-width="1"/>`);
  }

  const rects = camion.pallets.filter(p => p.nivel === 0).map(p => {
    const ref = catalogoCompleto().find(r => r.id === p.referenceId);
    const x = Math.round(p.y * escala);
    const y = Math.round(p.x * escala);
    const pw = Math.round(p.largoOcupadoMm * escala);
    const ph = Math.round(p.anchoOcupadoMm * escala);
    const color = colorDe(p.referenceId);
    const sku = ref?.sku ?? "";
    const dims = `${p.largoOcupadoMm/10}×${p.anchoOcupadoMm/10}`;
    const esPilaSeleccionada = pilaSeleccionada?.paletIds.some(id => id === p.id);
    const stroke = esPilaSeleccionada ? "white" : color;
    const strokeW = esPilaSeleccionada ? 2 : 1;
    return `
      <g>
        <rect x="${x}" y="${y}" width="${Math.max(pw-1,1)}" height="${Math.max(ph-1,1)}"
              fill="${color}" fill-opacity="0.85" stroke="${stroke}" stroke-width="${strokeW}" rx="2"/>
        ${pw > 28 && ph > 14 ? `
          <text x="${x+pw/2}" y="${y+ph/2-4}" font-size="8" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410">${sku}</text>
          <text x="${x+pw/2}" y="${y+ph/2+6}" font-size="7" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410" opacity="0.75">${dims}cm</text>
        ` : pw > 16 ? `
          <text x="${x+pw/2}" y="${y+ph/2}" font-size="7" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410">${sku}</text>
        ` : ""}
      </g>`;
  }).join("");

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#2a3441" stroke-width="1.5"/>
    ${grid.join("")}${rects}
  </svg>`;
}

// Planificación inicial
planificar();
(window as any).crateGeomPorRef = crateGeomPorRef;
(window as any).crateInfoPorRef = crateInfoPorRef;