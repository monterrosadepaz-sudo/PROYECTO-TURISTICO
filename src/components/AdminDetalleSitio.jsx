import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapaFormulario from './MapaFormulario';

// Diccionario para que los títulos de precios se vean bonitos aunque vengan en mayúsculas
const etiquetasPrecios = {
    adultos: "Adultos",
    ninos: "Niños",
    terceraEdad: "Tercera Edad",
    ADULTOS: "Adultos",
    NINOS: "Niños",
    TERCERAEDAD: "Tercera Edad"
};

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function AdminDetalleSitio() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sitio, setSitio] = useState(null);
  const [cargando, setCargando] = useState(true);

  // --- PARSEO SEGURO ---
  const safeParse = (data) => {
    if (!data || data === "null") return null;
    if (typeof data === 'object') return data;
    try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') return JSON.parse(parsed);
        return parsed;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const cargarDetalleAdmin = async () => {
      try {
        const url = `http://100.123.6.123:8000/api/admin/publicaciones/${id}`;
        
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            
            const detalles = safeParse(data.detalles) || {};
            const politicas = safeParse(data.politicas) || {};
            const horarios = safeParse(data.horarios) || {};
            const clasificacion = safeParse(data.clasificacion) || ["TURISMO"];

            setSitio({
                ...data,
                detalles,
                politicas,
                horarios,
                clasificacion,
                precios: detalles.tarifas_desglosadas || { adultos: data.costo_entrada },
                ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) }
            });
        } else {
            alert("No se pudo cargar el sitio. Verifica que el endpoint de Admin exista.");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDetalleAdmin();
  }, [id]);

  const manejarAccion = (accion) => {
      if(accion === 'eliminar') {
          if(window.confirm("⚠️ PELIGRO: ¿Estás seguro de ELIMINAR este sitio permanentemente?")) {
              alert("Lógica de eliminación pendiente de conectar con Julio.");
          }
      } else if (accion === 'desactivar') {
          if(window.confirm("¿Deseas DESACTIVAR este sitio? Dejará de ser visible para los turistas.")) {
              alert("Lógica de desactivación pendiente de conectar con Julio.");
          }
      }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-blue-800 uppercase tracking-widest italic">Cargando vista de administrador...</div>;
  if (!sitio) return <div className="min-h-screen flex items-center justify-center font-black text-red-500 uppercase tracking-widest italic">No se encontró información del sitio.</div>;

  return (
    <div className="min-h-screen bg-slate-50 italic font-sans pb-20">
      
      {/* --- HERO SECTION (FOTO PORTADA) --- */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-slate-900">
        <img 
            src={`http://100.123.6.123:8000/storage/preformularios/${sitio.imagen}`} 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => e.target.src = 'https://via.placeholder.com/1920x600?text=Sin+Imagen'}
            alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        {/* CORRECCIÓN 1: Botón Volver al panel (ahora usa la ruta correcta) */}
       {/* CORRECCIÓN: Botón con z-[100] para evitar bloqueos y navigate(-1) para no perder el estado del panel */}
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-8 left-8 z-[100] cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
        >
            ← Volver al Panel
        </button>
        <div className="absolute bottom-0 left-0 w-full p-10 md:p-20 text-white">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                {Array.isArray(sitio.clasificacion) ? sitio.clasificacion[0] : sitio.clasificacion}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 leading-none">{sitio.nombre}</h1>
            
            {/* CORRECCIÓN 2: Ubicación completa con Departamento, Municipio y Distrito */}
            <p className="text-sm md:text-xl font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                📍 {sitio.departamento} | {sitio.municipio} | {sitio.distrito || 'S/D'}
            </p>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (INFO) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Descripción */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Sobre este destino</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {sitio.descripcion}
                </p>
            </div>

            {/* Mapa */}
            <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden h-96">
                 {/* El pointer-events-none bloquea interacciones para que el buscador no se use en vista admin */}
                 <div className="w-full h-full rounded-[2.5rem] overflow-hidden opacity-90 pointer-events-none">
                    <MapaFormulario ubicacionActual={sitio.ubicacion} />
                 </div>
            </div>

            {/* CORRECCIÓN 3: Cambio de Título en Políticas */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Políticas de Entrada</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(sitio.politicas).map(([key, value]) => (
                        value === true && (
                            <div key={key} className="flex items-center gap-3 text-slate-500">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA (SIDEBAR ADMIN) */}
        <div className="space-y-6">
            
            {/* Tarjeta de Estado Admin */}
            <div className="bg-slate-800 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🛡️</div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-slate-400">Estado Actual</h3>
                <p className="text-4xl font-black uppercase tracking-tighter text-green-400 mb-6">{sitio.estado}</p>
                
                <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] text-slate-400 uppercase font-black">ID Publicación</p>
                        <p className="text-[9px] font-mono break-all text-white">{sitio.idpublicacion}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] text-slate-400 uppercase font-black">Aprobado Por</p>
                        <p className="text-[9px] font-mono break-all text-white">{sitio.aprobado_por}</p>
                    </div>
                </div>
            </div>

            {/* CORRECCIÓN 4: Agregada la sección de Horarios */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Horarios de Atención</h3>
                <div className="space-y-3">
                    {diasSemana.map((dia) => {
                        const valorHorario = sitio.horarios[dia];
                        const mostrarTexto = valorHorario ? valorHorario : 'Cerrado';
                        const estaAbierto = !!valorHorario;

                        return (
                            <div key={dia} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">{dia}</span>
                                <span className={`text-xs font-bold uppercase tracking-widest ${estaAbierto ? 'text-slate-700' : 'text-slate-300'}`}>
                                    {mostrarTexto}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Precios con etiquetas amigables */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-blue-800 text-xs font-black uppercase tracking-[0.2em] mb-6">Tarifas</h3>
                <div className="space-y-3">
                    {Object.entries(sitio.precios).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center border-b border-slate-50 pb-2">
                            {/* Uso del diccionario para mostrar 'Niños' en vez de 'NINOS' */}
                            <span className="text-[10px] font-black uppercase text-slate-400">{etiquetasPrecios[key] || key}</span>
                            <span className="text-lg font-black text-slate-700">${parseFloat(val).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ZONA DE ACCIONES */}
            <div className="bg-red-50 p-8 rounded-[3rem] border-2 border-red-100 text-center">
                <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-6">Zona de Gestión</h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => manejarAccion('desactivar')}
                        className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                        Ocultar / Desactivar
                    </button>
                    <button 
                        onClick={() => manejarAccion('eliminar')}
                        className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200"
                    >
                        Eliminar Sitio
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}