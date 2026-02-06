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
import RestablecerClave from "./components/RestablecerClave"; 
import MisPropuestas from "./components/MisPropuestas"; 
import PerfilUsuario from "./components/PerfilUsuario"; 

function AppContent() {
  const navigate = useNavigate();
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [fotoUsuario, setFotoUsuario] = useState(null); 
  const [queriaPublicar, setQueriaPublicar] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Función para armar la URL de la foto
  const construirUrlFoto = (usuario) => {
    if (!usuario) return null;
    // Si Julio manda la URL completa algún día, la usamos.
    if (usuario.foto_perfil_url) return usuario.foto_perfil_url;
    // Si manda el nombre del archivo, le pegamos la ruta del storage
    if (usuario.foto_perfil) {
      return `http://100.123.6.123:8000/storage/usuarios/${usuario.foto_perfil}`;
    }
    // Si no hay nada, mandamos la silueta por defecto desde el servidor
    return "http://100.123.6.123:8000/storage/usuarios/perfil.png";
  };

  // Recuperar sesión al cargar la App
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioGuardado) {
      // 1. Normalización de Rol
      if (usuarioGuardado.rol) {
        const rolNormalizado = usuarioGuardado.rol.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
        setRolUsuario(rolNormalizado);
      }
      
      // 2. Construcción de la foto
      setFotoUsuario(construirUrlFoto(usuarioGuardado));
    }
    setCargandoSesion(false);
  }, []);

  const manejarLoginExitoso = (rolRecibido) => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    const rolNormalizado = rolRecibido?.toLowerCase().includes('admin') ? 'admin' : 'colaborador';
    setRolUsuario(rolNormalizado);
    
    // Sincronizamos la foto armando la URL manualmente
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
          <Route path="/destino" element={<DetalleDestino sitio={sitioSeleccionado} />} />
          
          <Route 
            path="/publicar" 
            element={rolUsuario === 'colaborador' ? <FormularioPublicar /> : <Navigate to="/" replace />} 
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