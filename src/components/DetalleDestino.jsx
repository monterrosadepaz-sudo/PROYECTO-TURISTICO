import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DetalleDestino({ sitio }) {
  const navigate = useNavigate();

  // Si no hay datos del sitio (por ejemplo, al recargar), mostramos un estado de carga
  if (!sitio) return (
    <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">
      Cargando información del destino...
    </div>
  );

  const todasLasPoliticas = [
    'Traer comida', 'Gaseosas / Agua', 'Mascotas', 
    'Mesas y sillas', 'Hamacas', 'Parrillas / Cocinas', 
    'Alcohol', 'Armas de fuego'
  ];

  const permitidosJardines = sitio.permitidos || [];

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-500 text-left">
      {/* BOTÓN DE REGRESO DINÁMICO */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50 transition-all">
            <span className="text-lg">←</span>
          </div>
          Regresar a resultados
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* TÍTULO Y BANNER PRINCIPAL */}
          <h1 className="text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {sitio.nombre}
          </h1>

          <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50 aspect-video bg-slate-100">
            <img src={sitio.imagen} className="w-full h-full object-cover" alt={sitio.nombre} />
          </div>

          {/* TARJETA DE INFORMACIÓN Y REGLAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <h4 className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Sobre el lugar</h4>
              <p className="text-slate-700 text-2xl font-medium italic leading-snug tracking-tight">
                "{sitio.descripcion}"
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Reglas de ingreso</h4>
              <div className="flex flex-wrap gap-2">
                {permitidosJardines.map((p, i) => (
                  <span key={i} className="px-3 py-1.5 border-2 border-lime-400 bg-white text-lime-700 text-[9px] font-black rounded-xl uppercase shadow-sm">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN DE LA UBICACIÓN - CON TU IFRAME ESPECÍFICO */}
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">02. Ubicación Cartográfica</h4>
            <div className="rounded-[3rem] overflow-hidden h-[450px] border-4 border-slate-100 shadow-xl bg-slate-50">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d969.7599175564308!2d-88.9440958!3d13.533157!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f7cad5a1aff1c8b%3A0x31a45d128240259d!2sRancho%20Jardines%20de%20Primavera!5e0!3m2!1ses-419!2ssv!4v1768938273710!5m2!1ses-419!2ssv" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa de ${sitio.nombre}`}
              ></iframe>
            </div>
          </div>
        </div>

        {/* COLUMNA LATERAL: COSTOS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 shadow-sm sticky top-10">
            <h4 className="font-black uppercase text-[10px] tracking-widest text-blue-600 mb-8 border-b border-blue-100 pb-2">
              Costos de Entrada
            </h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 text-sm uppercase">Adultos</span>
                <span className="text-3xl font-black text-slate-900 italic">{sitio.precios?.adulto || '$0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 text-sm uppercase">Niños</span>
                <span className="text-3xl font-black text-slate-900 italic">{sitio.precios?.nino || '$0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 text-sm uppercase">3ra Edad</span>
                <span className="text-3xl font-black text-slate-900 italic">{sitio.precios?.mayor || '$0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}