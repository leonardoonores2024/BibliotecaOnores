import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { crearCatalogo } from '../data/libros.js'
import { crearMovimientos, crearIngreso, hoy, pesos, siguienteId, sumarDias, MULTA_POR_DIA, PLAZO_DIAS } from '../data/movimientos.js'

const BibliotecaContext = createContext(null)

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** "29/10/2024" -> "29 Oct 2024" (formato de la tabla del panel) */
export function fechaCorta(iso) {
  const [d, m, a] = String(iso).split('/').map(Number)
  if (!d) return iso
  return `${d} ${MESES[m - 1]} ${a}`
}

const creditos = (dias) => `${dias} ${dias === 1 ? 'día' : 'días'}`

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

  /**
   * Registra el préstamo: descuenta un ejemplar del catálogo y deja el
   * movimiento en el historial. El préstamo se fecha hoy y lo que se
   * escribe es la devolución estimada (si viene vacía, corre el plazo).
   */
  const prestar = useCallback(({ libro, alumno, curso, devolucion }) => {
    setLibros((prev) => prev.map((l) => (l.id === libro.id ? { ...l, disponibles: l.disponibles - 1 } : l)))

    setMovimientos((prev) => [
      {
        id: siguienteId(prev),
        tipo: 'prestamo',
        alumno: alumno.trim(),
        curso: curso?.trim() || 'Curso sin especificar',
        libro: libro.titulo,
        editorial: libro.editorial.replace('Ed. ', 'Editorial '),
        fecha: hoy(),
        devolucion: null,
        devolucionEstimada: devolucion || sumarDias(hoy(), PLAZO_DIAS),
        dias: 0,
        estado: 'En Préstamo',
        devolucionTexto: 'Sin devolver',
        atrasoTexto: '0 días',
        sancion: 'Sin sanción',
        multaTexto: 'No corresponde',
        multa: 0,
        multaPagada: false,
        sancionado: false,
        esNuevo: true,
      },
      ...prev,
    ])

    return libro
  }, [])

  /**
   * Alta de un libro en el catálogo. Suma sus ejemplares y deja el
   * movimiento de ingreso en el historial.
   */
  const agregarLibro = useCallback((datos) => {
    const titulo = String(datos.titulo ?? '').trim()
    const autor = String(datos.autor ?? '').trim()
    const isbn = String(datos.isbn ?? '').trim()

    if (!titulo) return { ok: false, error: 'Ingresá el título del libro.' }
    if (!autor) return { ok: false, error: 'Ingresá el autor del libro.' }

    const mismoTitulo = libros.find((l) => l.titulo.toLowerCase() === titulo.toLowerCase())
    if (mismoTitulo) {
      return { ok: false, error: `"${mismoTitulo.titulo}" ya está cargado en el catálogo.` }
    }

    const plano = isbn.replace(/[\s-]/g, '')
    if (plano && libros.some((l) => l.isbn.replace(/[\s-]/g, '') === plano)) {
      return { ok: false, error: `El ISBN ${isbn} ya está cargado en el catálogo.` }
    }

    const nuevo = {
      id: libros.reduce((max, l) => Math.max(max, l.id), 0) + 1,
      titulo,
      autor,
      editorial: String(datos.editorial ?? '').trim() || 'Ed. Sin editorial',
      categoria: String(datos.categoria ?? '').trim() || 'Obras Literarias',
      isbn: isbn || `978-84-${1000 + (libros.length + 1) * 37}`,
      anio: Number(datos.anio) || new Date().getFullYear(),
      disponibles: Math.max(1, Number(datos.ejemplares) || 1),
      portada: null,
      esNuevo: true,
    }

    setLibros((prev) => [...prev, nuevo])
    setMovimientos((prev) => [crearIngreso(nuevo, siguienteId(prev)), ...prev])

    return { ok: true, libro: nuevo }
  }, [libros])

  /** Aplica (o quita) la sanción de un préstamo vencido. */
  const sancionar = useCallback((id, { tipo, dias, nota }) => {
    const diasSancion = Math.max(1, Number(dias) || 1)
    setMovimientos((prev) => prev.map((m) => {
      if (m.id !== id) return m
      const multa = diasSancion * MULTA_POR_DIA
      return {
        ...m,
        sancionado: true,
        sancionTipo: tipo,
        sancionDias: diasSancion,
        sancionNota: nota || '',
        sancion: `${tipo} · ${creditos(diasSancion)}`,
        multa,
        multaPagada: false,
        multaTexto: `No - ${pesos(multa)} pendiente`,
      }
    }))
  }, [])

  const quitarSancion = useCallback((id) => {
    setMovimientos((prev) => prev.map((m) => {
      if (m.id !== id) return m
      const multa = m.dias * MULTA_POR_DIA
      return {
        ...m,
        sancionado: false,
        sancionTipo: undefined,
        sancionDias: 0,
        sancionNota: '',
        sancion: multa > 0 ? 'Multa por retraso' : 'Sin sanción',
        multa,
        multaPagada: multa > 0 && m.estado === 'Entregado',
        multaTexto: multa === 0
          ? 'No corresponde'
          : m.estado === 'Entregado'
            ? `Sí - ${pesos(multa)}`
            : `No - ${pesos(multa)} pendiente`,
      }
    }))
  }, [])

  /** Marca la multa de un préstamo ya sancionado como pagada o pendiente. */
  const alternarMultaPagada = useCallback((id) => {
    setMovimientos((prev) => prev.map((m) => (
      m.id === id ? { ...m, multaPagada: !m.multaPagada } : m
    )))
  }, [])

  const valor = useMemo(
    () => ({
      libros, movimientos, seleccion, setSeleccion,
      buscar, prestar, agregarLibro, sancionar, quitarSancion, alternarMultaPagada,
    }),
    [libros, movimientos, seleccion, buscar, prestar, agregarLibro, sancionar, quitarSancion, alternarMultaPagada],
  )

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>
}

export function useBiblioteca() {
  const ctx = useContext(BibliotecaContext)
  if (!ctx) throw new Error('useBiblioteca debe usarse dentro de BibliotecaProvider')
  return ctx
}