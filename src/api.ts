import { generarPaletsDePedido } from "./lotCalculator";
import { empacarPedido, type ObstaculoPlanta } from "./packer";
import type { LoadPlanResult, OrderLine, PalletType, Reference, TruckProfile } from "./types";

export type { ObstaculoPlanta };

// ============================================================================
// API PÚBLICA
// ============================================================================

/** Tipos de palet más habituales en España/UE, listos para usar o copiar */
export const PALLET_TYPES: Record<string, PalletType> = {
  EUROPEO: {
    id: "europeo-800x1200",
    nombre: "Europalet (800x1200)",
    largoMm: 1200,
    anchoMm: 800,
    alturaBaseMm: 144,
    pesoMaxKg: 1000,
    pesoTaraKg: 25,
  },
  AMERICANO: {
    id: "americano-1000x1200",
    nombre: "Palet americano (1000x1200)",
    largoMm: 1200,
    anchoMm: 1000,
    alturaBaseMm: 150,
    pesoMaxKg: 1250,
    pesoTaraKg: 28,
  },
  MEDIO: {
    id: "medio-600x800",
    nombre: "Medio palet (600x800)",
    largoMm: 800,
    anchoMm: 600,
    alturaBaseMm: 144,
    pesoMaxKg: 500,
    pesoTaraKg: 14,
  },
};

/**
 * Perfil de camión por defecto (semirremolque estándar tipo "mega" europeo).
 * Las medidas de camión son SIEMPRE configurables: crea tantos perfiles como
 * necesites con crearTruckProfile() y guárdalos donde te convenga (DB, API...).
 */
export const DEFAULT_TRUCK_PROFILE: TruckProfile = {
  id: "semirremolque-estandar",
  nombre: "Semirremolque estándar",
  largoInteriorMm: 13600,
  anchoInteriorMm: 2480,
  altoInteriorMm: 2700,
  pesoMaxKg: 24000,
};

export function crearTruckProfile(datos: Omit<TruckProfile, "id"> & { id?: string }): TruckProfile {
  return {
    id: datos.id ?? `truck-${datos.nombre.toLowerCase().replace(/\s+/g, "-")}`,
    ...datos,
  };
}

export function crearReferencia(datos: Reference): Reference {
  return datos;
}

/**
 * Función principal del módulo: dado un pedido (líneas con cantidad por
 * referencia), el catálogo de referencias y un perfil de camión, devuelve
 * el plan de carga completo (puede ocupar varios camiones).
 *
 * Es pura: no toca base de datos ni red. Conecta tu capa de persistencia
 * (API REST, Drive, lo que use tu backend) por fuera, pasándole aquí los
 * datos ya cargados.
 */
export function planificarCargaCamion(
  lineas: OrderLine[],
  catalogoReferencias: Reference[],
  truckProfile: TruckProfile = DEFAULT_TRUCK_PROFILE,
  opciones?: {
    permitirVariosCamiones?: boolean;
    maxCamiones?: number;
    /** Posiciones fijadas manualmente: el algoritmo no colocará palets nuevos encima de ellas. */
    posicionesBloqueadas?: ObstaculoPlanta[];
  }
): LoadPlanResult {
  const mapaReferencias = new Map(catalogoReferencias.map((r) => [r.id, r]));

  const { palets, avisos: avisosLote } = generarPaletsDePedido(lineas, mapaReferencias);

  const maxCamiones = opciones?.permitirVariosCamiones ? opciones?.maxCamiones ?? 25 : 1;

  const { camiones, noAsignados, avisos: avisosEmpaquetado } = empacarPedido(
    palets,
    mapaReferencias,
    truckProfile,
    maxCamiones,
    opciones?.posicionesBloqueadas ?? []
  );

  return {
    camiones,
    referenciasNoAsignadas: noAsignados,
    avisos: [...avisosLote, ...avisosEmpaquetado],
  };
}
