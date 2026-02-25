import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MapaFormulario from './MapaFormulario';
import { reglasPermisos, serviciosAmenidades, actividadesDestacadas } from '../data/OpcionesDestino';

// --- COMPONENTE DE GALERÍA INTELIGENTE ---
const GaleriaEvidencia = ({ imagenes, imagenPrincipal }) => {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  let listaMultimedia = [];
  
  if (imagenes && typeof imagenes === 'object' && !Array.isArray(imagenes)) {
      if (imagenes.plana && Array.isArray(imagenes.plana)) {
          imagenes.plana.forEach(img => listaMultimedia.push({ url: img, tipo: 'plana' }));
      }
      if (imagenes['360'] && Array.isArray(imagenes['360'])) {
          imagenes['360'].forEach(img => listaMultimedia.push({ url: img, tipo: '360' }));
      }
      if (imagenes.video && Array.isArray(imagenes.video)) {
          imagenes.video.forEach(vid => listaMultimedia.push({ url: vid, tipo: 'video' }));
      }
  } else if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      imagenes.forEach(img => {
          const urlStr = img.url_imagen || img;
          const tipo = urlStr.includes('.mp4') ? 'video' : (urlStr.includes('-360') ? '360' : 'plana');
          listaMultimedia.push({ url: urlStr, tipo: tipo });
      });
  } else if (imagenPrincipal) {
      listaMultimedia.push({ url: imagenPrincipal, tipo: 'plana' });
  }

  if (listaMultimedia.length === 0) return <div className="p-10 bg-slate-50 rounded-[2rem] text-center text-slate-400 font-bold uppercase italic border border-slate-100">Sin evidencia visual disponible.</div>;

  return (
    <>
      {fotoSeleccionada && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFotoSeleccionada(null)}>
          <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 text-white rounded-full p-4 transition-all z-10">✕</button>
          {fotoSeleccionada.tipo === 'video' ? (
              <video controls autoPlay className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                  <source src={fotoSeleccionada.url} />
              </video>
          ) : (
              <img src={fotoSeleccionada.url} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none" onClick={(e) => e.stopPropagation()} alt="Zoom" />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {listaMultimedia.map((item, index) => {
          const rutaCompleta = item.url.startsWith('http') ? item.url : `http://100.123.6.123:8000/storage/publicaciones/${item.url}`;
          
          return (
            <div 
              key={index} 
              onClick={() => setFotoSeleccionada({ url: rutaCompleta, tipo: item.tipo })} 
              className="group relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-900 cursor-zoom-in"
            >
              {item.tipo === 'video' ? (
                  <>
                      <video src={`${rutaCompleta}#t=0.001`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" preload="metadata" muted />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/30 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-white pl-1 shadow-lg border border-white/50 text-sm">▶</div>
                      </div>
                  </>
              ) : (
                  <img 
                    src={rutaCompleta} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.tipo === '360' ? 'saturate-110' : ''}`} 
                    alt={`Evidencia ${index + 1}`} 
                    onError={(e) => {
                        if(e.target.src.includes('publicaciones')) {
                            e.target.src = rutaCompleta.replace('publicaciones', 'preformularios');
                        } else {
                            e.target.style.display = 'none';
                        }
                    }} 
                  />
              )}
              
              {item.tipo === '360' ? (
                  <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-md uppercase tracking-widest">
                      360°
                  </div>
              ) : (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                      {item.tipo === 'video' ? 'VIDEO' : `IMG 0${index + 1}`}
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function AdminDetalleSitio() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const datosSolicitud = location.state?.datosSolicitud;
  const sesionAdmin = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const zonaGestionRef = useRef(null);
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const safeParse = (data) => {
    if (!data || data === "null") return null;
    if (typeof data === 'object') return data;
    try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') return JSON.parse(parsed);
        return parsed;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const cargarDetalleAdmin = async () => {
      try {
        const url = `http://100.123.6.123:8000/api/admin/publicaciones/${id}`;
        const respuesta = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });

        if (respuesta.ok) {
            const data = await respuesta.json();
            setSitio({
                ...data,
                detalles: safeParse(data.detalles) || {},
                politicas: safeParse(data.politicas) || {},
                horarios: safeParse(data.horarios) || {},
                clasificacion: safeParse(data.clasificacion) || ["TURISMO"],
                precios: (safeParse(data.detalles) || {}).tarifas_desglosadas || { adultos: data.costo_entrada },
                lote_imagenes: safeParse(data.lote_imagenes) || safeParse(data.imagenes) || [],
                ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) }
            });
        } else {
            alert("No se pudo cargar el sitio.");
        }
      } catch (error) { console.error("Error:", error); } finally { setCargando(false); }
    };
    cargarDetalleAdmin();
  }, [id]);

  const irAZonaGestion = () => {
      zonaGestionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const notificarUsuario = async (accionRealizada, mensajePersonalizado) => {
      const destinatarioId = datosSolicitud?.remitente_id || sitio?.idusuario || sitio?.colaborador_id; 
      if (!destinatarioId || !sesionAdmin?.idusuario) return;

      try {
          const payload = {
              "idpublicacion": id,
              "remitente_id": sesionAdmin.idusuario, 
              "destinatario_id": destinatarioId,    
              "accion": "aprobar",                  
              "comentarios": mensajePersonalizado,
              "respuesta_a": datosSolicitud?.idmensaje || null 
          };

          await fetch('http://100.123.6.123:8000/api/admin/solicitud/responder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(payload)
          });
      } catch (error) { console.error("Error al notificar al usuario:", error); }
  };

  const alternarEstadoSitio = async () => {
      if (!sitio) return;
      const estaActivo = sitio.estado === 'activo';
      const accionTexto = estaActivo ? "DESACTIVAR" : "ACTIVAR";
      
      const confirmado = window.confirm(`¿Estás seguro de que deseas ${accionTexto} este sitio?\n\n${estaActivo ? 'El usuario será notificado para que pueda editar.' : 'El sitio volverá a ser público.'}`);
      if (!confirmado) return;

      setProcesando(true);

      try {
          const endpoint = estaActivo ? 'desactivar' : 'activar';
          const url = `http://100.123.6.123:8000/api/admin/publicaciones/${endpoint}/${id}`;

          const respuesta = await fetch(url, {
              method: 'POST',
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
          });

          if (respuesta.ok) {
              setSitio(prev => ({ ...prev, estado: estaActivo ? 'inactivo' : 'activo' }));
              
              if (estaActivo) {
                  await notificarUsuario("Solicitud Atendida", "Tu sitio ha sido desactivado temporalmente. El modo edición está habilitado. Puedes realizar tus cambios ahora.");
                  alert("Sitio DESACTIVADO. Se envió una notificación al usuario para que proceda a editar.");
              } else {
                  await notificarUsuario("Publicación Reactivada", "Tu sitio ha sido revisado y activado nuevamente. Ya es visible para los turistas.");
                  alert("Sitio ACTIVADO. Se notificó al usuario.");
              }
          } else {
              const err = await respuesta.json();
              alert("Error del servidor: " + (err.message || "No se pudo cambiar el estado."));
          }
      } catch (error) {
          alert("Error de conexión.");
      } finally {
          setProcesando(false);
      }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-blue-800 uppercase tracking-widest italic">Cargando vista de administrador...</div>;
  if (!sitio) return <div className="min-h-screen flex items-center justify-center font-black text-red-500 uppercase tracking-widest italic">No se encontró información del sitio.</div>;

  return (
    <div className="min-h-screen bg-slate-50 italic font-sans pb-20">
      
      {/* BANNER DE SOLICITUD */}
      {datosSolicitud && (
        <div className="bg-slate-900 text-white px-8 py-6 sticky top-0 z-[200] shadow-2xl animate-in slide-in-from-top duration-500">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${datosSolicitud.accion === 'eliminar' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            SOLICITUD DE {datosSolicitud.accion}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            {datosSolicitud.fecha ? new Date(datosSolicitud.fecha).toLocaleDateString() : 'Reciente'}
                        </span>
                    </div>
                    <p className="text-xl font-medium italic">"{datosSolicitud.comentarios}"</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Solicitado por ID: <span className="font-mono text-slate-300">{datosSolicitud.remitente_id}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Volver al Buzón</button>
                    <button onClick={irAZonaGestion} className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                        Atender Solicitud ↓
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 🚀 HERO ACTUALIZADO (Letras Blancas, Fondo Oscuro Elegante) 🚀 */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-slate-950">
        <img 
            src={`http://100.123.6.123:8000/storage/publicaciones/${sitio.imagen}`} 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            onError={(e) => {
                if(e.target.src.includes('publicaciones')) {
                    e.target.src = e.target.src.replace('publicaciones', 'preformularios');
                } else {
                    e.target.src = 'https://via.placeholder.com/1920x600?text=Sin+Imagen+Principal';
                }
            }}
            alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-[100] cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg border border-white/10">← Volver</button>
        
        <div className="absolute bottom-0 left-0 w-full p-10 md:p-14 z-10">
            <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                {Array.isArray(sitio.clasificacion) ? sitio.clasificacion[0] : sitio.clasificacion}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 leading-none text-white drop-shadow-lg">{sitio.nombre}</h1>
            <p className="text-sm md:text-lg font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                📍 {sitio.departamento} | {sitio.municipio} | {sitio.distrito || 'S/D'}
            </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (Info principal) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* DESCRIPCIÓN */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6">Sobre este destino</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{sitio.descripcion}"</p>
            </div>

            {/* TARIFAS */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6">Tarifas Reportadas</h4>
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                        <span className="text-[10px] font-black uppercase text-slate-400">Entrada General</span>
                        <span className="text-4xl font-black text-blue-700 italic">${parseFloat(sitio.costo_entrada || 0).toFixed(2)}</span>
                    </div>
                    {sitio.precios && (
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            {Object.entries(sitio.precios).map(([tipo, precio]) => (
                                <div key={tipo} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{tipo}</p>
                                    <p className="text-sm font-black text-slate-700">${parseFloat(precio || 0).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* POLÍTICAS Y CARACTERÍSTICAS */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-10">
                
                {/* BLOQUE A: Reglas y Permisos */}
                <div>
                    <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6 border-b border-slate-50 pb-3">A. Reglas y Permisos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {reglasPermisos.map(p => {
                        const tienePermiso = sitio.politicas?.[p.id];
                        return (
                        <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tienePermiso ? 'bg-green-50/80 border-green-200 shadow-sm' : 'bg-red-50/30 border-red-100 opacity-60'}`}>
                            <p className={`text-[9px] font-black uppercase italic mb-1 ${tienePermiso ? 'text-green-700' : 'text-red-700'}`}>{p.label}</p>
                            <span className="text-xs font-black text-slate-800">{tienePermiso ? 'SÍ' : 'NO'}</span>
                        </div>
                        );
                    })}
                    </div>
                </div>

                {/* BLOQUE B: Amenidades */}
                <div>
                    <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6 border-b border-slate-50 pb-3">B. Servicios y Amenidades</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviciosAmenidades.map(p => {
                        const tieneServicio = sitio.politicas?.[p.id];
                        return (
                        <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tieneServicio ? 'bg-blue-50/80 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                            <p className={`text-[9px] font-black uppercase italic mb-1 ${tieneServicio ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
                            <span className="text-xs font-black text-slate-800">{tieneServicio ? 'SÍ' : 'NO'}</span>
                        </div>
                        );
                    })}
                    </div>
                </div>

                {/* BLOQUE C: Actividades */}
                <div>
                    <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6 border-b border-slate-50 pb-3">C. Actividades Destacadas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {actividadesDestacadas.map(p => {
                        const tieneActividad = sitio.politicas?.[p.id];
                        return (
                        <div key={p.id} className={`p-4 rounded-[1.5rem] border transition-all ${tieneActividad ? 'bg-emerald-50/80 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                            <p className={`text-[9px] font-black uppercase italic mb-1 ${tieneActividad ? 'text-emerald-700' : 'text-slate-400'}`}>{p.label}</p>
                            <span className="text-xs font-black text-slate-800">{tieneActividad ? 'SÍ' : 'NO'}</span>
                        </div>
                        );
                    })}
                    </div>
                </div>
            </div>

            {/* GALERÍA MULTIMEDIA */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6">Evidencia Multimedia</h4>
                <GaleriaEvidencia imagenes={sitio.lote_imagenes} imagenPrincipal={sitio.imagen} />
            </div>

        </div>

        {/* COLUMNA DERECHA (SIDEBAR) */}
        <div className="space-y-8">
            
            {/* TARJETA DE ESTADO */}
            <div className={`text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden transition-colors duration-500 ${sitio.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🛡️</div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/70 italic">Estado de Publicación</h4>
                <p className="text-4xl font-black uppercase tracking-tighter text-white mb-6 italic">{sitio.estado}</p>
                <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] text-white/70 uppercase font-black tracking-widest mb-1 italic">ID Publicación</p>
                        <p className="text-[10px] font-mono break-all text-white">{sitio.idpublicacion}</p>
                    </div>
                </div>
            </div>

            {/* HORARIOS */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-6">Horarios de Atención</h4>
                <div className="space-y-3">
                    {diasSemana.map((dia) => {
                        const valorHorario = sitio.horarios[dia];
                        const mostrarTexto = valorHorario ? valorHorario : 'Cerrado';
                        const estaAbierto = !!valorHorario;
                        return (
                            <div key={dia} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 italic">{dia}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest italic ${estaAbierto ? 'text-slate-700' : 'text-slate-300'}`}>{mostrarTexto}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MAPA */}
            <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100">
                 <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic mb-4 ml-2 mt-2">Ubicación</h4>
                 <div className="h-64 rounded-[2rem] overflow-hidden pointer-events-none opacity-90 border-4 border-slate-50 relative z-0">
                      <MapaFormulario ubicacionActual={sitio.ubicacion} />
                 </div>
            </div>

            {/* ZONA DE GESTIÓN */}
            <div ref={zonaGestionRef} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 text-center shadow-2xl scroll-mt-24">
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic mb-6">Zona de Gestión Admin</h4>
                <div className="space-y-3">
                    <button 
                        disabled={procesando}
                        onClick={alternarEstadoSitio}
                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border-2 italic
                            ${sitio.estado === 'activo' 
                                ? 'bg-slate-800 border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-orange-500/30' 
                                : 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:shadow-green-500/50'
                            } ${procesando ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {procesando ? 'Procesando...' : (sitio.estado === 'activo' ? 'Ocultar / Desactivar' : 'Activar / Publicar')}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}