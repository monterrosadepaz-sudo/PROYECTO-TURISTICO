import React, { useState } from 'react';
import { API_URL } from '../config';
export default function RestablecerClave({ alTerminar }) {
  const [claves, setClaves] = useState({ nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const manejarCambio = (e) => {
    setClaves({ ...claves, [e.target.name]: e.target.value });
  };

  const guardarNuevaClave = async (e) => {
    e.preventDefault();
    if (claves.nueva !== claves.confirmar) {
      setMensaje({ texto: "Las contraseñas no coinciden", tipo: 'error' });
      return;
    }

    try {
      // Julio dejará esta URL fija en su código, pero tú haces el envío aquí
      const respuesta = await fetch(`${API_URL}/api/actualizar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: claves.nueva })
      });

      if (respuesta.ok) {
        setMensaje({ texto: "¡Contraseña actualizada con éxito!", tipo: 'exito' });
        setTimeout(() => alTerminar(), 2000); // Regresa al login después de 2 seg
      }
    } catch (error) {
      setMensaje({ texto: "Error al conectar con el servidor", tipo: 'error' });
    }
  };

  return (
    <div className="p-10 space-y-6 animate-in fade-in duration-500 text-left">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-slate-800 uppercase italic">Nueva Contraseña</h3>
        <p className="text-slate-500 text-xs font-medium">Ingresa tu nueva clave de acceso al sistema.</p>
      </div>

      <form onSubmit={guardarNuevaClave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nueva Contraseña</label>
          <input 
            type="password" 
            name="nueva" 
            required 
            onChange={manejarCambio} 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none transition-all" 
            placeholder="••••••••" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Confirmar Contraseña</label>
          <input 
            type="password" 
            name="confirmar" 
            required 
            onChange={manejarCambio} 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none transition-all" 
            placeholder="••••••••" 
          />
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-xl text-xs font-bold text-center ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {mensaje.texto}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all text-xs uppercase tracking-widest mt-4"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}