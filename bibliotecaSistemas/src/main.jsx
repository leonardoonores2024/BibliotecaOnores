import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BibliotecaProvider } from './context/BibliotecaContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BibliotecaProvider>
        <App />
      </BibliotecaProvider>
    </BrowserRouter>
  </StrictMode>,
)