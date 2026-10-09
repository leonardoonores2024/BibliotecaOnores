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

const dia = (n) => String(n).padStart(2, '0')

// Formato de moneda es-AR: "$ 1.400"
const pesos = (n) => '$ ' + new Intl.NumberFormat('es-AR').format(n)

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
      ...f,
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
    }
  })
}

export const MOVIMIENTOS = crearMovimientos()