import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../config';
import { reglasPermisos, serviciosAmenidades, actividadesDestacadas } from '../data/OpcionesDestino';

const GaleriaEvidencia = ({ imagenes, imagenPrincipal, videoLink }) => {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  let listaMultimedia = [];
  
  let urlYoutubeReal = videoLink && videoLink !== "YouTube Video" ? videoLink : null;

  const extraerIdYoutube = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const match = regex.exec(url);
    return match ? match[1] : null;
  };

  if (imagenes && typeof imagenes === 'object' && !Array.isArray(imagenes)) {
      if (imagenes.plana && Array.isArray(imagenes.plana)) {
          imagenes.plana.forEach(img => listaMultimedia.push({ url: img, tipo: 'plana' }));
      }
      if (imagenes['360'] && Array.isArray(imagenes['360'])) {
          imagenes['360'].forEach(img => {
              if (img !== "YouTube Video") listaMultimedia.push({ url: img, tipo: '360' });
          });
      }
      if (imagenes.video && Array.isArray(imagenes.video)) {
          imagenes.video.forEach(vid => listaMultimedia.push({ url: vid, tipo: 'video' }));
      }

      if (!urlYoutubeReal && imagenes.youtube) {
          const yt = Array.isArray(imagenes.youtube) ? imagenes.youtube[0] : imagenes.youtube;
          if (yt && yt !== "YouTube Video") urlYoutubeReal = yt;
      }
  } else if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      imagenes.forEach(img => {
          const urlStr = img.url_imagen || img;
          if (urlStr !== "YouTube Video") {
              const tipo = urlStr.includes('.mp4') ? 'video' : (urlStr.includes('-360') ? '360' : 'plana');
              listaMultimedia.push({ url: urlStr, tipo: tipo });
          }
      });
  } else if (imagenPrincipal && imagenPrincipal !== "YouTube Video") {
      listaMultimedia.push({ url: imagenPrincipal, tipo: 'plana' });
  }

  const videoYoutubeId = extraerIdYoutube(urlYoutubeReal);

  const obtenerRutaSegura = (nombre) => {
      if (!nombre) return '';
      if (nombre.startsWith('http')) return nombre;
      if (nombre.includes('publicacion')) return `${API_URL}/storage/publicaciones/${nombre}`;
      return `${API_URL}/storage/preformularios/${nombre}`;
  };

  if (listaMultimedia.length === 0 && !urlYoutubeReal) {
      return <div className="p-10 bg-slate-100 rounded-[3rem] text-center text-slate-400 font-bold uppercase italic">Sin evidencia visual disponible.</div>;
  }

  const fotosPlanas = listaMultimedia.filter(item => item.tipo === 'plana');
  const fotos360 = listaMultimedia.filter(item => item.tipo === '360');
  const videosMp4 = listaMultimedia.filter(item => item.tipo === 'video');

  const renderCuadricula = (items) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {items.map((item, index) => {
        const rutaCompleta = obtenerRutaSegura(item.url); 
        return (
          <div key={index} onClick={() => setFotoSeleccionada({ url: rutaCompleta, tipo: item.tipo })} className="group relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-900 cursor-zoom-in">
            {item.tipo === 'video' ? (
                <>
                    <video src={`${rutaCompleta}#t=0.001`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" preload="metadata" muted />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white pl-1 shadow-lg border border-white/50 text-xl">▶</div>
                    </div>
                </>
            ) : (
                <img src={rutaCompleta} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.tipo === '360' ? 'saturate-110' : ''}`} alt={`Evidencia ${index + 1}`} />
            )}
            {item.tipo === '360' ? (
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border border-blue-400 uppercase tracking-widest">360°</div>
            ) : (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{item.tipo === 'video' ? 'VIDEO' : `IMG 0${index + 1}`}</div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {fotoSeleccionada && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFotoSeleccionada(null)}>
          <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 text-white rounded-full p-4 transition-all z-10">✕</button>
          {fotoSeleccionada.tipo === 'video' ? (
              <video controls autoPlay className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                  <source src={fotoSeleccionada.url} type="video/mp4" />
              </video>
          ) : (
              <img src={fotoSeleccionada.url} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none" onClick={(e) => e.stopPropagation()} alt="Zoom" />
          )}
        </div>
      )}

      <div className="space-y-10">
        
        {urlYoutubeReal && (
            <div className="space-y-4">
                <h5 className="text-red-500 text-[11px] font-black uppercase tracking-widest italic px-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">▶</span>
                  Video Recorrido (YouTube)
                </h5>
                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-full md:w-64 aspect-video bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-lg shrink-0">
                        {videoYoutubeId ? (
                            <>
                                <img 
                                  src={`https://img.youtube.com/vi/${videoYoutubeId}/maxresdefault.jpg`} 
                                  onError={(e) => e.target.src = `https://img.youtube.com/vi/${videoYoutubeId}/hqdefault.jpg`} 
                                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                                  alt="Miniatura YouTube" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-xl border-2 border-white/50">▶</div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">URL Inválida</div>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden text-center md:text-left w-full">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Enlace de Video Adjunto:</p>
                        <a href={urlYoutubeReal} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline italic truncate block w-full bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            {urlYoutubeReal}
                        </a>
                        <p className="text-[8px] text-slate-400 mt-3 uppercase tracking-widest font-bold">Haz clic en el enlace para abrirlo en YouTube</p>
                    </div>
                </div>
            </div>
        )}

        {fotos360.length > 0 && (
            <div className="space-y-4">
                <h5 className="text-blue-600 text-[11px] font-black uppercase tracking-widest italic px-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-lg">🌐</span> Fotografías 360° Inmersivas
                </h5>
                {renderCuadricula(fotos360)}
            </div>
        )}

        {videosMp4.length > 0 && (
            <div className="space-y-4">
                <h5 className="text-purple-600 text-[11px] font-black uppercase tracking-widest italic px-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-lg">🎬</span> Videos Cortos (MP4)
                </h5>
                {renderCuadricula(videosMp4)}
            </div>
        )}

        {fotosPlanas.length > 0 && (
            <div className="space-y-4">
                <h5 className="text-slate-600 text-[11px] font-black uppercase tracking-widest italic px-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-lg">📷</span> Fotografías Estándar
                </h5>
                {renderCuadricula(fotosPlanas)}
            </div>
        )}

      </div>
    </>
  );
};

export default function AnalisisDestino() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); 
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [accionTipo, setAccionTipo] = useState(null); 
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);
  const [origenDatos, setOrigenDatos] = useState('preformularios'); 

  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado'));
  const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const solicitudOriginal = location.state?.datosSolicitud;

  const limpiarJSON = (data) => {
      if (!data || data === "null") return {};
      if (typeof data === 'object') return data;
      try {
          let cleaned = data.replace(/\\+"/g, '"').replace(/\\"/g, '"');
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.substring(1, cleaned.length - 1);
          if (cleaned.startsWith('"')) cleaned = cleaned.substring(1, cleaned.length - 1).replace(/\\"/g, '"');
          return JSON.parse(cleaned);
      } catch (e) { return {}; }
  };

  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        let url = `${API_URL}/api/admin/preformularios/${id}/analizar`;
        let respuesta = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
        let datosEncontrados = null;
        let origen = 'preformularios';

        if (respuesta.ok) {
            datosEncontrados = await respuesta.json();
        } else {
            url = `${API_URL}/api/admin/publicaciones/${id}`;
            respuesta = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            
            if (respuesta.ok) {
                datosEncontrados = await respuesta.json();
                if (datosEncontrados.data) datosEncontrados = datosEncontrados.data;
                origen = 'publicaciones';
            }
        }

        if (datosEncontrados) {
          if (datosEncontrados.error) throw new Error(datosEncontrados.error);

          setOrigenDatos(origen);
          setSitio({
            ...datosEncontrados,
            politicas: limpiarJSON(datosEncontrados.politicas) || {},
            horarios: limpiarJSON(datosEncontrados.horarios) || {},
            clasificacion: limpiarJSON(datosEncontrados.clasificacion) || [],
            detalles: limpiarJSON(datosEncontrados.detalles) || {},
            lote_imagenes: limpiarJSON(datosEncontrados.lote_imagenes || datosEncontrados.imagenes) || [] 
          });
        }
      } catch (error) { 
          console.error("Error de conexión:", error); 
      } finally { 
          setCargando(false); 
      }
    };
    obtenerDetalles();
  }, [id]);

  const solicitarGestion = (tipo) => { setAccionTipo(tipo); setModalOpen(true); };

  const ejecutarGestion = async () => {
    setProcesando(true);
    try {
      if (!sesionActiva || !sesionActiva.idusuario) {
          alert("Error de seguridad: No se detectó un administrador.");
          return;
      }
      
      let urlAccion = "";
      if (origenDatos === 'preformularios') {
          urlAccion = accionTipo === 'aprobado'
            ? `${API_URL}/api/admin/preformularios/${id}/approve`
            : `${API_URL}/api/admin/preformularios/${id}/reject`;
      } else {
          urlAccion = accionTipo === 'aprobado'
            ? `${API_URL}/api/admin/publicaciones/activar/${id}`
            : `${API_URL}/api/admin/publicaciones/desactivar/${id}`;
      }

      const resAccion = await fetch(urlAccion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ admin_id: sesionActiva.idusuario })
      });

      if (!resAccion.ok) {
        const errorData = await resAccion.json();
        throw new Error(errorData.message || 'El servidor rechazó la acción sobre el sitio.');
      }

      const idColaborador = sitio.idusuario || sitio.colaborador_id;
      
      if (idColaborador) {
          const urlNotificacion = solicitudOriginal?.idmensaje 
          ? `${API_URL}/api/admin/solicitudes/responder` 
           : `${API_URL}/api/admin/solicitudes/responder`; 

        const payloadNotificacion = {
            idpublicacion: id,
            remitente_id: sesionActiva.idusuario,
            destinatario_id: idColaborador, 
            accion: accionTipo === 'aprobado' ? 'aprobar' : 'rechazar',
            comentarios: accionTipo === 'aprobado' 
                ? "Tu sitio ha sido revisado y publicado. Ahora es visible para todos." 
                : "Tu sitio ha sido rechazado o necesita correcciones. Revisa tu propuesta.",    
            respuesta_a: solicitudOriginal?.idmensaje || idColaborador 
        };
          if (solicitudOriginal?.idmensaje) {
              payloadNotificacion.respuesta_a = solicitudOriginal.idmensaje;
          }

          await fetch(urlNotificacion, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(payloadNotificacion)
          });
      }

      if (solicitudOriginal?.idmensaje) {
          const vistos = JSON.parse(localStorage.getItem('solicitudes_vistas') || '[]');
          if (!vistos.includes(solicitudOriginal.idmensaje)) {
              vistos.push(solicitudOriginal.idmensaje);
              localStorage.setItem('solicitudes_vistas', JSON.stringify(vistos));
          }
      }
      
      setExito(true);
      setTimeout(() => { navigate('/dashboard'); }, 2200);

    } catch (error) {
      alert(`Error: ${error.message}`);
      setModalOpen(false);
    } finally { setProcesando(false); }
  };

  if (cargando) return <div className="p-20 text-center font-black uppercase text-blue-800 animate-pulse italic">Cargando Propuesta espere...</div>;
  if (!sitio) return <div className="p-20 text-center font-bold uppercase text-slate-400">Propuesta no encontrada</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-left italic font-sans relative">
      {modalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-300 relative">
            <div className={`p-8 text-center ${accionTipo === 'aprobado' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {!exito ? (
                <>
                    <h2 className="text-xl font-black uppercase tracking-widest italic animate-in slide-in-from-top-4">
                    {accionTipo === 'aprobado' ? '¿Confirmar Acción?' : '¿Desactivar Sitio?'}
                    </h2>
                    {solicitudOriginal && (
                        <p className="text-[10px] font-bold mt-2 bg-white/20 inline-block px-3 py-1 rounded-full uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                            Respondiendo a: {solicitudOriginal.accion}
                        </p>
                    )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-500">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white animate-bounce"><span className="text-2xl font-black">✓</span></div>
                  <h2 className="text-xl font-black uppercase italic tracking-widest">¡Procesado!</h2>
                </div>
              )}
            </div>
            <div className="p-10 text-center space-y-8">
              {!exito ? (
                <>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed uppercase">
                    {accionTipo === 'aprobado' ? 'El sitio será visible para todos y se notificará al colaborador.' : 'El sitio pasará a estado INACTIVO. El usuario será notificado.'}
                  </p>
                  <div className="flex gap-4">
                    <button disabled={procesando} onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-slate-200 transition-all">Cancelar</button>
                    <button disabled={procesando} onClick={ejecutarGestion} className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 ${accionTipo === 'aprobado' ? 'bg-green-500 hover:bg-green-600 shadow-green-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'} active:scale-95`}>
                      {procesando ? <span>Procesando...</span> : 'Confirmar'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6 space-y-2 animate-in fade-in duration-700">
                  <p className="text-slate-800 font-black text-lg italic uppercase">Notificación Enviada</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Redirigiendo al panel...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all">← VOLVER AL PANEL</button>
          <div className="flex gap-4">
            <button onClick={() => solicitarGestion('rechazado')} className="px-8 py-4 bg-slate-100 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-50 transition-all">Desactivar / Rechazar</button>
            <button onClick={() => solicitarGestion('aprobado')} className="px-10 py-4 bg-green-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all">
                {origenDatos === 'preformularios' ? 'Aprobar y Publicar' : 'Activar Publicación'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-12 px-8 space-y-12">
        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
                <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Propuesta enviada por:</h4>
                <p className="text-4xl font-black italic uppercase leading-none">{sitio.nombre_colaborador || "Usuario SV"}</p>
                <p className="text-[10px] font-bold text-blue-200 mt-4 opacity-50 italic">FECHA DE ENVIO: {sitio.fecha || sitio.creado_en?.split('T')[0]}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-[9px] font-black tracking-widest uppercase border ${origenDatos === 'preformularios' ? 'bg-blue-600/20 text-blue-300 border-blue-400/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                {origenDatos === 'preformularios' ? 'NUEVO SITIO' : 'ACTUALIZACIÓN'}
            </div>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-white/5 text-8xl font-black uppercase italic select-none">ID: {id.split('-')[0]}</div>
        </section>

        <section className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4 border-b pb-8 border-slate-100 mb-8">
            <h2 className="text-6xl font-black text-slate-800 italic uppercase leading-none tracking-tighter">{sitio.nombre}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">{sitio.departamento}</span>
              
              {sitio.clasificacion && sitio.clasificacion[0] && (
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm">{sitio.clasificacion[0]}</span>
              )}

              <p className="text-sm font-black text-blue-600/60 uppercase tracking-widest">{sitio.municipio} — {sitio.distrito}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic">Descripción:</h4>
            <p className="text-xl text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem] border-l-8 border-blue-600">"{sitio.descripcion || 'Sin descripción detallada disponible.'}"</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-8 border-b pb-4 border-slate-50 italic">Tarifas Reportadas</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase text-slate-400">Entrada General</span>
                <span className="text-4xl font-black text-blue-700 italic">${parseFloat(sitio.costo_entrada || 0).toFixed(2)}</span>
              </div>
              {sitio.detalles?.tarifas_desglosadas && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                   {Object.entries(sitio.detalles.tarifas_desglosadas).map(([tipo, precio]) => (
                      <div key={tipo} className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{tipo}</p>
                        <p className="text-sm font-black text-slate-700">${parseFloat(precio).toFixed(2)}</p>
                      </div>
                   ))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-8 border-b pb-4 border-slate-50 italic">Horarios</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {sitio.horarios && ordenDias.map((dia) => {
                if (sitio.horarios[dia]) {
                  return (
                    <div key={dia} className="flex justify-between items-center border-b border-slate-50 pb-1"><span className="text-[9px] font-black uppercase text-slate-400">{dia}</span><span className="text-[10px] font-bold text-blue-600 italic">{sitio.horarios[dia]}</span></div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm space-y-12">
          
          <div>
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6 italic border-b border-slate-100 pb-3">A. Reglas y Permisos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reglasPermisos.map(p => {
                const tienePermiso = sitio.politicas?.[p.id];
                return (
                  <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tienePermiso ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-red-50/40 border-red-100 opacity-60'}`}>
                    <p className={`text-[9px] font-black uppercase italic mb-1 ${tienePermiso ? 'text-green-700' : 'text-red-700'}`}>{p.label}</p>
                    <span className="text-xs font-black text-slate-800">{tienePermiso ? 'SÍ' : 'NO'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6 italic border-b border-slate-100 pb-3">B. Servicios y Amenidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviciosAmenidades.map(p => {
                const tieneServicio = sitio.politicas?.[p.id];
                return (
                  <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tieneServicio ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                    <p className={`text-[9px] font-black uppercase italic mb-1 ${tieneServicio ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
                    <span className="text-xs font-black text-slate-800">{tieneServicio ? 'SÍ' : 'NO'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6 italic border-b border-slate-100 pb-3">C. Actividades Destacadas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {actividadesDestacadas.map(p => {
                const tieneActividad = sitio.politicas?.[p.id];
                return (
                  <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tieneActividad ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                    <p className={`text-[9px] font-black uppercase italic mb-1 ${tieneActividad ? 'text-emerald-700' : 'text-slate-400'}`}>{p.label}</p>
                    <span className="text-xs font-black text-slate-800">{tieneActividad ? 'SÍ' : 'NO'}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        <section className="bg-white rounded-[4rem] p-12 border border-slate-200 shadow-sm">
          <GaleriaEvidencia 
             imagenes={sitio.lote_imagenes || sitio.imagenes} 
             imagenPrincipal={sitio.imagen} 
             videoLink={sitio.video_link} 
          />
        </section>

        <section className="bg-white rounded-[4rem] p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-end">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic">Mapa de Ubicación</h4>
            <span className="text-[10px] font-bold text-slate-300">COORDENADAS: {sitio.latitud}, {sitio.longitud}</span>
          </div>
          <div className="h-[500px] w-full rounded-[3.5rem] overflow-hidden border-8 border-slate-50 relative z-0">
            <MapContainer center={[parseFloat(sitio.latitud) || 13.69, parseFloat(sitio.longitud) || -89.21]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[parseFloat(sitio.latitud) || 13.69, parseFloat(sitio.longitud) || -89.21]}>
                <Popup>{sitio.nombre}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </section>
      </div>
    </div>
  );
}