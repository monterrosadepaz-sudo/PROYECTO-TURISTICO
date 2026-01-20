import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TarjetaDestino from './TarjetaDestino';

const VistaDepartamento = ({ onSeleccionarSitio }) => {
  const { nombreDepto } = useParams();
  const navigate = useNavigate();
  const [filtrosActivos, setFiltrosActivos] = useState(['TODOS']);

  // RESTAURADOS: Tus 4 ejemplos originales
  const destinos = [
    {
      nombre: "Jardines de Primavera",
      categoria: "BALNEARIO",
      ubicacion: "Santiago Nonualco, La Paz",
      descripcion: "Un rincón natural refrescante en el corazón de La Paz con piscinas de agua de vertiente.",
      precios: { adulto: '3.00', nino: '2.00', mayor: '3.00' },
      permitidos: ["Traer comida", "Gaseosas / Agua", "Mascotas", "Mesas y sillas", "Hamacas", "Parrillas / Cocinas"],
      prohibidos: ['Bebidas Alcohólicas', 'Armas de fuego', 'Cigarrillos'],
      imagen: "/src/assets/jardines.jpg"
    },
    {
      nombre: "Playa Costa del Sol",
      categoria: "PLAYA",
      ubicacion: "San Luis La Herradura",
      descripcion: "La playa más extensa de El Salvador.",
      precios: { adulto: 'Gratis', nino: 'Gratis', mayor: 'Gratis' },
      permitidos: ["Mascotas", "Traer comida", "Hamacas"],
      imagen: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80"
    },
    {
      nombre: "Parque Recreativo Ichanmichen",
      categoria: "PARQUE",
      ubicacion: "Zacatecoluca",
      descripcion: "Nacimientos de agua cristalina y exuberante vegetación.",
      precios: { adulto: '1.50', nino: '0.75', mayor: 'Gratis' },
      permitidos: ["Traer comida", "Gaseosas / Agua", "Mascotas"],
      imagen: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
    },
    {
      nombre: "San Juan Tepezontes",
      categoria: "PUEBLO",
      ubicacion: "La Paz",
      descripcion: "Un pueblo pintoresco con tradiciones culturales.",
      precios: { adulto: 'Gratis', nino: 'Gratis', mayor: 'Gratis' },
      permitidos: ["Mascotas", "Cámaras", "Caminar"],
      imagen: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const manejarSeleccion = (sitio) => {
    onSeleccionarSitio(sitio);
    navigate("/destino");
  };

  const toggleFiltro = (cat) => {
    if (cat === 'TODOS') { setFiltrosActivos(['TODOS']); return; }
    setFiltrosActivos((prev) => {
      const sinTodos = prev.filter(f => f !== 'TODOS');
      if (prev.includes(cat)) {
        const nuevo = sinTodos.filter(f => f !== cat);
        return nuevo.length === 0 ? ['TODOS'] : nuevo;
      } else { return [...sinTodos, cat]; }
    });
  };

  const destinosFiltrados = filtrosActivos.includes('TODOS')
    ? destinos
    : destinos.filter(sitio => filtrosActivos.some(f => {
        const catLimpia = f.endsWith('S') ? f.slice(0, -1) : f;
        return sitio.categoria === catLimpia;
      }));

  const categorias = ['TODOS', 'PLAYAS', 'PARQUES', 'BALNEARIOS', 'PUEBLOS'];

  return (
    <div className="p-10 bg-white min-h-screen animate-in fade-in duration-500">
      {/* CORRECCIÓN: navigate(-1) para volver correctamente */}
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-3 text-slate-400 font-bold mb-12 uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all">
          ←
        </div>
        Volver
      </button>

      <header className="mb-16 text-left">
        <p className="text-blue-600 font-bold uppercase text-sm tracking-widest mb-2">Explorando</p>
        <h1 className="text-[120px] md:text-[140px] font-black leading-none text-slate-900 uppercase tracking-tighter">
          {nombreDepto || "LA PAZ"}
        </h1>
        <div className="h-3 w-40 bg-blue-600 mt-6 rounded-full"></div>
      </header>

      <div className="flex flex-wrap gap-3 mb-16">
        {categorias.map((cat) => (
          <button 
            key={cat}
            onClick={() => toggleFiltro(cat)}
            className={`px-8 py-3 rounded-full font-bold uppercase text-xs transition-all ${
              filtrosActivos.includes(cat) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {destinosFiltrados.map((sitio, index) => (
          <div key={index} onClick={() => manejarSeleccion(sitio)} className="cursor-pointer transform hover:scale-[1.02] transition-transform">
            <TarjetaDestino 
              titulo={sitio.nombre}
              categoria={sitio.categoria}
              precios={{adultos: sitio.precios.adulto, niños: sitio.precios.nino, terceraEdad: sitio.precios.mayor}}
              etiquetas={sitio.permitidos}
              imagen={sitio.imagen}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaDepartamento;