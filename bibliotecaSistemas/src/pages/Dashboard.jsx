import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconLibro, IconHistorial, IconAlerta, IconPlusCircle, IconTresPuntos,
} from '../components/Icons'
import { useBiblioteca, fechaCorta } from '../context/BibliotecaContext.jsx'

const PRESTAMOS_MAQUETA = [
  { id: 'p1', alumno: 'Tomás Giménez', curso: '4to Año A', libro: 'Rayuela', fecha: '24 Oct 2024', estado: 'Entregado', clase: 'entregado' },
  { id: 'p2', alumno: 'Valentina Ortiz', curso: '6to Año B', libro: 'Don Quijote', fecha: '23 Oct 2024', estado: 'En Préstamo', clase: 'prestamo' },
  { id: 'p3', alumno: 'Mateo Silva', curso: '3er Año C', libro: 'El Principito', fecha: '18 Oct 2024', estado: 'Vencido', clase: 'vencido' },
  { id: 'p4', alumno: 'Camila Franco', curso: '5to Año A', libro: 'Fahrenheit 451', fecha: '22 Oct 2024', estado: 'Entregado', clase: 'entregado' },
  { id: 'p5', alumno: 'Bautista Herrera', curso: '2do Año B', libro: 'La Sombra del Viento', fecha: '21 Oct 2024', estado: 'En Préstamo', clase: 'prestamo' },
]

const METRICAS = [
  { label: 'Préstamos de Libros', valor: '34', badge: 'Hoy +4', clase: 'badge-pink', Icon: IconLibro },
  { label: 'Libros en Préstamo', valor: '18', badge: 'Estable', clase: 'badge-gray', Icon: IconLibro },
  { label: 'Devoluciones Pendientes', valor: '7', badge: 'Esta semana', clase: 'badge-gray', Icon: IconHistorial },
  { label: 'Libros Vencidos', valor: '2', badge: 'Atención', clase: 'badge-red', Icon: IconAlerta },
]

const CAMPOS = [
  { clave: 'alumno', label: 'Nombre y Apellido del Alumno', ph: 'Ej. Sofía Rodríguez' },
  { clave: 'curso', label: 'Curso / Año', ph: 'Ej. 5to Año Ciencias Naturales' },
  { clave: 'libro', label: 'Código ISBN / Título del Libro', ph: 'Ej. Cien años de soledad / ISBN-978-3-16' },
  { clave: 'fecha', label: 'Fecha de Devolución Estimada', ph: 'DD / MM / AAAA' },
]

const CLASE = { 'En Préstamo': 'prestamo', Entregado: 'entregado', Vencido: 'vencido', Ingresado: 'ingresado' }

const VACIO = { alumno: '', curso: '', libro: '', fecha: '' }

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

    const restantes = r.libro.disponibles - 1
    prestar({ libro: r.libro, alumno: form.alumno.trim(), curso: form.curso, fecha: form.fecha })
    setAviso({
      tipo: 'ok',
      texto: `Préstamo registrado: "${r.libro.titulo}" — quedan ${restantes} disponibles.`,
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
        {CAMPOS.map(({ clave, label, ph }) => (
          <div className="form-group" key={clave}>
            <label className="form-label" htmlFor={clave}>{label}</label>
            <input
              id={clave}
              className="form-input"
              placeholder={ph}
              value={form[clave]}
              onChange={set(clave)}
            />
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

  const filas = [
    ...movimientos.slice(0, 5).map((m) => ({
      id: m.id,
      alumno: m.alumno,
      curso: m.curso,
      libro: m.libro,
      fecha: fechaCorta(m.fecha),
      estado: m.estado,
      clase: CLASE[m.estado] ?? 'prestamo',
      nuevo: true,
    })),
    ...PRESTAMOS_MAQUETA,
  ]

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
