import type { OrderLine, PalletInstance, Reference } from "./types";

let contadorPalet = 0;
function nuevoIdPalet(): string {
  contadorPalet += 1;
  return `PAL-${contadorPalet.toString().padStart(5, "0")}`;
}

export interface ResultadoValidacionLinea {
  ok: boolean;
  cantidadAjustada: number;
  mensaje?: string;
}

/**
 * Comprueba que la cantidad pedida respeta el lote mínimo de la referencia.
 * El lote mínimo es solo un SUELO: por debajo de esa cantidad no se puede
 * entregar nada de esa referencia. Una vez alcanzado o superado, se puede
 * seguir entregando palet a palet sin que el total tenga que ser múltiplo
 * del lote mínimo (p. ej. lote mínimo 60 + 1 palet de 6 unidades = 66 es
 * una cantidad perfectamente válida).
 */
export function validarLoteMinimo(
  reference: Reference,
  cantidadSolicitada: number
): ResultadoValidacionLinea {
  if (cantidadSolicitada <= 0) {
    return { ok: false, cantidadAjustada: 0, mensaje: "Cantidad solicitada debe ser mayor que 0" };
  }

  if (cantidadSolicitada >= reference.loteMinimo) {
    return { ok: true, cantidadAjustada: cantidadSolicitada };
  }

  return {
    ok: false,
    cantidadAjustada: reference.loteMinimo,
    mensaje: `${reference.sku}: la cantidad pedida (${cantidadSolicitada}) es inferior al lote mínimo de entrega (${reference.loteMinimo}). Se ajusta a ${reference.loteMinimo} unidades.`,
  };
}

/**
 * Convierte la cantidad (ya ajustada al lote mínimo) en palets físicos:
 * tantos palets completos como quepan y, si sobran unidades, un palet parcial.
 *
 * Nota: la altura del palet parcial se aproxima de forma proporcional al
 * porcentaje de llenado. Si se dispone de la altura real por unidad de
 * producto, se recomienda sustituir este cálculo por uno exacto.
 */
export function generarPaletsDeLinea(
  reference: Reference,
  cantidadAjustada: number
): PalletInstance[] {
  const palets: PalletInstance[] = [];
  const { unidadesPorPalet } = reference;

  const paletsCompletos = Math.floor(cantidadAjustada / unidadesPorPalet);
  const unidadesSobrantes = cantidadAjustada % unidadesPorPalet;

  for (let i = 0; i < paletsCompletos; i++) {
    palets.push(crearPalet(reference, unidadesPorPalet, true));
  }

  if (unidadesSobrantes > 0) {
    palets.push(crearPalet(reference, unidadesSobrantes, false));
  }

  return palets;
}

function crearPalet(reference: Reference, unidades: number, esCompleto: boolean): PalletInstance {
  const ratioLlenado = unidades / reference.unidadesPorPalet;
  const alturaMercancia = reference.alturaPaletCompletoMm - reference.palletType.alturaBaseMm;
  const alturaMm = esCompleto
    ? reference.alturaPaletCompletoMm
    : Math.round(reference.palletType.alturaBaseMm + alturaMercancia * ratioLlenado);

  return {
    id: nuevoIdPalet(),
    referenceId: reference.id,
    unidades,
    esCompleto,
    pesoKg: Math.round(reference.palletType.pesoTaraKg + unidades * reference.pesoUnitarioKg),
    alturaMm,
    apilable: reference.apilable,
    palletType: reference.palletType,
  };
}

/**
 * Procesa todas las líneas de un pedido y devuelve la lista de palets a
 * cargar junto con los avisos de ajustes por lote mínimo.
 */
export function generarPaletsDePedido(
  lineas: OrderLine[],
  referencias: Map<string, Reference>
): { palets: PalletInstance[]; avisos: string[] } {
  const palets: PalletInstance[] = [];
  const avisos: string[] = [];

  for (const linea of lineas) {
    const reference = referencias.get(linea.referenceId);
    if (!reference) {
      avisos.push(`Referencia desconocida: ${linea.referenceId} (línea omitida)`);
      continue;
    }

    const validacion = validarLoteMinimo(reference, linea.cantidadSolicitada);
    if (!validacion.ok && validacion.mensaje) {
      avisos.push(validacion.mensaje);
    }

    palets.push(...generarPaletsDeLinea(reference, validacion.cantidadAjustada));
  }

  return { palets, avisos };
}
