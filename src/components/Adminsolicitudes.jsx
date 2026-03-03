import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSolicitudes() {
  const navigate = useNavigate();
  const sesionAdmin = JSON.parse(localStorage.getItem('usuarioLogueado')) || { nombre: 'Admin General' };
  const procesarSolicitud = (solicitud, decision) => {
    if (decision === 'aprobar') {
      if (solicitud.tipo === 'ACTUALIZAR') {
        navigate(`/editar/${solicitud.idpublicacion}`, { 
            state: { modoAdmin: true, adminId: sesionAdmin.idusuario } 
        });
      } else {
        alert("Simulación: Sitio eliminado de la base de datos.");
        setSolicitudes(prev => prev.filter(s => s.id_solicitud !== solicitud.id_solicitud));
      }
    } else {
      if(window.confirm("¿Rechazar esta solicitud?")) {
        setSolicitudes(prev => prev.filter(s => s.id_solicitud !== solicitud.id_solicitud));
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 italic text-left">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-between items-end border-b-4 border-slate-800 pb-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none">Centro de Solicitudes</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Gestión de cambios pendientes</p>
          </div>
          <div className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            {solicitudes.length} Pendientes
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {solicitudes.length === 0 ? (
             <div className="p-20 text-center text-slate-300 font-black uppercase text-xl border-2 border-dashed border-slate-200 rounded-[3rem]">
                No hay solicitudes pendientes
             </div>
          ) : (
            solicitudes.map((sol) => (
              <div key={sol.id_solicitud} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-2xl transition-all duration-300">

                <div className={`w-full md:w-24 h-24 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${
                    sol.tipo === 'ELIMINAR' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                }`}>
                    {sol.tipo === 'ELIMINAR' ? '🗑️' : '✏️'}
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                sol.tipo === 'ELIMINAR' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                Solicitud de {sol.tipo}
                            </span>
                            <h3 className="text-2xl font-black text-slate-800 uppercase mt-2">{sol.nombre_sitio}</h3>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{sol.fecha}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Comentario del Colaborador ({sol.colaborador})</p>
                        <p className="text-xs font-bold text-slate-600 italic">"{sol.comentario}"</p>
                    </div>
                    <p className="text-[8px] font-mono text-slate-300">
                        ID PUB: {sol.idpublicacion}
                    </p>
                </div>
                <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                    <button 
                        onClick={() => procesarSolicitud(sol, 'aprobar')}
                        className="flex-1 bg-slate-800 hover:bg-black text-white font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        ✓ Aprobar
                    </button>
                    <button 
                        onClick={() => procesarSolicitud(sol, 'rechazar')}
                        className="flex-1 bg-white border-2 border-slate-100 hover:bg-red-50 hover:border-red-100 text-slate-400 hover:text-red-500 font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                        ✕ Rechazar
                    </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}