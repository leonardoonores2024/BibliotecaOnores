import { useMemo, useState } from 'react'
import {
  MOVIMIENTOS, POR_PAGINA, MULTA_POR_DIA, PLAZO_DIAS,
} from '../data/movimientos.js'
import {
  IconSearch, IconCalendario, IconChevron, IconIzquierda, IconDerecha, IconOrden,
} from '../components/Icons'

const ESTADOS = ['Entregado', 'En Préstamo', 'Vencido']
const CLASE = { Entregado: 'entregado', 'En Préstamo': 'prestamo', Vencido: 'vencido' }

const COLUMNAS = [
  { clave: 'id', etiqueta: 'ID Trámite' },
  { clave: 'alumno', etiqueta: 'Alumno' },
  { clave: 'libro', etiqueta: 'Libro / Editorial' },
  { clave: 'curso', etiqueta: 'Curso / Año' },
  { clave: 'fecha', etiqueta: 'Fecha de Préstamo' },
  { clave: 'devolucionTexto', etiqueta: 'Fecha Devolución Real' },
  { clave: 'dias', etiqueta: 'Días de Retraso' },
  { clave: 'estado', etiqueta: 'Estado' },
  { clave: 'sancion', etiqueta: 'Sanción Aplicada' },
  { clave: 'multaTexto', etiqueta: 'Multa Pagada' },
]

const aFecha = (f) => {
  const [d, m, a] = f.split('/').map(Number)
  return new Date(a, m - 1, d).getTime()
}

export default function Historial() {
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('2024-01-01')
  const [hasta, setHasta] = useState('2024-12-31')
  const [estados, setEstados] = useState([])
  const [orden, setOrden] = useState({ campo: 'id', dir: 'desc' })
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const d = new Date(desde).getTime()
    const h = new Date(hasta).getTime() + 86_400_000

    const salida = MOVIMIENTOS.filter((m) => {
      if (q && ![m.alumno, m.libro].some((v) => v.toLowerCase().includes(q))) return false
      if (estados.length && !estados.includes(m.estado)) return false
      const t = aFecha(m.fecha)
      return t >= d && t <= h
    })

    const { campo, dir } = orden
    const signo = dir === 'asc' ? 1 : -1
    return [...salida].sort((a, b) => {
      const va = a[campo]
      const vb = b[campo]
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * signo
      return String(va).localeCompare(String(vb), 'es') * signo
    })
  }, [busqueda, desde, hasta, estados, orden])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA)
  const desde_ = filtrados.length === 0 ? 0 : (actual - 1) * POR_PAGINA + 1
  const hasta_ = Math.min(actual * POR_PAGINA, filtrados.length)

  const alternarOrden = (clave) => setOrden((o) => (
    o.campo === clave ? { campo: clave, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { campo: clave, dir: 'asc' }
  ))

  const toggleEstado = (e) => setEstados((s) => {
    setPagina(1)
    return s.includes(e) ? s.filter((x) => x !== e) : [...s, e]
  })

  const reiniciar = (fn) => (e) => { fn(e.target.value); setPagina(1) }

  const todosActivos = estados.length === 0

  return (
    <main className="main">
      <header className="content-header">
        <div className="titles">
          <h1 className="main-title">Historial Completo de Préstamos y Devoluciones</h1>
          <p className="subtitle">Biblioteca Escolar • Registro General Histórico</p>
        </div>
        <div className="fecha-consulta">
          <span>Fecha de consulta</span>
          <strong>31 de octubre de 2024</strong>
        </div>
      </header>

      <section className="card filtros filtros-historial">
        <div className="filtro">
          <label className="filtro-label" htmlFor="hq">Alumno o libro</label>
          <div className="campo campo-busqueda">
            <IconSearch size={18} />
            <input
              id="hq" placeholder="Buscar Alumno o Libro"
              value={busqueda} onChange={reiniciar(setBusqueda)}
            />
          </div>
        </div>

        <div className="filtro">
          <label className="filtro-label" htmlFor="hf">Fecha de préstamo</label>
          <div className="campo campo-rango">
            <IconCalendario size={18} />
            <input type="date" id="hf" value={desde} onChange={reiniciar(setDesde)} />
            <span className="rango-sep">al</span>
            <input type="date" value={hasta} onChange={reiniciar(setHasta)} />
          </div>
        </div>

        <div className="filtro">
          <span className="filtro-label">
            Estado • {todosActivos ? 'Todos seleccionados' : `${estados.length} seleccionados`}
          </span>
          <div className="chips">
            {ESTADOS.map((e) => (
              <button
                key={e}
                className={`chip ${CLASE[e]} ${todosActivos || estados.includes(e) ? 'is-on' : ''}`}
                onClick={() => toggleEstado(e)}
              >{e}</button>
            ))}
            <div className="campo campo-mini">
              <select
                value=""
                onChange={(ev) => ev.target.value && setEstados(ESTADOS.filter((x) => x !== ev.target.value))}
              >
                <option value="">Quitar</option>
                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <IconChevron size={18} />
            </div>
          </div>
        </div>
      </section>

      <section className="card cuadrícula">
        <div className="resumen">
          <div>
            <h2 className="card-title">Registro de movimientos</h2>
            <p className="card-subtitle">Consulta los préstamos, devoluciones y sanciones de la biblioteca escolar.</p>
          </div>
          <span className="pill">{filtrados.length} registros encontrados</span>
        </div>

        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                {COLUMNAS.map(({ clave, etiqueta }) => (
                  <th key={clave} onClick={() => alternarOrden(clave)} className="ordenable">
                    {etiqueta}
                    <IconOrden />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((m) => (
                <tr key={m.id}>
                  <td className="muted-sm">{m.id}</td>
                  <td>
                    <div className="strong">{m.alumno}</div>
                    <div className="muted-sm">{m.curso}</div>
                  </td>
                  <td>
                    <div>{m.libro}</div>
                    <div className="muted-sm">{m.editorial}</div>
                  </td>
                  <td>{m.curso}</td>
                  <td>{m.fecha}</td>
                  <td className="muted">{m.devolucionTexto}</td>
                  <td className={m.dias > 0 ? 'retraso' : 'muted'}>{m.atrasoTexto}</td>
                  <td><span className={`status ${CLASE[m.estado]}`}>{m.estado}</span></td>
                  <td className="muted">{m.sancion}</td>
                  <td className={m.multa > 0 ? (m.multaPagada ? 'pagada' : 'pendiente') : 'muted'}>
                    {m.multaTexto}
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td colSpan={COLUMNAS.length} className="vacio">Sin registros para estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pie">
          <div className="paginacion">
            <button className="btn btn-outline" onClick={() => setPagina(Math.max(1, actual - 1))} disabled={actual === 1}>
              <IconIzquierda />Anterior
            </button>
            <span className="pagina-texto">Página {actual} de {totalPaginas}</span>
            <button className="btn btn-maron" onClick={() => setPagina(Math.min(totalPaginas, actual + 1))} disabled={actual === totalPaginas}>
              Siguiente<IconDerecha />
            </button>
          </div>
          <div className="criterios">
            <span>Mostrando {desde_}–{hasta_} de {filtrados.length} registros</span>
            <span>
              Plazo: {PLAZO_DIAS} días naturales • Multa: $ {MULTA_POR_DIA} por día de retraso • Corte: 31/10/2024
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}