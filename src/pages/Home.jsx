import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos
import MapaInteractivo from "../components/MapaInteractivo";
import { departamentos } from "../data/departamentos";

export default function Home() {
  const navigate = useNavigate();
  const [mostrarMapa, setMostrarMapa] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [deptoResaltado, setDeptoResaltado] = useState(null);

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
    <main className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <section className="text-center space-y-6 pt-10">
        <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Explora El Salvador</h2>
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

      {/* Buscador y Grid */}
      <div className="max-w-md mx-auto sticky top-20 z-40 px-4">
        <input type="text" placeholder="Buscar por nombre o zona..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-medium" />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {departamentosFiltrados.map((depto) => {
          const idParaDOM = depto.nombre.toLowerCase().replace(/\s+/g, '_');
          return (
            <div key={depto.id} id={idParaDOM} className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-500 ${deptoResaltado === idParaDOM ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'}`}>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{depto.zona}</span>
              <h3 className="text-xl font-bold mt-1 text-slate-800">{depto.nombre}</h3>
              <button 
                onClick={() => navigate(`/departamento/${depto.nombre}`)}
                className="mt-4 flex items-center text-sm font-bold text-blue-600 hover:translate-x-1 transition-transform"
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