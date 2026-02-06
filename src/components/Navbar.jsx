import { useNavigate } from "react-router-dom";

export default function Navbar({ alClickIngresar, isLogged, rol, alCerrarSesion, alClickPublicar, foto }) { 
  const navigate = useNavigate();

  // Obtenemos datos básicos para el nombre del storage
  const datosUsuario = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
  const nombreBienvenida = datosUsuario.nombre || "";
  
  const obtenerRutaAvatar = () => {
    // CONFIANZA TOTAL: Solo usamos lo que viene por props o storage.
    // Eliminamos la constante FOTO_RESPALDO_TECNICO para no intervenir.
    return foto || datosUsuario.foto_perfil_url || datosUsuario.foto;
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50 italic">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
          <div className="flex flex-col w-8 h-5 border border-blue-900 rounded-sm overflow-hidden shadow-sm">
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
            <div className="bg-white h-1/3 w-full"></div>
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">
            Turismo<span className="text-blue-300 ml-1">SV</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          
          {/* SECCIÓN DE USUARIO LOGUEADO */}
          {isLogged && (
            <div className="hidden md:flex items-center gap-4 mr-4 border-r border-blue-700 pr-4">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">
                  Sesión Activa
                </span>
                <button 
                  onClick={() => navigate("/perfil")}
                  className="text-xs font-bold uppercase not-italic hover:text-blue-200 transition-colors group"
                >
                  Bienvenido, <span className="text-white font-black italic group-hover:underline">{nombreBienvenida}</span>
                </button>
              </div>
              
              {/* Círculo de foto dinámico - Dependencia absoluta del servidor */}
              <div 
                onClick={() => navigate("/perfil")}
                className="w-10 h-10 rounded-full border-2 border-blue-400 overflow-hidden cursor-pointer hover:border-white hover:scale-110 transition-all bg-slate-200 shadow-lg"
              >
                <img 
                  src={obtenerRutaAvatar()} 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                  // Hemos quitado el onError para dejar de "parchar" el error de Julio
                />
              </div>
            </div>
          )}

          {/* Botones de navegación (Propuestas / Dashboard) */}
          {isLogged && rol === 'colaborador' && (
            <button onClick={() => navigate("/mis-propuestas")} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors mr-2">
              Mis Propuestas
            </button>
          )}

          {isLogged && rol === 'admin' && (
            <button onClick={() => navigate("/dashboard")} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white mr-2">
              Panel Control
            </button>
          )}

          {/* Estado de Sesión */}
          {isLogged ? (
            <button onClick={alCerrarSesion} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-200 transition-colors border-l border-blue-700 pl-4">
              Salir
            </button>
          ) : (
            <button onClick={alClickIngresar} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors border-r border-blue-700 pr-4">
              Ingresar
            </button>
          )}

          {(!rol || rol === 'colaborador') && (
            <button onClick={alClickPublicar} className="bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg text-xs uppercase tracking-tight">
              + Publicar Sitio
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}