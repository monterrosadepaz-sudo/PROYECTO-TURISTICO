import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DetalleDestino() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sesionActiva] = useState(JSON.parse(localStorage.getItem('usuarioLogueado')) || {});
  
  // ESTADOS PARA LA GESTIÓN DE PETICIONES
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [tipoAccion, setTipoAccion] = useState(''); 
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const obtenerInformacion = async () => {
      try {
        // SOLUCIÓN AL ERROR 405: Usamos el endpoint habilitado para colaboradores
        const respuesta = await fetch(`http://100.123.6.123:8000/api/colaborador/publicaciones/${id}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (respuesta.ok) {
          const datos = await respuesta.json();
          // Mapeo de datos recibidos: Normalizamos JSON si vienen como strings
          setSitio({
            ...datos,
            politicas: typeof datos.politicas === 'string' ? JSON.parse(datos.politicas) : (datos.politicas || {}),
            horarios: typeof datos.horarios === 'string' ? JSON.parse(datos.horarios) : (datos.horarios || {})
          });
        } else {
          console.error("Error en la respuesta del servidor:", respuesta.status);
        }
      } catch (error) {
        console.error("Error al sincronizar con la API de colaborador:", error);
      } finally {
        setCargando(false);
      }
    };
    if (id) obtenerInformacion();
  }, [id]);

  const enviarPeticionAdmin = async () => {
    // VALIDACIÓN: El motivo es obligatorio solo para ELIMINAR
    if (tipoAccion === 'ELIMINAR' && !comentario.trim()) {
      return alert("⚠️ Para eliminar una publicación, es obligatorio escribir el motivo.");
    }

    setEnviando(true);
    try {
      const payload = {
        id_usuario: sesionActiva.idusuario,
        nombre_usuario: sesionActiva.nombre,
        id_publicacion: id,
        nombre_publicacion: sitio.nombre,
        accion: tipoAccion,
        comentario: comentario
      };

      const res = await fetch('http://100.123.6.123:8000/api/admin/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Solicitud de ${tipoAccion} enviada con éxito al administrador.`);
        setMostrarSolicitud(false);
        setComentario('');
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-white italic font-black text-blue-600 animate-pulse uppercase tracking-widest">
      Sincronizando datos de {sesionActiva.nombre}...
    </div>
  );

  if (!sitio) return (
    <div className="min-h-screen flex items-center justify-center bg-white italic font-black text-slate-400 uppercase tracking-widest">
      No se encontró información de esta publicación.
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 italic font-sans text-left">
      {/* BOTÓN REGRESAR */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 font-black text-[10px] uppercase text-slate-400 hover:text-blue-600 transition-all italic tracking-widest">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Regresar a mis propuestas
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 px-6">
        {/* TÍTULO E IMAGEN DINÁMICA */}
        <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
          {sitio.nombre}
        </h1>
        
        <div className="aspect-video rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-slate-50 bg-slate-100">
          <img 
            src={`http://100.123.6.123:8000/storage/preformularios/${sitio.imagen}`} 
            className="w-full h-full object-cover" 
            alt={sitio.nombre} 
          />
        </div>

        {/* --- SECCIÓN 07 INTEGRADA: IDENTIFICACIÓN Y GESTIÓN --- */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 italic">
          <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-10">
            07. Identificación del Colaborador
          </h4>

          {!mostrarSolicitud ? (
            <div className="space-y-10">
              {/* BLOQUE DE USUARIO LOGUEADO */}
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Emisor de la propuesta</p>
                <h3 className="text-3xl font-black text-slate-800 uppercase italic leading-none">
                  Enviada bajo el nombre de: <span className="text-blue-600">{sesionActiva.nombre}</span>
                </h3>
                
                <div className="mt-6 inline-flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs italic">!</div>
                  <p className="text-xs font-bold text-blue-600 underline decoration-2 underline-offset-4">{sesionActiva.email}</p>
                </div>
              </div>

              {/* BOTONES DE GESTIÓN (Sustituyen a guardar/cancelar) */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button 
                  onClick={() => { setTipoAccion('ELIMINAR'); setMostrarSolicitud(true); }}
                  className="flex-1 py-6 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all"
                >
                  Eliminar Publicación
                </button>
                <button 
                  onClick={() => { setTipoAccion('ACTUALIZAR'); setMostrarSolicitud(true); }}
                  className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  Actualizar Datos
                </button>
              </div>
            </div>
          ) : (
            /* VISTA DE CONFIRMACIÓN CON MENSAJE DINÁMICO */
            <div className="animate-in zoom-in-95 duration-300 space-y-8">
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border-l-[12px] border-blue-600">
                <p className="text-[13px] font-medium text-slate-700 leading-relaxed italic">
                  Se enviará una solicitud al administrador bajo el nombre de 
                  <span className="font-black text-blue-700 uppercase"> "{sesionActiva.nombre}"</span> para 
                  <span className="font-black text-red-600 uppercase"> {tipoAccion === 'ELIMINAR' ? 'ELIMINAR' : 'EDITAR'}</span> la siguiente publicación: 
                  <span className="font-black text-slate-900 uppercase italic"> "{sitio.nombre}"</span>.
                </p>
              </div>

              <div className="space-y-3 px-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">
                  Motivo de la solicitud {tipoAccion === 'ELIMINAR' ? '(Obligatorio)' : '(Opcional)'}
                </label>
                <textarea 
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder={tipoAccion === 'ELIMINAR' ? "Explica por qué deseas eliminar este sitio..." : "Describe qué información deseas actualizar..."}
                  className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-none text-sm font-bold italic h-40 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setMostrarSolicitud(false); setComentario(''); }} 
                  className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Volver
                </button>
                <button 
                  onClick={enviarPeticionAdmin}
                  disabled={enviando}
                  className={`flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg transition-all ${tipoAccion === 'ELIMINAR' ? 'bg-red-600 shadow-red-100' : 'bg-blue-600 shadow-blue-100'}`}
                >
                  {enviando ? 'Enviando...' : 'Confirmar Solicitud'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}