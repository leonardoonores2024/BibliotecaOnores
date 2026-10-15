import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  POR_PAGINA, MULTA_POR_DIA, PLAZO_DIAS, TIPOS_SANCION, limitesFechas, aTiempo, pesos,
} from '../data/movimientos.js'
import { useBiblioteca, fechaCorta } from '../context/BibliotecaContext.jsx'
import Modal from '../components/Modal'
import {
  IconSearch, IconCalendario, IconChevron, IconIzquierda, IconDerecha, IconOrden,
  IconAlerta, IconGato, IconCheck,
} from '../components/Icons'

const ESTADOS = ['Entregado', 'En Préstamo', 'Vencido', 'Ingresado']
const CLASE = { Entregado: 'entregado', 'En Préstamo': 'prestamo', Vencido: 'vencido', Ingresado: 'ingresado' }

/**
 * Anchos fijos: el curso va debajo del alumno y la multa debajo de la sanción,
 * así la tabla entra completa sin tener que deslizar a la última columna.
 */
const COLUMNAS = [
  { clave: 'id', etiqueta: 'ID Trámite', ancho: '76px', fija: 'fija-1' },
  { clave: 'alumno', etiqueta: 'Alumno', ancho: '152px', fija: 'fija-2' },
  { clave: 'libro', etiqueta: 'Libro / Editorial', ancho: 'auto' },
  { clave: 'fecha', etiqueta: 'Préstamo', ancho: '88px' },
  { clave: 'devolucionTexto', etiqueta: 'Devolución Real', ancho: '96px' },
  { clave: 'dias', etiqueta: 'Retraso', ancho: '66px' },
  { clave: 'estado', etiqueta: 'Estado', ancho: '98px' },
  { clave: 'sancion', etiqueta: 'Sanción Aplicada', ancho: '166px' },
  { clave: 'accion', etiqueta: 'Acción', ancho: '108px', accion: true },
]

/** Solo se puede sancionar un préstamo vencido. */
const sePuedeSancionar = (m) => m.estado === 'Vencido'

const MOTIVO = {
  prestamo: 'El libro está en préstamo: la sanción se aplica cuando el alumno lo devuelva.',
  entregado: 'El préstamo ya está completado: la sanción se aplica sobre la multa del retraso.',
}

function SancionModal({ movimiento, onCerrar }) {
  const { sancionar } = useBiblioteca()
  const [tipo, setTipo] = useState(TIPOS_SANCION[0])
  const [dias, setDias] = useState(5)
  const [nota, setNota] = useState('')

  const n = Math.max(1, Number(dias) || 0)

  return (
    <Modal
      titulo={`Sancionar a ${movimiento.alumno}`}
      subtitulo={`${movimiento.libro} · ${movimiento.curso} · retraso de ${movimiento.dias} días`}
      onCerrar={onCerrar}
      ancho={520}
    >
      <form
        className="form-fields"
        onSubmit={(e) => {
          e.preventDefault()
          sancionar(movimiento.id, { tipo, dias: n, nota: nota.trim() })
          onCerrar()
        }}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="s-tipo">Tipo de sanción</label>
          <div className="campo">
            <select id="s-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_SANCION.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <IconChevron size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="s-dias">Días de sanción</label>
          <input
            id="s-dias"
            className="form-input"
            type="number"
            min={1}
            value={dias}
            onChange={(e) => setDias(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="s-nota">Observación para el alumno</label>
          <input
            id="s-nota"
            className="form-input"
            placeholder="Opcional"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </div>

        <p className="aviso aviso-info">
          <IconAlerta size={16} />
          <span>Se registra <strong>{tipo}</strong> por <strong>{n}</strong> días y una multa de <strong>{pesos(MULTA_POR_DIA * n)}</strong>.</span>
        </p>

        <div className="modal-acciones">
          <button type="button" className="btn btn-outline" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn-maron"><IconGato size={16} />Aplicar sanción</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Historial() {
  const {
    movimientos: MOVIMIENTOS, quitarSancion, alternarMultaPagada,
  } = useBiblioteca()

  const [busqueda, setBusqueda] = useState('')
  // null = rango automático (el que existe en los datos), así los movimientos
  // nuevos siempre quedan dentro del filtro.
  const [rango, setRango] = useState(null)
  const [estados, setEstados] = useState([])
  const [orden, setOrden] = useState({ campo: 'id', dir: 'desc' })
  const [pagina, setPagina] = useState(1)
  const [sancionando, setSancionando] = useState(null)

  const wrapRef = useRef(null)
  const [scroll, setScroll] = useState({ inicio: true, fin: true, desborda: false })

  const limites = useMemo(() => limitesFechas(MOVIMIENTOS), [MOVIMIENTOS])
  const desde = rango?.desde ?? limites.desde
  const hasta = rango?.hasta ?? limites.hasta

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const d = new Date(desde).getTime()
    const h = new Date(hasta).getTime() + 86_400_000

    const salida = MOVIMIENTOS.filter((m) => {
      if (q && ![m.alumno, m.libro, m.curso, m.editorial].some((v) => v.toLowerCase().includes(q))) return false
      if (estados.length && !estados.includes(m.estado)) return false
      const t = aTiempo(m.fecha)
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
  }, [busqueda, desde, hasta, estados, orden, MOVIMIENTOS])

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

  // --- scroll horizontal de la tabla -------------------------------------
  // Se devuelve el estado anterior si nada cambió: si no, el ResizeObserver
  // se realimenta solo y entra en loop de renders.
  const medirScroll = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const siguiente = {
      inicio: el.scrollLeft <= 1,
      fin: el.scrollLeft >= max - 1,
      desborda: max > 1,
    }
    setScroll((prev) => (
      prev.inicio === siguiente.inicio
        && prev.fin === siguiente.fin
        && prev.desborda === siguiente.desborda
        ? prev
        : siguiente
    ))
  }, [])

  useEffect(() => {
    medirScroll()
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(medirScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [medirScroll, visibles, filtrados.length])

  const desplazar = (dir) => {
    const el = wrapRef.current
    if (el) el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.8), behavior: 'smooth' })
  }

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
            <input
              type="date" id="hf" value={desde}
              onChange={(e) => { setRango((r) => ({ desde: e.target.value, hasta: r?.hasta ?? limites.hasta })); setPagina(1) }}
            />
            <span className="rango-sep">al</span>
            <input
              type="date" value={hasta}
              onChange={(e) => { setRango((r) => ({ desde: r?.desde ?? limites.desde, hasta: e.target.value })); setPagina(1) }}
            />
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
                onChange={(ev) => { if (ev.target.value) { setEstados(ESTADOS.filter((x) => x !== ev.target.value)); setPagina(1) } }}
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

        <div className="barra-scroll">
          <span className="scroll-nota">
            {scroll.desborda
              ? 'Deslizá la tabla para ver el resto de las columnas'
              : `${COLUMNAS.length} columnas — se ve la tabla completa`}
          </span>
          <div className="scroll-btns">
            <button
              className="btn btn-outline btn-icon"
              onClick={() => desplazar(-1)}
              disabled={!scroll.desborda || scroll.inicio}
              aria-label="Desplazar a la izquierda"
            ><IconIzquierda /></button>
            <button
              className="btn btn-outline btn-icon"
              onClick={() => desplazar(1)}
              disabled={!scroll.desborda || scroll.fin}
              aria-label="Desplazar a la derecha"
            ><IconDerecha /></button>
          </div>
        </div>

        <div className={`tabla-wrap ${scroll.desborda && !scroll.fin ? 'hay-scroll' : ''}`} ref={wrapRef} onScroll={medirScroll}>
          <table className="tabla">
            <colgroup>
              {COLUMNAS.map((c) => (
                <col key={c.clave} style={{ width: c.ancho === 'auto' ? undefined : c.ancho }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {COLUMNAS.map(({ clave, etiqueta, fija, accion }) => (
                  <th
                    key={clave}
                    className={`${fija ? fija : ''} ${accion ? 'sin-orden' : 'ordenable'}`}
                    onClick={accion ? undefined : () => alternarOrden(clave)}
                    title={accion ? undefined : `Ordenar por ${etiqueta}`}
                  >
                    {etiqueta}
                    {accion ? <IconGato size={13} /> : <IconOrden />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((m) => {
                const puede = sePuedeSancionar(m)
                const ingreso = m.tipo === 'ingreso'
                return (
                  <tr key={m.id} className={m.esNuevo ? 'es-nuevo' : ''}>
                    <td className="muted-sm fija fija-1">{m.id}</td>
                    <td className="fija fija-2">
                      <div className={`strong ${ingreso ? 'muted' : ''}`}>{m.alumno}</div>
                      <div className="muted-sm">{m.curso}</div>
                    </td>
                    <td>
                      <div>{m.libro}</div>
                      <div className="muted-sm">{m.editorial}</div>
                    </td>
                    <td>
                      <div>{m.fecha}</div>
                      {!ingreso && !m.devolucion && m.devolucionEstimada && (
                        <div className="muted-sm">Vence {fechaCorta(m.devolucionEstimada)}</div>
                      )}
                    </td>
                    <td className="muted">{ingreso ? '—' : m.devolucionTexto}</td>
                    <td className={m.dias > 0 ? 'retraso' : 'muted'}>{ingreso ? '—' : m.atrasoTexto}</td>
                    <td><span className={`status ${CLASE[m.estado]}`}>{m.estado}</span></td>
                    <td>
                      {ingreso ? (
                        <span className="muted">—</span>
                      ) : (
                        <>
                          <div className={m.sancionado ? 'sancion-activa' : 'muted'}>{m.sancion}</div>
                          {m.sancionado
                            ? (
                              <div className="multa-linea">
                                <button
                                  className="btn-link"
                                  onClick={() => alternarMultaPagada(m.id)}
                                >
                                  {m.multaPagada ? <IconCheck size={12} /> : null}
                                  {m.multaPagada ? 'Multa pagada' : m.multaTexto}
                                </button>
                                <button className="btn-link es-quitar" onClick={() => quitarSancion(m.id)}>
                                  Quitar
                                </button>
                              </div>
                            )
                            : m.multa > 0 && <div className="muted-sm">{m.multaTexto}</div>}
                          {m.sancionado && m.sancionNota && <div className="muted-sm">{m.sancionNota}</div>}
                        </>
                      )}
                    </td>
                    <td>
                      {ingreso ? (
                        <span className="muted-sm">Ingreso</span>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm btn-sancion"
                          disabled={!puede}
                          title={puede
                            ? `Aplicar sanción a ${m.alumno}`
                            : `${m.estado}: ${MOTIVO[m.estado === 'En Préstamo' ? 'prestamo' : 'entregado']}`}
                          onClick={() => setSancionando(m)}
                        >
                          <IconAlerta size={14} />Sancionar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
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

      {sancionando && (
        <SancionModal
          movimiento={sancionando}
          onCerrar={() => setSancionando(null)}
        />
      )}
    </main>
  )
}