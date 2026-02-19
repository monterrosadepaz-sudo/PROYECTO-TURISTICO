import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

export default function Navbar({ alClickIngresar, isLogged, rol, alCerrarSesion, alClickPublicar, foto }) { 
  const navigate = useNavigate();

  // Estados
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]); 
  
  // Refs y Datos
  const notifRef = useRef(null);
  const datosUsuario = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
  const nombreBienvenida = datosUsuario.nombre || "Usuario";
  
  // --- URL POR DEFECTO DEL SISTEMA ---
  const DEFAULT_AVATAR = "http://100.123.6.123:8000/storage/usuarios/perfil.png";

  const obtenerRutaAvatar = () => {
    if (foto) return foto;
    const fotoStorage = datosUsuario.foto_perfil_url || datosUsuario.foto;
    if (fotoStorage) {
        return fotoStorage.startsWith('http') 
            ? fotoStorage 
            : `http://100.123.6.123:8000/storage/usuarios/${fotoStorage}`;
    }
    return DEFAULT_AVATAR;
  };

  const handleImageError = (e) => {
    if (e.target.src !== DEFAULT_AVATAR) {
        e.target.src = DEFAULT_AVATAR;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGICA DE NOTIFICACIONES ---
  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (isLogged && datosUsuario.idusuario && rol === 'colaborador') {
        try {
          const url = `http://100.123.6.123:8000/api/colaborador/solicitudes/mensajes/${datosUsuario.idusuario}`;
          const resp = await fetch(url, {
             method: 'GET',
             headers: { 'Accept': 'application/json' }
          });
          
          if (resp.ok) {
             const data = await resp.json();
             const lista = Array.isArray(data) ? data : [];
             
             // 1. ORDENAR: Las más recientes (fecha mayor) primero
             lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
             
             setNotificaciones(lista);
          } else if (resp.status === 404) {
             setNotificaciones([]); 
          }
        } catch(e) {
          // Silencioso
        }
      }
    };

    fetchNotificaciones();
    const intervalo = setInterval(fetchNotificaciones, 30000); 
    return () => clearInterval(intervalo);
  }, [isLogged, datosUsuario.idusuario, rol]);

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50 italic">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group">
          <div className="flex flex-col w-8 h-5 border border-blue-900 rounded-sm overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
            <div className="bg-white h-1/3 w-full"></div>
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">
            Turismo<span className="text-blue-300 ml-1">SV</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          
          {isLogged && (
            <div className="flex items-center gap-4 mr-4 border-r border-blue-700 pr-4">
              
              {rol === 'colaborador' && (
                <button onClick={() => navigate("/mis-propuestas")} className="hidden md:block text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors mr-2">
                  Mis Propuestas
                </button>
              )}

              {rol === 'admin' && (
                <button onClick={() => navigate("/dashboard")} className="hidden md:block text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white mr-2">
                  Panel Control
                </button>
              )}

              {/* CAMPANITA */}
              {rol === 'colaborador' && (
                  <div className="relative" ref={notifRef}>
                      <button 
                        onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                        className="p-2 rounded-full hover:bg-blue-700 transition-all relative group"
                      >
                          <span className="text-xl transform group-hover:rotate-12 transition-transform block">🔔</span>
                          {notificaciones.length > 0 && (
                              <span className="absolute top-1 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-blue-900"></span>
                              </span>
                          )}
                      </button>

                      {mostrarNotificaciones && (
                          <div className="absolute right-0 top-full mt-4 w-96 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 origin-top-right z-[100]">
                              <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                                  <h4 className="text-[10px] font-black uppercase text-white tracking-widest italic">
                                      Notificaciones ({notificaciones.length})
                                  </h4>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                  {notificaciones.length === 0 ? (
                                      <div className="p-8 text-center"><p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">Bandeja limpia ✨</p></div>
                                  ) : (
                                      <div className="divide-y divide-slate-50">
                                          {notificaciones.map((notif, index) => {
                                              // --- CORRECCIÓN DE HORA ---
                                              let fechaRaw = notif.fecha;
                                              
                                              // Si no trae la 'Z', asumimos UTC y ajustamos formato ISO
                                              if (fechaRaw && !fechaRaw.includes('Z')) {
                                                  fechaRaw = fechaRaw.replace(' ', 'T') + 'Z';
                                              }

                                              // Convertimos a objeto fecha (El navegador ajustará a la zona horaria local)
                                              const fechaObj = new Date(fechaRaw);
                                              
                                              const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                              const dia = fechaObj.toLocaleDateString();

                                              return (
                                                <div key={index} className="p-5 hover:bg-blue-50/50 transition-colors cursor-default relative">
                                                    
                                                    {/* HORA EN LA ESQUINA SUPERIOR DERECHA */}
                                                    <span className="absolute top-3 right-4 text-[8px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                                        {hora}
                                                    </span>

                                                    <div className="flex gap-3 mt-1">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.mensaje?.toLowerCase().includes('rechaz') || notif.accion === 'rechazar' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <div className="pr-8"> {/* Padding derecho para que el texto no choque con la hora */}
                                                            <p className="text-[11px] font-bold text-slate-700 leading-snug mb-1">
                                                                {notif.mensaje || notif.comentarios || notif.texto || "Nueva actualización."}
                                                            </p>
                                                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic">
                                                                {dia}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                              );
                                          })}
                                      </div>
                                  )}
                              </div>
                              {notificaciones.length > 0 && (
                                  <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                                      <button onClick={() => setMostrarNotificaciones(false)} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 italic py-2 w-full">Cerrar</button>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              )}

              {/* PERFIL */}
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">Sesión Activa</span>
                <button onClick={() => navigate("/perfil")} className="text-xs font-bold uppercase not-italic hover:text-blue-200 transition-colors group">
                  Bienvenido, <span className="text-white font-black italic group-hover:underline">{nombreBienvenida}</span>
                </button>
              </div>
              
              {/* AVATAR */}
              <div 
                onClick={() => navigate("/perfil")}
                className="w-10 h-10 rounded-full border-2 border-blue-400 overflow-hidden cursor-pointer hover:border-white hover:scale-110 transition-all bg-slate-200 shadow-lg"
              >
                <img 
                  src={obtenerRutaAvatar()} 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                  onError={handleImageError} 
                />
              </div>
            </div>
          )}

          {/* BOTONES SALIR / INGRESAR */}
          {isLogged ? (
            <button onClick={alCerrarSesion} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-200 transition-colors pl-2">Salir</button>
          ) : (
            <button onClick={alClickIngresar} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors border-r border-blue-700 pr-4">Ingresar</button>
          )}

          {(!rol || rol === 'colaborador') && (
            <button onClick={alClickPublicar} className="bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg text-xs uppercase tracking-tight">+ Publicar Sitio</button>
          )}
        </div>
      </div>
    </nav>
  );
}