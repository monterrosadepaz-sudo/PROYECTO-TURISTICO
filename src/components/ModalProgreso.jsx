import React from 'react';

export default function ModalProgreso({ visible, porcentaje, mensaje = "Subiendo archivos..." }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100">
        
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            {/* Animación de carga circular */}
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-blue-600 font-black text-xs">{porcentaje}%</span>
        </div>

        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic mb-1">
          {mensaje}
        </h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Por favor, no cierres esta ventana
        </p>

        {/* Barra de progreso horizontal */}
        <div className="w-full bg-slate-100 rounded-full h-3 mt-6 overflow-hidden shadow-inner">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        
      </div>
    </div>
  );
}