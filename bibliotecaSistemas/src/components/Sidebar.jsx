import { NavLink } from 'react-router-dom'
import { IconPanel, IconLibro, IconHistorial, IconConfig } from './Icons'
import avatar from '../assets/avatar.png'
import emblema from '../assets/emblema.png'

const ENLACES = [
  { to: '/', label: 'Panel Principal', Icon: IconPanel, exact: true },
  { to: '/catalogo', label: 'Catálogo de Libros', Icon: IconLibro },
  { to: '/historial', label: 'Historial General', Icon: IconHistorial },
  { to: '/configuracion', label: 'Configuración', Icon: IconConfig },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <img className="brand-logo" src={emblema} alt="" />
          <div className="brand-text">
            <div className="brand-title">Col. San Martín</div>
            <div className="brand-subtitle">Biblioteca Escolar</div>
          </div>
        </div>

        <nav className="nav-menu">
          {ENLACES.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-sep" />
        <div className="user">
          <img className="avatar" src={avatar} alt="" />
          <div className="user-text">
            <div className="user-name">Prof. M. Belgrano</div>
            <div className="user-role">Bibliotecario Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}