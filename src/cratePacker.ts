// ============================================================================
// packBuilder: CrateReference + líneas (por packs)  →  bultos para el packer
// ============================================================================
// Traduce el modelo de dominio (cajas/palets con flejado) a la moneda que el
// packer YA entiende: PalletInstance[] + Map<string, Reference>. Cada PACK
// flejado se representa como UN PalletInstance atómico (altura = unidad × N,
// peso = unidad × N). `empacarPedido` no se toca: coloca los packs y, si la
// referencia es apilable, apila packs sobre packs hasta el techo del camión.
// ----------------------------------------------------------------------------

import type { CrateOrderLine, CrateReference } from "./crateTypes";
import type { PalletInstance, PalletType, Reference } from "./types";
import { SIN_LIMITE_PESO_KG } from "./types";
import { bboxNativoCrate } from "./crateMeshes";
import type { Cfg } from "./crateGeometry";

let contadorBulto = 0;
function nuevoIdBulto(): string {
  contadorBulto += 1;
  return `BULTO-${contadorBulto.toString().padStart(5, "0")}`;
}

/**
 * Dimensiones y peso del PACK COMPLETO (ya multiplicado por el flejado) de
 * una referencia. Antes esto se resolvía por unidad y se multiplicaba fuera
 * por el flejado — lo cual funciona para el caso genérico, pero no para
 * tipo "carga" (aros/piezas sobre un palet base real): ahí la altura del
 * palet base es una aportación FIJA (una sola vez), y solo las láminas de
 * encima escalan con el flejado. Mismo criterio que `crateToReference.ts`
 * (usado por el flujo clásico), para que ambos caminos den el mismo resultado.
 */
function medidasBulto(
  ref: CrateReference,
  referencias: Map<string, CrateReference>,
  flejado: number
): { largoMm: number; anchoMm: number; altoMm: number; pesoKg: number } {
  if (ref.tipo === "carga" && ref.paletBase) {
    const base = referencias.get(ref.paletBase);
    if (!base) {
      throw new Error(`La carga ${ref.sku} necesita el palet base ${ref.paletBase} cargado.`);
    }
    const bb = bboxNativoCrate(base.crateJson as Cfg); // cm
    const baseAltoMm = Math.round(bb.alto * 10);
    const baseLargoMm = Math.round(bb.largo * 10);
    const baseAnchoMm = Math.round(bb.ancho * 10);
    return {
      // La huella la manda la pieza más grande (normalmente el palet base).
      largoMm: Math.max(baseLargoMm, ref.largoMm),
      anchoMm: Math.max(baseAnchoMm, ref.anchoMm),
      altoMm: baseAltoMm + ref.altoUnidadMm * flejado,
      pesoKg: Math.round(ref.pesoUnidadKg * flejado),
    };
  }

  // Caso normal: si se transporta desmontada, sus medidas (huella + alto del
  // apilado de paneles planos) mandan sobre las de la caja montada. Si no,
  // con o sin cargaEncima genérica (aro/pieza suelta que si se repite sí
  // escala con el flejado, igual que la propia unidad).
  if (ref.desmontado) {
    return {
      largoMm: ref.desmontado.largoMm,
      anchoMm: ref.desmontado.anchoMm,
      altoMm: ref.desmontado.altoMm * flejado,
      pesoKg: Math.round(ref.pesoUnidadKg * flejado),
    };
  }
  const largoMm = ref.cargaEncima ? Math.max(ref.largoMm, ref.cargaEncima.largoMm) : ref.largoMm;
  const anchoMm = ref.cargaEncima ? Math.max(ref.anchoMm, ref.cargaEncima.anchoMm) : ref.anchoMm;
  const altoPorUnidadMm = ref.altoUnidadMm + (ref.cargaEncima?.altoMm ?? 0);
  const pesoPorUnidadKg = ref.pesoUnidadKg + (ref.cargaEncima?.pesoKg ?? 0);
  return {
    largoMm, anchoMm,
    altoMm: altoPorUnidadMm * flejado,
    pesoKg: Math.round(pesoPorUnidadKg * flejado),
  };
}

export interface ResultadoConstruccion {
  palets: PalletInstance[];
  referencias: Map<string, Reference>;
  avisos: string[];
}

/**
 * Convierte las líneas del pedido de cajas en bultos físicos listos para
 * `empacarPedido`. Genera también el `Map<string, Reference>` sintético que el
 * packer necesita (uno por referencia usada).
 */
export function construirCargaDeCajas(
  lineas: CrateOrderLine[],
  referencias: Map<string, CrateReference>
): ResultadoConstruccion {
  const palets: PalletInstance[] = [];
  const avisos: string[] = [];
  const refMap = new Map<string, Reference>();

  // Altura máxima de pack por referencia (para la comprobación de "cabe de alto"
  // del packer, que usa un único Reference por id aunque haya flejados distintos).
  const alturaMaxPorRef = new Map<string, number>();

  for (const linea of lineas) {
    const ref = referencias.get(linea.referenceId);
    if (!ref) {
      avisos.push(`Referencia desconocida: ${linea.referenceId} (línea omitida).`);
      continue;
    }
    if (!Number.isInteger(linea.numeroDePacks) || linea.numeroDePacks <= 0) {
      continue; // línea vacía o sin packs: se ignora en silencio
    }

    const flejado = linea.unidadesPorPackOverride ?? ref.unidadesPorPack;
    if (!Number.isInteger(flejado) || flejado <= 0) {
      avisos.push(`${ref.sku}: flejado no válido (${flejado}); se ignora la línea.`);
      continue;
    }

    let m: { largoMm: number; anchoMm: number; altoMm: number; pesoKg: number };
    try {
      m = medidasBulto(ref, referencias, flejado);
    } catch (e) {
      avisos.push(e instanceof Error ? e.message : String(e));
      continue;
    }
    const packAltoMm = m.altoMm;
    const packPesoKg = m.pesoKg;

    // Registrar/actualizar la Reference sintética para el packer.
    const prev = alturaMaxPorRef.get(ref.id) ?? 0;
    alturaMaxPorRef.set(ref.id, Math.max(prev, packAltoMm));

    if (!refMap.has(ref.id)) {
      const palletType: PalletType = {
        id: `pt-${ref.id}`,
        nombre: `Bulto ${ref.sku}`,
        largoMm: m.largoMm,
        anchoMm: m.anchoMm,
        alturaBaseMm: 0,
        pesoMaxKg: ref.pesoMaxApilableKg ?? SIN_LIMITE_PESO_KG,
        pesoTaraKg: 0,
      };
      const reference: Reference = {
        id: ref.id,
        sku: ref.sku,
        nombre: ref.nombre,
        unidadesPorPalet: flejado, // no lo usa el packer; informativo
        loteMinimo: 1,             // sin lote mínimo en el flujo de cajas
        apilable: ref.apilable,
        palletType,
        pesoUnitarioKg: ref.pesoUnidadKg,
        alturaPaletCompletoMm: packAltoMm, // se ajusta al máximo más abajo
      };
      refMap.set(ref.id, reference);
    }

    // Crear los N packs (cada uno un bulto atómico).
    for (let i = 0; i < linea.numeroDePacks; i++) {
      palets.push({
        id: nuevoIdBulto(),
        referenceId: ref.id,
        unidades: flejado,        // unidades individuales que contiene el pack (para reportes)
        esCompleto: true,
        pesoKg: packPesoKg,
        alturaMm: packAltoMm,
        apilable: ref.apilable,
        palletType: refMap.get(ref.id)!.palletType,
      });
    }
  }

  // Ajustar alturaPaletCompletoMm de cada Reference al pack más alto de esa ref
  // (la comprobación de altura del packer usa este valor como cota atómica).
  for (const [id, reference] of refMap) {
    reference.alturaPaletCompletoMm = alturaMaxPorRef.get(id) ?? reference.alturaPaletCompletoMm;
  }

  return { palets, referencias: refMap, avisos };
}