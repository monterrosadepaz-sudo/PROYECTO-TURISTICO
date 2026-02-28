import React from 'react';
import { API_URL } from '../config'; 

const TarjetaDestino = ({ titulo, categoria, etiquetas, imagen }) => {
  
  // 🔥 ENRUTADOR INTELIGENTE INTERNO 🔥
  const obtenerRutaReal = (nombreImg) => {
    if (!nombreImg) return "/default.jpg"; // Volvemos a tu imagen por defecto oficial
    if (nombreImg.startsWith('http')) return nombreImg;
    
    // Si el nombre tiene "preformulario", lo buscamos en esa carpeta
    if (nombreImg.includes('preformulario')) {
        return `${API_URL}/storage/preformularios/${nombreImg}`;
    }
    
    // De lo contrario, asumimos que ya es una publicación final
    return `${API_URL}/storage/publicaciones/${nombreImg}`;
  };

  const rutaFinal = obtenerRutaReal(imagen);

  return (
    // 🔥 CONTROL DE ALTURA UNIFORME: h-full y flex-col para que todas midan lo mismo
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group italic flex flex-col h-full">
      
      {/* IMAGEN Y CABECERA (DISTRITO) */}
      <div className="h-56 sm:h-64 md:h-72 shrink-0 bg-slate-100 overflow-hidden relative">
        <img 
          src={rutaFinal} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          onError={(e) => { 
            // Si la imagen real falla, mostramos tu ícono oficial de default
            e.target.onerror = null; 
            e.target.src = "/default.jpg"; 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Etiqueta del Distrito */}
        <span className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-blue-600 text-white text-[8px] sm:text-[9px] font-black px-4 py-2 rounded-full uppercase shadow-xl tracking-widest z-10">
          {categoria}
        </span>
      </div>
      
      {/* CONTENIDO (flex-grow empuja las etiquetas hacia abajo si el título es corto) */}
      <div className="p-6 sm:p-8 text-left flex flex-col flex-grow space-y-4">
        
        {/* TÍTULO DEL DESTINO (line-clamp-2 asegura que si el texto es muy largo, se corte con "..." a las 2 líneas) */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight tracking-tighter uppercase group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
          {titulo}
        </h3>
        
        <hr className="border-slate-100" />

        {/* ETIQUETAS (Municipio) */}
        <div className="flex flex-wrap gap-2 pt-2 shrink-0">
          {etiquetas?.map((tag, index) => (
            <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl w-max">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shrink-0"></span>
              <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[150px]">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarjetaDestino;