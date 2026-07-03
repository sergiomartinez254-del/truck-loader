# Módulo de carga de camiones

Proyecto Vite + TypeScript con un módulo completo (modelo de datos + algoritmo
de empaquetado + API de funciones) para automatizar cómo se reparte un
pedido en palets y cómo esos palets se distribuyen dentro de uno o varios
camiones.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # demo interactiva en el navegador
npm run build    # build de producción a /dist
```

La demo (`src/main.ts`) trae un catálogo de ejemplo con 4 referencias
(algunas apilables, otras no) y un formulario para cambiar cantidades y las
medidas del camión, y dibuja el plano cenital ("blueprint") de cada camión
resultante.

## Estructura

```
src/
  types.ts          Modelo de datos: Reference, PalletType, TruckProfile,
                     OrderLine, PalletInstance, PlacedPallet, TruckLoadPlan...
  lotCalculator.ts   Valida el lote mínimo de cada línea de pedido y la
                     convierte en palets (completos + uno parcial si sobran
                     unidades).
  packer.ts          El algoritmo: agrupa los palets de cada referencia en
                     pilas verticales (si son apilables), las distribuye en
                     el suelo del camión por filas, y abre camiones nuevos
                     cuando hace falta.
  api.ts             Funciones públicas de alto nivel: planificarCargaCamion(),
                     crearTruckProfile(), catálogo de tipos de palet estándar
                     (PALLET_TYPES) y un perfil de camión por defecto.
  main.ts            Demo de UI (no forma parte del "módulo" en sí).
```

## Visor 3D

`src/scene3d.ts` añade un render Three.js real del camión: dibuja la caja del
camión como wireframe y, dentro, **cada unidad individual** de cada palet
como un bloque independiente (con un pequeño hueco entre unidades para
distinguirlas), apiladas a la altura real calculada como
`alturaPaletCompletoMm / unidadesPorPalet`. Tiene controles de órbita
(arrastrar para rotar, rueda para zoom) y pestañas para cambiar de camión
cuando el pedido necesita varios. Solo se mantiene una escena WebGL activa a
la vez (se destruye correctamente al cambiar de pestaña o replanificar) para
no agotar los contextos WebGL del navegador.

La demo (`src/main.ts`) incluye un catálogo de 5 referencias reales con sus
medidas de palet, lote mínimo y unidades por palet. **Importante**: no se
facilitó peso por unidad ni si cada referencia admite apilado, así que esos
campos llevan valores de relleno claramente marcados con `⚠️` en el propio
código — sustitúyelos por los datos reales en cuanto los tengas. También se
asumió que las medidas estaban en centímetros (no milímetros): si tus datos
reales vienen en otra unidad, ajusta el factor de conversión al construir el
catálogo.

## Cómo funciona el algoritmo, paso a paso

1. **Lote mínimo** (`lotCalculator.ts`): es un suelo, no un múltiplo. Si una
   línea de pedido pide menos que el `loteMinimo` de la referencia, se ajusta
   hasta ese mínimo y se genera un aviso. Una vez alcanzado o superado el
   mínimo, la cantidad puede crecer palet a palet con total libertad (p. ej.
   lote mínimo 60 + 1 palet de 6 unidades = 66 es válido, no hace falta que
   sea múltiplo de 60). Si tu negocio sí exige múltiplos exactos del lote
   mínimo, es un cambio de una línea en `validarLoteMinimo`.
2. **Generación de palets**: la cantidad ya validada se divide en palets
   completos (`unidadesPorPalet`) más, si sobra, un palet parcial. La altura
   del palet parcial se aproxima de forma proporcional; si tienes la altura
   real por unidad de producto, sustituye `crearPalet()` por un cálculo
   exacto.
3. **Formación de pilas** (`packer.ts` → `agruparEnPilas`): los palets de una
   misma referencia se apilan verticalmente solo si `reference.apilable` es
   `true`, respetando la altura interior del camión y el peso máximo que
   soporta el propio palet (`palletType.pesoMaxKg`). Las referencias no
   apilables generan siempre pilas de un único palet. **No se mezclan
   referencias distintas en una misma pila** (es la práctica habitual en
   logística, evita errores de picking).
4. **Empaquetado en planta** (`empacarUnCamion`): algoritmo de **rectángulos
   máximos (MaxRects, heurística Best Short Side Fit)**. Mantiene la lista
   real de huecos libres del suelo del camión; para cada pila prueba **las
   dos orientaciones en todos los huecos disponibles** (no una orientación
   fija decidida de antemano por referencia) y elige la combinación
   hueco+orientación que deja menos espacio desperdiciado. Al colocar una
   pila, el hueco que ocupaba se divide en los rectángulos libres
   sobrantes, que quedan disponibles para cualquier pila posterior
   (incluida una de otra referencia).

   Sobre esa base hay dos capas adicionales:
   - **Varios órdenes de entrada** (`generarOrdenes`): el resultado de
     MaxRects depende del orden en que se insertan las pilas, así que se
     prueban 5 criterios distintos (huella, lado mayor, perímetro, huella
     ascendente, altura) con `empacarVariosCamiones` y se elige el mejor
     según `compararResultados` (menos unidades sin sitio → menos camiones
     → mayor ocupación media).
   - **Backtracking acotado** (`intentarBacktracking`): si tras el greedy
     quedan pocas pilas sin sitio (≤12), se intenta colocarlas igualmente
     probando TODAS las combinaciones válidas de hueco+orientación en cada
     paso (no solo la mejor) y deshaciendo si un paso posterior falla,
     acotado a 20.000 intentos para no bloquear nunca el cálculo.

   **Importante**: la orientación (normal o girada 90º) se decide UNA SOLA
   VEZ por referencia, no palet a palet. En una versión anterior cada palet
   podía rotarse de forma independiente para aprovechar mejor el hueco
   disponible, lo que en teoría sube algo la ocupación de suelo pero en la
   práctica es inviable: nadie carga la misma referencia mezclando
   orientaciones. Ahora todas las pilas de una misma referencia comparten
   la orientación que decide `elegirOrientacion` (la que más unidades
   permite por fila), y solo el orden de inserción y la posición varían
   entre pilas.

   En pruebas con cientos de pedidos aleatorios, esta versión nunca usó más
   camiones que un simple empaquetado por filas y en algunos casos usó uno
   menos; el tiempo de cálculo se mantiene en el orden de los 10-15 ms
   incluso con más de cien palets, por lo que no hace falta moverlo a un
   Web Worker.

5. **Rescate por desalojo** (`intentarRescatePorDesalojo`): ninguna de las
   capas anteriores reconsidera una pila que YA está colocada; solo deciden
   dónde va lo que falta. Para el caso típico de "si moviera esa pila de
   sitio, cabría otra más", se añadió un último paso: si tras todo lo
   anterior quedan pocas pilas sin sitio (≤6), se prueba a desalojar (una a
   una) las pilas ya colocadas de mayor huella, reconstruyendo los huecos
   libres del camión sin ella (`reconstruirLibres`) y comprobando con
   backtracking si la pila desalojada y la(s) que faltaban caben juntas en
   otro sitio. Si funciona, se sustituye esa parte del camión por el nuevo
   resultado; si no, no se toca nada. Es deliberadamente conservador: solo
   desaloja una pila cada vez, no reorganiza el camión entero (eso sería
   mucho más caro y ya no estaría garantizado en tiempo real).

   **Excepción de orientación en el rescate**: el resto del camión respeta
   la orientación única por referencia (punto 4 más arriba), pero tanto el
   backtracking como el desalojo SÍ prueban a girar 90º las pocas pilas
   sueltas que están rescatando, aunque el resto de su misma referencia
   esté orientada de otra forma. Es el mismo gesto que haría una persona
   cargando a mano: el grueso de una referencia va siempre igual, pero la
   última pieza suelta que no encaja se gira para aprovechar el hueco que
   quede. Esto resolvió un caso real: un pedido que dejaba 1 palet (de 11)
   de una referencia sin sitio por solo 370mm de margen pasó a caber
   entero (suelo del 73,2% al 87,1%) en cuanto se permitió girar esa única
   pieza sobrante.
5. **Camión único por defecto**: `planificarCargaCamion()` solo usa UN
   camión salvo que le pases `{ permitirVariosCamiones: true }`. Si el
   pedido no cabe entero, en vez de abrir un segundo camión automáticamente,
   se avisa de cuántas unidades de cada referencia se han quedado fuera
   (`referenciasNoAsignadas`) y se añade un aviso general. Si activas
   `permitirVariosCamiones`, el comportamiento pasa a ser el de repartir el
   pedido en tantos camiones como haga falta (hasta `maxCamiones`, 25 por
   defecto), abriendo uno nuevo cada vez que el actual se llena por
   longitud o por peso.

## Camión dinámico

`TruckProfile` es solo un objeto de datos:

```ts
interface TruckProfile {
  id: string;
  nombre: string;
  largoInteriorMm: number;
  anchoInteriorMm: number;
  altoInteriorMm: number;
  pesoMaxKg: number;
}
```

`DEFAULT_TRUCK_PROFILE` trae las medidas de un semirremolque estándar, pero
puedes crear tantos perfiles como necesites con `crearTruckProfile()` y
guardarlos donde te convenga (base de datos, tabla de configuración, etc.).
La demo ya permite editar estos 4 valores en tiempo real.

## Limitaciones conocidas / siguientes pasos razonables

- El algoritmo de planta (MaxRects / Best Short Side Fit) es un heurístico,
  no un óptimo matemático exacto (eso sería NP-difícil para este tamaño de
  problema). En la práctica iguala o mejora al empaquetado por filas en
  todos los casos probados, pero para un pedido muy concreto podría existir
  todavía alguna distribución ligeramente mejor.
- No considera el **orden de descarga** (LIFO por destino/parada de ruta).
  Si reparteis a varias paradas, es la siguiente pieza a añadir: ordenar las
  pilas por destino antes de empaquetar para que el primer destino en
  descargarse quede más cerca de la puerta del camión.
- No considera **distribución de peso por eje**, solo el peso total del
  camión. Si transportáis cargas muy pesadas y descompensadas, conviene
  añadir esa validación.
- La altura del palet parcial es una aproximación proporcional; perfecciónala
  si tienes la altura real por unidad/caja.

## Conectarlo a tu backend (API REST)

`planificarCargaCamion()` es una función pura: no toca red ni base de datos,
así que se puede llamar igual desde el navegador (como en la demo) o desde
un backend Node. Ejemplo de wrapper Express (no incluido en este proyecto,
es solo orientativo para tu propio servidor):

```ts
import express from "express";
import { planificarCargaCamion } from "./src/api";

const app = express();
app.use(express.json());

app.post("/api/carga/planificar", async (req, res) => {
  const { lineasPedido, truckProfileId } = req.body;

  // Aquí cargarías de tu base de datos:
  const catalogoReferencias = await obtenerReferencias();
  const truckProfile = await obtenerTruckProfile(truckProfileId);

  const resultado = planificarCargaCamion(lineasPedido, catalogoReferencias, truckProfile);
  res.json(resultado);
});
```

## Modelo de datos sugerido para base de datos

Si quieres persistir esto en tablas, una traducción directa de
`types.ts` sería:

- `pallet_types(id, nombre, largo_mm, ancho_mm, altura_base_mm, peso_max_kg, peso_tara_kg)`
- `references(id, sku, nombre, unidades_por_palet, lote_minimo, apilable, pallet_type_id, peso_unitario_kg, altura_palet_completo_mm)`
- `truck_profiles(id, nombre, largo_interior_mm, ancho_interior_mm, alto_interior_mm, peso_max_kg)`
- `orders(id, ...)` y `order_lines(order_id, reference_id, cantidad_solicitada)`
- Opcionalmente, persistir el resultado en `load_plans(id, order_id, truck_profile_id, numero_camion, ...)`
  y `placed_pallets(load_plan_id, reference_id, x, y, z, nivel, ...)` si
  quieres guardar el plano generado en lugar de recalcularlo cada vez.
