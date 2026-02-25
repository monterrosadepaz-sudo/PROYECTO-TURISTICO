import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DetalleDestino() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sesionActiva] = useState(JSON.parse(localStorage.getItem('usuarioLogueado')) || {});
  
  // Gestión de Fotos
  const [fotoActual, setFotoActual] = useState(0);
  
  // Extracción blindada: Evita que React truene si el lote viene vacío o en string
  let fotosPlanas = [];
  if (sitio?.lote_imagenes) {
    const lote = typeof sitio.lote_imagenes === 'string' 
        ? JSON.parse(sitio.lote_imagenes) 
        : sitio.lote_imagenes;
    fotosPlanas = lote?.plana || [];
  }

  // Gestión de Solicitudes
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [tipoAccion, setTipoAccion] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const obtenerInformacion = async () => {
      try {
        const respuesta = await fetch(`http://100.123.6.123:8000/api/colaborador/publicaciones/${id}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setSitio({
            ...datos,
            politicas: typeof datos.politicas === 'string' ? JSON.parse(datos.politicas) : (datos.politicas || {}),
            horarios: typeof datos.horarios === 'string' ? JSON.parse(datos.horarios) : (datos.horarios || {})
          });
        }
      } catch (error) {
        console.error("Error al sincronizar:", error);
      } finally {
        setCargando(false);
      }
    };
    if (id) obtenerInformacion();
  }, [id]);

  const enviarPeticionAdmin = async () => {
    if (tipoAccion === 'ELIMINAR' && !comentario.trim()) {
      return alert("⚠️ El motivo es obligatorio para eliminar.");
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
        alert(`Solicitud enviada con éxito.`);
        setMostrarSolicitud(false);
        setComentario('');
      }
    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-blue-600 animate-pulse uppercase tracking-widest text-xs">
      Sincronizando propuesta...
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 font-sans italic text-left">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="font-black text-[9px] uppercase text-slate-400 hover:text-blue-600 transition-all tracking-[0.2em]">
          ← Volver
        </button>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Vista de Colaborador</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 space-y-10">
        
        {/* ENCABEZADO: Título Proporcional */}
        <div className="space-y-1">
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">
            {sitio.municipio || "Destino Local"}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
            {sitio.nombre}
          </h1>
        </div>

        {/* --- INICIO CARRUSEL PROFESIONAL --- */}
        <div className="w-full max-w-5xl mx-auto aspect-video max-h-[450px] rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100 relative bg-slate-800 mb-12">
          {fotosPlanas.length > 0 ? (
            <>
              <img 
                src={`http://100.123.6.123:8000/storage/preformularios/${fotosPlanas[fotoActual]}`} 
                alt={`Vista ${fotoActual + 1}`}
                className="w-full h-full object-cover animate-in fade-in duration-500"
              />
              
              {/* Etiqueta flotante elegante */}
              <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-full uppercase shadow-lg">
                Galería del Destino
              </div>

              {/* Contador */}
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-full">
                {fotoActual + 1} / {fotosPlanas.length}
              </div>

              {/* Flechas de navegación */}
              {fotosPlanas.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => setFotoActual(prev => (prev === 0 ? fotosPlanas.length - 1 : prev - 1))} className="w-10 h-10 bg-white/90 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center text-slate-800 font-black shadow-2xl transition-all">
                    ❮
                  </button>
                  <button onClick={() => setFotoActual(prev => (prev === fotosPlanas.length - 1 ? 0 : prev + 1))} className="w-10 h-10 bg-white/90 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center text-slate-800 font-black shadow-2xl transition-all">
                    ❯
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center text-slate-400">
              <span className="text-5xl mb-4">📸</span>
              <p className="text-[10px] font-black tracking-widest uppercase italic">Esperando carga de imágenes</p>
            </div>
          )}
        </div>
        {/* --- FIN CARRUSEL PROFESIONAL --- */}

        {/* --- INICIO RESEÑA LIMPIA --- */}
        <section className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              01. Reseña del Destino
            </h2>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>
          
          {/* Caja con fondo sutil para dar lectura profesional */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-lg text-slate-700 leading-relaxed font-medium italic tracking-tight">
              "{sitio.descripcion || "El creador no proporcionó una descripción detallada para este destino."}"
            </p>
          </div>
        </section>
        {/* --- FIN RESEÑA LIMPIA --- */}

        {/* INFO GRID: Limpio y sin saturación */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ubicación</h4>
            <p className="text-xs font-bold text-slate-800 uppercase italic leading-tight">
              {sitio.distrito}, {sitio.departamento}
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Coordenadas</h4>
            <p className="text-[10px] font-mono font-bold text-blue-600 uppercase">
              {sitio.latitud} <br/> {sitio.longitud}
            </p>
          </div>
        </div>

        {/* GESTIÓN DE COLABORADOR (07) */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/20">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8 italic">07. Panel de Gestión</h4>

          {!mostrarSolicitud ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-inner">
                  {sesionActiva.nombre?.charAt(0)}
                </div>
                <div>
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Colaborador Activo</p>
                  <h3 className="text-xl font-black uppercase italic leading-none">{sesionActiva.nombre}</h3>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => { setTipoAccion('ELIMINAR'); setMostrarSolicitud(true); }} className="flex-1 px-6 py-4 bg-white/10 hover:bg-red-500/20 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all border border-white/10">Eliminar</button>
                <button onClick={() => { setTipoAccion('ACTUALIZAR'); setMostrarSolicitud(true); }} className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg shadow-blue-600/20">Actualizar</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-6 bg-white/5 rounded-3xl border-l-4 border-blue-500">
                <p className="text-[11px] font-bold uppercase italic tracking-tight">
                  Trámite de <span className="text-blue-400 font-black">{tipoAccion}</span> para: <br/>
                  <span className="text-lg font-black text-white leading-none">"{sitio.nombre}"</span>
                </p>
              </div>
              <textarea 
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escriba el motivo aquí..."
                className="w-full p-6 bg-white/10 rounded-2xl border-none text-xs font-bold italic h-24 text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <div className="flex gap-2">
                <button onClick={() => setMostrarSolicitud(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-xl font-black uppercase text-[9px] tracking-widest">Cancelar</button>
                <button onClick={enviarPeticionAdmin} disabled={enviando} className={`flex-1 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${tipoAccion === 'ELIMINAR' ? 'bg-red-600' : 'bg-blue-600'}`}>
                  {enviando ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}