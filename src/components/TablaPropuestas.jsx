import React from 'react';

export default function TablaPropuestas({ propuestas, tipo, alAnalizar, alAccionar, usuarios }) {
  const badgeColor = {
    pendiente: 'bg-amber-100 text-amber-700',
    aprobado: 'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-700',
    administrador: 'bg-purple-100 text-purple-700',
    colaborador: 'bg-blue-100 text-blue-700',
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-red-100 text-red-700'
  };

  // MODO USUARIOS (Se mantiene igual)
  if (tipo === 'usuarios') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="px-6 py-2">Nombre / Registro</th>
              <th className="px-6 py-2">Correo Electrónico</th>
              <th className="px-6 py-2 text-center">Rol</th>
              <th className="px-6 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idusuario} className="bg-slate-50/50 hover:bg-white transition-all group rounded-2xl">
                <td className="px-6 py-4 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm">{u.nombre}</span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter italic">
                      @{u.username || 'usuario_sv'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100">
                  <span className="text-xs font-bold text-slate-600 italic">{u.email}</span>
                </td>
                <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${badgeColor[u.rol?.toLowerCase()] || 'bg-slate-100'}`}>
                      {u.rol}
                    </span>
                </td>
                <td className="px-6 py-4 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => alAccionar(u.idusuario, 'editar_usuario', u)} 
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all text-[10px] font-black uppercase italic"
                    >
                      Editar
                    </button>
                    {u.rol?.toLowerCase() !== 'administrador' ? (
                      <button 
                        onClick={() => alAccionar(u.idusuario, 'eliminar_usuario')} 
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all text-[10px] font-black uppercase"
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span className="text-slate-300 p-2 text-[9px] font-black uppercase italic cursor-not-allowed">Protegido</span>
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

  // MODO PROPUESTAS / ACTIVOS / INACTIVOS
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
            <th className="px-6 py-2">Destino</th>
            <th className="px-6 py-2">Ubicación</th>
            {(tipo === 'activos' || tipo === 'inactivos') && <th className="px-6 py-2 text-center">Estado</th>}
            <th className="px-6 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propuestas.map((sitio) => {
            // Identificamos la ID correcta según el tipo de dato que manda Julio
            const idFila = sitio.idpublicacion || sitio.idpreformulario;
            const carpetaImagen = (tipo === 'activos' || tipo === 'inactivos') ? 'preformularios' : 'preformularios';

            return (
              <tr key={idFila} className="bg-slate-50/50 hover:bg-white transition-all group rounded-2xl">
                <td className="px-6 py-4 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`http://100.123.6.123:8000/storage/${carpetaImagen}/${sitio.imagen}`} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-200"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150'} 
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{sitio.nombre}</span>
                      <span className="text-[8px] font-black text-blue-600/40 uppercase italic">
                        {sitio.municipio}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-blue-600/60 tracking-wider">{sitio.departamento}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{sitio.distrito}</span>
                  </div>
                </td>
                
                {(tipo === 'activos' || tipo === 'inactivos') && (
                  <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${badgeColor[sitio.estado]}`}>
                        {sitio.estado}
                      </span>
                  </td>
                )}

                <td className="px-6 py-4 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100 text-right">
                  <div className="flex justify-end gap-2">
                    {tipo === 'pendientes' ? (
                      <button 
                        onClick={() => alAccionar(idFila, 'analizar_propuesta')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-lg shadow-blue-100"
                      >
                        Analizar Propuesta
                      </button>
                    ) : (
                      <button 
                        /* CORRECCIÓN: Usamos alAccionar para comunicar al padre */
                        onClick={() => alAccionar(idFila, 'ver_detalle_sitio')} 
                        className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        Ver Detalle
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}