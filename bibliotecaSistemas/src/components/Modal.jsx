import { useEffect } from 'react'
import { IconCerrar } from './Icons'

/** Modal chico y genérico: cierre con Escape, con el overlay o con la X. */
export default function Modal({ titulo, subtitulo, children, onCerrar, ancho = 560 }) {
  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="modal" style={{ maxWidth: ancho }} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-head">
          <div>
            <h2 className="modal-titulo">{titulo}</h2>
            {subtitulo && <p className="modal-sub">{subtitulo}</p>}
          </div>
          <button type="button" className="btn btn-outline btn-icon modal-x" onClick={onCerrar} aria-label="Cerrar">
            <IconCerrar />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}