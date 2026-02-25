import React from 'react';

export default function ModalConfirmacion({ visible, alCerrar, alConfirmar, cantidadFotos, pesoTotal }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100 relative">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm font-black">?</div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">¿Estás seguro?</h3>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-6">
          Estás a punto de enviar la información con <span className="text-blue-600 font-black">{cantidadFotos} archivos adjuntos ({pesoTotal} MB)</span>. 
          <br/>Por favor confirma que la información es correcta.
        </p>
        <div className="flex gap-3">
            <button onClick={alCerrar} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all">
                Revisar
            </button>
            <button onClick={alConfirmar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 text-[9px] uppercase tracking-widest transition-all active:scale-95">
                Sí, Enviar
            </button>
        </div>
      </div>
    </div>
  );
}