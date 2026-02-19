import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MisPropuestas() {
  const navigate = useNavigate();
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [filtro, setFiltro] = useState('todos'); 

  const sesion = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const cargarPropuestas = async () => {
    if (!sesion?.idusuario) return;
    setCargando(true);
    
    try {
      // Arrays temporales para guardar lo que encontremos
      let listaOficiales = [];
      let listaBorradores = [];

      // 1. PEDIR LAS OFICIALES (Publicadas)
      try {
        const urlOficial = `http://100.123.6.123:8000/api/colaborador/publicaciones/listar?colaborador_id=${sesion.idusuario}`;
        const respOficial = await fetch(urlOficial, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' } 
        });
        
        if (respOficial.ok) {
            listaOficiales = await respOficial.json();
        } else if (respOficial.status === 404) {
            // Si es 404, significa que no tiene oficiales, es normal. No hacemos nada.
            console.log("Info: No hay publicaciones oficiales activas.");
        }
      } catch (e) {
        console.warn("Error de red al buscar oficiales (no crítico)", e);
      }

      // 2. PEDIR LOS BORRADORES / PENDIENTES
      try {
        const urlBorradores = `http://100.123.6.123:8000/api/preformularios/listar`;
        const respBorrador = await fetch(urlBorradores, {
          method: 'POST',
          headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "usuario": sesion.idusuario })
        });
        
        if (respBorrador.ok) {
            const dataBorradores = await respBorrador.json();
            // Filtramos para ignorar los "aprobados" (porque esos ya vienen en listaOficiales si el backend lo maneja así).
            listaBorradores = dataBorradores.filter(p => 
                p.estado?.toLowerCase() === 'pendiente' || p.estado?.toLowerCase() === 'rechazado'
            );
        } else if (respBorrador.status === 404) {
             console.log("Info: No hay borradores pendientes.");
        }
      } catch (e) { 
        console.warn("Error de red al buscar borradores (no crítico)", e);
      }

      // 3. JUNTAR AMBAS LISTAS (Si ambas fallaron, será un array vacío y no pasa nada)
      setPropuestas([...listaOficiales, ...listaBorradores]);

    } catch (error) {
      console.error("Error general crítico:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, []);

  const manejarEliminar = async (e, item) => {
    e.stopPropagation(); 
    if (!window.confirm("¿Eliminar este registro permanentemente?")) return;

    const esPublicacion = !!item.idpublicacion;
    const url = esPublicacion
      ? `http://100.123.6.123:8000/api/colaborador/publicaciones/${item.idpublicacion}`
      : `http://100.123.6.123:8000/api/preformularios/borrar/${item.idpreformulario}`;

    try {
      const opciones = esPublicacion 
        ? { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ "colaborador_id": sesion.idusuario }) }
        : { method: 'DELETE', headers: {'Accept': 'application/json'} };

      const respuesta = await fetch(url, opciones);

      if (respuesta.ok) {
        setPropuestas(prev => prev.filter(p => (p.idpublicacion || p.idpreformulario) !== (item.idpublicacion || item.idpreformulario)));
      } else {
        alert("Error al eliminar.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const propuestasFiltradas = propuestas.filter(p => {
    if (filtro === 'todos') return true;
    if (filtro === 'publicados') return !!p.idpublicacion; 
    
    // Si no tiene ID oficial (es un preformulario), revisamos su estado:
    if (filtro === 'pendientes') return !p.idpublicacion && p.estado?.toLowerCase() === 'pendiente';
    if (filtro === 'rechazados') return !p.idpublicacion && p.estado?.toLowerCase() === 'rechazado';
    
    return true;
  });

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">
      Cargando tus propuestas...
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 italic text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-blue-800 pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-black text-blue-800 uppercase tracking-tighter leading-none">Mis Propuestas</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Gestión Oficial</p>
          </div>
          <button onClick={() => navigate("/publicar")} className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 italic">
            + Nueva Propuesta
          </button>
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setFiltro('todos')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'todos' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
          >
            Todos ({propuestas.length})
          </button>
          <button 
            onClick={() => setFiltro('publicados')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'publicados' ? 'bg-green-500 text-white shadow-md shadow-green-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
          >
            Publicados ({propuestas.filter(p => !!p.idpublicacion).length})
          </button>
          
          <button 
            onClick={() => setFiltro('pendientes')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'pendientes' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
          >
            Pendientes ({propuestas.filter(p => !p.idpublicacion && p.estado?.toLowerCase() === 'pendiente').length})
          </button>

          <button 
            onClick={() => setFiltro('rechazados')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === 'rechazados' ? 'bg-red-500 text-white shadow-md shadow-red-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
          >
            Rechazados ({propuestas.filter(p => !p.idpublicacion && p.estado?.toLowerCase() === 'rechazado').length})
          </button>
        </div>

        {/* LISTADO DE TARJETAS */}
        {propuestasFiltradas.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic font-black">
              No hay destinos en esta categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propuestasFiltradas.map((p) => {
              const idNavegacion = p.idpublicacion || p.idpreformulario;
              let tags = ["TURISMO"];
              try { tags = typeof p.clasificacion === 'string' ? JSON.parse(p.clasificacion) : p.clasificacion; } catch(e){}

              // Lógica de color de estado (Incluye INACTIVO GRIS)
              const estadoLower = p.estado?.toLowerCase() || '';
              let colorEstado = 'bg-green-500'; // Default activo
              if (estadoLower === 'pendiente') colorEstado = 'bg-amber-500';
              else if (estadoLower === 'rechazado') colorEstado = 'bg-red-500';
              else if (estadoLower === 'inactivo') colorEstado = 'bg-slate-500'; // GRIS

              return (
                <div 
                  key={idNavegacion} 
                  onClick={() => navigate(`/editar/${idNavegacion}`)} 
                  className="group bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-500 cursor-pointer relative"
                >
                  <button onClick={(e) => manejarEliminar(e, p)} className="absolute top-4 left-4 z-20 bg-red-600 text-white font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700 active:scale-90">
                    Eliminar
                  </button>

                  <div className="h-52 relative overflow-hidden bg-slate-200">
                    <img 
                      src={`http://100.123.6.123:8000/storage/preformularios/${p.imagen}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Turismo+SV'}
                      alt=""
                    />
                    
                    <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border-2 border-white text-white ${colorEstado}`}>
                      {p.estado || 'DESCONOCIDO'}
                    </div>
                  </div>

                  <div className="p-8 flex-grow space-y-4 bg-gradient-to-b from-white to-slate-50/30">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase leading-tight mb-1 italic group-hover:text-blue-600 transition-colors line-clamp-1">{p.nombre}</h4>
                      <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest italic">{p.departamento} | {p.municipio}</p>
                    </div>
                      <div className="flex gap-2">
                        {Array.isArray(tags) && tags.map((t,i) => <span key={i} className="text-[7px] bg-slate-100 px-2 py-1 rounded font-bold uppercase text-slate-400">{t}</span>)}
                    </div>
                    <p className="text-[7px] text-slate-300 font-mono text-center pt-2">
                        {p.idpublicacion ? 'OFICIAL' : 'BORRADOR'}
                    </p>
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