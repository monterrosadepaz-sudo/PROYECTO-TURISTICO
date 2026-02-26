import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
export default function SuperDashboard() {
  const [listaAdmins, setListaAdmins] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [nuevoAdmin, setNuevoAdmin] = useState({ name: '', email: '', password: '', rol: 'admin' });

  // 1. CARGAR USUARIOS (READ)
  const cargarUsuarios = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/usuarios`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const datos = await res.json();
      setListaAdmins(Array.isArray(datos) ? datos : []); 
    } catch (err) {
      setError("Error de sincronización: Verifica el servidor y Tailscale.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  // 2. GUARDAR O ACTUALIZAR (CREATE / UPDATE)
  const guardarUsuario = async (e) => {
    e.preventDefault();
    // Julio usa el ID del usuario en la URL para el PUT
    const url = modoEdicion 
      ? `${API_URL}/api/usuarios/${adminSeleccionado.idusuario}`
      : `${API_URL}/api/usuarios`;
    
    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          nombre: nuevoAdmin.name,      
          email: nuevoAdmin.email,      
          password: nuevoAdmin.password, 
          rol: nuevoAdmin.rol           
        }),
        credentials: 'include' 
      });

      const datosRespuesta = await res.json();

      if (res.ok) {
        if (modoEdicion) {
          // Actualizamos el usuario en el estado local tras la respuesta exitosa
          setListaAdmins(prev => prev.map(u => u.idusuario === adminSeleccionado.idusuario ? datosRespuesta.usuario : u));
        } else {
          setListaAdmins(prev => [...prev, datosRespuesta.usuario]);
        }
        cerrarModal();
      } else {
        alert(`Error: ${datosRespuesta.message || 'Operación fallida'}`);
      }
    } catch (err) {
      alert("Error crítico: El servidor no respondió.");
    }
  };

  // 3. ELIMINAR USUARIO (DELETE)
  const eliminarUsuario = async (idusuario) => {
    if(!confirm("¿Estás seguro de eliminar este administrador?")) return;
    try {
      // Usamos el idusuario para la ruta DELETE
      const res = await fetch(`${API_URL}/api/usuarios/${idusuario}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) setListaAdmins(prev => prev.filter(admin => admin.idusuario !== idusuario));
    } catch (err) {
      alert("Error al eliminar.");
    }
  };

  const abrirModalEdicion = (admin) => {
    setModoEdicion(true);
    setAdminSeleccionado(admin);
    setNuevoAdmin({ name: admin.nombre, email: admin.email, password: '', rol: admin.rol });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setAdminSeleccionado(null);
    setNuevoAdmin({ name: '', email: '', password: '', rol: 'admin' });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-left relative italic">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-left">
          <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
            Panel <span className="text-amber-500">Super Usuario</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Gestión Maestra - Turismo SV</p>
        </header>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black italic uppercase text-slate-800">Personal Administrativo</h2>
              <p className="text-xs text-slate-400 font-medium">Control de accesos activos</p>
            </div>
            <button onClick={() => setMostrarModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95">
              + Agregar Administrador
            </button>
          </div>

          <div className="overflow-x-auto">
            {error && <div className="p-10 text-red-500 font-bold text-center bg-red-50">{error}</div>}
            
            {cargando ? (
               <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Sincronizando con Julio...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                    <th className="px-10 py-6 text-left">Colaborador</th>
                    <th className="px-10 py-6 text-left">Rol</th>
                    <th className="px-10 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-left">
                  {listaAdmins.map((admin) => (
                    <tr key={admin.idusuario} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6 text-left">
                        <p className="font-bold text-slate-700 uppercase italic tracking-tight">{admin.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{admin.email}</p>
                      </td>
                      <td className="px-10 py-6 text-left uppercase font-black text-[9px] text-green-600 tracking-widest">
                        {admin.rol}
                      </td>
                      <td className="px-10 py-6 text-right space-x-2">
                        <button onClick={() => abrirModalEdicion(admin)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all">Editar</button>
                        <button onClick={() => eliminarUsuario(admin.idusuario)} className="bg-red-50 hover:bg-red-600 hover:text-white text-red-500 text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL MULTIUSO (CREAR / EDITAR) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 text-left">
            <h3 className="text-2xl font-black italic uppercase text-slate-800 mb-6 tracking-tighter">
              {modoEdicion ? 'Editar' : 'Nuevo'} <span className="text-blue-600">Admin</span>
            </h3>
            <form onSubmit={guardarUsuario} className="space-y-4">
              <input type="text" required placeholder="Nombre" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold italic" value={nuevoAdmin.name} onChange={(e) => setNuevoAdmin({...nuevoAdmin, name: e.target.value})} />
              <input type="email" required placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold italic" value={nuevoAdmin.email} onChange={(e) => setNuevoAdmin({...nuevoAdmin, email: e.target.value})} />
              <input type="password" placeholder={modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold" value={nuevoAdmin.password} onChange={(e) => setNuevoAdmin({...nuevoAdmin, password: e.target.value})} />
              
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold italic" value={nuevoAdmin.rol} onChange={(e) => setNuevoAdmin({...nuevoAdmin, rol: e.target.value})}>
                <option value="admin">Administrador</option>
                <option value="colaborador">Colaborador</option>
                <option value="super">Super Usuario</option>
              </select>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={cerrarModal} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl">
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}