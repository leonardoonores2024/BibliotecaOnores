import { useState } from 'react'
import { IconConfig } from '../components/Icons'
import { POR_PAGINA, TOTAL_LIBROS } from '../data/libros.js'
import { MULTA_POR_DIA, PLAZO_DIAS, TOTAL_REGISTROS } from '../data/movimientos.js'

export default function Configuracion() {
  const [nombre, setNombre] = useState('Col. San Martín')
  const [seccion, setSeccion] = useState('Biblioteca Escolar')
  const [plazo, setPlazo] = useState(PLAZO_DIAS)
  const [multa, setMulta] = useState(MULTA_POR_DIA)
  const [guardado, setGuardado] = useState(false)

  const enviar = (e) => {
    e.preventDefault()
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  return (
    <main className="main">
      <header className="content-header">
        <div className="titles">
          <h1 className="main-title">Configuración</h1>
          <p className="subtitle">Biblioteca Escolar · Parámetros del sistema</p>
        </div>
        <span className="pill"><IconConfig size={16} />Panel de configuración</span>
      </header>

      <form className="grid-config" onSubmit={enviar}>
        <section className="card">
          <h2 className="card-title">Identidad del colegio</h2>
          <p className="card-subtitle">Datos que aparecen en la barra lateral y en los encabezados.</p>
          <hr className="rule" />
          <div className="form-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre de la institución</label>
              <input id="nombre" className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="seccion">Sección</label>
              <input id="seccion" className="form-input" value={seccion} onChange={(e) => setSeccion(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Política de préstamos</h2>
          <p className="card-subtitle">Plazo permitido y sanción aplicada por día de retraso.</p>
          <hr className="rule" />
          <div className="form-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="plazo">Plazo de devolución (días)</label>
              <input id="plazo" type="number" min="1" className="form-input" value={plazo} onChange={(e) => setPlazo(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="multa">Multa por día de retraso ($)</label>
              <input id="multa" type="number" min="0" className="form-input" value={multa} onChange={(e) => setMulta(+e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Resumen del sistema</h2>
          <p className="card-subtitle">Valores actuales del fondo bibliográfico.</p>
          <hr className="rule" />
          <ul className="resumen-lista">
            <li><span>Libros en el catálogo</span><strong>{TOTAL_LIBROS}</strong></li>
            <li><span>Registros de movimientos</span><strong>{TOTAL_REGISTROS}</strong></li>
            <li><span>Libros por página</span><strong>{POR_PAGINA}</strong></li>
            <li><span>Multa vigente</span><strong>$ {multa}</strong></li>
          </ul>
          <button type="submit" className="btn btn-maron">
            {guardado ? 'Cambios guardados' : 'Guardar cambios'}
          </button>
        </section>
      </form>
    </main>
  )
}