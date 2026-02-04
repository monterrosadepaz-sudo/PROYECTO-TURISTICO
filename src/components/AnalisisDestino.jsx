import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AnalisisDestino() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sitio } = location.state || {};

  if (!sitio) return <div className="p-20 text-center font-bold uppercase text-slate-400">Sin datos de propuesta</div>;

  // MAPEADO DE POLÍTICAS: Sincronizado con las llaves con guion bajo de Julio
  const listaPermisos = [
    { id: 'traer_comida', label: 'Traer comida' },
    { id: 'gaseosas_agua', label: 'Gaseosas / Agua' },
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'mascotas', label: 'Mascotas' },
    { id: 'mesas_sillas', label: 'Mesas y sillas' },
    { id: 'hamacas', label: 'Hamacas' },
    { id: 'parrillas_cocinas', label: 'Parrillas / Cocinas' },
    { id: 'armas_de_fuego', label: 'Armas de fuego' }
  ];

  // Lógica de acciones para el Administrador usando los mensajes de Julio
  const gestionarPropuesta = async (nuevoEstado) => {
    const confirmacion = window.confirm(`¿Estás seguro de ${nuevoEstado === 'aprobado' ? 'Aprobar' : 'Rechazar'} esta propuesta?`);
    if (!confirmacion) return;

    try {
      const metodo = nuevoEstado === 'aprobado' ? 'PUT' : 'DELETE';
      const url = `http://100.123.6.123:8000/api/propuestas/${sitio.idprefomulario}`;
      
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: nuevoEstado === 'aprobado' ? JSON.stringify({ estado: 'aprobado' }) : null
      });

      const resultado = await respuesta.json();
      if (respuesta.ok) {
        alert(resultado.message); // Muestra "Preformulario actualizado" o "Preformulario eliminado"
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Error en la conexión con el servidor de Julio");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-left italic">
      {/* HEADER FIJO CON ACCIONES REALES */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all">
            ← VOLVER AL PANEL
          </button>
          <div className="flex gap-4">
            <button onClick={() => gestionarPropuesta('rechazado')} className="px-8 py-4 bg-slate-100 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-50 transition-all">Rechazar</button>
            <button onClick={() => gestionarPropuesta('aprobado')} className="px-10 py-4 bg-green-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all">Aprobar y Publicar</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
             <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Petición de Colaborador:</h4>
             <p className="text-3xl font-black italic uppercase leading-none mb-2">{sitio.nombre || "Usuario SV"}</p>
             <p className="text-xs font-black text-blue-200 tracking-widest">ID: {sitio.idusuario}</p>
          </section>

          {/* COSTOS DINÁMICOS DEL JSON */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm text-center">
             <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-left">Costos de Entrada</h4>
             <div className={`py-6 rounded-3xl border-2 border-dashed ${sitio.costo_entrada === 0 ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                <p className={`text-4xl font-black italic uppercase ${sitio.costo_entrada === 0 ? 'text-green-600' : 'text-blue-700'}`}>
                  {sitio.costo_entrada === 0 ? '¡GRATIS!' : `$${sitio.costo_entrada?.toFixed(2)}`}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400">Precio por persona</p>
             </div>
          </section>

          {/* REGLAMENTO CON LLAVES DE JULIO */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Reglamento y Políticas</h4>
            <div className="space-y-3">
              {listaPermisos.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border ${sitio.politicas?.[p.id] ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100 opacity-60'}`}>
                  <span className={`text-[10px] font-black uppercase italic ${sitio.politicas?.[p.id] ? 'text-green-700' : 'text-red-700'}`}>
                    {p.label}
                  </span>
                  <span className={`text-xs font-black uppercase ${sitio.politicas?.[p.id] ? 'text-green-600' : 'text-red-600'}`}>
                    {sitio.politicas?.[p.id] ? 'Sí' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-200 shadow-sm space-y-10">
            
            <div className="flex flex-col gap-1 border-b pb-8 border-slate-100">
              <h2 className="text-6xl font-black text-blue-600 italic uppercase leading-none tracking-tighter">
                {sitio.departamento}
              </h2>
              <h2 className="text-6xl font-black text-slate-800 italic uppercase leading-none tracking-tighter">
                {sitio.nombre}
              </h2>
            </div>
            
            {/* IMAGEN BAUTIZADA */}
            <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-slate-50 bg-slate-100">
              <img 
                src={`http://100.123.6.123:8000/storage/${sitio.imagen}`} 
                className="w-full h-full object-cover" 
                alt="Propuesta" 
                onError={(e) => e.target.src = 'https://via.placeholder.com/800x450?text=Imagen+No+Disponible'}
              />
            </div>

            {/* ESTADO DE HORARIOS */}
            <div className="space-y-4">
              <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest">Disponibilidad Reportada</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sitio.horarios && Object.keys(sitio.horarios).map(dia => (
                  <div key={dia} className={`p-4 rounded-2xl border text-center ${sitio.horarios[dia] === 'abierto' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[9px] font-black uppercase text-slate-400">{dia}</p>
                    <p className={`text-xs font-black uppercase italic ${sitio.horarios[dia] === 'abierto' ? 'text-blue-600' : 'text-slate-300'}`}>
                      {sitio.horarios[dia]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* MAPA CON LATITUD Y LONGITUD REAL */}
            <div className="space-y-6 pt-10 border-t border-slate-100">
              <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic">Coordenadas: {sitio.latitud}, {sitio.longitud}</h4>
              <div className="h-[450px] w-full rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-inner relative z-0">
                <MapContainer 
                  center={[sitio.latitud || 13.69, sitio.longitud || -89.21]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[sitio.latitud || 13.69, sitio.longitud || -89.21]}>
                    <Popup>{sitio.nombre}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}