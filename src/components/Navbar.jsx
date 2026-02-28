import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function Navbar({ alClickIngresar, isLogged, rol, alCerrarSesion, alClickPublicar, foto }) { 
  const navigate = useNavigate();

  // Estados
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]); 
  const [hasUnread, setHasUnread] = useState(false); 
  const [menuAbierto, setMenuAbierto] = useState(false); 
  
  // Refs y Datos
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const datosUsuario = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
  const nombreBienvenida = datosUsuario.nombre || "Usuario";
  
  const DEFAULT_AVATAR = `${API_URL}/storage/usuarios/perfil.png`;

  const obtenerRutaAvatar = () => {
    if (foto) return foto;
    const fotoStorage = datosUsuario.foto_perfil_url || datosUsuario.foto;
    if (fotoStorage) {
        return fotoStorage.startsWith('http') 
            ? fotoStorage 
            : `${API_URL}/storage/usuarios/${fotoStorage}`;
    }
    return DEFAULT_AVATAR;
  };

  const handleImageError = (e) => {
    if (e.target.src !== DEFAULT_AVATAR) {
        e.target.src = DEFAULT_AVATAR;
    }
  };

  const toggleNotificaciones = () => {
    if (!mostrarNotificaciones) {
        setHasUnread(false); // Quitamos el punto rojo al abrir
    }
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGICA DE NOTIFICACIONES SILENCIADA ---
  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (isLogged && datosUsuario.idusuario && rol === 'colaborador') {
        try {
          const url = `${API_URL}/api/colaborador/solicitudes/mensajes/${datosUsuario.idusuario}`;
          const resp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
          
          if (resp.ok) {
             const data = await resp.json();
             const lista = Array.isArray(data) ? data : [];
             lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
             
             if (lista.length > notificaciones.length) {
                 setHasUnread(true);
             }
             setNotificaciones(lista);
          } else {
             console.log("%c🔔 Bandeja de notificaciones: Sin mensajes nuevos.", "color: #3b82f6; font-weight: bold;");
             setNotificaciones([]); 
          }
        } catch(e) { 
           console.log("%c🔔 Bandeja de notificaciones: Verificando red...", "color: #94a3b8; font-style: italic;");
        }
      }
    };

    fetchNotificaciones();
    const intervalo = setInterval(fetchNotificaciones, 60000); 
    return () => clearInterval(intervalo);
  }, [isLogged, datosUsuario.idusuario, rol, notificaciones.length]);

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50 italic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="flex flex-col w-8 h-5 border border-blue-900 rounded-sm overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
            <div className="bg-white h-1/3 w-full"></div>
            <div className="bg-[#0047AB] h-1/3 w-full"></div>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase">
            Turismo<span className="text-blue-300 ml-1">SV</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          
          {isLogged && (
            <>
              {/* --- 1. CAMPANITA (SIEMPRE VISIBLE EN PC Y MÓVIL) --- */}
              {rol === 'colaborador' && (
                  <div className="relative" ref={notifRef}>
                      <button 
                        onClick={toggleNotificaciones}
                        className="p-2 rounded-full hover:bg-blue-700 transition-all relative group"
                      >
                          <span className="text-xl transform group-hover:rotate-12 transition-transform block">🔔</span>
                          {hasUnread && notificaciones.length > 0 && (
                              <span className="absolute top-1 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-blue-900"></span>
                              </span>
                          )}
                      </button>

                      {mostrarNotificaciones && (
                          <div className="absolute right-[-50px] sm:right-0 top-full mt-4 w-[85vw] sm:w-96 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 origin-top-right z-[100]">
                              <div className="bg-slate-900 p-4 flex justify-between items-center">
                                  <h4 className="text-[10px] font-black uppercase text-white tracking-widest italic">Notificaciones ({notificaciones.length})</h4>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                  {notificaciones.length === 0 ? (
                                      <div className="p-8 text-center"><p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">Bandeja limpia ✨</p></div>
                                  ) : (
                                      <div className="divide-y divide-slate-50">
                                          {notificaciones.map((notif, index) => {
                                              let fechaRaw = notif.fecha;
                                              if (fechaRaw && !fechaRaw.includes('Z')) fechaRaw = fechaRaw.replace(' ', 'T') + 'Z';
                                              const fechaObj = new Date(fechaRaw);
                                              const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                              const dia = fechaObj.toLocaleDateString();

                                              return (
                                                <div key={index} className="p-5 hover:bg-blue-50/50 transition-colors relative">
                                                    <span className="absolute top-3 right-4 text-[8px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">{hora}</span>
                                                    <div className="flex gap-3 mt-1">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.mensaje?.toLowerCase().includes('rechaz') || notif.accion === 'rechazar' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <div className="pr-8">
                                                            <p className="text-[11px] font-bold text-slate-700 leading-snug mb-1">{notif.mensaje || notif.comentarios || "Nueva actualización."}</p>
                                                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic">{dia}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                              );
                                          })}
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* --- 2. VISTA ESCRITORIO (DISEÑO ORIGINAL PC) --- */}
              <div className="hidden md:flex items-center gap-4 border-r border-blue-700 pr-4">
                {rol === 'colaborador' && (
                  <button onClick={() => navigate("/mis-propuestas")} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors mr-2">Mis Propuestas</button>
                )}
                {rol === 'admin' && (
                  <button onClick={() => navigate("/dashboard")} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white mr-2">Panel Control</button>
                )}

                <div className="flex flex-col items-end leading-none mr-1">
                  <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">Sesión Activa</span>
                  <button onClick={() => navigate("/perfil")} className="text-xs font-bold uppercase not-italic hover:text-blue-200 transition-colors group">
                    Bienvenido, <span className="text-white font-black italic group-hover:underline">{nombreBienvenida}</span>
                  </button>
                </div>
                
                {/* 🔥 AVATAR PREMIUM CON AURA BRILLANTE (DESKTOP) */}
                <div onClick={() => navigate("/perfil")} className="relative group cursor-pointer ml-1">
                  {/* El Aura Brillante */}
                  <div className="absolute inset-0 rounded-full bg-yellow-400 blur-[6px] animate-pulse opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* El Aro Dorado */}
                  <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full border-2 border-blue-900 overflow-hidden bg-slate-200">
                      <img src={obtenerRutaAvatar()} className="w-full h-full object-cover" alt="Avatar" onError={handleImageError} />
                    </div>
                  </div>
                </div>

                <button onClick={alCerrarSesion} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-200 transition-colors pl-2">Salir</button>
              </div>

              {/* --- 3. VISTA MÓVIL (MENÚ HAMBURGUESA) --- */}
              <div className="md:hidden relative" ref={menuRef}>
                <button 
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-3 p-1 rounded-2xl hover:bg-blue-700 transition-all outline-none"
                >
                  {/* 🔥 AVATAR PREMIUM CON AURA BRILLANTE (MÓVIL) */}
                  <div className="relative group ml-1">
                    <div className="absolute inset-0 rounded-full bg-yellow-400 blur-[5px] animate-pulse opacity-60"></div>
                    <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600">
                      <div className="w-full h-full rounded-full border-2 border-blue-900 overflow-hidden bg-slate-200">
                        <img src={obtenerRutaAvatar()} className="w-full h-full object-cover" alt="Avatar" onError={handleImageError} />
                      </div>
                    </div>
                  </div>

                  {/* Icono de 3 rayitas */}
                  <div className="flex flex-col gap-1 w-5 mr-1">
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                  </div>
                </button>

                {/* DESPLEGABLE MÓVIL */}
                {menuAbierto && (
                  <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bienvenido</p>
                      <p className="text-sm font-black text-blue-800">{nombreBienvenida}</p>
                    </div>
                    <div className="p-2 flex flex-col">
                      <button onClick={() => { navigate("/perfil"); setMenuAbierto(false); }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 text-left transition-all group">
                        <span className="text-lg">👤</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600">Mi Perfil</span>
                      </button>
                      
                      {rol === 'colaborador' && (
                        <button onClick={() => { navigate("/mis-propuestas"); setMenuAbierto(false); }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 text-left transition-all group">
                          <span className="text-lg">📂</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600">Mis Propuestas</span>
                        </button>
                      )}

                      {rol === 'admin' && (
                        <button onClick={() => { navigate("/dashboard"); setMenuAbierto(false); }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 text-left transition-all group">
                          <span className="text-lg">🛠️</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600">Panel Control</span>
                        </button>
                      )}

                      <div className="h-px bg-slate-100 my-2"></div>
                      
                      <button onClick={() => { alCerrarSesion(); setMenuAbierto(false); }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-left transition-all group">
                        <span className="text-lg">🚪</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-red-600">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* BOTÓN INGRESAR (Solo si no está logueado) */}
          {!isLogged && (
            <button onClick={alClickIngresar} className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors border-r border-blue-700 pr-4">Ingresar</button>
          )}

          {/* BOTÓN PUBLICAR */}
          {(!rol || rol === 'colaborador') && (
            <button onClick={alClickPublicar} className="bg-green-500 hover:bg-green-600 px-3 sm:px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg text-[10px] sm:text-xs uppercase tracking-tight shrink-0">
              <span className="hidden sm:inline">+ Publicar Sitio</span>
              <span className="sm:hidden">+ Publicar</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}