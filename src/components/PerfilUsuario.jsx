import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerfilUsuario({ foto }) { 
  const navigate = useNavigate();
  
  const [sesionActiva, setSesionActiva] = useState(
    JSON.parse(localStorage.getItem('usuarioLogueado')) || {}
  );
  
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  // CONTROL DE EDICIÓN Y MENSAJES
  const [editando, setEditando] = useState(false);
  const [seccionAEditar, setSeccionAEditar] = useState(null); // 'nombre', 'username', 'password', 'correo'
  const [exito, setExito] = useState(false);

  const [datosPerfil, setDatosPerfil] = useState({
    nombre: sesionActiva.nombre || '',
    username: sesionActiva.username || '',
    email: sesionActiva.email || '',
    password: '',
    confirmPassword: ''
  });

  const manejarCambioTexto = (e) => {
    setDatosPerfil({ ...datosPerfil, [e.target.name]: e.target.value });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (seccionAEditar === 'password' && datosPerfil.password !== datosPerfil.confirmPassword) {
      return alert("Las contraseñas no coinciden.");
    }

    setCargando(true);
    const data = new FormData();
    if (archivoFoto) data.append('foto_perfil', archivoFoto);
    data.append('_method', 'PUT'); 
    data.append('nombre', datosPerfil.nombre);
    data.append('username', datosPerfil.username);
    data.append('email', datosPerfil.email);
    if (datosPerfil.password) data.append('password', datosPerfil.password);

    try {
      const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${sesionActiva.idusuario}`, {
        method: 'POST', 
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        const sesionActualizada = { 
          ...sesionActiva, 
          nombre: datosPerfil.nombre,
          username: datosPerfil.username,
          email: datosPerfil.email,
          foto_perfil: resultado.usuario?.foto_perfil || sesionActiva.foto_perfil
        };

        localStorage.setItem('usuarioLogueado', JSON.stringify(sesionActualizada));
        setExito(true);
        setTimeout(() => {
          setExito(false);
          setEditando(false);
          setSeccionAEditar(null);
          window.location.reload();
        }, 2500);
      }
    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen py-20 bg-slate-100/50 flex justify-center items-start italic font-sans relative">
      
      {/* MENSAJE DE ÉXITO CON MEJOR DISEÑO */}
      {exito && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100 animate-bounce">
              <span className="text-white text-3xl font-black">✓</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">¡Perfil Actualizado!</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando datos...</p>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-blue-800 p-12 text-center text-white relative">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-8 text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100">← Volver</button>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Mi Perfil</h3>
        </div>

        <div className="p-10 -mt-16">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group z-10">
              <div className="w-40 h-40 rounded-full border-[10px] border-white shadow-2xl overflow-hidden bg-white">
                <img src={fotoPreview || (sesionActiva.foto_perfil ? `http://100.123.6.123:8000/storage/usuarios/${sesionActiva.foto_perfil}` : "http://100.123.6.123:8000/storage/usuarios/perfil.png")} className="w-full h-full object-cover" alt="Perfil" />
              </div>
              <label className="absolute bottom-1 right-1 bg-blue-600 p-3.5 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 border-4 border-white z-30 flex items-center justify-center">
                <span className="text-white text-lg font-black">+</span>
                <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
              </label>
            </div>

            <div className="w-full">
              {!editando ? (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">{sesionActiva.nombre || "Usuario"}</h4>
                    <p className="text-blue-600 font-bold text-sm underline underline-offset-4 tracking-tighter italic">{sesionActiva.email || "Sin correo"}</p>
                    <span className="inline-block bg-blue-50 px-6 py-2 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">{sesionActiva.rol || 'Colaborador'}</span>
                  </div>
                  <button onClick={() => setEditando(true)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-5 rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em]">Editar Datos</button>
                  {archivoFoto && (
                    <button onClick={guardarCambios} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest animate-pulse">Guardar Nueva Foto</button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!seccionAEditar ? (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2 italic">¿Qué deseas modificar?</p>
                      {['nombre', 'username', 'correo', 'password'].map((item) => (
                        <button 
                          key={item} 
                          onClick={() => setSeccionAEditar(item)}
                          className="w-full py-4 px-6 bg-slate-50 hover:bg-blue-50 text-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-slate-100 text-left flex justify-between items-center group transition-all"
                        >
                          {item === 'password' ? 'Contraseña' : item}
                          <span className="text-blue-300 group-hover:text-blue-600">→</span>
                        </button>
                      ))}
                      <button onClick={() => setEditando(false)} className="mt-4 text-[10px] font-black text-slate-300 uppercase underline text-center">Cancelar</button>
                    </div>
                  ) : (
                    <form onSubmit={guardarCambios} className="space-y-4 animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center mb-4">
                         <button type="button" onClick={() => setSeccionAEditar(null)} className="text-[9px] font-black text-blue-600 uppercase">← Volver</button>
                         <p className="text-[9px] font-black text-slate-400 uppercase italic">Editando {seccionAEditar}</p>
                      </div>

                      {seccionAEditar === 'nombre' && (
                        <input name="nombre" value={datosPerfil.nombre} onChange={manejarCambioTexto} type="text" placeholder="Nuevo Nombre Completo" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />
                      )}
                      {seccionAEditar === 'username' && (
                        <input name="username" value={datosPerfil.username} onChange={manejarCambioTexto} type="text" placeholder="Nuevo Nombre de Usuario" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />
                      )}
                      {seccionAEditar === 'correo' && (
                        <input name="email" value={datosPerfil.email} onChange={manejarCambioTexto} type="email" placeholder="Nuevo Correo Electrónico" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />
                      )}
                      {seccionAEditar === 'password' && (
                        <>
                          <input name="password" onChange={manejarCambioTexto} type="password" placeholder="Nueva Contraseña" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20 mb-3" />
                          <input name="confirmPassword" onChange={manejarCambioTexto} type="password" placeholder="Confirmar Contraseña" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </>
                      )}

                      <button type="submit" disabled={cargando} className="w-full py-4 bg-blue-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95">
                        {cargando ? 'Guardando...' : 'Confirmar Cambio'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}