import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import MapaInteractivo from "../components/MapaInteractivo";
import { departamentos } from "../data/departamentos";
import { API_URL } from '../config';

export default function Home() {
  const navigate = useNavigate();
  const [mostrarMapa, setMostrarMapa] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [deptoResaltado, setDeptoResaltado] = useState(null);
  
  // Esto son LOS CONTADORES para cada departamento
  const [conteoSitios, setConteoSitios] = useState({});

  // ==========================================
  // CONFIGURACIÓN DE REALCE REVERSIBLE
  // ==========================================
  const REALCE_LA_PAZ = true; 

  useEffect(() => {
    const obtenerConteoDestinos = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/publico/publicaciones/listar`);
        if (respuesta.ok) {
          const data = await respuesta.json();
          
          //  objeto para contar. Ej: { "La Paz": 3, "Santa Ana": 1 }
          const contadores = {};
          data.forEach(sitio => {
            if (sitio.departamento) {
              contadores[sitio.departamento] = (contadores[sitio.departamento] || 0) + 1;
            }
          });
          
          setConteoSitios(contadores);
        }
      } catch (error) {
        console.error("Error al obtener los sitios para el contador:", error);
      }
    };

    obtenerConteoDestinos();
  }, []);

  const departamentosFiltrados = departamentos.filter((depto) =>
    depto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    depto.zona.toLowerCase().includes(busqueda.toLowerCase())
  );

  const ejecutarScroll = (nombre) => {
    const idFormateado = nombre.toLowerCase().replace(/\s+/g, '_');
    const elemento = document.getElementById(idFormateado);
    if (elemento) {
      const offset = 120;
      const elementPosition = elemento.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setDeptoResaltado(idFormateado);
      setTimeout(() => setDeptoResaltado(null), 2000);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 italic">
      <section className="text-center space-y-6 pt-10">
        <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Explora El Salvador</h2>
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Explora los lugares turísticos del departamento de <span className={REALCE_LA_PAZ ? "text-amber-500 underline decoration-amber-300" : ""}>La Paz</span>
        </h3>
        
        <div className="max-w-4xl mx-auto relative group">
          <button onClick={() => setMostrarMapa(!mostrarMapa)} className="absolute top-2 right-2 z-30 bg-white shadow-md border border-slate-100 p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-500 ${mostrarMapa ? '' : 'rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-700 ease-in-out bg-white rounded-[2rem] ${mostrarMapa ? 'max-h-[900px] opacity-100 pt-12 pb-4 px-4 border border-slate-50 shadow-inner' : 'max-h-0 opacity-0 border-transparent'}`}>
            <MapaInteractivo onSelectDepto={ejecutarScroll} />
          </div>
        </div>
      </section>

      <div className="max-w-md mx-auto sticky top-20 z-40 px-4">
        <input type="text" placeholder="Buscar por nombre o zona..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-4 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all" />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {departamentosFiltrados.map((depto) => {
          const idParaDOM = depto.nombre.toLowerCase().replace(/\s+/g, '_');
          const esLaPazDestacado = REALCE_LA_PAZ && depto.nombre === "La Paz";
          
          // Obtenemos la cantidad, si no existe es 0
          const cantidad = conteoSitios[depto.nombre] || 0;
          
          return (
            <div 
                key={depto.id} 
                id={idParaDOM} 
                className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-500 hover:shadow-lg group relative flex flex-col
                ${deptoResaltado === idParaDOM ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'}
                ${esLaPazDestacado ? 'border-amber-400 ring-2 ring-amber-100 shadow-amber-100 -translate-y-1 scale-[1.03] bg-gradient-to-b from-amber-50/20 to-white' : ''}
                `}
            >
              {esLaPazDestacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-bounce">
                  ✨ Destacado ✨
                </span>
              )}

              {/* Zona y Contador alineados horizontalmente */}
              <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${esLaPazDestacado ? 'text-amber-600' : 'text-blue-500'}`}>
                    {depto.zona}
                  </span>
                  
                  {/* EL CONTADOR CHIQUITITO */}
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full tracking-wider ${esLaPazDestacado ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {cantidad} {cantidad === 1 ? 'sitio' : 'sitios'}
                  </span>
              </div>
              
              <h3 className={`text-xl font-bold transition-colors flex-grow ${esLaPazDestacado ? 'text-amber-800' : 'text-slate-800 group-hover:text-blue-600'}`}>
                {depto.nombre}
              </h3>
              
              <button 
                onClick={() => navigate(`/departamento/${depto.nombre}`)}
                className={`mt-4 flex items-center text-sm font-bold transition-all hover:translate-x-1 ${esLaPazDestacado ? 'text-amber-600 hover:text-amber-800' : 'text-blue-600 hover:text-blue-800'}`}
              >
                Ver destinos <span className="ml-1">→</span>
              </button>
            </div>
          );
        })}
      </section>
    </main>
  );
}