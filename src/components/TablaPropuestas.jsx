import React, { useState } from 'react';
import { API_URL } from '../config';

export default function TablaPropuestas({ propuestas, tipo, alAnalizar, alAccionar, usuarios }) {
  const [procesandoId, setProcesandoId] = useState(null);

  const badgeColor = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    aprobado: 'bg-green-100 text-green-700 border-green-200',
    rechazado: 'bg-red-100 text-red-700 border-red-200',
    administrador: 'bg-purple-100 text-purple-700 border-purple-200 shadow-purple-100',
    colaborador: 'bg-blue-100 text-blue-700 border-blue-200 shadow-blue-100',
    activo: 'bg-green-100 text-green-700 border-green-200',
    inactivo: 'bg-red-100 text-red-700 border-red-200'
  };

  const obtenerRutaImagen = (nombreImg) => {
    if (!nombreImg) return '/default.jpg';
    if (nombreImg.startsWith('http')) return nombreImg;

    if (nombreImg.includes('preformulario')) {
        return `${API_URL}/storage/preformularios/${nombreImg}`;
    }

    return `${API_URL}/storage/publicaciones/${nombreImg}`;
  };

  const confirmarYBorrar = async (idusuario, nombre) => {
    const seguro1 = window.confirm(`¿Estás seguro que deseas eliminar al colaborador "${nombre}"?`);
    if (!seguro1) return;
    const seguro2 = window.confirm(`⚠️ ADVERTENCIA: Esta acción es irreversible. ¿Confirmas definitivamente la eliminación de ${nombre}?`);
    if (!seguro2) return;

    setProcesandoId(idusuario);
    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/${idusuario}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      if (respuesta.ok) {
        alert(`✅ El colaborador ${nombre} ha sido eliminado exitosamente.`);
        window.location.reload(); 
      } else {
        const errorData = await respuesta.json();
        alert(`❌ Error al eliminar: ${errorData.message || 'No se pudo completar la acción.'}`);
      }
    } catch (error) {
      alert("❌ Error de red al intentar eliminar al usuario.");
    } finally {
      setProcesandoId(null);
    }
  };

  if (tipo === 'usuarios') {
    return (
      <div className="overflow-x-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b-2 border-slate-100">
              <th className="px-6 py-5">Nombre / Usuario</th>
              <th className="px-6 py-5">Contacto</th>
              <th className="px-6 py-5 text-center">Rol</th>
              <th className="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {usuarios.map((u) => (
              <tr key={u.idusuario} className="hover:bg-blue-50/30 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-110 transition-transform">
                      {u.nombre ? u.nombre.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm capitalize">{u.nombre}</span>
                      <span className="text-[10px] text-blue-500 font-bold tracking-widest mt-0.5">{u.username || ''}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="text-slate-400 text-sm">✉️</span> {u.email}
                    </span>
                    {u.numero && (
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-sm">📱</span> {u.numero}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border shadow-sm ${badgeColor[u.rol?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {u.rol}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 items-center">
                    <button onClick={() => alAccionar(u.idusuario, 'editar_usuario', u)} className="text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-blue-600 hover:shadow-lg">Editar</button>
                    {u.rol?.toLowerCase() !== 'administrador' ? (
                      <button onClick={() => confirmarYBorrar(u.idusuario, u.nombre)} disabled={procesandoId === u.idusuario} className={`text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-500 hover:shadow-lg ${procesandoId === u.idusuario ? 'opacity-50 cursor-wait bg-red-100' : ''}`}>
                        {procesandoId === u.idusuario ? 'Borrando...' : 'Eliminar'}
                      </button>
                    ) : (
                      <span className="text-slate-300 px-4 py-2 text-[9px] font-black uppercase tracking-widest cursor-not-allowed">Protegido</span>
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
            const idFila = sitio.idpublicacion || sitio.idpreformulario;
            
            return (
              <tr key={idFila} className="bg-slate-50/70 hover:bg-white transition-all group rounded-[1.5rem] shadow-sm hover:shadow-md">
                <td className="px-6 py-4 first:rounded-l-[1.5rem] border-y border-l border-transparent group-hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm bg-slate-200 shrink-0">
                      <img
                        src={obtenerRutaImagen(sitio.imagen)}
                        alt="Sitio"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/default.jpg'; }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{sitio.nombre}</span>
                      <span className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest mt-1">
                        {sitio.municipio}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">{sitio.departamento}</span>
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{sitio.distrito}</span>
                  </div>
                </td>
                
                {(tipo === 'activos' || tipo === 'inactivos') && (
                  <td className="px-6 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border shadow-sm ${badgeColor[sitio.estado]}`}>
                        {sitio.estado}
                      </span>
                  </td>
                )}

                <td className="px-6 py-4 last:rounded-r-[1.5rem] border-y border-r border-transparent group-hover:border-slate-100 text-right">
                  <div className="flex justify-end gap-2">
                    {tipo === 'pendientes' ? (
                      <button onClick={() => alAccionar(idFila, 'analizar_propuesta', sitio)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95">
                        Analizar Propuesta
                      </button>
                    ) : (
                      <button onClick={() => alAccionar(idFila, 'ver_detalle_sitio', sitio)} className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm">
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