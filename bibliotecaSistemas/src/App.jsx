import React, { useState } from 'react';
import './styles.css';

// SVG Icons
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

export default function App() {
  const [alumno, setAlumno] = useState('');
  const [curso, setCurso] = useState('');
  const [libro, setLibro] = useState('');
  const [fecha, setFecha] = useState('');

  const [prestamos, setPrestamos] = useState([
    { id: 1, alumno: 'Tomás Giménez', curso: '4to Año A', libro: 'Rayuela', fecha: '24 Oct 2024', estado: 'Entregado', clase: 'status-entregado' },
    { id: 2, alumno: 'Valentina Ortiz', curso: '6to Año B', libro: 'Don Quijote', fecha: '23 Oct 2024', estado: 'En Préstamo', clase: 'status-prestamo' },
    { id: 3, alumno: 'Mateo Silva', curso: '3er Año C', libro: 'El Principito', fecha: '18 Oct 2024', estado: 'Vencido', clase: 'status-vencido' },
    { id: 4, alumno: 'Camila Franco', curso: '5to Año A', libro: 'Fahrenheit 451', fecha: '22 Oct 2024', estado: 'Entregado', clase: 'status-entregado' },
    { id: 5, alumno: 'Bautista Herrera', curso: '2do Año B', libro: 'La Sombra del Viento', fecha: '21 Oct 2024', estado: 'En Préstamo', clase: 'status-prestamo' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alumno || !libro) return;

    const nuevoPrestamo = {
      id: Date.now(),
      alumno: alumno,
      curso: curso || '1er Año',
      libro: libro,
      fecha: fecha || 'Hoy',
      estado: 'En Préstamo',
      clase: 'status-prestamo'
    };

    setPrestamos([nuevoPrestamo, ...prestamos]);
    setAlumno('');
    setCurso('');
    setLibro('');
    setFecha('');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">
              <BookIcon />
            </div>
            <div>
              <div className="brand-title">Col. San Martín</div>
              <div className="brand-subtitle">Biblioteca Escolar</div>
            </div>
          </div>

          <nav className="nav-menu">
            <a href="#" className="nav-item active">
              <DashboardIcon /> Panel Principal
            </a>
            <a href="#" className="nav-item">
              <BookIcon /> Préstamos de Libros
            </a>
            <a href="#" className="nav-item">
              <BookIcon /> Catálogo de Libros
            </a>
            <a href="#" className="nav-item">
              <ClockIcon /> Historial General
            </a>
            <a href="#" className="nav-item">
              <SettingsIcon /> Configuración
            </a>
          </nav>
        </div>

        <div className="user-profile">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Usuario" className="avatar" />
          <div>
            <div className="user-name">Prof. M. Belgrano</div>
            <div className="user-role">Bibliotecario Administrador</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="header-title">Gestión de Préstamos</h1>
            <p className="header-subtitle">Biblioteca Escolar • Panel de Control General</p>
          </div>
          <button className="btn-history">
            <ClockIcon /> Ver Historial
          </button>
        </header>

        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Préstamos de Libros</span>
              <span className="metric-icon"><BookIcon /></span>
            </div>
            <div className="metric-body">
              <span className="metric-value">34</span>
              <span className="badge badge-pink">Hoy +4</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Libros en Préstamo</span>
              <span className="metric-icon"><BookIcon /></span>
            </div>
            <div className="metric-body">
              <span className="metric-value">18</span>
              <span className="badge badge-gray">Estable</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Devoluciones Pendientes</span>
              <span className="metric-icon"><ClockIcon /></span>
            </div>
            <div className="metric-body">
              <span className="metric-value">7</span>
              <span className="badge badge-gray">Esta semana</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Libros Vencidos</span>
              <span className="metric-icon"><AlertIcon /></span>
            </div>
            <div className="metric-body">
              <span className="metric-value">2</span>
              <span className="badge badge-red">Atención</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-grid">
          {/* Form */}
          <section className="card">
            <h2 className="card-title">Registrar Nuevo Préstamo</h2>
            <p className="card-subtitle">Complete los campos para asignar un libro o recurso bibliográfico.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre y Apellido del Alumno</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Sofía Rodríguez"
                  value={alumno}
                  onChange={(e) => setAlumno(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Curso / Año</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 5to Año Ciencias Naturales"
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código ISBN / Título del Libro</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Cien años de soledad / ISBN-978-3-16"
                  value={libro}
                  onChange={(e) => setLibro(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Devolución Estimada</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DD / MM / AAAA"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-submit">
                <PlusCircleIcon /> Registrar Préstamo
              </button>
            </form>
          </section>

          {/* Table */}
          <section className="card">
            <div className="card-header-flex">
              <div>
                <h2 className="card-title">Actividad Reciente de Préstamos</h2>
                <p className="card-subtitle" style={{ marginBottom: 0 }}>Últimos movimientos registrados en el sistema</p>
              </div>
              <button className="btn-link">Ver todos</button>
            </div>

            <div className="table-container">
              <div className="table-header">
                <span>Alumno</span>
                <span>Libro / Editorial</span>
                <span>Fecha</span>
                <span>Estado</span>
                <span></span>
              </div>

              {prestamos.map((item) => (
                <div key={item.id} className="table-row">
                  <div>
                    <div className="student-name">{item.alumno}</div>
                    <div className="student-course">{item.curso}</div>
                  </div>
                  <div className="book-title">{item.libro}</div>
                  <div className="date">{item.fecha}</div>
                  <div>
                    <span className={`status-badge ${item.clase}`}>{item.estado}</span>
                  </div>
                  <div className="more-options">•••</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}