import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AnalisisDestino() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sitio } = location.state || {};

  if (!sitio) return <div className="p-20 text-center font-bold uppercase text-slate-400">Sin datos de propuesta</div>;

  // 2. Mapeo de etiquetas para permisos (Permitido vs Prohibido)
  const listaPermisos = [
    { id: 'comida', label: 'Traer comida' },
    { id: 'bebidasGaseosas', label: 'Gaseosas / Agua' },
    { id: 'bebidasAlcoholicas', label: 'Alcohol' },
    { id: 'mascotas', label: 'Mascotas' },
    { id: 'mesasSillas', label: 'Mesas y sillas' },
    { id: 'hamacas', label: 'Hamacas' },
    { id: 'parrillasCocinas', label: 'Parrillas / Cocinas' },
    { id: 'armasFuego', label: 'Armas de fuego' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-left italic">
      {/* HEADER FIJO */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all">
            ← VOLVER AL PANEL
          </button>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-slate-100 text-red-500 font-black uppercase text-[10px] rounded-2xl hover:bg-red-50 transition-all">Rechazar</button>
            <button className="px-10 py-4 bg-green-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all">Aprobar y Publicar</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLUMNA IZQUIERDA: COLABORADOR Y COSTOS */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
             <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Petición de:</h4>
             <p className="text-3xl font-black italic uppercase leading-none mb-2">{sitio.nombreColaborador}</p>
             <p className="text-sm font-black text-blue-200 tracking-widest">+503 {sitio.telefonoColaborador}</p>
          </section>

          {/* 1. COSTOS DE ENTRADA (Gratis por ser playa) */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm text-center">
             <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-left">Costos de Entrada</h4>
             <div className="py-4 bg-green-50 rounded-3xl border-2 border-green-100 border-dashed">
                <p className="text-4xl font-black text-green-600 uppercase italic">¡GRATIS!</p>
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1">Acceso Público y Libre</p>
             </div>
          </section>

          {/* 2. POLÍTICAS DE INGRESO (Permitido vs Prohibido) */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Reglamento y Políticas</h4>
            <div className="space-y-3">
              {listaPermisos.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border ${sitio.permisos?.[p.id] ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100 opacity-60'}`}>
                  <span className={`text-[10px] font-black uppercase italic ${sitio.permisos?.[p.id] ? 'text-green-700' : 'text-red-700'}`}>
                    {p.label}
                  </span>
                  <span className={`text-xs font-black uppercase ${sitio.permisos?.[p.id] ? 'text-green-600' : 'text-red-600'}`}>
                    {sitio.permisos?.[p.id] ? 'Permitido' : 'Prohibido'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: DETALLES Y MAPA */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-200 shadow-sm space-y-10">
            
            {/* 4. UBICACIÓN: DEPARTAMENTO Y NOMBRE DEL MISMO TAMAÑO */}
            <div className="flex flex-col gap-1 border-b pb-8 border-slate-100">
              <h2 className="text-6xl font-black text-blue-600 italic uppercase leading-none tracking-tighter">
                {sitio.departamento}
              </h2>
              <h2 className="text-6xl font-black text-slate-800 italic uppercase leading-none tracking-tighter">
                {sitio.nombreSitio}
              </h2>
            </div>
            
            <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-slate-50 bg-slate-100">
              <img src={sitio.imagenUrl} className="w-full h-full object-cover" alt="Referencia" />
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
              <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4 italic">Descripción General</h4>
              <p className="text-xl text-slate-600 font-medium leading-relaxed italic">"{sitio.descripcion}"</p>
            </div>

            {/* 3. HORARIO: ABIERTO 24/7 */}
            <div className="space-y-4">
              <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest">Estado del Destino</h4>
              <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-100 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                   <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.8)]"></div>
                   <p className="text-3xl font-black uppercase italic tracking-tighter">Abierto 24 / 7</p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-right">Disponible todo el año<br/>Acceso libre nocturno</p>
              </div>
            </div>

            {/* MAPA DINÁMICO */}
            <div className="space-y-6 pt-10 border-t border-slate-100">
              <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-widest italic">Punto Geográfico Exacto</h4>
              <div className="h-[450px] w-full rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-inner relative z-0">
                <MapContainer 
                  center={[sitio.ubicacion?.lat || 13.69, sitio.ubicacion?.lng || -89.21]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[sitio.ubicacion?.lat || 13.69, sitio.ubicacion?.lng || -89.21]}>
                    <Popup>{sitio.nombreSitio}</Popup>
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