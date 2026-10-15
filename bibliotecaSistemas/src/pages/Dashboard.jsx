import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconLibro, IconHistorial, IconAlerta, IconPlusCircle, IconTresPuntos,
} from '../components/Icons'
import { hoy, sumarDias, normalizarFecha, aTiempo, PLAZO_DIAS } from '../data/movimientos.js'
import { useBiblioteca, fechaCorta } from '../context/BibliotecaContext.jsx'

// Cuántos movimientos se listan en "Actividad reciente".
const ACTIVIDAD_RECIENTE = 10

// Ventana para el badge de devoluciones: hoy y los próximos 7 días.
const DIAS_VIGENCIA = 7

/**
 * Las cuatro tarjetas se calculan con el historial general: los ingresos de
 * catálogo no son préstamos, así que quedan afuera del conteo.
 */
function useMetricas(movimientos) {
  return useMemo(() => {
    const prestamos = movimientos.filter((m) => m.tipo !== 'ingreso')
    const delDia = prestamos.filter((m) => m.fecha === hoy()).length
    const enPrestamo = prestamos.filter((m) => m.estado === 'En Préstamo').length
    const vencidos = prestamos.filter((m) => m.estado === 'Vencido').length
    const sinDevolver = [...prestamos.filter((m) => m.estado === 'En Préstamo'), ...prestamos.filter((m) => m.estado === 'Vencido')]
    const pendientes = sinDevolver.length

    // De lo que falta devolver, lo que vence hoy o dentro de una semana.
    const limite = aTiempo(sumarDias(hoy(), DIAS_VIGENCIA))
    const porVencer = sinDevolver.filter((m) => aTiempo(m.devolucionEstimada ?? m.fecha) <= limite).length

    return [
      {
        label: 'Préstamos de Libros',
        valor: String(prestamos.length),
        badge: delDia > 0 ? `Hoy +${delDia}` : 'Sin préstamos hoy',
        clase: delDia > 0 ? 'badge-pink' : 'badge-gray',
        Icon: IconLibro,
      },
      {
        label: 'Libros en Préstamo',
        valor: String(enPrestamo),
        badge: vencidos === 0 ? 'Estable' : `${vencidos} en atraso`,
        clase: vencidos === 0 ? 'badge-gray' : 'badge-red',
        Icon: IconLibro,
      },
      {
        label: 'Devoluciones Pendientes',
        valor: String(pendientes),
        badge: pendientes === 0 ? 'Todo devuelto' : porVencer > 0 ? 'Esta semana' : 'Sin novedad',
        clase: pendientes === 0 ? 'badge-green' : porVencer > 0 ? 'badge-pink' : 'badge-gray',
        Icon: IconHistorial,
      },
      {
        label: 'Libros Vencidos',
        valor: String(vencidos),
        badge: vencidos === 0 ? 'Al día' : 'Atención',
        clase: vencidos === 0 ? 'badge-green' : 'badge-red',
        Icon: IconAlerta,
      },
    ]
  }, [movimientos])
}

const CAMPOS = [
  { clave: 'alumno', label: 'Nombre y Apellido del Alumno', ph: 'Ej. Sofía Rodríguez' },
  { clave: 'curso', label: 'Curso / Año', ph: 'Ej. 5to Año Ciencias Naturales' },
  { clave: 'libro', label: 'Código ISBN / Título del Libro', ph: 'Ej. Cien años de soledad / ISBN-978-3-16' },
  { clave: 'devolucion', label: 'Fecha de Devolución Estimada', ph: 'DD / MM / AAAA', pista: true },
]

const CLASE = { 'En Préstamo': 'prestamo', Entregado: 'entregado', Vencido: 'vencido', Ingresado: 'ingresado' }

const VACIO = { alumno: '', curso: '', libro: '', devolucion: '' }

/**
 * Formulario de préstamo. Se monta con `key` según la selección para que
 * el campo del libro venga precargado al llegar desde el catálogo.
 */
function FormularioPrestamo({ seleccion }) {
  const { buscar, prestar, setSeleccion } = useBiblioteca()
  const [form, setForm] = useState(() => (seleccion ? { ...VACIO, libro: seleccion.titulo } : VACIO))
  const [aviso, setAviso] = useState(() =>
    seleccion ? { tipo: 'info', texto: `Préstamo de "${seleccion.titulo}" · ISBN ${seleccion.isbn}` } : null,
  )
  // Sigue mostrando el botón de cancelar aunque la preselección ya se usó.
  const [preseleccionActiva, setPreseleccionActiva] = useState(!!seleccion)

  // Al salir del panel se limpia la selección del contexto.
  useEffect(() => () => setSeleccion(null), [setSeleccion])

  const set = (clave) => (e) => {
    setForm((f) => ({ ...f, [clave]: e.target.value }))
    if (aviso) setAviso(null)
  }

  const enviar = (e) => {
    e.preventDefault()

    if (!form.alumno.trim()) {
      setAviso({ tipo: 'error', texto: 'Ingresá el nombre del alumno.' })
      return
    }

    const r = buscar(form.libro)
    if (!r.ok) {
      setAviso({ tipo: 'error', texto: r.error })
      return
    }

    // La fecha es opcional: si viene vacía corre el plazo de 14 días.
    const escrita = form.devolucion.trim()
    const estimada = escrita ? normalizarFecha(escrita) : null
    if (escrita && !estimada) {
      setAviso({ tipo: 'error', texto: 'Fecha inválida. Usá el formato DD / MM / AAAA (ej. 28 / 11 / 2026).' })
      return
    }

    const restantes = r.libro.disponibles - 1
    const vence = fechaCorta(estimada || sumarDias(hoy(), PLAZO_DIAS))
    prestar({ libro: r.libro, alumno: form.alumno.trim(), curso: form.curso, devolucion: estimada })
    setAviso({
      tipo: 'ok',
      texto: `Préstamo registrado: "${r.libro.titulo}" — quedan ${restantes} disponibles. Vence el ${vence}.`,
    })
    setForm(VACIO)
    setPreseleccionActiva(false)
  }

  return (
    <section className="card form-card">
      <h2 className="card-title">Registrar Nuevo Préstamo</h2>
      <p className="card-subtitle">Complete los campos para asignar un libro o recurso bibliográfico.</p>
      <hr className="rule" />

      <form className="form-fields" onSubmit={enviar}>
        {CAMPOS.map(({ clave, label, ph, pista }) => (
          <div className="form-group" key={clave}>
            <label className="form-label" htmlFor={clave}>{label}</label>
            <input
              id={clave}
              className="form-input"
              placeholder={ph}
              value={form[clave]}
              onChange={set(clave)}
            />
            {pista && (
              <span className="form-hint">
                Opcional. Si lo dejás vacío, vence el {fechaCorta(sumarDias(hoy(), PLAZO_DIAS))} ({PLAZO_DIAS} días).
              </span>
            )}
          </div>
        ))}

        {aviso && <p className={`aviso aviso-${aviso.tipo}`} role="status">{aviso.texto}</p>}

        {preseleccionActiva && (
          <button
            type="button"
            className="btn btn-outline btn-sm btn-cancelar"
            onClick={() => { setForm(VACIO); setAviso(null); setPreseleccionActiva(false); setSeleccion(null) }}
          >
            Cancelar preselección
          </button>
        )}

        <button type="submit" className="btn btn-maron">
          <IconPlusCircle size={16} />
          Registrar Préstamo
        </button>
      </form>
    </section>
  )
}

export default function Dashboard() {
  const { movimientos, seleccion } = useBiblioteca()
  const METRICAS = useMetricas(movimientos)

  // Mismos movimientos que muestra el historial: nada de filas sueltas acá.
  const filas = useMemo(() => movimientos.slice(0, ACTIVIDAD_RECIENTE).map((m) => ({
    id: m.id,
    alumno: m.alumno,
    curso: m.curso,
    libro: m.libro,
    fecha: fechaCorta(m.fecha),
    estado: m.estado,
    clase: CLASE[m.estado] ?? 'prestamo',
    nuevo: !!m.esNuevo,
  })), [movimientos])

  return (
    <main className="main main-dashboard">
      <header className="content-header">
        <div className="titles">
          <h1 className="main-title">Gestión de Préstamos</h1>
          <p className="subtitle">Biblioteca Escolar • Panel de Control General</p>
        </div>
        <Link to="/historial" className="btn btn-light">
          <IconHistorial size={16} />
          Ver Historial
        </Link>
      </header>

      <div className="metrics-row">
        {METRICAS.map(({ label, valor, badge, clase, Icon }) => (
          <article className="metric-card" key={label}>
            <div className="metric-top">
              <span className="metric-label">{label}</span>
              <span className="metric-icon"><Icon size={18} /></span>
            </div>
            <div className="metric-bottom">
              <span className="metric-value">{valor}</span>
              <span className={`badge ${clase}`}>{badge}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid-dashboard">
        <FormularioPrestamo key={seleccion ? `sel-${seleccion.id}` : 'libre'} seleccion={seleccion} />

        <section className="card activity-card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Actividad Reciente de Préstamos</h2>
              <p className="card-subtitle">Últimos movimientos registrados en el sistema</p>
            </div>
            <Link to="/historial" className="btn btn-outline">Ver todos</Link>
          </div>

          <div className="table">
            <div className="table-head">
              <span>Alumno</span>
              <span>Libro / Editorial</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span />
            </div>
            {filas.map((p) => (
              <div className={`table-row${p.nuevo ? ' es-nuevo' : ''}`} key={p.id}>
                <div>
                  <div className="strong">{p.alumno}</div>
                  <div className="muted-sm">{p.curso}</div>
                </div>
                <div>{p.libro}</div>
                <div>{p.fecha}</div>
                <div><span className={`status ${p.clase}`}>{p.estado}</span></div>
                <div className="dots"><IconTresPuntos /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
