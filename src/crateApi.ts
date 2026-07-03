// ============================================================================
// API PÚBLICA DEL FLUJO "CAJAS"
// ============================================================================
// Hermano gemelo de planificarCargaCamion (api.ts), pero de entrada acepta
// referencias nacidas de los JSON del constructor y líneas por PACKS. Devuelve
// el mismo LoadPlanResult, así que la UI y el visor 3D lo consumen igual.
// ----------------------------------------------------------------------------

import { empacarPedido, type ObstaculoPlanta } from "./packer";
import { construirCargaDeCajas } from "./cratePacker";
import { DEFAULT_TRUCK_PROFILE } from "./api";
import type { CrateOrderLine, CrateReference } from "./crateTypes";
import type { LoadPlanResult, TruckProfile } from "./types";

/**
 * Planifica la carga de un pedido de CAJAS/PALETS venidos del constructor.
 *
 * @param lineas       Líneas por packs (referenceId + numeroDePacks [+ override flejado]).
 * @param referencias  Catálogo de CrateReference cargadas desde los envoltorios JSON.
 * @param truckProfile Perfil de camión (por defecto, semirremolque estándar).
 *
 * Es pura: no toca red ni disco. Igual que planificarCargaCamion.
 */
export function planificarCargaDeCajas(
  lineas: CrateOrderLine[],
  referencias: CrateReference[],
  truckProfile: TruckProfile = DEFAULT_TRUCK_PROFILE,
  opciones?: {
    permitirVariosCamiones?: boolean;
    maxCamiones?: number;
    posicionesBloqueadas?: ObstaculoPlanta[];
  }
): LoadPlanResult {
  const mapaCrate = new Map(referencias.map((r) => [r.id, r]));

  const { palets, referencias: refMapPacker, avisos: avisosBultos } = construirCargaDeCajas(
    lineas,
    mapaCrate
  );

  const maxCamiones = opciones?.permitirVariosCamiones ? opciones?.maxCamiones ?? 25 : 1;

  const { camiones, noAsignados, avisos: avisosEmpaquetado } = empacarPedido(
    palets,
    refMapPacker,
    truckProfile,
    maxCamiones,
    opciones?.posicionesBloqueadas ?? []
  );

  return {
    camiones,
    referenciasNoAsignadas: noAsignados,
    avisos: [...avisosBultos, ...avisosEmpaquetado],
  };
}
