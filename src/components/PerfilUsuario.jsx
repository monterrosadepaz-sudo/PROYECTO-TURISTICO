import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function PerfilUsuario() { 
  const navigate = useNavigate();
  
  const [sesionActiva, setSesionActiva] = useState(
    JSON.parse(localStorage.getItem('usuarioLogueado')) || {}
  );
  
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const [editando, setEditando] = useState(false);
  const [seccionAEditar, setSeccionAEditar] = useState(null); 
  const [exito, setExito] = useState(false);

  // 🔥 NUEVO: Extraemos solo los 8 números si el usuario ya tiene teléfono guardado
  const telefonoExtraido = sesionActiva.numero ? sesionActiva.numero.replace('+503', '') : '';

  const [datosPerfil, setDatosPerfil] = useState({
    nombre: sesionActiva.nombre || '',
    username: sesionActiva.username || '',
    email: sesionActiva.email || '',
    telefono: telefonoExtraido, // Estado inicial del teléfono
    password: '',
    confirmPassword: ''
  });

  const fotoActualUrl = sesionActiva.foto_perfil 
    ? (sesionActiva.foto_perfil.startsWith('http') ? sesionActiva.foto_perfil : `${API_URL}/storage/usuarios/${sesionActiva.foto_perfil}`)
    : `${API_URL}/storage/usuarios/perfil.png`;

  const manejarCambioTexto = (e) => {
    setDatosPerfil({ ...datosPerfil, [e.target.name]: e.target.value });
  };

  // 🔥 NUEVO: Manejador exclusivo para el teléfono (solo 8 números)
  const manejarTelefono = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDatosPerfil({ ...datosPerfil, telefono: soloNumeros });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  const generarNombreFotoPerfil = (file, uuidUsuario) => {
    const aleatorio = Math.random().toString(36).substring(2, 12).replace(/[^a-z0-9]/g, '');
    const extension = file.name.split('.').pop().toLowerCase();
    return `0000${uuidUsuario}perfil-${aleatorio}.${extension}`;
  };

  const guardarCambios = async (e) => {
    if (e) e.preventDefault();
    
    if (datosPerfil.password && datosPerfil.password !== datosPerfil.confirmPassword) {
      return alert("Las contraseñas no coinciden.");
    }

    if (seccionAEditar === 'telefono' && datosPerfil.telefono.length !== 8) {
      return alert("El número de teléfono debe tener exactamente 8 dígitos.");
    }

    setCargando(true);
    const data = new FormData();
    
    data.append('_method', 'PUT'); 
    
    data.append('nombre', datosPerfil.nombre || sesionActiva.nombre || '');
    data.append('username', datosPerfil.username || sesionActiva.username || 'usuario_sv');
    data.append('email', datosPerfil.email || sesionActiva.email || '');

    // 🔥 NUEVO: Se envía el teléfono a la BD con el formato esperado
    const telefonoFinal = datosPerfil.telefono ? `+503${datosPerfil.telefono}` : sesionActiva.numero;
    if (telefonoFinal) {
      data.append('numero', telefonoFinal);
    }

    if (archivoFoto) {
        const nombreFinal = generarNombreFotoPerfil(archivoFoto, sesionActiva.idusuario);
        data.append('foto_perfil', archivoFoto, nombreFinal);
    }

    if (datosPerfil.password) {
        data.append('password', datosPerfil.password);
    }

    try {
      const url = `${API_URL}/api/usuarios/${sesionActiva.idusuario}`;
      
      const respuesta = await fetch(url, {
        method: 'POST', 
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        const sesionActualizada = { 
          ...sesionActiva, 
          nombre: datosPerfil.nombre || sesionActiva.nombre,
          username: datosPerfil.username || sesionActiva.username,
          email: datosPerfil.email || sesionActiva.email,
          numero: telefonoFinal, // Actualizamos el LocalStorage
          foto_perfil: resultado.usuario?.foto_perfil || resultado.foto_perfil || sesionActiva.foto_perfil
        };

        localStorage.setItem('usuarioLogueado', JSON.stringify(sesionActualizada));
        setExito(true);
        
        setTimeout(() => {
          setExito(false);
          setEditando(false);
          setSeccionAEditar(null);
          setArchivoFoto(null); 
          window.location.reload(); 
        }, 2000);
      } else {
          console.error("Error Backend:", resultado);
          alert(`Error: ${resultado.error || "Datos inválidos"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen py-20 bg-slate-100/50 flex justify-center items-start italic font-sans relative">
      
      {exito && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100 animate-bounce">
              <span className="text-white text-3xl font-black">✓</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">¡Perfil Actualizado!</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información actualizada</p>
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
              {/* 🔥 NUEVO: Aro Premium Dorado */}
              <div className="w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-2xl relative transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-full border-[6px] border-white overflow-hidden bg-slate-200 relative">
                  <img 
                      src={fotoPreview || fotoActualUrl} 
                      className="w-full h-full object-cover" 
                      alt="Perfil" 
                      onError={(e) => e.target.src = `${API_URL}/storage/usuarios/perfil.png`}
                  />
                </div>
              </div>
              
              <label className="absolute bottom-1 right-1 bg-blue-600 w-12 h-12 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 border-4 border-white transition-transform active:scale-95 flex items-center justify-center z-20">
                <span className="text-white text-xl font-black leading-none mb-1">+</span>
                <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
              </label>
            </div>

            {archivoFoto && !exito && (
                <button onClick={guardarCambios} disabled={cargando} className="bg-green-500 hover:bg-green-600 text-white font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-xl animate-pulse transition-all hover:scale-105 active:scale-95">
                    {cargando ? 'Subiendo...' : 'Guardar Cambios'}
                </button>
            )}

            <div className="w-full">
              {!editando ? (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">{sesionActiva.nombre || "Usuario"}</h4>
                    <p className="text-blue-600 font-bold text-sm underline underline-offset-4 tracking-tighter italic">{sesionActiva.email || "Sin correo"}</p>
                    {/* 🔥 NUEVO: Mostramos el número en el perfil */}
                    {sesionActiva.numero && (
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">📱 {sesionActiva.numero}</p>
                    )}
                    <span className="inline-block bg-blue-50 px-6 py-2 rounded-full text-[10px] font-black text-amber-500 border border-amber-200 uppercase tracking-widest shadow-sm">
                      {sesionActiva.rol || 'Colaborador'}
                    </span>
                  </div>
                  {!archivoFoto && (
                    <button onClick={() => setEditando(true)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-5 rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em]">Editar Datos</button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!seccionAEditar ? (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2 italic">¿Qué deseas modificar?</p>
                      
                      {/* 🔥 NUEVO: Opción de Teléfono en el menú */}
                      {['nombre', 'username', 'correo', 'telefono', 'password'].map((item) => (
                        <button key={item} onClick={() => setSeccionAEditar(item)} className="w-full py-4 px-6 bg-slate-50 hover:bg-blue-50 text-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-slate-100 text-left flex justify-between items-center group transition-all">
                          {item === 'password' ? 'Contraseña' : item === 'telefono' ? 'Teléfono' : item}
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

                      {seccionAEditar === 'nombre' && <input name="nombre" value={datosPerfil.nombre} onChange={manejarCambioTexto} type="text" placeholder="Nuevo Nombre Completo" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />}
                      {seccionAEditar === 'username' && <input name="username" value={datosPerfil.username} onChange={manejarCambioTexto} type="text" placeholder="Nuevo Usuario" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />}
                      {seccionAEditar === 'correo' && <input name="email" value={datosPerfil.email} onChange={manejarCambioTexto} type="email" placeholder="Nuevo Correo" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold italic outline-none focus:ring-2 focus:ring-blue-500/20" />}
                      
                      {/* 🔥 NUEVO: Input de Teléfono blindado */}
                      {seccionAEditar === 'telefono' && (
                        <div className="flex rounded-2xl bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                          <span className="inline-flex items-center pl-6 pr-3 text-slate-500 font-black text-sm italic">
                            +503
                          </span>
                          <input 
                            name="telefono" 
                            type="tel" 
                            value={datosPerfil.telefono} 
                            onChange={manejarTelefono} 
                            placeholder="71234567" 
                            className="w-full py-4 pr-6 bg-transparent border-none text-sm font-bold italic outline-none" 
                          />
                        </div>
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