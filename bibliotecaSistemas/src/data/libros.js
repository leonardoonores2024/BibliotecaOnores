import donQuijote from '../assets/covers/don-quijote-de-la-mancha.png'
import sombraViento from '../assets/covers/la-sombra-del-viento.png'
import fahrenheit from '../assets/covers/fahrenheit-451.png'
import cienAnios from '../assets/covers/cien-anos-de-soledad.png'
import mitosGriegos from '../assets/covers/mitos-griegos.png'
import principito from '../assets/covers/el-principito.png'
import rayuelaImg from '../assets/covers/rayuela.png'
import martinFierro from '../assets/covers/martin-fierro.png'

// Los 8 primeros son los que aparecen en el frame de Figma, con sus portadas reales.
const DESTACADOS = [
  { titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', editorial: 'Ed. Vicens Vives', categoria: 'Literatura Clásica', disponibles: 0, portada: donQuijote },
  { titulo: 'La sombra del viento', autor: 'Carlos Ruiz Zafón', editorial: 'Ed. Planeta', categoria: 'Narrativa', disponibles: 0, portada: sombraViento },
  { titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', editorial: 'Ed. Minotauro', categoria: 'Ciencia Ficción', disponibles: 3, portada: fahrenheit },
  { titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', editorial: 'Ed. Sudamericana', categoria: 'Realismo Mágico', disponibles: 2, portada: cienAnios },
  { titulo: 'Mitos griegos', autor: 'Varios autores', editorial: 'Ed. Vicens Vives', categoria: 'Mitología', disponibles: 4, portada: mitosGriegos },
  { titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', editorial: 'Ed. Salamandra', categoria: 'Fantasía', disponibles: 0, portada: principito },
  { titulo: 'Rayuela', autor: 'Julio Cortázar', editorial: 'Ed. Alfaguara', categoria: 'Narrativa', disponibles: 1, portada: rayuelaImg },
  { titulo: 'Martín Fierro', autor: 'José Hernández', editorial: 'Ed. Colihue', categoria: 'Literatura Clásica', disponibles: 0, portada: martinFierro },
]

export const CATEGORIAS = [
  'Literatura Clásica', 'Narrativa', 'Ciencia Ficción', 'Realismo Mágico',
  'Mitología', 'Fantasía', 'Poesía', 'Ensayo', 'Historia', 'Teatro',
]

export const EDITORIALES = [
  'Ed. Vicens Vives', 'Ed. Planeta', 'Ed. Minotauro', 'Ed. Sudamericana',
  'Ed. Salamandra', 'Ed. Alfaguara', 'Ed. Colihue', 'Ed. Tusquets',
  'Ed. Seix Barral', 'Ed. Siruela', 'Ed. Anagrama', 'Ed. Debate',
]

// [titulo, autor] - completan el fondo hasta 40 obras (5 paginas de 8).
const OBRAS = [
  ['La Metamorfosis', 'Franz Kafka'],
  ['El túnel', 'Ernesto Sabato'],
  ['Pedro Páramo', 'Juan Rulfo'],
  ['El amor en los tiempos del cólera', 'Gabriel García Márquez'],
  ['El Aleph', 'Jorge Luis Borges'],
  ['Veinte poemas de amor', 'Pablo Neruda'],
  ['La casa de los espíritus', 'Isabel Allende'],
  ['El nombre de la rosa', 'Umberto Eco'],
  ['Ficciones', 'Jorge Luis Borges'],
  ['El astillero', 'Juan Carlos Onetti'],
  ['Los detectives salvajes', 'Julio Cortázar'],
  ['La ciudad y los perros', 'Mario Vargas Llosa'],
  ['Crónica de una muerte anunciada', 'Gabriel García Márquez'],
  ['Crimen y castigo', 'Fedor Dostoievski'],
  ['Orgullo y prejuicio', 'Jane Austen'],
  ['El guardian entre el centeno', 'J. D. Salinger'],
  ['El gran Gatsby', 'F. Scott Fitzgerald'],
  ['1984', 'George Orwell'],
  ['La granja de los animales', 'George Orwell'],
  ['Matar a un ruiseñor', 'Harper Lee'],
  ['El Hobbit', 'J. R. R. Tolkien'],
  ['Sapiens', 'Yuval Noah Harari'],
  ['La vuelta al mundo en 80 días', 'Jules Verne'],
  ['Robinson Crusoe', 'Daniel Defoe'],
  ['Moby Dick', 'Herman Melville'],
  ['La Odisea', 'Homero'],
  ['La Celestina', 'Fernando de Rojas'],
  ['Lazarillo de Tormes', 'Anónimo'],
  ['Fortunata y Jacinta', 'Benito Pérez Galdós'],
  ['Diario de Ana Frank', 'Ana Frank'],
  ['Alicia en el país de las maravillas', 'Lewis Carroll'],
  ['Peter Pan', 'J. M. Barrie'],
]

export const TOTAL_LIBROS = DESTACADOS.length + OBRAS.length
export const POR_PAGINA = 8
export const TOTAL_PAGINAS = Math.ceil(TOTAL_LIBROS / POR_PAGINA)

/**
 * Catalogo determinista: sin Math.random, asi la paginacion
 * es estable entre renders y las 5 paginas siempre muestran lo mismo.
 */
export function crearCatalogo() {
  return [
    ...DESTACADOS,
    ...OBRAS.map(([titulo, autor], i) => ({
      titulo,
      autor,
      editorial: EDITORIALES[i % EDITORIALES.length],
      categoria: CATEGORIAS[(i * 3 + 1) % CATEGORIAS.length],
      disponibles: [1, 2, 3, 4, 0, 2, 5, 3, 1, 0][i % 10],
      portada: null,
    })),
  ].map((libro, i) => ({
    ...libro,
    id: i + 1,
    isbn: `978-84-${1000 + i * 37}`,
    anio: 2015 + ((i * 3) % 9),
  }))
}

export const LIBROS = crearCatalogo()