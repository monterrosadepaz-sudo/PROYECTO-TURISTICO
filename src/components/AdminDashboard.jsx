import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaPropuestas from './TablaPropuestas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pestaña, setPestaña] = useState('pendientes');
  const [cargando, setCargando] = useState(false);
  
  // ESTADOS PARA EL MODAL Y VALIDACIÓN
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [campoAEditar, setCampoAEditar] = useState(null); 
  const [verClave, setVerClave] = useState(false);
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [usuarioActual, setUsuarioActual] = useState({ idusuario: '', nombre: '', username: '', email: '', password: '', rol: 'Colaborador' });

  // CORRECCIÓN: Inicializamos vacío para que el contador marque (0)
  const [propuestas, setPropuestas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (pestaña === 'usuarios') {
      const cargarUsuarios = async () => {
        setCargando(true);
        try {
          const respuesta = await fetch('http://100.123.6.123:8000/api/usuarios');
          if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
          const datos = await respuesta.json();
          if (Array.isArray(datos)) setUsuarios(datos);
        } catch (error) {
          console.error("FALLO DE CONEXIÓN:", error.message);
          setUsuarios([]); 
        } finally {
          setTimeout(() => setCargando(false), 500);
        }
      };
      cargarUsuarios();
    }
    
    // Aquí podrías agregar un useEffect similar para cargar 'propuestas' reales en el futuro
  }, [pestaña]);

  const guardarUsuario = async (e) => {
    e.preventDefault();
    if ((!modoEdicion || campoAEditar === 'password') && usuarioActual.password !== confirmarPassword) {
      alert("⚠️ Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    const url = modoEdicion 
      ? `http://100.123.6.123:8000/api/usuarios/${usuarioActual.idusuario}` 
      : `http://100.123.6.123:8000/api/usuarios`;
    
    try {
      const respuesta = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioActual)
      });

      if (respuesta.ok) {
        alert(modoEdicion ? "Datos actualizados correctamente" : "Colaborador creado con éxito");
        setMostrarModal(false);
        setCampoAEditar(null);
        setConfirmarPassword('');
        const res = await fetch('http://100.123.6.123:8000/api/usuarios');
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (e) { alert("Error al procesar usuario"); }
  };

  const manejarAccion = async (id, accion, datosExtra) => {
    if (accion === 'editar_usuario') {
      setUsuarioActual({ ...datosExtra, password: '' });
      setConfirmarPassword('');
      setModoEdicion(true);
      setCampoAEditar(null); 
      setMostrarModal(true);
      return;
    }
    if (accion === 'eliminar_usuario') {
      if(window.confirm("¿Estás seguro de eliminar esta cuenta?")) {
        try {
          const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${id}`, { method: 'DELETE' });
          if (respuesta.ok) setUsuarios(usuarios.filter(u => u.idusuario !== id));
        } catch (e) { alert("Error de conexión"); }
      }
    }
  };

  const tabStyle = (id) => `px-6 py-3 font-black uppercase text-xs tracking-widest transition-all ${pestaña === id ? 'bg-blue-600 text-white rounded-2xl shadow-lg' : 'text-slate-400 hover:text-blue-600'}`;

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left italic">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-start">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-800 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all group">
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Mapa
          </button>
        </div>

        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Panel de Control</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Gestión de Destinos y Cuentas</p>
          </div>
          <nav className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 overflow-x-auto">
            {['pendientes', 'activos', 'historial', 'usuarios'].map(t => (
              <button key={t} onClick={() => setPestaña(t)} className={tabStyle(t)}>
                {t} {t === 'pendientes' && `(${propuestas.length})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 min-h-[500px] p-10">
          {pestaña === 'usuarios' && (
            <section className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">04. Gestión de Cuentas</h3>
                <button 
                  onClick={() => { setModoEdicion(false); setCampoAEditar('perfil'); setUsuarioActual({ nombre: '', username: '', email: '', password: '', rol: 'Colaborador' }); setMostrarModal(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                >
                  + Nuevo Colaborador
                </button>
              </div>
              
              {cargando ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Procesando datos...</p>
                </div>
              ) : (
                <TablaPropuestas usuarios={usuarios} tipo="usuarios" alAccionar={manejarAccion} />
              )}
            </section>
          )}

          {pestaña === 'pendientes' && (
            <section className="animate-in fade-in duration-500">
              <h3 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8">01. Propuestas por Revisar</h3>
              {propuestas.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <p className="text-slate-300 text-xs font-black uppercase tracking-widest italic">No hay solicitudes pendientes en este momento.</p>
                </div>
              ) : (
                <TablaPropuestas propuestas={propuestas} tipo="pendientes" alAccionar={manejarAccion} />
              )}
            </section>
          )}
        </div>
      </div>

      {/* MODAL DE GESTIÓN DINÁMICO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 italic">
            <div className="bg-blue-800 p-8 text-white text-center">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">
                {modoEdicion ? `MODIFICAR: ${usuarioActual.nombre}` : 'NUEVO COLABORADOR'}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              {modoEdicion && !campoAEditar && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-300">
                  <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">¿Qué sección desea editar?</p>
                  <button onClick={() => setCampoAEditar('perfil')} className="w-full py-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-600 transition-all">
                    Información de Perfil
                  </button>
                  <button onClick={() => setCampoAEditar('password')} className="w-full py-4 bg-slate-50 hover:bg-amber-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-600 transition-all">
                    Cambiar Contraseña
                  </button>
                </div>
              )}

              <form onSubmit={guardarUsuario} className="space-y-5">
                {(campoAEditar === 'perfil' || !modoEdicion) && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre de cuenta</label>
                      <input type="text" required value={usuarioActual.nombre} onChange={e => setUsuarioActual({...usuarioActual, nombre: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm italic text-slate-700 placeholder:text-slate-300" placeholder="Ej: Julio Alberto" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Usuario (@usuario)</label>
                      <input type="text" required value={usuarioActual.username} onChange={e => setUsuarioActual({...usuarioActual, username: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300" placeholder="Ej: julio_sv" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Correo electrónico</label>
                      <input type="email" required value={usuarioActual.email} onChange={e => setUsuarioActual({...usuarioActual, email: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300" placeholder="correo@ejemplo.com" />
                    </div>
                  </div>
                )}

                {(campoAEditar === 'password' || !modoEdicion) && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nueva contraseña</label>
                      <div className="relative">
                        <input type={verClave ? "text" : "password"} required value={usuarioActual.password} onChange={e => setUsuarioActual({...usuarioActual, password: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300" placeholder="••••••••" />
                        <button type="button" onClick={() => setVerClave(!verClave)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600 uppercase italic">{verClave ? 'Ocultar' : 'Ver'}</button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Confirmar contraseña</label>
                      <input type={verClave ? "text" : "password"} required value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} className={`w-full px-5 py-3 rounded-xl bg-slate-50 border outline-none font-bold text-sm ${confirmarPassword && confirmarPassword !== usuarioActual.password ? 'border-red-500 bg-red-50' : 'border-slate-100 text-slate-700'}`} placeholder="••••••••" />
                      {confirmarPassword && confirmarPassword !== usuarioActual.password && <p className="text-[9px] font-black text-red-500 uppercase text-center italic mt-1">Las claves no coinciden</p>}
                    </div>
                  </div>
                )}

                {(campoAEditar || !modoEdicion) && (
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => { setCampoAEditar(null); setConfirmarPassword(''); }} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Atrás</button>
                    <button type="submit" disabled={campoAEditar === 'password' && usuarioActual.password !== confirmarPassword} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 disabled:opacity-50 tracking-widest">Guardar</button>
                  </div>
                )}
              </form>

              {modoEdicion && !campoAEditar && (
                <button onClick={() => setMostrarModal(false)} className="w-full text-slate-400 text-[9px] font-black uppercase text-center mt-4 tracking-widest">Cancelar y salir</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}