import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 🔥 Usamos useParams
import { API_URL } from '../config';

export default function RestablecerClave({ alTerminar }) {
  const { idusuario } = useParams(); // 🆔 Captura el ID directamente de la ruta /restablecer/:idusuario
  const navigate = useNavigate();
  
  // 🔥 PARCHE ANTI-JULIO: Limpiamos el ID por si acaso viene duplicado con la coma
  const idUsuarioCambiando = idusuario ? idusuario.split(',')[0] : null; 
  
  const [claves, setClaves] = useState({ nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  
  // 👀 Estado para mostrar/ocultar contraseña
  const [verClave, setVerClave] = useState(false);
  // ✨ Estado para el Modal de Éxito
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const manejarCambio = (e) => {
    setClaves({ ...claves, [e.target.name]: e.target.value });
  };

  const guardarNuevaClave = async (e) => {
    e.preventDefault();

    if (!idUsuarioCambiando) {
      setMensaje({ texto: "Enlace inválido. Por favor, solicita uno nuevo.", tipo: 'error' });
      return;
    }

    if (claves.nueva !== claves.confirmar) {
      setMensaje({ texto: "Las contraseñas no coinciden", tipo: 'error' });
      return;
    }

    if (claves.nueva.length < 4) {
      setMensaje({ texto: "La clave debe tener al menos 4 caracteres", tipo: 'error' });
      return;
    }

    setCargando(true);

    try {
      const data = new FormData();
      data.append('_method', 'PUT'); 
      data.append('password', claves.nueva);

      // 🔥 LE PEGAMOS AL ENDPOINT DE PERFIL DIRECTAMENTE 🔥
      const respuesta = await fetch(`${API_URL}/api/usuarios/${idUsuarioCambiando}`, {
        method: 'POST', 
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (respuesta.ok) {
        setMostrarModalExito(true);
        setTimeout(() => {
          setMostrarModalExito(false);
          if (alTerminar) alTerminar();
          navigate('/');
        }, 3000);
      } else {
        if (respuesta.status === 401) {
            setMensaje({ texto: "Acceso denegado: El servidor de Julio bloqueó esta ruta.", tipo: 'error' });
        } else {
            const errorData = await respuesta.json();
            setMensaje({ texto: errorData.error || "No se pudo actualizar la clave", tipo: 'error' });
        }
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión con el servidor", tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[400px] flex flex-col justify-center p-10 space-y-8 animate-in fade-in duration-500 text-left relative">
      
      {/* 🏆 MODAL DE ÉXITO PREMIUM 🏆 */}
      {mostrarModalExito && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-300 max-w-sm text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200 animate-bounce">
                    <span className="text-white text-5xl font-black">✓</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">¡Clave Actualizada!</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tu cuenta ha sido protegida con éxito.</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full animate-progress-loading"></div>
                </div>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Redirigiendo al inicio...</p>
            </div>
        </div>
      )}

      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner rotate-3">
          <span className="text-3xl">🔐</span>
        </div>
        <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">Restablecer Clave</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-4">Crea una nueva contraseña para recuperar el acceso.</p>
      </div>

      <form onSubmit={guardarNuevaClave} className="space-y-5">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest block">Nueva Contraseña</label>
          <div className="relative group">
            <input 
              type={verClave ? "text" : "password"} 
              name="nueva" 
              required 
              value={claves.nueva}
              onChange={manejarCambio} 
              className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 pr-24" 
              placeholder="••••••••" 
            />
            <button 
                type="button" 
                onClick={() => setVerClave(!verClave)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-blue-600 tracking-widest hover:text-blue-800 transition-colors"
            >
                {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest block">Confirmar Contraseña</label>
          <input 
            type={verClave ? "text" : "password"} 
            name="confirmar" 
            required 
            value={claves.confirmar}
            onChange={manejarCambio} 
            className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700" 
            placeholder="••••••••" 
          />
        </div>

        {mensaje.texto && (
          <div className={`p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-center border-2 animate-in zoom-in-95 duration-300 ${
            mensaje.tipo === 'exito' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <button 
          type="submit" 
          disabled={cargando}
          className={`w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all text-xs uppercase tracking-[0.2em] mt-6 active:scale-95 flex justify-center items-center gap-3 ${
            cargando ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          {cargando ? 'Guardando...' : '💾 Actualizar Mi Cuenta'}
        </button>
      </form>
      
      <style>{`
        @keyframes progress-loading {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .animate-progress-loading {
            animation: progress-loading 3s linear forwards;
        }
      `}</style>
    </div>
  );
}