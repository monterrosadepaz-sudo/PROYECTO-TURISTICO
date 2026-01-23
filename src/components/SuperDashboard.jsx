import React from 'react';

export default function SuperDashboard() {
  const estadisticas = [
    { titulo: "Propuestas Totales", cifra: "124", color: "text-blue-600" },
    { titulo: "Sitios Publicados", cifra: "45", color: "text-green-600" },
    { titulo: "Admins Activos", cifra: "3", color: "text-amber-600" }
  ];

  const listaAdmins = [
    { id: 1, nombre: "Juan Pérez", correo: "admin@turismo.sv", estado: "Activo" },
    { id: 2, nombre: "Marta Díaz", correo: "marta@turismo.sv", estado: "Inactivo" },
    { id: 3, nombre: "Admin Prueba", correo: "test@turismo.sv", estado: "Activo" }
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-500 text-left">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
            Panel <span className="text-amber-500">Super Usuario</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Control Maestro de Turismo SV
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {estadisticas.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.titulo}</span>
              <span className={`text-5xl font-black ${item.color}`}>{item.cifra}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Personal Administrativo</h2>
              <p className="text-xs text-slate-400 font-medium">Gestión de accesos y permisos</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95">
              + Agregar Administrador
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                  <th className="px-10 py-6">Colaborador</th>
                  <th className="px-10 py-6">Estado</th>
                  <th className="px-10 py-6 text-right">Acciones de Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {listaAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-bold text-slate-700">{admin.nombre}</p>
                      <p className="text-xs text-slate-400 font-medium italic">{admin.correo}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${admin.estado === 'Activo' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {admin.estado}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all">
                          Configurar
                        </button>
                        <button className="bg-red-50 hover:bg-red-600 hover:text-white text-red-500 text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}