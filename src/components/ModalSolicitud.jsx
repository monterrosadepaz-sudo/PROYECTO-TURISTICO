import React, { useState } from 'react';

export default function ModalSolicitud({ visible, tipo, alCerrar, alConfirmar, procesando }) {
  const [comentario, setComentario] = useState("");
  
  if (!visible) return null;
  
  const esEliminar = tipo === 'eliminar';
  const titulo = esEliminar ? "Solicitar Baja Temporal" : "Solicitar Actualización";
  const mensaje = esEliminar 
    ? "Estás solicitando desactivar este sitio. Si el administrador aprueba, el sitio dejará de ser visible al público hasta que decidas activarlo nuevamente."
    : "Se enviará una notificación al administrador. Si aprueba la solicitud, el sitio pasará a estado 'Inactivo' para que puedas editarlo.";
  const colorBoton = esEliminar ? "bg-slate-800 hover:bg-black" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100 italic relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${esEliminar ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 italic ${esEliminar ? 'text-slate-800' : 'text-blue-800'}`}>{titulo}</h2>
        <p className="text-slate-500 text-[10px] font-bold mb-6 leading-relaxed uppercase tracking-wide">{mensaje}</p>
        <div className="space-y-2 mb-6 text-left">
            <label className="text-[8px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Motivo de la solicitud</label>
            <textarea 
                value={comentario} 
                onChange={(e) => setComentario(e.target.value)} 
                className="w-full px-5 py-4 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none h-28 text-slate-700 font-bold italic text-xs shadow-inner resize-none transition-all" 
                placeholder="Explica brevemente por qué deseas realizar esta acción..." 
            />
        </div>
        <div className="flex gap-3">
            <button onClick={alCerrar} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
            <button onClick={() => alConfirmar(comentario)} disabled={procesando} className={`flex-[1.5] ${colorBoton} text-white font-black py-4 rounded-2xl shadow-lg text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2`}>
                {procesando ? <span>Enviando...</span> : <span>Confirmar Solicitud</span>}
            </button>
        </div>
      </div>
    </div>
  );
}