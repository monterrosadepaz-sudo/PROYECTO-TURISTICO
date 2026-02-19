import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MapaFormulario from './MapaFormulario';

const etiquetasPrecios = {
    adultos: "Adultos", ninos: "Niños", terceraEdad: "Tercera Edad",
    ADULTOS: "Adultos", NINOS: "Niños", TERCERAEDAD: "Tercera Edad"
};

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function AdminDetalleSitio() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Datos de la solicitud original (si venimos del buzón)
  const datosSolicitud = location.state?.datosSolicitud;
  
  // Sesión del Admin (Para firmar la respuesta)
  const sesionAdmin = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const zonaGestionRef = useRef(null);
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

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

  // --- NUEVA FUNCIÓN: NOTIFICAR AL USUARIO ---
  const notificarUsuario = async (accionRealizada, mensajePersonalizado) => {
      // Solo notificamos si hay una solicitud previa o si tenemos el ID del usuario a mano
      // Usamos el ID del remitente de la solicitud, o el dueño del sitio si no hay solicitud
      const destinatarioId = datosSolicitud?.remitente_id || sitio?.idusuario; 
      
      if (!destinatarioId || !sesionAdmin?.idusuario) return;

      console.log(`🔔 Enviando notificación a ${destinatarioId}...`);

      try {
          const payload = {
              "idpublicacion": id,
              "remitente_id": sesionAdmin.idusuario, // El Admin responde
              "destinatario_id": destinatarioId,     // El Colaborador recibe
              "accion": "aprobar",                   // "aprobar" la solicitud de gestión
              "comentarios": mensajePersonalizado,
              // Si respondemos a un mensaje específico, enviamos su ID, si no, null
              "respuesta_a": datosSolicitud?.idmensaje || null 
          };

          await fetch('http://100.123.6.123:8000/api/admin/solicitudes/responder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          console.log("✅ Notificación enviada con éxito.");

      } catch (error) {
          console.error("⚠️ Error al notificar al usuario:", error);
          // No mostramos alert aquí para no interrumpir el flujo principal, es un proceso de fondo
      }
  };

  // --- LÓGICA DE ACTIVAR / DESACTIVAR ---
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
              // 1. Éxito en el cambio de estado
              setSitio(prev => ({ ...prev, estado: estaActivo ? 'inactivo' : 'activo' }));
              
              // 2. Notificación Automática Inteligente
              if (estaActivo) {
                  // Se desactivó -> Mensaje de "Permiso Concedido"
                  await notificarUsuario("Solicitud Atendida", "Tu sitio ha sido desactivado temporalmente. El modo edición está habilitado. Puedes realizar tus cambios ahora.");
                  alert("Sitio DESACTIVADO. Se envió una notificación al usuario para que proceda a editar.");
              } else {
                  // Se activó -> Mensaje de "Todo listo"
                  await notificarUsuario("Publicación Reactivada", "Tu sitio ha sido revisado y activado nuevamente. Ya es visible para los turistas.");
                  alert("Sitio ACTIVADO. Se notificó al usuario.");
              }

          } else {
              const err = await respuesta.json();
              alert("Error del servidor: " + (err.message || "No se pudo cambiar el estado."));
          }

      } catch (error) {
          console.error("Error de red:", error);
          alert("Error de conexión.");
      } finally {
          setProcesando(false);
      }
  };

  // --- LÓGICA DE ELIMINAR ---
  const eliminarSitio = async () => {
      if(window.confirm("⚠️ PELIGRO CRÍTICO ⚠️\n\n¿Estás seguro de ELIMINAR PERMANENTEMENTE este sitio?\nEsta acción es irreversible.")) {
          // NOTA: Cuando tengas la ruta de DELETE de Julio, descomenta esto:
          /*
          try {
             await fetch(`http://100.123.6.123:8000/api/admin/publicaciones/eliminar/${id}`, { method: 'DELETE' ... });
             
             // Notificar antes de irnos (si es posible)
             await notificarUsuario("Sitio Eliminado", "Tu solicitud de baja ha sido procesada. El sitio ha sido eliminado permanentemente.");
             
             alert("Sitio eliminado.");
             navigate('/dashboard');
          } catch(e) { alert("Error"); }
          */
         alert("Falta endpoint DELETE. Pero la lógica de notificación está lista en el código.");
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

      {/* HERO */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-slate-900">
        <img 
            src={`http://100.123.6.123:8000/storage/preformularios/${sitio.imagen}`} 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => e.target.src = 'https://via.placeholder.com/1920x600?text=Sin+Imagen'}
            alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-[100] cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">← Volver</button>
        <div className="absolute bottom-0 left-0 w-full p-10 md:p-20 text-white">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                {Array.isArray(sitio.clasificacion) ? sitio.clasificacion[0] : sitio.clasificacion}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 leading-none">{sitio.nombre}</h1>
            <p className="text-sm md:text-xl font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                📍 {sitio.departamento} | {sitio.municipio} | {sitio.distrito || 'S/D'}
            </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Sobre este destino</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">{sitio.descripcion}</p>
            </div>
            <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden h-96">
                 <div className="w-full h-full rounded-[2.5rem] overflow-hidden opacity-90 pointer-events-none">
                    <MapaFormulario ubicacionActual={sitio.ubicacion} />
                 </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Políticas de Entrada</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(sitio.politicas).map(([key, value]) => (
                        value === true && (
                            <div key={key} className="flex items-center gap-3 text-slate-500">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>

        {/* DERECHA (SIDEBAR) */}
        <div className="space-y-6">
            
            <div className={`text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden transition-colors duration-500 ${sitio.estado === 'activo' ? 'bg-green-600' : 'bg-red-500'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🛡️</div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-white/60">Estado Actual</h3>
                <p className="text-4xl font-black uppercase tracking-tighter text-white mb-6">{sitio.estado}</p>
                <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] text-white/60 uppercase font-black">ID Publicación</p>
                        <p className="text-[9px] font-mono break-all text-white">{sitio.idpublicacion}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Horarios</h3>
                <div className="space-y-3">
                    {diasSemana.map((dia) => {
                        const valorHorario = sitio.horarios[dia];
                        const mostrarTexto = valorHorario ? valorHorario : 'Cerrado';
                        const estaAbierto = !!valorHorario;
                        return (
                            <div key={dia} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">{dia}</span>
                                <span className={`text-xs font-bold uppercase tracking-widest ${estaAbierto ? 'text-slate-700' : 'text-slate-300'}`}>{mostrarTexto}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ZONA DE GESTIÓN */}
            <div ref={zonaGestionRef} className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-200 text-center scroll-mt-24">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Zona de Gestión</h3>
                <div className="space-y-3">
                    
                    <button 
                        disabled={procesando}
                        onClick={alternarEstadoSitio}
                        className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border
                            ${sitio.estado === 'activo' 
                                ? 'bg-white border-orange-200 text-orange-500 hover:bg-orange-500 hover:text-white' 
                                : 'bg-green-500 border-green-500 text-white hover:bg-green-600 shadow-green-200 shadow-lg'
                            } ${procesando ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {procesando ? 'Procesando...' : (sitio.estado === 'activo' ? 'Ocultar / Desactivar' : 'Activar / Publicar')}
                    </button>

                    <button 
                        disabled={procesando}
                        onClick={eliminarSitio}
                        className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                        Eliminar Sitio
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}