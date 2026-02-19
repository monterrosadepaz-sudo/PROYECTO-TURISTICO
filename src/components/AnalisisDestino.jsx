import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- COMPONENTE DE GALERÍA INTELIGENTE ---
const GaleriaEvidencia = ({ imagenes, imagenPrincipal }) => {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  let listaImagenes = [];
  
  if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      listaImagenes = imagenes.map(img => img.url_imagen || img); 
  } else if (imagenPrincipal) {
      listaImagenes = [imagenPrincipal];
  }

  if (listaImagenes.length === 0) return <div className="p-10 bg-slate-100 rounded-[3rem] text-center text-slate-400 font-bold uppercase italic">Sin evidencia visual disponible.</div>;

  return (
    <>
      {fotoSeleccionada && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFotoSeleccionada(null)}>
          <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 text-white rounded-full p-4 transition-all">✕</button>
          <img src={fotoSeleccionada} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none" onClick={(e) => e.stopPropagation()} alt="Zoom" />
        </div>
      )}
      <div className="space-y-4">
        <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic px-4 mb-4">Evidencia Multimedia ({listaImagenes.length})</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listaImagenes.map((url, index) => {
            const rutaCompleta = url.startsWith('http') ? url : `http://100.123.6.123:8000/storage/preformularios/${url}`;
            const esVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov');
            return (
              <div key={index} onClick={() => !esVideo && setFotoSeleccionada(rutaCompleta)} className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-200 hover:scale-[1.02] transition-transform duration-300 ${!esVideo ? 'cursor-zoom-in' : ''}`}>
                {esVideo ? <video controls className="w-full h-full object-cover"><source src={rutaCompleta} /></video> : <img src={rutaCompleta} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Evidencia ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-lg">{esVideo ? 'VIDEO' : `IMG 0${index + 1}`}</div>
              </div>
            );
          })}
        </div>
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

  // Estados Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [accionTipo, setAccionTipo] = useState(null); 
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado'));
  const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const solicitudOriginal = location.state?.datosSolicitud;

  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        const url = `http://100.123.6.123:8000/api/admin/preformularios/${id}/analizar`;
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          const safeJsonParse = (val) => {
              if (typeof val === 'string') { try { return JSON.parse(val); } catch (e) { return val; } }
              return val; 
          };

          setSitio({
            ...datos,
            politicas: safeJsonParse(datos.politicas) || {},
            horarios: safeJsonParse(datos.horarios) || {},
            clasificacion: safeJsonParse(datos.clasificacion) || [],
            detalles: safeJsonParse(datos.detalles) || {},
            lote_imagenes: safeJsonParse(datos.lote_imagenes) || [] 
          });
        }
      } catch (error) { console.error("Error de conexión:", error); } finally { setCargando(false); }
    };
    obtenerDetalles();
  }, [id]);

  const listaPermisos = [
    { id: 'traer_comida', label: 'Traer comida' }, { id: 'gaseosas_agua', label: 'Gaseosas / Agua' },
    { id: 'alcohol', label: 'Alcohol' }, { id: 'mascotas', label: 'Mascotas' },
    { id: 'mesas_sillas', label: 'Mesas y sillas' }, { id: 'hamacas', label: 'Hamacas' },
    { id: 'parrillas_cocinas', label: 'Parrillas / Cocinas' }, { id: 'armas_de_fuego', label: 'Armas de fuego' }
  ];

  const solicitarGestion = (tipo) => { setAccionTipo(tipo); setModalOpen(true); };

  const ejecutarGestion = async () => {
    setProcesando(true);
    try {
      if (!sesionActiva || !sesionActiva.idusuario) {
          alert("Error de seguridad: No se detectó un administrador logueado.");
          setProcesando(false); setModalOpen(false); return;
      }
      
      const url = accionTipo === 'aprobado'
        ? `http://100.123.6.123:8000/api/admin/preformularios/${id}/approve`
        : `http://100.123.6.123:8000/api/admin/preformularios/${id}/reject`;

      const payload = {
          admin_id: sesionActiva.idusuario,
          respuesta_a: solicitudOriginal?.idmensaje || null 
      };

      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (respuesta.ok) {
        // --- AQUÍ ESTÁ LA MAGIA DEL "VISTO" ---
        // Guardamos el ID en localStorage para que el Dashboard sepa que ya lo vimos
        if (solicitudOriginal?.idmensaje) {
            const vistos = JSON.parse(localStorage.getItem('solicitudes_vistas') || '[]');
            if (!vistos.includes(solicitudOriginal.idmensaje)) {
                vistos.push(solicitudOriginal.idmensaje);
                localStorage.setItem('solicitudes_vistas', JSON.stringify(vistos));
            }
        }
        
        setExito(true);
        setTimeout(() => { navigate('/dashboard'); }, 2200);
      } else {
        const errorData = await respuesta.json();
        alert(`Error: ${errorData.message || errorData.error || 'El servidor rechazó la petición'}`);
        setModalOpen(false);
      }
    } catch (error) {
      alert("Error de conexión. Verifica que el servidor esté activo.");
      setModalOpen(false);
    } finally { setProcesando(false); }
  };

  if (cargando) return <div className="p-20 text-center font-black uppercase text-blue-800 animate-pulse italic">Cargando Propuesta espere...</div>;
  if (!sitio) return <div className="p-20 text-center font-bold uppercase text-slate-400">Propuesta no encontrada</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-left italic font-sans relative">
      {/* MODAL GESTIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-300 relative">
            <div className={`p-8 text-center ${accionTipo === 'aprobado' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {!exito ? (
                <>
                    <h2 className="text-xl font-black uppercase tracking-widest italic animate-in slide-in-from-top-4">
                    {accionTipo === 'aprobado' ? '¿Confirmar Publicación?' : '¿Desactivar Sitio?'}
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

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all">← VOLVER AL PANEL</button>
          <div className="flex gap-4">
            <button onClick={() => solicitarGestion('rechazado')} className="px-8 py-4 bg-slate-100 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-50 transition-all">Desactivar / Rechazar</button>
            <button onClick={() => solicitarGestion('aprobado')} className="px-10 py-4 bg-green-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all">Aprobar y Publicar</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-12 px-8 space-y-12">
        {/* INFO COLABORADOR */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Propuesta enviada por:</h4>
            <p className="text-4xl font-black italic uppercase leading-none">{sitio.nombre_colaborador || "Usuario SV"}</p>
            <p className="text-[10px] font-bold text-blue-200 mt-4 opacity-50 italic">FECHA DE ENVIO: {sitio.fecha}</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-white/5 text-8xl font-black uppercase italic select-none">ID: {id.split('-')[0]}</div>
        </section>

        {/* NOMBRE */}
        <section className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-2 border-b pb-8 border-slate-100 mb-8">
            <h2 className="text-6xl font-black text-slate-800 italic uppercase leading-none tracking-tighter">{sitio.nombre}</h2>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">{sitio.departamento}</span>
              <p className="text-sm font-black text-blue-600/60 uppercase tracking-widest">{sitio.municipio} — {sitio.distrito}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic">Descripción:</h4>
            <p className="text-xl text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem] border-l-8 border-blue-600">"{sitio.descripcion || 'Sin descripción detallada disponible.'}"</p>
          </div>
        </section>

        {/* TARIFAS */}
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

        {/* POLÍTICAS */}
        <section className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
          <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-10 italic">Reglamento y Políticas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listaPermisos.map(p => (
              <div key={p.id} className={`p-6 rounded-[2rem] border transition-all ${sitio.politicas?.[p.id] ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100 opacity-60'}`}>
                <p className={`text-[9px] font-black uppercase italic mb-2 ${sitio.politicas?.[p.id] ? 'text-green-700' : 'text-red-700'}`}>{p.label}</p>
                <span className="text-xs font-black">{sitio.politicas?.[p.id] ? 'SÍ' : 'NO'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* GALERÍA */}
        <section className="space-y-6">
          <GaleriaEvidencia imagenes={sitio.lote_imagenes} imagenPrincipal={sitio.imagen} />
        </section>

        {/* MAPA */}
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