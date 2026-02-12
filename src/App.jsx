import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; 
import Home from "./pages/Home";
import VistaDepartamento from "./components/VistaDepartamento";
import FormularioPublicar from "./components/FormularioPublicar";
import FormularioEditar from "./components/FormularioEditar"; 
import DetalleDestino from "./components/DetalleDestino";
import Navbar from "./components/Navbar";
import Login from "./components/Login"; 
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard"; 
import AnalisisDestino from "./components/AnalisisDestino"; 
import RestablecerClave from "./components/RestablecerClave"; 
import MisPropuestas from "./components/MisPropuestas"; 
import PerfilUsuario from "./components/PerfilUsuario"; 

// --- NUEVO IMPORT DE LA VISTA DEL ADMIN ---
import AdminDetalleSitio from "./components/AdminDetalleSitio";

function AppContent() {
  const navigate = useNavigate();
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [fotoUsuario, setFotoUsuario] = useState(null); 
  const [queriaPublicar, setQueriaPublicar] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const API_BASE_URL = "http://100.123.6.123:8000"; 

  const construirUrlFoto = (usuario) => {
    if (!usuario) return null;
    if (usuario.foto_perfil_url) return usuario.foto_perfil_url;
    if (usuario.foto_perfil) {
      return `${API_BASE_URL}/storage/usuarios/${usuario.foto_perfil}`;
    }
    return `${API_BASE_URL}/storage/usuarios/perfil.png`;
  };

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioGuardado) {
      if (usuarioGuardado.rol) {
        const rolNormalizado = usuarioGuardado.rol.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
        setRolUsuario(rolNormalizado);
      }
      setFotoUsuario(construirUrlFoto(usuarioGuardado));
    }
    setCargandoSesion(false);
  }, []);

  const manejarLoginExitoso = (rolRecibido) => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    const rolNormalizado = rolRecibido?.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
    setRolUsuario(rolNormalizado);
    setFotoUsuario(construirUrlFoto(usuarioGuardado));
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
      await fetch(`${API_BASE_URL}/api/logout`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem('usuarioLogueado');
      setRolUsuario(null);
      setFotoUsuario(null); 
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

  if (cargandoSesion) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-left">
      <Navbar 
        key={fotoUsuario} 
        alClickIngresar={() => { setQueriaPublicar(false); setMostrarLogin(true); }} 
        isLogged={!!rolUsuario} 
        rol={rolUsuario} 
        foto={fotoUsuario} 
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
          
          <Route path="/destino" element={sitioSeleccionado ? <DetalleDestino sitio={sitioSeleccionado} /> : <Navigate to="/" replace />} />
          
          <Route 
            path="/publicar" 
            element={rolUsuario === 'colaborador' ? <FormularioPublicar /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/editar/:id" 
            element={rolUsuario === 'colaborador' ? <FormularioEditar /> : <Navigate to="/" replace />} 
          />
          
          <Route 
            path="/mis-propuestas" 
            element={rolUsuario === 'colaborador' ? <MisPropuestas /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/perfil" 
            element={rolUsuario ? <PerfilUsuario foto={fotoUsuario} /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/dashboard" 
            element={rolUsuario === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />

          {/* --- NUEVA RUTA: VISTA DE DETALLE DEL ADMIN --- */}
          <Route 
            path="/admin/sitio/:id" 
            element={rolUsuario === 'admin' ? <AdminDetalleSitio /> : <Navigate to="/" replace />} 
          />

          <Route 
            path="/dashboard/analizar/:id" 
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