import React, { useState } from 'react';

export default function Login({ alEntrar, alCerrar }) {
  const [vista, setVista] = useState('login');
  const [verClave, setVerClave] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null); 
  const [datos, setDatos] = useState({ 
    nombre: '', 
    usuario: '', 
    correo: '',
    clave: '', 
    confirmarClave: '',
    usuarioRecuperar: '' 
  });
  const [mensajeServidor, setMensajeServidor] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const generarNombreImagen = (archivo, objetivo, carpeta) => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaCodificada = `${dia}${mes}${anio}`; 
    const extension = archivo.name.split('.').pop();
    return `0000${fechaCodificada}${objetivo}usuarios.${extension}`;
  };

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarArchivo = (e) => {
    setFotoPerfil(e.target.files[0]);
  };

  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeServidor({ texto: '', tipo: '' });
    try {
      const respuesta = await fetch('http://100.123.6.123:8000/api/recuperacion', { 
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

        if (fotoPerfil) {
          const nombreCodificado = generarNombreImagen(fotoPerfil, "perfil", "usuarios");
          formData.append('foto_perfil', fotoPerfil, nombreCodificado);
        }

        const respuesta = await fetch('http://100.123.6.123:8000/api/usuarios', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
          const errorMsg = resultado.message || (resultado.errors ? Object.values(resultado.errors)[0][0] : "Error en el registro");
          throw new Error(errorMsg);
        }

        setMensajeServidor({ texto: "CUENTA CREADA EXITOSAMENTE COMO COLABORADOR.", tipo: 'exito' });
        setTimeout(() => setVista('login'), 3000);

      } else {
        const respuesta = await fetch('http://100.123.6.123:8000/api/login', {
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

        const usuario = resultado.usuario || resultado;
        
        // --- LA CORRECCIÓN MAESTRA ---
        // Guardamos explícitamente la propiedad que confirmamos en Thunder Client
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          idusuario: usuario.idusuario,
          nombre: usuario.nombre, 
          rol: usuario.rol,       
          correo: usuario.email || usuario.correo,
          // Aquí está la clave: pasamos la URL completa que ya nos da Julio
          foto: usuario.foto_perfil_url,
          foto_perfil_url: usuario.foto_perfil_url 
        }));

        alEntrar(usuario.rol); 
      }
    } catch (error) {
      setMensajeServidor({ texto: error.message || "Error de conexión", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Tu JSX se mantiene intacto ya que el diseño es impecable */}
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 transition-all text-left italic">
        <div className="bg-blue-800 p-10 text-white text-center relative">
          <button onClick={alCerrar} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">✕</button>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-center">
            {vista === 'login' ? 'INICIAR SESIÓN' : vista === 'registro' ? 'CREAR CUENTA' : 'RECUPERAR'}
          </h2>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto">
          {mensajeServidor.texto && (
            <div className={`mb-6 p-4 rounded-xl text-[10px] font-black text-center ${mensajeServidor.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {mensajeServidor.texto}
            </div>
          )}

          {vista !== 'recuperar' ? (
            <form onSubmit={manejarEnvio} className="space-y-4">
              {vista === 'registro' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre Completo</label>
                    <input type="text" name="nombre" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Ejemplo: Julio Monterrosa" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Correo Electrónico</label>
                    <input type="email" name="correo" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="ejemplo@correo.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Foto de Perfil (Opcional)</label>
                    <input type="file" accept="image/*" onChange={manejarArchivo} className="w-full px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-500 font-bold italic text-[10px] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700" />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre de Usuario</label>
                <input type="text" name="usuario" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Julio Monterrosa" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Contraseña</label>
                <div className="relative">
                  <input type={verClave ? "text" : "password"} name="clave" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold text-sm" placeholder="********" />
                  <button type="button" onClick={() => setVerClave(!verClave)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600 uppercase">
                    {verClave ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {vista === 'registro' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Confirmar Contraseña</label>
                  <input type={verClave ? "text" : "password"} name="confirmarClave" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold text-sm" placeholder="********" />
                </div>
              )}

              <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg text-[10px] uppercase tracking-[0.2em] mt-4">
                {cargando ? 'Procesando...' : vista === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
              </button>
              
              <div className="text-center pt-2">
                <button type="button" onClick={() => setVista(vista === 'login' ? 'registro' : 'login')} className="text-blue-600 text-[10px] font-black uppercase hover:underline italic block w-full underline decoration-2 underline-offset-4">
                  {vista === 'login' ? 'CREAR NUEVA CUENTA' : 'VOLVER AL INGRESO'}
                </button>
                {vista === 'login' && (
                  <button type="button" onClick={() => setVista('recuperar')} className="text-slate-400 text-[9px] font-black uppercase mt-2">¿PROBLEMAS CON SU CONTRASEÑA?</button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={manejarRecuperacion} className="space-y-6">
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic uppercase tracking-tighter">Ingrese su nombre de usuario para iniciar el proceso de recuperación.</p>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre de Usuario</label>
                <input type="text" name="usuarioRecuperar" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Julio Monterrosa" />
              </div>
              <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg text-[10px] uppercase tracking-[0.2em]">
                {cargando ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
              </button>
              <button type="button" onClick={() => setVista('login')} className="w-full text-slate-400 text-[9px] font-black uppercase mt-4">VOLVER AL INICIO</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}