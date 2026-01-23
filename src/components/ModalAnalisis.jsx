import React from 'react';

export default function ModalAnalisis({ sitio, alCerrar, alAprobar, alRechazar }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl my-auto border border-slate-100 overflow-hidden">
        
        {/* Encabezado: Identificación del Colaborador */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button onClick={alCerrar} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">✕</button>
          <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Petición enviada por:</h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black text-xl">
              {sitio.nombreColaborador.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-bold italic uppercase">{sitio.nombreColaborador}</p>
              <p className="text-xs text-slate-400 font-bold tracking-widest">+503 {sitio.telefonoColaborador} • {sitio.correoColaborador}</p>
            </div>
          </div>
        </div>

        {/* Cuerpo: Información General del Sitio */}
        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-blue-700 text-[10px] font-black uppercase tracking-widest border-b pb-2">Datos del Destino</h5>
              <p className="text-2xl font-black text-slate-800 italic uppercase leading-none">{sitio.nombreSitio}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">📍 {sitio.departamento}</p>
              <img src={sitio.imagenUrl} className="w-full h-48 object-cover rounded-[2rem] shadow-lg border-4 border-slate-50" alt="" />
            </div>

            <div className="space-y-4">
              <h5 className="text-blue-700 text-[10px] font-black uppercase tracking-widest border-b pb-2">Descripción</h5>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{sitio.descripcion}</p>
              
              <div className="pt-2">
                <h5 className="text-blue-700 text-[10px] font-black uppercase tracking-widest border-b pb-2 mb-3">Costos de Entrada</h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                   <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[9px] font-black uppercase text-slate-400">Adul.</p><p className="font-bold text-sm text-slate-700">${sitio.precios?.adultos || '0.00'}</p></div>
                   <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[9px] font-black uppercase text-slate-400">Niños</p><p className="font-bold text-sm text-slate-700">${sitio.precios?.ninos || '0.00'}</p></div>
                   <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[9px] font-black uppercase text-slate-400">3ra Ed.</p><p className="font-bold text-sm text-slate-700">${sitio.precios?.terceraEdad || '0.00'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Decisiones Finales */}
        <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
          <button 
            onClick={() => alRechazar(sitio.id)}
            className="flex-1 py-4 bg-white border-2 border-red-100 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-50 transition-all"
          >
            Rechazar Propuesta
          </button>
          <button 
            onClick={() => alAprobar(sitio.id)}
            className="flex-[2] py-4 bg-green-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transform active:scale-95 transition-all"
          >
            Aprobar y Publicar
          </button>
        </div>
      </div>
    </div>
  );
}