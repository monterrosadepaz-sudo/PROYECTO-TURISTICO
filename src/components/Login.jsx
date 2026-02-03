import React, { useState } from 'react';

export default function Login({ alEntrar, alCerrar }) {
  const [vista, setVista] = useState('login');
  const [verClave, setVerClave] = useState(false);
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

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
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
    const esRegistro = vista === 'registro';
    const ruta = esRegistro ? '/api/usuarios' : '/api/login';

    // AJUSTE FINAL: Rol asignado automáticamente como "Colaborador" (Capitalizado)
    const cuerpo = esRegistro 
      ? { 
          nombre: datos.nombre, 
          username: datos.usuario.trim(), 
          email: datos.correo.trim(), 
          password: datos.clave,
          password_confirmation: datos.confirmarClave,
          rol: "Colaborador" // Cambiado de "colaborador" a "Colaborador"
        }
      : { 
          username: datos.usuario.trim(), 
          password: datos.clave 
        };

    try {
      const respuesta = await fetch(`http://100.123.6.123:8000${ruta}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(cuerpo),
        credentials: 'include'       
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const errorMsg = resultado.message || (resultado.errors ? Object.values(resultado.errors)[0][0] : "Error en la solicitud");
        throw new Error(errorMsg);
      }

      if (esRegistro) {
        setMensajeServidor({ texto: "CUENTA CREADA EXITOSAMENTE COMO COLABORADOR.", tipo: 'exito' });
        setTimeout(() => setVista('login'), 3000);
      } else {
        localStorage.setItem('usuarioLogueado', JSON.stringify({
          nombre: resultado.nombre, 
          rol: resultado.rol,       
          correo: resultado.email || datos.usuario.trim() + "@correo.com"
        }));

        alEntrar(resultado.rol); 
      }
    } catch (error) {
      setMensajeServidor({ texto: error.message || "Error de conexión", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
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
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Nombre Completo</label>
                    <input type="text" name="nombre" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Ejemplo: Julio Monterrosa" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Correo Electrónico</label>
                    <input type="email" name="correo" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="ejemplo@correo.com" />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Nombre de Usuario</label>
                <input type="text" name="usuario" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold italic text-sm" placeholder="Julio Monterrosa" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Contraseña</label>
                <div className="relative">
                  <input type={verClave ? "text" : "password"} name="clave" required onChange={manejarCambio} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-700 font-bold text-sm" placeholder="********" />
                  <button type="button" onClick={() => setVerClave(!verClave)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600 uppercase">
                    {verClave ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {vista === 'registro' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Confirmar Contraseña</label>
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
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block">Nombre de Usuario</label>
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