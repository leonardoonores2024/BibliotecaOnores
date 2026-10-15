import { LIBROS } from './libros.js'

// Los primeros 8 registros son los que aparecen en el frame de Figma.
const INICIALES = [
  { alumno: 'Valentina Ortiz', curso: '6to Año B', libro: 'Don Quijote de la Mancha', editorial: 'Editorial Vicens Vives', fecha: '29/10/2024', devolucion: null, dias: 0, estado: 'En Préstamo' },
  { alumno: 'Bautista Herrera', curso: '2do Año B', libro: 'La sombra del viento', editorial: 'Editorial Planeta', fecha: '28/10/2024', devolucion: null, dias: 0, estado: 'En Préstamo' },
  { alumno: 'Camila Franco', curso: '5to Año A', libro: 'Fahrenheit 451', editorial: 'Editorial Minotauro', fecha: '22/10/2024', devolucion: '30/10/2024', dias: 0, estado: 'Entregado' },
  { alumno: 'Sofía Rodríguez', curso: '4to Año B', libro: 'Cien años de soledad', editorial: 'Editorial Sudamericana', fecha: '18/10/2024', devolucion: '31/10/2024', dias: 0, estado: 'Entregado' },
  { alumno: 'Lucía Fernández', curso: '3er Año A', libro: 'Mitos griegos', editorial: 'Editorial Vicens Vives', fecha: '14/10/2024', devolucion: '31/10/2024', dias: 3, estado: 'Entregado' },
  { alumno: 'Mateo Silva', curso: '3er Año C', libro: 'El Principito', editorial: 'Editorial Salamandra', fecha: '10/10/2024', devolucion: null, dias: 7, estado: 'Vencido' },
  { alumno: 'Tomás Giménez', curso: '4to Año A', libro: 'Rayuela', editorial: 'Editorial Alfaguara', fecha: '08/10/2024', devolucion: '24/10/2024', dias: 2, estado: 'Entregado' },
  { alumno: 'Joaquín Pérez', curso: '5to Año B', libro: 'Martín Fierro', editorial: 'Editorial Colihue', fecha: '03/10/2024', devolucion: null, dias: 14, estado: 'Vencido' },
]

const ALUMNOS = [
  'Alumno Uno', 'Alumno Dos', 'Alumno Tres', 'Alumno Cuatro',
  'Alumno Cinco', 'Alumno Seis', 'Alumno Siete', 'Alumno Ocho',
  'Alumno Nueve', 'Alumno Diez', 'Alumno Once', 'Alumno Doce',
]

const CURSOS = [
  '1er Año A', '2do Año A', '2do Año B', '3er Año A',
  '3er Año C', '4to Año A', '4to Año B', '5to Año A',
  '5to Año B', '6to Año A', '6to Año B', '1ro Año B',
]

export const TOTAL_REGISTROS = 160
export const POR_PAGINA = 8
export const TOTAL_PAGINAS_HISTORIAL = Math.ceil(TOTAL_REGISTROS / POR_PAGINA)
export const MULTA_POR_DIA = 100
export const PLAZO_DIAS = 14

/** Sanciones que un bibliotecario puede aplicar a un préstamo vencido. */
export const TIPOS_SANCION = [
  'Suspensión de préstamo',
  'Recargo Brou',
  'Reparación del ejemplar',
  'Aviso al tutor',
  'Retención del material',
]

const dia = (n) => String(n).padStart(2, '0')

// Formato de moneda es-AR: "$ 1.400"
export const pesos = (n) => '$ ' + new Intl.NumberFormat('es-AR').format(n)

/** Fecha de hoy en el mismo formato que usa el historial: "DD/MM/AAAA". */
export const hoy = () => {
  const d = new Date()
  return `${dia(d.getDate())}/${dia(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "DD/MM/AAAA" -> "AAAA-MM-DD" (para los <input type="date">). */
export const aIso = (f) => {
  const [d, m, a] = String(f).split('/').map(Number)
  if (!d || !m || !a) return f
  return `${a}-${dia(m)}-${dia(d)}`
}

/** "DD/MM/AAAA" -> timestamp (para ordenar y filtrar). */
export const aTiempo = (f) => {
  const [d, m, a] = String(f).split('/').map(Number)
  return new Date(a, (m || 1) - 1, d || 1).getTime()
}

/** Valida "DD/MM/AAAA" y devuelve la fecha canónica, o null si no existe. */
export function normalizarFecha(texto) {
  const m = String(texto ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const [, d, mes, a] = m.map(Number)
  if (mes < 1 || mes > 12) return null
  const f = new Date(a, mes - 1, d)
  // Descarta Overflow, 31/02 y demás fechas que no existen.
  if (f.getDate() !== d || f.getMonth() !== mes - 1 || f.getFullYear() !== a) return null
  return `${dia(d)}/${dia(mes)}/${a}`
}

/** "DD/MM/AAAA" + n días -> "DD/MM/AAAA". */
export function sumarDias(fecha, n) {
  const t = aTiempo(fecha)
  if (!Number.isFinite(t)) return fecha
  const d = new Date(t)
  d.setDate(d.getDate() + n)
  return `${dia(d.getDate())}/${dia(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** Hoy + n días, en el formato del historial. */
export const desdeHoy = (n) => sumarDias(hoy(), n)

/** Correlativo libre del historial, con el año del movimiento. */
export function siguienteId(movimientos) {
  const numeros = movimientos.map((m) => Number(String(m.id).split('-P')[1])).filter(Number.isFinite)
  const siguiente = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `${hoy().slice(-4)}-P${String(siguiente).padStart(3, '0')}`
}

/** timestamp -> "AAAA-MM-DD" (para los <input type="date">). */
const isoDe = (t) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${dia(d.getMonth() + 1)}-${dia(d.getDate())}`
}

/** Rango mínimo/máximo de fechas presente en el historial. */
export function limitesFechas(movimientos) {
  let min = Infinity
  let max = -Infinity
  for (const m of movimientos) {
    const t = aTiempo(m.fecha)
    if (!Number.isFinite(t)) continue
    if (t < min) min = t
    if (t > max) max = t
  }
  if (min === Infinity) return { desde: isoDe(Date.now()), hasta: isoDe(Date.now()) }
  return { desde: isoDe(min), hasta: isoDe(max) }
}

/** Genera los 160 movimientos de forma determinista. */
export function crearMovimientos() {
  const filas = [...INICIALES]

  for (let i = INICIALES.length; i < TOTAL_REGISTROS; i++) {
    const libro = LIBROS[i % LIBROS.length]
    const atras = [0, 0, 2, 5, 0, 9, 1, 4, 0, 12][i % 10]
    const entregado = atras === 0 && i % 3 !== 0
    const vencido = !entregado && atras > 0
    const mes = Math.max(1, 10 - Math.floor(i / 30))

    filas.push({
      alumno: ALUMNOS[i % ALUMNOS.length],
      curso: CURSOS[(i * 5) % CURSOS.length],
      libro: libro.titulo,
      editorial: libro.editorial.replace('Ed. ', 'Editorial '),
      fecha: `${dia((i % 27) + 1)}/${dia(mes)}/2024`,
      devolucion: entregado ? `${dia((i % 28) + 2)}/${dia(mes)}/2024` : null,
      dias: atras,
      estado: vencido ? 'Vencido' : entregado ? 'Entregado' : 'En Préstamo',
    })
  }

  return filas.map((f, i) => {
    const multa = f.dias * MULTA_POR_DIA
    return {
      id: `2024-P${String(160 - i).padStart(3, '0')}`,
      tipo: 'prestamo',
      ...f,
      // El plazo corre desde el préstamo, no desde la devolución real.
      devolucionEstimada: sumarDias(f.fecha, PLAZO_DIAS),
      devolucionTexto: f.devolucion ?? 'Sin devolver',
      atrasoTexto: `${f.dias} ${f.dias === 1 ? 'día' : 'días'}`,
      sancion: multa > 0 ? 'Multa por retraso' : 'Sin sanción',
      multaTexto:
        multa === 0
          ? 'No corresponde'
          : f.estado === 'Entregado'
            ? `Sí - ${pesos(multa)}`
            : `No - ${pesos(multa)} pendiente`,
      multa,
      multaPagada: multa > 0 && f.estado === 'Entregado',
      // Todavía no tiene una sanción cargada por el bibliotecario.
      sancionado: false,
    }
  })
}

/** Movimiento de alta de un ejemplar en el catálogo. */
export function crearIngreso(libro, id) {
  return {
    id,
    tipo: 'ingreso',
    alumno: 'Sin asignar',
    curso: 'Alta en catálogo',
    libro: libro.titulo,
    editorial: libro.editorial.replace('Ed. ', 'Editorial '),
    fecha: hoy(),
    devolucion: null,
    devolucionEstimada: null,
    dias: 0,
    estado: 'Ingresado',
    devolucionTexto: 'Sin devolver',
    atrasoTexto: '0 días',
    sancion: 'No aplica',
    multaTexto: 'No aplica',
    multa: 0,
    multaPagada: false,
    sancionado: false,
    esNuevo: true,
  }
}

export const MOVIMIENTOS = crearMovimientos()