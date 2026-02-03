import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // Se agregó useEffect
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard"; 
import AnalisisDestino from "./components/AnalisisDestino"; 
import RestablecerClave from "./components/RestablecerClave"; 

function AppContent() {
  const navigate = useNavigate();
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [queriaPublicar, setQueriaPublicar] = useState(false);

  // NUEVO: Recuperar sesión al cargar la App para no perder el rol
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioGuardado && usuarioGuardado.rol) {
      // Normalizamos el rol guardado
      const rolNormalizado = usuarioGuardado.rol.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
      setRolUsuario(rolNormalizado);
    }
  }, []);

  const manejarLoginExitoso = (rolRecibido) => {
    const rolNormalizado = rolRecibido?.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
    
    setRolUsuario(rolNormalizado);
    setMostrarLogin(false);
    
    if (queriaPublicar) {
      setQueriaPublicar(false);
      navigate("/publicar");
    } else if (rolNormalizado === 'admin') {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const manejarCerrarSesion = async () => {
    try {
      await fetch('http://100.123.6.123:8000/api/logout', { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem('usuarioLogueado');
      setRolUsuario(null);
      navigate("/"); 
    }
  };

  const intentarPublicar = () => {
    if (rolUsuario) {
      navigate("/publicar");
    } else {
      setQueriaPublicar(true);
      setMostrarLogin(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-left">
      <Navbar 
        alClickIngresar={() => { setQueriaPublicar(false); setMostrarLogin(true); }} 
        isLogged={!!rolUsuario} 
        rol={rolUsuario} 
        alCerrarSesion={manejarCerrarSesion}
        alClickPublicar={intentarPublicar} 
      />

      {mostrarLogin && (
        <Login 
          alEntrar={manejarLoginExitoso} 
          alCerrar={() => { setMostrarLogin(false); setQueriaPublicar(false); }} 
        />
      )}

      <div className="flex-grow"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departamento/:nombreDepto" element={<VistaDepartamento onSeleccionarSitio={setSitioSeleccionado} />} />
          <Route path="/destino" element={<DetalleDestino sitio={sitioSeleccionado} />} />
          
          <Route 
            path="/publicar" 
            element={rolUsuario ? <FormularioPublicar /> : <Navigate to="/" replace />} 
          />
          
          <Route 
            path="/dashboard" 
            element={rolUsuario === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/dashboard/analizar" 
            element={rolUsuario === 'admin' ? <AnalisisDestino /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/restablecer" 
            element={<RestablecerClave alTerminar={() => setMostrarLogin(true)} />} 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
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