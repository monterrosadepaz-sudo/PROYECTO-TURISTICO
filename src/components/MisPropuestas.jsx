import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MisPropuestas() {
  const navigate = useNavigate();
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const sesion = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const cargarPropuestas = async () => {
    if (!sesion?.idusuario) return;
    setCargando(true);
    
    try {
      // 1. INTENTAMOS LA RUTA NUEVA DE JULIO (LISTAR)
      // Como es GET, enviamos el ID en la URL como parámetro
      const urlOficial = `http://100.123.6.123:8000/api/colaborador/publicaciones/listar?colaborador_id=${sesion.idusuario}`;
      
      const respuesta = await fetch(urlOficial, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' } 
      });
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setPropuestas(datos);
      } else {
        // Si falla la oficial, intentamos el "Plan B" (Borradores) solo por si acaso
        console.warn("Fallo ruta listar, intentando borradores...");
        const urlBorradores = `http://100.123.6.123:8000/api/preformularios?usuario=${sesion.idusuario}`;
        const respB = await fetch(urlBorradores);
        if(respB.ok) setPropuestas(await respB.json());
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, []);

  const manejarEliminar = async (e, item) => {
    e.stopPropagation(); 
    if (!window.confirm("¿Eliminar este registro?")) return;

    // Detectamos si es borrador o publicación para saber a quién llamar
    const esPublicacion = !!item.idpublicacion;
    const url = esPublicacion
      ? `http://100.123.6.123:8000/api/colaborador/publicaciones/${item.idpublicacion}`
      : `http://100.123.6.123:8000/api/preformularios/${item.idpreformulario}?usuario=${sesion.idusuario}`;

    try {
      const opciones = esPublicacion 
        ? { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ "colaborador_id": sesion.idusuario }) }
        : { method: 'DELETE' };

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

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">
      Cargando listado oficial...
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 italic text-left">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b-4 border-blue-800 pb-6">
          <div>
            <h2 className="text-4xl font-black text-blue-800 uppercase tracking-tighter leading-none">Mis Propuestas</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Gestión Oficial</p>
          </div>
          <button onClick={() => navigate("/publicar")} className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 italic">
            + Nueva Propuesta
          </button>
        </div>

        {propuestas.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic font-black">Lista vacía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propuestas.map((p) => {
              // Usamos el ID que venga (preferencia al oficial)
              const idNavegacion = p.idpublicacion || p.idpreformulario;
              let tags = ["TURISMO"];
              try { tags = typeof p.clasificacion === 'string' ? JSON.parse(p.clasificacion) : p.clasificacion; } catch(e){}

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
                    <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border-2 border-white ${
                      p.estado === 'pendiente' ? 'bg-amber-500 text-white' : 
                      p.estado === 'rechazado' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {p.estado}
                    </div>
                  </div>

                  <div className="p-8 flex-grow space-y-4 bg-gradient-to-b from-white to-slate-50/30">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase leading-tight mb-1 italic group-hover:text-blue-600 transition-colors">{p.nombre}</h4>
                      <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest italic">{p.departamento} | {p.municipio}</p>
                    </div>
                     <div className="flex gap-2">
                        {Array.isArray(tags) && tags.map((t,i) => <span key={i} className="text-[7px] bg-slate-100 px-2 py-1 rounded font-bold uppercase text-slate-400">{t}</span>)}
                    </div>
                    {/* Debug: Mostrar qué ID tenemos */}
                    <p className="text-[7px] text-slate-300 font-mono text-center pt-2">{p.idpublicacion ? 'OFICIAL' : 'BORRADOR'}</p>
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