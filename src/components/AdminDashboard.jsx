import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaPropuestas from './TablaPropuestas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Estados de navegación
  const [pestaña, setPestaña] = useState('activos'); // Iniciamos en activos para probar lo de Julio
  const [cargando, setCargando] = useState(false);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({ idusuario: '', nombre: '', username: '', email: '', password: '', rol: 'Colaborador' });

  // Listas de datos
  const [propuestas, setPropuestas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sitiosActivos, setSitiosActivos] = useState([]);
  const [sitiosInactivos, setSitiosInactivos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        let url = '';
        
        // --- MAPEO DE RUTAS (AQUÍ ESTÁ EL CAMBIO IMPORTANTE) ---
        if (pestaña === 'usuarios') {
          url = 'http://100.123.6.123:8000/api/usuarios';
        } else if (pestaña === 'pendientes') {
          url = 'http://100.123.6.123:8000/api/admin/preformularios'; 
        } else if (pestaña === 'activos') {
          // ¡ESTA ES LA RUTA OFICIAL QUE TE PASÓ JULIO!
          url = 'http://100.123.6.123:8000/api/admin/publicaciones';
        } else if (pestaña === 'inactivos') {
          // Dejamos esta pendiente hasta que Julio nos confirme si hay endpoint separado
          // o si filtramos la lista principal.
          url = 'http://100.123.6.123:8000/api/admin/publicaciones/inactivas';
        }

        if (url) {
          const respuesta = await fetch(url, {
            method: 'GET', // Importante explicitar GET
            headers: { 'Accept': 'application/json' }
          });
          
          if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
          const datos = await respuesta.json();
          
          if (pestaña === 'usuarios') setUsuarios(datos);
          else if (pestaña === 'pendientes') setPropuestas(datos);
          else if (pestaña === 'activos') setSitiosActivos(datos); // Aquí caerán Ichanmichen y Prueba
          else if (pestaña === 'inactivos') setSitiosInactivos(datos);
        }
      } catch (error) {
        console.error("FALLO DE CONEXIÓN:", error.message);
        // Si falla, limpiamos la lista para no mostrar basura
        if (pestaña === 'activos') setSitiosActivos([]);
      } finally {
        setTimeout(() => setCargando(false), 500);
      }
    };
    cargarDatos();
  }, [pestaña]);

  const manejarAccion = async (id, accion, datosExtra) => {
    // Caso 1: Editar Usuarios
    if (accion === 'editar_usuario') {
      setUsuarioActual({ ...datosExtra, password: '' });
      setModoEdicion(true);
      setMostrarModal(true);
      return;
    }

    // Caso 2: Ver Propuesta (Borrador)
    if (accion === 'analizar_propuesta') {
      navigate(`/dashboard/analizar/${id}`); 
      return;
    }

    // Caso 3: Ver Sitio Activo (Publicación Oficial)
    if (accion === 'ver_detalle_sitio') {
      // Aquí usamos el idpublicacion que viene de la lista de Julio
      // Redirigimos a una vista de detalle o reutilizamos el editor en modo lectura
      // Por ahora, asumimos que tienes una ruta para ver detalles
      navigate(`/admin/sitio/${id}`); 
      return;
    }

    console.log(`Acción ${accion} para ID: ${id}`);
  };

  // Helper para estilos
  const getTabStyle = (idTab, colorActive) => {
    const isActive = pestaña === idTab;
    return `px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${
      isActive 
        ? `${colorActive} text-white rounded-2xl shadow-lg transform scale-105` 
        : 'text-slate-400 hover:text-blue-600'
    }`;
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
            <button onClick={() => setPestaña('pendientes')} className={getTabStyle('pendientes', 'bg-orange-500')}>
              Pendientes ({propuestas.length})
            </button>
            <button onClick={() => setPestaña('activos')} className={getTabStyle('activos', 'bg-green-500')}>
              Sitios Activos ({sitiosActivos.length})
            </button>
            <button onClick={() => setPestaña('inactivos')} className={getTabStyle('inactivos', 'bg-red-500')}>
              Inactivos ({sitiosInactivos.length})
            </button>
            <button onClick={() => setPestaña('usuarios')} className={getTabStyle('usuarios', 'bg-blue-600')}>
              Usuarios
            </button>
          </nav>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[600px] p-12 relative overflow-hidden">
          
          {cargando && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest animate-pulse">Cargando..</p>
            </div>
          )}

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* PESTAÑA: PENDIENTES */}
            {pestaña === 'pendientes' && (
              <>
                <h3 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">01. Solicitudes de Colaboradores</h3>
                {propuestas.length === 0 ? (
                  <p className="text-center py-20 text-slate-300 font-bold uppercase text-xs italic">No hay propuestas pendientes.</p>
                ) : (
                  <TablaPropuestas propuestas={propuestas} tipo="pendientes" alAccionar={manejarAccion} />
                )}
              </>
            )}

            {/* PESTAÑA: ACTIVOS (AQUÍ VERÁS ICHANMICHEN) */}
            {pestaña === 'activos' && (
              <>
                <h3 className="text-green-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">02. Destinos Públicos (En Mapa)</h3>
                {sitiosActivos.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">No hay sitios activos.</p>
                  </div>
                ) : (
                  // Reutilizamos la tabla pero con tipo 'activos'
                  <TablaPropuestas propuestas={sitiosActivos} tipo="activos" alAccionar={manejarAccion} />
                )}
              </>
            )}

            {/* PESTAÑA: INACTIVOS */}
            {pestaña === 'inactivos' && (
              <>
                <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">03. Destinos Ocultos</h3>
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">No hay sitios inactivos.</p>
                </div>
              </>
            )}

            {/* PESTAÑA: USUARIOS */}
            {pestaña === 'usuarios' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] italic">04. Gestión de Usuarios</h3>
                  <button onClick={() => setMostrarModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                    + Nuevo Usuario
                  </button>
                </div>
                <TablaPropuestas usuarios={usuarios} tipo="usuarios" alAccionar={manejarAccion} />
              </>
            )}
          </section>
        </div>
      </div>

      {/* MODAL DE USUARIOS */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 italic">
            <div className="bg-blue-800 p-8 text-white text-center">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Gestión de Usuario</h2>
            </div>
            <div className="p-10 flex gap-4">
               <button onClick={() => setMostrarModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
               <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}