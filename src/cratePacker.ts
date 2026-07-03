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

let contadorBulto = 0;
function nuevoIdBulto(): string {
  contadorBulto += 1;
  return `BULTO-${contadorBulto.toString().padStart(5, "0")}`;
}

const SIN_LIMITE_PESO = Number.MAX_SAFE_INTEGER;

/**
 * Dimensiones y peso de UNA unidad de la referencia, incluyendo la carga
 * encima si la lleva (palet + aro se tratan como una unidad compuesta).
 */
function unidadCompuesta(ref: CrateReference): {
  largoMm: number;
  anchoMm: number;
  altoMm: number;
  pesoKg: number;
} {
  if (!ref.cargaEncima) {
    return { largoMm: ref.largoMm, anchoMm: ref.anchoMm, altoMm: ref.altoUnidadMm, pesoKg: ref.pesoUnidadKg };
  }
  const c = ref.cargaEncima;
  return {
    // La huella la manda la pieza más grande (normalmente el palet).
    largoMm: Math.max(ref.largoMm, c.largoMm),
    anchoMm: Math.max(ref.anchoMm, c.anchoMm),
    altoMm: ref.altoUnidadMm + c.altoMm,
    pesoKg: ref.pesoUnidadKg + c.pesoKg,
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

    const u = unidadCompuesta(ref);
    const packAltoMm = u.altoMm * flejado;
    const packPesoKg = Math.round(u.pesoKg * flejado);

    // Registrar/actualizar la Reference sintética para el packer.
    const prev = alturaMaxPorRef.get(ref.id) ?? 0;
    alturaMaxPorRef.set(ref.id, Math.max(prev, packAltoMm));

    if (!refMap.has(ref.id)) {
      const palletType: PalletType = {
        id: `pt-${ref.id}`,
        nombre: `Bulto ${ref.sku}`,
        largoMm: u.largoMm,
        anchoMm: u.anchoMm,
        alturaBaseMm: 0,
        pesoMaxKg: ref.pesoMaxApilableKg ?? SIN_LIMITE_PESO,
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
