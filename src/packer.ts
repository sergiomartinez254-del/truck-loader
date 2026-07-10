import type {
  PalletInstance,
  PlacedPallet,
  Reference,
  TruckLoadPlan,
  TruckProfile,
} from "./types";

/** Una pila vertical de uno o más palets de la MISMA referencia */
interface PilaUnidad {
  referenceId: string;
  pallets: PalletInstance[];
  anchoMm: number;
  largoMm: number;
  alturaTotalMm: number;
  pesoTotalKg: number;
}

interface Orientacion {
  anchoOcupado: number;
  largoOcupado: number;
}

/**
 * Decide si el rectángulo (ancho x largo) cabe en el suelo del camión y, si
 * caben las dos orientaciones Y el bulto se puede rotar, elige la que
 * permite más unidades por fila (menos hueco lateral desperdiciado).
 *
 * Si `rotable` es false, se respeta SIEMPRE la orientación tal cual viene
 * (largoMm/anchoMm nativos) — no se prueba la girada 90°, aunque encajara
 * mejor. Tal cual queda su posición por defecto, sin más lógica: el propio
 * largoMm/anchoMm exportado ya refleja la orientación correcta (viene del
 * dbOrient con el que se construyó en el constructor).
 */
function elegirOrientacion(
  anchoPalet: number,
  largoPalet: number,
  truckProfile: TruckProfile,
  rotable = true
): Orientacion | null {
  const opciones: Orientacion[] = rotable
    ? [
        { anchoOcupado: anchoPalet, largoOcupado: largoPalet },
        { anchoOcupado: largoPalet, largoOcupado: anchoPalet },
      ]
    : [{ anchoOcupado: anchoPalet, largoOcupado: largoPalet }];

  const validas = opciones.filter(
    (o) =>
      o.anchoOcupado <= truckProfile.anchoInteriorMm &&
      o.largoOcupado <= truckProfile.largoInteriorMm
  );

  if (validas.length === 0) return null;
  if (validas.length === 1) return validas[0];

  const filasPorAncho = (o: Orientacion) =>
    Math.floor(truckProfile.anchoInteriorMm / o.anchoOcupado);

  const filas0 = filasPorAncho(validas[0]);
  const filas1 = filasPorAncho(validas[1]);
  if (filas0 !== filas1) return filas0 > filas1 ? validas[0] : validas[1];

  return validas[0].largoOcupado <= validas[1].largoOcupado ? validas[0] : validas[1];
}

/**
 * Agrupa los palets de UNA referencia en pilas verticales respetando:
 *  - si la referencia admite apilado o no
 *  - la altura interior del camión
 *  - el peso máximo que soporta el propio palet (palletType.pesoMaxKg)
 *
 * La orientación (`orientacion`) se decide UNA SOLA VEZ para toda la
 * referencia (ver `elegirOrientacion`) y se aplica por igual a todas sus
 * pilas: en la práctica, todos los palets de una misma referencia se
 * cargan girados de la misma forma, nunca mezclados.
 */
function agruparEnPilas(
  palets: PalletInstance[],
  reference: Reference,
  truckProfile: TruckProfile,
  orientacion: Orientacion
): PilaUnidad[] {
  const pilas: PilaUnidad[] = [];

  const empaquetarComoUnidad = (lista: PalletInstance[]): PilaUnidad => ({
    referenceId: reference.id,
    pallets: lista,
    anchoMm: orientacion.anchoOcupado,
    largoMm: orientacion.largoOcupado,
    alturaTotalMm: lista.reduce((s, p) => s + p.alturaMm, 0),
    pesoTotalKg: lista.reduce((s, p) => s + p.pesoKg, 0),
  });

  if (!reference.apilable) {
    return palets.map((p) => empaquetarComoUnidad([p]));
  }

  let pilaActual: PalletInstance[] = [];
  let alturaActual = 0;
  let pesoActual = 0;

  for (const palet of palets) {
    const alturaSiSeAñade = alturaActual + palet.alturaMm;
    const pesoSiSeAñade = pesoActual + palet.pesoKg;
    const esPrimero = pilaActual.length === 0;

    const cabe = esPrimero
      ? alturaSiSeAñade <= truckProfile.altoInteriorMm
      : alturaSiSeAñade <= truckProfile.altoInteriorMm &&
        pesoSiSeAñade <= reference.palletType.pesoMaxKg;

    if (cabe) {
      pilaActual.push(palet);
      alturaActual = alturaSiSeAñade;
      pesoActual = pesoSiSeAñade;
    } else {
      if (pilaActual.length > 0) pilas.push(empaquetarComoUnidad(pilaActual));
      pilaActual = [palet];
      alturaActual = palet.alturaMm;
      pesoActual = palet.pesoKg;
    }
  }
  if (pilaActual.length > 0) pilas.push(empaquetarComoUnidad(pilaActual));

  return pilas;
}

/** Un hueco libre rectangular en el suelo del camión */
interface RectanguloLibre {
  x: number; // posición a lo ancho del camión
  y: number; // posición a lo largo del camión
  ancho: number; // extensión en el eje ancho
  largo: number; // extensión en el eje largo
}

interface ColocacionEncontrada {
  rect: RectanguloLibre;
  anchoOcupado: number;
  largoOcupado: number;
}

/**
 * Busca, entre todos los huecos libres actuales, el mejor sitio para una
 * pieza de anchoItem x largoItem (orientación ya fija, decidida una vez
 * por referencia en `agruparEnPilas`). Usa la heurística "Best Short Side
 * Fit": gana el hueco que deja el lado sobrante más corto más pequeño.
 */
function buscarMejorHueco(
  anchoItem: number,
  largoItem: number,
  libres: RectanguloLibre[]
): ColocacionEncontrada | null {
  let mejor: ColocacionEncontrada | null = null;
  let mejorLadoCorto = Infinity;
  let mejorLadoLargo = Infinity;

  for (const rect of libres) {
    if (anchoItem > rect.ancho || largoItem > rect.largo) continue;

    const sobranteAncho = rect.ancho - anchoItem;
    const sobranteLargo = rect.largo - largoItem;
    const ladoCorto = Math.min(sobranteAncho, sobranteLargo);
    const ladoLargo = Math.max(sobranteAncho, sobranteLargo);

    if (ladoCorto < mejorLadoCorto || (ladoCorto === mejorLadoCorto && ladoLargo < mejorLadoLargo)) {
      mejorLadoCorto = ladoCorto;
      mejorLadoLargo = ladoLargo;
      mejor = { rect, anchoOcupado: anchoItem, largoOcupado: largoItem };
    }
  }

  return mejor;
}

/** Resta `ocupado` de `libre`, devolviendo los trozos sobrantes (0 a 4 rectángulos, posiblemente solapados entre sí: es lo esperado en el algoritmo de rectángulos máximos). */
function dividirRectangulo(
  libre: RectanguloLibre,
  ocupado: { x: number; y: number; ancho: number; largo: number }
): RectanguloLibre[] {
  const seSolapan =
    ocupado.x < libre.x + libre.ancho &&
    ocupado.x + ocupado.ancho > libre.x &&
    ocupado.y < libre.y + libre.largo &&
    ocupado.y + ocupado.largo > libre.y;

  if (!seSolapan) return [libre];

  const resultado: RectanguloLibre[] = [];

  if (ocupado.x > libre.x) {
    resultado.push({ x: libre.x, y: libre.y, ancho: ocupado.x - libre.x, largo: libre.largo });
  }
  if (ocupado.x + ocupado.ancho < libre.x + libre.ancho) {
    resultado.push({
      x: ocupado.x + ocupado.ancho,
      y: libre.y,
      ancho: libre.x + libre.ancho - (ocupado.x + ocupado.ancho),
      largo: libre.largo,
    });
  }
  if (ocupado.y > libre.y) {
    resultado.push({ x: libre.x, y: libre.y, ancho: libre.ancho, largo: ocupado.y - libre.y });
  }
  if (ocupado.y + ocupado.largo < libre.y + libre.largo) {
    resultado.push({
      x: libre.x,
      y: ocupado.y + ocupado.largo,
      ancho: libre.ancho,
      largo: libre.y + libre.largo - (ocupado.y + ocupado.largo),
    });
  }

  return resultado;
}

function estaContenido(a: RectanguloLibre, b: RectanguloLibre): boolean {
  return a.x >= b.x && a.y >= b.y && a.x + a.ancho <= b.x + b.ancho && a.y + a.largo <= b.y + b.largo;
}

/** Quita duplicados exactos y huecos que ya están completamente dentro de otro (serían redundantes). */
function podarRedundantes(rects: RectanguloLibre[]): RectanguloLibre[] {
  const unicos: RectanguloLibre[] = [];
  for (const r of rects) {
    const yaExiste = unicos.some((u) => u.x === r.x && u.y === r.y && u.ancho === r.ancho && u.largo === r.largo);
    if (!yaExiste) unicos.push(r);
  }
  return unicos.filter((r, i) => !unicos.some((otro, j) => j !== i && estaContenido(r, otro)));
}

/** Por encima de este número de pilas pendientes, el backtracking se omite (sería demasiado lento). */
const LIMITE_PILAS_BACKTRACKING = 12;
/** Tope de combinaciones hueco+orientación probadas por intento de backtracking. */
const LIMITE_INTENTOS_BACKTRACKING = 20000;

/**
 * Último recurso cuando el greedy (MaxRects con la mejor opción en cada
 * paso) ha dejado pilas sin sitio: intenta colocarlas TODAS mediante
 * backtracking real, probando en cada paso TODAS las combinaciones válidas
 * de hueco+orientación (no solo la mejor) y deshaciendo si un paso
 * posterior no tiene solución. Acotado por número de intentos para no
 * bloquear nunca el cálculo. Devuelve `null` si no logra colocarlas todas
 * dentro del límite (en ese caso no se cambia nada).
 *
 * Nota sobre orientación: el resto del camión respeta la orientación fija
 * por referencia (ver `agruparEnPilas`), pero aquí, en el rescate de las
 * pocas pilas sueltas que no han encontrado sitio por la vía normal, SÍ se
 * prueba también la pila girada 90º. Es el mismo gesto que haría una
 * persona cargando a mano: el grueso de una referencia va siempre igual,
 * pero la última pieza suelta que no encaja se gira para aprovechar el
 * hueco que quede.
 */
function intentarBacktracking(
  pendientes: PilaUnidad[],
  libresIniciales: RectanguloLibre[]
): {
  colocaciones: Array<{ pila: PilaUnidad; x: number; y: number; anchoOcupado: number; largoOcupado: number }>;
  libresFinal: RectanguloLibre[];
} | null {
  let intentos = 0;
  const colocaciones: Array<{ pila: PilaUnidad; x: number; y: number; anchoOcupado: number; largoOcupado: number }> = [];

  function recursivo(indice: number, libres: RectanguloLibre[]): RectanguloLibre[] | null {
    if (indice >= pendientes.length) return libres;

    const pila = pendientes[indice];
    const candidatos: Array<{ rect: RectanguloLibre; anchoOcupado: number; largoOcupado: number }> = [];

    for (const rect of libres) {
      const orientaciones =
        pila.anchoMm === pila.largoMm
          ? [{ ancho: pila.anchoMm, largo: pila.largoMm }] // cuadrada: girarla no cambia nada
          : [
              { ancho: pila.anchoMm, largo: pila.largoMm },
              { ancho: pila.largoMm, largo: pila.anchoMm },
            ];
      for (const o of orientaciones) {
        if (o.ancho <= rect.ancho && o.largo <= rect.largo) {
          candidatos.push({ rect, anchoOcupado: o.ancho, largoOcupado: o.largo });
        }
      }
    }

    // Probar antes los candidatos que dejan menos hueco sobrante: encuentra
    // antes una solución válida y reduce el número de retrocesos.
    candidatos.sort((a, b) => {
      const sobranteA = a.rect.ancho * a.rect.largo - a.anchoOcupado * a.largoOcupado;
      const sobranteB = b.rect.ancho * b.rect.largo - b.anchoOcupado * b.largoOcupado;
      return sobranteA - sobranteB;
    });

    for (const cand of candidatos) {
      intentos++;
      if (intentos > LIMITE_INTENTOS_BACKTRACKING) return null;

      const x = cand.rect.x;
      const y = cand.rect.y;
      const ocupado = { x, y, ancho: cand.anchoOcupado, largo: cand.largoOcupado };

      const nuevosLibres: RectanguloLibre[] = [];
      for (const libre of libres) nuevosLibres.push(...dividirRectangulo(libre, ocupado));
      const libresSiguientes = podarRedundantes(nuevosLibres);

      colocaciones.push({ pila, x, y, anchoOcupado: cand.anchoOcupado, largoOcupado: cand.largoOcupado });

      const resultado = recursivo(indice + 1, libresSiguientes);
      if (resultado) return resultado;

      colocaciones.pop(); // no funcionó: deshacer y probar el siguiente candidato
    }

    return null;
  }

  const libresFinal = recursivo(0, libresIniciales);
  if (!libresFinal) return null;
  return { colocaciones, libresFinal };
}

/** Posición fijada manualmente que el algoritmo debe respetar como suelo ocupado. */
export interface ObstaculoPlanta {
  x: number;       // eje ancho (mm)
  y: number;       // eje largo (mm)
  anchoMm: number;
  largoMm: number;
}

/**
 * Empaqueta tantas pilas como quepan en UN camión con el algoritmo de
 * rectángulos máximos (MaxRects, heurística Best Short Side Fit).
 * Si se pasan `obstaculos`, esas posiciones se consumen del espacio libre
 * ANTES de empezar la colocación automática, de modo que el algoritmo
 * coloca los palets nuevos a su alrededor sin pisarlos.
 */
function empacarUnCamion(
  pilas: PilaUnidad[],
  truckProfile: TruckProfile,
  numero: number,
  obstaculos: ObstaculoPlanta[] = []
): { plan: TruckLoadPlan; pendientes: PilaUnidad[] } {
  const colocados: PlacedPallet[] = [];
  const pendientes: PilaUnidad[] = [];
  let libres: RectanguloLibre[] = [
    { x: 0, y: 0, ancho: truckProfile.anchoInteriorMm, largo: truckProfile.largoInteriorMm },
  ];
  let pesoAcumulado = 0;

  // Consumir posiciones bloqueadas del espacio libre antes de cualquier colocación nueva
  for (const obs of obstaculos) {
    const ocu = { x: obs.x, y: obs.y, ancho: obs.anchoMm, largo: obs.largoMm };
    const nuevos: RectanguloLibre[] = [];
    for (const libre of libres) nuevos.push(...dividirRectangulo(libre, ocu));
    libres = podarRedundantes(nuevos);
  }

  for (const pila of pilas) {
    if (pesoAcumulado + pila.pesoTotalKg > truckProfile.pesoMaxKg) {
      pendientes.push(pila);
      continue;
    }

    const colocacion = buscarMejorHueco(pila.anchoMm, pila.largoMm, libres);
    if (!colocacion) {
      pendientes.push(pila);
      continue;
    }

    const { rect, anchoOcupado, largoOcupado } = colocacion;
    const x = rect.x;
    const y = rect.y;
    const ocupado = { x, y, ancho: anchoOcupado, largo: largoOcupado };

    const nuevosLibres: RectanguloLibre[] = [];
    for (const libre of libres) {
      nuevosLibres.push(...dividirRectangulo(libre, ocupado));
    }
    libres = podarRedundantes(nuevosLibres);

    pesoAcumulado += pila.pesoTotalKg;

    let z = 0;
    pila.pallets.forEach((palet, nivel) => {
      colocados.push({
        ...palet,
        x,
        y,
        z,
        nivel,
        largoOcupadoMm: largoOcupado,
        anchoOcupadoMm: anchoOcupado,
      });
      z += palet.alturaMm;
    });
  }

  // Último recurso: si quedan pocas pilas sin sitio, intentar encajarlas a
  // la fuerza (backtracking) en lo que sobra del suelo antes de rendirse.
  if (pendientes.length > 0 && pendientes.length <= LIMITE_PILAS_BACKTRACKING) {
    const pesoDisponible = truckProfile.pesoMaxKg - pesoAcumulado;
    const pesoPendientesTotal = pendientes.reduce((s, p) => s + p.pesoTotalKg, 0);

    if (pesoPendientesTotal <= pesoDisponible) {
      const rescate = intentarBacktracking(pendientes, libres);
      if (rescate) {
        for (const colocacion of rescate.colocaciones) {
          let z = 0;
          colocacion.pila.pallets.forEach((palet, nivel) => {
            colocados.push({
              ...palet,
              x: colocacion.x,
              y: colocacion.y,
              z,
              nivel,
              largoOcupadoMm: colocacion.largoOcupado,
              anchoOcupadoMm: colocacion.anchoOcupado,
            });
            z += palet.alturaMm;
          });
        }
        pesoAcumulado += pesoPendientesTotal;
        libres = rescate.libresFinal;
        pendientes.length = 0;
      }
    }
  }

  const plan = recalcularMetricasCamion(truckProfile, numero, colocados, pesoAcumulado);

  return { plan, pendientes };
}

/** Calcula las métricas (suelo, volumen, peso) de un camión a partir de sus palets ya colocados. */
function recalcularMetricasCamion(
  truckProfile: TruckProfile,
  numero: number,
  colocados: PlacedPallet[],
  pesoAcumulado?: number
): TruckLoadPlan {
  const peso = pesoAcumulado ?? colocados.reduce((s, p) => s + p.pesoKg, 0);

  const volumenTotalM3 =
    (truckProfile.largoInteriorMm / 1000) *
    (truckProfile.anchoInteriorMm / 1000) *
    (truckProfile.altoInteriorMm / 1000);

  const volumenUtilizadoM3 = colocados.reduce(
    (acc, p) =>
      acc + (p.largoOcupadoMm / 1000) * (p.anchoOcupadoMm / 1000) * (p.alturaMm / 1000),
    0
  );

  const sueloTotalM2 = (truckProfile.largoInteriorMm / 1000) * (truckProfile.anchoInteriorMm / 1000);
  const sueloUsadoM2 = colocados
    .filter((p) => p.nivel === 0)
    .reduce((acc, p) => acc + (p.largoOcupadoMm / 1000) * (p.anchoOcupadoMm / 1000), 0);

  return {
    numero,
    truckProfile,
    pallets: colocados,
    pesoTotalKg: peso,
    volumenUtilizadoM3: Math.round(volumenUtilizadoM3 * 1000) / 1000,
    volumenTotalM3: Math.round(volumenTotalM3 * 1000) / 1000,
    ocupacionVolumen: Math.round((volumenUtilizadoM3 / volumenTotalM3) * 1000) / 10,
    ocupacionPeso: Math.round((peso / truckProfile.pesoMaxKg) * 1000) / 10,
    ocupacionSuelo: Math.round((sueloUsadoM2 / sueloTotalM2) * 1000) / 10,
    posicionesSueloUsadas: colocados.filter((p) => p.nivel === 0).length,
  };
}

/**
 * Reconstruye la lista de huecos libres del suelo de un camión a partir de
 * sus palets ya colocados. Acepta también `obstaculos` (posiciones fijadas
 * manualmente) para que el desalojo nunca intente colocar palets sobre ellos.
 */
function reconstruirLibres(
  truckProfile: TruckProfile,
  colocados: PlacedPallet[],
  obstaculos: ObstaculoPlanta[] = []
): RectanguloLibre[] {
  let libres: RectanguloLibre[] = [
    { x: 0, y: 0, ancho: truckProfile.anchoInteriorMm, largo: truckProfile.largoInteriorMm },
  ];

  for (const p of colocados) {
    if (p.nivel !== 0) continue;
    const ocupado = { x: p.x, y: p.y, ancho: p.anchoOcupadoMm, largo: p.largoOcupadoMm };
    const nuevos: RectanguloLibre[] = [];
    for (const libre of libres) nuevos.push(...dividirRectangulo(libre, ocupado));
    libres = podarRedundantes(nuevos);
  }

  // También restar posiciones fijadas manualmente para que el desalojo no las ocupe
  for (const obs of obstaculos) {
    const ocu = { x: obs.x, y: obs.y, ancho: obs.anchoMm, largo: obs.largoMm };
    const nuevos: RectanguloLibre[] = [];
    for (const libre of libres) nuevos.push(...dividirRectangulo(libre, ocu));
    libres = podarRedundantes(nuevos);
  }

  return libres;
}

/** Por encima de este número de pilas sin sitio, no se intenta el rescate por desalojo (sería demasiado lento). */
const LIMITE_PILAS_RESCATE_DESALOJO = 6;
/** Cuántas pilas ya colocadas se prueba desalojar como máximo, por camión, antes de rendirse. */
const LIMITE_CANDIDATOS_DESALOJO = 25;

/**
 * Último recurso cuando, tras el empaquetado normal (MaxRects + varios
 * órdenes + backtracking), quedan pocas pilas sin sitio: prueba a
 * "desalojar" UNA pila ya colocada (moverla a otro hueco) para ver si así
 * cabe también la que faltaba. Es exactamente lo que haría una persona
 * mirando el plano: girar o mover un palet que ya está puesto para hacerle
 * hueco a otro. Se prueba con las pilas de mayor huella primero (las que
 * más probablemente liberen un hueco útil) y se para en cuanto una
 * combinación funciona. Devuelve `null` si ninguna ayuda.
 */
function intentarRescatePorDesalojo(
  camiones: TruckLoadPlan[],
  restantes: PilaUnidad[],
  truckProfile: TruckProfile,
  obstaculos: ObstaculoPlanta[] = []
): { camiones: TruckLoadPlan[]; restantes: PilaUnidad[] } | null {
  if (restantes.length === 0 || restantes.length > LIMITE_PILAS_RESCATE_DESALOJO) return null;

  for (let idxCamion = 0; idxCamion < camiones.length; idxCamion++) {
    const camion = camiones[idxCamion];

    // Agrupar los palets colocados por posición (x,y): cada grupo es una pila física completa.
    const grupos = new Map<string, PlacedPallet[]>();
    for (const p of camion.pallets) {
      const key = `${p.x}-${p.y}`;
      const lista = grupos.get(key) ?? [];
      lista.push(p);
      grupos.set(key, lista);
    }

    const candidatos = Array.from(grupos.values())
      .sort((a, b) => b[0].anchoOcupadoMm * b[0].largoOcupadoMm - a[0].anchoOcupadoMm * a[0].largoOcupadoMm)
      .slice(0, LIMITE_CANDIDATOS_DESALOJO);

    for (const paletsDeLaPila of candidatos) {
      const base = paletsDeLaPila[0];

      const pilaDesalojada: PilaUnidad = {
        referenceId: base.referenceId,
        pallets: paletsDeLaPila,
        anchoMm: base.anchoOcupadoMm,
        largoMm: base.largoOcupadoMm,
        alturaTotalMm: paletsDeLaPila.reduce((s, p) => s + p.alturaMm, 0),
        pesoTotalKg: paletsDeLaPila.reduce((s, p) => s + p.pesoKg, 0),
      };

      const restoDelCamion = camion.pallets.filter((p) => p.x !== base.x || p.y !== base.y);
      const pesoDisponible = truckProfile.pesoMaxKg - (camion.pesoTotalKg - pilaDesalojada.pesoTotalKg);
      const aIntentar = [...restantes, pilaDesalojada];
      const pesoNecesario = aIntentar.reduce((s, p) => s + p.pesoTotalKg, 0);
      if (pesoNecesario > pesoDisponible) continue;

      const libresSinEsaPila = reconstruirLibres(truckProfile, restoDelCamion, obstaculos);
      const resultado = intentarBacktracking(aIntentar, libresSinEsaPila);
      if (!resultado) continue;

      // Éxito: la pila desalojada y la(s) que faltaban caben juntas en otro sitio.
      const nuevosColocados: PlacedPallet[] = restoDelCamion.slice();
      for (const colocacion of resultado.colocaciones) {
        let z = 0;
        colocacion.pila.pallets.forEach((palet, nivel) => {
          nuevosColocados.push({
            ...palet,
            x: colocacion.x,
            y: colocacion.y,
            z,
            nivel,
            largoOcupadoMm: colocacion.largoOcupado,
            anchoOcupadoMm: colocacion.anchoOcupado,
          });
          z += palet.alturaMm;
        });
      }

      const nuevosCamiones = camiones.slice();
      nuevosCamiones[idxCamion] = recalcularMetricasCamion(truckProfile, camion.numero, nuevosColocados);

      return { camiones: nuevosCamiones, restantes: [] };
    }
  }

  return null;
}

/** Reparte una lista YA ORDENADA de pilas en uno o varios camiones, abriendo uno nuevo cuando hace falta. */
function empacarVariosCamiones(
  pilasOrdenadas: PilaUnidad[],
  truckProfile: TruckProfile,
  maxCamiones: number,
  obstaculos: ObstaculoPlanta[] = []
): { camiones: TruckLoadPlan[]; restantes: PilaUnidad[]; imposibles: boolean } {
  const camiones: TruckLoadPlan[] = [];
  let restantes = pilasOrdenadas;
  let numero = 1;
  let imposibles = false;

  while (restantes.length > 0 && numero <= maxCamiones) {
    // Los obstáculos (posiciones bloqueadas manualmente) solo aplican al primer camión
    const obs = numero === 1 ? obstaculos : [];
    const { plan, pendientes } = empacarUnCamion(restantes, truckProfile, numero, obs);
    if (plan.pallets.length > 0) {
      camiones.push(plan);
    }
    if (pendientes.length === restantes.length) {
      imposibles = true;
      break;
    }
    restantes = pendientes;
    numero += 1;
  }

  return { camiones, restantes, imposibles };
}

/**
 * Genera varios órdenes de entrada distintos para las mismas pilas. El
 * orden de inserción afecta al resultado de cualquier heurístico de
 * packing (incluido MaxRects), así que probamos varios y nos quedamos con
 * el mejor en vez de confiar en uno solo fijo.
 */
function generarOrdenes(pilas: PilaUnidad[]): PilaUnidad[][] {
  return [
    [...pilas].sort((a, b) => b.anchoMm * b.largoMm - a.anchoMm * a.largoMm), // huella mayor primero
    [...pilas].sort((a, b) => Math.max(b.anchoMm, b.largoMm) - Math.max(a.anchoMm, a.largoMm)), // lado mayor primero
    [...pilas].sort((a, b) => b.anchoMm + b.largoMm - (a.anchoMm + a.largoMm)), // perímetro mayor primero
    [...pilas].sort((a, b) => a.anchoMm * a.largoMm - b.anchoMm * b.largoMm), // huella menor primero
    [...pilas].sort((a, b) => b.alturaTotalMm - a.alturaTotalMm), // más alta primero
  ];
}

/** Unidades totales que han quedado sin sitio en un resultado de empaquetado. */
function unidadesPendientesDe(restantes: PilaUnidad[]): number {
  return restantes.reduce((s, p) => s + p.pallets.reduce((s2, pp) => s2 + pp.unidades, 0), 0);
}

/**
 * Compara dos resultados de empaquetado y dice cuál es mejor:
 * 1) el que deja menos unidades sin sitio,
 * 2) a igualdad, el que usa menos camiones,
 * 3) a igualdad, el que deja mayor ocupación media de suelo (más compacto).
 * Devuelve negativo si `a` es mejor que `b`.
 */
function compararResultados(
  a: { camiones: TruckLoadPlan[]; restantes: PilaUnidad[]; imposibles: boolean },
  b: { camiones: TruckLoadPlan[]; restantes: PilaUnidad[]; imposibles: boolean }
): number {
  const pendientesA = unidadesPendientesDe(a.restantes);
  const pendientesB = unidadesPendientesDe(b.restantes);
  if (pendientesA !== pendientesB) return pendientesA - pendientesB;

  if (a.camiones.length !== b.camiones.length) return a.camiones.length - b.camiones.length;

  const ocupacionMedia = (camiones: TruckLoadPlan[]) =>
    camiones.length ? camiones.reduce((s, c) => s + c.ocupacionSuelo, 0) / camiones.length : 0;

  return ocupacionMedia(b.camiones) - ocupacionMedia(a.camiones);
}

export interface ResultadoEmpaquetado {
  camiones: TruckLoadPlan[];
  noAsignados: { referenceId: string; unidadesPendientes: number; motivo: string }[];
  avisos: string[];
}

/**
 * Punto de entrada del algoritmo: recibe TODOS los palets ya generados a
 * partir del pedido (ver lotCalculator.ts) y los reparte en uno o varios
 * camiones del perfil indicado.
 */
export function empacarPedido(
  palets: PalletInstance[],
  referencias: Map<string, Reference>,
  truckProfile: TruckProfile,
  maxCamiones = 1,
  obstaculos: ObstaculoPlanta[] = []
): ResultadoEmpaquetado {
  const avisos: string[] = [];
  const noAsignados: ResultadoEmpaquetado["noAsignados"] = [];

  const paletsPorReferencia = new Map<string, PalletInstance[]>();
  for (const p of palets) {
    const lista = paletsPorReferencia.get(p.referenceId) ?? [];
    lista.push(p);
    paletsPorReferencia.set(p.referenceId, lista);
  }

  let pilas: PilaUnidad[] = [];

  for (const [refId, listaPalets] of paletsPorReferencia) {
    const reference = referencias.get(refId);
    if (!reference) continue;

    const orientacionPosible = elegirOrientacion(
      reference.palletType.anchoMm,
      reference.palletType.largoMm,
      truckProfile,
      truckProfile.cargaLateral ? true : reference.rotable
    );

    if (!orientacionPosible) {
      noAsignados.push({
        referenceId: refId,
        unidadesPendientes: listaPalets.reduce((s, p) => s + p.unidades, 0),
        motivo: `El palet de ${reference.sku} (${reference.palletType.largoMm}x${reference.palletType.anchoMm} mm) no cabe en ningún sentido en el camión "${truckProfile.nombre}" (${truckProfile.largoInteriorMm}x${truckProfile.anchoInteriorMm} mm).`,
      });
      continue;
    }

    if (reference.alturaPaletCompletoMm > truckProfile.altoInteriorMm) {
      noAsignados.push({
        referenceId: refId,
        unidadesPendientes: listaPalets.reduce((s, p) => s + p.unidades, 0),
        motivo: `El palet completo de ${reference.sku} mide ${reference.alturaPaletCompletoMm} mm de alto y supera el interior del camión (${truckProfile.altoInteriorMm} mm).`,
      });
      continue;
    }

    pilas.push(...agruparEnPilas(listaPalets, reference, truckProfile, orientacionPosible));
  }

  // Probamos varios órdenes de entrada (huella, lado mayor, perímetro...) y
  // nos quedamos con el que mejor resultado dé, en vez de confiar en un
  // único orden fijo: el orden de inserción afecta al resultado de MaxRects.
  let mejorResultado: { camiones: TruckLoadPlan[]; restantes: PilaUnidad[]; imposibles: boolean } = {
    camiones: [],
    restantes: pilas,
    imposibles: false,
  };

  if (pilas.length > 0) {
    let primero = true;
    for (const orden of generarOrdenes(pilas)) {
      const resultado = empacarVariosCamiones(orden, truckProfile, maxCamiones, obstaculos);
      if (primero || compararResultados(resultado, mejorResultado) < 0) {
        mejorResultado = resultado;
        primero = false;
      }
    }
  }

  let { camiones, restantes, imposibles } = mejorResultado;

  // Último recurso: si queda poco sin sitio (y no es un caso "imposible" por
  // medidas/peso propio), probar a desalojar una pila ya colocada para
  // hacerle hueco a la que falta, antes de darla por no asignada.
  if (restantes.length > 0 && !imposibles) {
    const rescate = intentarRescatePorDesalojo(camiones, restantes, truckProfile, obstaculos);
    if (rescate) {
      camiones = rescate.camiones;
      restantes = rescate.restantes;
    }
  }

  if (restantes.length > 0) {
    if (imposibles) {
      // Alguna pila no cabe en ningún camión disponible incluso en vacío:
      // su propio peso o medidas superan al camión, no es un problema de
      // límite de camiones.
      for (const pila of restantes) {
        noAsignados.push({
          referenceId: pila.referenceId,
          unidadesPendientes: pila.pallets.reduce((s, p) => s + p.unidades, 0),
          motivo:
            "La pila no cabe en ningún camión disponible incluso en vacío (revisa el peso máximo del camión o el peso/medidas de la referencia).",
        });
      }
    } else {
      const pendientesPorReferencia = new Map<string, number>();
      for (const pila of restantes) {
        const unidades = pila.pallets.reduce((s, p) => s + p.unidades, 0);
        pendientesPorReferencia.set(
          pila.referenceId,
          (pendientesPorReferencia.get(pila.referenceId) ?? 0) + unidades
        );
      }

      for (const [refId, unidadesPendientes] of pendientesPorReferencia) {
        const sku = referencias.get(refId)?.sku ?? refId;
        noAsignados.push({
          referenceId: refId,
          unidadesPendientes,
          motivo:
            maxCamiones === 1
              ? `El camión ya está completo: quedan ${unidadesPendientes} unidades de ${sku} sin sitio. Activa "permitir varios camiones" si quieres repartir el pedido en más de uno.`
              : `Se alcanzó el límite de ${maxCamiones} camiones permitidos en esta planificación: quedan ${unidadesPendientes} unidades de ${sku} sin sitio.`,
        });
      }

      const unidadesSinAsignar = Array.from(pendientesPorReferencia.values()).reduce((s, n) => s + n, 0);

      avisos.push(
        maxCamiones === 1
          ? `El camión se ha llenado y no caben ${unidadesSinAsignar} unidades más del pedido. El modo "varios camiones" está desactivado.`
          : `Se alcanzó el máximo de ${maxCamiones} camiones permitidos en una misma planificación; quedan ${unidadesSinAsignar} unidades sin asignar.`
      );
    }
  }

  return { camiones, noAsignados, avisos };
}