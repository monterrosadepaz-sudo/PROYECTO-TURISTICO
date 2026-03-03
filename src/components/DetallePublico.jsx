import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapaFormulario from './MapaFormulario'; 
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { reglasPermisos, serviciosAmenidades, actividadesDestacadas } from '../data/OpcionesDestino';
import { API_URL } from '../config'; 

const etiquetasTarifas = {
    adultos: "Adultos",
    ninos: "Niños",
    terceraEdad: "Tercera Edad"
};

const Visor360Seguro = ({ url }) => {
    return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <ReactPhotoSphereViewer 
                src={url} 
                height="100%" 
                width="100%" 
                littlePlanet={false} 
                hideNavbarButton={true}
                onReady={(instance) => {
                    console.log("Sistema inmersivo inicializado correctamente");
                }}
            />
        </div>
    );
};

export default function DetallePublico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const [fotoZoom, setFotoZoom] = useState(null);
  const [modalSimbologia, setModalSimbologia] = useState(false);

  const todasLasOpciones = [...reglasPermisos, ...serviciosAmenidades, ...actividadesDestacadas];

  const extraerIdYoutube = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const cargarDestino = async () => {
      try {
        const url = `${API_URL}/api/publico/publicaciones/detalles/${id}`;
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

          const loteRaw = data.lote_imagenes || data.imagenes;
          const loteProcesado = { planas: [], panoramas: [], videos: [], youtubeUrl: data.video_link || null };
          
          const procesarUrl = (nombre) => {
            if (nombre.startsWith('http')) return nombre;
            if (nombre.includes('publicacion')) return `${API_URL}/storage/publicaciones/${nombre}`;
            return `${API_URL}/storage/preformularios/${nombre}`;
          };

          if (loteRaw && typeof loteRaw === 'object' && !Array.isArray(loteRaw)) {
              if (loteRaw.plana) loteProcesado.planas = loteRaw.plana.map(procesarUrl);
              if (loteRaw['360']) {
                  loteRaw['360'].forEach(img => {
                      if (img !== "YouTube Video") loteProcesado.panoramas.push(procesarUrl(img));
                  });
              }
              if (loteRaw.video) loteProcesado.videos = loteRaw.video.map(procesarUrl);
              
              if (!loteProcesado.youtubeUrl && loteRaw.youtube) {
                  const yt = Array.isArray(loteRaw.youtube) ? loteRaw.youtube[0] : loteRaw.youtube;
                  if (yt && yt !== "YouTube Video") loteProcesado.youtubeUrl = yt;
              }
          } else if (Array.isArray(loteRaw)) {
              loteRaw.forEach(img => {
                  if (img !== "YouTube Video") {
                      const url = procesarUrl(img);
                      if (url.match(/\.(mp4|mov)$/i)) loteProcesado.videos.push(url);
                      else if (url.includes('-360')) loteProcesado.panoramas.push(url);
                      else loteProcesado.planas.push(url);
                  }
              });
          }

          setSitio({
            ...data,
            politicas: parseExtremo(data.politicas),
            horarios: parseExtremo(data.horarios),
            tarifas: parseExtremo(data.detalles)?.tarifas_desglosadas || { adultos: data.costo_entrada },
            loteClasificado: loteProcesado,
            clasificacion: parseExtremo(data.clasificacion) || [],
            coordenadas: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) }
          });
        }
      } catch (e) { console.error(e); } 
      finally { setCargando(false); }
    };
    cargarDestino();
  }, [id]);

  // --- Lógica MODO AR o VR ---
  const abrirModoAR = () => {
    const idVideo = extraerIdYoutube(sitio.loteClasificado.youtubeUrl);
    if (idVideo) {
      // Abrimos en una nueva pestaña con parámetros de reproducción automática
      const urlAR = `https://www.youtube.com/v/${idVideo}?autoplay=1&fs=1`;
      window.open(urlAR, '_blank');
    }
  };

  const GrupoIconos = ({ titulo, opciones, colorTitulo }) => {
      const activos = opciones.filter(opt => sitio.politicas[opt.id] === true);
      if (activos.length === 0) return null;

      return (
          <div className="mb-8 last:mb-0 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
              <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${colorTitulo} border-b border-slate-200 pb-3`}>{titulo}</h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
                  {activos.map(opt => (
                      <div key={opt.id} className="flex flex-col items-center justify-start gap-2 text-center group">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-3 transition-all duration-300 shadow-sm">
                            <img 
                                src={`/icons/${opt.id}.png`} 
                                alt={opt.label} 
                                className="w-full h-full object-contain opacity-70"
                                onError={(e) => {
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'%3E%3C/path%3E%3C/svg%3E";
                                }}
                            />
                        </div>
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 leading-tight">{opt.label}</span>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const CatalogoSimbologia = ({ titulo, opciones }) => (
      <div className="mb-8 last:mb-0">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2 mb-4">{titulo}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {opciones.map(opt => (
                  <div key={opt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 flex-shrink-0">
                          <img 
                              src={`/icons/${opt.id}.png`} 
                              alt={opt.label} 
                              className="w-full h-full object-contain opacity-70"
                              onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'%3E%3C/path%3E%3C/svg%3E";
                              }}
                          />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-tight">{opt.label}</span>
                  </div>
              ))}
          </div>
      </div>
  );

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase italic tracking-widest">Sincronizando Destino...</div>;
  if (!sitio) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase italic">Destino no encontrado</div>;

  const videoYoutubeId = extraerIdYoutube(sitio.loteClasificado.youtubeUrl);

  return (
    <div className="min-h-screen bg-white pb-32 italic font-sans text-left relative">
      
      <button 
        onClick={() => setModalSimbologia(true)}
        className="fixed bottom-8 right-8 z-[5000] bg-slate-900 text-white p-4 md:px-6 rounded-2xl shadow-2xl flex items-center gap-3 hover:-translate-y-1 hover:bg-black transition-all group border border-slate-700"
      >
          <span className="font-black text-[10px] uppercase tracking-widest">Simbología</span>
      </button>

      {modalSimbologia && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setModalSimbologia(false)}>
            <div className="bg-white max-w-4xl w-full p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-6 shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-widest text-blue-800">Guía de Íconos</h2>
                    <button onClick={() => setModalSimbologia(false)} className="text-xl font-black text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>
                
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <CatalogoSimbologia titulo="Reglas y Permisos" opciones={reglasPermisos} />
                    <CatalogoSimbologia titulo="Servicios y Amenidades" opciones={serviciosAmenidades} />
                    <CatalogoSimbologia titulo="Actividades Destacadas" opciones={actividadesDestacadas} />
                </div>
            </div>
        </div>
      )}

      {fotoZoom && (
        <div className="fixed inset-0 z-[6000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFotoZoom(null)}>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl font-black hover:scale-110 transition-all z-10 bg-black/20 w-12 h-12 rounded-full flex items-center justify-center">✕</button>
            
            {fotoZoom.tipo === 'video' ? (
                <video controls autoPlay className="max-w-full max-h-[90vh] rounded-[2rem] shadow-2xl object-contain animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
                    <source src={fotoZoom.url} type="video/mp4" />
                </video>
            ) : fotoZoom.tipo === '360' ? (
                <div className="w-full max-w-6xl h-[70vh] md:h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl relative cursor-move animate-in zoom-in-95 duration-500 border-8 border-white/10" onClick={e => e.stopPropagation()}>
                    
                    <Visor360Seguro url={fotoZoom.url} />

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-8 py-4 rounded-full pointer-events-none z-10 shadow-2xl border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="text-xl animate-bounce">👆</span> Arrastra para explorar
                        </p>
                    </div>
                </div>
            ) : (
                <img src={fotoZoom.url} className="max-w-full max-h-[90vh] rounded-[2rem] shadow-2xl object-contain animate-in zoom-in-95 duration-500 select-none" alt="Zoom" onClick={e => e.stopPropagation()}/>
            )}
        </div>
      )}

      <div className="bg-white px-8 py-6 sticky top-0 z-[1000] shadow-sm border-b border-slate-100 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="font-black text-[9px] uppercase text-slate-400 hover:text-blue-600 transition-all tracking-widest flex items-center gap-2">
          <span className="text-sm">←</span> VOLVER A LA LISTA
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 space-y-14">
        
        <section className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none drop-shadow-sm">
            {sitio.nombre}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6">
            <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-md">
                {sitio.departamento} | {sitio.distrito || sitio.municipio}
            </span>
            {sitio.clasificacion && sitio.clasificacion[0] && (
                <span className="border-2 border-emerald-500 text-emerald-600 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest">
                  {sitio.clasificacion[0]}
                </span>
            )}
          </div>

          <div className="pt-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Descripción</h4>
              <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed text-justify">
                {sitio.descripcion}
              </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 border-b border-slate-100 pb-4">Horarios de Atención</h4>
              <div className="space-y-3">
                {Object.entries(sitio.horarios).map(([dia, hora]) => (
                  <div key={dia} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{dia}</span>
                    <span className="text-[10px] font-bold text-slate-800 tracking-wider">{hora}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 border-b border-slate-100 pb-4">Tarifas de Ingreso</h4>
              <div className="space-y-4">
                {Object.entries(sitio.tarifas).map(([cat, precio]) => {
                    const labelBonito = etiquetasTarifas[cat] || cat;
                    return (
                        <div key={cat} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{labelBonito}</span>
                            <p className="leading-none flex items-baseline gap-1 text-slate-800">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <span className="text-2xl font-black italic tracking-tighter">{parseFloat(precio).toFixed(2)}</span>
                            </p>
                        </div>
                    );
                })}
              </div>
            </div>
        </section>

        <section className="space-y-8 bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200">
            <div className="border-b border-slate-100 pb-4 mb-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Evidencia Visual del Destino</h4>
            </div>

            {videoYoutubeId && (
                <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center px-2">
                        <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">▶</span> Recorrido en Video
                        </h5>
                        {/* BOTÓN MODO AR */}
                        <button 
                            onClick={abrirModoAR}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2 group"
                        >
                            <span className="text-sm group-hover:rotate-12 transition-transform">🥽</span> MODO VR
                        </button>
                    </div>
                    <div className="w-full aspect-video rounded-[2rem] overflow-hidden border-10 border-slate-1000 bg-black shadow-lg">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoYoutubeId}?rel=0`} 
                            title="Visor YouTube" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> Fotografías ({sitio.loteClasificado.planas.length})
                </h5>
                {sitio.loteClasificado.planas.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {sitio.loteClasificado.planas.map((url, idx) => (
                            <div key={idx} onClick={() => setFotoZoom({url, tipo: 'plana'})} className="snap-start shrink-0 w-48 h-32 md:w-64 md:h-44 rounded-[1.5rem] overflow-hidden shadow-md cursor-zoom-in group bg-slate-100">
                                <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Plana ${idx}`} />
                            </div>
                        ))}
                    </div>
                ) : <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-xl border border-slate-100 w-max">Sin fotografías</p>}
            </div>

            <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Panorámicas 360° ({sitio.loteClasificado.panoramas.length})
                </h5>
                {sitio.loteClasificado.panoramas.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {sitio.loteClasificado.panoramas.map((url, idx) => (
                            <div key={idx} onClick={() => setFotoZoom({url, tipo: '360'})} className="snap-start shrink-0 w-48 h-32 md:w-64 md:h-44 rounded-[1.5rem] overflow-hidden shadow-md cursor-zoom-in group relative bg-slate-100">
                                <img src={url} className="w-full h-full object-cover saturate-150 group-hover:scale-110 transition-transform duration-500" alt={`360 ${idx}`} />
                                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md">360°</div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                     <span className="text-white font-black text-[10px] uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-full">Explorar</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-xl border border-slate-100 w-max">Sin vistas panorámicas</p>}
            </div>

            <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span> Videos ({sitio.loteClasificado.videos.length})
                </h5>
                {sitio.loteClasificado.videos.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {sitio.loteClasificado.videos.map((url, idx) => (
                            <div key={idx} onClick={() => setFotoZoom({url, tipo: 'video'})} className="snap-start shrink-0 w-48 h-32 md:w-64 md:h-44 rounded-[1.5rem] overflow-hidden shadow-md cursor-pointer group bg-slate-900 relative">
                                <video src={`${url}#t=0.001`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" preload="metadata" muted />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white pl-1 shadow-lg border border-white/50 text-xl group-hover:scale-110 transition-transform">▶</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-xl border border-slate-100 w-max">Sin videos</p>}
            </div>
        </section>

        <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8">Características del Destino</h4>
            
            <GrupoIconos titulo="Reglas y Permisos" opciones={reglasPermisos} colorTitulo="text-slate-500" />
            <GrupoIconos titulo="Servicios y Amenidades" opciones={serviciosAmenidades} colorTitulo="text-slate-500" />
            <GrupoIconos titulo="Actividades Destacadas" opciones={actividadesDestacadas} colorTitulo="text-slate-500" />
            
            {!Object.values(sitio.politicas).includes(true) && (
                 <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center mt-4">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Este destino no ha reportado características específicas.</p>
                 </div>
            )}
        </section>

        <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 border-b border-slate-100 pb-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Mapa de Ubicación</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPS: {sitio.coordenadas.lat}, {sitio.coordenadas.lng}</p>
            </div>
            <div className="h-72 md:h-96 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner relative z-0">
                <MapaFormulario ubicacionActual={sitio.coordenadas} setUbicacion={() => {}} />
                    
            </div>
        </section>

      </div>
    </div>
  );
}