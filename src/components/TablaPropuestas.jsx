import React from 'react';

export default function TablaPropuestas({ propuestas, tipo, alAnalizar, alAccionar }) {
  const badgeColor = {
    pendiente: 'bg-amber-100 text-amber-700',
    aprobado: 'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-700',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
            <th className="px-6 py-2">Destino</th>
            <th className="px-6 py-2">Departamento</th>
            {tipo === 'historial' && <th className="px-6 py-2 text-center">Estado</th>}
            <th className="px-6 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propuestas.map((sitio) => (
            <tr key={sitio.id} className="bg-slate-50/50 hover:bg-white transition-all group rounded-2xl">
              <td className="px-6 py-4 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={sitio.imagenUrl} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  <span className="font-bold text-slate-700 text-sm">{sitio.nombreSitio}</span>
                </div>
              </td>
              <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100">
                <span className="text-xs font-black uppercase text-blue-600/60 tracking-wider">{sitio.departamento}</span>
              </td>
              
              {tipo === 'historial' && (
                <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                   <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${badgeColor[sitio.estado]}`}>
                      {sitio.estado}
                    </span>
                </td>
              )}

              <td className="px-6 py-4 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100 text-right">
                <div className="flex justify-end gap-2">
                  {tipo === 'pendientes' && (
                    <button 
                      onClick={() => alAnalizar(sitio)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                    >
                      Analizar Propuesta
                    </button>
                  )}
                  {tipo === 'activos' && (
                    <button onClick={() => alAccionar(sitio.id, 'ocultar')} className="border-2 border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      {sitio.oculto ? 'Mostrar' : 'Ocultar'}
                    </button>
                  )}
                  {sitio.estado === 'rechazado' && (
                    <button onClick={() => alAccionar(sitio.id, 'reanalizar')} className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest">Re-analizar</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}