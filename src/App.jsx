import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 
import Footer from "./components/Footer"; // 1. Importamos el nuevo componente

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
      <div className="flex flex-col min-h-screen bg-slate-50"> {/* Agregué flex y flex-col */}
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

        {/* 2. Contenedor principal con flex-grow para que el footer siempre baje */}
        <div className="flex-grow"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/departamento/:nombreDepto" element={
              <VistaDepartamento onSeleccionarSitio={setSitioSeleccionado} />
            } />
            <Route path="/destino" element={
              <DetalleDestino sitio={sitioSeleccionado} />
            } />
            <Route path="/publicar" element={<FormularioPublicar />} />
          </Routes>
        </div>

        {/* 3. El Footer se renderiza en todas las vistas */}
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;