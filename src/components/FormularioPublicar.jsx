import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importamos el nuevo componente del mapa
import MapaFormulario from './MapaFormulario'; 

export default function FormularioPublicar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreSitio: '',
    departamento: '',
    ubicacion: null, 
    categoria: '', 
    descripcion: '',
    imagenUrl: '',
    precios: { adultos: '', ninos: '', terceraEdad: '' },
    nombreColaborador: '',
    correoColaborador: '',
    telefonoColaborador: '', // <--- Estado para el nuevo campo
    horarios: {
      lunes: { abierto: false, inicio: '08:00', fin: '17:00' },
      martes: { abierto: false, inicio: '08:00', fin: '17:00' },
      miercoles: { abierto: false, inicio: '08:00', fin: '17:00' },
      jueves: { abierto: false, inicio: '08:00', fin: '17:00' },
      viernes: { abierto: false, inicio: '08:00', fin: '17:00' },
      sabado: { abierto: false, inicio: '08:00', fin: '17:00' },
      domingo: { abierto: false, inicio: '08:00', fin: '17:00' },
    },
    avisoFestivos: false,
    permisos: {
      comida: false, bebidasGaseosas: false, bebidasAlcoholicas: false,
      mascotas: false, mesasSillas: false, hamacas: false,
      parrillasCocinas: false, armasFuego: false
    }
  });

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const manejarCheck = (e) => setFormData({ ...formData, permisos: { ...formData.permisos, [e.target.name]: e.target.checked } });
  const manejarPrecio = (e) => setFormData({ ...formData, precios: { ...formData.precios, [e.target.name]: e.target.value } });
  const manejarHorario = (dia, campo, valor) => setFormData({ ...formData, horarios: { ...formData.horarios[dia], [campo]: valor } });

  // 2. Función para recibir la ubicación desde el componente MapaFormulario
  const setUbicacion = (coords) => {
    setFormData({ ...formData, ubicacion: coords });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!formData.ubicacion) {
      alert("Por favor, selecciona una ubicación en el mapa.");
      return;
    }
    
    // Validación de teléfono (exactamente 8 dígitos)
    if (formData.telefonoColaborador.length !== 8) {
        alert("Por favor, ingrese un número de teléfono válido (8 dígitos).");
        return;
    }

    console.log("Datos a enviar:", formData);
    alert(`Propuesta enviada con éxito. Nos pondremos en contacto al +503 ${formData.telefonoColaborador}`);
    navigate("/");
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-left text-slate-800">
        
        <div className="bg-blue-800 p-10 text-white relative">
          <h3 className="text-3xl font-black tracking-tight text-white uppercase italic">Publicar Nuevo Destino</h3>
          <p className="text-blue-100 text-sm mt-1 uppercase font-bold">Completa los datos para proponer un nuevo sitio turístico</p>
          <button onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all text-white">✕</button>
        </div>

        <form onSubmit={manejarEnvio} className="p-10 space-y-10">
          
          {/* 01. DATOS GENERALES */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">01. Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">Nombre del Destino</label>
                <input name="nombreSitio" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none text-slate-700" placeholder="Ej: Cascada de la Flor" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">Departamento</label>
                <select name="departamento" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700">
                  <option value="">Selecciona uno...</option>
                  {['Ahuachapán', 'Santa Ana', 'Sonsonate', 'La Libertad', 'Chalatenango', 'San Salvador', 'Cuscatlán', 'La Paz', 'Cabañas', 'San Vicente', 'Usulután', 'San Miguel', 'Morazán', 'La Unión'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 02. UBICACIÓN CARTOGRÁFICA */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">02. Ubicación Cartográfica</h4>
            <div className="bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100 space-y-6">
              <div className="bg-blue-800 p-5 rounded-2xl text-white shadow-lg text-xs leading-relaxed font-semibold">
                  Instrucciones: Haz clic en el mapa para marcar el punto exacto donde se encuentra el lugar turístico.
              </div>
              <div className="rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl h-80 bg-white">
                <MapaFormulario setUbicacion={setUbicacion} />
              </div>
              {formData.ubicacion && (
                <div className="p-4 bg-green-100 border border-green-200 rounded-2xl text-green-800 text-xs font-bold animate-pulse text-center">
                  📍 Ubicación marcada: {formData.ubicacion.lat.toFixed(6)}, {formData.ubicacion.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* 03. CLASIFICACIÓN Y POLÍTICAS */}
          <div className="space-y-8">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">03. Clasificación y Políticas</h4>
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-800">Tipo de lugar turístico</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Playa', 'Montaña', 'Pueblo', 'Ciudad', 'Balneario', 'Parque'].map(cat => (
                  <label key={cat} className={`flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold text-xs ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-100 text-slate-500 bg-slate-50 hover:border-slate-300'}`}>
                    <input type="radio" name="categoria" value={cat} onChange={manejarCambio} className="hidden" required />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-800">Políticas de ingreso permitidas</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { n: 'comida', l: 'Traer comida' },
                  { n: 'bebidasGaseosas', l: 'Gaseosas / Agua' },
                  { n: 'bebidasAlcoholicas', l: 'Alcohol' },
                  { n: 'mascotas', l: 'Mascotas' },
                  { n: 'mesasSillas', l: 'Mesas y sillas' },
                  { n: 'hamacas', l: 'Hamacas' },
                  { n: 'parrillasCocinas', l: 'Parrillas / Cocinas' },
                  { n: 'armasFuego', l: 'Armas de fuego' }
                ].map(item => (
                  <label key={item.n} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white transition-all">
                    <input type="checkbox" name={item.n} checked={formData.permisos[item.n]} onChange={manejarCheck} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700">{item.l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 04. HORARIOS Y COSTOS */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">04. Horarios y Costos de Entrada</h4>
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(formData.horarios).map((dia) => (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <input type="checkbox" checked={formData.horarios[dia].abierto} onChange={(e) => manejarHorario(dia, 'abierto', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm font-bold text-slate-700 capitalize">{dia}</span>
                    </div>
                    {formData.horarios[dia].abierto ? (
                      <div className="flex items-center gap-2 animate-in fade-in duration-300">
                        <input type="time" value={formData.horarios[dia].inicio} onChange={(e) => manejarHorario(dia, 'inicio', e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500" />
                        <span className="text-slate-400 font-bold px-1 text-xs">a</span>
                        <input type="time" value={formData.horarios[dia].fin} onChange={(e) => manejarHorario(dia, 'fin', e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500" />
                      </div>
                    ) : <span className="text-xs font-bold text-slate-400 italic">Cerrado</span>}
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <label className="text-sm font-bold text-slate-800 ml-1">Costo de Entrada</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['adultos', 'ninos', 'terceraEdad'].map(tipo => (
                     <div key={tipo} className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{tipo === 'ninos' ? 'Niños' : tipo === 'terceraEdad' ? 'Tercera Edad' : 'Adultos'}</span>
                        <input name={tipo} onChange={manejarPrecio} className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none text-slate-700 font-bold bg-white" placeholder="$0.00" />
                     </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 05. DESCRIPCIÓN E IMAGEN */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">05. Descripción del lugar</h4>
              <textarea name="descripcion" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none h-32 text-slate-700" placeholder="Actividades, clima, servicios disponibles..." />
            </div>
            <div className="space-y-4">
              <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">06. Imagen referencial</h4>
              <input name="imagenUrl" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none text-slate-700" placeholder="Enlace de la imagen (URL): https://..." />
            </div>
          </div>

          {/* 07. IDENTIFICACIÓN (CON TELÉFONO +503) */}
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <h4 className="text-blue-700 text-xs font-black uppercase tracking-[0.2em]">07. Identificación del Colaborador</h4>
            
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-start gap-3 text-left">
              <p className="text-[10px] text-green-800 font-semibold leading-relaxed">Seguridad de datos: Su información personal se utiliza exclusivamente para validar la propuesta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="nombreColaborador" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-none" placeholder="Nombre Completo" />
              <input name="correoColaborador" type="email" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-none" placeholder="correo@ejemplo.com" />
              
              {/* Campo de Teléfono con Prefijo Fijo */}
              <div className="flex shadow-sm rounded-2xl overflow-hidden border border-slate-200 focus-within:border-blue-500 transition-all md:col-span-2">
                <span className="bg-slate-100 px-5 py-4 text-slate-500 font-bold border-r border-slate-200 flex items-center justify-center">
                  +503
                </span>
                <input 
                  name="telefonoColaborador"
                  type="tel"
                  maxLength="8"
                  onChange={(e) => {
                    // Solo permite números
                    const valor = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, telefonoColaborador: valor });
                  }}
                  value={formData.telefonoColaborador}
                  required 
                  className="flex-1 px-5 py-4 bg-white text-slate-700 outline-none font-bold tracking-[0.3em]" 
                  placeholder="00000000" 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-[1.5rem] transition-all text-sm uppercase tracking-widest">CANCELAR</button>
            <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 transform active:scale-95 transition-all text-sm uppercase tracking-widest">Enviar Propuesta</button>
          </div>
        </form>
      </div>
    </div>
  );
}