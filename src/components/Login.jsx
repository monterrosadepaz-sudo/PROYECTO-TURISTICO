import React, { useState } from 'react';

export default function Login({ alEntrar, alCerrar }) {
  const [vista, setVista] = useState('login');
  const [datos, setDatos] = useState({ correo: '', clave: '', usuarioRecuperar: '' });
  const [mensajeServidor, setMensajeServidor] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (datos.correo === 'admin@turismo.sv' && datos.clave === '12345') {
      alEntrar('admin'); 
    } 
    else if (datos.correo === 'super@turismo.sv' && datos.clave === 'root') {
      alEntrar('super');
    } 
    else {
      alert("Acceso denegado. \nAdmin: admin@turismo.sv / 12345 \nSuper: super@turismo.sv / root");
    }
  };

  // FUNCIÓN CONECTADA AL BACKEND DE JULIO
  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeServidor({ texto: '', tipo: '' });

    try {
      // Usamos la IP de Tailscale proporcionada
      const respuesta = await fetch('http://100.123.6.123:8000/api/recuperacion', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: datos.usuarioRecuperar }) // JSON solicitado
      });

      const resultado = await respuesta.json();

      if (resultado.message) {
        setMensajeServidor({ texto: resultado.message, tipo: 'exito' }); // Caso exitoso
      } else if (resultado.error) {
        setMensajeServidor({ texto: resultado.error, tipo: 'error' }); // Caso error
      }
    } catch (error) {
      setMensajeServidor({ texto: "Error: No hay conexión con el servidor (¿Tailscale activo?)", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 transition-all text-left">
        
        <div className="bg-blue-800 p-10 text-white text-center relative text-left">
          <button onClick={alCerrar} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">✕</button>
          <div className="flex justify-center mb-4">
            <div className="flex flex-col w-12 h-8 border border-white/20 rounded-sm overflow-hidden shadow-lg">
              <div className="bg-[#0047AB] h-1/3 w-full"></div>
              <div className="bg-white h-1/3 w-full"></div>
              <div className="bg-[#0047AB] h-1/3 w-full"></div>
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            {vista === 'login' ? 'Ingresar' : 'Recuperar'}
          </h2>
          <p className="text-blue-200 text-xs font-bold uppercase mt-2 tracking-widest">
            {vista === 'login' ? 'Panel de Colaboradores' : 'Gestión de Credenciales'}
          </p>
        </div>

        <div className="p-10">
          {vista === 'login' ? (
            <form onSubmit={manejarEnvio} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Correo Electrónico</label>
                <input type="email" name="correo" required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium" placeholder="admin@turismo.sv" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Contraseña</label>
                <input type="password" name="clave" required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transform active:scale-95 transition-all text-xs uppercase tracking-[0.2em] mt-4">Iniciar Sesión</button>
              <div className="text-center pt-4 space-y-2">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">¿Problemas para entrar?</p>
                <button type="button" onClick={() => setVista('recuperar')} className="text-blue-600 text-[11px] font-black uppercase tracking-tighter hover:underline">¿Olvidaste tu contraseña? Solicitar nueva</button>
              </div>
            </form>
          ) : (
            <form onSubmit={manejarRecuperacion} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">Ingresa tu usuario para recibir las instrucciones de recuperación.</p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nombre de Usuario</label>
                <input 
                  type="text" 
                  name="usuarioRecuperar" 
                  required 
                  onChange={manejarCambio} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium" 
                  placeholder="Ej: Julio Depaz" 
                />
              </div>

              {/* ALERTAS DEL SERVIDOR */}
              {mensajeServidor.texto && (
                <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in zoom-in-95 ${mensajeServidor.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {mensajeServidor.texto}
                </div>
              )}

              <button 
                type="submit" 
                disabled={cargando}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transform active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {cargando ? 'Enviando...' : 'Enviar Solicitud'}
              </button>

              <button type="button" onClick={() => { setVista('login'); setMensajeServidor({ texto: '', tipo: '' }); }} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">← Volver al inicio de sesión</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}