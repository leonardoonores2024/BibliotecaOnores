import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { crearCatalogo } from '../data/libros.js'
import { crearMovimientos } from '../data/movimientos.js'

const BibliotecaContext = createContext(null)

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** "29/10/2024" -> "29 Oct 2024" (formato de la tabla del panel) */
export function fechaCorta(iso) {
  const [d, m, a] = iso.split('/').map(Number)
  if (!d) return iso
  return `${d} ${MESES[m - 1]} ${a}`
}

const hoy = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function BibliotecaProvider({ children }) {
  const [libros, setLibros] = useState(crearCatalogo)
  const [movimientos, setMovimientos] = useState(crearMovimientos)
  // libro que se tocó en el catálogo y se lleva al panel principal
  const [seleccion, setSeleccion] = useState(null)

  /**
   * Resuelve lo que el bibliotecario escribió en el campo "libro".
   * Acepta título exacto, título parcial o ISBN (con o sin guiones).
   */
  const buscar = useCallback((texto) => {
    const q = String(texto ?? '').trim().toLowerCase()
    if (!q) return { ok: false, error: 'Ingresá un título o ISBN.' }

    const plano = q.replace(/[\s-]/g, '')
    const porIsbn = libros.find((l) => l.isbn.replace(/-/g, '') === plano)
    if (porIsbn) {
      return porIsbn.disponibles > 0
        ? { ok: true, libro: porIsbn }
        : { ok: false, libro: porIsbn, error: `"${porIsbn.titulo}" no tiene ejemplares disponibles.` }
    }

    const exacto = libros.find((l) => l.titulo.toLowerCase() === q)
    if (exacto) {
      return exacto.disponibles > 0
        ? { ok: true, libro: exacto }
        : { ok: false, libro: exacto, error: `"${exacto.titulo}" no tiene ejemplares disponibles.` }
    }

    const parcial = libros.find((l) => l.titulo.toLowerCase().includes(q))
    if (parcial) {
      return parcial.disponibles > 0
        ? { ok: true, libro: parcial }
        : { ok: false, libro: parcial, error: `"${parcial.titulo}" no tiene ejemplares disponibles.` }
    }

    return { ok: false, error: `No existe ningún libro con el título o ISBN "${texto.trim()}".` }
  }, [libros])

  /** Registra el préstamo y descuenta un ejemplar del catálogo. */
  const prestar = useCallback(({ libro, alumno, curso, fecha }) => {
    setLibros((prev) => prev.map((l) => (l.id === libro.id ? { ...l, disponibles: l.disponibles - 1 } : l)))

    setMovimientos((prev) => {
      const numeros = prev.map((m) => Number(m.id.split('-P')[1])).filter(Number.isFinite)
      const siguiente = Math.max(...numeros) + 1
      const cursoFinal = curso?.trim() || '1er Año'
      const atras = 0

      return [
        {
          id: `2024-P${String(siguiente).padStart(3, '0')}`,
          alumno,
          curso: cursoFinal,
          libro: libro.titulo,
          editorial: libro.editorial.replace('Ed. ', 'Editorial '),
          fecha: fecha?.trim() || hoy(),
          devolucion: null,
          dias: atras,
          estado: 'En Préstamo',
          devolucionTexto: 'Sin devolver',
          atrasoTexto: '0 días',
          sancion: 'Sin sanción',
          multaTexto: 'No corresponde',
          multa: 0,
          multaPagada: false,
        },
        ...prev,
      ]
    })

    return libro
  }, [])

  const valor = useMemo(
    () => ({ libros, movimientos, seleccion, setSeleccion, buscar, prestar }),
    [libros, movimientos, seleccion, buscar, prestar],
  )

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>
}

export function useBiblioteca() {
  const ctx = useContext(BibliotecaContext)
  if (!ctx) throw new Error('useBiblioteca debe usarse dentro de BibliotecaProvider')
  return ctx
}