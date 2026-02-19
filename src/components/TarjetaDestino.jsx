import React from 'react';

const TarjetaDestino = ({ titulo, categoria, etiquetas, imagen }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group italic">
      
      {/* IMAGEN Y CABECERA (DISTRITO) */}
      <div className="h-64 bg-slate-200 overflow-hidden relative">
        <img 
          src={imagen || "/placeholder-turismo.jpg"} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          onError={(e) => { 
            e.target.src = "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80"; 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Mostramos el DISTRITO en la etiqueta superior azul */}
        <span className="absolute top-6 left-6 bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-xl tracking-widest z-10">
          {categoria}
        </span>
      </div>
      
      <div className="p-8 text-left space-y-4">
        {/* TÍTULO DEL DESTINO */}
        <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tighter uppercase group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>
        
        <hr className="border-slate-50" />

        {/* ETIQUETAS (Aquí aparece el MUNICIPIO, ej: La Paz Este) */}
        <div className="flex flex-wrap gap-2 pt-2">
          {etiquetas?.map((tag, index) => (
            <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
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