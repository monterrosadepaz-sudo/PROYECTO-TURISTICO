import { useNavigate } from "react-router-dom";

export default function Navbar({ alClickIngresar, isLogged, rol, alCerrarSesion }) { 
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
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
          {/* MOSTRAR SEGÚN ROL */}
          {isLogged && (
            <div className="flex items-center gap-4 mr-2 border-r border-blue-700 pr-4">
              {/* Botón que solo ve el Super Usuario */}
              {rol === 'super' && (
                <button 
                  onClick={() => navigate("/super-dashboard")}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300"
                >
                   Sistema
                </button>
              )}
              
              {/* Botón que ven ambos (Admin y Super) */}
              {(rol === 'admin' || rol === 'super') && (
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white"
                >
                  Propuestas
                </button>
              )}
            </div>
          )}

          {isLogged ? (
            <button onClick={alCerrarSesion} className="text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-red-100 transition-colors">
              Salir
            </button>
          ) : (
            <button onClick={alClickIngresar} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors border-r border-blue-700 pr-4">
              Ingresar
            </button>
          )}

          <button 
            onClick={() => navigate("/publicar")}
            className="bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg text-xs uppercase tracking-tight"
          >
            + Publicar Sitio
          </button>
        </div>
      </div>
    </nav>
  );
}