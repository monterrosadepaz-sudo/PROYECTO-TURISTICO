const TarjetaDestino = ({ titulo, categoria, precios, etiquetas, imagen }) => {
  const formatearPrecio = (valor) => {
    return valor === "Gratis" ? valor : `$${valor}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
      <div className="h-64 bg-slate-200 overflow-hidden relative">
        <img src={imagen} alt={titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase shadow-lg">
          {categoria}
        </span>
      </div>
      
      <div className="p-8 text-left">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">{titulo}</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-8 border-y border-slate-50 py-4">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Adultos</p>
            <p className="font-bold text-slate-700">{formatearPrecio(precios?.adultos)}</p>
          </div>
          <div className="text-center border-x border-slate-50">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Niños</p>
            <p className="font-bold text-slate-700">{formatearPrecio(precios?.niños)}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">3ra Edad</p>
            <p className="font-bold text-slate-700">{formatearPrecio(precios?.terceraEdad)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {etiquetas?.map((tag, index) => (
            <span key={index} className="text-[9px] font-black text-lime-600 border border-lime-400 px-3 py-1 rounded-full uppercase bg-lime-50/50">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarjetaDestino;