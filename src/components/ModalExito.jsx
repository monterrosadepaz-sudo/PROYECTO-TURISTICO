import React from 'react';

export default function ModalExito({ visible, alCerrar, correo }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-blue-100 italic">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm font-black">
          ✓
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">
          ¡Propuesta Enviada!
        </h2>
        <p className="text-slate-500 text-[11px] leading-relaxed mb-8">
          TU DESTINO HA SIDO REGISTRADO CORRECTAMENTE. SE HA ENVIADO UNA CONFIRMACIÓN A: 
          <span className="block text-blue-600 font-black mt-2 underline decoration-blue-100 underline-offset-4">
            {correo}
          </span>
        </p>
        <button 
          onClick={alCerrar}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 text-[10px] uppercase tracking-widest transition-all active:scale-95"
        >
          VOLVER AL MAPA
        </button>
      </div>
    </div>
  );
}