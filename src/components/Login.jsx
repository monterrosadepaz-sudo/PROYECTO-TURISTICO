import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Login({ alEntrar, alCerrar }) {
  const [vista, setVista] = useState('login'); // 'login', 'registro', 'recuperar'
  const [verClave, setVerClave] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [datos, setDatos] = useState({ 
    nombre: '', 
    usuario: '', 
    correo: '',
    clave: '', 
    confirmarClave: '',
    telefono: '', 
    usuarioRecuperar: '' 
  });
  const [mensajeServidor, setMensajeServidor] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const generarUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generarNombreImagen = (archivo) => {
    const fakeUUID = generarUUID();
    const aleatorio = Math.random().toString(36).substring(2, 12).replace(/[^a-z0-9]/g, '');
    const extension = archivo.name.split('.').pop().toLowerCase();
    return `0000${fakeUUID}perfil-${aleatorio}.${extension}`;
  };

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarTelefono = (e) => {
      const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
      setDatos({ ...datos, telefono: soloNumeros });
  };

  const manejarArchivo = (e) => {
    setFotoPerfil(e.target.files[0]);
  };

  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeServidor({ texto: '', tipo: '' });
    try {
      const respuesta = await fetch(`${API_URL}/api/recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ usuario: datos.usuarioRecuperar.trim() })
      });
      const resultado = await respuesta.json();
      if (resultado.message) {
        setMensajeServidor({ texto: resultado.message, tipo: 'exito' });
      } else if (resultado.error) {
        setMensajeServidor({ texto: resultado.error, tipo: 'error' });
      }
    } catch (error) {
      setMensajeServidor({ texto: "Servidor no disponible", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (vista === 'registro' && datos.clave !== datos.confirmarClave) {
      setMensajeServidor({ texto: "Las contraseñas no coinciden", tipo: 'error' });
      return;
    }

    if (vista === 'registro' && datos.telefono.length !== 8) {
      setMensajeServidor({ texto: "El número de teléfono debe tener 8 dígitos", tipo: 'error' });
      return;
    }

    setCargando(true);
    setMensajeServidor({ texto: '', tipo: '' });
    const esRegistro = vista === 'registro';

    try {
      const formData = new FormData();

      if (esRegistro) {
        formData.append('nombre', datos.nombre);
        formData.append('username', datos.usuario.trim());
        formData.append('email', datos.correo.trim());
        formData.append('password', datos.clave);
        formData.append('password_confirmation', datos.confirmarClave);
        formData.append('rol', "Colaborador");
        formData.append('numero', `+503${datos.telefono}`);

        if (fotoPerfil) {
          const nombreAprobado = generarNombreImagen(fotoPerfil);
          formData.append('foto_perfil', fotoPerfil, nombreAprobado);
        }

        const respuesta = await fetch(`${API_URL}/api/usuarios`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
          const errorMsg = resultado.message || (resultado.errors ? Object.values(resultado.errors)[0][0] : "Error en el registro");
          throw new Error(errorMsg);
        }

        setMensajeServidor({ texto: "CUENTA CREADA EXITOSAMENTE.", tipo: 'exito' });
        
        setTimeout(() => {
          setVista('login');
          // 🔥 Limpiamos la clave pero dejamos el usuario listo para entrar
          setDatos(prev => ({ ...prev, clave: '', confirmarClave: '' }));
        }, 3000);

      } else {
        const respuesta = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({
            username: datos.usuario.trim(),
            password: datos.clave
          }),
          credentials: 'include'       
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.message || "Error en el ingreso");

        const usuarioData = resultado.usuario || resultado;
        
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          ...usuarioData,
          foto_perfil: usuarioData.foto_perfil,
          foto_perfil_url: usuarioData.foto_perfil_url 
        }));

        alEntrar(usuarioData.rol); 
      }
    } catch (error) {
      setMensajeServidor({ texto: error.message || "Error de conexión", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all text-left italic">
        
        {/* CABECERA */}
        <div className="bg-blue-800 p-10 text-white text-center relative">
          <button onClick={alCerrar} className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors">✕</button>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-center">
            {vista === 'login' ? 'INICIAR SESIÓN' : vista === 'registro' ? 'CREAR CUENTA' : 'RECUPERAR'}
          </h2>
        </div>

        <div className="p-10 max-h-[75vh] overflow-y-auto">
          {mensajeServidor.texto && (
            <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest ${mensajeServidor.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {mensajeServidor.texto}
            </div>
          )}

          {vista !== 'recuperar' ? (
            <form onSubmit={manejarEnvio} className="space-y-5">
              {vista === 'registro' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Nombre de usuario</label>
                    {/* 🔥 Se agregó value={datos.nombre} */}
                    <input type="text" name="nombre" value={datos.nombre} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Julio Monterrosa" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Número de Teléfono</label>
                    <div className="flex rounded-2xl bg-slate-50 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                      <span className="inline-flex items-center pl-6 pr-3 text-slate-500 font-black text-sm italic">
                        +503
                      </span>
                      {/* 🔥 Ya tenía value={datos.telefono} */}
                      <input 
                        type="tel" 
                        name="telefono" 
                        required 
                        value={datos.telefono} 
                        onChange={manejarTelefono} 
                        className="w-full py-4 pr-6 bg-transparent outline-none text-slate-700 font-bold italic text-sm" 
                        placeholder="71234567" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Correo Electrónico</label>
                    {/* 🔥 Se agregó value={datos.correo} */}
                    <input type="email" name="correo" value={datos.correo} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="ejemplo@correo.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Foto de Perfil (Opcional)</label>
                    <input type="file" accept="image/*" onChange={manejarArchivo} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-500 font-bold italic text-[10px] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:bg-blue-100 file:text-blue-700" />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Nombre de completo</label>
                {/* 🔥 Se agregó value={datos.usuario} */}
                <input type="text" name="usuario" value={datos.usuario} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Usuario" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Contraseña</label>
                <div className="relative">
                  {/* 🔥 Se agregó value={datos.clave} */}
                  <input type={verClave ? "text" : "password"} name="clave" value={datos.clave} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="********" />
                  <button type="button" onClick={() => setVerClave(!verClave)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                    {verClave ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                
                {vista === 'login' && (
                  <div className="text-right px-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setVista('recuperar')}
                      className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              {vista === 'registro' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Confirmar Contraseña</label>
                  {/* 🔥 Se agregó value={datos.confirmarClave} */}
                  <input type={verClave ? "text" : "password"} name="confirmarClave" value={datos.confirmarClave} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="********" />
                </div>
              )}

              {/* BOTÓN CON ANIMACIÓN DE CARGA */}
              <button 
                type="submit" 
                disabled={cargando} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl mt-6
                  ${cargando 
                    ? 'bg-slate-100 text-slate-400 cursor-wait shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95'
                  }`}
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="italic uppercase">Cargando...</span>
                  </>
                ) : (
                  vista === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'
                )}
              </button>
              
              <div className="text-center pt-4">
                <button type="button" onClick={() => setVista(vista === 'login' ? 'registro' : 'login')} className="text-blue-600 text-[10px] font-black uppercase hover:text-blue-800 italic block w-full underline decoration-2 underline-offset-8 transition-all">
                  {vista === 'login' ? 'CREAR NUEVA CUENTA' : 'VOLVER AL INGRESO'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={manejarRecuperacion} className="space-y-6">
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed text-center px-4">
                Ingresa tu nombre de usuario y te enviaremos un correo con las instrucciones para restablecer tu acceso.
              </p>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Nombre de Usuario</label>
                {/* 🔥 Se agregó value={datos.usuarioRecuperar} */}
                <input type="text" name="usuarioRecuperar" value={datos.usuarioRecuperar} required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Usuario" />
              </div>

              {/* BOTÓN DE RECUPERACIÓN CON CARGA */}
              <button 
                type="submit" 
                disabled={cargando} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl
                  ${cargando 
                    ? 'bg-slate-100 text-slate-400 cursor-wait shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95'
                  }`}
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="italic uppercase tracking-widest">Enviando...</span>
                  </>
                ) : 'ENVIAR SOLICITUD'}
              </button>
              
              <button type="button" onClick={() => setVista('login')} className="w-full text-slate-400 text-[9px] font-black uppercase mt-4 underline underline-offset-4 hover:text-slate-600 transition-colors">VOLVER AL INICIO</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}