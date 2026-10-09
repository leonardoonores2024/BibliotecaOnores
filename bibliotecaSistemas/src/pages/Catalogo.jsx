import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIAS, POR_PAGINA } from '../data/libros.js'
import { useBiblioteca } from '../context/BibliotecaContext.jsx'
import {
  IconSearch, IconPlus, IconCuadricula, IconLista, IconChevron,
  IconIzquierda, IconDerecha, IconTresPuntos,
} from '../components/Icons'

const DISPONIBILIDADES = ['Todos', 'Disponible', 'En préstamo']

// Tonos para las portadas que no tienen imagen real en Figma.
const TONOS = ['#6B1D2F', '#2B1810', '#3B2417', '#28744E', '#8A5A2B', '#1F3A5F', '#5C3A6B', '#7A2E2E']

function Portada({ libro }) {
  if (libro.portada) {
    return <img className="portada-img" src={libro.portada} alt={`Portada de ${libro.titulo}`} />
  }
  const tono = TONOS[libro.id % TONOS.length]
  return (
    <div className="portada-falsa" style={{ background: tono }}>
      <span className="portada-falsa-titulo">{libro.titulo}</span>
      <span className="portada-falsa-autor">{libro.autor}</span>
    </div>
  )
}

export default function Catalogo() {
  const { libros, setSeleccion } = useBiblioteca()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [disponibilidad, setDisponibilidad] = useState('Todos')
  const [vista, setVista] = useState('grid')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return libros.filter((l) => {
      if (q && ![l.titulo, l.autor, l.editorial, l.isbn].some((v) => v.toLowerCase().includes(q))) return false
      if (categoria !== 'Todos' && l.categoria !== categoria) return false
      if (disponibilidad === 'Disponible' && l.disponibles === 0) return false
      if (disponibilidad === 'En préstamo' && l.disponibles !== 0) return false
      return true
    })
  }, [busqueda, categoria, disponibilidad, libros])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const irA = (p) => setPagina(Math.max(1, Math.min(p, totalPaginas)))
  const desde = filtrados.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1
  const hasta = Math.min(paginaActual * POR_PAGINA, filtrados.length)

  const actualizar = (fn) => (e) => { fn(e.target.value); setPagina(1) }

  return (
    <main className="main">
      <header className="content-header">
        <div className="titles">
          <h1 className="main-title">Catálogo General de Libros</h1>
          <p className="subtitle">Biblioteca Escolar • Exploración y Disponibilidad del Fondo Bibliográfico</p>
        </div>
        <button className="btn btn-light"><IconPlus size={16} />Agregar Nuevo Libro</button>
      </header>

      <section className="card filtros">
        <div className="filtro">
          <label className="filtro-label" htmlFor="q">Buscar libro</label>
          <div className="campo campo-busqueda">
            <IconSearch size={18} />
            <input
              id="q"
              placeholder="Buscar por título, autor, ISBN o editorial..."
              value={busqueda}
              onChange={actualizar(setBusqueda)}
            />
          </div>
        </div>

        <div className="filtro">
          <label className="filtro-label" htmlFor="cat">Categoría / Género</label>
          <div className="campo">
            <select id="cat" value={categoria} onChange={actualizar(setCategoria)}>
              <option value="Todos">Todos</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <IconChevron size={18} />
          </div>
        </div>

        <div className="filtro">
          <label className="filtro-label" htmlFor="disp">Disponibilidad</label>
          <div className="campo">
            <select id="disp" value={disponibilidad} onChange={actualizar(setDisponibilidad)}>
              {DISPONIBILIDADES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <IconChevron size={18} />
          </div>
        </div>

        <div className="filtro filtro-vista">
          <span className="filtro-label">Vista</span>
          <div className="campo campo-vista">
            <button
              className={`toggle ${vista === 'grid' ? 'is-on' : ''}`}
              onClick={() => setVista('grid')}
              aria-label="Vista en cuadrícula"
            ><IconCuadricula size={18} /></button>
            <button
              className={`toggle ${vista === 'list' ? 'is-on' : ''}`}
              onClick={() => setVista('list')}
              aria-label="Vista en lista"
            ><IconLista size={18} /></button>
          </div>
        </div>
      </section>

      <section className="card cuadrícula">
        <div className="resumen">
          <div>
            <h2 className="card-title">Fondo Bibliográfico</h2>
            <p className="card-subtitle">
              Consulta la disponibilidad de cada ejemplar y registra préstamos directamente desde la ficha del libro.
            </p>
          </div>
          <span className="pill">{filtrados.length} libros en el catálogo</span>
        </div>

        <div className={`grilla ${vista === 'list' ? 'grilla-lista' : ''}`}>
          {visibles.map((l) => (
            <article className="libro" key={l.id}>
              <div className="portada"><Portada libro={l} /></div>
              <div className="libro-datos">
                <span className="categoria">{l.categoria.toUpperCase()}</span>
                <h3 className="libro-titulo">{l.titulo}</h3>
                <div className="libro-autor">{l.autor}</div>
                <div className="libro-editorial">
                  {l.editorial}
                  <span className="isbn">ISBN {l.isbn}</span>
                </div>
                <div className="libro-acciones">
                  {l.disponibles > 0 ? (
                    <span className="dispo">{l.disponibles} Disponibles</span>
                  ) : (
                    <span className="prestado">En Préstamo (0 disp.)</span>
                  )}
                  <button
                    className="btn btn-maron btn-sm"
                    disabled={l.disponibles === 0}
                    title={l.disponibles === 0 ? 'Sin ejemplares disponibles' : `Prestar ${l.titulo}`}
                    onClick={() => {
                      setSeleccion(l)
                      navegar('/')
                    }}
                  >
                    Prestar
                  </button>
                  <button
                    className="btn btn-outline btn-icon"
                    aria-label={`Ver ficha de ${l.titulo}`}
                    onClick={() => {
                      setBusqueda(l.isbn)
                    }}
                  >
                    <IconTresPuntos />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {visibles.length === 0 && (
            <p className="vacio">No hay libros que coincidan con la búsqueda.</p>
          )}
        </div>

        <div className="pie">
          <div className="paginacion">
            <button className="btn btn-outline" onClick={() => irA(paginaActual - 1)} disabled={paginaActual === 1}>
              <IconIzquierda />Anterior
            </button>
            <span className="pagina-texto">Página {paginaActual} de {totalPaginas}</span>
            <button className="btn btn-maron" onClick={() => irA(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
              Siguiente<IconDerecha />
            </button>
          </div>
          <div className="criterios">
            <span>Mostrando {desde}–{hasta} de {filtrados.length} libros</span>
            <span>Plazo: 14 días naturales • Multa: $ 100 por día de retraso</span>
          </div>
        </div>
      </section>
    </main>
  )
}