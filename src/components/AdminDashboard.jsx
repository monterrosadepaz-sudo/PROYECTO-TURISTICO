import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TablaPropuestas from './TablaPropuestas';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [pestaña, setPestaña] = useState('solicitudes'); 
  const [cargando, setCargando] = useState(false);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [faseModal, setFaseModal] = useState('advertencia');
  const [campoAEditar, setCampoAEditar] = useState(null); 
  const [verClave, setVerClave] = useState(false);
  
  const [usuarioActual, setUsuarioActual] = useState(null);
  
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: '', username: '', email: '', telefono: '', password: '', confirmarPassword: ''
  });

  const [propuestas, setPropuestas] = useState([]);       
  const [usuarios, setUsuarios] = useState([]);           
  const [sitiosActivos, setSitiosActivos] = useState([]); 
  const [sitiosInactivos, setSitiosInactivos] = useState([]); 
  
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [solicitudesVistas, setSolicitudesVistas] = useState([]);

  const sesion = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};

  useEffect(() => {
      if (location.state?.solicitudAtendidaId) {
          setSolicitudesPendientes(prev => prev.filter(s => s.idmensaje !== location.state.solicitudAtendidaId));
          window.history.replaceState({}, document.title);
      }
  }, [location]);

  const cargarDatos = async () => {
    if (!sesion?.idusuario) return;

    setCargando(true);
    try {
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };

      if (pestaña === 'pendientes') {
        const urlPreformularios = `${API_URL}/api/admin/preformularios`;
        const urlPublicacionesPendientes = `${API_URL}/api/admin/publicaciones/pendientes`;

        const [resPre, resPub] = await Promise.all([
            fetch(urlPreformularios, { method: 'GET', headers }).catch(e => null),
            fetch(urlPublicacionesPendientes, { method: 'GET', headers }).catch(e => null)
        ]);

        let dataPre = [];
        let dataPub = [];

        if (resPre && resPre.ok) dataPre = await resPre.json();
        if (resPub && resPub.ok) dataPub = await resPub.json();

        const listaPre = Array.isArray(dataPre) ? dataPre : [];
        const listaPub = Array.isArray(dataPub) ? dataPub : [];

        setPropuestas([...listaPre, ...listaPub]);

      } else {
        let url = '';
        if (pestaña === 'usuarios') url = `${API_URL}/api/usuarios`;
        else if (pestaña === 'activos') url = `${API_URL}/api/admin/publicaciones`;
        else if (pestaña === 'inactivos') url = `${API_URL}/api/admin/publicaciones/inactivas`;
        else if (pestaña === 'solicitudes') url = `${API_URL}/api/admin/solicitudes/listar?idadmin=${sesion.idusuario}`;

        if (url) {
          const respuesta = await fetch(url, { method: 'GET', headers });
          if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
          
          const datos = await respuesta.json();
          const listaDatos = Array.isArray(datos) ? datos : [];

          if (pestaña === 'usuarios') setUsuarios(listaDatos);
          else if (pestaña === 'activos') setSitiosActivos(listaDatos);
          else if (pestaña === 'inactivos') setSitiosInactivos(listaDatos);
          else if (pestaña === 'solicitudes') {
            const pendientes = listaDatos.filter(s => s.estado === 'pendiente');
            const revisadas = listaDatos.filter(s => s.estado !== 'pendiente');
            setSolicitudesPendientes(pendientes.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)));
            setSolicitudesVistas(revisadas.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)));
          }
        }
      }
    } catch (error) {
      console.error("FALLO DE CONEXIÓN:", error.message);
    } finally {
      setTimeout(() => setCargando(false), 500);
    }
  };

  useEffect(() => { cargarDatos(); }, [pestaña, sesion?.idusuario]);

  const abrirYMarcarSolicitud = async (solicitud) => {
      try {
          fetch(`${API_URL}/api/admin/solicitudes/detalles/${solicitud.idmensaje}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' }
          });
      } catch (e) { console.error("Error al marcar visto", e); }

      navigate(`/admin/sitio/${solicitud.idpublicacion}`, { 
          state: { datosSolicitud: solicitud } 
      });
  };

  // --- INICIO DEL FLUJO DE EDICIÓN ---
  const manejarAccion = async (id, accion, datosExtra) => {
    if (accion === 'editar_usuario') {
      setUsuarioActual(datosExtra);
      
      // 🔥 NUEVO: Limpiamos el +503 al abrir el modal para que encaje perfecto en el input
      const telefonoLimpio = datosExtra.numero ? datosExtra.numero.replace('+503', '').trim() : '';

      setDatosEdicion({
        nombre: datosExtra.nombre,
        username: datosExtra.username,
        email: datosExtra.email,
        telefono: telefonoLimpio, // Inyectamos el teléfono
        password: '',
        confirmarPassword: ''
      });
      setFaseModal('advertencia');
      setMostrarModal(true);
      return;
    }
    if (accion === 'analizar_propuesta') {
      navigate(`/dashboard/analizar/${id}`, { state: { datosSolicitud: datosExtra } }); 
      return;
    }
    if (accion === 'ver_detalle_sitio') {
      navigate(`/admin/sitio/${id}`, { state: { datosSolicitud: datosExtra } }); 
      return;
    }
  };

  const manejarCambioInput = (e) => {
    setDatosEdicion({ ...datosEdicion, [e.target.name]: e.target.value });
  };

  // 🔥 NUEVO: Función exclusiva para validar el teléfono (igual que en Registro y Perfil)
  const manejarTelefono = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDatosEdicion({ ...datosEdicion, telefono: soloNumeros });
  };

  const irAPreGuardado = () => {
    if (campoAEditar === 'password') {
      if (datosEdicion.password !== datosEdicion.confirmarPassword) {
        return alert("Las contraseñas no coinciden. Por favor, verifícalas.");
      }
      if (datosEdicion.password.length < 4) {
        return alert("La contraseña debe tener al menos 4 caracteres.");
      }
    }
    
    // 🔥 NUEVO: Validación de 8 dígitos antes de guardar
    if (campoAEditar === 'telefono' && datosEdicion.telefono.length !== 8 && datosEdicion.telefono.length > 0) {
      return alert("El número de teléfono debe tener exactamente 8 dígitos.");
    }

    setFaseModal('confirmacion');
  };

  const guardarUsuario = async () => {
    setGuardandoUsuario(true);

    try {
      const url = `${API_URL}/api/usuarios/${usuarioActual.idusuario}`;
      
      const payload = {
        nombre: datosEdicion.nombre,
        username: datosEdicion.username,
        email: datosEdicion.email,
        rol: usuarioActual.rol 
      };

      // 🔥 NUEVO: Agregamos el número al payload con el formato de Julio
      if (datosEdicion.telefono) {
        payload.numero = `+503${datosEdicion.telefono}`;
      }

      if (campoAEditar === 'password' && datosEdicion.password) {
        payload.password = datosEdicion.password;
      }

      const respuesta = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setFaseModal('exito');
        cargarDatos(); 
        setTimeout(() => {
          setMostrarModal(false);
          setFaseModal('advertencia');
        }, 2500);
      } else {
        alert("Error: " + (data.message || data.error || "Datos inválidos"));
        setFaseModal('editar');
      }
    } catch (error) {
      alert("Error de conexión al guardar.");
      setFaseModal('editar');
    } finally {
      setGuardandoUsuario(false);
    }
  };

  const getTabStyle = (idTab, colorActive) => {
    const isActive = pestaña === idTab;
    return `px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap cursor-pointer ${
      isActive ? `${colorActive} text-white rounded-2xl shadow-lg transform scale-105` : 'text-slate-400 hover:text-blue-600'
    }`;
  };

  const CardSolicitud = ({ sol, esAntigua = false }) => {
    let fechaRaw = sol.fecha;
    if (fechaRaw && !fechaRaw.includes('Z')) {
        fechaRaw = fechaRaw.replace(' ', 'T') + 'Z';
    }
    const fechaObj = new Date(fechaRaw);
    const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group 
        ${esAntigua ? 'opacity-60 scale-95 grayscale bg-slate-50' : 'border-slate-100 shadow-xl hover:shadow-2xl'}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-3 ${esAntigua ? 'bg-slate-300' : (sol.accion?.toLowerCase() === 'eliminar' ? 'bg-red-500' : 'bg-blue-500')}`}></div>
        <div className={`p-8 pl-10 space-y-6 ${esAntigua ? 'py-4' : ''}`}>
            <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className={`font-black uppercase italic tracking-tighter ${esAntigua ? 'text-sm text-slate-500' : 'text-xl ' + (sol.accion?.toLowerCase() === 'eliminar' ? 'text-red-500' : 'text-blue-600')}`}>
                            SOLICITUD DE {sol.accion}
                        </h4>
                        {esAntigua && <span className="bg-slate-200 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black uppercase italic">{sol.estado}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Solicitada por: <span className="font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-1">{(sol.remitente_id || "Desconocido").substring(0, 13)}...</span>
                    </p>
                </div>
                <div className="text-right">
                    <span className={`block font-black italic leading-none ${esAntigua ? 'text-slate-300 text-lg' : 'text-slate-200 text-2xl'}`}>{hora}</span>
                    <span className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest">{fechaObj.toLocaleDateString()}</span>
                </div>
            </div>
            {!esAntigua && (
                <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-slate-200 italic relative">
                    <p className="text-slate-800 font-black text-sm leading-relaxed">"{sol.comentarios}"</p>
                </div>
            )}
            {!esAntigua && (
                <div>
                    <button onClick={() => abrirYMarcarSolicitud(sol)} className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-lg transition-all flex items-center justify-center gap-3 group-hover:scale-[1.02]">
                        <span>Revisar Solicitud</span><span className="text-lg">→</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left italic font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-start">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-800 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all group">
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Inicio
          </button>
        </div>

        {/* BARRA DE NAVEGACIÓN */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">Panel Admin</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Gestión de Turismo SV</p>
          </div>
          
          <nav className="flex bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-x-auto max-w-full">
            <button onClick={() => setPestaña('solicitudes')} className={getTabStyle('solicitudes', 'bg-purple-600')}>Buzón ({solicitudesPendientes.length})</button>
            <button onClick={() => setPestaña('pendientes')} className={getTabStyle('pendientes', 'bg-orange-500')}>Pendientes ({propuestas.length})</button>
            <button onClick={() => setPestaña('activos')} className={getTabStyle('activos', 'bg-green-500')}>Activos ({sitiosActivos.length})</button>
            <button onClick={() => setPestaña('inactivos')} className={getTabStyle('inactivos', 'bg-red-500')}>Inactivos ({sitiosInactivos.length})</button>
            <button onClick={() => setPestaña('usuarios')} className={getTabStyle('usuarios', 'bg-blue-600')}>Usuarios</button>
          </nav>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[600px] p-12 relative overflow-hidden">
          
          {cargando && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest animate-pulse">Sincronizando...</p>
            </div>
          )}

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pestaña === 'solicitudes' && (
              <div className="space-y-12">
                <div>
                    <h3 className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">01. Solicitudes Pendientes ({solicitudesPendientes.length})</h3>
                    {solicitudesPendientes.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">No hay mensajes nuevos.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {solicitudesPendientes.map(sol => <CardSolicitud key={sol.idmensaje} sol={sol} />)}
                        </div>
                    )}
                </div>

                {solicitudesVistas.length > 0 && (
                    <div className="pt-10 border-t border-slate-100">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic text-center">Historial de Solicitudes Revisadas</h3>
                        <div className="grid gap-4 opacity-80 max-w-4xl mx-auto">
                            {solicitudesVistas.map(sol => <CardSolicitud key={sol.idmensaje} sol={sol} esAntigua={true} />)}
                        </div>
                    </div>
                )}
              </div>
            )}

            {pestaña === 'pendientes' && (
              <>
                <h3 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">02. Solicitudes de Aprobación</h3>
                {propuestas.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-slate-300 font-bold uppercase text-xs italic">No hay propuestas pendientes de revisión.</p>
                  </div>
                ) : (
                  <TablaPropuestas propuestas={propuestas} tipo="pendientes" alAccionar={manejarAccion} />
                )}
              </>
            )}

            {pestaña === 'activos' && (
              <>
                <h3 className="text-green-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">03. Destinos Públicos (En Mapa)</h3>
                {sitiosActivos.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">No hay sitios activos.</p>
                  </div>
                ) : (
                  <TablaPropuestas propuestas={sitiosActivos} tipo="activos" alAccionar={manejarAccion} />
                )}
              </>
            )}

            {pestaña === 'inactivos' && (
              <>
                <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">04. Destinos Ocultos</h3>
                {sitiosInactivos.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">No hay sitios inactivos.</p>
                  </div>
                ) : (
                  <TablaPropuestas propuestas={sitiosInactivos} tipo="activos" alAccionar={manejarAccion} />
                )}
              </>
            )}

            {pestaña === 'usuarios' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] italic">05. Gestión de Usuarios</h3>
                </div>
                <TablaPropuestas usuarios={usuarios} tipo="usuarios" alAccionar={manejarAccion} />
              </>
            )}
          </section>
        </div>
      </div>

      {/* MODAL MULTI-FASE PARA EDICIÓN DE USUARIOS */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-all">
          
          {/* FASE 1: ADVERTENCIA ÉTICA */}
          {faseModal === 'advertencia' && (
            <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 text-center italic animate-in zoom-in-95">
              <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-black">!</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">¿Estás seguro?</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-4">
                Estás a punto de modificar la información de <span className="text-blue-600">"{usuarioActual?.nombre}"</span>.
              </p>
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-8">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                  Si vas a modificar información de alguien más, recuerda tener su consentimiento explícito.
                </p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setFaseModal('menu')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
                  Sí, estoy seguro
                </button>
                <button onClick={() => setMostrarModal(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                  No estoy seguro (Cancelar)
                </button>
              </div>
            </div>
          )}

          {/* FASE 2: MENÚ DE EDICIÓN */}
          {faseModal === 'menu' && (
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden italic animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-blue-800 p-8 text-white text-center relative">
                <button onClick={() => setMostrarModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white font-black">✕</button>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Editar Información</h2>
                <p className="text-[9px] text-blue-200 mt-2 tracking-widest uppercase">Selecciona qué deseas modificar</p>
              </div>
              <div className="p-8 space-y-3">
                {/* 🔥 NUEVO: Se agregó 'telefono' a las opciones */}
                {['nombre', 'username', 'email', 'telefono', 'password'].map((campo) => (
                  <button key={campo} onClick={() => { setCampoAEditar(campo); setFaseModal('editar'); setVerClave(false); }} className="w-full py-5 px-8 bg-slate-50 hover:bg-blue-50 text-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-slate-100 text-left flex justify-between items-center group transition-all">
                    {campo === 'password' ? 'Contraseña' : campo === 'email' ? 'Correo' : campo === 'telefono' ? 'Teléfono' : campo}
                    <span className="text-blue-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ))}
                <button onClick={() => setMostrarModal(false)} className="w-full mt-4 pt-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase underline decoration-2 underline-offset-4 text-center">
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* FASE 3: FORMULARIO DE EDICIÓN */}
          {faseModal === 'editar' && (
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden italic animate-in zoom-in-95">
              <div className="bg-blue-800 p-8 text-white flex items-center justify-between">
                <button onClick={() => setFaseModal('menu')} className="text-[9px] font-black uppercase tracking-widest hover:text-blue-200 transition-colors">← Volver</button>
                <h2 className="text-lg font-black uppercase tracking-tighter italic text-right">
                  Editando {campoAEditar === 'password' ? 'Contraseña' : campoAEditar === 'telefono' ? 'Teléfono' : campoAEditar}
                </h2>
              </div>
              <div className="p-8 space-y-6">
                
                {campoAEditar === 'nombre' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nuevo Nombre Completo</label>
                    <input type="text" name="nombre" value={datosEdicion.nombre} onChange={manejarCambioInput} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Nombre completo" />
                  </div>
                )}

                {campoAEditar === 'username' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nuevo nombre de usuario</label>
                    <input type="text" name="username" value={datosEdicion.username} onChange={manejarCambioInput} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="usuario123" />
                  </div>
                )}

                {campoAEditar === 'email' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nuevo Correo Electrónico</label>
                    <input type="email" name="email" value={datosEdicion.email} onChange={manejarCambioInput} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="correo@ejemplo.com" />
                  </div>
                )}

                {/* 🔥 NUEVO: Campo de Teléfono en el Modal del Admin */}
                {campoAEditar === 'telefono' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nuevo Teléfono</label>
                    <div className="flex rounded-2xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                      <span className="inline-flex items-center pl-6 pr-3 text-slate-500 font-black text-sm italic">
                        +503
                      </span>
                      <input 
                        type="tel" 
                        name="telefono" 
                        value={datosEdicion.telefono} 
                        onChange={manejarTelefono} 
                        className="w-full py-4 pr-6 bg-transparent border-none text-sm font-bold outline-none" 
                        placeholder="71234567" 
                      />
                    </div>
                  </div>
                )}

                {campoAEditar === 'password' && (
                  <div className="space-y-4">
                    <div className="space-y-2 relative">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nueva Contraseña</label>
                      <input type={verClave ? "text" : "password"} name="password" value={datosEdicion.password} onChange={manejarCambioInput} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 pr-24" placeholder="Min. 4 caracteres" />
                      <button type="button" onClick={() => setVerClave(!verClave)} className="absolute right-5 top-10 text-[9px] font-black uppercase text-blue-600 tracking-widest">
                        {verClave ? 'OCULTAR' : 'MOSTRAR'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Confirmar Contraseña</label>
                      <input type={verClave ? "text" : "password"} name="confirmarPassword" value={datosEdicion.confirmarPassword} onChange={manejarCambioInput} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Repite la contraseña" />
                    </div>
                  </div>
                )}

                <button onClick={irAPreGuardado} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg transition-all tracking-widest active:scale-95">
                  Pre-Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {/* FASE 4: CONFIRMACIÓN FINAL */}
          {faseModal === 'confirmacion' && (
            <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 text-center italic animate-in zoom-in-95">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-black">?</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">¿Confirmas actualizar esta información?</h3>
              <div className="flex gap-3">
                <button onClick={() => setFaseModal('editar')} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                  No, volver
                </button>
                <button onClick={guardarUsuario} disabled={guardandoUsuario} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all flex justify-center items-center">
                  {guardandoUsuario ? 'PROCESANDO...' : 'SÍ, GUARDAR'}
                </button>
              </div>
            </div>
          )}

          {/* FASE 5: ÉXITO */}
          {faseModal === 'exito' && (
            <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center italic animate-in zoom-in-95">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce">
                <span className="text-5xl font-black leading-none">✓</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">¡Actualizado!</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">La información se guardó correctamente.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}