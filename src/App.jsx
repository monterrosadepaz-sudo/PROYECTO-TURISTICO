import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard"; 
import AnalisisDestino from "./components/AnalisisDestino"; 
import SuperDashboard from "./components/SuperDashboard"; // PANEL DEL SUPER USUARIO

function AppContent() {
  const navigate = useNavigate();
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  
  // Estado para el Rol ('admin', 'super' o null)
  const [rolUsuario, setRolUsuario] = useState(null);

  const manejarLoginExitoso = (rolRecibido) => {
    setRolUsuario(rolRecibido);
    setMostrarLogin(false);
    
    // Redirección inteligente según nivel de acceso
    if (rolRecibido === 'super') {
      navigate("/super-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const manejarCerrarSesion = () => {
    setRolUsuario(null);
    navigate("/"); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-left">
      <Navbar 
        alClickIngresar={() => setMostrarLogin(true)} 
        isLogged={!!rolUsuario} 
        rol={rolUsuario} 
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
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/departamento/:nombreDepto" element={<VistaDepartamento onSeleccionarSitio={setSitioSeleccionado} />} />
          <Route path="/destino" element={<DetalleDestino sitio={sitioSeleccionado} />} />
          <Route path="/publicar" element={<FormularioPublicar />} />
          
          {/* RUTA DE ADMINISTRADOR (Accesible también para Super Usuario) */}
          <Route 
            path="/dashboard" 
            element={
              rolUsuario === 'admin' || rolUsuario === 'super' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* RUTA DE SUPER USUARIO (Panel Maestro) */}
          <Route 
            path="/super-dashboard" 
            element={
              rolUsuario === 'super' ? (
                <SuperDashboard /> // 2. COMPONENTE REAL VINCULADO
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          <Route 
            path="/dashboard/analizar" 
            element={
              rolUsuario === 'admin' || rolUsuario === 'super' ? (
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