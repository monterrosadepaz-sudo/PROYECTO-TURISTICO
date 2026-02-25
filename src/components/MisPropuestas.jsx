import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalConfirmacionEliminar = ({ visible, alCerrar, alConfirmar, item, procesando }) => {
  if (!visible || !item) return null;
  const nombreSitio = item.nombre || 'este sitio';

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border border-red-100">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🗑️</div>
        <h3 className="text-xl font-black text-slate-800 uppercase italic mb-2 tracking-tighter">¿Eliminar Propuesta?</h3>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
          Estás a punto de borrar permanentemente <br/> <span className="text-red-600 font-black text-xs">"{nombreSitio}"</span>. <br/>Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button disabled={procesando} onClick={alCerrar} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <button disabled={procesando} onClick={() => alConfirmar(item)} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95">
            {procesando ? 'Borrando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE TOAST (NOTIFICACIÓN FLOTANTE) ---
const NotificacionToast = ({ visible, mensaje, tipo }) => {
  if (!visible) return null;
  const esExito = tipo === 'exito';
  const bgColor = esExito ? 'bg-slate-900' : 'bg-red-600';
  const iconBg = esExito ? 'bg-green-500' : 'bg-white/20';
  const iconText = esExito ? '✓' : '✕';
  const textColorSecondary = esExito ? 'text-green-400' : 'text-red-200';

  return (
    <div className={`fixed bottom-10 right-10 z-[9999] ${bgColor} text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 border ${esExito ? 'border-slate-700' : 'border-red-500'}`}>
      <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center text-sm shadow-inner font-black`}>{iconText}</div>
      <p className="font-black uppercase text-[10px] tracking-widest italic leading-relaxed">
        {mensaje.titulo}<br/><span className={textColorSecondary}>{mensaje.subtitulo}</span>
      </p>
    </div>
  );
};

export default function MisPropuestas() {
  const navigate = useNavigate();
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos'); 
  
  const [modalEliminar, setModalEliminar] = useState({ visible: false, item: null });
  const [procesandoEliminacion, setProcesandoEliminacion] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: { titulo: '', subtitulo: '' }, tipo: 'exito' });

  const sesion = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const mostrarToast = (titulo, subtitulo, tipo = 'exito') => {
    setToast({ visible: true, mensaje: { titulo, subtitulo }, tipo });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const cargarPropuestas = async () => {
    if (!sesion?.idusuario) return;
    setCargando(true);
    
    try {
      let listaCombinada = [];

      try {
        const urlOficial = `http://100.123.6.123:8000/api/colaborador/publicaciones/listar?colaborador_id=${sesion.idusuario}`;
        const respOficial = await fetch(urlOficial, { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (respOficial.ok) {
            const data = await respOficial.json();
            listaCombinada = [...listaCombinada, ...data.map(p => ({ ...p, isOficial: true }))];
        }
      } catch (e) { }

      try {
        const urlBorradores = `http://100.123.6.123:8000/api/preformularios/listar`;
        const respBorrador = await fetch(urlBorradores, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ "usuario": sesion.idusuario })
        });
        if (respBorrador.ok) {
            const dataBorradores = await respBorrador.json();
            listaCombinada = [...listaCombinada, ...dataBorradores
                .filter(p => p.estado?.toLowerCase() === 'pendiente' || p.estado?.toLowerCase() === 'rechazado')
                .map(p => ({ ...p, isOficial: false }))];
        }
      } catch (e) { }

      const unicos = Array.from(new Map(listaCombinada.map(item => [(item.idpublicacion || item.idpreformulario || item.id), item])).values());
      setPropuestas(unicos);
    } catch (error) { console.error(error); } 
    finally { setCargando(false); }
  };

  useEffect(() => { cargarPropuestas(); }, []);

  // --- INTERCEPTOR DE CLIC: EVALÚA LAS REGLAS ANTES DE ABRIR EL MODAL ---
  const abrirModalEliminar = (e, item) => { 
    e.stopPropagation(); 
    const estadoLower = item.estado?.toLowerCase() || '';

    // Regla restaurada: Si es oficial pero no está inactiva, lanzamos tu Alert favorito y cortamos.
    if (item.isOficial && estadoLower !== 'inactivo') {
        alert("🔒 REGLA DE SEGURIDAD:\nSolo puedes eliminar sitios que estén en estado 'INACTIVO'.\n\nPor favor, entra a la propuesta y usa el botón 'Solicitar Eliminar' para que el administrador la desactive primero.");
        return;
    }

    setModalEliminar({ visible: true, item }); 
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const confirmarEliminacion = async (item) => {
    setProcesandoEliminacion(true);
    const idTarget = item.idpublicacion || item.idpreformulario || item.id;
    const esOficial = item.isOficial;
    
    const url = esOficial
      ? `http://100.123.6.123:8000/api/colaborador/publicaciones/borrar/${idTarget}`
      : `http://100.123.6.123:8000/api/preformularios/borrar/${idTarget}`;

    try {
      const opciones = {
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(esOficial ? { "colaborador_id": sesion.idusuario } : { "idusuario": sesion.idusuario })
      };

      const respuesta = await fetch(url, opciones);

      if (respuesta.ok) {
        setPropuestas(prev => prev.filter(p => (p.idpublicacion || p.idpreformulario || p.id) !== idTarget));
        setModalEliminar({ visible: false, item: null });
        mostrarToast("¡Propuesta Eliminada!", "Borrada permanentemente");
      } else {
        const errorData = await respuesta.json();
        setModalEliminar({ visible: false, item: null });
        mostrarToast("Error del servidor", errorData.error || errorData.message || "No se pudo borrar", "error");
      }
    } catch (error) { 
        setModalEliminar({ visible: false, item: null });
        mostrarToast("Error de conexión", "Verifica tu internet", "error");
    } 
    finally { setProcesandoEliminacion(false); }
  };

  const propuestasFiltradas = propuestas.filter(p => {
    const est = p.estado?.toLowerCase() || '';
    const esBorrador = est === 'pendiente' || est === 'rechazado' || !!p.idpreformulario;
    if (filtro === 'todos') return true;
    if (filtro === 'publicados') return !esBorrador; 
    if (filtro === 'pendientes') return est === 'pendiente';
    if (filtro === 'rechazados') return est === 'rechazado';
    return true;
  });

  if (cargando) return <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 italic text-left relative overflow-hidden">
      
      {/* COMPONENTES FLOTANTES */}
      <NotificacionToast visible={toast.visible} mensaje={toast.mensaje} tipo={toast.tipo} />
      <ModalConfirmacionEliminar visible={modalEliminar.visible} item={modalEliminar.item} procesando={procesandoEliminacion} alCerrar={() => setModalEliminar({ visible: false, item: null })} alConfirmar={confirmarEliminacion} />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-blue-800 pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-black text-blue-800 uppercase tracking-tighter leading-none">Mis Propuestas</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Gestión Oficial</p>
          </div>
          <button onClick={() => navigate("/publicar")} className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 italic">+ Nueva Propuesta</button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setFiltro('todos')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'todos' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}>Todos</button>
          <button onClick={() => setFiltro('publicados')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'publicados' ? 'bg-green-500 text-white shadow-md shadow-green-100' : 'bg-white text-slate-400 border border-slate-200'}`}>Publicados</button>
          <button onClick={() => setFiltro('pendientes')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'pendientes' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-white text-slate-400 border border-slate-200'}`}>Pendientes</button>
          <button onClick={() => setFiltro('rechazados')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'rechazados' ? 'bg-red-500 text-white shadow-md shadow-red-100' : 'bg-white text-slate-400 border border-slate-200'}`}>Rechazados</button>
        </div>

        {propuestasFiltradas.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic font-black">No hay destinos.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propuestasFiltradas.map((p) => {
              const idNavegacion = p.idpublicacion || p.idpreformulario || p.id;
              let tags = ["TURISMO"];
              try { tags = typeof p.clasificacion === 'string' ? JSON.parse(p.clasificacion) : p.clasificacion; } catch(e){}

              const est = p.estado?.toLowerCase() || '';
              const esBorrador = est === 'pendiente' || est === 'rechazado' || !!p.idpreformulario;
              let colorEstado = 'bg-green-500'; 
              if (est === 'pendiente') colorEstado = 'bg-amber-500';
              else if (est === 'rechazado') colorEstado = 'bg-red-500';
              else if (est === 'inactivo') colorEstado = 'bg-slate-500'; 

              const carpetaImg = esBorrador ? 'preformularios' : 'fotos';

              return (
                <div key={idNavegacion} onClick={() => navigate(`/editar/${idNavegacion}`)} className="group bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-500 cursor-pointer relative">
                  
                  {/* MAGIA: EL BOTÓN DE ELIMINAR AHORA SOLO EXISTE SI ES OFICIAL */}
                  {p.isOficial && (
                      <button onClick={(e) => abrirModalEliminar(e, p)} className="absolute top-4 left-4 z-20 bg-red-600/90 backdrop-blur-sm text-white font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700 active:scale-90 flex items-center gap-2">
                        <span>🗑️</span> Eliminar
                      </button>
                  )}
                  
                  <div className="h-52 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-0"><span className="text-3xl mb-2 opacity-50">📷</span><span className="text-[9px] font-black uppercase tracking-widest opacity-50">Sin Foto</span></div>
                    <img src={`http://100.123.6.123:8000/storage/${carpetaImg}/${p.imagen}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100 z-10 relative" onError={(e) => { if (!e.target.dataset.retried) { e.target.dataset.retried = true; const fallback = carpetaImg === 'fotos' ? 'preformularios' : 'fotos'; e.target.src = `http://100.123.6.123:8000/storage/${fallback}/${p.imagen}`; } else { e.target.style.display = 'none'; } }} alt="" />
                    <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border-2 border-white text-white z-20 ${colorEstado}`}>{p.estado || 'DESCONOCIDO'}</div>
                  </div>
                  <div className="p-8 flex-grow space-y-4 bg-gradient-to-b from-white to-slate-50/30 relative z-20">
                    <div><h4 className="text-xl font-black text-slate-800 uppercase leading-tight mb-1 italic group-hover:text-blue-600 transition-colors line-clamp-1">{p.nombre}</h4><p className="text-blue-600 text-[9px] font-black uppercase tracking-widest italic">{p.departamento} | {p.municipio}</p></div>
                    <div className="flex gap-2 flex-wrap">{Array.isArray(tags) && tags.map((t,i) => <span key={i} className="text-[7px] bg-slate-100 px-2 py-1 rounded font-bold uppercase text-slate-400">{t}</span>)}</div>
                    <p className="text-[7px] text-slate-300 font-mono text-center pt-2">{esBorrador ? 'BORRADOR' : 'OFICIAL'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}