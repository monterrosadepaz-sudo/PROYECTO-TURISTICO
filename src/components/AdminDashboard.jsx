import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaPropuestas from './TablaPropuestas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pestaña, setPestaña] = useState('pendientes');

  // DATOS DE PRUEBA: Incluimos toda la información necesaria para el análisis
  const [propuestas, setPropuestas] = useState([
    { 
      id: 1, 
      nombreSitio: 'Playa El Tunco', 
      departamento: 'La Libertad', 
      nombreColaborador: 'Juan Pérez', 
      telefonoColaborador: '77889900',
      correoColaborador: 'juan.perez@email.com',
      descripcion: 'Una de las playas más icónicas de El Salvador, famosa por su formación rocosa y excelentes olas para el surf.',
      imagenUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206',
      precios: { adultos: '5.00', ninos: '2.00', terceraEdad: '0.00' },
      estado: 'pendiente',
      oculto: false
    }
  ]);
  const [historial, setHistorial] = useState([]);

  // Navegación a la vista dedicada pasando el objeto "sitio"
  const irAAnalizar = (sitio) => {
    navigate('/dashboard/analizar', { state: { sitio } });
  };

  // Lógica para manejar acciones desde el historial (como re-analizar)
  const manejarAccion = (id, accion) => {
    const fechaActual = new Date().toLocaleString();
    if (accion === 'aprobar') {
      const sitio = propuestas.find(p => p.id === id);
      const aprobado = { ...sitio, estado: 'aprobado', fechaAccion: fechaActual };
      setHistorial([aprobado, ...historial]);
      setPropuestas(propuestas.filter(p => p.id !== id));
      alert("¡Destino publicado con éxito!");
    } else if (accion === 'rechazar') {
      const sitio = propuestas.find(p => p.id === id);
      const rechazado = { ...sitio, estado: 'rechazado', fechaAccion: fechaActual };
      setHistorial([rechazado, ...historial]);
      setPropuestas(propuestas.filter(p => p.id !== id));
    }
  };

  const tabStyle = (id) => `px-6 py-3 font-black uppercase text-xs tracking-widest transition-all ${
    pestaña === id ? 'bg-blue-600 text-white rounded-2xl shadow-lg' : 'text-slate-400 hover:text-blue-600'
  }`;

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Panel de Control</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Administración de Destinos Turísticos</p>
          </div>
          
          <nav className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
            <button onClick={() => setPestaña('pendientes')} className={tabStyle('pendientes')}>
              Nuevas ({propuestas.length})
            </button>
            <button onClick={() => setPestaña('activos')} className={tabStyle('activos')}>Publicados</button>
            <button onClick={() => setPestaña('historial')} className={tabStyle('historial')}>Historial</button>
          </nav>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 min-h-[500px] p-10">
          {pestaña === 'pendientes' && (
            <section className="animate-in fade-in duration-500">
              <h3 className="text-blue-700 text-[10px] font-black uppercase mb-8 tracking-[0.2em]">01. Propuestas por Aprobar</h3>
              {propuestas.length > 0 ? (
                <TablaPropuestas 
                  propuestas={propuestas} 
                  tipo="pendientes" 
                  alAnalizar={irAAnalizar} 
                />
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-400 italic text-sm font-medium">No hay nuevas solicitudes en la cola.</p>
                </div>
              )}
            </section>
          )}

          {pestaña === 'activos' && (
            <section className="animate-in fade-in duration-500">
              <h3 className="text-blue-700 text-[10px] font-black uppercase mb-8 tracking-[0.2em]">02. Sitios Publicados</h3>
              <TablaPropuestas propuestas={historial.filter(h => h.estado === 'aprobado')} tipo="activos" />
            </section>
          )}

          {pestaña === 'historial' && (
            <section className="animate-in fade-in duration-500">
              <h3 className="text-blue-700 text-[10px] font-black uppercase mb-8 tracking-[0.2em]">03. Registro de Actividad</h3>
              <TablaPropuestas propuestas={historial} tipo="historial" alAccionar={manejarAccion} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}