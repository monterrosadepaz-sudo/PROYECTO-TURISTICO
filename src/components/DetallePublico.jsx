import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapaFormulario from './MapaFormulario'; // Reutilizamos tu componente de mapa

export default function DetallePublico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados para galería y zoom
  const [fotoActual, setFotoActual] = useState(0);
  const [fotoZoom, setFotoZoom] = useState(null);

  useEffect(() => {
    const cargarDestino = async () => {
      try {
        const url = `http://100.123.6.123:8000/api/publico/publicaciones/detalles/${id}`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          
          const parseExtremo = (campo) => {
            if (!campo || campo === "null") return {};
            if (typeof campo === 'object') return campo;
            try {
                let limpia = campo.replace(/\\"/g, '"').replace(/^"|"$/g, '');
                return JSON.parse(limpia);
            } catch (e) { return {}; }
          };

          setSitio({
            ...data,
            politicas: parseExtremo(data.politicas),
            horarios: parseExtremo(data.horarios),
            tarifas: parseExtremo(data.detalles)?.tarifas_desglosadas || { adultos: data.costo_entrada },
            lote: Array.isArray(data.lote_imagenes) ? data.lote_imagenes : [data.imagen],
            coordenadas: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) }
          });
        }
      } catch (e) { console.error(e); } 
      finally { setCargando(false); }
    };
    cargarDestino();
  }, [id]);

  // Autoplay mejorado (se detiene si el usuario interactúa)
  useEffect(() => {
    if (sitio?.lote?.length > 1 && !fotoZoom) {
      const timer = setInterval(() => {
        setFotoActual((prev) => (prev + 1) % sitio.lote.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [sitio, fotoZoom]);

  const cambiarFoto = (direccion) => {
    if (direccion === 'sig') setFotoActual((prev) => (prev + 1) % sitio.lote.length);
    else setFotoActual((prev) => (prev - 1 + sitio.lote.length) % sitio.lote.length);
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase italic">Sincronizando Destino...</div>;
  if (!sitio) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase italic">Destino no encontrado</div>;

  return (
    <div className="min-h-screen bg-white pb-20 italic font-sans text-left">
      
      {/* MODAL DE ZOOM (LIGHTBOX) */}
      {fotoZoom && (
        <div 
            className="fixed inset-0 z-[6000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setFotoZoom(null)}
        >
            <button className="absolute top-10 right-10 text-white text-4xl font-black hover:scale-110 transition-transform">✕</button>
            <img 
                src={`http://100.123.6.123:8000/storage/preformularios/${fotoZoom}`} 
                className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl object-contain animate-in zoom-in-95 duration-500"
                alt="Zoom"
            />
            <p className="absolute bottom-10 text-white/50 font-black uppercase text-[10px] tracking-[0.5em]">Click en cualquier lugar para cerrar</p>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 font-black text-[10px] uppercase text-slate-400 hover:text-blue-600 transition-all tracking-widest">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver a la lista
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] italic">
            {sitio.nombre}
          </h1>
          <div className="flex gap-2">
            <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-lg">{sitio.distrito}</span>
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest self-center ml-2">{sitio.municipio}</span>
          </div>
        </div>

        {/* --- GALERÍA CON CONTROLES MANUALES --- */}
        <div className="relative h-[650px] rounded-[4rem] overflow-hidden shadow-2xl bg-slate-100 group border-8 border-slate-50">
            {sitio.lote.map((img, idx) => (
                <div key={idx} className={`absolute inset-0 transition-all duration-1000 ${idx === fotoActual ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                    <img 
                        src={`http://100.123.6.123:8000/storage/preformularios/${img}`} 
                        className="w-full h-full object-cover cursor-zoom-in" 
                        alt={`Vista ${idx}`}
                        onClick={() => setFotoZoom(img)}
                    />
                </div>
            ))}

            {/* Botones Manuales (Aparecen al Hover) */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => cambiarFoto('ant')} className="w-14 h-14 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-full flex items-center justify-center text-2xl font-black transition-all shadow-xl">←</button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => cambiarFoto('sig')} className="w-14 h-14 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-full flex items-center justify-center text-2xl font-black transition-all shadow-xl">→</button>
            </div>

            <div className="absolute bottom-10 left-10 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full flex gap-4 items-center z-20">
                <p className="text-white font-black text-[10px] uppercase tracking-widest">{fotoActual + 1} / {sitio.lote.length}</p>
                <div className="h-4 w-px bg-white/20"></div>
                <button onClick={() => setFotoZoom(sitio.lote[fotoActual])} className="text-white hover:text-blue-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </button>
            </div>
        </div>

        {/* --- GRID DE INFORMACIÓN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10">
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] mb-8 italic">01. Reseña del Destino</h4>
              <p className="text-3xl text-slate-700 font-medium leading-[1.2] italic">"{sitio.descripcion}"</p>
            </section>

            {/* --- MAPA DE UBICACIÓN REAL --- */}
            <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] italic">02. Cómo llegar</h4>
                <div className="h-96 rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl relative">
                    <MapaFormulario 
                        ubicacionActual={sitio.coordenadas} 
                        setUbicacion={() => {}} // Solo lectura para el turista
                    />
                    <div className="absolute top-6 left-6 bg-slate-900 text-white px-5 py-2 rounded-2xl shadow-xl z-20 font-black text-[9px] uppercase tracking-widest">
                        Ubicación exacta verificada
                    </div>
                </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-10 italic">03. Horarios</h4>
              <div className="space-y-5">
                {Object.entries(sitio.horarios).map(([dia, hora]) => (
                  <div key={dia} className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-500">{dia}</span>
                    <span className="text-[11px] font-bold text-white">{hora}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 text-white p-12 rounded-[4rem] shadow-2xl shadow-blue-100">
              <h4 className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-8 italic">04. Tarifas</h4>
              <div className="space-y-6">
                {Object.entries(sitio.tarifas).map(([cat, precio]) => (
                    <div key={cat} className="flex justify-between items-baseline border-b border-white/20 pb-4">
                        <span className="text-[10px] font-black uppercase">{cat}</span>
                        <p className="leading-none"><span className="text-sm font-bold">$</span><span className="text-4xl font-black italic tracking-tighter">{precio}</span></p>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}