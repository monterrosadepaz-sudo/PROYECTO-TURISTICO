import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MisPropuestas() {
  const navigate = useNavigate();
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Recuperamos la sesión para obtener el ID del usuario
  const sesion = JSON.parse(localStorage.getItem('usuarioLogueado'));

  useEffect(() => {
    const cargarPropuestas = async () => {
      try {
        // Endpoint basado en la estructura de Julio
        const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${sesion.idusuario}/preformularios`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setPropuestas(datos);
        }
      } catch (error) {
        console.error("Error al cargar propuestas:", error);
      } finally {
        setCargando(false);
      }
    };

    if (sesion?.idusuario) cargarPropuestas();
  }, [sesion?.idusuario]);

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest">
      Cargando tus propuestas...
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 italic text-left">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Encabezado Estilo ITCA */}
        <div className="flex justify-between items-end border-b-4 border-blue-800 pb-6">
          <div>
            <h2 className="text-4xl font-black text-blue-800 uppercase tracking-tighter leading-none">Mis Propuestas</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.2em]">Gestión de destinos turísticos enviados</p>
          </div>
          <button 
            onClick={() => navigate("/publicar")}
            className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            + Nueva Propuesta
          </button>
        </div>

        {propuestas.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Aún no has enviado ninguna propuesta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propuestas.map((p) => (
              <div key={p.idprefomulario} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300">
                
                {/* Contenedor de Imagen y Estado */}
                <div className="h-48 relative overflow-hidden bg-slate-200">
                  <img 
                    src={`http://100.123.6.123:8000/storage/${p.imagen}`} 
                    alt={p.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                  />
                  <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border-2 border-white ${
                    p.estado === 'pendiente' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {p.estado}
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-8 flex-grow space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-slate-800 uppercase leading-tight mb-1">{p.nombre}</h4>
                    <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">{p.departamento}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.clasificacion.map((cat, i) => (
                      <span key={i} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[8px] font-bold uppercase">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase">Fecha de Envío</p>
                      <p className="text-slate-500 text-[10px] font-bold">{new Date(p.fecha_creacion).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-300 uppercase">Entrada</p>
                      <p className="text-blue-700 font-black text-sm italic">${p.costo_entrada.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}