import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard"; 
import AnalisisDestino from "./components/AnalisisDestino"; 

function AppContent() {
  const navigate = useNavigate();
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  // CORRECCIÓN: Eliminamos el useEffect que forzaba la redirección constante a /dashboard
  // Ahora la navegación se maneja manualmente en manejarLoginExitoso

  const manejarLoginExitoso = () => {
    setUsuarioAutenticado(true);
    setMostrarLogin(false);
    navigate("/dashboard"); // Redirigir solo al momento del login exitoso
  };

  const manejarCerrarSesion = () => {
    setUsuarioAutenticado(false);
    navigate("/"); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-left">
      <Navbar 
        alClickIngresar={() => setMostrarLogin(true)} 
        isLogged={usuarioAutenticado}
        alCerrarSesion={manejarCerrarSesion}
      />

      {mostrarLogin && (
        <Login 
          alEntrar={manejarLoginExitoso} 
          alCerrar={() => setMostrarLogin(false)} 
        />
      )}

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
          
          <Route 
            path="/dashboard" 
            element={
              usuarioAutenticado ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          <Route 
            path="/dashboard/analizar" 
            element={
              usuarioAutenticado ? (
                <AnalisisDestino />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>

      <Footer /> 
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}