import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 

function App() {
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  const manejarLoginExitoso = () => {
    setUsuarioAutenticado(true);
    setMostrarLogin(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar 
          alClickIngresar={() => setMostrarLogin(true)} 
          isLogged={usuarioAutenticado}
          alCerrarSesion={() => setUsuarioAutenticado(false)}
        />

        {mostrarLogin && (
          <Login 
            alEntrar={manejarLoginExitoso} 
            alCerrar={() => setMostrarLogin(false)} 
          />
        )}

        <Routes>
          {/* Ruta Principal */}
          <Route path="/" element={<Home />} />

          {/* Ruta de Departamento con parámetro dinámico :nombreDepto */}
          <Route path="/departamento/:nombreDepto" element={
            <VistaDepartamento onSeleccionarSitio={setSitioSeleccionado} />
          } />

          {/* Ruta de Detalle */}
          <Route path="/destino" element={
            <DetalleDestino sitio={sitioSeleccionado} />
          } />

          {/* Ruta de Publicar */}
          <Route path="/publicar" element={<FormularioPublicar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;