import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TarjetaDestino from './TarjetaDestino';
import { API_URL } from '../config';
const VistaDepartamento = ({ onSeleccionarSitio }) => {
  const { nombreDepto } = useParams();
  const navigate = useNavigate();
  
  const [destinos, setDestinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('TODOS');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState('TODOS');

  useEffect(() => {
    if (nombreDepto.toLowerCase() !== 'la paz') {
        alert("Este departamento estará disponible próximamente.");
        navigate('/');
        return;
    }

    const obtenerDestinos = async () => {
      try {
        const url = `${API_URL}/api/publico/publicaciones/listar`;
        const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (resp.ok) {
          const data = await resp.json();
          const filtrados = data.filter(sitio => sitio.departamento.toLowerCase() === 'la paz');
          setDestinos(filtrados);
        }
      } catch (error) { console.error("Error:", error); } 
      finally { setCargando(false); }
    };
    obtenerDestinos();
  }, [nombreDepto, navigate]);

  const municipiosUnicos = ['TODOS', ...new Set(destinos.map(d => d.municipio))];
  const distritosDisponibles = ['TODOS', ...new Set(
    destinos
      .filter(d => municipioSeleccionado === 'TODOS' || d.municipio === municipioSeleccionado)
      .map(d => d.distrito)
  )];

  const destinosFiltrados = destinos.filter(d => {
    const cumpleMun = municipioSeleccionado === 'TODOS' || d.municipio === municipioSeleccionado;
    const cumpleDist = distritoSeleccionado === 'TODOS' || d.distrito === distritoSeleccionado;
    return cumpleMun && cumpleDist;
  });

  const manejarSeleccion = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/api/publico/publicaciones/detalles/${id}`);
      if (resp.ok) {
        const detalle = await resp.json();
        onSeleccionarSitio(detalle); // Aquí pasamos los datos a DetalleDestino
        navigate(`/destino/${id}`);
      }
    } catch (e) { alert("Error al cargar detalle"); }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-blue-900 animate-pulse">Cargando La Paz...</div>;

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500 italic">
      <div className="max-w-7xl mx-auto p-10">
        
        <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-slate-400 font-black mb-12 uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all">←</div>
          Volver
        </button>

        {/* --- RESEÑA HISTÓRICA (AHORA PRIMERO) --- */}
        <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl mb-20">
           <div className="relative z-10 space-y-8 max-w-4xl text-left">
              <div className="space-y-2">
                <span className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em]">Departamento de La Paz</span>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Tierra de Cultura y Mar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm leading-relaxed text-slate-300 font-medium italic">
                <p>
                  Fundado el <span className="text-white font-bold">21 de febrero de 1852</span>, su cabecera Zacatecoluca fue cuna del prócer <span className="text-white font-bold">José Simeón Cañas</span>. La Paz es el corazón logístico de El Salvador, uniendo la herencia de los Nonualcos con la modernidad del Aeropuerto Internacional.
                </p>
                <p>
                  Desde las cumbres del volcán de San Vicente hasta las extensas playas de la Costa del Sol, este departamento ofrece una mezcla única de historia añilera y paraísos tropicales.
                </p>
              </div>
           </div>
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </section>

        <header className="mb-12 text-left">
          <p className="text-blue-600 font-black uppercase text-sm tracking-widest mb-2">Destinos disponibles</p>
          <h1 className="text-[60px] md:text-[80px] font-black leading-none text-slate-900 uppercase tracking-tighter">Explora la zona</h1>
        </header>

        {/* --- FILTROS --- */}
        <div className="space-y-6 mb-16">
          <div className="flex flex-wrap gap-2">
            {municipiosUnicos.map(m => (
              <button 
                key={m} 
                onClick={() => { setMunicipioSeleccionado(m); setDistritoSeleccionado('TODOS'); }}
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase transition-all ${municipioSeleccionado === m ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-4">
            {distritosDisponibles.map(d => (
              <button 
                key={d} 
                onClick={() => setDistritoSeleccionado(d)}
                className={`px-5 py-2 rounded-xl font-bold text-[9px] uppercase transition-all ${distritoSeleccionado === d ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID DE DESTINOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {destinosFiltrados.map((sitio) => (
            <div key={sitio.idpublicacion} onClick={() => manejarSeleccion(sitio.idpublicacion)} className="cursor-pointer">
              <TarjetaDestino 
                titulo={sitio.nombre}
                categoria={sitio.distrito}
                etiquetas={[sitio.municipio]}
                imagen={sitio.imagen ? `${API_URL}/storage/preformularios/${sitio.imagen}` : null}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VistaDepartamento;