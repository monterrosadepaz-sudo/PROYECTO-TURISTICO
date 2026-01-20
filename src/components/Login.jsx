import React, { useState } from 'react';

export default function Login({ alEntrar, alCerrar }) {
  const [datos, setDatos] = useState({ correo: '', clave: '' });

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    // Aquí simulamos que el login es exitoso
    console.log("Iniciando sesión con:", datos);
    alEntrar(); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 transition-all">
        
        {/* Encabezado con el estilo de la bandera que usamos en el Navbar */}
        <div className="bg-blue-800 p-10 text-white text-center relative">
          <button onClick={alCerrar} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">✕</button>
          <div className="flex justify-center mb-4">
            <div className="flex flex-col w-12 h-8 border border-white/20 rounded-sm overflow-hidden shadow-lg">
              <div className="bg-[#0047AB] h-1/3 w-full"></div>
              <div className="bg-white h-1/3 w-full"></div>
              <div className="bg-[#0047AB] h-1/3 w-full"></div>
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Ingresar</h2>
          <p className="text-blue-200 text-xs font-bold uppercase mt-2 tracking-widest">Panel de Colaboradores</p>
        </div>

        <form onSubmit={manejarEnvio} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo"
              required
              onChange={manejarCambio}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
              placeholder="nombre@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Contraseña</label>
            <input 
              type="password" 
              name="clave"
              required
              onChange={manejarCambio}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transform active:scale-95 transition-all text-xs uppercase tracking-[0.2em] mt-4"
          >
            Iniciar Sesión
          </button>

          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            ¿No tienes cuenta? <span className="text-blue-600 cursor-pointer hover:underline">Solicitar acceso</span>
          </p>
        </form>
      </div>
    </div>
  );
}