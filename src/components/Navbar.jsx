import { useNavigate } from "react-router-dom";

export default function Navbar({ alClickIngresar, isLogged, rol, alCerrarSesion, alClickPublicar }) { 
  const navigate = useNavigate();

  // EXTRAER NOMBRE REAL: Obtenemos el nombre guardado en el login
  // Si por alguna razón no está, usamos un respaldo vacío
  const datosUsuario = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
  const nombreBienvenida = datosUsuario.nombre || "";

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50 italic">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo que lleva al Home */}
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
          
          {/* NUEVO: MENSAJE DE BIENVENIDA PERSONALIZADO */}
          {isLogged && (
            <div className="hidden md:flex flex-col items-end mr-4 leading-none">
              <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">
                Sesión Activa
              </span>
              <p className="text-xs font-bold uppercase not-italic">
                Bienvenido, <span className="text-white font-black italic">{nombreBienvenida}</span>
                <span className="ml-2 text-[9px] bg-blue-700 px-2 py-0.5 rounded-full text-blue-200">
                  {rol === 'admin' ? 'ADMIN' : 'COLABORADOR'}
                </span>
              </p>
            </div>
          )}

          {/* SECCIÓN DE ADMINISTRACIÓN */}
          {isLogged && rol === 'admin' && (
            <div className="flex items-center gap-4 mr-2 border-r border-blue-700 pr-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white"
              >
                Panel Control
              </button>
            </div>
          )}

          {/* ESTADO DE SESIÓN */}
          {isLogged ? (
            <button onClick={alCerrarSesion} className="text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-red-100 transition-colors">
              Salir
            </button>
          ) : (
            <button onClick={alClickIngresar} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors border-r border-blue-700 pr-4">
              Ingresar
            </button>
          )}

          {/* BOTÓN DE PUBLICAR (Solo para colaboradores o no logueados) */}
          {(!rol || rol === 'colaborador') && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                alClickPublicar(); 
              }}
              className="bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg text-xs uppercase tracking-tight"
            >
              + Publicar Sitio
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}