import React, { useState } from 'react';

export default function Login({ alEntrar, alCerrar }) {
  const [vista, setVista] = useState('login');
  const [datos, setDatos] = useState({ correo: '', clave: '' });
  const [metodoEnviado, setMetodoEnviado] = useState(null);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    // VALIDACIÓN DE PRUEBA
    if (datos.correo === 'admin@turismo.sv' && datos.clave === '12345') {
      alEntrar(); 
    } else {
      alert("Acceso denegado. Use admin@turismo.sv / 12345");
    }
  };

  const enviarCodigo = (metodo) => {
    setMetodoEnviado(metodo);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 transition-all">
        
        <div className="bg-blue-800 p-10 text-white text-center relative">
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
            {vista === 'login' ? 'Panel de Colaboradores' : 'Verificación de Seguridad'}
          </p>
        </div>

        <div className="p-10">
          {vista === 'login' ? (
            <form onSubmit={manejarEnvio} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Correo Electrónico</label>
                <input type="email" name="correo" required onChange={manejarCambio} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium" placeholder="admin@turismo.sv" />
              </div>
              <div className="space-y-2">
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
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {!metodoEnviado ? (
                <>
                  <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">Selecciona dónde recibir las instrucciones de restablecimiento.</p>
                  <div className="space-y-4">
                    <button onClick={() => enviarCodigo('SMS')} className="w-full flex items-center p-5 rounded-[2rem] border-2 border-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                      <div className="bg-blue-100 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">📱</div>
                      <div className="ml-4 text-left">
                        <p className="text-xs font-black uppercase text-slate-800">Vía SMS al Teléfono</p>
                        <p className="text-[10px] text-slate-400 font-bold italic">+503 •••• 8888</p>
                      </div>
                    </button>
                    <button onClick={() => enviarCodigo('Email')} className="w-full flex items-center p-5 rounded-[2rem] border-2 border-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                      <div className="bg-blue-100 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">✉️</div>
                      <div className="ml-4 text-left">
                        <p className="text-xs font-black uppercase text-slate-800">Vía Correo Electrónico</p>
                        <p className="text-[10px] text-slate-400 font-bold italic">admin••••@turismo.sv</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-lg font-black text-slate-800 uppercase italic">¡Código Enviado!</h3>
                  <p className="text-slate-500 text-sm font-medium">Instrucciones enviadas a tu {metodoEnviado === 'SMS' ? 'teléfono' : 'correo'}.</p>
                </div>
              )}
              <button onClick={() => { setVista('login'); setMetodoEnviado(null); }} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">← Volver al inicio de sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}