import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TarjetaDestino from './TarjetaDestino';
import { API_URL } from '../config';
import { infoDepartamentos } from '../data/InfoDepartamentos';
import { descripcionesDistritos } from '../data/InfoDistritos';

// 🔥 RECIBIMOS LA NUEVA PROP "alIntentarPublicar"
const VistaDepartamento = ({ onSeleccionarSitio, alIntentarPublicar }) => {
  const { nombreDepto } = useParams();
  const navigate = useNavigate();
  
  const [destinos, setDestinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('TODOS');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState('TODOS');

  const infoLocal = infoDepartamentos[nombreDepto] || {
      titulo: "Tierra por Explorar",
      descripcion1: `El departamento de ${nombreDepto} está lleno de maravillas por descubrir.`,
      descripcion2: "Pronto agregaremos más información histórica y cultural sobre esta hermosa zona de El Salvador."
  };

  useEffect(() => {
    const obtenerDestinos = async () => {
      try {
        const url = `${API_URL}/api/publico/publicaciones/listar`;
        const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (resp.ok) {
          const data = await resp.json();
          const filtrados = data.filter(sitio => sitio.departamento.toLowerCase() === nombreDepto.toLowerCase());
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
        onSeleccionarSitio(detalle); 
        navigate(`/destino/${id}`);
      }
    } catch (e) { alert("Error al cargar detalle"); }
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500 italic">
      <div className="max-w-7xl mx-auto p-10">
        
        <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-slate-400 font-black mb-10 uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all">←</div>
          Volver a inicio
        </button>

        <section className="bg-slate-900 rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl mb-20">
           <div className="relative z-10 space-y-6 max-w-5xl text-left">
              <div className="space-y-2">
                <span className="text-blue-400 font-black uppercase text-sm md:text-base tracking-[0.2em] block">
                    Departamento de {nombreDepto}
                </span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-md">
                    {infoLocal.titulo}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base leading-relaxed text-slate-300 font-medium italic pt-4 border-t border-white/10">
                <p dangerouslySetInnerHTML={{ __html: infoLocal.descripcion1 }}></p>
                <p dangerouslySetInnerHTML={{ __html: infoLocal.descripcion2 }}></p>
              </div>
           </div>
           <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        </section>

        <header className="mb-10 text-left">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-full mb-4 shadow-sm border border-blue-100">
              Destinos Disponibles
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter italic">
              Explora la Zona
          </h2>
        </header>

        <div className="space-y-5 mb-8">
          <div className="flex flex-wrap gap-2">
            {municipiosUnicos.map(m => (
              <button 
                key={m} 
                onClick={() => { setMunicipioSeleccionado(m); setDistritoSeleccionado('TODOS'); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase transition-all ${municipioSeleccionado === m ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {distritosDisponibles.map(d => (
              <button 
                key={d} 
                onClick={() => setDistritoSeleccionado(d)}
                className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${distritoSeleccionado === d ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100 mb-12 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-blue-800 font-black text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
                {distritoSeleccionado === 'TODOS' ? 'Visión General de la Zona' : `Acerca de ${distritoSeleccionado}`}
            </h4>
            <p className="text-slate-600 font-medium italic leading-relaxed text-sm">
                {distritoSeleccionado === 'TODOS' 
                    ? `Actualmente estás explorando los destinos más destacados de ${municipioSeleccionado === 'TODOS' ? 'todo el departamento' : municipioSeleccionado}. Selecciona un distrito específico arriba para conocer más sobre su historia y atractivos.`
                    : (descripcionesDistritos[distritoSeleccionado] || `Descubre los rincones únicos, impresionantes paisajes y la profunda riqueza cultural que ofrece el distrito de ${distritoSeleccionado}. Un lugar perfecto para tu próxima aventura salvadoreña.`)
                }
            </p>
        </div>

        {destinosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {destinosFiltrados.map((sitio) => (
                <div key={sitio.idpublicacion} onClick={() => manejarSeleccion(sitio.idpublicacion)} className="cursor-pointer">
                  <TarjetaDestino 
                    titulo={sitio.nombre}
                    categoria={sitio.distrito}
                    etiquetas={[sitio.municipio]}
                    // Si tu TarjetaDestino ya maneja bien las rutas, esto queda intacto.
                    imagen={sitio.imagen} 
                  />
                </div>
              ))}
            </div>
        ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center animate-in zoom-in-95 duration-500">
                <span className="text-6xl mb-6 block drop-shadow-md">🗺️</span>
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4 italic">Vaya, este lugar aún es un misterio</h3>
                <p className="text-slate-500 font-bold text-sm mb-10 max-w-lg mx-auto">
                    Actualmente no hay ningún destino turístico registrado en {distritoSeleccionado !== 'TODOS' ? distritoSeleccionado : nombreDepto}. ¿Conoces algún lugar increíble que todos deberían visitar? ¡Qué esperas para compartirlo con el mundo!
                </p>
                {/* 🔥 Y AQUÍ USAMOS LA FUNCIÓN PARA QUE LE PIDA LOGIN PRIMERO */}
                <button 
                    onClick={alIntentarPublicar} 
                    className="bg-green-500 hover:bg-green-600 text-white font-black text-[11px] px-10 py-5 rounded-[2rem] uppercase tracking-widest shadow-xl shadow-green-200 hover:scale-105 transition-all active:scale-95"
                >
                    + Publicar Nuevo Sitio
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default VistaDepartamento;